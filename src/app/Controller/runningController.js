const jwtMiddleware = require("../../../config/jwtMiddleware");
const runningProvider = require("../Provider/runningProvider");
const userProvider = require("../Provider/userProvider");
const messageProvider = require("../Provider/messageProvider");
const postingProvider = require("../Provider/postingProvider");
const runningService = require("../Service/runningService");
const runningDao = require("../Dao/runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const { emit } = require("nodemon");
const { pool } = require("../../../config/database");

//푸시알림
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
let serAccount = require("../../../config/runnerbe-f1986-firebase-adminsdk-frfin-c125099a1f.json");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serAccount),
  });
}
/**
 * API No. 18
 * API Name : 참여신청하기 API
 * [POST] /running/request/:postId
 */
exports.sendRequest = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : postId, userId
   */
  const postId = req.params.postId;
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  // 이미 참여 신청을 했었는지 확인
  const checkAlreadyapplyNotD = await messageProvider.checkAlreadyapplyNotD(
    userId,
    postId
  );
  if (checkAlreadyapplyNotD.length != 0) {
    return res.send(response(baseResponse.ALREADY_APPLY));
  }
  //반장 userId

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    // const checkUserAuth = await userProvider.checkUserAuth(userId);
    // if (checkUserAuth.length === 0) {
    //   return res.send(response(baseResponse.USER_NON_AUTH));
    // }
    const Response = await runningService.sendRequest(postId, userId);
    //푸쉬알림

    return res.send(response(baseResponse.SUCCESS));
  }
};

/**
 * API No. 19
 * API Name : 참여신청 처리하기 API
 * [PATCH] /running/request/:postId/handling/:applicantId/:whetherAccept
 */
exports.handleRequest = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : postId, applicantId, whetherAccept, userId
   */
  const postId = req.params.postId;
  const applicantId = req.params.applicantId;
  const whetherAccept = req.params.whetherAccept;
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));
  if (!applicantId) return res.send(response(baseResponse.APPLICANTID_EMPTY));
  if (!whetherAccept) return res.send(response(baseResponse.WACCEPT_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));
  if (isNaN(applicantId) === true)
    return res.send(response(baseResponse.APPLICANTID_NOTNUM));

  // 유효성 검사
  const whetherAcceptList = ["Y", "D"];
  if (!whetherAcceptList.includes(whetherAccept))
    return res.send(response(baseResponse.WACCEPT_IS_NOT_VALID));

  // 반장인지 확인
  //repUserId 뽑아내기
  const repUserId = await messageProvider.getRepUserId(postId);
  // 비교
  if (userId != repUserId)
    return res.send(response(baseResponse.USERID_NOT_WRITER));

  //applicantId로 RP에 있는지, 그리고 whetherAccept가 N(대기)인지 확인
  const checkApplicant = await runningProvider.checkApplicant(
    applicantId,
    postId
  );
  if (checkApplicant.length === 0)
    return res.send(response(baseResponse.USER_CANNOT_REQUEST));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    // const checkUserAuth = await userProvider.checkUserAuth(userId);
    // if (checkUserAuth.length === 0) {
    //   return res.send(response(baseResponse.USER_NON_AUTH));
    // }
    const Response = await runningService.handleRequest(
      postId,
      applicantId,
      whetherAccept
    );

    return res.send(response(baseResponse.SUCCESS));
  }
};

/**
 * API No. 26
 * API Name : 푸쉬알림 테스트용 API
 * [POST] /push-alarm-test
 */
exports.pushAlarm = async function (req, res) {
  const userIdFromJWT = req.verifiedToken.userId;
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const getDeviceTokenRows = await runningDao.getDeviceToken(
      connection,
      userIdFromJWT
    );
    if (getDeviceTokenRows.length === 0)
      return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

    //commit
    await connection.commit();

    //title, body 설정
    const titleInstance = "테스트 푸쉬알림";
    const content =
      getDeviceTokenRows[0].nickName + `님, 테스트 푸쉬알림입니다.`;

    let message = {
      notification: {
        title: titleInstance,
        body: content,
      },
      data: {
        title: titleInstance,
        body: content,
      },
      token: getDeviceTokenRows[0].deviceToken,
    };

    //메시지 저장  repUserId, titleInstance, content
    await runningDao.savePushalarm(
      connection,
      userIdFromJWT,
      titleInstance,
      content
    );

    admin
      .messaging()
      .send(message)
      .then(function (id) {
        console.log("Successfully sent message: : ", id);
        return res.send(response(baseResponse.SUCCESS));
      })
      .catch(function (err) {
        console.log("Error Sending message!!! : ", err);
        return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
      });
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - push-alarm-test Controller error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 27
 * API Name : 출석하기 API
 * [PATCH] /runnings/:postId/attend
 */
exports.attend = async function (req, res) {
  /**
   * Header : jwt
   * Body : userId와 whetherAttend의 Array
   */
  const userIdFromJWT = req.verifiedToken.userId;
  const postId = req.params.postId;

  const userIdBody = req.body.userIdList;
  const userIdArray = userIdBody.split(",");
  const IntUserIdArray = userIdArray.map((userId) => parseInt(userId));

  const whetherAttendBody = req.body.whetherAttendList;
  const whetherAttendArray = whetherAttendBody.split(",");

  //jwt가 작성자의 것인지 확인
  const checkWriter = await postingProvider.checkWriter(postId, userIdFromJWT);
  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  }

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));
  if (!userIdBody) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!whetherAttendBody)
    return res.send(response(baseResponse.WHETHER_ATTEND_EMPTY));

  // 숫자 확인
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  //개수 불일치
  if (IntUserIdArray.length != whetherAttendArray.length) {
    return res.send(response(baseResponse.USERID_AND_WHETHER_ATTEND_NOT_MATCH));
  }

  //다수의 유저 출석 관리하기
  for (let i = 0; i < IntUserIdArray.length; i++) {
    const userId = IntUserIdArray[i];
    const whetherAttend = whetherAttendArray[i];

    //유효성 검사
    const whetherAttendList = ["Y", "N"];
    if (!whetherAttendList.includes(whetherAttend))
      return res.send(response(baseResponse.WHETHER_ATTEND_IS_NOT_VALID));

    // 해당 유저가 러닝에 속하는지 확인
    const check = await messageProvider.checkAlreadyapplyNotD(userId, postId);
    if (check.length === 0) {
      return res.send(response(baseResponse.USER_NOT_BELONG_RUNNING));
    }

    //출석 관리 실시
    await runningService.attend(postId, userId, whetherAttend);
  }

  return res.send(response(baseResponse.SUCCESS));
};

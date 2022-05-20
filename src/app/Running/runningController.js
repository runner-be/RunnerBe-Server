const jwtMiddleware = require("../../../config/jwtMiddleware");
const runningProvider = require("../../app/Running/runningProvider");
const userProvider = require("../../app/User/userProvider");
const messageProvider = require("../../app/Message/messageProvider");
const runningService = require("../../app/Running/runningService");
const runningDao = require("./runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const { emit } = require("nodemon");
const { pool } = require("../../../config/database");

//푸시알림
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
let serAccount = require("../../../config/runnerbe-f1986-firebase-adminsdk-frfin-c125099a1f.json");
admin.initializeApp({
  credential: admin.credential.cert(serAccount),
});

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
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
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
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
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
 * API Name : 푸쉬알림 API
 * [GET] /pushAlarm
 */
exports.pushAlarm = async function (req, res) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getDeviceTokenRows = await runningDao.getDeviceToken(connection, 125);
  if (getDeviceTokenRows.length === 0)
    return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

  let message = {
    notification: {
      title: "테스트 제목",
      body: getDeviceTokenRows[0].nickName + "님 러너비 앱을 확인해보세요!",
    },
    data: {
      title: "테스트 제목",
      body: getDeviceTokenRows[0].nickName + "님 러너비 앱을 확인해보세요!",
    },
    token: getDeviceTokenRows[0].deviceToken,
  };

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
  connection.release();
};

/**
 * API No. 27
 * API Name : 출석하기 API
 * [PATCH] /runnings/:postId/attendees/:userId
 */
exports.attend = async function (req, res) {
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

  // 해당 유저가 러닝에 속하는지 확인
  const checkAlreadyapplyNotD = await messageProvider.checkAlreadyapplyNotD(
    userId,
    postId
  );
  if (checkAlreadyapplyNotD.length === 0) {
    return res.send(response(baseResponse.USER_NOT_BELONG_RUNNING));
  }

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const Response = await runningService.attend(postId, userId);

    return res.send(response(baseResponse.SUCCESS));
  }
};

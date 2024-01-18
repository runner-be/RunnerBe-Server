const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const postingProvider = require("../Provider/postingProvider");
const postingDao = require("../Dao/postingDao");
const messageDao = require("../Dao/messageDao");
const runningDao = require("../Dao/runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const schedule = require("node-schedule");
const admin = require("../utils/fcm");
// 게시글 생성
exports.createPosting = async function (
  userId,
  title,
  gatheringTime,
  runningTime,
  gatherLongitude,
  gatherLatitude,
  locationInfo,
  runningTag,
  ageMin,
  ageMax,
  peopleNum,
  contents,
  runnerGender,
  paceGrade,
  afterParty
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    //유효한 user인지 확인
    const userIdRows = await postingProvider.userIdCheck(userId);
    if (userIdRows.length === 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_USERID);

    const insertPostingParams = [
      userId,
      title,
      gatheringTime,
      runningTime,
      gatherLongitude,
      gatherLatitude,
      locationInfo,
      runningTag,
      ageMin,
      ageMax,
      peopleNum,
      contents,
      runnerGender,
      paceGrade,
      afterParty,
    ];
    // 게시글 생성
    const createPostingResult = await postingDao.createPosting(
      connection,
      insertPostingParams
    );

    const postId = createPostingResult[0].insertId; //위 쿼리에서 A.I로 생성된 postId
    const createRunningParams = [userId, postId];

    //러닝 모임 생성
    const createRunning = await postingDao.createRunning(
      connection,
      createRunningParams
    );

    //방장 모임 인원에 추가
    const insertRunningId = createRunning[0].insertId;
    const insertRunningPeopleParams = [insertRunningId, userId];
    await postingDao.createRunningPeople(connection, insertRunningPeopleParams);

    // 대화방 생성
    const createRoom = await messageDao.createRoom(connection, postId);

    // 방장 대화방에 추가
    const roomId = createRoom[0].insertId;
    const insertUserPerRoomParams = [roomId, userId];
    await messageDao.insertUserPerRoom(connection, insertUserPerRoomParams);

    // 러닝 모임 시간에 맞춰 출석 관리에 대한 푸시 알림 전송을 위한 schedule 등록
    // 1. UTC 기준 Date Object로 변환
    const KSTDate = new Date(gatheringTime);
    const UTCDate = new Date(KSTDate - 9 * 60 * 60 * 1000);

    // 2. schedule 등록 - gatheringTime에 발송할 푸시알림 전송 예약
    const job = schedule.scheduleJob(UTCDate, async () => {
      // 게시글 제목 가져오기
      const title = await runningDao.getTitle(connection, postId);
      //수신 여부 확인
      const pushOn = await runningDao.checkPushOn(connection, userId);
      if (pushOn == "Y") {
        // push alarm 보낼 user의 device token
        const getDeviceTokenRows = await runningDao.getDeviceToken(
          connection,
          userId
        );
        if (getDeviceTokenRows.length === 0)
          return response(baseResponse.DEVICE_TOKEN_EMPTY);

        //title, body 설정
        const titleInstance = "RunnerBe : 출석 체크 요청";
        const content = `${getDeviceTokenRows[0].nickName} 님, 작성한 [${title}] 모임이 시작됐어요! 다들 모였다면 마이페이지에서 출석 체크를 진행해 볼까요?`;

        //푸쉬알림 메시지 설정
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

        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            logger.info(`successfully sent message : ${id}`);
            return 0;
          })
          .catch(function (err) {
            logger.error(`Error Sending message : ${err}, ${err.toString()}`);
            return response(baseResponse.ERROR_SEND_MESSAGE);
          });

        //메시지 저장
        await runningDao.savePushalarm(
          connection,
          userId,
          titleInstance,
          content
        );
      }
    });

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - createPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 수정
exports.patchPosting = async function (
  title,
  gatheringTime,
  runningTime,
  gatherLongitude,
  gatherLatitude,
  locationInfo,
  runningTag,
  ageMin,
  ageMax,
  peopleNum,
  contents,
  runnerGender,
  paceGrade,
  afterParty,
  postId
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();
    const patchPostingParams = [
      title,
      gatheringTime,
      runningTime,
      gatherLongitude,
      gatherLatitude,
      locationInfo,
      runningTag,
      ageMin,
      ageMax,
      peopleNum,
      contents,
      runnerGender,
      paceGrade,
      afterParty,
      postId,
    ];
    //게시글 있는지 확인
    const checkPostingResult = await postingProvider.checkPosting(postId);
    if (checkPostingResult.length === 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_POSTID);

    // 게시글 수정
    const patchPostingResult = await postingDao.patchPosting(
      connection,
      patchPostingParams
    );

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - patchPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 삭제
exports.dropPosting = async function (postId) {
  // 먼저 pool 생성해서 catch문에서 rollback하도록
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();
    //게시글 있는지 확인
    const checkPostingResult = await postingProvider.checkPosting(postId);
    if (checkPostingResult[0].length == 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_POSTID);

    // 게시글 삭제 - Posting, Running, RunningPeople
    const dropPostingResult = await postingDao.dropPosting(connection, postId);

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - dropPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 신고
exports.reportPosting = async function (userId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();
    //게시글 있는지 확인
    const checkPostingResult = await postingProvider.checkPosting(postId);
    if (checkPostingResult[0].length == 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_POSTID);

    // 게시글 신고
    const Params = [postId, userId];
    const reportResult = await postingDao.reportPosting(connection, Params);

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - reportPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

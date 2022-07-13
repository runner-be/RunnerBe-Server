const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const postingProvider = require("./postingProvider");
const postingDao = require("./postingDao");
const messageDao = require("../Message/messageDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const { connect } = require("http2");

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
  runnerGender
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

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

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - createPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
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
  postId
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();
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
    logger.error(`App - patchPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 게시글 삭제
exports.dropPosting = async function (postId) {
  // 먼저 pool 생성해서 catch문에서 rollback하도록
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();
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
    logger.error(`App - dropPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 게시글 신고
exports.reportPosting = async function (userId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();
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
    logger.error(`App - reportPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

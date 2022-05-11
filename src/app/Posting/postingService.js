const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const postingProvider = require("./postingProvider");
const postingDao = require("./postingDao");
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
  try {
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

    const connection = await pool.getConnection(async (conn) => conn);
    // 게시글 생성
    const createPostingResult = await postingDao.createPosting(
      connection,
      insertPostingParams
    );

    const insertId = createPostingResult[0].insertId; //위 쿼리에서 A.I로 생성된 postId
    const createRunningParams = [userId, insertId];

    //러닝 모임 생성
    const createRunning = await postingDao.createRunning(
      connection,
      createRunningParams
    );

    //방장 모임 인원에 추가
    const insertRunningId = createRunning[0].insertId;
    const insertRunningPeopleParams = [insertRunningId, userId];
    const createRunningPeople = await postingDao.createRunningPeople(
      connection,
      insertRunningPeopleParams
    );

    console.log(`추가된 게시글 : ${createPostingResult[0].insertId}`);
    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - createPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
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
  try {
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

    const connection = await pool.getConnection(async (conn) => conn);
    // 게시글 수정
    const patchPostingResult = await postingDao.patchPosting(
      connection,
      patchPostingParams
    );

    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - patchPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 게시글 삭제
exports.dropPosting = async function (postId) {
  // 먼저 pool 생성해서 catch문에서 rollback하도록
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //게시글 있는지 확인
    const checkPostingResult = await postingProvider.checkPosting(postId);
    if (checkPostingResult[0].length == 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_POSTID);

    connection.beginTransaction(); // 트랜잭션 적용 시작

    // 게시글 수정 - Posting, Running, RunningPeople
    const dropPostingResult = await postingDao.dropPosting(connection, postId);

    await connection.commit(); // 성공시 commit

    return response(baseResponse.SUCCESS);
  } catch (err) {
    await connection.rollback(); // 실패시 rollback
    logger.error(`App - dropPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 게시글 신고
exports.reportPosting = async function (userId, postId) {
  try {
    //게시글 있는지 확인
    const checkPostingResult = await postingProvider.checkPosting(postId);
    if (checkPostingResult[0].length == 0)
      return errResponse(baseResponse.POSTING_NOT_VALID_POSTID);

    const connection = await pool.getConnection(async (conn) => conn);
    // 게시글 신고
    const Params = [postId, userId];
    const reportResult = await postingDao.reportPosting(connection, Params);
    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - reportPosting Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

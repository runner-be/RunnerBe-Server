const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const postingDao = require("./postingDao");
const userDao = require("../../../src/app/User/userDao");

// userId 있는지 체크
exports.userIdCheck = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userIdCheckResult = await postingDao.userIdCheck(connection, userId);
  connection.release();

  return userIdCheckResult;
};

// 게시글 상세페이지
exports.getPosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getPostingResult = await postingDao.getPosting(connection, postId);
  const getRunnerResult = await postingDao.getRunner(connection, postId);
  connection.release();
  const postingInfo = getPostingResult[0];
  const runnerInfo = getRunnerResult[0];
  const getPostingFinalResult = { postingInfo, runnerInfo };
  return getPostingFinalResult;
};

// 게시글 상세페이지 - 작성자 view
exports.getPostingWriter = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getPostingResult = await postingDao.getPosting(connection, postId);
  const getRunnerResult = await postingDao.getRunner(connection, postId);
  const getWaitingRunnerResult = await postingDao.getWaitingRunner(
    connection,
    postId
  );
  connection.release();
  const postingInfo = getPostingResult[0];
  const runnerInfo = getRunnerResult[0];
  const waitingRunnerInfo = getWaitingRunnerResult[0];
  const getPostingFinalResult = { postingInfo, runnerInfo, waitingRunnerInfo };
  return getPostingFinalResult;
};

// 작성자인지 체크
exports.checkWriter = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkWriterParams = [postId, userId];
  const checkWriterResult = await postingDao.checkWriter(
    connection,
    checkWriterParams
  );
  connection.release();
  const checkWriterResultF = checkWriterResult[0];

  return checkWriterResultF;
};

// 마감하기
exports.closePosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const closePostingResult = await postingDao.closePosting(connection, postId);
  connection.release();

  return closePostingResult;
};

// 게시글 있는지 확인
exports.checkPosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkPostingResult = await postingDao.checkPosting(connection, postId);
  connection.release();

  return checkPostingResult;
};

// 찜 등록했는지 확인
exports.checkBookMark = async function (userId, postId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkBookMarkParams = [userId, postId];
    const checkBookMark = await postingDao.checkBookMark(
      connection,
      checkBookMarkParams
    );
    connection.release();

    return checkBookMark[0];
  } catch (err) {
    logger.error(`App - checkBookMark Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 게시글 상세페이지 v2
exports.getPosting2 = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getPostingResult = await postingDao.getPosting2(connection, postId);
  const getRunnerResult = await postingDao.getRunner(connection, postId);
  connection.release();
  const postingInfo = getPostingResult[0];
  postingInfo[0].DISTANCE = null;
  postingInfo[0].userId = null;
  postingInfo[0].bookMark = null;
  postingInfo[0].attandance = null;

  const body = await userDao.getProfileUrl(connection, postId);
  postingInfo[0].profileUrlList = body;

  const runnerInfo = getRunnerResult[0];
  const getPostingFinalResult = { postingInfo, runnerInfo };
  return getPostingFinalResult;
};

// 게시글 상세페이지 v2 - 작성자 view
exports.getPostingWriter2 = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getPostingResult = await postingDao.getPosting2(connection, postId);
  const getRunnerResult = await postingDao.getRunner(connection, postId);
  const getWaitingRunnerResult = await postingDao.getWaitingRunner(
    connection,
    postId
  );
  connection.release();
  const postingInfo = getPostingResult[0];
  postingInfo[0].DISTANCE = null;
  postingInfo[0].userId = null;
  postingInfo[0].bookMark = null;
  postingInfo[0].attandance = null;

  const body = await userDao.getProfileUrl(connection, postId);
  postingInfo[0].profileUrlList = body;

  const runnerInfo = getRunnerResult[0];
  const waitingRunnerInfo = getWaitingRunnerResult[0];
  const getPostingFinalResult = { postingInfo, runnerInfo, waitingRunnerInfo };
  return getPostingFinalResult;
};

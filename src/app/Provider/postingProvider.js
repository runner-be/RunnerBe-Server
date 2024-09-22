const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const postingDao = require("../Dao/postingDao");
const userDao = require("../Dao/userDao");

// userId 있는지 체크
exports.userIdCheck = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const userIdCheckResult = await postingDao.userIdCheck(connection, userId);

    return userIdCheckResult;
  } catch (err) {
    await logger.error(`Posting-userIdCheck Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 상세페이지
exports.getPosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getPostingResult = await postingDao.getPosting(connection, postId);
    const getRunnerResult = await postingDao.getRunner(connection, postId);
    const postingInfo = getPostingResult[0];
    const runnerInfo = getRunnerResult;
    const getPostingFinalResult = { postingInfo, runnerInfo };
    return getPostingFinalResult;
  } catch (err) {
    await logger.error(`Posting-getPosting Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 상세페이지 - 작성자 view
exports.getPostingWriter = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getPostingResult = await postingDao.getPosting(connection, postId);
    const getRunnerResult = await postingDao.getRunner(connection, postId);
    const getWaitingRunnerResult = await postingDao.getWaitingRunner(
      connection,
      postId
    );

    const postingInfo = getPostingResult[0];
    const runnerInfo = getRunnerResult;
    const waitingRunnerInfo = getWaitingRunnerResult[0];
    const getPostingFinalResult = {
      postingInfo,
      runnerInfo,
      waitingRunnerInfo,
    };
    return getPostingFinalResult;
  } catch (err) {
    await logger.error(
      `Posting-getPostingWriter Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 작성자인지 체크
exports.checkWriter = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkWriterParams = [postId, userId];
    const checkWriterResult = await postingDao.checkWriter(
      connection,
      checkWriterParams
    );

    const checkWriterResultF = checkWriterResult[0];

    return checkWriterResultF;
  } catch (err) {
    await logger.error(`Posting-checkWriter Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 마감하기
exports.closePosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const closePostingResult = await postingDao.closePosting(
      connection,
      postId
    );

    return closePostingResult;
  } catch (err) {
    await logger.error(`Posting-closePosting Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 있는지 확인
exports.checkPosting = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkPostingResult = await postingDao.checkPosting(
      connection,
      postId
    );

    return checkPostingResult;
  } catch (err) {
    await logger.error(`Posting-checkPosting Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 찜 등록했는지 확인
exports.checkBookMark = async function (userId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkBookMarkParams = [userId, postId];
    const checkBookMark = await postingDao.checkBookMark(
      connection,
      checkBookMarkParams
    );

    return checkBookMark[0];
  } catch (err) {
    await logger.error(`App - checkBookMark Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 상세페이지 v2
exports.getPosting2 = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getPostingResult = await postingDao.getPosting2(connection, postId);
    const getRunnerResult = await postingDao.getRunner(connection, postId);

    const postingInfo = getPostingResult[0];
    postingInfo[0].DISTANCE = null;
    postingInfo[0].userId = null;
    postingInfo[0].bookMark = null;
    postingInfo[0].attandance = null;

    const body = await userDao.getProfileUrl(connection, postId);
    postingInfo[0].profileUrlList = body;

    let roomId;
    try {
      roomId = await postingDao.getRoomId(connection, postId);
    } catch (err) {
      roomId = null;
    }

    let gatheringId;
    try {
      gatheringId = await postingDao.getGatheringId(connection, postId);
    } catch (err) {
      gatheringId = null;
    }

    const runnerInfo = getRunnerResult;
    const getPostingFinalResult = {
      postingInfo,
      runnerInfo,
      roomId,
      gatheringId,
    };
    return getPostingFinalResult;
  } catch (err) {
    await logger.error(`Posting-getPosting2 Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 게시글 상세페이지 v2 - 작성자 view
exports.getPostingWriter2 = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getPostingResult = await postingDao.getPosting2(connection, postId);
    const getRunnerResult = await postingDao.getRunner(connection, postId);
    const getWaitingRunnerResult = await postingDao.getWaitingRunner(
      connection,
      postId
    );

    const postingInfo = getPostingResult[0];
    postingInfo[0].DISTANCE = null;
    postingInfo[0].userId = null;
    postingInfo[0].bookMark = null;
    postingInfo[0].attandance = null;

    const body = await userDao.getProfileUrl(connection, postId);
    postingInfo[0].profileUrlList = body;

    let roomId;
    try {
      roomId = await postingDao.getRoomId(connection, postId);
    } catch (err) {
      roomId = null;
    }

    let gatheringId;
    try {
      gatheringId = await postingDao.getGatheringId(connection, postId);
    } catch (err) {
      gatheringId = null;
    }

    const runnerInfo = getRunnerResult;
    const waitingRunnerInfo = getWaitingRunnerResult[0];
    const getPostingFinalResult = {
      postingInfo,
      runnerInfo,
      waitingRunnerInfo,
      roomId,
      gatheringId,
    };
    return getPostingFinalResult;
  } catch (err) {
    await logger.error(
      `Posting-getPostingWriter2 Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// postUser 확인
exports.checkPostUser = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkPostUserResult = await postingDao.checkPostUser(
      connection,
      postId
    );

    return checkPostUserResult;
  } catch (err) {
    await logger.error(`Posting-checkPostUser Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// postId 확인
exports.checkPostId = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkPostIdResult = await postingDao.checkPostId(connection, postId);

    return checkPostIdResult;
  } catch (err) {
    await logger.error(`Posting-checkPostId Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

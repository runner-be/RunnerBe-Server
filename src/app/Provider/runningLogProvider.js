const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const runningLogDao = require("../Dao/runningLogDao");

// 게시글 있는지 확인
exports.checkPosting = async function (logId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkPostingResult = await runningLogDao.checkPosting(
      connection,
      logId
    );

    return checkPostingResult;
  } catch (err) {
    await logger.error(`Posting-checkPosting Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 로그 작성자인지 체크
exports.checkLogWriter = async function (logId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkWriterParams = [logId, userId];
    const checkWriterResult = await runningLogDao.checkWriter(
      connection,
      checkWriterParams
    );

    const checkWriterResultF = checkWriterResult[0];

    return checkWriterResultF;
  } catch (err) {
    await logger.error(`RunningLog-checkWriter Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝로그 아이디로 러닝모임 ID 찾기
exports.findGatheringId = async function (logId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const findGatheringIdResult = await runningLogDao.getGatheringId(
      connection,
      logId
    );

    return findGatheringIdResult;
  } catch (err) {
    await logger.error(
      `RunningLog-findGatheringId Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝로그 전체 조회
exports.getRunningLog = async function (year, month, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const groupRunningCount = await runningLogDao.getMyGroupRunningCount(
      connection,
      year,
      month,
      userId
    );
    const personalRunningCount = await runningLogDao.getMyPersonalRunningCount(
      connection,
      year,
      month,
      userId
    );

    const totalCount = { groupRunningCount, personalRunningCount };

    const myRunningLog = await runningLogDao.getMyRunning(
      connection,
      year,
      month,
      userId
    );

    const finalResult = { totalCount, myRunningLog };
    return finalResult;
  } catch (err) {
    await logger.error(
      `RunningLog - getRunningLog Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝로그 상세 조회
exports.getDetailRunningLog = async function (userId, logId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const detailRunningLog = await runningLogDao.getDetailRunningLog(
      connection,
      logId
    );

    const getGatheringId = await runningLogDao.getGatheringId(
      connection,
      logId
    );

    let gatheringCount;
    if (getGatheringId) {
      gatheringCount = await runningLogDao.getPartnerRunnerCount(
        connection,
        getGatheringId
      );
    } else {
      gatheringCount = 0;
    }

    const gotStamp = await runningLogDao.getDetailStampInfo(
      connection,
      getGatheringId,
      userId,
      logId
    );

    const finalResult = { detailRunningLog, gatheringCount, gotStamp };
    return finalResult;
  } catch (err) {
    await logger.error(
      `RunningLog - getDetailRunningLog Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 함께한 러너 리스트 조회
exports.getRunners = async function (userId, logId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getGatheringId = await runningLogDao.getGatheringId(
      connection,
      logId
    );

    const getPartnerRunners = await runningLogDao.getPartnerRunners(
      connection,
      userId,
      getGatheringId
    );

    return getPartnerRunners;
  } catch (err) {
    await logger.error(
      `RunningLog - getRunners Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 전체 스탬프 목록 조회
exports.viewStampList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const viewStampResult = await runningLogDao.selectStampList(connection);
    const result = viewStampResult;
    return result;
  } catch (err) {
    await logger.error(
      `RunningLog-viewStampList Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

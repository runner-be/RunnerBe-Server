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

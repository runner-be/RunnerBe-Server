const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const postingProvider = require("../Provider/postingProvider");
const runningLogProvider = require("../Provider/runningLogProvider");
const runningLogDao = require("../Dao/runningLogDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");

// 러닝로그 게시글 생성
exports.createRunningLog = async function (
  userId,
  runningDate,
  gatheringId,
  stampCode,
  contents,
  imageUrl,
  weatherDegree,
  weatherIcon,
  isOpened
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
      runningDate,
      gatheringId,
      stampCode,
      contents,
      imageUrl,
      weatherDegree,
      weatherIcon,
      isOpened,
    ];

    // 게시글 생성
    await runningLogDao.createRunningLog(connection, insertPostingParams);

    // commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    // rollback
    await connection.rollback();
    await logger.error(`App - createLog Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝로그 게시글 수정
exports.patchPosting = async function (
  runningDate,
  gatheringId,
  stampCode,
  contents,
  imageUrl,
  weatherDegree,
  weatherIcon,
  isOpened,
  logId
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();
    const patchPostingParams = [
      runningDate,
      gatheringId,
      stampCode,
      contents,
      imageUrl,
      weatherDegree,
      weatherIcon,
      isOpened,
      logId,
    ];

    //게시글 있는지 확인
    const checkPostingResult = await runningLogProvider.checkPosting(logId);
    if (checkPostingResult.length === 0)
      return errResponse(baseResponse.RUNNINGLOG_NOT_VALID_LOGID);

    // 게시글 수정
    await runningLogDao.updateRunningLog(connection, patchPostingParams);

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(
      `App - updateRunningLog Service error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝로그 게시글 삭제
exports.dropPosting = async function (logId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    //게시글 있는지 확인
    const checkPostingResult = await runningLogProvider.checkPosting(logId);
    if (checkPostingResult.length === 0)
      return errResponse(baseResponse.RUNNINGLOG_NOT_VALID_LOGID);

    await runningLogDao.deleteRunningLog(connection, logId);

    //commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(
      `App - deleteRunningLog Service error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 함께한 러너에게 스탬프 찍기
exports.postingStamp = async function (logId, userId, targetId, stampCode) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    const gatheringId = await runningLogProvider.findGatheringId(logId);

    const insertPostingLogStampParams = [
      logId,
      gatheringId,
      userId,
      targetId,
      stampCode,
    ];

    await runningLogDao.createRunningLogStamp(
      connection,
      insertPostingLogStampParams
    );

    // commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    // rollback
    await connection.rollback();
    await logger.error(
      `App - postingRunningLogStamp Service error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 함께한 러너에게 찍은 스탬프 수정
exports.changeRunningStamp = async function (
  logId,
  userId,
  targetId,
  stampCode
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    const changeLogStampParams = [stampCode, logId, userId, targetId];

    await runningLogDao.changeRunningLogStamp(connection, changeLogStampParams);

    // commit
    await connection.commit();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    // rollback
    await connection.rollback();
    await logger.error(
      `App - changeRunningLogStamp Service error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const runningProvider = require("./runningProvider");
const messageProvider = require("../../app/Message/messageProvider");
const runningDao = require("./runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const { connect } = require("http2");
const res = require("express/lib/response");

// 참여 요청 보내기
exports.sendRequest = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const sendRequestParams = [postId, userId];
    const sendRequestResult = await runningDao.sendRequest(
      connection,
      sendRequestParams
    );

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - sendRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 참여 요청 처리하기
exports.handleRequest = async function (postId, applicantId, whetherAccept) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const sendRequestParams = [postId, applicantId];
    const sendRequestResult = await runningDao.handleRequest(
      connection,
      sendRequestParams,
      whetherAccept
    );

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - handleRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 출석하기
exports.attend = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    //RunningPeople에 참석여부 업데이트
    const updateParams = [userId, postId];
    const updateRunningA = await runningDao.updateR(connection, updateParams);

    //유저의 성실도 업데이트
    const updateParamsU = [userId, userId];
    const updateUserA = await runningDao.updateU(connection, updateParamsU);

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - attend Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const messageProvider = require("./messageProvider");
const messageDao = require("./messageDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const { connect } = require("http2");
const res = require("express/lib/response");

// 메시지 전송
exports.sendMessage = async function (roomId, userId, content) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    //메시지 전송
    await messageDao.sendMessage(connection, [userId, roomId, content]);

    //나머지 사람들의 recentMessage를 Y로 변경
    //1. 모두 Y로 변경
    await messageDao.updateRecentMessageY(connection, roomId);
    //2.현재 유저의 recentMessage을 N으로 변경
    await messageDao.updateRecentMessageN(connection, [roomId, userId]);

    //commit
    await connection.commit();

    connection.release();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - sendMessage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const messageProvider = require("./messageProvider");
const messageDao = require("./messageDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const { connect } = require("http2");
const res = require("express/lib/response");

// 쪽지 보내기
exports.sendMessage = async function (roomId, senderId, receiverId, content) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const sendMessageParams = [senderId, receiverId, content];
    const sendMessageResult = await messageDao.sendMessage(
      connection,
      sendMessageParams
    );

    const messageId = sendMessageResult.insertId;
    const MPRParams = [roomId, messageId];
    const messagePerRoom = await messageDao.MPR(connection, MPRParams);

    connection.release();

    return sendMessageResult;
  } catch (err) {
    logger.error(`App - sendMessage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

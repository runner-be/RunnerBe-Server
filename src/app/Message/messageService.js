const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const messageProvider = require("./messageProvider");
const messageDao = require("./messageDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");

const { connect } = require("http2");
const res = require("express/lib/response");

// 대화방 생성
exports.createRoom = async function (postId, senderId, repUserId) {
    try {
        // 이미 참여 신청을 했었는지 확인
        const checkAlreadyapply = await messageProvider.checkAlreadyapply(
            senderId,
            postId
        );
        if (checkAlreadyapply.length > 0) {
            return errResponse(baseResponse.USER_ALREADY_DENIED);
        }

        const connection = await pool.getConnection(async (conn) => conn);
        const createRoomParams = [postId, senderId, repUserId];
        const createRoomResult = await messageDao.createRoom(
            connection,
            createRoomParams
        );

        const insertedRoomId = createRoomResult[0].insertId;
        connection.release();

        return insertedRoomId;
    } catch (err) {
        logger.error(`App - createRoom Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

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

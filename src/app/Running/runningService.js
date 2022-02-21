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
    try {
        // 이미 참여 신청을 해서 거절당했는지 확인
        const checkAlreadyapply = await messageProvider.checkAlreadyapply(
            userId,
            postId
        );

        /////여기서 다시 시작
        if (checkAlreadyapply.length > 0) {
            return errResponse(baseResponse.USER_ALREADY_DENIED);
        }

        const connection = await pool.getConnection(async (conn) => conn);
        const sendRequestParams = [postId, senderId, repUserId];
        const sendRequestResult = await messageDao.createRoom(
            connection,
            sendRequestParams
        );

        connection.release();

        return sendRequestResult;
    } catch (err) {
        logger.error(`App - sendRequest Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

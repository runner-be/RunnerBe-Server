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
exports.sendRequest = async function (postId, applicantId, whetherAccept) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const sendRequestParams = [postId, applicantId];
        const sendRequestResult = await runningDao.sendRequest(
            connection,
            sendRequestParams,
            whetherAccept
        );

        connection.release();

        return sendRequestResult;
    } catch (err) {
        logger.error(`App - sendRequest Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

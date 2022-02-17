const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const messageProvider = require("./messageProvider");
const messageDao = require("./messageDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");

const { connect } = require("http2");

// 대화방 생성
exports.createRoom = async function (postId, senderId, repUserId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const createRoomParams = [postId, senderId, repUserId];
        const createRoomResult = await messageDao.createRoom(
            connection,
            createRoomParams
        );
        connection.release();

        return createRoomResult;
    } catch (err) {
        logger.error(`App - createRoom Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

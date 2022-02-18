const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const messageDao = require("./messageDao");

// 반장 Id 가져오기
exports.getRepUserId = async function (postId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getRepUserIdResult = await messageDao.getRepUserId(connection, postId);
    connection.release();

    return getRepUserIdResult;
};

// 이전에 참여신청해서 거절 당했는지 확인
exports.checkAlreadyapply = async function (senderId, postId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkAlreadyParams = [senderId, postId];
    const checkAlreadyResult = await messageDao.checkAlreadyapply(
        connection,
        checkAlreadyParams
    );
    connection.release();

    return checkAlreadyResult;
};

// 수신자 Id 가져오기
exports.getReceiverId = async function (roomId, senderId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        // receiverId 생성 절차
        const senderParams = [roomId, senderId];
        const checkEqualSender = await messageDao.checkSender(
            connection,
            senderParams
        );
        const checkEqualReceiver = await messageDao.checkReceiver(
            connection,
            senderParams
        );
        connection.release();
        //반대로 전달
        if (checkEqualSender.length > 0) {
            const receiverId = await messageDao.getReceiver(connection, senderParams);
            return receiverId;
        } else if (checkEqualReceiver.length > 0) {
            const receiverId = await messageDao.getSender(connection, senderParams);
            return receiverId;
        } else {
            return errResponse(baseResponse.MESSAGE_NOT_MATCH_USERID);
        }
    } catch (err) {
        logger.error(`App - getReceiverId Provider error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

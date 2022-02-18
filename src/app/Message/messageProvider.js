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

// 쪽지 목록창 조회
exports.getMessageList = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getMessageResult = await messageDao.getMessageList(connection, userId);
    connection.release();

    return getMessageResult[0];
};

// 대화방 상세페이지
exports.getRoom = async function (roomId, userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);

        //방정보
        const ex_roomInfo = await messageDao.getRoomInfo(connection, roomId);

        //chat
        const getChatParams = [roomId, userId, userId];
        const ex_ChatResult = await messageDao.getChat(connection, getChatParams);

        // 읽음 처리하기
        const reading = await messageDao.reading(connection, roomId);
        connection.release();

        const roomInfo = ex_roomInfo[0];
        const ChatResult = ex_ChatResult[0];

        const finalResult = { roomInfo, ChatResult };

        return finalResult;
    } catch (err) {
        logger.error(`App - getRoom Provider error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 러닝 모임 생성자 확인
exports.checkMaster = async function (userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const checkMaster = await messageDao.checkMaster(connection, userId);
        connection.release();

        return checkMaster;
    } catch (err) {
        logger.error(`App - getRoom Provider error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

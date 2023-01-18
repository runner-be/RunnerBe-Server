const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const messageDao = require("../Dao/messageDao");

// 반장 Id 가져오기
exports.getRepUserId = async function (postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getRepUserIdResult = await messageDao.getRepUserId(
      connection,
      postId
    );

    return getRepUserIdResult;
  } catch (err) {
    await logger.error(`Message-getRepUserId Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 이전에 참여신청해서 거절 당했는지 확인
exports.checkAlreadyapply = async function (senderId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkAlreadyParams = [senderId, postId];
    const checkAlreadyResult = await messageDao.checkAlreadyapply(
      connection,
      checkAlreadyParams
    );

    return checkAlreadyResult;
  } catch (err) {
    await logger.error(
      `Message-checkAlreadyapply Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};
// 이전에 참여 신청했는지만 확인
exports.checkAlreadyapplyNotD = async function (senderId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkAlreadyParams = [senderId, postId];
    const checkAlreadyResult = await messageDao.checkAlreadyapplyNotD(
      connection,
      checkAlreadyParams
    );
    return checkAlreadyResult;
  } catch (err) {
    await logger.error(
      `Message-checkAlreadyapplyNotD Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 수신자 Id 가져오기
exports.getReceiverId = async function (roomId, senderId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
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
    await logger.error(`App - getReceiverId Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 대화방 목록창 조회
exports.getRoomList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getRoomListResult = await messageDao.getRoomList(connection, userId);
    return getRoomListResult;
  } catch (err) {
    await logger.error(`Message-getRoomList Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 대화방 상세페이지
exports.getRoom = async function (roomId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    //방정보
    const roomInfo = await messageDao.getRoomInfo(connection, roomId);

    //메시지 리스트
    const messageList = await messageDao.getMessageList(connection, [
      userId,
      roomId,
    ]);

    // 현재 유저의 recentMessage을 N으로 변경
    await messageDao.updateRecentMessageN(connection, [roomId, userId]);

    const finalResult = { roomInfo, messageList };

    return finalResult;
  } catch (err) {
    await logger.error(`App - getRoom Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 러닝 모임 생성자 확인
exports.checkMaster = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkMaster = await messageDao.checkMaster(connection, userId);

    return checkMaster[0];
  } catch (err) {
    await logger.error(`App - checkMaster Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 대화방의 참여 신청 여부 확인
exports.checkApplyStatus = async function (roomId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkApplyStatus = await messageDao.checkApplyStatus(
      connection,
      roomId
    );
    return checkApplyStatus[0];
  } catch (err) {
    await logger.error(
      `App - checkApplyStatus Provider error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//참여 신청 완료로 바꾸기
exports.changeApply = async function (roomId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const changeApply = await messageDao.changeApply(connection, roomId);
    return changeApply[0];
  } catch (err) {
    await logger.error(`App - changeApply Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 방에 있는지 확인
exports.checkUserInRoom = async function (roomId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkUserInRoomParams = [roomId, userId];
    const checkUserInRoom = await messageDao.checkUserInRoom(
      connection,
      checkUserInRoomParams
    );
    return checkUserInRoom[0];
  } catch (err) {
    await logger.error(
      `App - checkUserInRoom Provider error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 참여 신청 처리 여부 확인
exports.checkApplyChanged = async function (roomId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkApplyChanged = await messageDao.checkApplyChanged(
      connection,
      roomId
    );
    return checkApplyChanged[0];
  } catch (err) {
    await logger.error(
      `App - checkApplyChanged Provider error\n: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//  messageId 존재 확인
exports.getMessageId = async function (messageId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getMessageIdResult = await messageDao.getMessageId(
      connection,
      messageId
    );
    return getMessageIdResult;
  } catch (err) {
    await logger.error(`App - getMessageId Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

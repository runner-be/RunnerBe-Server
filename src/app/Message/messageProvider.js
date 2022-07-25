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
// 이전에 참여 신청했는지만 확인
exports.checkAlreadyapplyNotD = async function (senderId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkAlreadyParams = [senderId, postId];
  const checkAlreadyResult = await messageDao.checkAlreadyapplyNotD(
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

// 대화방 목록창 조회
exports.getRoomList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getRoomListResult = await messageDao.getRoomList(connection, userId);
  connection.release();

  return getRoomListResult;
};

// 대화방 상세페이지
exports.getRoom = async function (roomId, userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);

    //방정보
    const roomInfo = await messageDao.getRoomInfo(connection, roomId);

    //메시지 리스트
    const messageList = await messageDao.getMessageList(connection, [
      userId,
      roomId,
    ]);

    // 현재 유저의 recentMessage을 N으로 변경
    await messageDao.updateRecentMessageN(connection, [roomId, userId]);

    connection.release();

    const finalResult = { roomInfo, messageList };

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

    return checkMaster[0];
  } catch (err) {
    logger.error(`App - getRoom Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 대화방의 참여 신청 여부 확인
exports.checkApplyStatus = async function (roomId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkApplyStatus = await messageDao.checkApplyStatus(
      connection,
      roomId
    );
    connection.release();

    return checkApplyStatus[0];
  } catch (err) {
    logger.error(`App - checkApplyStatus Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//참여 신청 완료로 바꾸기
exports.changeApply = async function (roomId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const changeApply = await messageDao.changeApply(connection, roomId);
    connection.release();

    return changeApply[0];
  } catch (err) {
    logger.error(`App - changeApply Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 방에 있는지 확인
exports.checkUserInRoom = async function (roomId, userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkUserInRoomParams = [roomId, userId, userId];
    const checkUserInRoom = await messageDao.checkUserInRoom(
      connection,
      checkUserInRoomParams
    );
    connection.release();

    return checkUserInRoom[0];
  } catch (err) {
    logger.error(`App - checkUserInRoom Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 참여 신청 처리 여부 확인
exports.checkApplyChanged = async function (roomId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkApplyChanged = await messageDao.checkApplyChanged(
      connection,
      roomId
    );
    connection.release();

    return checkApplyChanged[0];
  } catch (err) {
    logger.error(`App - checkApplyChanged Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//  messageId 존재 확인
exports.getMessageId = async function (messageId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getMessageIdResult = await messageDao.getMessageId(
    connection,
    messageId
  );
  connection.release();

  return getMessageIdResult;
};

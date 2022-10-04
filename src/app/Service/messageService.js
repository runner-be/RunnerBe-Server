const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const messageProvider = require("../Provider/messageProvider");
const messageDao = require("../Dao/messageDao");
const userDao = require("../Dao/userDao");
const runningDao = require("../Dao/runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const admin = require('../utils/fcm');
// 메시지 전송
exports.sendMessage = async function (roomId, userId, content) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    //메시지 전송
    await messageDao.sendMessage(connection, [userId, roomId, content]);

    //나머지 사람들의 recentMessage를 Y로 변경
    //1. 모두 Y로 변경
    await messageDao.updateRecentMessageY(connection, roomId);
    //2.현재 유저의 recentMessage을 N으로 변경
    await messageDao.updateRecentMessageN(connection, [roomId, userId]);

    //수신자에게 푸쉬알림 전송
    //0. 수신자 확인(반장 이외 인원 확인)
    const userCount = await runningDao.getUserCount(connection, roomId);

    if (userCount !== 1){
        //1. deviceToken array 생성
      let deviceToken  = [];

      const deviceTokenList = await userDao.getDeviceTokenList(connection, userId, roomId);
      for(let tokenObject of deviceTokenList){
        deviceToken.push(tokenObject['deviceToken']);
      }

      //2. 푸쉬알림 전송
      //title, body 설정
      const roomInfo = await runningDao.getRoomInfo(connection, roomId);
      const titleInstance = "RunnerBe : 메세지 도착";
      const pushContent = `[${roomInfo.title}] ${roomInfo.nickName} 러너에게서 메시지가 도착했어요! 메세지 목록 페이지에서 확인해 볼까요?`
      //푸쉬알림 메시지 설정
      for(let token of deviceToken){
        let message = {
          notification: {
            title: titleInstance,
            body: pushContent,
          },
          data: {
            title: titleInstance,
            body: pushContent,
          },
          token: token,
        };
        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            logger.info(`successfully sent message : ${id}`)
            return 0;
          })
        .catch(function (err) {
          logger.error(`Error Sending message : ${err}, ${err.toString()}`);
          return response(baseResponse.ERROR_SEND_MESSAGE);
        });

        //메시지 저장
        const userIdList = await userDao.getOtherId(connection, userId, roomId);
        for(let userId of userIdList){
          await runningDao.savePushalarm(connection, userId, titleInstance, pushContent);
        };
      }
    }
    

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - sendMessage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 메시지 신고
exports.reportMessage = async function (messageId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    //메시지 신고
    await messageDao.reportMessage(connection, [messageId, userId]);

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - reportMessage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const runningProvider = require("../Provider/runningProvider");
const messageProvider = require("../Provider/messageProvider");
const messageDao = require("../Dao/messageDao");
const runningDao = require("../Dao/runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const admin = require('../utils/fcm');

// 참여 요청 보내기
exports.sendRequest = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    const sendRequestParams = [postId, userId];
    const sendRequestResult = await runningDao.sendRequest(
      connection,
      sendRequestParams
    );

    // 작성자에게 push alarm 발송
    const title = await runningDao.getTitle(connection, postId);
    const repUserId = await messageDao.getRepUserId(connection, postId);
    //수신 여부 확인
    const pushOn = await runningDao.checkPushOn(connection, repUserId);
    if (pushOn == "Y") {
      // push alarm 보낼 user의 device token
      const getDeviceTokenRows = await runningDao.getDeviceToken(
        connection,
        repUserId
      );
      if (getDeviceTokenRows.length === 0)
        return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

      //title, body 설정
      const titleInstance = "RunnerBe : 모임 참여 요청 전달";
      const content =
      `${getDeviceTokenRows[0].nickName} 님, 작성한 [${title}]에 다른 러너가 신청했어요! 모임글 페이지로 확인하러 가볼까요?`;

      //푸쉬알림 메시지 설정
      let message = {
        notification: {
          title: titleInstance,
          body: content,
        },
        data: {
          title: titleInstance,
          body: content,
        },
        token: getDeviceTokenRows[0].deviceToken,
      };

      //푸쉬알림 발송
      await admin
        .messaging()
        .send(message)
        .then(function (id) {
          console.log("Successfully sent message: : ", id);
          return 0;
        })
        .catch(function (err) {
          console.log("Error Sending message!!! : ", err);
          return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
        });

      //메시지 저장
      await runningDao.savePushalarm(
        connection,
        repUserId,
        titleInstance,
        content
      );
    }

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - sendRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 참여 요청 처리하기
exports.handleRequest = async function (postId, applicantId, whetherAccept) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    const sendRequestParams = [postId, applicantId];
    const sendRequestResult = await runningDao.handleRequest(
      connection,
      sendRequestParams,
      whetherAccept
    );

    //수신 여부 확인
    const pushOn = await runningDao.checkPushOn(connection, applicantId);
    if (pushOn == "Y") {
      //start push alarm
      const title = await runningDao.getTitle(connection, postId);
      const getDeviceTokenRows = await runningDao.getDeviceToken(
        connection,
        applicantId
      );
      if (getDeviceTokenRows.length === 0)
        return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

      //수락 push alarm
      if (whetherAccept == "Y") {
        //title, body 설정
        const titleInstance = "RunnerBe : 모임 신청 승인";
        const content = `${getDeviceTokenRows[0].nickName}님, [${title}] 참여가 승인되었어요! 신나게 달릴 준비를 해볼까요?`;

        //푸쉬알림 메시지 설정
        let message = {
          notification: {
            title: titleInstance,
            body: content,
          },
          data: {
            title: titleInstance,
            body: content,
          },
          token: getDeviceTokenRows[0].deviceToken,
        };

        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            console.log("Successfully sent message: : ", id);
            return 0;
          })
          .catch(function (err) {
            console.log("Error Sending message!!! : ", err);
            return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
          });

        //메시지 저장
        await runningDao.savePushalarm(
          connection,
          applicantId,
          titleInstance,
          content
        );

        //대화방에 초대
        const roomId = await messageDao.getRoomId(connection, postId);
        await messageDao.insertUserPerRoom(connection, [roomId, applicantId]);
      } else {
        //title, body 설정
        const titleInstance = "RunnerBe : 모임 신청 거절";
        const content = `${getDeviceTokenRows[0].nickName}님, [${title}] 참여가 승인되지 않았네요. 아쉽지만 다른 모임을 찾아보는 것이 어떨까요?`;

        //푸쉬알림 메시지 설정
        let message = {
          notification: {
            title: titleInstance,
            body: content,
          },
          data: {
            title: titleInstance,
            body: content,
          },
          token: getDeviceTokenRows[0].deviceToken,
        };

        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            console.log("Successfully sent message: : ", id);
            return 0;
          })
          .catch(function (err) {
            console.log("Error Sending message!!! : ", err);
            return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
          });

        //메시지 저장
        await runningDao.savePushalarm(
          connection,
          applicantId,
          titleInstance,
          content
        );
      }
    }
    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    await logger.error(`App - handleRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 출석하기
exports.attend = async function (postId, userId, whetherAttend) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    await connection.beginTransaction();

    //RunningPeople에 참석여부 업데이트
    const updateParams = [userId, postId];
    if (whetherAttend == "Y") {
      //update RP if user attend
      await runningDao.updateRPY(connection, updateParams);

      //수신 여부 확인
      const pushOn = await runningDao.checkPushOn(connection, userId);
      if (pushOn == "Y") {
        //start push alarm
        const getDeviceTokenRows = await runningDao.getDeviceToken(
          connection,
          userId
        );
        if (getDeviceTokenRows.length === 0)
          return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

        //title, body 설정
        const titleInstance = "RunnerBe : 출석 완료";
        const content = `${getDeviceTokenRows[0].nickName}님, 출석이 완료됐어요! 즐거운 러닝을 시작해볼까요?`;

        //푸쉬알림 메시지 설정
        let message = {
          notification: {
            title: titleInstance,
            body: content,
          },
          data: {
            title: titleInstance,
            body: content,
          },
          token: getDeviceTokenRows[0].deviceToken,
        };

        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            console.log("Successfully sent message: : ", id);
            return 0;
          })
          .catch(function (err) {
            console.log("Error Sending message!!! : ", err);
            return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
          });

        //메시지 저장
        await runningDao.savePushalarm(
          connection,
          userId,
          titleInstance,
          content
        );
      }
    } else {
      //update RP if user didn't attend
      await runningDao.updateRPN(connection, updateParams);

      //수신 여부 확인
      const pushOn = await runningDao.checkPushOn(connection, userId);
      if (pushOn == "Y") {
        //start push alarm
        const getDeviceTokenRows = await runningDao.getDeviceToken(
          connection,
          userId
        );
        if (getDeviceTokenRows.length === 0)
          return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

        //title, body 설정
        const titleInstance = "RunnerBe : 출석 미완료";
        const content = `${getDeviceTokenRows[0].nickName}님, 러닝 모임에 불참하신 것 같아요. 다음에는 조금 더 분발해볼까요?`;

        //푸쉬알림 메시지 설정
        let message = {
          notification: {
            title: titleInstance,
            body: content,
          },
          data: {
            title: titleInstance,
            body: content,
          },
          token: getDeviceTokenRows[0].deviceToken,
        };

        //푸쉬알림 발송
        await admin
          .messaging()
          .send(message)
          .then(function (id) {
            console.log("Successfully sent message: : ", id);
            return 0;
          })
          .catch(function (err) {
            console.log("Error Sending message!!! : ", err);
            return res.send(response(baseResponse.ERROR_SEND_MESSAGE));
          });

        //메시지 저장
        await runningDao.savePushalarm(
          connection,
          userId,
          titleInstance,
          content
        );
      }
    }

    //유저의 성실도 업데이트
    const updateParamsU = [userId, userId];
    await runningDao.updateU(connection, updateParamsU);

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    console.log("rollback");
    await connection.rollback();
    await logger.error(`App - attend Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

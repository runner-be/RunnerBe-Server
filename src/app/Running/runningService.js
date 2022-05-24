const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const runningProvider = require("./runningProvider");
const messageProvider = require("../../app/Message/messageProvider");
const messageDao = require("../../app/Message/messageDao");
const runningDao = require("./runningDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const { connect } = require("http2");
const res = require("express/lib/response");

//푸시알림
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
let serAccount = require("../../../config/runnerbe-f1986-firebase-adminsdk-frfin-c125099a1f.json");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serAccount),
  });
}

// 참여 요청 보내기
exports.sendRequest = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const sendRequestParams = [postId, userId];
    const sendRequestResult = await runningDao.sendRequest(
      connection,
      sendRequestParams
    );

    //commit
    await connection.commit();

    // 작성자에게 push alarm 발송
    const title = await runningDao.getTitle(connection, postId);
    const repUserId = await messageDao.getRepUserId(connection, postId);
    // push alarm 보낼 user의 device token
    const getDeviceTokenRows = await runningDao.getDeviceToken(
      connection,
      repUserId
    );
    if (getDeviceTokenRows.length === 0)
      return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

    let message = {
      notification: {
        title: "RunnerBe : 모임 참여 요청 전달",
        body:
          getDeviceTokenRows[0].nickName +
          `님, 작성한 ["` +
          title +
          `"]을 다른 러너가 신청했어요! 확인하러 가볼까요?`,
      },
      data: {
        title: "RunnerBe : 모임 참여 요청 전달",
        body:
          getDeviceTokenRows[0].nickName +
          `님, 작성한 ["` +
          title +
          `"]을 다른 러너가 신청했어요! 확인하러 가볼까요?`,
      },
      token: getDeviceTokenRows[0].deviceToken,
    };

    admin
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

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - sendRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 참여 요청 처리하기
exports.handleRequest = async function (postId, applicantId, whetherAccept) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const sendRequestParams = [postId, applicantId];
    const sendRequestResult = await runningDao.handleRequest(
      connection,
      sendRequestParams,
      whetherAccept
    );

    //commit
    await connection.commit();

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
      let message = {
        notification: {
          title: "RunnerBe : 모임 신청 승인",
          body:
            getDeviceTokenRows[0].nickName +
            `님, ["` +
            title +
            `"]이 승인되었어요! 신나게 달릴 준비를 해볼까요?`,
        },
        data: {
          title: "RunnerBe : 모임 신청 승인",
          body:
            getDeviceTokenRows[0].nickName +
            `님, ["` +
            title +
            `"]이 승인되었어요! 신나게 달릴 준비를 해볼까요?`,
        },
        token: getDeviceTokenRows[0].deviceToken,
      };
      admin
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
    } else {
      let message = {
        notification: {
          title: "RunnerBe : 모임 신청 거절",
          body:
            getDeviceTokenRows[0].nickName +
            `님, ["` +
            title +
            `"]이 승인되지 않았네요. 아쉽지만 다른 모임을 찾아보는 것이 어떨까요?`,
        },
        data: {
          title: "RunnerBe : 모임 신청 거절",
          body:
            getDeviceTokenRows[0].nickName +
            `님, ["` +
            title +
            `"]이 승인되지 않았네요. 아쉽지만 다른 모임을 찾아보는 것이 어떨까요?`,
        },
        token: getDeviceTokenRows[0].deviceToken,
      };
      admin
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
    }

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - handleRequest Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 출석하기
exports.attend = async function (postId, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    //RunningPeople에 참석여부 업데이트
    const updateParams = [userId, postId];
    const updateRunningA = await runningDao.updateR(connection, updateParams);

    //유저의 성실도 업데이트
    const updateParamsU = [userId, userId];
    const updateUserA = await runningDao.updateU(connection, updateParamsU);

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - attend Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

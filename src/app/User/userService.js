const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const secret = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { connect } = require("http2");

// 유저 생성
exports.createUser = async function (
  uuid,
  nickName,
  birthday,
  gender,
  job,
  idCardImageUrl,
  officeEmail,
  deviceToken
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    // uuid 중복 확인
    const uuidRows = await userProvider.uuidCheck(uuid);
    if (uuidRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_UUID);

    //nickName 중복 확인
    const nickNameRows = await userProvider.nickNameCheck(nickName);
    if (nickNameRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

    // 직군코드 유효 확인
    const checkJob = await userProvider.checkJobExist(job);
    if (checkJob === 0)
      return errResponse(baseResponse.SIGNUP_JOBCODE_IS_NOT_VALID);

    if (officeEmail) {
      // 이메일 암호화
      const hashedEmail = await crypto
        .createHash("sha512")
        .update(officeEmail)
        .digest("hex");
      //이메일 중복 확인
      const emailRows = await userProvider.emailCheck(hashedEmail);
      if (emailRows.length > 0)
        return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
      const insertUserInfoParams = [
        uuid,
        nickName,
        birthday,
        gender,
        job,
        idCardImageUrl,
        hashedEmail,
        deviceToken,
      ];

      const userResult = await userDao.insertUserInfoEmail(
        connection,
        insertUserInfoParams
      );
      const insertedUserId = userResult[0].insertId;

      //jwt 발급
      let token = await jwt.sign(
        {
          userId: insertedUserId,
        },
        secret.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );
      const result = { insertedUserId, token };

      //commit
      await connection.commit();

      return response(baseResponse.SUCCESS_SIGN_UP, result);
    } else {
      const hashedEmail = officeEmail;
      const insertUserInfoParams = [
        uuid,
        nickName,
        birthday,
        gender,
        job,
        idCardImageUrl,
        hashedEmail,
        deviceToken,
      ];
      const userResult = await userDao.insertUserInfoPhoto(
        connection,
        insertUserInfoParams
      );
      const insertedUserId = userResult[0].insertId;

      //jwt 발급
      let token = await jwt.sign(
        {
          userId: insertedUserId,
        },
        secret.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );
      const result = { insertedUserId, token };

      //commit
      await connection.commit();

      return response(baseResponse.SUCCESS_PHOTO, result);
    }
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

//user의 nickname 변경
exports.patchUserName = async function (changedNickName, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    //변경이력 확인
    const checkRecordRows = await userProvider.checkRecord(userId);
    if (checkRecordRows.length > 0)
      return errResponse(baseResponse.CANNOT_CHANGE_NICKNAME);

    //nickName 중복 확인
    const nickNameRows = await userProvider.nickNameCheck(changedNickName);
    if (nickNameRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

    const patchUserNameList = [changedNickName, userId];
    const patchUserNameResult = await userDao.patchUserName(
      connection,
      patchUserNameList
    );

    //commit
    await connection.commit();

    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - patchUserName Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 찜 등록 및 해제
exports.addBM = async function (userId, postId, whetherAdd) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const addBMParams = [userId, postId];
    if (whetherAdd === "Y") {
      const addBMResult = await userDao.addBMY(connection, addBMParams);

      //commit
      await connection.commit();

      return 0;
    } else if (whetherAdd === "N") {
      const addBMResult = await userDao.addBMN(connection, addBMParams);

      //commit
      await connection.commit();

      return 0;
    }
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - addBM Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

//user의 사진 변경
exports.patchUserImage = async function (profileImageUrl, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const patchUserImageParams = [profileImageUrl, userId];
    const patchUserImageResult = await userDao.patchUserImage(
      connection,
      patchUserImageParams
    );

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - patchUserImage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

//user의 job 변경
exports.patchUserJob = async function (job, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const patchUserJobResult = await userDao.patchUserJob(
      connection,
      job,
      userId
    );

    //commit
    await connection.commit();

    return 0;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - patchUserJob Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 회원 정보 삭제
exports.deleteUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const deleteUser = await userDao.deleteUser(connection, userId);
    const finalResult = { "deleted userId": userId };

    //commit
    await connection.commit();

    return finalResult;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`User-deleteUser Service error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 유저 생성 v2 - 원래는 createUser 하나로 가야하지만, 이후 v1 삭제하고 v2를 기본으로 설정할 것이라 따로 나눔
exports.createUserV2 = async function (
  uuid,
  nickName,
  birthday,
  gender,
  job,
  deviceToken
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    // uuid 중복 확인
    const uuidRows = await userProvider.uuidCheck(uuid);
    if (uuidRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_UUID);

    //nickName 중복 확인
    const nickNameRows = await userProvider.nickNameCheck(nickName);
    if (nickNameRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

    // 직군코드 유효 확인
    const checkJob = await userProvider.checkJobExist(job);
    if (checkJob === 0)
      return errResponse(baseResponse.SIGNUP_JOBCODE_IS_NOT_VALID);

    const insertUserInfoParams = [
      uuid,
      nickName,
      birthday,
      gender,
      job,
      deviceToken,
    ];

    const userResult = await userDao.insertUserV2(
      connection,
      insertUserInfoParams
    );
    const insertedUserId = userResult[0].insertId;

    //jwt 발급
    let token = await jwt.sign(
      {
        userId: insertedUserId,
      },
      secret.jwtsecret,
      {
        expiresIn: "365d",
        subject: "userInfo",
      }
    );
    const result = { insertedUserId, token };

    //commit
    await connection.commit();

    return response(baseResponse.SUCCESS_SIGN_UP, result);
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

//user의 deviceToken 변경
exports.patchDeviceToken = async function (deviceToken, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const patchUserDeviceTokenParams = [deviceToken, userId];
    const result = await userDao.patchUserDeviceToken(
      connection,
      patchUserDeviceTokenParams
    );

    //commit
    await connection.commit();

    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - patcDeviceToken Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

//푸쉬 알림 수신 여부 변경
exports.patchPushOn = async function (pushOn, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    const patchPushOnParams = [pushOn, userId];
    const result = await userDao.patchPushOn(connection, patchPushOnParams);

    //commit
    await connection.commit();

    return response(baseResponse.SUCCESS);
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - patchPushOn Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

// 알림 메시지 목록 조회 및 읽음 처리
exports.getMyAlarms = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    //start Transaction
    connection.beginTransaction();

    //알림 메시지 목록
    const alarmList = await userDao.getMyAlarms(connection, userId);

    //읽음 처리
    await userDao.changeWhetherRead(connection, userId);

    //commit
    await connection.commit();

    return alarmList;
  } catch (err) {
    //rollback
    await connection.rollback();
    logger.error(`App - getMyAlarms Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
};

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
  try {
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
      const connection = await pool.getConnection(async (conn) => conn);

      const userResult = await userDao.insertUserInfoEmail(
        connection,
        insertUserInfoParams
      );
      const insertedUserId = userResult[0].insertId;
      console.log(`추가된 회원 : ${userResult[0].insertId}`);
      connection.release();

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
      const connection = await pool.getConnection(async (conn) => conn);

      const userResult = await userDao.insertUserInfoPhoto(
        connection,
        insertUserInfoParams
      );
      const insertedUserId = userResult[0].insertId;
      console.log(`추가된 회원 : ${userResult[0].insertId}`);
      connection.release();

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

      return response(baseResponse.SUCCESS_PHOTO, result);
    }
  } catch (err) {
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//user의 nickname 변경
exports.patchUserName = async function (changedNickName, userId) {
  try {
    //변경이력 확인
    const checkRecordRows = await userProvider.checkRecord(userId);
    if (checkRecordRows.length > 0)
      return errResponse(baseResponse.CANNOT_CHANGE_NICKNAME);

    //nickName 중복 확인
    const nickNameRows = await userProvider.nickNameCheck(changedNickName);
    if (nickNameRows.length > 0)
      return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

    const connection = await pool.getConnection(async (conn) => conn);
    const patchUserNameList = [changedNickName, userId];
    const patchUserNameResult = await userDao.patchUserName(
      connection,
      patchUserNameList
    );

    connection.release();

    // console.log(`닉네임 변경 유저 ID : ${userId}`);

    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - patchUserName Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 찜 등록 및 해제
exports.addBM = async function (userId, postId, whetherAdd) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const addBMParams = [userId, postId];
    if (whetherAdd === "Y") {
      const addBMResult = await userDao.addBMY(connection, addBMParams);
      connection.release();
      return addBMResult;
    } else if (whetherAdd === "N") {
      const addBMResult = await userDao.addBMN(connection, addBMParams);
      connection.release();
      return addBMResult;
    }
  } catch (err) {
    logger.error(`App - addBM Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//user의 nickname 변경
exports.patchUserImage = async function (profileImageUrl, userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const patchUserImageParams = [profileImageUrl, userId];
    const patchUserImageResult = await userDao.patchUserImage(
      connection,
      patchUserImageParams
    );

    connection.release();

    return patchUserImageResult;
  } catch (err) {
    logger.error(`App - patchUserImage Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//user의 job 변경
exports.patchUserJob = async function (job, userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const patchUserJobParams = [job, userId];
    const patchUserJobResult = await userDao.patchUserJob(
      connection,
      patchUserJobParams
    );

    connection.release();

    return patchUserJobResult;
  } catch (err) {
    logger.error(`App - patchUserJob Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 회원 정보 삭제
exports.deleteUser = async function (userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteUser = await userDao.deleteUser(connection, userId);
    connection.release();
    const finalResult = { "deleted userId": userId };
    return finalResult;
  } catch (err) {
    logger.error(`User-deleteUser Service error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
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
  try {
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
    const connection = await pool.getConnection(async (conn) => conn);

    const userResult = await userDao.insertUserV2(
      connection,
      insertUserInfoParams
    );
    const insertedUserId = userResult[0].insertId;
    console.log(`추가된 회원 : ${userResult[0].insertId}`);
    connection.release();

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

    return response(baseResponse.SUCCESS_SIGN_UP, result);
  } catch (err) {
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

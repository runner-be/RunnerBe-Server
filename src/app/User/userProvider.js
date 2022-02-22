const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const userDao = require("./userDao");

exports.retrieveUserList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const userListResult = await userDao.selectUser(connection);
  connection.release();
  return userListResult;
};

exports.deleteUser = async function (uuid) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteResult = await userDao.deleteUser(connection, uuid);
  connection.release();
  return deleteResult;
};
// UUID 존재 여부
exports.checkUuidExist = async function (uuid) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const uuidCheckResult = await userDao.selectUuid(connection, uuid);
    connection.release();

    return uuidCheckResult;
  } catch (err) {
    logger.error(`User-checkUuidExist Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};
// 유저 고유 아이디 조회
exports.selectUserId = async function (uuid) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await userDao.selectUserId(connection, uuid);
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-selectUserId Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//uuid 중복확인
exports.uuidCheck = async function (uuid) {
  const connection = await pool.getConnection(async (conn) => conn);
  const uuidCheckResult = await userDao.selectUuid(connection, uuid);
  connection.release();

  return uuidCheckResult;
};

//닉네임 중복확인
exports.nickNameCheck = async function (nickName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const nickNameCheckResult = await userDao.selectNickName(
      connection,
      nickName
  );
  connection.release();

  return nickNameCheckResult;
};

//이메일 체크
exports.emailCheck = async function (hashedEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUseremail(
      connection,
      hashedEmail
  );
  connection.release();

  return emailCheckResult;
};

// jobCode 존재 여부
exports.checkJobExist = async function (job) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);

    const result = await userDao.checkJobExist(connection, job);
    connection.release();

    return result;
  } catch (err) {
    logger.error(`User-checkUuidExist Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//닉네임 변경이력 확인
exports.checkRecord = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkRecordResult = await userDao.checkRecord(connection, userId);
  connection.release();

  return checkRecordResult;
};

//메인 페이지
exports.getMain = async function (
    userLongitude,
    userLatitude,
    runningTag,
    whetherEndCondition,
    sortCondition,
    distanceCondition,
    genderCondition,
    jobCondition,
    ageCondition
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getMainResult = await userDao.getMain(
      connection,
      userLongitude,
      userLatitude,
      runningTag,
      whetherEndCondition,
      sortCondition,
      distanceCondition,
      genderCondition,
      jobCondition,
      ageCondition
  );
  connection.release();

  return getMainResult;
};

// 유저 인증 여부 확인
exports.checkUserStatus = async function (selectUserId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await userDao.checkUserStatus(connection, selectUserId);
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-checkUserStatus Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 유저 인증 여부 확인
exports.checkUserAuth = async function (userIdFromJWT) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await userDao.checkUserAuth(connection, userIdFromJWT);
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-checkUserAuth Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 인증 이후 최초 접속인지 확인
exports.checkFirst = async function (userIdFromJWT) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await userDao.checkFirst(connection, userIdFromJWT);
    if (result.length > 0) {
      const change = await userDao.changeStatus(connection, userIdFromJWT);
    }
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-checkFirst Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// BM에 있는지 확인
exports.checkAddBM = async function (userId, postId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkAddBMParams = [userId, postId];
    const result = await userDao.checkAddBM(connection, checkAddBMParams);
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-checkAddBM Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

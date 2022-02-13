const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

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
    sortCondition
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postingResult = await userDao.getMain(
      connection,
      userLongitude,
      userLatitude,
      runningTag,
      whetherEndCondition,
      sortCondition
  );
  const jobResult = await userDao.getJob(connection);
  connection.release();

  const mainResult = { postingResult, jobResult };
  return mainResult;
};

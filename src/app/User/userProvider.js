const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

exports.retrieveUserList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const userListResult = await userDao.selectUser(connection);
  connection.release();
  return userListResult;
};
// UUID 존재 여부
exports.checkUuidExist = async function (uuid) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);

    const result = await userDao.checkUuidExist(connection, uuid);
    connection.release();

    return result;
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

//이메일 체크
exports.emailCheck = async function (officeEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUseremail(
      connection,
      officeEmail
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

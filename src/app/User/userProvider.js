const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const userDao = require("./userDao");
const userProvider = require("./userProvider");

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
  ageCondition,
  keywordCondition
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
    ageCondition,
    keywordCondition
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

// 찜 목록 가져오기
exports.getBM = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const bookMarkNumB = await userDao.getBMNum(connection, userId);
  const bookMarkNum = bookMarkNumB[0];
  const bookMarkList = await userDao.getBM(connection, userId);
  for (i = 0; i < bookMarkList.length; i++) {
    const postId = bookMarkList[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    bookMarkList[i].profileUrlList = body;
  }
  connection.release();
  const finalResult = { bookMarkNum, bookMarkList };

  return finalResult;
};

// 마이페이지
exports.getMyPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const myInfo = await userDao.getmyInfo(connection, userId);
  const myPosting = await userDao.getMyPosting(connection, userId);
  const myRunning = await userDao.getMyRunning(connection, userId);
  for (i = 0; i < myPosting.length; i++) {
    const postId = myPosting[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    myPosting[i].profileUrlList = body;
  }
  for (i = 0; i < myRunning.length; i++) {
    const postId = myRunning[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    myRunning[i].profileUrlList = body;
  }

  connection.release();
  const finalResult = { myInfo, myPosting, myRunning };

  return finalResult;
};

// 직군 변경하고 3개월 지났는지 확인
exports.checkTerm = async function (userId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const result = await userDao.checkTerm(connection, userId);
    connection.release();
    return result;
  } catch (err) {
    logger.error(`User-checkAddBM Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

//메인 페이지 v2 둘러보기
exports.getMain2 = async function (
  userLongitude,
  userLatitude,
  runningTag,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getMainResult = await userDao.getMain2(
    connection,
    userLongitude,
    userLatitude,
    runningTag,
    whetherEndCondition,
    sortCondition,
    distanceCondition,
    genderCondition,
    jobCondition,
    ageCondition,
    keywordCondition
  );
  connection.release();
  for (i = 0; i < getMainResult.length; i++) {
    getMainResult[i].userId = null;
    getMainResult[i].bookMark = null;
    getMainResult[i].attandance = null;
    const postId = getMainResult[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    getMainResult[i].profileUrlList = body;
  }

  return getMainResult;
};

// 메인페이지 v2
exports.getMain2Login = async function (
  userLongitude,
  userLatitude,
  runningTag,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition,
  userId
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getMainResult = await userDao.getMain2Login(
    connection,
    userLongitude,
    userLatitude,
    runningTag,
    whetherEndCondition,
    sortCondition,
    distanceCondition,
    genderCondition,
    jobCondition,
    ageCondition,
    keywordCondition,
    userId
  );
  connection.release();
  for (i = 0; i < getMainResult.length; i++) {
    getMainResult[i].userId = null;
    getMainResult[i].attandance = null;
    const postId = getMainResult[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    getMainResult[i].profileUrlList = body;
  }

  return getMainResult;
};

// 찜 목록 가져오기 v2
exports.getBM2 = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const bookMarkNumB = await userDao.getBMNum(connection, userId);
  const bookMarkNum = bookMarkNumB[0];
  const bookMarkList = await userDao.getBM2(connection, userId);
  connection.release();
  for (i = 0; i < bookMarkList.length; i++) {
    bookMarkList[i].DISTANCE = null;
    bookMarkList[i].attandance = null;
    const postId = bookMarkList[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    bookMarkList[i].profileUrlList = body;
  }
  const finalResult = { bookMarkNum, bookMarkList };

  return finalResult;
};

// 마이페이지 v2
exports.getMyPage2 = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const myInfo = await userDao.getmyInfo(connection, userId);
  const myPosting = await userDao.getMyPosting2(connection, userId);
  const myRunning = await userDao.getMyRunning2(connection, userId);
  connection.release();
  for (i = 0; i < myPosting.length; i++) {
    myPosting[i].DISTANCE = null;
    myPosting[i].attandance = null;
    const postId = myPosting[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    myPosting[i].profileUrlList = body;
  }
  for (i = 0; i < myRunning.length; i++) {
    myRunning[i].DISTANCE = null;
    const postId = myRunning[i].postId;
    const body = await userDao.getProfileUrl(connection, postId);
    myRunning[i].profileUrlList = body;
  }
  const finalResult = { myInfo, myPosting, myRunning };

  return finalResult;
};

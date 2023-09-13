const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const userDao = require("../Dao/userDao");
const postingDao = require("../Dao/postingDao");
const userProvider = require("./userProvider");

// UUID 존재 여부
exports.checkUuidExist = async function (uuid) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const uuidCheckResult = await userDao.selectUuid(connection, uuid);

    return uuidCheckResult;
  } catch (err) {
    await logger.error(`User-checkUuidExist Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};
// 유저 고유 아이디 조회
exports.selectUserId = async function (uuid) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.selectUserId(connection, uuid);

    return result;
  } catch (err) {
    await logger.error(`User-selectUserId Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//uuid 중복확인
exports.uuidCheck = async function (uuid) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const uuidCheckResult = await userDao.selectUuid(connection, uuid);

    return uuidCheckResult;
  } catch (err) {
    await logger.error(`User-uuidCheck Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//닉네임 중복확인
exports.nickNameCheck = async function (nickName) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const nickNameCheckResult = await userDao.selectNickName(
      connection,
      nickName
    );

    return nickNameCheckResult;
  } catch (err) {
    await logger.error(`User-nickNameCheck Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//이메일 체크
exports.emailCheck = async function (hashedEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const emailCheckResult = await userDao.selectUseremail(
      connection,
      hashedEmail
    );

    return emailCheckResult;
  } catch (err) {
    await logger.error(`User-emailCheck Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// jobCode 존재 여부
exports.checkJobExist = async function (job) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.checkJobExist(connection, job);

    return result;
  } catch (err) {
    await logger.error(`User-checkJobExist Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//닉네임 변경이력 확인
exports.checkRecord = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkRecordResult = await userDao.checkRecord(connection, userId);

    return checkRecordResult;
  } catch (err) {
    await logger.error(`User-checkRecord Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
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
  try {
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

    return getMainResult;
  } catch (err) {
    await logger.error(`User-getMain Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 유저 인증 여부 확인
exports.checkUserStatus = async function (selectUserId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.checkUserStatus(connection, selectUserId);

    return result;
  } catch (err) {
    await logger.error(`User-checkUserStatus Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 유저 인증 여부 확인
exports.checkUserAuth = async function (userIdFromJWT) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.checkUserAuth(connection, userIdFromJWT);

    return result;
  } catch (err) {
    await logger.error(`User-checkUserAuth Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// // 인증 이후 최초 접속인지 확인- 폐기
// exports.checkFirst = async function (userIdFromJWT) {
//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const result = await userDao.checkFirst(connection, userIdFromJWT);
//     if (result.length > 0) {
//       const change = await userDao.changeStatus(connection, userIdFromJWT);
//     }
//     connection.release();
//     return result;
//   } catch (err) {
//     logger.error(`User-checkFirst Provider error: ${err.message}`);
//     return errResponse(baseResponse.DB_ERROR);
//   }
// };

// BM에 있는지 확인
exports.checkAddBM = async function (userId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkAddBMParams = [userId, postId];
    const result = await userDao.checkAddBM(connection, checkAddBMParams);

    return result;
  } catch (err) {
    await logger.error(`User-checkAddBM Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 찜 목록 가져오기
exports.getBM = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const bookMarkNumB = await userDao.getBMNum(connection, userId);
    const bookMarkNum = bookMarkNumB[0];
    const bookMarkList = await userDao.getBM(connection, userId);
    for (i = 0; i < bookMarkList.length; i++) {
      const postId = bookMarkList[i].postId;
      const body = await userDao.getProfileUrl(connection, postId);
      bookMarkList[i].profileUrlList = body;
    }
    const finalResult = { bookMarkNum, bookMarkList };

    return finalResult;
  } catch (err) {
    await logger.error(`User-getBM Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 마이페이지
exports.getMyPage = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
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

    const finalResult = { myInfo, myPosting, myRunning };

    return finalResult;
  } catch (err) {
    await logger.error(`User-getMyPage Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 직군 변경하고 3개월 지났는지 확인
exports.checkTerm = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.checkTerm(connection, userId);

    return result;
  } catch (err) {
    await logger.error(`User-checkTerm Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

//메인 페이지 v2 둘러보기
exports.getMain2 = async function (
  userLongitude,
  userLatitude,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition,
  runningTagCondition,
  page,
  pageSize
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getMainResult = await userDao.getMain2(
      connection,
      userLongitude,
      userLatitude,
      whetherEndCondition,
      sortCondition,
      distanceCondition,
      genderCondition,
      jobCondition,
      ageCondition,
      keywordCondition,
      runningTagCondition,
      page,
      pageSize
    );

    if (getMainResult.length !== 0) {
      for (i = 0; i < getMainResult.length; i++) {
        getMainResult[i].userId = null;
        getMainResult[i].bookMark = null;
        getMainResult[i].attendance = null;
        const postId = getMainResult[i].postId;
        const body = await userDao.getProfileUrl(connection, postId);
        getMainResult[i].profileUrlList = body;
      }
    }

    return getMainResult;
  } catch (err) {
    await logger.error(`User-getMain2 Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 메인페이지 v2
exports.getMain2Login = async function (
  userLongitude,
  userLatitude,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition,
  runningTagCondition,
  userId,
  page,
  pageSize
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getMainResult = await userDao.getMain2Login(
      connection,
      userLongitude,
      userLatitude,
      whetherEndCondition,
      sortCondition,
      distanceCondition,
      genderCondition,
      jobCondition,
      ageCondition,
      keywordCondition,
      runningTagCondition,
      userId,
      page,
      pageSize
    );

    if (getMainResult.length !== 0) {
      for (i = 0; i < getMainResult.length; i++) {
        getMainResult[i].userId = null;
        getMainResult[i].attendance = null;
        const postId = getMainResult[i].postId;    
        const body = await userDao.getProfileUrl(connection, postId);
        getMainResult[i].profileUrlList = body;
      }
    }

    return getMainResult;
  } catch (err) {
    await logger.error(`User-getMain2Login Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 찜 목록 가져오기 v2
exports.getBM2 = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    // const bookMarkNumB = await userDao.getBMNum(connection, userId);
    // const bookMarkNum = bookMarkNumB[0];
    const bookMarkList = await userDao.getBM2(connection, userId);

    if (bookMarkList.length !== 0) {
      for (i = 0; i < bookMarkList.length; i++) {
        bookMarkList[i].DISTANCE = null;
        bookMarkList[i].attendance = null;
        const postId = bookMarkList[i].postId;
        const body = await userDao.getProfileUrl(connection, postId);
        bookMarkList[i].profileUrlList = body;
      }
    }

    // const finalResult = { bookMarkNum, bookMarkList };
    const finalResult = { bookMarkList };

    return finalResult;
  } catch (err) {
    await logger.error(`User-getBM2 Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 마이페이지 v2
exports.getMyPage2 = async function (userId, mobileType, appVersion) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    let myInfo;
    if (!mobileType) {
      myInfo = await userDao.getmyInfo(connection, userId);
    } else {
      myInfo = await userDao.getmyInfoV2(connection, userId);
    }
    // const runningInfo = await userDao.getRunningInfo(connection, userId);
    const myPosting = await userDao.getMyPosting2(connection, userId);
    const myRunning = await userDao.getMyRunning2(connection, userId);

    if (myPosting.length !== 0) {
      for (i = 0; i < myPosting.length; i++) {
        myPosting[i].DISTANCE = null;
        myPosting[i].attendance = null;
        const postId = myPosting[i].postId;
        const profileUrlList = await userDao.getProfileUrl(connection, postId);
        const runnerList = await postingDao.getRunner(connection, postId);
        const attendTimeOver = await postingDao.getAttendTimeOver(
          connection,
          postId
        );
        myPosting[i].profileUrlList = profileUrlList;
        myPosting[i].runnerList = runnerList;
        myPosting[i].attendTimeOver = attendTimeOver;
      }
    }

    if (myRunning.length !== 0) {
      for (i = 0; i < myRunning.length; i++) {
        myRunning[i].DISTANCE = null;
        const postId = myRunning[i].postId;
        const body = await userDao.getProfileUrl(connection, postId);
        myRunning[i].profileUrlList = body;
      }
    }

    const finalResult = { myInfo, myPosting, myRunning };

    return finalResult;
  } catch (err) {
    await logger.error(`User-getMyPage2 Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 활동 기록 조회
exports.getRecord = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const myInfo = await userDao.getmyInfoSimple(connection, userId);
    const myRecord = await userDao.getMyRunning2(connection, userId);

    if (myRecord.length !== 0) {
      for (i = 0; i < myRecord.length; i++) {
        myRecord[i].DISTANCE = null;
        const postId = myRecord[i].postId;
        const body = await userDao.getProfileUrl(connection, postId);
        myRecord[i].profileUrlList = body;
      }
    }

    const finalResult = { myInfo, myRecord };

    return finalResult;
  } catch (err) {
    await logger.error(`User-getRecord Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 유저 이용 제한 상태 확인
exports.checkUserRestricted = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.checkUserRestricted(connection, userId);

    return result;
  } catch (err) {
    await logger.error(
      `User-checkUserRestricted Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

// 새로운 푸쉬 알림 메시지 여부 조회
exports.getWhetherNewAlarms = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const getWhetherNewAlarmsResult = await userDao.getWhetherNewAlarms(
      connection,
      userId
    );

    return getWhetherNewAlarmsResult;
  } catch (err) {
    await logger.error(
      `User-getWhetherNewAlarms Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};


// 유저 이용 제한 상태 확인
exports.getUserGender = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const result = await userDao.getUserGender(connection, userId);

    return result;
  } catch (err) {
    await logger.error(
      `User-getUserGender Provider error: ${err.message}`
    );
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};
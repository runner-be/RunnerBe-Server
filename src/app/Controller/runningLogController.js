const jwtMiddleware = require("../../../config/jwtMiddleware");
const runningLogService = require("../Service/runningLogService.js");
const runningLogProvider = require("../Provider/runningLogProvider");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");

/**
 * API No. 46
 * API Name : 러닝로그 작성 API
 * [POST] /runninglogs/:userId
 */
exports.createPostingLog = async function (req, res) {
  /**
   * Header : jwt
   * Body: runnedDate, gatheringId, stampCode, contents, imageUrl, weatherDegree, weatherIcon, isOpened
   */
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;
  const {
    runningDate,
    gatheringId,
    stampCode,
    contents,
    imageUrl,
    weatherDegree,
    weatherIcon,
    isOpened,
  } = req.body;

  // 필수 값 : 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!runningDate) return res.send(response(baseResponse.RUNNING_DATE_EMPTY));
  if (!stampCode) return res.send(response(baseResponse.STAMP_CODE_EMPTY));
  if (!weatherDegree)
    return res.send(response(baseResponse.WEATHER_DEGREE_EMPTY));

  // 길이 체크
  if (contents) {
    if (contents.length > 500) {
      return res.send(response(baseResponse.POSTING_TEXT_LENGTH));
    }
  }

  // 유효성 검사
  const runningDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!runningDate.match(runningDateRegex))
    return res.send(response(baseResponse.RUNNING_DATE_REGEX_WRONG));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    const createLogResponse = await runningLogService.createRunningLog(
      userId,
      runningDate,
      gatheringId,
      stampCode,
      contents,
      imageUrl,
      weatherDegree,
      weatherIcon,
      isOpened
    );
    return res.send(createLogResponse);
  }
};

/**
 * API No. 47
 * API Name : 러닝로그 수정 API
 * [PATCH] /runningLogs/:userId/:logId
 */
exports.updatePostingLog = async function (req, res) {
  /**
   * Header : jwt
   * Body: runnedDate, gatheringId, stampCode, contents, imageUrl, weatherDegree, weatherIcon, isOpened
   */
  const userId = req.params.userId;
  const logId = req.params.logId;
  const userIdFromJWT = req.verifiedToken.userId;
  const {
    runningDate,
    gatheringId,
    stampCode,
    contents,
    imageUrl,
    weatherDegree,
    weatherIcon,
    isOpened,
  } = req.body;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!logId) return res.send(response(baseResponse.LOGID_EMPTY));
  if (!runningDate) return res.send(response(baseResponse.RUNNING_DATE_EMPTY));
  if (!stampCode) return res.send(response(baseResponse.STAMP_CODE_EMPTY));
  if (!weatherDegree)
    return res.send(response(baseResponse.WEATHER_DEGREE_EMPTY));

  // 길이 체크
  if (contents) {
    if (contents.length > 500) {
      return res.send(response(baseResponse.POSTING_TEXT_LENGTH));
    }
  }

  // 유효성 검사
  const runningDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!runningDate.match(runningDateRegex))
    return res.send(response(baseResponse.RUNNING_DATE_REGEX_WRONG));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await runningLogProvider.checkLogWriter(
    logId,
    userIdFromJWT
  );
  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      const updateLogResponse = await runningLogService.patchPosting(
        runningDate,
        gatheringId,
        stampCode,
        contents,
        imageUrl,
        weatherDegree,
        weatherIcon,
        isOpened,
        logId
      );
      return res.send(updateLogResponse);
    }
  }
};

/**
 * API No. 48
 * API Name : 러닝로그 삭제 API
 * [DELETE] /runningLogs/:userId/:logId
 */
exports.deletePostingLog = async function (req, res) {
  /**
   * Header : jwt
   */
  const userId = req.params.userId;
  const logId = req.params.logId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!logId) return res.send(response(baseResponse.LOGID_EMPTY));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await runningLogProvider.checkLogWriter(
    logId,
    userIdFromJWT
  );
  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      const deleteRunningLogResponse = await runningLogService.dropPosting(
        logId
      );
      return res.send(deleteRunningLogResponse);
    }
  }
};

/**
 * API No. 49
 * API Name : 러닝로그 전체 조회 API
 * [GET] /runningLogs/:userId
 * Query string : year(연), month(월)
 */
exports.getRunningLog = async function (req, res) {
  // Query String 값
  const year = req.query.year; // year(연)
  const month = req.query.month; // month(월)
  const userId = req.params.userId;

  // 빈 값 체크
  if (!year) return res.send(response(baseResponse.YEAR_EMPTY));
  if (!month) return res.send(response(baseResponse.MONTH_EMPTY));
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));

  const getWholeRunningLog = await runningLogProvider.getRunningLog(
    year,
    month,
    userId
  );
  return res.send(response(baseResponse.SUCCESS, getWholeRunningLog));
};

/**
 * API No. 50
 * API Name : 러닝로그 상세 조회 API
 * [GET] /runningLogs/:userId/detail/:logId
 */
exports.detailRunningLog = async function (req, res) {
  /**
   * Header : jwt
   */
  const userId = req.params.userId;
  const logId = req.params.logId;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!logId) return res.send(response(baseResponse.LOGID_EMPTY));

  //게시글 있는지 확인
  const checkPostingResult = await runningLogProvider.checkPosting(logId);

  // jwt로 userId 확인
  if (checkPostingResult.length === 0) {
    return errResponse(baseResponse.RUNNINGLOG_NOT_VALID_LOGID);
  } else {
    const getDetailRunningLog = await runningLogProvider.getDetailRunningLog(
      userId,
      logId
    );
    return res.send(response(baseResponse.SUCCESS, getDetailRunningLog));
  }
};

/**
 * API No. 51
 * API Name : 함께한 러너 리스트 조회 API
 * [GET] /runninglogs/:userId/partners/:gatheringId
 */
exports.getRunningPartners = async function (req, res) {
  /**
   * Header : jwt
   */
  const userId = req.params.userId;
  const gatheringId = req.params.gatheringId;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!gatheringId) return res.send(response(baseResponse.LOGID_EMPTY));

  // //게시글 있는지 확인
  // const checkPostingResult = await runningLogProvider.checkPosting(logId);

  // jwt로 userId 확인
  // if (checkPostingResult.length === 0) {
  //   return errResponse(baseResponse.RUNNINGLOG_NOT_VALID_LOGID);
  // } else {
  const getRunners = await runningLogProvider.getRunners(userId, gatheringId);
  return res.send(response(baseResponse.SUCCESS, getRunners));
  // }
};

/**
 * API No. 52
 * API Name : 함께한 러너에게 스탬프 찍기 API
 * [POST] /runninglogs/:userId/partners/:logId
 */
exports.giveStampToPartners = async function (req, res) {
  /**
   * Header : jwt
   * Body: partnerId, stampCode
   */
  const userId = req.params.userId;
  const logId = req.params.logId;
  const targetId = req.body.targetId;
  const stampCode = req.body.stampCode;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!logId) return res.send(response(baseResponse.LOGID_EMPTY));
  if (!targetId) return res.send(response(baseResponse.TARGET_ID_EMPTY));
  if (!stampCode) return res.send(response(baseResponse.STAMP_CODE_EMPTY));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await runningLogProvider.checkLogWriter(
    logId,
    userIdFromJWT
  );

  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      const giveStampResponse = await runningLogService.postingStamp(
        logId,
        userId,
        targetId,
        stampCode
      );
      return res.send(giveStampResponse);
    }
  }
};

/**
 * API No. 53
 * API Name : 함께한 러너에게 스탬프 찍기 수정 API
 * [PATCH] /runninglogs/:userId/partners/:logId
 */
exports.changeStampToPartners = async function (req, res) {
  /**
   * Header : jwt
   * Body: partnerId, stampCode
   */
  const userId = req.params.userId;
  const logId = req.params.logId;
  const targetId = req.body.targetId;
  const stampCode = req.body.stampCode;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!logId) return res.send(response(baseResponse.LOGID_EMPTY));
  if (!targetId) return res.send(response(baseResponse.TARGET_ID_EMPTY));
  if (!stampCode) return res.send(response(baseResponse.STAMP_CODE_EMPTY));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await runningLogProvider.checkLogWriter(
    logId,
    userIdFromJWT
  );

  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      const changeStampResponse = await runningLogService.changeRunningStamp(
        logId,
        userId,
        targetId,
        stampCode
      );
      return res.send(changeStampResponse);
    }
  }
};

/**
 * API No. 54
 * API Name : 스탬프 정보 전체 조회 API
 * [GET] /runningLogs/stamp
 */
exports.getStampList = async function (req, res) {
  const stampResponse = await runningLogProvider.viewStampList();
  return res.send(response(baseResponse.SUCCESS, stampResponse));
};

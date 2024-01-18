const jwtMiddleware = require("../../../config/jwtMiddleware");
const postingProvider = require("../Provider/postingProvider");
const messageProvider = require("../Provider/messageProvider");
const postingService = require("../Service/postingService");
const userProvider = require("../Provider/userProvider");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const { emit } = require("nodemon");

/**
 * API No. 6
 * API Name : 게시글 작성(러닝 모임 생성) API
 * [POST] /postings/:userId
 */
exports.createPosting = async function (req, res) {
  /**
   * Header : jwt
   * Body: title, gatheringTime, runningTime, gatherLongitude, gatherLatitude, locationInfo, runningTag, ageMin, ageMax, peopleNum, contents, runnerGender, paceGrade, afterParty
   */
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;
  const {
    title,
    gatheringTime,
    runningTime,
    gatherLongitude,
    gatherLatitude,
    locationInfo,
    runningTag,
    ageMin,
    ageMax,
    peopleNum,
    contents,
    runnerGender,
    paceGrade,
    afterParty,
  } = req.body; //구조분해 순서 유의할 것... 삽질

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!title) return res.send(response(baseResponse.POSTING_TITLE_EMPTY));
  if (!gatheringTime)
    return res.send(response(baseResponse.POSTING_GATHERINGTIME_EMPTY));
  if (!runningTime)
    return res.send(response(baseResponse.POSTING_RUNNINGTIME_EMPTY));
  if (!gatherLongitude)
    return res.send(response(baseResponse.POSTING_LONGITUDE_EMPTY));
  if (!gatherLatitude)
    return res.send(response(baseResponse.POSTING_LATITUDE_EMPTY));
  if (!locationInfo)
    return res.send(response(baseResponse.POSTING_LOCATION_EMPTY));
  if (!runningTag) return res.send(response(baseResponse.POSTING_WHEN_EMPTY));
  if (!ageMin) return res.send(response(baseResponse.POSTING_AGEMIN_EMPTY));
  if (!ageMax) return res.send(response(baseResponse.POSTING_AGEMAX_EMPTY));
  if (!peopleNum)
    return res.send(response(baseResponse.POSTING_PEOPLENUM_EMPTY));
  if (!runnerGender)
    return res.send(response(baseResponse.POSTING_GENDER_EMPTY));
  if (!paceGrade) return res.send(response(baseResponse.POSTING_PACE_EMPTY));
  if (!afterParty)
    return res.send(response(baseResponse.POSTING_AFTERPARTY_EMPTY));

  // 길이 체크
  if (title.length > 30)
    return res.send(response(baseResponse.POSTING_TITLE_LENGTH));
  if (contents) {
    if (contents.length > 500) {
      return res.send(response(baseResponse.POSTING_TEXT_LENGTH));
    }
  }
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(ageMin) === true)
    return res.send(response(baseResponse.USER_AGEMIN_NOTNUM));
  if (isNaN(ageMax) === true)
    return res.send(response(baseResponse.USER_AGEMAX_NOTNUM));
  if (isNaN(peopleNum) === true)
    return res.send(response(baseResponse.USER_PEOPLENUM_NOTNUM));
  if (isNaN(afterParty) === true)
    return res.send(response(baseResponse.POSTING_AFTERPARTY_NOTNUM));

  // 유효성 검사
  const whenTagList = ["A", "B", "H"]; //A : 퇴근 후, B : 출근 전, H : 휴일
  const genderList = ["A", "M", "F"]; //A : 전체, M : 남성, F : 여성
  const paceList = ["beginner", "average", "high", "master"];
  if (!whenTagList.includes(runningTag))
    return res.send(response(baseResponse.WHEN_IS_NOT_VALID));
  if (!genderList.includes(runnerGender))
    return res.send(response(baseResponse.GENDER_IS_NOT_VALID));
  if (!paceList.includes(paceGrade))
    return res.send(response(baseResponse.PACE_IS_NOT_VALID));

  // 자신과 다른 성별 게시 불가
  if (runnerGender !== "A") {
    const userGender = await userProvider.getUserGender(userId);
    if (userGender !== runnerGender) {
      return res.send(response(baseResponse.GENDER_NOT_ALLOWED));
    }
  }

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    // if (checkUserAuth.length === 0) {
    //   return res.send(response(baseResponse.USER_NON_AUTH));
    // }
    const postingResponse = await postingService.createPosting(
      userId,
      title,
      gatheringTime,
      runningTime,
      gatherLongitude,
      gatherLatitude,
      locationInfo,
      runningTag,
      ageMin,
      ageMax,
      peopleNum,
      contents,
      runnerGender,
      paceGrade,
      afterParty
    );
    return res.send(postingResponse);
  }
};

/**
 * API No. 8
 * API Name : 게시글 상세페이지 API
 * [GET] /postings/:postId/:userId
 */
exports.getPosting = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : postId, userId
   */
  const postId = req.params.postId;
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    // if (checkUserAuth.length === 0) {
    //   return res.send(response(baseResponse.USER_NON_AUTH));
    // }
    // 해당 게시글 찜 했는지 확인
    const checkBookMark = await postingProvider.checkBookMark(userId, postId);

    // 작성자, 비작성자 구분하기
    // 작성자는 참여 러너와 신청한 러너 둘 다 뜸
    const checkWriter = await postingProvider.checkWriter(postId, userId);
    if (checkWriter.length > 0) {
      const getPostingWriterResponse = await postingProvider.getPostingWriter(
        postId
      );
      if (checkBookMark.length != 0) {
        return res.send(
          response(baseResponse.SUCCESS_WRITER_BMY, getPostingWriterResponse)
        );
      } else {
        return res.send(
          response(baseResponse.SUCCESS_WRITER_BMN, getPostingWriterResponse)
        );
      }
    } else {
      const getPostingResponse = await postingProvider.getPosting(postId);

      //이미 신청했는지 확인하기
      const checkAlreadyapplyNotD = await messageProvider.checkAlreadyapplyNotD(
        userId,
        postId
      );

      if (checkAlreadyapplyNotD.length != 0) {
        if (checkBookMark.length != 0) {
          return res.send(
            response(baseResponse.SUCCESS_NON_WRITER_AA_BMY, getPostingResponse)
          );
        } else {
          return res.send(
            response(baseResponse.SUCCESS_NON_WRITER_AA_BMN, getPostingResponse)
          );
        }
      } else {
        if (checkBookMark.length != 0) {
          return res.send(
            response(baseResponse.SUCCESS_NON_WRITER_BMY, getPostingResponse)
          );
        } else {
          return res.send(
            response(baseResponse.SUCCESS_NON_WRITER_BMN, getPostingResponse)
          );
        }
      }
    }
  }
};

/**
 * API No. 10
 * API Name : 마감하기(작성자) API
 * [GET] /postings/:postId/closing
 */
exports.closePosting = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : postId
   */
  const postId = req.params.postId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  // 인증 대기 회원 확인
  // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
  // if (checkUserAuth.length === 0) {
  //   return res.send(response(baseResponse.USER_NON_AUTH));
  // }

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await postingProvider.checkWriter(postId, userIdFromJWT);
  if (checkWriter.length > 0) {
    const closePostingResult = await postingProvider.closePosting(postId);
    return res.send(response(baseResponse.SUCCESS));
  } else {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  }
};

/**
 * API No. 11
 * API Name : 게시글 수정 API
 * [POST] /postings/:postId
 */
exports.patchPosting = async function (req, res) {
  /**
   * Header : jwt
   * Body: title, gatheringTime, runningTime, gatherLongitude, gatherLatitude, locationInfo, runningTag, ageMin, ageMax, peopleNum, contents, runnerGender, paceGrade, afterParty
   */
  const userId = req.params.userId;
  const postId = req.params.postId;
  const userIdFromJWT = req.verifiedToken.userId;
  const {
    title,
    gatheringTime,
    runningTime,
    gatherLongitude,
    gatherLatitude,
    locationInfo,
    runningTag,
    ageMin,
    ageMax,
    peopleNum,
    contents,
    runnerGender,
    paceGrade,
    afterParty,
  } = req.body;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));
  if (!title) return res.send(response(baseResponse.POSTING_TITLE_EMPTY));
  if (!gatheringTime)
    return res.send(response(baseResponse.POSTING_GATHERINGTIME_EMPTY));
  if (!runningTime)
    return res.send(response(baseResponse.POSTING_RUNNINGTIME_EMPTY));
  if (!gatherLongitude)
    return res.send(response(baseResponse.POSTING_LONGITUDE_EMPTY));
  if (!gatherLatitude)
    return res.send(response(baseResponse.POSTING_LATITUDE_EMPTY));
  if (!locationInfo)
    return res.send(response(baseResponse.POSTING_LOCATION_EMPTY));
  if (!runningTag) return res.send(response(baseResponse.POSTING_WHEN_EMPTY));
  if (!ageMin) return res.send(response(baseResponse.POSTING_AGEMIN_EMPTY));
  if (!ageMax) return res.send(response(baseResponse.POSTING_AGEMAX_EMPTY));
  if (!peopleNum)
    return res.send(response(baseResponse.POSTING_PEOPLENUM_EMPTY));
  if (!runnerGender)
    return res.send(response(baseResponse.POSTING_GENDER_EMPTY));
  if (!paceGrade) return res.send(response(baseResponse.POSTING_PACE_EMPTY));
  if (!afterParty)
    return res.send(response(baseResponse.POSTING_AFTERPARTY_EMPTY));

  // 길이 체크
  if (title.length > 30)
    return res.send(response(baseResponse.POSTING_TITLE_LENGTH));
  if (contents) {
    if (contents.length > 500) {
      return res.send(response(baseResponse.POSTING_TEXT_LENGTH));
    }
  }
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));
  if (isNaN(ageMin) === true)
    return res.send(response(baseResponse.USER_AGEMIN_NOTNUM));
  if (isNaN(ageMax) === true)
    return res.send(response(baseResponse.USER_AGEMAX_NOTNUM));
  if (isNaN(peopleNum) === true)
    return res.send(response(baseResponse.USER_PEOPLENUM_NOTNUM));
  if (isNaN(afterParty) === true)
    return res.send(response(baseResponse.POSTING_AFTERPARTY_NOTNUM));

  // 유효성 검사
  const whenTagList = ["A", "B", "H"]; //A : 퇴근 후, B : 출근 전, H : 휴일
  const genderList = ["A", "M", "F"]; //A : 전체, M : 남성, F : 여성
  const paceList = ["beginner", "average", "high", "master"];
  if (!whenTagList.includes(runningTag))
    return res.send(response(baseResponse.WHEN_IS_NOT_VALID));
  if (!genderList.includes(runnerGender))
    return res.send(response(baseResponse.GENDER_IS_NOT_VALID));
  if (!paceList.includes(paceGrade))
    return res.send(response(baseResponse.PACE_IS_NOT_VALID));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await postingProvider.checkWriter(postId, userIdFromJWT);
  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      // 인증 대기 회원 확인
      // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
      // if (checkUserAuth.length === 0) {
      //   return res.send(response(baseResponse.USER_NON_AUTH));
      // }
      const patchPostingResponse = await postingService.patchPosting(
        title,
        gatheringTime,
        runningTime,
        gatherLongitude,
        gatherLatitude,
        locationInfo,
        runningTag,
        ageMin,
        ageMax,
        peopleNum,
        contents,
        runnerGender,
        paceGrade,
        afterParty,
        postId
      );
      return res.send(patchPostingResponse);
    }
  }
};

/**
 * API No. 12
 * API Name : 게시글 삭제 API
 * [PATCH] /postings/:postId/drop
 */
exports.dropPosting = async function (req, res) {
  /**
   * Header : jwt
   */
  const userId = req.params.userId;
  const postId = req.params.postId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  //jwt로 들어온 userId가 작성자 id와 일치하는지 확인
  const checkWriter = await postingProvider.checkWriter(postId, userIdFromJWT);
  console.log(checkWriter);
  if (checkWriter.length == 0) {
    return res.send(response(baseResponse.USER_NOT_WRITER));
  } else {
    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
      return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
      // 인증 대기 회원 확인
      // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
      // if (checkUserAuth.length === 0) {
      //   return res.send(response(baseResponse.USER_NON_AUTH));
      // }
      const dropPostingResponse = await postingService.dropPosting(postId);
      return res.send(dropPostingResponse);
    }
  }
};

/**
 * API No. 25
 * API Name : 게시글 신고 API
 * [POST] /postings/:postId/report/:userId
 */
exports.reportPosting = async function (req, res) {
  /**
   * Header : jwt
   * Path variable : postId, userId
   */
  const userId = req.params.userId;
  const postId = req.params.postId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    const Response = await postingService.reportPosting(userId, postId);
    return res.send(Response);
  }
};

/**
 * API No. 31
 * API Name : 게시글 상세페이지 v2 API
 * [GET] /postings/v2/:postId/:userId
 */
exports.getPosting2 = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : postId, userId
   */
  const postId = req.params.postId;
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  // postId 존재 확인
  const checkPostId = await postingProvider.checkPostId(postId);
  if (checkPostId.length === 0) {
    return res.send(response(baseResponse.POST_ID_NOT_EXIST));
  }

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    // const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    // if (checkUserAuth.length === 0) {
    //   return res.send(response(baseResponse.USER_NON_AUTH));
    // }

    // 게시글 작성자 탈퇴 및 정지 확인
    const checkPostUser = await postingProvider.checkPostUser(postId);
    if (checkPostUser.length === 0) {
      return res.send(response(baseResponse.POST_USER_NOT_EXIST));
    }

    // 작성자, 비작성자 구분하기
    // 작성자는 참여 러너와 신청한 러너 둘 다 뜸
    const checkWriter = await postingProvider.checkWriter(postId, userId);
    if (checkWriter.length > 0) {
      const getPostingWriterResponse = await postingProvider.getPostingWriter2(
        postId
      );
      return res.send(
        response(baseResponse.SUCCESS_WRITER_BMY, getPostingWriterResponse)
      );
    } else {
      const getPostingResponse = await postingProvider.getPosting2(postId);

      //이미 신청했는지 확인하기
      const checkAlreadyapplyNotD = await messageProvider.checkAlreadyapplyNotD(
        userId,
        postId
      );
      if (checkAlreadyapplyNotD.length != 0) {
        return res.send(
          response(baseResponse.SUCCESS_NON_WRITER_AA_BMY, getPostingResponse)
        );
      } else {
        return res.send(
          response(baseResponse.SUCCESS_NON_WRITER_BMY, getPostingResponse)
        );
      }
    }
  }
};

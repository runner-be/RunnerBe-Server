const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const secret = require("../../../config/secret");
const { logger } = require("../../../config/winston"); // 디버깅용

const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const { emit } = require("nodemon");

/**
 * API No. 0
 * API Name : 테스트 API, RDS 연결 확인
 * [GET] /test
 */
exports.getTest = async function (req, res) {
  const userListResult = await userProvider.retrieveUserList();
  return res.send(response(baseResponse.SUCCESS, userListResult));
};

/**
 * API No. 0
 * API Name : 테스트용 jwt 발급 API
 * [GET] /jwtTest/:userId
 */
exports.getJwt = async function (req, res) {
  const jwtuserId = req.params.userId;
  let token = await jwt.sign(
    {
      userId: jwtuserId,
    },
    secret.jwtsecret,
    {
      expiresIn: "365d",
      subject: "userInfo",
    }
  );
  return res.send(response(baseResponse.SUCCESS, token));
};

/**
 * API No. 0
 * API Name : 테스트용 회원 삭제 API
 * [GET] /FORTESTdeleteUser/:uuid
 */
exports.deleteUser = async function (req, res) {
  const uuid = req.params.uuid;
  const deleteResult = await userProvider.deleteUser(uuid);
  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 1
 * API Name : 카카오 로그인 API
 * [POST] /users/kakao-login
 */

exports.kakaoLogin = async function (req, res) {
  const { accessToken } = req.body;

  if (!accessToken)
    return res.send(errResponse(baseResponse.ACCESS_TOKEN_IS_EMPTY)); // 2084

  try {
    let kakao_profile;

    try {
      kakao_profile = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return res.send(errResponse(baseResponse.ACCESS_TOKEN_IS_NOT_VALID)); // 2085
    }
    const uuid = kakao_profile.data.id.toString();

    const checkUuid = await userProvider.checkUuidExist(uuid);

    if (checkUuid.length > 0) {
      const selectUserId = await userProvider.selectUserId(uuid);
      let token = await jwt.sign(
        {
          userId: selectUserId,
        },
        secret.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );

      const checkUserStatus = await userProvider.checkUserStatus(selectUserId); //Y이면 length 1이상
      if (checkUserStatus.length > 0) {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "소셜로그인에 성공하셨습니다.",
          })
        );
      } else {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_NON_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "인증 대기 회원입니다.",
          })
        );
      }
    } else {
      return res.send(
        response(baseResponse.SUCCESS_NON_MEMBER, {
          message: "회원가입이 가능합니다.",
          uuid,
        })
      );
    }
  } catch (err) {
    res.send(errResponse(baseResponse.SUCCESS, err));
    return errResponse(baseResponse.DB_ERROR);
  }
};

/**
 * API No. 2
 * API Name : 네이버 로그인 API
 * [POST] /users/naver-login
 */
exports.naverLogin = async function (req, res) {
  const { accessToken } = req.body;

  if (!accessToken)
    return res.send(errResponse(baseResponse.ACCESS_TOKEN_IS_EMPTY)); // 2084

  try {
    let naver_profile;
    try {
      naver_profile = await axios.get("https://openapi.naver.com/v1/nid/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      return res.send(errResponse(baseResponse.ACCESS_TOKEN_IS_NOT_VALID)); // 2085
    }

    const uuid = naver_profile.data.response.id;
    const checkUuid = await userProvider.checkUuidExist(uuid);

    if (checkUuid.length > 0) {
      const selectUserId = await userProvider.selectUserId(uuid);

      let token = await jwt.sign(
        {
          userId: selectUserId,
        },
        secret.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );
      const checkUserStatus = await userProvider.checkUserStatus(selectUserId); //Y이면 length 1이상
      if (checkUserStatus.length > 0) {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "소셜로그인에 성공하셨습니다.",
          })
        );
      } else {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_NON_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "인증 대기 회원입니다.",
          })
        );
      }
    } else {
      return res.send(
        response(baseResponse.SUCCESS_NON_MEMBER, {
          message: "회원가입이 가능합니다.",
          uuid,
        })
      );
    }
  } catch (err) {
    res.send(errResponse(baseResponse.SUCCESS, err));
    return errResponse(baseResponse.DB_ERROR);
  }
};

/**
 * API No. 3
 * API Name : 유저 생성 (회원가입) API // 이메일, 비밀번호, 전화번호, 닉네임
 * [POST] /users
 */
exports.postUsers = async function (req, res) {
  /**
   * Body: uuid, nickName, birthday, gender, job, idCardImageUrl, officeEmail, deviceToken
   */
  const {
    uuid,
    nickName,
    birthday,
    gender,
    job,
    idCardImageUrl,
    officeEmail,
    deviceToken,
  } = req.body;

  // 필수 값 : 빈 값 체크
  if (!uuid) return res.send(response(baseResponse.SIGNUP_UUID_EMPTY));
  if (!nickName) return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
  if (!birthday) return res.send(response(baseResponse.SIGNUP_BIRTHDAY_EMPTY));
  if (!gender) return res.send(response(baseResponse.SIGNUP_GENDER_EMPTY));
  if (!job) return res.send(response(baseResponse.SIGNUP_JOB_EMPTY));
  if (!deviceToken) return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

  // 길이 체크
  if (nickName.length > 10)
    return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
  if (gender.length != 1)
    return res.send(response(baseResponse.SIGNUP_GENDER_LENGTH));
  if (job.length != 3)
    return res.send(response(baseResponse.SIGNUP_JOB_LENGTH));

  if (!officeEmail) {
    //신분증 사진 필요
    if (!idCardImageUrl) return res.send(response(baseResponse.ID_CARD_EMPTY));
  } else {
    // 이메일 필수
    // 이메일 형식 체크 (by 정규표현식)
    if (!regexEmail.test(officeEmail))
      return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));
  }

  const signUpResponse = await userService.createUser(
    uuid,
    nickName,
    birthday,
    gender,
    job,
    idCardImageUrl,
    officeEmail,
    deviceToken
  );
  return res.send(signUpResponse);
};

/**
 * API No. 4
 * API Name : (인증을 위한) 이메일 중복확인 API
 * [GET] /users/email/check/:officeEmail
 * Path variable: officeEmail
 */
exports.checkUserEmail = async function (req, res) {
  const officeEmail = req.params.officeEmail;

  const hashedEmail = await crypto
    .createHash("sha512")
    .update(officeEmail)
    .digest("hex");

  const emailRows = await userProvider.emailCheck(hashedEmail);
  if (emailRows.length > 0) {
    return res.send(errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL));
  }
  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 5
 * API Name : (최초 1회만 가능) 닉네임 변경 API
 * [PATCH] /users/:userId/name
 * Path variable: userId
 * Header : jwt
 * body : nickName
 */
exports.patchUserName = async function (req, res) {
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;
  const changedNickName = req.body.nickName;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!changedNickName)
    return res.send(response(baseResponse.USER_NICKNAME_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const patchUserNameResponse = await userService.patchUserName(
      changedNickName,
      userId
    );
    return res.send(patchUserNameResponse);
  }
};

/**
 * API No. 7
 * API Name : 메인페이지 API
 * [GET] /users/main/:runningTag
 * Body :
 * Path variable : runningTag
 * Query string : userLongitude, userLatitude
 *                whetherEnd(Y, N), filter(D,R,B) 거리순 : D, 최신순 : R, 찜많은순 : B
 *                distanceFilter(N, 거리값)
 *                genderFilter(A,F,M) A : 전체, F : 여성, M : 남성
 *                ageFilterMax(N, 숫자)
 *                ageFilterMin(N, 숫자)
 */
exports.main = async function (req, res) {
  // Path variable 값
  const runningTag = req.params.runningTag;
  // Query String 값
  const userLongitude = req.query.userLongitude;
  const userLatitude = req.query.userLatitude;
  const whetherEnd = req.query.whetherEnd; // Y, N
  const filter = req.query.filter; // 거리순 : D, 최신순 : R
  const distanceFilter = req.query.distanceFilter; // (N, 거리값)
  const genderFilter = req.query.genderFilter; // A : 전체, F : 여성, M : 남성
  const jobFilter = req.query.jobFilter; // N: 필터X ,그 외 약속된 job code로 보내기
  const ageFilterMin = req.query.ageFilterMin; // N : 필터 x, 그 외 최소 연령대
  const ageFilterMax = req.query.ageFilterMax; // N : 필터 x, 그 외 최대 연령대
  const keywordSearch = req.query.keywordSearch; // N : 필터 x, 그 외 키워드 검색

  // 빈 값 체크
  if (!userLongitude) return res.send(response(baseResponse.LONGITUDE_EMPTY));
  if (!userLatitude) return res.send(response(baseResponse.LATITUDE_EMPTY));
  if (!runningTag) return res.send(response(baseResponse.RUNNONGTAG_EMPTY));
  if (!whetherEnd) return res.send(response(baseResponse.WHETHEREND_EMPTY));
  if (!filter) return res.send(response(baseResponse.FILTER_EMPTY));
  if (!distanceFilter)
    return res.send(response(baseResponse.DISTANCEFILTER_EMPTY));
  if (!genderFilter)
    return res.send(response(baseResponse.GENDER_FILTER_EMPTY));
  if (!jobFilter) return res.send(response(baseResponse.JOB_FILTER_EMPTY));
  if (!ageFilterMin)
    return res.send(response(baseResponse.AGE_MIN_FILTER_EMPTY));
  if (!ageFilterMax)
    return res.send(response(baseResponse.AGE_MAX_FILTER_EMPTY));
  if (!keywordSearch) return res.send(response(baseResponse.KEY_WORD_EMPTY));

  // 길이 체크
  if (keywordSearch.length > 10)
    return res.send(response(baseResponse.KEY_WORD_LENGTH));

  // 유효성 검사
  const runningTagList = ["A", "B", "H"];
  const whetherEndList = ["Y", "N"];
  const filterList = ["D", "R"];
  const genderFilterList = ["A", "F", "M"];
  const jobList = [
    "PSV",
    "EDU",
    "DEV",
    "PSM",
    "DES",
    "MPR",
    "SER",
    "PRO",
    "RES",
    "SAF",
    "MED",
    "HUR",
    "ACC",
    "CUS",
  ];
  if (!runningTag.includes(runningTag))
    return res.send(response(baseResponse.RUNNONGTAG_IS_NOT_VALID));
  if (!whetherEndList.includes(whetherEnd))
    return res.send(response(baseResponse.END_IS_NOT_VALID));
  if (!filterList.includes(filter))
    return res.send(response(baseResponse.FILTER_IS_NOT_VALID));
  if (!genderFilterList.includes(genderFilter))
    return res.send(response(baseResponse.GENDER_FILTER_IS_NOT_VALID));

  if (
    (ageFilterMax != "N" && ageFilterMin === "N") ||
    (ageFilterMax === "N" && ageFilterMin != "N")
  )
    return res.send(response(baseResponse.AGE_FILTER_MATCH));

  // 필터 조건 설정
  let whetherEndCondition = "AND whetherEnd != 'D'";
  if (whetherEnd === "N") {
    whetherEndCondition += "AND whetherEnd = 'N'";
  }

  let sortCondition = "";
  if (filter === "D") {
    sortCondition += "DISTANCE";
  } else if (filter === "R") {
    sortCondition += "postingTime";
  }

  let distanceCondition = "";
  if (distanceFilter != "N") {
    if (isNaN(distanceFilter) === true)
      return res.send(response(baseResponse.DISTANCE_FILTER_NOTNUM));
    distanceCondition += `AND DISTANCE <= ${distanceFilter}`;
  }

  let genderCondition = "";
  if (genderFilter === "F") {
    genderCondition += "AND runnerGender = 'F'";
  } else if (genderFilter === "M") {
    genderCondition += "AND runnerGender = 'M'";
  }

  let jobCondition = "";
  if (jobFilter != "N") {
    if (!jobList.includes(jobFilter))
      return res.send(response(baseResponse.JOB_FILTER_IS_NOT_VALID));
    jobCondition += `AND INSTR(J.job, '${jobFilter}') > 0`;
  }

  let ageCondition = "";
  if (ageFilterMax != "N" && ageFilterMin != "N") {
    if (isNaN(ageFilterMax) === true)
      return res.send(response(baseResponse.AGE_MAX_FILTER_NOTNUM));
    if (isNaN(ageFilterMin) === true)
      return res.send(response(baseResponse.AGE_MIN_FILTER_NOTNUM));
    ageCondition += `AND ageMin >= ${ageFilterMin} AND ageMax <= ${ageFilterMax}`;
  }

  let keywordCondition = "";
  if (keywordSearch != "N") {
    keywordCondition += `AND INSTR(P.title, '${keywordSearch}') > 0 OR INSTR(P.contents, '${keywordSearch}') > 0`;
  }

  const mainResult = await userProvider.getMain(
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
  return res.send(response(baseResponse.SUCCESS, mainResult));
};

/**
 * API No.  9
 * API Name : jwt로 유저 인증 여부 확인API
 * [GET] /users/auth
 */
exports.authCheck = async function (req, res) {
  const userIdFromJWT = req.verifiedToken.userId;
  const checkFirst = await userProvider.checkFirst(userIdFromJWT);
  const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
  if (checkFirst.length > 0)
    return res.send(response(baseResponse.SUCCESS_MEMBER_AUTH_FIRST));

  if (checkUserAuth.length > 0) {
    return res.send(response(baseResponse.SUCCESS_MEMBER_AUTH));
  } else {
    return res.send(response(baseResponse.SUCCESS_MEMBER_NON_AUTH));
  }
};

/**
 * API No. 20
 * API Name : 찜 등록 API
 * [POST] /users/:userId/bookmarks/:whetherAdd
 */
exports.addBM = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : userId, whetherAdd
   * query String : postId
   */
  const postId = req.query.postId;
  const userId = req.params.userId;
  const whetherAdd = req.params.whetherAdd;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));
  if (!whetherAdd) return res.send(response(baseResponse.WADD_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(postId) === true)
    return res.send(response(baseResponse.POSTID_NOTNUM));

  // 유효성 검사
  const whetherAddList = ["Y", "N"];
  if (!whetherAddList.includes(whetherAdd))
    return res.send(response(baseResponse.WADD_IS_NOT_VALID));

  //Y이면 이미 BM에 해당 userId, postId로 row존재 확인, 없어야 됨 <이미 찜 등록했는데 등록 요청하면 X>
  //N이면 이미 BM에 해당 userId, postId로 row존재 확인, 있어야 됨 <찜 등록 안 했는데 해제 요청하면 X>
  const checkAddBM = await userProvider.checkAddBM(userId, postId);
  if (whetherAdd == "Y") {
    if (checkAddBM.length != 0)
      return res.send(response(baseResponse.USER_CANNOT_ADD));
  } else if (whetherAdd == "N") {
    if (checkAddBM.length === 0)
      return res.send(response(baseResponse.USER_CANNOT_DELETE));
  }

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const Response = await userService.addBM(userId, postId, whetherAdd);

    return res.send(response(baseResponse.SUCCESS));
  }
};

/**
 * API No. 21
 * API Name : 찜 목록 조회 API
 * [GET] /users/:userId/bookmarks
 */
exports.getBM = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : userId
   */

  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const Response = await userProvider.getBM(userId);

    return res.send(response(baseResponse.SUCCESS, Response));
  }
};

/**
 * API No. 22
 * API Name : 프로필 사진 변경 API
 * [PATCH] /users/:userId/profileImage
 * Path variable: userId
 * Header : jwt
 * body : profileImageUrl
 */
exports.patchUserImage = async function (req, res) {
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;
  const profileImageUrl = req.body.profileImageUrl;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const changeImage = await userService.patchUserImage(
      profileImageUrl,
      userId
    );
    return res.send(response(baseResponse.SUCCESS));
  }
};

/**
 * API No. 23
 * API Name : 직군 변경 API
 * [PATCH] /users/:userId/job
 * Path variable: userId
 * Header : jwt
 * body : job
 */
exports.patchUserJob = async function (req, res) {
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;
  const job = req.body.job;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!job) return res.send(response(baseResponse.SIGNUP_JOB_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  // 유효성 검사
  const jobList = [
    "PSV",
    "EDU",
    "DEV",
    "PSM",
    "DES",
    "MPR",
    "SER",
    "PRO",
    "RES",
    "SAF",
    "MED",
    "HUR",
    "ACC",
    "CUS",
  ];
  if (!jobList.includes(job))
    return res.send(response(baseResponse.JOB_FILTER_IS_NOT_VALID));
  //3개월에 한 번만 가능
  const checkTerm = await userProvider.checkTerm(userId);
  if (checkTerm.length === 0)
    return res.send(response(baseResponse.CANNOT_CHANGE_JOB));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const changeJob = await userService.patchUserJob(job, userId);
    return res.send(response(baseResponse.SUCCESS));
  }
};

/**
 * API No. 24
 * API Name : 마이페이지 API
 * [GET] /users/:userId/myPage
 * Path variable: userId
 * Header : jwt
 */
exports.getMyPage = async function (req, res) {
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const getMyPageResult = await userProvider.getMyPage(userId);
    return res.send(response(baseResponse.SUCCESS, getMyPageResult));
  }
};

/**
 * API No. 28
 * API Name : (임시)애플 로그인 API
 * [POST] /users/apple-login
 */

exports.appleLogin = async function (req, res) {
  const uuid = req.body.uuid;

  if (!uuid) return res.send(errResponse(baseResponse.SIGNUP_UUID_EMPTY));

  try {
    const checkUuid = await userProvider.checkUuidExist(uuid);

    if (checkUuid.length > 0) {
      const selectUserId = await userProvider.selectUserId(uuid);
      let token = await jwt.sign(
        {
          userId: selectUserId,
        },
        secret.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );

      const checkUserStatus = await userProvider.checkUserStatus(selectUserId); //Y이면 length 1이상
      if (checkUserStatus.length > 0) {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "소셜로그인에 성공하셨습니다.",
          })
        );
      } else {
        return res.send(
          response(baseResponse.SUCCESS_MEMBER_NON_AUTH, {
            userId: selectUserId,
            jwt: token,
            message: "인증 대기 회원입니다.",
          })
        );
      }
    } else {
      return res.send(
        response(baseResponse.SUCCESS_NON_MEMBER, {
          message: "회원가입이 가능합니다.",
          uuid,
        })
      );
    }
  } catch (err) {
    res.send(errResponse(baseResponse.SUCCESS, err));
    return errResponse(baseResponse.DB_ERROR);
  }
};

/**
 * API No. 29
 * API Name : 회원탈퇴 API
 * [DELETE] /users/:userId
 * Path variable: userId
 * body : secret_key
 */
exports.deleteUser = async function (req, res) {
  const userId = req.params.userId;
  const key = req.body.secret_key;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  // 빈 값 체크
  if (!key) return res.send(response(baseResponse.USER_KEY_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));

  // secret_key 확인
  if (key !== secret.api_secret_key)
    return res.send(response(baseResponse.KEY_DO_NOT_MATCH));

  const deleteResult = await userService.deleteUser(userId);
  return res.send(response(baseResponse.SUCCESS, deleteResult));
};

/**
 * API No. 30
 * API Name : 메인페이지 API v2
 * [GET] /users/main2/:runningTag
 * Body : userId
 * Path variable : runningTag
 * Query string : userLongitude, userLatitude
 *                whetherEnd(Y, N), filter(D,R,B) 거리순 : D, 최신순 : R, 찜많은순 : B
 *                distanceFilter(N, 거리값)
 *                genderFilter(A,F,M) A : 전체, F : 여성, M : 남성
 *                ageFilterMax(N, 숫자)
 *                ageFilterMin(N, 숫자)
 */
exports.main2 = async function (req, res) {
  // Path variable 값
  const runningTag = req.params.runningTag;
  // Query String 값
  const userLongitude = req.query.userLongitude;
  const userLatitude = req.query.userLatitude;
  const whetherEnd = req.query.whetherEnd; // Y, N
  const filter = req.query.filter; // 거리순 : D, 최신순 : R
  const distanceFilter = req.query.distanceFilter; // (N, 거리값)
  const genderFilter = req.query.genderFilter; // A : 전체, F : 여성, M : 남성
  const jobFilter = req.query.jobFilter; // N: 필터X ,그 외 약속된 job code로 보내기
  const ageFilterMin = req.query.ageFilterMin; // N : 필터 x, 그 외 최소 연령대
  const ageFilterMax = req.query.ageFilterMax; // N : 필터 x, 그 외 최대 연령대
  const keywordSearch = req.query.keywordSearch; // N : 필터 x, 그 외 키워드 검색
  const userId = req.query.userId;

  // 빈 값 체크
  if (!userLongitude) return res.send(response(baseResponse.LONGITUDE_EMPTY));
  if (!userLatitude) return res.send(response(baseResponse.LATITUDE_EMPTY));
  if (!runningTag) return res.send(response(baseResponse.RUNNONGTAG_EMPTY));
  if (!whetherEnd) return res.send(response(baseResponse.WHETHEREND_EMPTY));
  if (!filter) return res.send(response(baseResponse.FILTER_EMPTY));
  if (!distanceFilter)
    return res.send(response(baseResponse.DISTANCEFILTER_EMPTY));
  if (!genderFilter)
    return res.send(response(baseResponse.GENDER_FILTER_EMPTY));
  if (!jobFilter) return res.send(response(baseResponse.JOB_FILTER_EMPTY));
  if (!ageFilterMin)
    return res.send(response(baseResponse.AGE_MIN_FILTER_EMPTY));
  if (!ageFilterMax)
    return res.send(response(baseResponse.AGE_MAX_FILTER_EMPTY));
  if (!keywordSearch) return res.send(response(baseResponse.KEY_WORD_EMPTY));

  // 길이 체크
  if (keywordSearch.length > 10)
    return res.send(response(baseResponse.KEY_WORD_LENGTH));

  // 유효성 검사
  const runningTagList = ["A", "B", "H"];
  const whetherEndList = ["Y", "N"];
  const filterList = ["D", "R"];
  const genderFilterList = ["A", "F", "M"];
  const jobList = [
    "PSV",
    "EDU",
    "DEV",
    "PSM",
    "DES",
    "MPR",
    "SER",
    "PRO",
    "RES",
    "SAF",
    "MED",
    "HUR",
    "ACC",
    "CUS",
  ];
  if (!runningTag.includes(runningTag))
    return res.send(response(baseResponse.RUNNONGTAG_IS_NOT_VALID));
  if (!whetherEndList.includes(whetherEnd))
    return res.send(response(baseResponse.END_IS_NOT_VALID));
  if (!filterList.includes(filter))
    return res.send(response(baseResponse.FILTER_IS_NOT_VALID));
  if (!genderFilterList.includes(genderFilter))
    return res.send(response(baseResponse.GENDER_FILTER_IS_NOT_VALID));

  if (
    (ageFilterMax != "N" && ageFilterMin === "N") ||
    (ageFilterMax === "N" && ageFilterMin != "N")
  )
    return res.send(response(baseResponse.AGE_FILTER_MATCH));

  // 필터 조건 설정
  let whetherEndCondition = "AND whetherEnd != 'D'";
  if (whetherEnd === "N") {
    whetherEndCondition += "AND whetherEnd = 'N'";
  }

  let sortCondition = "";
  if (filter === "D") {
    sortCondition += "DISTANCE";
  } else if (filter === "R") {
    sortCondition += "postingTime";
  }

  let distanceCondition = "";
  if (distanceFilter != "N") {
    if (isNaN(distanceFilter) === true)
      return res.send(response(baseResponse.DISTANCE_FILTER_NOTNUM));
    distanceCondition += `AND DISTANCE <= ${distanceFilter}`;
  }

  let genderCondition = "";
  if (genderFilter === "F") {
    genderCondition += "AND runnerGender = 'F'";
  } else if (genderFilter === "M") {
    genderCondition += "AND runnerGender = 'M'";
  }

  let jobCondition = "";
  if (jobFilter != "N") {
    if (!jobList.includes(jobFilter))
      return res.send(response(baseResponse.JOB_FILTER_IS_NOT_VALID));
    jobCondition += `AND INSTR(J.job, '${jobFilter}') > 0`;
  }

  let ageCondition = "";
  if (ageFilterMax != "N" && ageFilterMin != "N") {
    if (isNaN(ageFilterMax) === true)
      return res.send(response(baseResponse.AGE_MAX_FILTER_NOTNUM));
    if (isNaN(ageFilterMin) === true)
      return res.send(response(baseResponse.AGE_MIN_FILTER_NOTNUM));
    ageCondition += `AND ageMin >= ${ageFilterMin} AND ageMax <= ${ageFilterMax}`;
  }

  let keywordCondition = "";
  if (keywordSearch != "N") {
    keywordCondition += `AND INSTR(P.title, '${keywordSearch}') > 0 OR INSTR(P.contents, '${keywordSearch}') > 0`;
  }

  if (!userId) {
    // 둘러보기
    const mainResult = await userProvider.getMain2(
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
    return res.send(response(baseResponse.SUCCESS, mainResult));
  } else {
    // 로그인 -> 북마크 여부 추가
    const mainResult = await userProvider.getMain2Login(
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
    return res.send(response(baseResponse.SUCCESS, mainResult));
  }
};

/**
 * API No. 32
 * API Name : 찜 목록 조회 API v2
 * [GET] /users/:userId/bookmarks/v2
 */
exports.getBM2 = async function (req, res) {
  /**
   * Header : jwt
   * Path Variable : userId
   */

  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));

  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userId);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const Response = await userProvider.getBM2(userId);

    return res.send(response(baseResponse.SUCCESS, Response));
  }
};

/**
 * API No. 32
 * API Name : 마이페이지 API v2
 * [GET] /users/:userId/myPage/v2
 * Path variable: userId
 * Header : jwt
 */
exports.getMyPage2 = async function (req, res) {
  const userId = req.params.userId;
  const userIdFromJWT = req.verifiedToken.userId;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  //jwt로 userId 확인
  if (userIdFromJWT != userId) {
    res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
  } else {
    // 인증 대기 회원 확인
    const checkUserAuth = await userProvider.checkUserAuth(userIdFromJWT);
    if (checkUserAuth.length === 0) {
      return res.send(response(baseResponse.USER_NON_AUTH));
    }
    const getMyPageResult = await userProvider.getMyPage2(userId);
    return res.send(response(baseResponse.SUCCESS, getMyPageResult));
  }
};

/**
 * API No. 34
 * API Name : 유저 생성 (회원가입) API v2 - 인증 절차 삭제
 * [POST] /users
 */
exports.postUsersV2 = async function (req, res) {
  /**
   * Body: uuid, nickName, birthday, gender, job, deviceToken
   */
  const { uuid, nickName, birthday, gender, job, deviceToken } = req.body;

  // 필수 값 : 빈 값 체크
  if (!uuid) return res.send(response(baseResponse.SIGNUP_UUID_EMPTY));
  if (!nickName) return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
  if (!birthday) return res.send(response(baseResponse.SIGNUP_BIRTHDAY_EMPTY));
  if (!gender) return res.send(response(baseResponse.SIGNUP_GENDER_EMPTY));
  if (!job) return res.send(response(baseResponse.SIGNUP_JOB_EMPTY));
  if (!deviceToken) return res.send(response(baseResponse.DEVICE_TOKEN_EMPTY));

  // 길이 체크
  if (nickName.length > 10)
    return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));
  if (gender.length != 1)
    return res.send(response(baseResponse.SIGNUP_GENDER_LENGTH));
  if (job.length != 3)
    return res.send(response(baseResponse.SIGNUP_JOB_LENGTH));

  const signUpResponse = await userService.createUserV2(
    uuid,
    nickName,
    birthday,
    gender,
    job,
    deviceToken
  );
  return res.send(signUpResponse);
};

/**
 * API No. 35
 * API Name : firebase token 업데이트 API
 * [PATCH] /users/:userId/deviceToken
 * Path variable: userId
 * body : deviceToken
 */
exports.patchDeviceToken = async function (req, res) {
  const userId = req.params.userId;
  const deviceToken = req.body.deviceToken;

  // 빈 값 체크
  if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
  if (!deviceToken)
    return res.send(response(baseResponse.DEVICE_TOKEN_INPUT_EMPTY));
  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));

  const patchDeviceTokenResponse = await userService.patchDeviceToken(
    deviceToken,
    userId
  );
  return res.send(patchDeviceTokenResponse);
};

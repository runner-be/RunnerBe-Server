const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const secret = require("../../../config/secret");

const passport = require("passport");
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
        //const uuid = kakao_profile.id; - wrong
        const uuid = kakao_profile.data.id.toString();

        const checkUuid = await userProvider.checkUuidExist(uuid);

        if (checkUuid === 1) {
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
            return res.send(
                response(baseResponse.SUCCESS_MEMBER, {
                    userId: selectUserId,
                    jwt: token,
                    message: "소셜로그인에 성공하셨습니다.",
                })
            );
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

        //const uuid = naver_profile.id - wrong..
        const uuid = naver_profile.data.response.id;
        const checkUuid = await userProvider.checkUuidExist(uuid);

        if (checkUuid === 1) {
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
            return res.send(
                response(baseResponse.SUCCESS_MEMBER, {
                    userId: selectUserId,
                    jwt: token,
                    message: "소셜로그인에 성공하셨습니다.",
                })
            );
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
     * Body: userEmail, password, phoneNumber, userName
     */
    const { uuid, nickName, birthday, gender, job, officeEmail, idCardImageUrl } =
        req.body;

    // 필수 값 : 빈 값 체크
    if (!uuid) return res.send(response(baseResponse.SIGNUP_UUID_EMPTY));
    if (!nickName) return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));
    if (!birthday) return res.send(response(baseResponse.SIGNUP_BIRTHDAY_EMPTY));
    if (!gender) return res.send(response(baseResponse.SIGNUP_GENDER_EMPTY));
    if (!job) return res.send(response(baseResponse.SIGNUP_JOB_EMPTY));

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
        officeEmail,
        idCardImageUrl
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
 * Body : userLongitude, userLatitude
 * Path variable : runningTag
 * Query string : whetherEnd(Y, N), filter(D,R,B) 거리순 : D, 최신순 : R, 찜많은순 : B
 */
exports.main = async function (req, res) {
    // Body 값
    const userLongitude = req.body.userLongitude;
    const userLatitude = req.body.userLatitude;
    // Path variable 값
    const runningTag = req.params.runningTag;
    // Query String 값
    const whetherEnd = req.query.whetherEnd; // Y, N
    const filter = req.query.filter; // 거리순 : D, 최신순 : R, 찜많은순 : B

    // 빈 값 체크
    if (!userLongitude) return res.send(response(baseResponse.LONGITUDE_EMPTY));
    if (!userLatitude) return res.send(response(baseResponse.LATITUDE_EMPTY));
    if (!runningTag) return res.send(response(baseResponse.RUNNONGTAG_EMPTY));
    if (!whetherEnd) return res.send(response(baseResponse.WHETHEREND_EMPTY));
    if (!filter) return res.send(response(baseResponse.FILTER_EMPTY));

    // 유효성 검사
    const runningTagList = ["A", "B", "H"];
    const whetherEndList = ["Y", "N"];
    const filterList = ["D", "R", "B"];
    if (!runningTag.includes(runningTag))
        return res.send(response(baseResponse.RUNNONGTAG_IS_NOT_VALID));
    if (!whetherEndList.includes(whetherEnd))
        return res.send(response(baseResponse.END_IS_NOT_VALID));
    if (!filterList.includes(filter))
        return res.send(response(baseResponse.FILTER_IS_NOT_VALID));

    // 필터 조건 설정
    let whetherEndCondition = "";
    if (whetherEnd === "N") {
        whetherEndCondition += "AND whetherEnd = 'N'";
    }
    let sortCondition;
    if (filter === "D") {
        sortCondition += "DISTANCE";
    } else if (filter === "R") {
        sortCondition += "postingTime";
    } else if (filter === "B") {
        sortCondition += "bookMarkNumber";
    }

    const mainResult = await userProvider.getMain(
        userLongitude,
        userLatitude,
        runningTag,
        whetherEndCondition,
        sortCondition
    );
    return res.send(response(baseResponse.SUCCESS, mainResult));
};

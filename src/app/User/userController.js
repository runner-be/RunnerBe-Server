const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const passport = require("passport");
//카카오 로그인
const kakao_key = require("../../../config/kakao_config").restApiKey;
const KakaoStrategy = require("passport-kakao").Strategy;

const regexEmail = require("regex-email");
const { emit } = require("nodemon");

/**
 * API No. 0
 * API Name : 테스트 API, RDS 연결 확인
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    const userListResult = await userProvider.retrieveUserList();
    return res.send(response(baseResponse.SUCCESS, userListResult));
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

        const uuid = kakao_profile.id;
        const kakao_nickname = kakao_profile.name;

        const checkUuid = await userProvider.checkUuidExist(uuid);

        if (checkUuid === 1) {
            const selectUserId = await userProvider.selectUserId(uuid);

            let token = await jwt.sign(
                {
                    userId: selectUserId,
                },
                secret_config.jwtsecret,
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                }
            );
            return res.send(
                response(baseResponse.SUCCESS, {
                    userId: selectUserId,
                    jwt: token,
                    message: "소셜로그인에 성공하셨습니다.",
                })
            );
        } else {
            const result = { uuid: uuid };

            return res.send(
                response(baseResponse.SUCCESS, {
                    message: "회원가입이 가능합니다.",
                    result,
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
        const uuid = naver_profile.id;
        const checkUuid = await userProvider.checkUuidExist(uuid);

        if (checkUuid === 1) {
            const selectUserId = await userProvider.selectUserId(uuid);

            let token = await jwt.sign(
                {
                    userId: selectUserId,
                },
                secret_config.jwtsecret,
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                }
            );
            return res.send(
                response(baseResponse.SUCCESS, {
                    userId: selectUserId,
                    jwt: token,
                    message: "소셜로그인에 성공하셨습니다.",
                })
            );
        } else {
            const result = { uuid: uuid };

            return res.send(
                response(baseResponse.SUCCESS, {
                    message: "회원가입이 가능합니다.",
                    result,
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
 * API Name : 유저 생성 (회원가입) API // 이메일, 비밀번호, 전화번호, 이름(실명)
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {
    /**
     * Body: userEmail, password, phoneNumber, userName
     */
    const { uuid, birthday, gender, job, officeEmail, idCardImageUrl } = req.body;

    // 필수 값 : 빈 값 체크
    if (!uuid) return res.send(response(baseResponse.SIGNUP_UUID_EMPTY));
    if (!birthday) return res.send(response(baseResponse.SIGNUP_BIRTHDAY_EMPTY));
    if (!gender) return res.send(response(baseResponse.SIGNUP_GENDER_EMPTY));
    if (!job) return res.send(response(baseResponse.SIGNUP_JOB_EMPTY));

    // 길이 체크
    if (gender.length != 1)
        return res.send(response(baseResponse.SIGNUP_GENDER_LENGTH));
    if (job.length != 3)
        return res.send(response(baseResponse.SIGNUP_JOB_LENGTH));

    // 이메일 형식 체크 (by 정규표현식)
    if (!regexEmail.test(officeEmail))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    const signUpResponse = await userService.createUser(
        uuid,
        birthday,
        gender,
        job,
        officeEmail,
        idCardImageUrl
    );
    return res.send(signUpResponse);
};

const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const secret = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { connect } = require("http2");

// 유저 생성
exports.createUser = async function (
    uuid,
    nickName,
    birthday,
    gender,
    job,
    officeEmail,
    idCardImageUrl
) {
    try {
        // uuid 중복 확인
        const uuidRows = await userProvider.uuidCheck(uuid);
        if (uuidRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_UUID);
        //nickName 중복 확인
        const nickNameRows = await userProvider.nickNameCheck(nickName);
        if (nickNameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);
        // 이메일 암호화
        const hashedEmail = await crypto
            .createHash("sha512")
            .update(officeEmail)
            .digest("hex");
        //이메일 중복 확인
        const emailRows = await userProvider.emailCheck(hashedEmail); // emailCheck
        if (emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 직군코드 유효 확인
        const checkJob = await userProvider.checkJobExist(job);
        if (checkJob === 0)
            return errResponse(baseResponse.SIGNUP_JOBCODE_IS_NOT_VALID);

        const insertUserInfoParams = [
            uuid,
            nickName,
            birthday,
            gender,
            job,
            idCardImageUrl,
            hashedEmail,
        ];

        const connection = await pool.getConnection(async (conn) => conn);

        const userResult = await userDao.insertUserInfo(
            connection,
            insertUserInfoParams
        );
        const insertedUserId = userResult[0].insertId;
        console.log(`추가된 회원 : ${userResult[0].insertId}`);
        connection.release();

        //jwt 발급
        let token = await jwt.sign(
            {
                userId: insertedUserId,
            },
            secret.jwtsecret,
            {
                expiresIn: "365d",
                subject: "userInfo",
            }
        );

        return response(baseResponse.SUCCESS, token);
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

//user의 nickname 변경
exports.patchUserName = async function (changedNickName, userId) {
    try {
        //변경이력 확인
        const checkRecordRows = await userProvider.checkRecord(userId);
        if (checkRecordRows.length > 0)
            return errResponse(baseResponse.CANNOT_CHANGE_NICKNAME);

        //nickName 중복 확인
        const nickNameRows = await userProvider.nickNameCheck(changedNickName);
        if (nickNameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME);

        const connection = await pool.getConnection(async (conn) => conn);
        const patchUserNameList = [changedNickName, userId];
        const patchUserNameResult = await userDao.patchUserName(
            connection,
            patchUserNameList
        );

        connection.release();

        // console.log(`닉네임 변경 유저 ID : ${userId}`);

        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - patchUserName Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

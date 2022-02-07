const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const secret_config = require("../../../config/secret");
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
            birthday,
            gender,
            job,
            idCardImageUrl,
            hashedEmail,
        ];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(
            connection,
            insertUserInfoParams
        );
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

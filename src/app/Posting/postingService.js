const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const postingProvider = require("./postingProvider");
const postingDao = require("./postingDao");
const baseResponse = require("../../../config/baseResponseStatus");
const { response } = require("../../../config/response");
const { errResponse } = require("../../../config/response");

const { connect } = require("http2");

// 게시글 생성
exports.createPosting = async function (
    userId,
    title,
    gatheringTime,
    runningTime,
    gahterLongitude,
    gatherLatitude,
    locationInfo,
    runningTag,
    ageMin,
    ageMax,
    peopleNum,
    contents,
    runnerGender
) {
    try {
        //유효한 user인지 확인
        const userIdRows = await postingProvider.userIdCheck(userId);
        if (userIdRows.length === 0)
            return errResponse(baseResponse.POSTING_NOT_VALID_USERID);

        const insertPostingParams = [
            userId,
            title,
            gatheringTime,
            runningTime,
            gahterLongitude,
            gatherLatitude,
            locationInfo,
            runningTag,
            ageMin,
            ageMax,
            peopleNum,
            contents,
            runnerGender,
        ];

        const connection = await pool.getConnection(async (conn) => conn);
        // 게시글 생성
        const createPostingResult = await postingDao.createPosting(
            connection,
            insertPostingParams
        );

        const insertId = createPostingResult[0].insertId; //위 쿼리에서 A.I로 생성된 postId
        const createRunningParams = [userId, insertId];

        //러닝 모임 생성
        const createRunning = await postingDao.createRunning(
            connection,
            createRunningParams
        );

        //방장 모임 인원에 추가
        const insertRunningId = createRunning[0].insertId;
        const insertRunningPeopleParams = [insertRunningId, userId];
        const creaetRunningPeople = await postingDao.creaetRunningPeople(
            connection,
            insertRunningPeopleParams
        );

        console.log(`추가된 게시글 : ${createPostingResult[0].insertId}`);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - createPosting Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 게시글 수정
exports.patchPosting = async function (
    title,
    gatheringTime,
    runningTime,
    gahterLongitude,
    gatherLatitude,
    locationInfo,
    runningTag,
    ageMin,
    ageMax,
    peopleNum,
    contents,
    runnerGender,
    postId
) {
    try {
        const patchPostingParams = [
            title,
            gatheringTime,
            runningTime,
            gahterLongitude,
            gatherLatitude,
            locationInfo,
            runningTag,
            ageMin,
            ageMax,
            peopleNum,
            contents,
            runnerGender,
            postId,
        ];

        const connection = await pool.getConnection(async (conn) => conn);
        // 게시글 수정
        const patchPostingResult = await postingDao.patchPosting(
            connection,
            patchPostingParams
        );

        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - patchPosting Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

const jwtMiddleware = require("../../../config/jwtMiddleware");
const postingProvider = require("../../app/Posting/postingProvider");
const postingService = require("../../app/Posting/postingService");
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
     * Body: title, gatheringTime, runningTime, gahterLongitude, gatherLatitude, locationInfo, runningTag, ageMin, ageMax, peopleNum, contents, runnerGender
     */
    const userId = req.params.userId;
    const userIdFromJWT = req.verifiedToken.userId;
    const {
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
    } = req.body; //구조분해 순서 유의할 것... 삽질

    // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
    if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));
    if (!title) return res.send(response(baseResponse.POSTING_TITLE_EMPTY));
    if (!gatheringTime)
        return res.send(response(baseResponse.POSTING_GATHERINGTIME_EMPTY));
    if (!runningTime)
        return res.send(response(baseResponse.POSTING_RUNNINGTIME_EMPTY));
    if (!gahterLongitude)
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

    // 유효성 검사
    const whenTagList = ["A", "B", "H"]; //A : 퇴근 후, B : 출근 전, H : 휴일
    const genderList = ["A", "M", "F"]; //A : 전체, M : 남성, F : 여성
    if (!whenTagList.includes(runningTag))
        return res.send(response(baseResponse.WHEN_IS_NOT_VALID));
    if (!genderList.includes(runnerGender))
        return res.send(response(baseResponse.GENDER_IS_NOT_VALID));

    //jwt로 userId 확인
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        const postingResponse = await postingService.createPosting(
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
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        const getPostingResponse = await postingProvider.getPosting(postId);

        // 작성자, 비작성자 구분하기
        const checkWriter = await postingProvider.checkWriter(postId, userId);
        if (checkWriter.length > 0) {
            res.send(response(baseResponse.SUCCESS_WRITER, getPostingResponse));
        } else {
            res.send(response(baseResponse.SUCCESS_NON_WRITER, getPostingResponse));
        }
    }
};

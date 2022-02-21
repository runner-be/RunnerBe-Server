const jwtMiddleware = require("../../../config/jwtMiddleware");
const runningProvider = require("../../app/Running/runningProvider");
const userProvider = require("../../app/User/userProvider");
const runningService = require("../../app/Running/runningService");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const { emit } = require("nodemon");

/**
 * API No. 18
 * API Name : 참여신청하기 API
 * [POST] /running/request/:postId
 */
exports.sendRequest = async function (req, res) {
    /**
     * Header : jwt
     * Path Variable : postId
     * query String : userId
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
        // 인증 대기 회원 확인
        const checkUserAuth = await userProvider.checkUserAuth(userId);
        if (checkUserAuth.length === 0) {
            return res.send(response(baseResponse.USER_NON_AUTH));
        }
        const Response = await runningService.sendRequest(postId, userId);

        return res.send(response(baseResponse.SUCCESS, Response));
    }
};

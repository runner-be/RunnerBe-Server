const jwtMiddleware = require("../../../config/jwtMiddleware");
const messageProvider = require("../../app/Message/messageProvider");
const userProvider = require("../../app/User/userProvider");
const postingProvider = require("../../app/Posting/postingProvider");
const messageService = require("../../app/Message/messageService");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const { logger } = require("../../../config/winston");
const { emit } = require("nodemon");

/**
 * API No. 13
 * API Name : 쪽지로 신청하기(대화방 생성) API
 * [POST] /messages/:postId/request/:userId
 */
exports.createRoom = async function (req, res) {
    /**
     * Header : jwt
     * Path Variable : postId, userId
     */
    const postId = req.params.postId;
    const senderId = req.params.userId;
    const userIdFromJWT = req.verifiedToken.userId;

    // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
    if (!senderId) return res.send(response(baseResponse.USER_USERID_EMPTY));
    if (!postId) return res.send(response(baseResponse.POSTID_EMPTY));

    // 숫자 확인
    if (isNaN(senderId) === true)
        return res.send(response(baseResponse.USER_USERID_NOTNUM));
    if (isNaN(postId) === true)
        return res.send(response(baseResponse.POSTID_NOTNUM));

    //repUserId 뽑아내기
    const repUserId = await messageProvider.getRepUserId(postId);

    //jwt로 userId 확인
    if (userIdFromJWT != senderId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // 인증 대기 회원 확인
        const checkUserAuth = await userProvider.checkUserAuth(senderId);
        if (checkUserAuth.length === 0) {
            return res.send(response(baseResponse.USER_NON_AUTH));
        }
        const createRoomResponse = await messageService.createRoom(
            postId,
            senderId,
            repUserId
        );
        // 삽입된 roomId도 리턴
        return res.send(response(baseResponse.SUCCESS, createRoomResponse));
    }
};

/**
 * API No. 14
 * API Name : 쪽지 보내기 API
 * [POST] /messages/:roomId/users/:userId
 */
exports.sendMessage = async function (req, res) {
    /**
     * Header : jwt
     * Path Variable : roomId, userId
     * body : content
     */
    const roomId = req.params.roomId;
    const senderId = req.params.userId;
    const userIdFromJWT = req.verifiedToken.userId;
    const content = req.body.content;

    // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
    if (!senderId) return res.send(response(baseResponse.USER_USERID_EMPTY));
    if (!roomId) return res.send(response(baseResponse.ROOM_ID_EMPTY));
    if (!content) return res.send(response(baseResponse.CONTENT_EMPTY));

    // 숫자 확인
    if (isNaN(senderId) === true)
        return res.send(response(baseResponse.USER_USERID_NOTNUM));
    if (isNaN(roomId) === true)
        return res.send(response(baseResponse.ROOM_ID_NOTNUM));

    // 길이 확인
    if (content.length > 100)
        return res.send(response(baseResponse.CONTENT_LENGTH));

    //jwt로 userId 확인
    if (userIdFromJWT != senderId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // 인증 대기 회원 확인
        const checkUserAuth = await userProvider.checkUserAuth(senderId);
        if (checkUserAuth.length === 0) {
            return res.send(response(baseResponse.USER_NON_AUTH));
        }
        // 수신자의 Id 가져오기
        const receiverId = await messageProvider.getReceiverId(roomId, senderId);

        const sendMessageResponse = await messageService.sendMessage(
            roomId,
            senderId,
            receiverId,
            content
        );
        return res.send(response(baseResponse.SUCCESS));
    }
};

/**
 * API No. 15
 * API Name : 쪽지 목록창 API
 * [GET] /messages/list
 */
exports.getMessageList = async function (req, res) {
    /**
     * Header : jwt
     * Query String : userId
     */
    const userId = req.query.userId;
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
        const getMessageListResponse = await messageProvider.getMessageList(userId);
        return res.send(response(baseResponse.SUCCESS, getMessageListResponse));
    }
};

/**
 * API No. 16
 * API Name : 대화방 상세페이지 API
 * [GET] /messages/rooms/:roomId
 */
exports.getRoom = async function (req, res) {
    /**
     * Header : jwt
     * Path variable : roomId
     * Query String : userId
     */
    const roomId = req.params.roomId;
    const userId = req.query.userId;
    const userIdFromJWT = req.verifiedToken.userId;

    // 필수 값 : 빈 값 체크 (text를 제외한 나머지)
    if (!roomId) return res.send(response(baseResponse.ROOM_ID_EMPTY));
    if (!userId) return res.send(response(baseResponse.USER_USERID_EMPTY));

    // 숫자 확인
    if (isNaN(roomId) === true)
        return res.send(response(baseResponse.ROOM_ID_NOTNUM));
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
        const getRoomResponse = await messageProvider.getRoom(roomId, userId);

        // 들어온 userId가 반장인지에 따라서 result code 달리 해서 응답보내기
        const checkMaster = await messageProvider.checkMaster(userId);
        // 참여 신청 여부 확인
        const checkApplyStatus = await messageProvider.checkApplyStatus(roomId); // Y일 때 length > 0
        if (checkMaster.length > 0) {
            if (checkApplyStatus.length > 0) {
                res.send(response(baseResponse.SUCCESS_MASTER_AFTER, getRoomResponse));
            } else {
                res.send(response(baseResponse.SUCCESS_MASTER_BEFORE, getRoomResponse));
            }
        } else {
            if (checkApplyStatus.length > 0) {
                res.send(
                    response(baseResponse.SUCCESS_NON_MASTER_AFTER, getRoomResponse)
                );
            } else {
                res.send(
                    response(baseResponse.SUCCESS_NON_MASTER_BEFORE, getRoomResponse)
                );
            }
        }
    }
};

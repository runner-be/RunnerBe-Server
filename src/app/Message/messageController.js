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
 * API No. 38
 * API Name : 대화방 목록창 API
 * [GET] /messages
 * Header : jwt
 */
exports.getRoomList = async function (req, res) {
  const userId = req.verifiedToken.userId;

  const getRoomListResponse = await messageProvider.getRoomList(userId);
  return res.send(response(baseResponse.SUCCESS, getRoomListResponse));
};

/**
 * API No. 39
 * API Name : 대화방 상세페이지 API
 * [GET] /messages/rooms/:roomId
 * Header : jwt
 * Path variable : roomId
 */
exports.getRoom = async function (req, res) {
  const roomId = req.params.roomId;
  const userId = req.verifiedToken.userId;

  // 빈 값 체크
  if (!roomId) return res.send(response(baseResponse.ROOM_ID_EMPTY));

  // 숫자 확인
  if (isNaN(roomId) === true)
    return res.send(response(baseResponse.ROOM_ID_NOTNUM));

  const getRoomResponse = await messageProvider.getRoom(roomId, userId);

  res.send(response(baseResponse.SUCCESS, getRoomResponse));
};

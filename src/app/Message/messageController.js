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

/**
 * API No. 40
 * API Name : 메시지 전송 API
 * [POST] /messages/rooms/:roomId
 * Header : jwt
 * Path Variable : roomId
 * body : content
 */
exports.sendMessage = async function (req, res) {
  const roomId = req.params.roomId;
  const userId = req.verifiedToken.userId;
  const content = req.body.content;

  // 빈 값 체크
  if (!roomId) return res.send(response(baseResponse.ROOM_ID_EMPTY));
  if (!content) return res.send(response(baseResponse.CONTENT_EMPTY));

  // 숫자 확인
  if (isNaN(userId) === true)
    return res.send(response(baseResponse.USER_USERID_NOTNUM));
  if (isNaN(roomId) === true)
    return res.send(response(baseResponse.ROOM_ID_NOTNUM));

  // 길이 확인
  if (content.length > 300)
    return res.send(response(baseResponse.CONTENT_LENGTH));

  await messageService.sendMessage(roomId, userId, content);

  return res.send(response(baseResponse.SUCCESS));
};

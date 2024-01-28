const jwtMiddleware = require("../../../config/jwtMiddleware");
const messageProvider = require("../Provider/messageProvider");
const userProvider = require("../Provider/userProvider");
const postingProvider = require("../Provider/postingProvider");
const messageService = require("../Service/messageService");
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

  return res.send(response(baseResponse.SUCCESS, getRoomResponse));
};

/**
 * API No. 40
 * API Name : 메시지 전송 API
 * [POST] /messages/rooms/:roomId
 * Header : jwt
 * Path Variable : roomId
 * body : content or imageUrl
 */
exports.sendMessage = async function (req, res) {
  const roomId = req.params.roomId;
  const userId = req.verifiedToken.userId;
  const content = req.body.content;
  const imageUrl = req.body.imageUrl;

  // 빈 값 체크
  if (!roomId) return res.send(response(baseResponse.ROOM_ID_EMPTY));
  // if (!content) return res.send(response(baseResponse.CONTENT_EMPTY));

  // 숫자 확인
  if (isNaN(roomId) === true)
    return res.send(response(baseResponse.ROOM_ID_NOTNUM));

  // 길이 확인
  if (content && content.length > 300)
    return res.send(response(baseResponse.CONTENT_LENGTH));

  const checkJoinRoom = await messageProvider.checkUserInRoom(roomId, userId);
  if (checkJoinRoom.length == 0) {
    await messageService.joinRoom(roomId, userId);
  }
  await messageService.sendMessage(roomId, userId, content, imageUrl);

  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 41
 * API Name : 메시지 신고 API
 * [POST] /messages/:messageId/report
 * Header : jwt
 * Path Variable : messageId
 */
exports.reportMessage = async function (req, res) {
  const userId = req.verifiedToken.userId;
  const messageIdBody = req.body.messageIdList;
  const messageIdArray = messageIdBody.split(",");
  const IntMessageIdArray = messageIdArray.map((messageId) =>
    parseInt(messageId)
  );

  // 빈 값 체크
  if (!messageIdBody) return res.send(response(baseResponse.MESSAGE_ID_EMPTY));

  try {
    for (let i = 0; i < IntMessageIdArray.length; i++) {
      const messageId = IntMessageIdArray[i];
      // messageId 존재 확인
      const checkMessageId = await messageProvider.getMessageId(messageId);
      if (checkMessageId.length == 0)
        return res.send(response(baseResponse.MESSAGE_ID_NOT_EXIST));
      await messageService.reportMessage(messageId, userId);
    }
    return res.send(response(baseResponse.SUCCESS));
  } catch (err) {
    logger.error(`App - reportMessage Controller error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

module.exports = function (app) {
  const message = require("../Controller/messageController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 38. 대화방 목록창 API
  app.get("/messages", jwtMiddleware, message.getRoomList);

  // 39. 대화방 상세 페이지 API
  app.get("/messages/rooms/:roomId", jwtMiddleware, message.getRoom);

  // 40. 메시지 전송 API
  app.post("/messages/rooms/:roomId", jwtMiddleware, message.sendMessage);

  // 41. 메시지 신고 API -> to do : 여러 개 처리로 수정
  app.post("/messages/report", jwtMiddleware, message.reportMessage);
};

module.exports = function (app) {
  const message = require("./messageController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 14. 쪽지 보내기 API
  app.post(
    "/messages/:roomId/users/:userId",
    jwtMiddleware,
    message.sendMessage
  );

  // 15. 쪽지 목록창 API
  app.get("/messages/list", jwtMiddleware, message.getMessageList);

  // 16. 대화방 상세 페이지 API
  app.get("/messages/rooms/:roomId", jwtMiddleware, message.getRoom);
};

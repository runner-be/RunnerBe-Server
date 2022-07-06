module.exports = function (app) {
  const message = require("./messageController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 38. 대화방 목록창 API
  app.get("/messages", jwtMiddleware, message.getRoomList);

  // 39. 대화방 상세 페이지 API
  app.get("/messages/rooms/:roomId", jwtMiddleware, message.getRoom);

  // 14. 쪽지 보내기 API
  app.post(
    "/messages/:roomId/users/:userId",
    jwtMiddleware,
    message.sendMessage
  );
};

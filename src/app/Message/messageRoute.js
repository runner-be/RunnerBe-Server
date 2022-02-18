module.exports = function (app) {
    const message = require("./messageController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 13. 쪽지로 신청하기(대화방 생성) API
    app.post(
        "/messages/:postId/request/:userId",
        jwtMiddleware,
        message.createRoom
    );

    // 14. 쪽지 보내기 API
    app.post(
        "/messages/:roomId/users/:userId",
        jwtMiddleware,
        message.sendMessage
    );
};

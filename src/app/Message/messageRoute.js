module.exports = function (app) {
    const message = require("./messageController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    //13. 쪽지로 신청하기(대화방 생성) API
    app.post(
        "/messages/:postId/request/:userId",
        jwtMiddleware,
        message.createRoom
    );
};

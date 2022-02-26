module.exports = function (app) {
    const running = require("./runningController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 18. 참여 신청 API
    app.post("/runnings/request/:postId", jwtMiddleware, running.sendRequest);

    // 19. 참여 신청 처리하기 API
    app.patch(
        "/runnings/request/:postId/handling/:applicantId/:whetherAccept",
        jwtMiddleware,
        running.handleRequest
    );

    // 26. 푸시 알림
    app.get("/push-alarm", jwtMiddleware, running.pushAlarm);
};

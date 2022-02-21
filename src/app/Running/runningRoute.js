module.exports = function (app) {
    const running = require("./runningController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");

    // 18. 참여 신청 API
    app.post("/running/request/:postId", jwtMiddleware, running.sendRequest);
};

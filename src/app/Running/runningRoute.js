module.exports = function (app) {
  const running = require("./runningController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 18. 참여 신청 API
  app.post(
    "/runnings/request/:postId/:userId",
    jwtMiddleware,
    running.sendRequest
  );

  // 19. 참여 신청 처리하기 API
  app.patch(
    "/runnings/request/:postId/:userId/handling/:applicantId/:whetherAccept",
    jwtMiddleware,
    running.handleRequest
  );

  // 26. 푸시 알림
  app.get("/push-alarm", jwtMiddleware, running.pushAlarm);

  // 27. 출석하기 API
  app.patch(
    "/runnings/:postId/:userId/attendees",
    jwtMiddleware,
    running.attend
  );
};

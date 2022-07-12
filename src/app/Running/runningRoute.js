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

  // // 26. 푸시 알림
  // app.post("/push-alarm", running.pushAlarm);

  // 27. 출석 관리하기 API - 다수의 러너들 한 번에 처리
  app.get("/runnings/:postId/attend", jwtMiddleware, running.attend);
};

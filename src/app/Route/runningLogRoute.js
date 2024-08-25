module.exports = function (app) {
  const runningLog = require("../Controller/runningLogController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 46. 러닝 로그 작성 API
  app.post("/runninglogs/:userId", jwtMiddleware, runningLog.createPostingLog);

  // 47. 러닝 로그 수정 API
  app.patch(
    "/runninglogs/:userId/:logId",
    jwtMiddleware,
    runningLog.updatePostingLog
  );

  // 48. 러닝 로그 삭제 API
  app.delete(
    "/runninglogs/:userId/:logId",
    jwtMiddleware,
    runningLog.deletePostingLog
  );

  // 49. 러닝 로그 전체 조회 API
  app.get("/runninglogs/:userId", jwtMiddleware, runningLog.getRunningLog);

  // // 50. 러닝 로그 상세 조회 API
  // app.get(
  //   "/runninglogs/:logId/:userId",
  //   jwtMiddleware,
  //   runningLog.detailPostingLog
  // );

  // // 51. 함께한 러너 리스트 조회 API
  // app.get(
  //   "/runninglogs/:userId/partners",
  //   jwtMiddleware,
  //   runningLog.getPartners
  // );

  // // 52. 함께한 러너에게 스탬프 찍기 API
  // app.patch(
  //   "/runninglogs/:userId/partners",
  //   jwtMiddleware,
  //   runningLog.giveStampToPartners
  // );

  // 53. 스탬프 정보 전체 조회 API
  app.get("/runninglogs/stamp", runningLog.getStampList);
};

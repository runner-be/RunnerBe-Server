module.exports = function (app) {
  const user = require("../Controller/userController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // 1. 카카오 로그인 API, aceess token은 Frontend에서 발급 후 req.body로 제출
  app.post("/users/kakao-login", user.kakaoLogin);

  // 2. 네이버 로그인 API
  app.post("/users/naver-login", user.naverLogin);

  // 3. 회원가입 API
  app.post("/users", user.postUsers);

  // 4. (가입 인증을 위한) 이메일 중복확인 API
  app.get("/users/email/check/:officeEmail", user.checkUserEmail);

  // 5. (최초 1회만 가능) 닉네임 변경 API
  app.patch("/users/:userId/name", jwtMiddleware, user.patchUserName);

  // // 7. 메인페이지 API
  // app.get("/users/main/:runningTag", user.main);

  // 9. 앱 실행시 jwt 유효성 및 유저 정지 여부 확인 API
  app.get("/users/auth", jwtMiddleware, user.authCheck);

  // 20. 찜 등록, 해제 API
  app.post("/users/:userId/bookmarks/:whetherAdd", jwtMiddleware, user.addBM);

  // 21. 찜 목록 조회 API
  app.get("/users/:userId/bookmarks", jwtMiddleware, user.getBM);

  // 22. 프로필 사진 변경 API
  app.patch("/users/:userId/profileImage", jwtMiddleware, user.patchUserImage);

  // 23. 직군 변경 API
  app.patch("/users/:userId/job", jwtMiddleware, user.patchUserJob);

  // 24. 마이페이지 API
  app.get("/users/:userId/myPage", jwtMiddleware, user.getMyPage);

  // 28. (임시)애플 로그인 API
  app.post("/users/apple-login", user.appleLogin);

  // 29. 회원 탈퇴 API
  app.delete("/users/:userId", user.deleteUser);

  // 30. 메인페이지 API v2
  app.get("/users/main/v2", user.main2);

  // 32. 찜 목록 조회 API v2
  app.get("/users/:userId/bookmarks/v2", jwtMiddleware, user.getBM2);

  // 33. 마이페이지 API v2
  app.get("/users/:userId/myPage/v2", jwtMiddleware, user.getMyPage2);

  // 34. 회원가입 API v2
  app.post("/v2/users", user.postUsersV2);

  // 35. firebase Token 업데이트 API
  app.patch("/users/:userId/deviceToken", user.patchDeviceToken);

  // 36. 푸쉬알림 수신 여부 설정 API
  app.patch("/users/:userId/push-alarm/:pushOn", user.pushOnOff);

  // 37. 알림 메시지 목록 API
  app.get("/users/alarms", jwtMiddleware, user.getMyAlarms);

  // 42. 활동 기록 조회 API
  app.get("/users/:userId/records", jwtMiddleware, user.getRecord);

  // 43. 새로운 푸쉬 알람 메시지 여부 조회 API
  app.get("/users/whether-new-alarms", jwtMiddleware, user.getWhetherNewAlarms);

  // 44. 러닝 페이스 등록 & 수정 API
  app.patch("/users/:userId/pace", jwtMiddleware, user.postRunningPace);

  // 45. 타인 마이페이지 열람 API v2
  app.get("/users/:userId/userPage/v2", user.getUserPage2);
};

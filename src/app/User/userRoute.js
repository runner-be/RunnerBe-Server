module.exports = function (app) {
    const user = require("./userController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");
    // 0. 테스트 API
    app.get("/test", user.getTest);
    // 0. 테스트용 jwt 발급 API
    app.get("/jwtTest/:userId", user.getJwt);
    // 0. 테스트용 회원 삭제 API
    app.post("/FORTESTdeleteUser/:uuid", user.deleteUser);

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

    // 7. 메인페이지 API
    app.get("/users/main/:runningTag", user.main);

    // 9. 앱 실행시 유저 인증여부 확인 API
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
};

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
};

module.exports = function (app) {
    const posting = require("./postingController");
    const jwtMiddleware = require("../../../config/jwtMiddleware");
    // 6. 게시글 작성 API
    app.post("/postings/:userId", jwtMiddleware, posting.createPosting);
};

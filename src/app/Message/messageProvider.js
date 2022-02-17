const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const messageDao = require("./messageDao");

// 반장 Id 가져오기
exports.getRepUserId = async function (postId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getRepUserIdResult = await messageDao.getRepUserId(connection, postId);
    connection.release();

    return getRepUserIdResult;
};


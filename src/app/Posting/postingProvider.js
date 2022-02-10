const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const postingDao = require("./postingDao");

// userId 있는지 체크
exports.userIdCheck = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdCheckResult = await postingDao.userIdCheck(connection, userId);
    connection.release();

    return userIdCheckResult;
};

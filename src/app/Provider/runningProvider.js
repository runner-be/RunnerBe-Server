const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const runningDao = require("../Dao/runningDao");

exports.checkApplicant = async function (applicantId, postId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkApplicantParams = [applicantId, postId];
    const checkApplicantResult = await runningDao.checkApplicant(
      connection,
      checkApplicantParams
    );

    const result = checkApplicantResult[0];
    return result;
  } catch (err) {
    await logger.error(`Running-checkApplicant Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    await connection.release();
  }
};

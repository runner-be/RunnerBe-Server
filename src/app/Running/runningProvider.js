const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const baseResponse = require("../../../config/baseResponseStatus");
const { response, errResponse } = require("../../../config/response");
const runningDao = require("./runningDao");

exports.checkApplicant = async function (applicantId, postId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const checkApplicantParams = [applicantId, postId];
    const checkApplicantResult = await runningDao.checkApplicant(
      connection,
      checkApplicantParams
    );
    connection.release();
    const result = checkApplicantResult[0];
    return result;
  } catch (err) {
    logger.error(`Running-checkApplicant Provider error: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

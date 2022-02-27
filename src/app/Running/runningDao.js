async function sendRequest(connection, sendRequestParams) {
    const query = `
  INSERT INTO RunningPeople(gatheringId, userId) 
  VALUES ((SELECT gatheringId FROM Running INNER JOIN Posting P on Running.postId = P.postId WHERE P.postId = ?),?);
                          `;

    const row = await connection.query(query, sendRequestParams);

    return row;
}

async function handleRequest(connection, sendRequestParams, whetherAccept) {
    const query = `
  UPDATE RunningPeople RP
  INNER JOIN  Running R on RP.gatheringId = R.gatheringId
  INNER JOIN Posting P on R.postId = P.postId
  SET whetherAccept = REPLACE(whetherAccept, 'N', '${whetherAccept}')
  WHERE P.postId = ? AND RP.userId = ?;
                          `;

    const row = await connection.query(query, sendRequestParams);

    return row;
}

async function checkApplicant(connection, checkApplicantParams) {
    const query = `
  SELECT userId FROM RunningPeople RP
  INNER JOIN Running R on RP.gatheringId = R.gatheringId
  INNER JOIN Posting P on R.postId = P.postId
  WHERE whetherAccept = 'N' AND RP.userId = ? AND P.postId = ?
                          `;

    const row = await connection.query(query, checkApplicantParams);

    return row;
}

//디바이스 토큰 가져오기
async function getDeviceToken(userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getDeviceTokenQuery = `
      select deviceToken, nickName
      from User
      where userId = ?
  `;
    const [getDeviceTokenRows] = await connection.query(
        getDeviceTokenQuery,
        userId
    );
    connection.release();

    return getDeviceTokenRows;
}

// RP에 참석여부 업데이트
async function updateR(connection, updateParams) {
    const query = `
  UPDATE RunningPeople
  SET attendance = 1
  WHERE userId = ? AND gatheringId = (SELECT gatheringId FROM Running WHERE postId = ?);
                          `;

    const row = await connection.query(query, updateParams);

    return row;
}

// 유저의 출석률 업데이트
async function updateU(connection, updateParamsU) {
    const query = `
  UPDATE User
  SET diligence = (SELECT (SUM(attendance)/COUNT(gatheringId))*100 as attendance FROM RunningPeople WHERE userId = ? GROUP BY userId)
  WHERE userId = ?
                          `;

    const row = await connection.query(query, updateParamsU);

    return row;
}
module.exports = {
    sendRequest,
    handleRequest,
    checkApplicant,
    getDeviceToken,
    updateR,
    updateU,
};

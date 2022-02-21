async function sendRequest(connection, sendRequestParams, whetherAccept) {
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

module.exports = { sendRequest, checkApplicant };

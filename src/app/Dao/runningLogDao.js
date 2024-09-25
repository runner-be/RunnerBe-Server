// 게시글 생성
async function createRunningLog(connection, insertPostingParams) {
  const insertRunningLogQuery = `
    INSERT INTO RunningLog(userId, runnedDate, gatheringId, stampCode, contents, imageUrl, weatherDegree, weatherIcon, isOpened)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const insertRunningLogRow = await connection.query(
    insertRunningLogQuery,
    insertPostingParams
  );

  return insertRunningLogRow;
}

// 게시글 수정
async function updateRunningLog(connection, patchPostingParams) {
  const patchPostingQuery = `
    UPDATE RunningLog 
    SET runnedDate = ?, gatheringId = ?, stampCode = ?, contents = ?,
        imageUrl = ?, weatherDegree = ?, weatherIcon = ?, isOpened = ?
    WHERE logId = ?;
  `;

  const patchPostingRow = await connection.query(
    patchPostingQuery,
    patchPostingParams
  );
  return patchPostingRow;
}

// 게시글 삭제
async function deleteRunningLog(connection, logId) {
  const deleteLogQuery = `
    UPDATE RunningLog SET status = 'D' WHERE logId = ?;
  `;

  const deleteLogRow = await connection.query(deleteLogQuery, logId);
  return deleteLogRow;
}

// 상대방에게 러닝로그 스탬프 찍기
async function createRunningLogStamp(connection, insertPostingLogStampParams) {
  const insertRunningLogStampQuery = `
    INSERT INTO RunningLogStamp(logId, gatheringId, userId, targetId, stampCode)
    VALUES (?, ?, ?, ?, ?);
  `;
  const insertRunningLogRow = await connection.query(
    insertRunningLogStampQuery,
    insertPostingLogStampParams
  );

  return insertRunningLogRow;
}

// 상대방에게 찍은 러닝로그 스탬프 수정
async function changeRunningLogStamp(connection, changeLogStampParams) {
  const changeStampQuery = `
    UPDATE RunningLogStamp
    SET stampCode = ?
    WHERE logId = ? AND userId = ? AND targetId = ?;
  `;

  const changeStampRow = await connection.query(
    changeStampQuery,
    changeLogStampParams
  );
  return changeStampRow;
}

// 작성자인지 확인
async function checkWriter(connection, checkWriterParams) {
  const checkWriterQuery = `
    SELECT logId, userId FROM RunningLog
    WHERE logId = ? AND userId = ?;
  `;
  const checkWriterRow = await connection.query(
    checkWriterQuery,
    checkWriterParams
  );

  return checkWriterRow;
}

// 게시글 있는지 확인
async function checkPosting(connection, logId) {
  const checkPostingQuery = `
    SELECT logId FROM RunningLog WHERE logId = ?
  `;
  const checkPostingRow = await connection.query(checkPostingQuery, logId);
  return checkPostingRow;
}

// 날짜(월)에 해당하는 크루 러닝 카운트 수집
async function getMyGroupRunningCount(connection, year, month, userId) {
  const selectGroupRunningCountQuery = `
    SELECT COUNT(*) AS count
    FROM RunningLog
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ? AND gatheringId IS NOT NULL AND status != 'D';
  `;
  const [row] = await connection.query(selectGroupRunningCountQuery, [
    year,
    month,
    userId,
  ]);
  return row[0].count;
}

// 날짜(월)에 해당하는 개인 러닝 카운트 수집
async function getMyPersonalRunningCount(connection, year, month, userId) {
  const selectPersonalRunningCountQuery = `
    SELECT COUNT(*) AS count
    FROM RunningLog
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ? AND gatheringId IS NULL AND status != 'D';
  `;
  const [row] = await connection.query(selectPersonalRunningCountQuery, [
    year,
    month,
    userId,
  ]);
  return row[0].count;
}

// 날짜(월)에 해당하는 개인 러닝 데이터 수집
async function getMyRunning(connection, year, month, userId) {
  const selectRunningLogQuery = `
    SELECT logId, gatheringId, runnedDate, stampCode
    FROM RunningLog
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ? AND status != 'D';
  `;
  const [row] = await connection.query(selectRunningLogQuery, [
    year,
    month,
    userId,
  ]);
  return row;
}

// 러닝로그의 gatheringId 수집
async function getGatheringId(connection, logId) {
  const selectGatheringIdQuery = `
    SELECT gatheringId
    FROM RunningLog
    WHERE logId = ?;
  `;
  const [row] = await connection.query(selectGatheringIdQuery, logId);
  return row[0].gatheringId;
}

// 함께 달린 러너 카운트 수집
async function getPartnerRunnerCount(connection, gatheringId) {
  const selectPartnerRunnerCountQuery = `
    SELECT COUNT(*) AS count
    FROM RunningPeople
    WHERE gatheringId = ?;
  `;
  const [row] = await connection.query(
    selectPartnerRunnerCountQuery,
    gatheringId
  );
  return row[0].count - 1;
}

// 러닝로그 상세 조회 데이터 수집
async function getDetailRunningLog(connection, logId) {
  const selectDetailRunningLogQuery = `
    SELECT status, runnedDate, userId, stampCode, contents, imageUrl, weatherDegree, weatherIcon, isOpened
    FROM RunningLog
    WHERE logId = ?;
  `;
  const [row] = await connection.query(selectDetailRunningLogQuery, logId);
  return row;
}

// 특정인이 받은 스탬프 목록 조회
async function getDetailStampInfo(connection, gatheringId, targetId, logId) {
  const selectDetailStampInfoQuery = `
    SELECT RS.userId, R.logId, U.nickname, U.profileImageUrl, RS.stampCode
    FROM RunningLogStamp RS
    INNER JOIN User U on U.userId = RS.userId
    LEFT OUTER JOIN RunningLog R on R.userId = RS.userId AND R.gatheringId = ?
    WHERE RS.targetId = ? AND RS.logId = ?;
  `;
  const [row] = await connection.query(selectDetailStampInfoQuery, [
    gatheringId,
    targetId,
    logId,
  ]);
  return row;
}

// 함께한 러너 리스트 조회
async function getPartnerRunners(connection, userId, gatheringId) {
  const selectPartnerRunnersQuery = `
    SELECT RS.targetId as userId, U.nickname, U.profileImageUrl, RS.stampCode, R.isOpened
    FROM RunningLogStamp RS
    LEFT OUTER JOIN User U on U.userId = RS.targetId
    LEFT OUTER JOIN RunningLog R on R.userId = RS.targetId
    WHERE RS.userId = ? AND RS.gatheringId = ?;
  `;
  const [row] = await connection.query(selectPartnerRunnersQuery, [
    userId,
    gatheringId,
  ]);
  return row;
}

// 스탬프 리스트 조회
async function selectStampList(connection) {
  const query = `SELECT * FROM Stamp`;
  const row = await connection.query(query);
  return row[0];
}

module.exports = {
  createRunningLog,
  updateRunningLog,
  deleteRunningLog,
  createRunningLogStamp,
  changeRunningLogStamp,
  checkWriter,
  checkPosting,
  getMyGroupRunningCount,
  getMyPersonalRunningCount,
  getMyRunning,
  getGatheringId,
  getPartnerRunnerCount,
  getDetailRunningLog,
  getDetailStampInfo,
  getPartnerRunners,
  selectStampList,
};

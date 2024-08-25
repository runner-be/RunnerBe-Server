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
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ? AND gatheringId IS NOT NULL;
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
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ? AND gatheringId IS NULL;
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
    SELECT runnedDate, stampCode
    FROM RunningLog
    WHERE YEAR(runnedDate) = ? AND MONTH(runnedDate) = ? AND userId = ?;
  `;
  const [row] = await connection.query(selectRunningLogQuery, [
    year,
    month,
    userId,
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
  checkWriter,
  checkPosting,
  getMyGroupRunningCount,
  getMyPersonalRunningCount,
  getMyRunning,
  selectStampList,
};

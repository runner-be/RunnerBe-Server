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
  selectStampList,
};

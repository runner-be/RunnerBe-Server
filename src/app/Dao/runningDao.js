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
async function getDeviceToken(connection, userId) {
  const getDeviceTokenQuery = `
      select deviceToken, nickName
      from User
      where userId = ?
  `;
  const [getDeviceTokenRows] = await connection.query(
    getDeviceTokenQuery,
    userId
  );
  return getDeviceTokenRows;
}

// RP에 참석여부 업데이트
async function updateRPY(connection, updateParams) {
  const query = `
  UPDATE RunningPeople
  SET attendance = 1 , whetherCheck = 'Y'
  WHERE userId = ? AND gatheringId = (SELECT gatheringId FROM Running WHERE postId = ?);
                          `;

  const row = await connection.query(query, updateParams);

  return row;
}
async function updateRPN(connection, updateParams) {
  const query = `
  UPDATE RunningPeople
  SET attendance = 0 , whetherCheck = 'Y'
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

//작성자 이름 가져오기
async function getTitle(connection, postId) {
  const query = `
  select title from Posting where postId = ?;
                          `;

  const [row] = await connection.query(query, postId);

  return row[0].title;
}

async function getTitleAndSenderName(connection, roomId, userId) {
  const query = `
  select title, nickName from Posting P
  inner join Room R on P.postId = R.postId
  join (select nickName from User where userId = ${userId}) u
  where R.roomId = ${roomId};
                          `;

  const [row] = await connection.query(query);

  return row[0];
}
//푸쉬알림 수신 여부 확인
async function checkPushOn(connection, userId) {
  const query = `
  select pushOn from User where userId = ?;
  `;

  const [row] = await connection.query(query, userId);

  return row[0].pushOn;
}
//푸쉬알림 메시지 저장
async function savePushalarm(connection, repUserId, titleInstance, content) {
  const query = `
  INSERT INTO Alarm (userId, title, content) VALUES (?,?,?);
                          `;

  const row = await connection.query(query, [
    repUserId,
    titleInstance,
    content,
  ]);

  return row;
}

async function getUserCount(connection, roomId) {
  const query = `
  select count(roomId) as count from UserPerRoom where roomId = ?;
                          `;

  const row = await connection.query(query, roomId);

  return row[0][0]['count'];
}

async function checkFullPeople(connection, postId) {
  const query = `
  select curPeopleNum from 
  (
    select count(userId) as curPeopleNum, peopleNum as max from RunningPeople
      inner join Running R on RunningPeople.gatheringId = R.gatheringId
      inner join Posting P on R.postId = P.postId
    where P.postId = ?
  ) M where curPeopleNum = max;
                          `;

  const row = await connection.query(query, postId);

  return row[0][0];
}
module.exports = {
  sendRequest,
  handleRequest,
  checkApplicant,
  getDeviceToken,
  updateRPY,
  updateRPN,
  updateU,
  getTitle,
  getTitleAndSenderName,
  checkPushOn,
  savePushalarm,
  getUserCount,
  checkFullPeople
};

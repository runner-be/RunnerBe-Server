// userId 가져오기
async function getRepUserId(connection, postId) {
  const query = `
            SELECT repUserId FROM Running WHERE postId = ?;
                  `;

  const row = await connection.query(query, postId);

  return row[0][0]["repUserId"];
}

// 대화방 생성
async function createRoom(connection, postId) {
  const createRoomQuery = `
        INSERT INTO Room (postId) VALUES (?);
                 `;
  const createRoomRow = await connection.query(createRoomQuery, postId);

  return createRoomRow;
}

// UPR에 추가
async function insertUserPerRoom(connection, insertUserPerRoomParams) {
  const Query = `
        INSERT INTO UserPerRoom (roomId, userId) VALUES (?,?);
                   `;
  const Row = await connection.query(Query, insertUserPerRoomParams);

  return Row;
}
// roomId 가져오기
async function getRoomId(connection, postId) {
  const query = `
    select roomId FROM Room where postId = ?;
                    `;

  const row = await connection.query(query, postId);

  return row[0][0]["roomId"];
}

// 이전에 참여신청해서 거절당했는지 확인
async function checkAlreadyapply(connection, checkAlreadyParams) {
  const checkAlreadyapplyQuery = `
    SELECT userId FROM RunningPeople RP
    inner join Running R on RP.gatheringId = R.gatheringId
    WHERE userId = ? and postId = ? and whetherAccept = 'D';
                   `;
  const [checkAlreadyapplyRow] = await connection.query(
    checkAlreadyapplyQuery,
    checkAlreadyParams
  );
  return checkAlreadyapplyRow;
}

// 이전에 참여신청했는지만 확인
async function checkAlreadyapplyNotD(connection, checkAlreadyParams) {
  const checkAlreadyapplyQuery = `
    SELECT userId FROM RunningPeople RP
    inner join Running R on RP.gatheringId = R.gatheringId
    WHERE userId = ? and postId = ?;
                   `;
  const [checkAlreadyapplyRow] = await connection.query(
    checkAlreadyapplyQuery,
    checkAlreadyParams
  );
  return checkAlreadyapplyRow;
}
// Id 가져오기
async function getSender(connection, senderParams) {
  const query = `
    SELECT senderId FROM Room
    WHERE roomId = ? AND receiverId = ?;
                    `;

  const row = await connection.query(query, senderParams);

  return row[0][0]["senderId"];
}
async function checkSender(connection, senderParams) {
  const query = `
      SELECT senderId FROM Room
      WHERE roomId = ? AND senderId = ?;
                      `;

  const row = await connection.query(query, senderParams);

  return row;
}

// Id 가져오기
async function getReceiver(connection, senderParams) {
  const query = `
      SELECT receiverId FROM Room
      WHERE roomId = ? AND senderId = ?;
                      `;

  const row = await connection.query(query, senderParams);

  return row[0][0]["receiverId"];
}
async function checkReceiver(connection, senderParams) {
  const query = `
        SELECT receiverId FROM Room
        WHERE roomId = ? AND receiverId = ?;
                        `;

  const row = await connection.query(query, senderParams);

  return row;
}

// 쪽지 보내기 sendMessage
async function sendMessage(connection, sendMessageParams) {
  const sendMessageQuery = `
        INSERT INTO Message (userId, roomId, content) VALUES (?,?,?);
                     `;
  await connection.query(sendMessageQuery, sendMessageParams);
  return 0;
}

// MPR
async function MPR(connection, MPRParams) {
  const MPRQuery = `
            INSERT INTO MessagePerRoom (roomId, messageId) VALUES (?,?);
                       `;
  const [MPRRow] = await connection.query(MPRQuery, MPRParams);
  return MPRRow;
}

// 대화방 목록창 조회
async function getRoomList(connection, userId) {
  const query = `
    SELECT R.roomId, title, nickName as repUserName, profileImageUrl, recentMessage FROM Room R
    INNER JOIN Posting P on R.postId = P.postId
    INNER JOIN User U on U.userId = P.postUserId
    INNER JOIN UserPerRoom UPR on R.roomId = UPR.roomId
    where UPR.userId = ?;
                          `;
  const row = await connection.query(query, userId);

  return row[0];
}

// 대화방 myChat
async function getChat(connection, getChatParams) {
  const query = `
  SELECT  R.roomId, userId,nickName, profileImageUrl,DATE_FORMAT(M.createdAt, '%Y/%c/%d %p %l:%i') as sendingTime, content, M.createdAt as criterionTime
  FROM Message M
  INNER JOIN MessagePerRoom MPR on M.messageId = MPR.messageId
  INNER JOIN Room R on MPR.roomId = R.roomId
  INNER JOIN User U on U.userId = M.senderId
  WHERE R.roomId = ? and M.senderId = ? or M.receiverId = ?;
                            `;

  const row = await connection.query(query, getChatParams);

  return row;
}

// 대화방 정보
async function getRoomInfo(connection, roomId) {
  const query = `
    SELECT P.postId, case when runningTag = 'A'
    then '퇴근 후'
      else case when runningTag = 'B'
    then '출근 전'
      else case when runningTag = 'H'
    then '휴일'
    end end end as runningTag, title
    FROM Room
    INNER JOIN Posting P on Room.postId = P.postId
    WHERE roomId = ?;
                                `;

  const row = await connection.query(query, roomId);

  return row[0];
}

// 읽음 처리
async function reading(connection, roomId) {
  const query = `
    UPDATE Message
    INNER JOIN  MessagePerRoom MPR on Message.messageId = MPR.messageId
    SET whetherRead = REPLACE(whetherRead, 'N', 'Y')
    WHERE whetherRead = 'N' AND roomId = ?;
                                  `;

  const row = await connection.query(query, roomId);

  return row;
}

// 러닝 생성자 확인
async function checkMaster(connection, userId) {
  const query = `
    SELECT receiverId
    FROM Room
    WHERE receiverId = ?;
                                    `;

  const row = await connection.query(query, userId);

  return row;
}

// 대화방의 신청 여부 확인
async function checkApplyStatus(connection, roomId) {
  const query = `
    SELECT applyStatus FROM Room WHERE roomId = ? AND applyStatus = 'Y';
                                    `;

  const row = await connection.query(query, roomId);

  return row;
}

// 참여 신청 완료로 바꾸기
async function changeApply(connection, roomId) {
  const query = `
    UPDATE Room SET applyStatus = 'Y' WHERE roomId = ?;
                                    `;
  const row = await connection.query(query, roomId);

  return row;
}

// 방에 있는지 확인
async function checkUserInRoom(connection, checkUserInRoomParams) {
  const query = `
   SELECT roomId FROM UserPerRoom WHERE roomId = ? AND userId = ?;
                                    `;
  const row = await connection.query(query, checkUserInRoomParams);

  return row;
}

// 참여 신청 처리 여부 확인
async function checkApplyChanged(connection, roomId) {
  const query = `
    SELECT roomId FROM Room WHERE status = 'W' AND roomId = ?;
                                    `;
  const row = await connection.query(query, roomId);

  return row;
}

// 메시지 리스트 가져오기
async function getMessageList(connection, getMessageListParams) {
  const query = `
    SELECT messageId, content, M.createdAt, U.userId, nickName, profileImageUrl,
    case when U.userId = ? then 'Me' else 'Others' end as messageFrom,
    case when U.userId = postUserId then 'Y' else 'N' end as whetherPostUser
    FROM Message M
    INNER JOIN User U on M.userId = U.userId
    INNER JOIN Room R on M.roomId = R.roomId
    INNER JOIN Posting P on R.postId = P.postId
    WHERE M.roomId = ?;
                                      `;
  const row = await connection.query(query, getMessageListParams);

  return row[0];
}

// recentMessage Y로 변경
async function updateRecentMessageY(connection, roomId) {
  const query = `
        UPDATE UserPerRoom SET recentMessage = 'Y' where roomId = ?;
                                      `;
  const row = await connection.query(query, roomId);

  return row;
}

// 조회한 사람은 recentMessage N로 변경
async function updateRecentMessageN(connection, updateRecentMessageNParams) {
  const query = `
        UPDATE UserPerRoom SET recentMessage = 'N' where roomId = ? and userId = ?;
                                        `;
  const row = await connection.query(query, updateRecentMessageNParams);

  return row;
}

// 메시지 신고
async function reportMessage(connection, [messageId, userId]) {
  const query = `
        INSERT INTO MessageReport (messageId, reporterId) VALUES (?,?);
                                        `;
  const row = await connection.query(query, [messageId, userId]);

  return row;
}

// messageId 존재 확인
async function getMessageId(connection, messageId) {
  const query = `
        select messageId from Message where messageId = ?;
                                        `;
  const row = await connection.query(query, messageId);

  return row[0];
}

async function joinRoom(connection, [roomId, userId]) {
  const query = `
        INSERT INTO UserPerRoom (roomId, userId) VALUES (?,?);
                                        `;
  const row = await connection.query(query, [roomId, userId]);

  return row[0];
}
module.exports = {
  getRepUserId,
  createRoom,
  checkAlreadyapply,
  checkAlreadyapplyNotD,
  checkSender,
  getSender,
  checkReceiver,
  getReceiver,
  sendMessage,
  MPR,
  getRoomList,
  getChat,
  getRoomInfo,
  reading,
  checkMaster,
  checkApplyStatus,
  changeApply,
  checkUserInRoom,
  checkApplyChanged,
  insertUserPerRoom,
  getRoomId,
  updateRecentMessageY,
  updateRecentMessageN,
  getMessageList,
  reportMessage,
  getMessageId,
  joinRoom
};

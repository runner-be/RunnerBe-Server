// userId 가져오기
async function getRepUserId(connection, postId) {
    const query = `
            SELECT repUserId FROM Running WHERE postId = ?;
                  `;

    const row = await connection.query(query, postId);

    return row[0][0]["repUserId"];
}

// 대화방 생성
async function createRoom(connection, createRoomParams) {
    const createRoomQuery = `
            INSERT INTO Room (postId, senderId, receiverId) VALUES (?,?,?);
                 `;
    const createRoomRow = await connection.query(
        createRoomQuery,
        createRoomParams
    );

    return createRoomRow;
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
        INSERT INTO Message (senderId, receiverId, content) VALUES (?,?,?);
                     `;
    const [sendMessageRow] = await connection.query(
        sendMessageQuery,
        sendMessageParams
    );
    return sendMessageRow;
}

// MPR
async function MPR(connection, MPRParams) {
    const MPRQuery = `
            INSERT INTO MessagePerRoom (roomId, messageId) VALUES (?,?);
                       `;
    const [MPRRow] = await connection.query(MPRQuery, MPRParams);
    return MPRRow;
}

// 쪽지 목록창 조회
async function getMessageList(connection, userId) {
    const query = `
  SELECT R.roomId, title, counterId, nickName, profileImageUrl
  FROM Room R
  INNER JOIN Posting P on R.postId = P.postId
  INNER JOIN (SELECT roomId, case when receiverId = ${userId} then senderId
              when senderId = ${userId} then receiverId
      end as counterId
  FROM Room R
  INNER JOIN Posting P on R.postId = P.postId
  WHERE senderId = ${userId} or receiverId = ${userId}) D on D.roomId = R.roomId
  INNER JOIN User U on U.userId = D.counterId
  WHERE senderId = ${userId} or receiverId = ${userId};
                          `;

    const row = await connection.query(query);

    return row;
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
    SELECT case when runningTag = 'A'
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

    return row;
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
   SELECT roomId FROM Room WHERE roomId = ? AND (senderId = ? OR receiverId = ?);
                                    `;
    const row = await connection.query(query, checkUserInRoomParams);

    return row;
}
module.exports = {
    getRepUserId,
    createRoom,
    checkAlreadyapply,
    checkSender,
    getSender,
    checkReceiver,
    getReceiver,
    sendMessage,
    MPR,
    getMessageList,
    getChat,
    getRoomInfo,
    reading,
    checkMaster,
    checkApplyStatus,
    changeApply,
    checkUserInRoom,
};

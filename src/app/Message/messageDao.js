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
};

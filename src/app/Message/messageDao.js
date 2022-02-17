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

module.exports = { getRepUserId, createRoom };

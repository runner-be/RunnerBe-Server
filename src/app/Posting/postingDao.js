// 게시글 생성
async function createPosting(connection, insertPostingParams) {
    const insertPostingQuery = `
  INSERT INTO Posting(postUserId, title, gatheringTime, runningTime, gatherLongitude, gatherLatitude, locationInfo, runningTag, ageMin, ageMax, peopleNum, contents, runnerGender)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                 `;
    const insertPostingRow = await connection.query(
        insertPostingQuery,
        insertPostingParams
    );

    return insertPostingRow;
}

// 러닝모임 생성
async function createRunning(connection, createRunningParams) {
    const createRunningQuery = `
                INSERT INTO Running(repUserId, postId) VALUES (?,?);
                   `;
    const createRunningRow = await connection.query(
        createRunningQuery,
        createRunningParams
    );

    return createRunningRow;
}

// 러닝 당 people에 반장 추가
async function creaetRunningPeople(connection, insertRunningPeopleParams) {
    const creaetRunningPeopleQuery = `
                  INSERT INTO RunningPeople(gatheringId, userId, whetherAccept) VALUES (?,?,'Y');
                   `;
    const creaetRunningPeopleRow = await connection.query(
        creaetRunningPeopleQuery,
        creaetRunningPeopleParams
    );

    return creaetRunningPeopleRow;
}
// 유저 있는지 확인
async function userIdCheck(connection, userId) {
    const findUserQuery = `
                SELECT userId FROM User WHERE userId = ?
                   `;
    const findUserRow = await connection.query(findUserQuery, userId);

    return findUserRow;
}

module.exports = {
    createPosting,
    userIdCheck,
    createRunning,
};

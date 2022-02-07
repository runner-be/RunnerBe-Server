// 모든 유저 조회
async function selectUser(connection) {
    const selectUserListQuery = `
                SELECT *
                FROM User;
                `;
    const [userRows] = await connection.query(selectUserListQuery);
    return userRows;
}

// uuid 존재 여부 확인
async function checkUuidExist(connection, uuid) {
    const query = `
                select exists(select uuid
                              from User
                              where uuid = ?) as exist;
                `;

    const row = await connection.query(query, uuid);

    return row[0][0]["exist"];
}

// userId 가져오기
async function selectUserId(connection, uuid) {
    const query = `
                select userId
                from User
                where uuid = ?;
                `;

    const row = await connection.query(query, uuid);

    return row[0][0]["userId"];
}

// uuid 체크
async function selectUuid(connection, uuid) {
    const selectUuidQuery = `
                SELECT uuid
                FROM User
                WHERE uuid = ?;
                `;
    const [uuidRows] = await connection.query(selectUuidQuery, uuid);
    return uuidRows;
}

//이메일 체크
async function selectUseremail(connection, hashedEmail) {
    const selectUseremailQuery = `
              SELECT officeEmail, userId
              FROM User
              WHERE officeEmail = ?;
              `;
    const [emailRows] = await connection.query(selectUseremailQuery, hashedEmail);
    return emailRows;
}

//인증을 위한 이메일 체크
async function selectUseremailForAuth(connection, officeEmail) {
    const selectUseremailQuery = `
              SELECT officeEmail, userId
              FROM User
              WHERE officeEmail = ?;
              `;
    const [emailRows] = await connection.query(selectUseremailQuery, officeEmail);
    return emailRows;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
    const insertUserInfoQuery = `
  INSERT INTO User(uuid, birthday, gender, job, idCardImageUrl, officeEmail)
  VALUES (?, ?, ?, ?, ?, ?);
  `;
    const insertUserInfoRow = await connection.query(
        insertUserInfoQuery,
        insertUserInfoParams
    );

    return insertUserInfoRow;
}

// job 존재 여부 확인
async function checkJobExist(connection, job) {
    const query = `
                select exists(select jobCode
                              from Job
                              where jobCode = ?) as exist;
                `;

    const row = await connection.query(query, job);

    return row[0][0]["exist"];
}
module.exports = {
    selectUser,
    checkUuidExist,
    selectUserId,
    selectUuid,
    selectUseremail,
    insertUserInfo,
    checkJobExist,
    selectUseremailForAuth,
};

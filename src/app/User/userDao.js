// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                  SELECT *
                  FROM User;
                  `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

//uuid로 회원 삭제
async function deleteUser(connection, uuid) {
  const deleteUserQuery = `
                  DELETE FROM User 
                  Where uuid = ?;
                  `;
  const [deleteUserRows] = await connection.query(deleteUserQuery, uuid);
  return deleteUserRows;
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

// nickName 체크
async function selectNickName(connection, nickName) {
  const selectNickNameQuery = `
                  SELECT nickName
                  FROM User
                  WHERE nickName = ?;
                  `;
  const [nickNameRows] = await connection.query(selectNickNameQuery, nickName);
  return nickNameRows;
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

// 유저 생성, 이메일 인증
async function insertUserInfoEmail(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
                INSERT INTO User(uuid, nickName, birthday, gender, job, idCardImageUrl, officeEmail, deviceToken)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                 `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 유저 생성, 사원증 인증
async function insertUserInfoPhoto(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
                INSERT INTO User(status, uuid, nickName, birthday, gender, job, idCardImageUrl, officeEmail, deviceToken)
                VALUES ('W',?, ?, ?, ?, ?, ?, ?, ?);
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

async function patchUserName(connection, patchUserNameList) {
  const patchUserNameQuery = `
                UPDATE User
                SET nickName = ? , nameChanged = 'Y'
                WHERE userId = ?;
                 `;
  const patchUserNameRow = await connection.query(
    patchUserNameQuery,
    patchUserNameList
  );

  return patchUserNameRow;
}

// 닉네임 변경이력 확인 -> Y이면 변경한 적이 있음
async function checkRecord(connection, userId) {
  const checkRecordQuery = `
                  SELECT nameChanged
                  FROM User
                  WHERE userId = ? AND nameChanged = 'Y';
                  `;
  const [recordRows] = await connection.query(checkRecordQuery, userId);
  return recordRows;
}

// 메인 페이지
async function getMain(
  connection,
  userLongitude,
  userLatitude,
  runningTag,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition
) {
  const getMainQuery = `
    SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
            runningTime,
            gatheringTime,
           gatherLongitude, gatherLatitude, locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
           case when runnerGender='A' then '전체'
           else
           case when runnerGender='M' then '남성'
           else
           case when runnerGender='F' then '여성'
            end end end as gender,
            DISTANCE,
           whetherEnd, J.job
    FROM Posting P
    INNER JOIN User U on U.userId = P.postUserId
    INNER JOIN Running R on R.postId = P.postId
    INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
    FROM RunningPeople RP
    inner join Running R on RP.gatheringId = R.gatheringId
    inner join User U on RP.userId = U.userId
    group by postId) J on J.postId = P.postId
    inner join (SELECT postId, CAST((6371 * acos(cos(radians(${userLatitude})) * cos(radians(gatherLatitude)) *
                              cos(radians(gatherLongitude) - radians(${userLongitude})) +
                              sin(radians(${userLatitude})) * sin(radians(gatherLatitude)))) AS DECIMAL(10,2)) AS DISTANCE FROM Posting) D
    on D.postId = P.postId
    WHERE DISTANCE < 150 AND runningTag = "${runningTag}" ${distanceCondition}
    ${whetherEndCondition} ${genderCondition} ${jobCondition} ${ageCondition} ${keywordCondition}
    ORDER BY "${sortCondition}";
                  `;
  const [mainRows] = await connection.query(getMainQuery);
  return mainRows;
}

// // 직군 코드
// async function getJob(connection) {
//   const getJobQuery = `
//   SELECT DISTINCT postId,
//   case when job = 'PSV' then '공무원'
//       when job = 'EDU' then '교육'
//       when job = 'DEV' then '개발'
//       when job = 'PSM' then '기획/전략/경영'
//       when job = 'DES' then '디자인'
//       when job = 'MPR' then '마케팅/PR'
//       when job = 'SER' then '서비스'
//       when job = 'PRO' then '생산'
//       when job = 'RES' then '연구'
//       when job = 'SAF' then '영업/제휴'
//       when job = 'MED' then '의료'
//       when job = 'HUR' then '인사'
//       when job = 'ACC' then '제무/회계'
//       when job = 'CUS' then 'CS'
//       end as job
//   FROM RunningPeople RP
//   inner join Running R on RP.gatheringId = R.gatheringId
//   inner join User U on RP.userId = U.userId
//   WHERE  whetherAccept = 'Y';
//                 `;
//   const [getJobRows] = await connection.query(getJobQuery);
//   return getJobRows;
// }

// 유저 인증 여부 확인
async function checkUserStatus(connection, selectUserId) {
  const checkUserStatusQuery = `
              SELECT userId FROM User
              WHERE userId = ? AND status = 'Y';
                  `;
  const [statusYRows] = await connection.query(
    checkUserStatusQuery,
    selectUserId
  );
  return statusYRows;
}

// 유저 인증 여부 확인
async function checkUserAuth(connection, userIdFromJWT) {
  const checkUserStatusQuery = `
              SELECT userId FROM User
              WHERE userId = ? AND status = 'Y';
                  `;
  const [statusYRows] = await connection.query(
    checkUserStatusQuery,
    userIdFromJWT
  );
  return statusYRows;
}
// 유저 인증 이후 최초 접속인지 확인
async function checkFirst(connection, userIdFromJWT) {
  const checkFirstQuery = `
              SELECT userId FROM User
              WHERE userId = ? AND status = 'F';
                  `;
  const [statusFRows] = await connection.query(checkFirstQuery, userIdFromJWT);
  return statusFRows;
}
// F -> Y
async function changeStatus(connection, userIdFromJWT) {
  const changeStatusQuery = `
              UPDATE User SET status = 'Y' where userId = ?;
                  `;
  const [statusRows] = await connection.query(changeStatusQuery, userIdFromJWT);
  return statusRows;
}

// BM에 있는지 확인
async function checkAddBM(connection, checkAddBMParams) {
  const checkAddBMQuery = `
    SELECT userId FROM Bookmarks WHERE userId = ? AND postId = ?;
                  `;
  const [checkAddBMRows] = await connection.query(
    checkAddBMQuery,
    checkAddBMParams
  );
  return checkAddBMRows;
}

// 찜 등록
async function addBMY(connection, addBMParams) {
  const addBMYQuery = `
    INSERT INTO Bookmarks (userId, postId) VALUES (?,?);
                  `;
  const [addBMYRows] = await connection.query(addBMYQuery, addBMParams);
  return addBMYRows;
}

// 찜 해제
async function addBMN(connection, addBMParams) {
  const addBMNQuery = `
    DELETE FROM Bookmarks WHERE userId = ? AND postId = ?;
                  `;
  const [addBMNRows] = await connection.query(addBMNQuery, addBMParams);
  return addBMNRows;
}

// 찜 목록
async function getBM(connection, userId) {
  const getBMQuery = `
    SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
            runningTime,
            gatheringTime,
           gatherLongitude, gatherLatitude, locationInfo, concat(ageMin,'-',ageMax) as age,
           case when runnerGender='A' then '전체'
           else
           case when runnerGender='M' then '남성'
           else
           case when runnerGender='F' then '여성'
            end end end as gender, whetherEnd, B.userId, runningTag
    FROM Posting P
    INNER JOIN User U on U.userId = P.postUserId
    INNER JOIN Running R on R.postId = P.postId
    LEFT OUTER JOIN Bookmarks B on P.postId = B.postId
    WHERE B.userId = ?;
                  `;
  const [getBMRows] = await connection.query(getBMQuery, userId);
  return getBMRows;
}

// 찜 개수
async function getBMNum(connection, userId) {
  const getBMNumQuery = `
    SELECT CONCAT('총 ',COUNT(bookmarkId),'건') as num FROM Bookmarks
    WHERE userId = ?
    group by userId ;
                  `;
  const [getBMNumRows] = await connection.query(getBMNumQuery, userId);
  return getBMNumRows;
}

// 프로필 사진 변경
async function patchUserImage(connection, patchUserImageParams) {
  const patchUserImageQuery = `
      UPDATE User
      SET profileImageUrl = ?
      WHERE userId = ?;
                 `;
  const patchUserImageRow = await connection.query(
    patchUserImageQuery,
    patchUserImageParams
  );

  return patchUserImageRow;
}

// 직군 변경
async function patchUserJob(connection, patchUserJobParams) {
  const patchUserJobQuery = `
      UPDATE User
      SET job = ?, updatedAt = current_timestamp()
      WHERE userId = ?;
                 `;
  const patchUserJobRow = await connection.query(
    patchUserJobQuery,
    patchUserJobParams
  );

  return patchUserJobRow;
}

//마이페이지 상단 정보
async function getmyInfo(connection, userId) {
  const Query = `
    SELECT U.userId, nickName,
               case when gender='M' then '남성'
                    else case when gender='F' then '여성'
                        end end as gender,
               case when 0<= (DATE_FORMAT(now(),'%Y')-birthday)%10 and (DATE_FORMAT(now(),'%Y')-birthday)%10 <=3
            then CONCAT((DATE_FORMAT(now(),'%Y')-birthday) - (DATE_FORMAT(now(),'%Y')-birthday)%10,'대 초반')
            when 3< (DATE_FORMAT(now(),'%Y')-birthday)%10 and (DATE_FORMAT(now(),'%Y')-birthday)%10<=6
            then CONCAT((DATE_FORMAT(now(),'%Y')-birthday) - (DATE_FORMAT(now(),'%Y')-birthday)%10,'대 중반')
            when 6<(DATE_FORMAT(now(),'%Y')-birthday)%10 and (DATE_FORMAT(now(),'%Y')-birthday)%10<=9
            then CONCAT((DATE_FORMAT(now(),'%Y')-birthday) - (DATE_FORMAT(now(),'%Y')-birthday)%10,'대 후반')
        end as age,
       case when  U.diligence <= 32
           then '불량 러너'
        else case when 32< U.diligence AND U.diligence<= 66
            then '노력 러너'
        else case when 66< U.diligence
            then '성실 러너'
        end end end as diligence,
       case when job = 'PSV' then '공무원'
           when job = 'EDU' then '교육'
            when job = 'DEV' then '개발'
            when job = 'PSM' then '기획/전략/경영'
            when job = 'DES' then '디자인'
            when job = 'MPR' then '마케팅/PR'
            when job = 'SER' then '서비스'
            when job = 'PRO' then '생산'
            when job = 'RES' then '연구'
            when job = 'SAF' then '영업/제휴'
            when job = 'MED' then '의료'
            when job = 'HUR' then '인사'
            when job = 'ACC' then '제무/회계'
            when job = 'CUS' then 'CS'
        end as job
        ,profileImageUrl FROM User U
        WHERE U.userId = ?;
                  `;
  const [Rows] = await connection.query(Query, userId);
  return Rows;
}

// 마이페이지 참여한 러닝
async function getMyRunning(connection, userId) {
  const Query = `
    SELECT P.postId,postUserId, U.nickName, U.profileImageUrl, title,
    runningTime,
    gatheringTime,
   locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
   case when runnerGender='A' then '전체'
   else
   case when runnerGender='M' then '남성'
   else
   case when runnerGender='F' then '여성'
    end end end as gender, whetherEnd, J.job,
  EXISTS (SELECT bookmarkId FROM Bookmarks
          WHERE userId = ${userId} AND postId = P.postId) as bookMark,attendance
  FROM Posting P
  INNER JOIN User U on U.userId = P.postUserId
  INNER JOIN Running R on R.postId = P.postId
  INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
  FROM RunningPeople RP
  inner join Running R on RP.gatheringId = R.gatheringId
  inner join User U on RP.userId = U.userId
  group by postId) J on J.postId = P.postId
  INNER JOIN (SELECT * FROM RunningPeople WHERE userId = ?) RPP on R.gatheringId = RPP.gatheringId;
                  `;
  const [Rows] = await connection.query(Query, userId);
  return Rows;
}

// 마이페이지 내가 쓴 글
async function getMyPosting(connection, userId) {
  const query1 = `
    SELECT P.postId,postUserId, U.nickName, U.profileImageUrl, title,
    runningTime,
    gatheringTime,
   locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
   case when runnerGender='A' then '전체'
   else
   case when runnerGender='M' then '남성'
   else
   case when runnerGender='F' then '여성'
    end end end as gender, whetherEnd, J.job
    FROM Posting P
  INNER JOIN User U on U.userId = P.postUserId
  INNER JOIN Running R on R.postId = P.postId
  INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
  FROM RunningPeople RP
  inner join Running R on RP.gatheringId = R.gatheringId
  inner join User U on RP.userId = U.userId
  group by postId) J on J.postId = P.postId
  WHERE postUserId = ?;
                  `;
  // const query2 = `
  // SELECT R.postId, attendance FROM RunningPeople
  // INNER JOIN Running R on RunningPeople.gatheringId = R.gatheringId
  // INNER JOIN Posting P on R.postId = P.postId
  // WHERE postUserId = ? AND userId = ?
  // `;
  const row1 = await connection.query(query1, userId);
  // const row2 = await connection.query(query2, [userId, userId]);
  // return (result = {
  //   postingInfo: row1[0],
  //   attendance: row2[0],
  // });
  return row1[0];
}

//직군 변경 후 3개월 지났는지 확인
async function checkTerm(connection, userId) {
  const Query = `
    SELECT userId FROM User WHERE userId = ? AND DATEDIFF(current_timestamp, updatedAt) > 180;
                  `;
  const [Rows] = await connection.query(Query, userId);
  return Rows;
}

// 회원 탈퇴
async function deleteUser(connection, userId) {
  const query1 = `
    DELETE FROM User WHERE userId = ?;
                  `;
  const query2 = `
    DELETE FROM Posting WHERE postUserId = ?;
    `;
  const query3 = `
    DELETE FROM Running WHERE repUserId = ?;
    `;
  const query4 = `
    DELETE FROM RunningPeople WHERE userId = ?;
    `;
  const query5 = `
    DELETE FROM Bookmarks WHERE userId = ?;
    `;
  const row1 = await connection.query(query1, userId);
  const row2 = await connection.query(query2, userId);
  const row3 = await connection.query(query3, userId);
  const row4 = await connection.query(query4, userId);
  const row5 = await connection.query(query5, userId);

  return 0;
}

// 메인페이지 v2 둘러보기
async function getMain2(
  connection,
  userLongitude,
  userLatitude,
  runningTag,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition
) {
  const getMainQuery = `
    SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
            runningTime,
            gatheringTime,
           gatherLongitude, gatherLatitude, locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
           case when runnerGender='A' then '전체'
           else
           case when runnerGender='M' then '남성'
           else
           case when runnerGender='F' then '여성'
            end end end as gender,
            DISTANCE,
           whetherEnd, J.job, peopleNum, contents
    FROM Posting P
    INNER JOIN User U on U.userId = P.postUserId
    INNER JOIN Running R on R.postId = P.postId
    INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
    FROM RunningPeople RP
    inner join Running R on RP.gatheringId = R.gatheringId
    inner join User U on RP.userId = U.userId
    group by postId) J on J.postId = P.postId
    inner join (SELECT postId, CAST((6371 * acos(cos(radians(${userLatitude})) * cos(radians(gatherLatitude)) *
                              cos(radians(gatherLongitude) - radians(${userLongitude})) +
                              sin(radians(${userLatitude})) * sin(radians(gatherLatitude)))) AS DECIMAL(10,2)) AS DISTANCE FROM Posting) D
    on D.postId = P.postId
    WHERE DISTANCE < 150 AND runningTag = "${runningTag}" ${distanceCondition}
    ${whetherEndCondition} ${genderCondition} ${jobCondition} ${ageCondition} ${keywordCondition}
    ORDER BY "${sortCondition}";
                  `;
  const [mainRows] = await connection.query(getMainQuery);
  return mainRows;
}

// 메인페이지 v2
async function getMain2Login(
  connection,
  userLongitude,
  userLatitude,
  runningTag,
  whetherEndCondition,
  sortCondition,
  distanceCondition,
  genderCondition,
  jobCondition,
  ageCondition,
  keywordCondition,
  userId
) {
  const getMainQuery = `
    SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
            runningTime,
            gatheringTime,
           gatherLongitude, gatherLatitude, locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
           case when runnerGender='A' then '전체'
           else
           case when runnerGender='M' then '남성'
           else
           case when runnerGender='F' then '여성'
            end end end as gender,
            DISTANCE,
           whetherEnd, J.job, peopleNum, contents,
           EXISTS (SELECT bookmarkId FROM Bookmarks
            WHERE userId = ${userId} AND postId = P.postId) as bookMark
    FROM Posting P
    INNER JOIN User U on U.userId = P.postUserId
    INNER JOIN Running R on R.postId = P.postId
    INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
    FROM RunningPeople RP
    inner join Running R on RP.gatheringId = R.gatheringId
    inner join User U on RP.userId = U.userId
    group by postId) J on J.postId = P.postId
    inner join (SELECT postId, CAST((6371 * acos(cos(radians(${userLatitude})) * cos(radians(gatherLatitude)) *
                              cos(radians(gatherLongitude) - radians(${userLongitude})) +
                              sin(radians(${userLatitude})) * sin(radians(gatherLatitude)))) AS DECIMAL(10,2)) AS DISTANCE FROM Posting) D
    on D.postId = P.postId
    WHERE DISTANCE < 150 AND runningTag = "${runningTag}" ${distanceCondition}
    ${whetherEndCondition} ${genderCondition} ${jobCondition} ${ageCondition} ${keywordCondition}
    ORDER BY "${sortCondition}";
                  `;
  const [mainRows] = await connection.query(getMainQuery);
  return mainRows;
}

// 찜 목록 v2
async function getBM2(connection, userId) {
  const getBMQuery = `
  SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
  runningTime, gatheringTime, gatherLongitude, gatherLatitude, locationInfo, runningTag, concat(ageMin,'-',ageMax) as age,
  case when runnerGender='A' then '전체'
  else
  case when runnerGender='M' then '남성'
  else
  case when runnerGender='F' then '여성'
  end end end as gender, whetherEnd, B.userId, J.job, peopleNum, contents,
  EXISTS (SELECT bookmarkId FROM Bookmarks
  WHERE userId = ${userId} AND postId = P.postId) as bookMark
  FROM Posting P
  INNER JOIN User U on U.userId = P.postUserId
  INNER JOIN Running R on R.postId = P.postId
  INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
  FROM RunningPeople RP
  inner join Running R on RP.gatheringId = R.gatheringId
  inner join User U on RP.userId = U.userId
  group by postId) J on J.postId = P.postId
  LEFT OUTER JOIN Bookmarks B on P.postId = B.postId
  WHERE B.userId = ?;
                  `;
  const [getBMRows] = await connection.query(getBMQuery, userId);
  return getBMRows;
}

// 마이페이지 내가 쓴 글 v2
async function getMyPosting2(connection, userId) {
  const query = `
  SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
  runningTime,
  gatheringTime, gatherLongitude, gatherLatitude,
  locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
  case when runnerGender='A' then '전체'
  else
  case when runnerGender='M' then '남성'
  else
  case when runnerGender='F' then '여성'
  end end end as gender, whetherEnd, J.job, peopleNum, contents, U.userId,
  EXISTS (SELECT bookmarkId FROM Bookmarks
  WHERE userId = ${userId} AND postId = P.postId) as bookMark
  FROM Posting P
  INNER JOIN User U on U.userId = P.postUserId
  INNER JOIN Running R on R.postId = P.postId
  INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
  FROM RunningPeople RP
  inner join Running R on RP.gatheringId = R.gatheringId
  inner join User U on RP.userId = U.userId
  group by postId) J on J.postId = P.postId
  WHERE postUserId = ?;
                  `;

  const row = await connection.query(query, userId);
  return row[0];
}

// 마이페이지 참여한 러닝
async function getMyRunning2(connection, userId) {
  const Query = `
  SELECT P.postId, P.createdAt as postingTime, postUserId, U.nickName, U.profileImageUrl, title,
  runningTime,
  gatheringTime, gatherLongitude, gatherLatitude,
 locationInfo, runningTag,concat(ageMin,'-',ageMax) as age,
 case when runnerGender='A' then '전체'
 else
 case when runnerGender='M' then '남성'
 else
 case when runnerGender='F' then '여성'
  end end end as gender, whetherEnd, J.job, peopleNum, contents, U.userId,
EXISTS (SELECT bookmarkId FROM Bookmarks
        WHERE userId = ${userId} AND postId = P.postId) as bookMark,attendance
FROM Posting P
INNER JOIN User U on U.userId = P.postUserId
INNER JOIN Running R on R.postId = P.postId
INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
FROM RunningPeople RP
inner join Running R on RP.gatheringId = R.gatheringId
inner join User U on RP.userId = U.userId
group by postId) J on J.postId = P.postId
INNER JOIN (SELECT * FROM RunningPeople WHERE userId = ?) RPP on R.gatheringId = RPP.gatheringId;
                  `;
  const [Rows] = await connection.query(Query, userId);
  return Rows;
}

// 유저 생성 - v2 인증 삭제

async function insertUserV2(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
                  INSERT INTO User(uuid, nickName, birthday, gender, job, deviceToken)
                  VALUES (?, ?, ?, ?, ?, ?);
                   `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// firebase token 변경
async function patchUserDeviceToken(connection, patchUserDeviceTokenParams) {
  const Query = `
      UPDATE User
      SET deviceToken = ?, updatedAt = current_timestamp()
      WHERE userId = ?;
                 `;
  const Row = await connection.query(Query, patchUserDeviceTokenParams);

  return Row;
}
module.exports = {
  selectUser,
  deleteUser,
  checkUuidExist,
  selectUserId,
  selectUuid,
  selectNickName,
  selectUseremail,
  insertUserInfoEmail,
  insertUserInfoPhoto,
  checkJobExist,
  selectUseremailForAuth,
  patchUserName,
  checkRecord,
  getMain,
  checkUserStatus,
  checkUserAuth,
  checkFirst,
  changeStatus,
  checkAddBM,
  addBMY,
  addBMN,
  getBM,
  getBMNum,
  patchUserImage,
  patchUserJob,
  getmyInfo,
  getMyRunning,
  getMyPosting,
  checkTerm,
  deleteUser,
  getMain2,
  getMain2Login,
  getBM2,
  getMyPosting2,
  getMyRunning2,
  insertUserV2,
  patchUserDeviceToken,
};

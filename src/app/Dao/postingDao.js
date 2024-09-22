// 게시글 생성
async function createPosting(connection, insertPostingParams) {
  const insertPostingQuery = `
INSERT INTO Posting(postUserId, title, gatheringTime, runningTime, gatherLongitude, gatherLatitude, locationInfo, placeName, placeExplain, runningTag, ageMin, ageMax, peopleNum, contents, runnerGender, pace, afterParty)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
async function createRunningPeople(connection, insertRunningPeopleParams) {
  const createRunningPeopleQuery = `
                INSERT INTO RunningPeople(gatheringId, userId, whetherAccept) VALUES (?,?,'Y');
                 `;
  const createRunningPeopleRow = await connection.query(
    createRunningPeopleQuery,
    insertRunningPeopleParams
  );

  return createRunningPeopleRow;
}
// 유저 있는지 확인
async function userIdCheck(connection, userId) {
  const findUserQuery = `
              SELECT userId FROM User WHERE userId = ?
                 `;
  const findUserRow = await connection.query(findUserQuery, userId);

  return findUserRow;
}

// 작성자인지 확인
async function checkWriter(connection, checkWriterParams) {
  const checkWriterQuery = `
              SELECT postId, postUserId FROM Posting
              where postId = ? and postUserId = ?;
                 `;
  const checkWriterRow = await connection.query(
    checkWriterQuery,
    checkWriterParams
  );

  return checkWriterRow;
}

//게시글 상세페이지
async function getPosting(connection, postId) {
  const getPostingQuery = `
SELECT P.postId, P.createdAt as postingTime, postUserId,
     case when runningTag = 'A'
         then '퇴근 후'
      else case when runningTag = 'B'
          then '출근 전'
      else case when runningTag = 'H'
          then '휴일'
      end end end as runningTag,
     title,
      gatheringTime,
      runningTime,
     case when runnerGender='A' then '전체'
     else case when runnerGender='M' then '남성'
     else case when runnerGender='F' then '여성'
      end end end as gender,
     concat(ageMin,'-',ageMax) as age,
     CONCAT('최대 ',peopleNum,'명') as peopleNum,
     contents,
     gatherLongitude, gatherLatitude, locationInfo, whetherEnd
FROM Posting P
INNER JOIN User U on U.userId = P.postUserId
INNER JOIN Running R on R.postId = P.postId
WHERE P.postId = ?;
                 `;
  const getPostingRow = await connection.query(getPostingQuery, postId);

  return getPostingRow;
}

//해당 모임에 참여하는 러너 정보 가져오기
async function getRunner(connection, postId) {
  const getRunnerQuery = `
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
      case when isBeginner = 'Y'
      then '초보 출석'
   else case when  U.diligence <= 32
      then '불량 출석'
   else case when 32< U.diligence AND U.diligence<= 66
       then '노력 출석'
   else case when 66< U.diligence
       then '성실 출석'
   end end end end as diligence,
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
          when job = 'ACC' then '재무/회계'
          when job = 'CUS' then 'CS'
      end as job
      ,profileImageUrl, whetherCheck, attendance, pace,
      case when repUserId = U.userId then 'Y' else 'N' end as 'whetherPostUser' 
      FROM User U
      inner join RunningPeople RP on U.userId = RP.userId
      inner join Running R on RP.gatheringId = R.gatheringId
      WHERE postId = ? AND whetherAccept = 'Y';
                 `;
  const getRunnerRow = await connection.query(getRunnerQuery, postId);

  return getRunnerRow[0];
}
// 신청하고 수락 대기중인 러너들
async function getWaitingRunner(connection, postId) {
  const getRunnerQuery = `
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
      case when isBeginner = 'Y'
      then '초보 출석'
   else case when  U.diligence <= 32
      then '불량 출석'
   else case when 32< U.diligence AND U.diligence<= 66
       then '노력 출석'
   else case when 66< U.diligence
       then '성실 출석'
   end end end end as diligence,
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
          when job = 'ACC' then '재무/회계'
          when job = 'CUS' then 'CS'
      end as job, profileImageUrl, pace FROM User U
      inner join RunningPeople RP on U.userId = RP.userId
      inner join Running R on RP.gatheringId = R.gatheringId
      WHERE postId = ? AND whetherAccept = 'N';
                 `;
  const getWaitingRunnerRow = await connection.query(getRunnerQuery, postId);

  return getWaitingRunnerRow;
}
// 마감하기
async function closePosting(connection, postId) {
  const closePostingQuery = `
  UPDATE Running as R, Posting as P
  SET R.whetherEnd = 'Y',
      P.status = 'C'
  WHERE P.postId = ${postId} AND R.postId = ${postId};
                 `;
  const closePostingRow = await connection.query(closePostingQuery);

  return closePostingRow;
}

// 게시글 수정
async function patchPosting(connection, patchPostingParams) {
  const patchPostingQuery = `
  UPDATE Posting SET title = ?, gatheringTime = ?, runningTime = ?, gatherLongitude = ?, gatherLatitude = ?,
                     locationInfo = ?, placeName = ?, placeExplain = ?, runningTag = ?, ageMin = ?, ageMax = ?, 
                     peopleNum = ?, contents = ?, runnerGender = ?, pace = ?, afterParty = ?
  WHERE postId = ?;
  `;
  const patchPostingRow = await connection.query(
    patchPostingQuery,
    patchPostingParams
  );

  return patchPostingRow;
}

// 게시글 있는지 확인
async function checkPosting(connection, postId) {
  const checkPostingQuery = `
              SELECT postId FROM Posting WHERE postId = ?
                 `;
  const checkPostingRow = await connection.query(checkPostingQuery, postId);

  return checkPostingRow;
}
// 게시글 삭제
async function dropPosting(connection, postId) {
  const dropPostingQuery = `
  DELETE FROM Posting WHERE postId=?;
  `;
  const dropRunningQuery = `
  DELETE FROM Running where postId = ?;
  `;
  const dropRunningPeopleQuery = `
  DELETE FROM RunningPeople
  where gatheringId =
  (select gatheringId from Running R inner join Posting P on R.postId = P.postId where R.postId = ?);
  `;

  const dropPosting = await connection.query(dropPostingQuery, postId);
  const dropRunning = await connection.query(dropRunningQuery, postId);
  const dropRunningPeople = await connection.query(
    dropRunningPeopleQuery,
    postId
  );

  return 0;
}

// 찜 등록여부
async function checkBookMark(connection, checkBookMarkParams) {
  const checkBookMarkQuery = `
  SELECT userId FROM Bookmarks WHERE userId = ? AND postId = ?;
                 `;
  const checkBookMarkRow = await connection.query(
    checkBookMarkQuery,
    checkBookMarkParams
  );

  return checkBookMarkRow;
}

// 신고하기
async function reportPosting(connection, Params) {
  const Query = `
  INSERT INTO PostingReport(postId, reporterId) VALUES (?,?);
                 `;
  const Row = await connection.query(Query, Params);

  return Row;
}

//게시글 상세페이지 v2
async function getPosting2(connection, postId) {
  const getPostingQuery = `
  SELECT P.postId, P.createdAt as postingTime, postUserId, nickName, profileImageUrl,
       title, runningTime, gatheringTime, gatherLongitude, gatherLatitude, 
       locationInfo, placeName, placeExplain, P.pace, afterParty,
       case when runningTag = 'A'
           then '퇴근 후'
        else case when runningTag = 'B'
            then '출근 전'
        else case when runningTag = 'H'
            then '휴일'
        end end end as runningTag,
        concat(ageMin,'-',ageMax) as age,
       case when runnerGender='A' then '전체'
       else case when runnerGender='M' then '남성'
       else case when runnerGender='F' then '여성'
        end end end as gender,
        whetherEnd, J.job,
       peopleNum, contents
  FROM Posting P
  INNER JOIN User U on U.userId = P.postUserId
  INNER JOIN Running R on R.postId = P.postId
  INNER JOIN (SELECT DISTINCT postId, GROUP_CONCAT(distinct(job)) as job
  FROM RunningPeople RP
  inner join Running R on RP.gatheringId = R.gatheringId
  inner join User U on RP.userId = U.userId
  group by postId) J on J.postId = P.postId
  WHERE P.postId = ?;
                   `;
  const getPostingRow = await connection.query(getPostingQuery, postId);

  return getPostingRow;
}

// postUser 확인
async function checkPostUser(connection, postId) {
  const Query = `
  select userId from Posting P
  inner join User U on P.postUserId = U.userId
  where postId = ?;
                   `;
  const Row = await connection.query(Query, postId);

  return Row[0];
}

// postUser 확인
async function checkPostId(connection, postId) {
  const Query = `
  select postId from Posting where postId = ?;
                   `;
  const Row = await connection.query(Query, postId);

  return Row[0];
}

// 출석 관리 시간 마감 확인 : gatheringTime + runningTime + 3시간 > 현재 시간  ---> 마감
async function getAttendTimeOver(connection, postId) {
  const Query = `  
  select 
    case when
      TIMESTAMPDIFF(SECOND,
      DATE_ADD(ADDTIME(gatheringTime, runningTime), INTERVAL 3 HOUR),
      now())
      > 0
      then 'Y'
      else 'N'
      end as attendTimeOver
    from Posting
  where postId = ?;
    `;
  const Row = await connection.query(Query, postId);

  return Row[0][0]["attendTimeOver"];
}

// 게시글 상세 페이지 roomId 가져오기
async function getRoomId(connection, postId) {
  const Query = `  
  select R.roomId from Room R inner join Posting P on R.postId = P.postId where P.postId = ?; 
    `;
  const Row = await connection.query(Query, postId);

  return Row[0][0]["roomId"];
}

// 게시글 상세 페이지 gatheringId 가져오기
async function getGatheringId(connection, postId) {
  const Query = `  
  select R.gatheringId from Running R inner join Posting P on R.postId = P.postId where P.postId = ?; 
    `;
  const Row = await connection.query(Query, postId);

  return Row[0][0]["gatheringId"];
}

module.exports = {
  createPosting,
  userIdCheck,
  createRunning,
  createRunningPeople,
  checkWriter,
  getPosting,
  getRunner,
  getWaitingRunner,
  closePosting,
  patchPosting,
  checkPosting,
  dropPosting,
  checkBookMark,
  reportPosting,
  getPosting2,
  checkPostUser,
  checkPostId,
  getAttendTimeOver,
  getRoomId,
  getGatheringId,
};

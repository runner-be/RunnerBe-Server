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
     case when date_format(gatheringTime, '%w') = 0
          then date_format(gatheringTime,'%m/%d(일) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 1
          then date_format(gatheringTime,'%m/%d(월) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 2
          then date_format(gatheringTime,'%m/%d(화) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 3
          then date_format(gatheringTime,'%m/%d(수) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 4
          then date_format(gatheringTime,'%m/%d(목) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 5
          then date_format(gatheringTime,'%m/%d(금) %p%l:%i')
      else case when date_format(gatheringTime, '%w') = 6
          then date_format(gatheringTime,'%m/%d(토) %p%l:%i')
      end end end end end end end as gatheringTime,
     case when runningTime <= '01:00:00'
          then CONCAT('약 ',date_format(runningTime,'%i'),'분')
      else case when runningTime > '01:00:00'
          then CONCAT('약 ',date_format(runningTime,'%l'),'시간',date_format(runningTime,'%i'),'분')
      end end as runningTime,
     case when runnerGender='A' then '전체'
     else case when runnerGender='M' then '남성'
     else case when runnerGender='F' then '여성'
      end end end as gender,
     concat(ageMin,'-',ageMax) as age,
     CONCAT('최대 ',peopleNum,'명') as peopleNum,
     contents,
     gatherLongitude, gatherLatitude, locationInfo
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
     case when 1<= U.diligence AND U.diligence <= 32
         then '불량 러너'
      else case when 32< U.diligence AND U.diligence<= 66
          then '노력 러너'
      else case when 66< U.diligence AND U.diligence<=100
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
      inner join RunningPeople RP on U.userId = RP.userId
      inner join Running R on RP.gatheringId = R.gatheringId
      WHERE postId = ? AND whetherAccept = 'Y';
                 `;
    const getRunnerRow = await connection.query(getRunnerQuery, postId);

    return getRunnerRow;
}

// 마감하기
async function closePosting(connection, postId) {
    const closePostingQuery = `
  UPDATE Running SET whetherEnd = 'Y'
  WHERE postId = ?;
                 `;
    const closePostingRow = await connection.query(closePostingQuery, postId);

    return closePostingRow;
}

// 게시글 수정
async function patchPosting(connection, patchPostingParams) {
    const patchPostingQuery = `
  UPDATE Posting SET title = ?, gatheringTime = ?, runningTime = ?, gatherLongitude = ?, gatherLatitude = ?, locationInfo = ?, runningTag = ?, ageMin = ?, ageMax = ?, 
                   peopleNum = ?, contents = ?, runnerGender = ?
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
    const dropPostingRow = await connection.query(dropPostingQuery, postId);

    return dropPostingRow;
}
module.exports = {
    createPosting,
    userIdCheck,
    createRunning,
    checkWriter,
    getPosting,
    getRunner,
    closePosting,
    patchPosting,
    checkPosting,
    dropPosting,
};

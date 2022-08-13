module.exports = {
  // Success
  SUCCESS: { isSuccess: true, code: 1000, message: "성공" },
  SUCCESS_MEMBER_AUTH: {
    isSuccess: true,
    code: 1001,
    message: "성공, 인증 완료 회원",
  },
  SUCCESS_NON_MEMBER: { isSuccess: true, code: 1002, message: "성공, 비회원" },
  SUCCESS_WRITER: { isSuccess: true, code: 1003, message: "성공, 작성자" },
  SUCCESS_NON_WRITER: {
    isSuccess: true,
    code: 1004,
    message: "성공, 비작성자, 참여신청 전",
  },
  SUCCESS_SIGN_UP: {
    isSuccess: true,
    code: 1005,
    message: "성공, 인증 완료",
  },
  SUCCESS_PHOTO: {
    isSuccess: true,
    code: 1006,
    message:
      "성공, 사원증 인증 대기중 / 인증 대기 상태로 회원을 생성하였습니다.",
  },
  SUCCESS_MEMBER_NON_AUTH: {
    isSuccess: true,
    code: 1007,
    message: "성공, 인증 대기 회원",
  },

  SUCCESS_MEMBER_AUTH_FIRST: {
    isSuccess: true,
    code: 1008,
    message: "성공, 인증 회원, 최초 접속",
  },

  SUCCESS_MASTER_BEFORE: {
    isSuccess: true,
    code: 1009,
    message: "성공, 모임 생성자, 참여 신청 전",
  },

  SUCCESS_NON_MASTER_BEFORE: {
    isSuccess: true,
    code: 1010,
    message: "성공, 모임 참가자, 참여 신청 전",
  },

  SUCCESS_MASTER_AFTER_WAIT: {
    isSuccess: true,
    code: 1011,
    message: "성공, 모임 생성자, 참여 신청 후, 신청 처리 대기중",
  },

  SUCCESS_MASTER_AFTER_DONE: {
    isSuccess: true,
    code: 1012,
    message: "성공, 모임 생성자, 참여 신청 후, 신청 처리 완료",
  },

  SUCCESS_NON_MASTER_AFTER: {
    isSuccess: true,
    code: 1013,
    message: "성공, 모임 참가자, 참여 신청 후",
  },

  SUCCESS_NON_WRITER_AA: {
    isSuccess: true,
    code: 1014,
    message: "성공, 비작성자, 이미 참여 신청했음",
  },

  // 게시글 상세페이지 찜 등록 여부 삭제-> 수정

  SUCCESS_NON_WRITER_AA_BMY: {
    isSuccess: true,
    code: 1015,
    message: "성공, 비작성자, 이미 참여 신청했음",
  },

  SUCCESS_NON_WRITER_BMY: {
    isSuccess: true,
    code: 1017,
    message: "성공, 비작성자, 참여신청 전",
  },

  SUCCESS_WRITER_BMY: {
    isSuccess: true,
    code: 1019,
    message: "성공, 작성자",
  },

  // Common
  TOKEN_EMPTY: {
    isSuccess: false,
    code: 2000,
    message: "JWT 토큰을 입력해주세요.",
  },
  TOKEN_VERIFICATION_FAILURE: {
    isSuccess: false,
    code: 3000,
    message: "JWT 토큰 검증 실패",
  },
  TOKEN_VERIFICATION_SUCCESS: {
    isSuccess: true,
    code: 1100,
    message: "JWT 토큰 검증 성공",
  },

  //Request error
  SIGNUP_UUID_EMPTY: {
    isSuccess: false,
    code: 2001,
    message: "UUID를 입력해주세요",
  },
  SIGNUP_BIRTHDAY_EMPTY: {
    isSuccess: false,
    code: 2002,
    message: "태어난 연도를 입력해주세요(xxxx로 입력)",
  },
  SIGNUP_GENDER_EMPTY: {
    isSuccess: false,
    code: 2003,
    message: "성별을 입력해주세요.",
  },
  SIGNUP_JOB_EMPTY: {
    isSuccess: false,
    code: 2004,
    message: "직군 코드를 입력 해주세요.",
  },
  SIGNUP_GENDER_LENGTH: {
    isSuccess: false,
    code: 2005,
    message: "성별은 1자리(M or F)로 입력해주세요.",
  },
  SIGNUP_JOB_LENGTH: {
    isSuccess: false,
    code: 2006,
    message: "직군 코드는 3자리로 입력 해주세요.",
  },

  SIGNUP_EMAIL_ERROR_TYPE: {
    isSuccess: false,
    code: 2007,
    message: "이메일 형식을 정확하게 입력해주세요",
  },

  SIGNUP_NICKNAME_EMPTY: {
    isSuccess: false,
    code: 2008,
    message: "기본 닉네임 값을 입력해주세요",
  },

  SIGNUP_NICKNAME_LENGTH: {
    isSuccess: false,
    code: 2009,
    message: "기본 닉네임의 길이를 확인해주세요. 10자 이하",
  },

  USER_ID_NOT_MATCH: {
    isSuccess: false,
    code: 2010,
    message: "jwt의 userId와 userId가 일치하지 않습니다.",
  },

  USER_USERID_EMPTY: {
    isSuccess: false,
    code: 2011,
    message: "userId 값을 입력해주세요.",
  },

  USER_USERID_NOTNUM: {
    isSuccess: false,
    code: 2012,
    message: "userId는 숫자로 입력해주세요.",
  },

  USER_NICKNAME_EMPTY: {
    isSuccess: false,
    code: 2013,
    message: "닉네임을 입력해주세요.",
  },

  POSTING_TITLE_EMPTY: {
    isSuccess: false,
    code: 2014,
    message: "글제목을 입력해주세요.",
  },

  POSTING_GATHERINGTIME_EMPTY: {
    isSuccess: false,
    code: 2015,
    message: "모이는 시간을 입력해주세요.",
  },

  POSTING_RUNNINGTIME_EMPTY: {
    isSuccess: false,
    code: 2016,
    message: "러닝 소요 시간을 입력해주세요.",
  },

  POSTING_LONGITUDE_EMPTY: {
    isSuccess: false,
    code: 2017,
    message: "모임 장소의 경도를 입력해주세요.",
  },

  POSTING_LATITUDE_EMPTY: {
    isSuccess: false,
    code: 2018,
    message: "모임 장소의 위도를 입력해주세요.",
  },

  POSTING_LOCATION_EMPTY: {
    isSuccess: false,
    code: 2019,
    message: "모임 장소의 이름(행정구역)을 입력해주세요.",
  },

  POSTING_WHEN_EMPTY: {
    isSuccess: false,
    code: 2020,
    message: "모임 장소의 tag(출근 전, 퇴근 후, 휴일)을 입력해주세요.",
  },

  POSTING_AGEMIN_EMPTY: {
    isSuccess: false,
    code: 2021,
    message: "최소 연령대를 입력해주세요.",
  },

  POSTING_AGEMAX_EMPTY: {
    isSuccess: false,
    code: 2022,
    message: "최대 연령대를 입력해주세요.",
  },

  POSTING_PEOPLENUM_EMPTY: {
    isSuccess: false,
    code: 2023,
    message: "최대 모임 인원을 입력해주세요.",
  },

  POSTING_GENDER_EMPTY: {
    isSuccess: false,
    code: 2024,
    message: "성별 기준을 입력해주세요.",
  },

  POSTING_TITLE_LENGTH: {
    isSuccess: false,
    code: 2025,
    message: "글제목은 30자 이내로 입력해주세요.",
  },

  POSTING_TEXT_LENGTH: {
    isSuccess: false,
    code: 2026,
    message: "자유 내용은 500자 이내로 입력해주세요.",
  },

  USER_AGEMIN_NOTNUM: {
    isSuccess: false,
    code: 2027,
    message: "최소 연령은 숫자로 입력해주세요.",
  },

  USER_AGEMAX_NOTNUM: {
    isSuccess: false,
    code: 2028,
    message: "최대 연령은 숫자로 입력해주세요.",
  },

  USER_PEOPLENUM_NOTNUM: {
    isSuccess: false,
    code: 2029,
    message: "최대 인원수는 숫자로 입력해주세요.",
  },

  WHEN_IS_NOT_VALID: {
    isSuccess: false,
    code: 2030,
    message:
      "runningTag는 (A : 퇴근 후, B : 출근 전, H : 휴일)로 입력해주세요.",
  },

  GENDER_IS_NOT_VALID: {
    isSuccess: false,
    code: 2031,
    message: "runnerGender는 (A : 전체, M : 남성, F : 여성)로 입력해주세요.",
  },

  ID_CARD_EMPTY: {
    isSuccess: false,
    code: 2032,
    message: "신분증 사진 URL을 입력해주세요.",
  },

  LONGITUDE_EMPTY: {
    isSuccess: false,
    code: 2033,
    message: "경도를 입력해주세요.",
  },

  LATITUDE_EMPTY: {
    isSuccess: false,
    code: 2034,
    message: "위도를 입력해주세요.",
  },

  WHETHEREND_EMPTY: {
    isSuccess: false,
    code: 2035,
    message: "마감포함 여부를 입력해주세요.",
  },

  FILTER_EMPTY: {
    isSuccess: false,
    code: 2036,
    message: "필터 조건을 입력해주세요.",
  },

  END_IS_NOT_VALID: {
    isSuccess: false,
    code: 2037,
    message: "마감포함 여부는 Y, N 중 하나로 입력해주세요.",
  },

  FILTER_IS_NOT_VALID: {
    isSuccess: false,
    code: 2038,
    message: "필터 조건은 D, R 중 하나로 입력해주세요.",
  },

  RUNNONGTAG_EMPTY: {
    isSuccess: false,
    code: 2039,
    message: "runningTag를 입력해주세요.",
  },

  RUNNONGTAG_IS_NOT_VALID: {
    isSuccess: false,
    code: 2040,
    message: "runningTag는 A, B, H 중 하나로 입력해주세요.",
  },

  POSTID_EMPTY: {
    isSuccess: false,
    code: 2041,
    message: "postId를 입력해주세요.",
  },

  POSTID_NOTNUM: {
    isSuccess: false,
    code: 2042,
    message: "postId는 숫자로 입력해주세요.",
  },

  USER_NOT_WRITER: {
    isSuccess: false,
    code: 2043,
    message: "해당 jwt를 발급받은 유저는 해당 게시글의 작성자가 아닙니다.",
  },

  USER_NON_AUTH: {
    isSuccess: false,
    code: 2044,
    message: "아직 사원증 인증 대기중인 회원입니다.",
  },

  POSTING_NOT_VALID_POSTID: {
    isSuccess: false,
    code: 2045,
    message: "존재하지 않는 postId입니다.",
  },

  USER_ALREADY_DENIED: {
    isSuccess: false,
    code: 2046,
    message: "이미 해당 러닝 모임에 대해서 거절된 적 있는 회원입니다.",
  },

  ROOM_ID_EMPTY: {
    isSuccess: false,
    code: 2047,
    message: "roomId를 입력해주세요.",
  },

  CONTENT_EMPTY: {
    isSuccess: false,
    code: 2048,
    message: "content를 입력해주세요.",
  },

  ROOM_ID_NOTNUM: {
    isSuccess: false,
    code: 2049,
    message: "roomId는 숫자로 입력해주세요.",
  },

  CONTENT_LENGTH: {
    isSuccess: false,
    code: 2050,
    message: "content는 300자 이내로 입력해주세요.",
  },

  MESSAGE_NOT_MATCH_USERID: {
    isSuccess: false,
    code: 2051,
    message: "입력받은 userId는 해당 room에 속하지 않습니다",
  },

  ALREADY_ACCEPTED: {
    isSuccess: false,
    code: 2052,
    message: "이미 참여 신청을 했습니다.",
  },

  NOT_BELONG: {
    isSuccess: false,
    code: 2053,
    message: "해당 유저는 해당 room에 속하지 않습니다.",
  },

  DISTANCEFILTER_EMPTY: {
    isSuccess: false,
    code: 2053,
    message: "거리 필터링 조건을 입력해주세요.",
  },

  DISTANCE_FILTER_NOTNUM: {
    isSuccess: false,
    code: 2054,
    message: "거리 필터링 조건이 N이 아니면, 숫자로 입력해주세요.",
  },

  GENDER_FILTER_EMPTY: {
    isSuccess: false,
    code: 2055,
    message: "성별 필터링 조건을 입력해주세요.",
  },

  GENDER_FILTER_IS_NOT_VALID: {
    isSuccess: false,
    code: 2056,
    message: "성별 필터링 조건은 A,F,M 중 하나로 입력해주세요.",
  },

  JOB_FILTER_EMPTY: {
    isSuccess: false,
    code: 2057,
    message: "직군 필터링 조건을 입력해주세요.",
  },

  JOB_FILTER_IS_NOT_VALID: {
    isSuccess: false,
    code: 2058,
    message: "직군 필터링 조건이 유효하지 않습니다.",
  },

  AGE_MIN_FILTER_EMPTY: {
    isSuccess: false,
    code: 2059,
    message: "최소 연령대 조건을 입력해주세요.",
  },

  AGE_MAX_FILTER_EMPTY: {
    isSuccess: false,
    code: 2060,
    message: "최대 연령대 조건을 입력해주세요.",
  },

  AGE_FILTER_MATCH: {
    isSuccess: false,
    code: 2061,
    message: "연령대 조건은 둘 다 N이거나 둘 다 숫자로 입력해주세요.",
  },

  AGE_MAX_FILTER_NOTNUM: {
    isSuccess: false,
    code: 2062,
    message: "최대 연령대 조건은 숫자로 입력해주세요.",
  },

  AGE_MIN_FILTER_NOTNUM: {
    isSuccess: false,
    code: 2063,
    message: "최소 연령대 조건은 숫자로 입력해주세요.",
  },

  ALREADY_APPLY: {
    isSuccess: false,
    code: 2064,
    message: "이미 신청했던 유저입니다.",
  },

  APPLICANTID_EMPTY: {
    isSuccess: false,
    code: 2065,
    message: "applicantId를 입력해주세요.",
  },

  APPLICANTID_NOTNUM: {
    isSuccess: false,
    code: 2066,
    message: "applicantId는숫자로 입력해주세요.",
  },

  USERID_NOT_WRITER: {
    isSuccess: false,
    code: 2067,
    message: "신청 처리 요청을 보낸 userId는 반장의 id가 아닙니다.",
  },

  WACCEPT_EMPTY: {
    isSuccess: false,
    code: 2068,
    message: "수락 여부를 입력해주세요",
  },

  WACCEPT_IS_NOT_VALID: {
    isSuccess: false,
    code: 2069,
    message: "수락 여부는 Y이나 D로 입력해주세요",
  },

  USER_CANNOT_REQUEST: {
    isSuccess: false,
    code: 2070,
    message:
      "applicantId에 해당하는 유저가 해당 모임에 속하지 않거나 대기 상태가 아닙니다.",
  },

  WADD_EMPTY: {
    isSuccess: false,
    code: 2071,
    message: "찜 등록/해제 입력해주세요",
  },

  WADD_IS_NOT_VALID: {
    isSuccess: false,
    code: 2072,
    message: "찜 등록/해제는 Y, N로 입력해주세요",
  },

  USER_CANNOT_ADD: {
    isSuccess: false,
    code: 2073,
    message: "해당 유저는 이미 찜을 등록했습니다.",
  },

  USER_CANNOT_DELETE: {
    isSuccess: false,
    code: 2074,
    message: "해당 유저는 이미 찜을 해제했습니다.",
  },

  KEY_WORD_EMPTY: {
    isSuccess: false,
    code: 2075,
    message: "keyword를 입력해주세요.",
  },

  KEY_WORD_LENGTH: {
    isSuccess: false,
    code: 2076,
    message: "keyword는 10자 이하로 입력해주세요.",
  },

  USER_NOT_BELONG_RUNNING: {
    isSuccess: false,
    code: 2077,
    message:
      "유저가 해당 러닝모임에 속하지 않습니다. userId를 정확히 입력해주세요.",
  },

  CANNOT_CHANGE_JOB: {
    isSuccess: false,
    code: 2078,
    message: "3개월이 지나지 않아 직군 변경이 불가능합니다.",
  },

  USER_KEY_EMPTY: {
    isSuccess: false,
    code: 2079,
    message: "비밀 키값을 입력해주세요.",
  },

  KEY_DO_NOT_MATCH: {
    isSuccess: false,
    code: 2080,
    message: "비밀 키값이 유효하지 않습니다.",
  },

  MESSAGE_ID_EMPTY: {
    isSuccess: false,
    code: 2081,
    message: "messageId를 입력해주세요.",
  },

  MESSAGE_ID_NOTNUM: {
    isSuccess: false,
    code: 2082,
    message: "messageId는 숫자로 입력해주세요.",
  },

  MESSAGE_ID_NOT_EXIST: {
    isSuccess: false,
    code: 2083,
    message: "존재하지 않는 messageId입니다.",
  },

  ACCESS_TOKEN_IS_EMPTY: {
    isSuccess: false,
    code: 2084,
    message: "accessToken 값을 입력해주세요.",
  },

  ACCESS_TOKEN_IS_NOT_VALID: {
    isSuccess: false,
    code: 2085,
    message: "유효하지 않는 Access Token 입니다.",
  },

  DEVICE_TOKEN_EMPTY: {
    isSuccess: false,
    code: 2086,
    message: "해당 유저의 device token 값이 등록되어있지 않습니다.",
  },

  DEVICE_TOKEN_INPUT_EMPTY: {
    isSuccess: false,
    code: 2087,
    message: "device token 값을 입력해주세요.",
  },

  PUSH_ON_EMPTY: {
    isSuccess: false,
    code: 2088,
    message: "pushOn 값을 입력해주세요.",
  },

  PUSH_ON_IS_NOT_VALID: {
    isSuccess: false,
    code: 2089,
    message: "pushOn 값은 Y나 N로 입력해주세요.",
  },

  WHETHER_ATTEND_EMPTY: {
    isSuccess: false,
    code: 2090,
    message: "whetherAttend 값을 입력해주세요.",
  },

  WHETHER_ATTEND_IS_NOT_VALID: {
    isSuccess: false,
    code: 2091,
    message: "whetherAttend 값은 Y나 N로 입력해주세요.",
  },

  USERID_AND_WHETHER_ATTEND_NOT_MATCH: {
    isSuccess: false,
    code: 2092,
    message: "유저 수와 출석 여부 개수가 일치하지 않습니다.",
  },

  USER_IS_RESTRICTED: {
    isSuccess: false,
    code: 2093,
    message: "현재 이용이 제한된 유저입니다.",
  },

  POST_USER_NOT_EXIST: {
    isSuccess: false,
    code: 2094,
    message: "해당 게시글의 작성자는 탈퇴한 유저입니다.",
  },

  POST_ID_NOT_EXIST: {
    isSuccess: false,
    code: 2095,
    message: "해당 postId는 존재하지 않습니다.",
  },
  // ----------------------------

  // Response error
  SIGNUP_REDUNDANT_UUID: {
    isSuccess: false,
    code: 3001,
    message: "중복된 uuid입니다.",
  },
  SIGNUP_REDUNDANT_EMAIL: {
    isSuccess: false,
    code: 3002,
    message: "중복된 이메일입니다.",
  },
  SIGNUP_JOBCODE_IS_NOT_VALID: {
    isSuccess: false,
    code: 3003,
    message: "유효한 직군코드가 아닙니다.",
  },

  SIGNUP_REDUNDANT_NICKNAME: {
    isSuccess: false,
    code: 3004,
    message: "중복된 닉네임입니다.",
  },

  CANNOT_CHANGE_NICKNAME: {
    isSuccess: false,
    code: 3005,
    message: "이미 닉네임을 변경했던 유저입니다.",
  },

  POSTING_NOT_VALID_USERID: {
    isSuccess: false,
    code: 3006,
    message: "없는 유저의 userId입니다.",
  },

  ERROR_SEND_MESSAGE: {
    isSuccess: false,
    code: 3007,
    message: "메세지 전송에 실패했습니다.",
  },
  // -----------------

  //Connection, Transaction 등의 서버 오류
  DB_ERROR: { isSuccess: false, code: 4000, message: "데이터 베이스 에러" },
  SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },
};

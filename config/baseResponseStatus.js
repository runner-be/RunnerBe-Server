module.exports = {
    // Success
    SUCCESS: { isSuccess: true, code: 1000, message: "성공" },
    SUCCESS_MEMBER: { isSuccess: true, code: 1001, message: "성공, 회원" },
    SUCCESS_NON_MEMBER: { isSuccess: true, code: 1002, message: "성공, 비회원" },

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
        message: "생년월일을 입력해주세요(xxxx.01.01로 입력)",
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
    // ----------------------------
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
    // -----------------

    //Connection, Transaction 등의 서버 오류
    DB_ERROR: { isSuccess: false, code: 4000, message: "데이터 베이스 에러" },
    SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },
};

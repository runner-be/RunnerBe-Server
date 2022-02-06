module.exports = {
    // Success
    SUCCESS: { isSuccess: true, code: 1000, message: "성공" },

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
        code: 1001,
        message: "JWT 토큰 검증 성공",
    }, // ?

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
    SIGNUP_NICKNAME_LENGTH: {
        isSuccess: false,
        code: 2007,
        message: "닉네임은 최대 20자리를 입력해주세요.",
    },

    SIGNUP_EMAIL_ERROR_TYPE: {
        isSuccess: false,
        code: 2008,
        message: "이메일 형식을 정확하게 입력해주세요",
    },
    SIGNUP_REDUNDANT_UUID: {
        isSuccess: false,
        code: 2009,
        message: "중복된 uuid입니다.",
    },
    SIGNUP_REDUNDANT_EMAIL: {
        isSuccess: false,
        code: 2010,
        message: "중복된 이메일입니다.",
    },
    SIGNUP_JOBCODE_IS_NOT_VALID: {
        isSuccess: false,
        code: 2011,
        message: "유효한 직군코드가 아닙니다.",
    },

    USER_USERID_EMPTY: {
        isSuccess: false,
        code: 2012,
        message: "userId를 입력해주세요.",
    },
    USER_USERID_NOT_EXIST: {
        isSuccess: false,
        code: 2013,
        message: "해당 회원이 존재하지 않습니다.",
    },

    USER_USEREMAIL_EMPTY: {
        isSuccess: false,
        code: 2014,
        message: "이메일을 입력해주세요.",
    },
    USER_USEREMAIL_NOT_EXIST: {
        isSuccess: false,
        code: 2015,
        message: "해당 이메일을 가진 회원이 존재하지 않습니다.",
    },
    USER_ID_NOT_MATCH: {
        isSuccess: false,
        code: 2016,
        message: "유저 아이디 값을 확인해주세요",
    },
    USER_NICKNAME_EMPTY: {
        isSuccess: false,
        code: 2017,
        message: "변경할 닉네임 값을 입력해주세요",
    },

    USER_STATUS_EMPTY: {
        isSuccess: false,
        code: 2018,
        message: "회원 상태값을 입력해주세요",
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

    // Response error
    SIGNUP_REDUNDANT_EMAIL: {
        isSuccess: false,
        code: 3001,
        message: "중복된 이메일입니다.",
    },
    SIGNUP_REDUNDANT_NICKNAME: {
        isSuccess: false,
        code: 3002,
        message: "중복된 닉네임입니다.",
    },

    SIGNIN_EMAIL_WRONG: {
        isSuccess: false,
        code: 3003,
        message: "아이디가 잘못 되었습니다.",
    },
    SIGNIN_PASSWORD_WRONG: {
        isSuccess: false,
        code: 3004,
        message: "비밀번호가 잘못 되었습니다.",
    },
    SIGNIN_INACTIVE_ACCOUNT: {
        isSuccess: false,
        code: 3005,
        message: "비활성화 된 계정입니다. 고객센터에 문의해주세요.",
    },
    SIGNIN_WITHDRAWAL_ACCOUNT: {
        isSuccess: false,
        code: 3006,
        message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요.",
    },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR: { isSuccess: false, code: 4000, message: "데이터 베이스 에러" },
    SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },
};

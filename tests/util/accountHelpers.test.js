const UN = "user1";
const PW = "12345";
const ROLE = "employee";
const TOKEN = "jd8ck3";

// --------------------------------------------------

const mockedDecode = jest.fn((token) => {
  if (token === TOKEN) {
    return { username: UN, role: ROLE };
  } else {
    throw new Error();
  }
});

jest.mock("../../src/util/authToken", () => ({
  decode: mockedDecode,
}));

const {
  sanitizeUsername,
  validatePassword,
  authenticateTokenMiddleware,
} = require("../../src/util/accountHelpers");

// ==================================================

describe("sanitizeUsername", () => {
  test("Giving a valid username should return a String of that username.", () => {
    const RESULT = sanitizeUsername(UN);

    expect(RESULT).toBe(UN);
  });

  test("Giving a number for username should return a String of that username.", () => {
    const USERNAME = 123456;
    const EXPECTED_RESULT = "123456";

    const RESULT = sanitizeUsername(USERNAME);

    expect(RESULT).toBe(EXPECTED_RESULT);
  });

  test("Using nonalphanumeric characters for username should throw an error.", () => {
    const USERNAME = "id%";

    function runFunc() {
      sanitizeUsername(USERNAME);
    }

    expect(runFunc).toThrow(Error);
  });

  test("Having a username that is too long should throw an error.", () => {
    const USERNAME = "a".repeat(80);

    function runFunc() {
      sanitizeUsername(USERNAME);
    }

    expect(runFunc).toThrow(Error);
  });

  test("Giving no username should throw an error.", () => {
    const USERNAME = undefined;

    function runFunc() {
      sanitizeUsername(USERNAME);
    }

    expect(runFunc).toThrow(Error);
  });
});

// --------------------------------------------------

describe("validatePassword", () => {
  test("Giving a valid password should not throw an error.", () => {
    function runFunc() {
      validatePassword(PW);
    }

    expect(runFunc).not.toThrow(Error);
  });

  test("Giving a number for password should not throw an error.", () => {
    const PASSWORD = 98765;

    function runFunc() {
      validatePassword(PW);
    }

    expect(runFunc).not.toThrow(Error);
  });

  test("Giving a password that is too long should throw an error.", () => {
    const PASSWORD = "a".repeat(201);

    function runFunc() {
      validatePassword(PASSWORD);
    }

    expect(runFunc).toThrow(Error);
  });

  test("Giving no password should throw an error.", () => {
    const PASSWORD = undefined;

    function runFunc() {
      validatePassword();
    }

    expect(runFunc).toThrow(Error);
  });
});

// --------------------------------------------------

describe("authenticateTokenMiddleware", () => {
  let mockedStatus;
  let mockedJson;
  let mockedNext;
  let res;

  beforeEach(() => {
    mockedStatus = jest.fn(() => res);
    mockedJson = jest.fn();
    mockedNext = jest.fn();

    res = { status: mockedStatus, json: mockedJson };
  });

  test("Giving a valid token should return an object containing username and role.", () => {
    const REQ = { headers: { authorization: "Bearer jd8ck3" }, body: {} };
    const EXPECTED_REQ_BODY = { username: UN, role: ROLE };

    authenticateTokenMiddleware(REQ, res, mockedNext);

    expect(REQ.body).toStrictEqual(EXPECTED_REQ_BODY);
    expect(mockedStatus).not.toHaveBeenCalled();
    expect(mockedJson).not.toHaveBeenCalled();
    expect(mockedNext).toHaveBeenCalled();
  });

  test("Giving a missing authorization header should return a 4xx response.", () => {
    const REQ = { headers: {}, body: {} };
    const EXPECTED_REQ_BODY = {};

    authenticateTokenMiddleware(REQ, res, mockedNext);

    expect(REQ.body).toStrictEqual(EXPECTED_REQ_BODY);
    expect(mockedStatus).toHaveBeenCalledWith(401);
    expect(mockedJson).toHaveBeenCalled();
  });

  test("Giving an invalid token should return a 4xx response.", () => {
    const REQ = { headers: { authorization: "Bearer 12345" }, body: {} };
    const EXPECTED_REQ_BODY = {};

    authenticateTokenMiddleware(REQ, res, mockedNext);

    expect(REQ.body).toStrictEqual(EXPECTED_REQ_BODY);
    expect(mockedStatus).toHaveBeenCalledWith(401);
    expect(mockedJson).toHaveBeenCalled();
  });
});

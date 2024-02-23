const { sanitizeUsername, validatePassword } = require("../../src/util/accountHelpers");

// --------------------------------------------------

const UN = "user1";
const PW = "12345";

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

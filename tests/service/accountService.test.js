const UN1 = "user1";
const UN2 = "user2";

const PW = "12345";

const ROLE = "employee";

const AUTH_TOKEN = "9999";

// --------------------------------------------------

const mockedGet = jest.fn((username) => {
  if (username === UN2) {
    return { username: UN2, password: PW, role: ROLE };
  } else {
    return null;
  }
});
const mockedAdd = jest.fn((username, password, role) => ({ username, role }));

jest.mock("../../src/daos/accountDao", () => ({
  get: mockedGet,
  add: mockedAdd,
}));

const mockedGenerate = jest.fn(() => AUTH_TOKEN);

jest.mock("../../src/util/authToken", () => ({
  generate: mockedGenerate,
}));

const mockedCompare = jest.fn((str1, str2) => str1 === str2);

jest.mock("bcrypt", () => ({
  compare: mockedCompare,
}));

const accountService = require("../../src/service/accountService");
const RegisteringExistingUsernameError = require("../../src/errors/RegisteringExistingUsernameError");
const InvalidLoginError = require("../../src/errors/InvalidLoginError");

// ==================================================

describe("register", () => {
  test(
    "When given a valid username and password and the username is not already registered, " +
      "return an object with username and role.",
    async () => {
      const EXPECTED_RESULT = { username: UN1, role: ROLE };

      const RESULT = await accountService.register(UN1, PW);

      expect(RESULT).toStrictEqual(EXPECTED_RESULT);
      expect(mockedGet).toHaveBeenCalledWith(UN1);
      expect(mockedAdd).toHaveBeenCalledTimes(1);
      expect(mockedAdd).toHaveBeenCalledWith(UN1, PW, ROLE);
    }
  );

  test("When registering an already existing username, throw an error.", async () => {
    async function runFunc() {
      await accountService.register(UN2, PW);
    }

    expect(runFunc).rejects.toThrow(RegisteringExistingUsernameError);
    expect(mockedGet).toHaveBeenCalled();
    expect(mockedAdd).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------

describe("login", () => {
  test("Giving correct login info should return an authentication token.", async () => {
    const EXPECTED_RESULT = AUTH_TOKEN;

    const result = await accountService.login(UN2, PW);

    expect(result).toEqual(EXPECTED_RESULT);
    expect(mockedGet).toHaveBeenCalled();
    expect(mockedCompare).toHaveBeenCalled();
    expect(mockedGenerate).toHaveBeenCalled();
  });

  test("Giving a non-existing username should throw an error.", async () => {
    const username = "PhonyUsername";

    async function runFunc() {
      await accountService.login(username, PW);
    }

    expect(runFunc).rejects.toThrow(InvalidLoginError);
    expect(mockedGet).toHaveBeenCalled();
    expect(mockedCompare).not.toHaveBeenCalled();
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  test("Giving an incorrect password should throw an error.", async () => {
    const password = "0000";

    async function runFunc() {
      await accountService.login(UN2, password);
    }

    expect(runFunc).rejects.toThrow(InvalidLoginError);
    expect(mockedGet).toHaveBeenCalled();
    expect(mockedCompare).not.toHaveBeenCalled();
    expect(mockedGenerate).not.toHaveBeenCalled();
  });
});

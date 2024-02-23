const UN1 = "user1";
const UN2 = "user2";

const PW = "12345";

const ROLE = "employee";

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

const accountService = require("../../src/service/accountService");
const RegisteringExistingUsernameError = require("../../src/errors/RegisteringExistingUsernameError");

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

const UN1 = "user1";
const UN2 = "user2";

const ROLE1 = "employee";
const ROLE2 = "manager";

const STATUS = "pending";
const TYPE = "meal";
const AMOUNT = 100.01;
const DESCRIPTION = "A description.";

// --------------------------------------------------

const mockedTicketAdd = jest.fn((ticket) => ticket);

jest.mock("../../src/daos/ticketDao", () => ({
  add: mockedTicketAdd,
}));

const ticketService = require("../../src/service/ticketService");
const AuthorizationError = require("../../src/errors/AuthorizationError");

// ==================================================

describe("submitTicket", () => {
  let ticketToAdd;

  beforeEach(() => {
    ticketToAdd = {
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    };
  });

  test("When role is employee, ticket should be added.", async () => {
    ticketToAdd.username = UN1;
    ticketToAdd.role = ROLE1;

    const EXPECTED_RESULT = {
      submitter: UN1,
      timestamp: expect.any(Number),
      status: STATUS,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    };

    const RESULT = await ticketService.submitTicket(ticketToAdd);

    expect(RESULT).toEqual(EXPECTED_RESULT);
    expect(Number.isInteger(RESULT.timestamp)).toBe(true);
    expect(RESULT.timestamp).toBeGreaterThan(0);
    expect(mockedTicketAdd).toHaveBeenCalledTimes(1);
    expect(mockedTicketAdd).toHaveBeenCalledWith(EXPECTED_RESULT);
  });

  test("When role is not employee, an error should be thrown.", async () => {
    ticketToAdd.username = UN2;
    ticketToAdd.role = ROLE2;

    async function runFunc() {
      await ticketService.submitTicket(ticketToAdd);
    }

    expect(runFunc).rejects.toThrow(AuthorizationError);
    expect(mockedTicketAdd).not.toHaveBeenCalled();
  });
});

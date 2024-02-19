const UN1 = "user1";
const UN2 = "user2";

const ROLE1 = "employee";
const ROLE2 = "manager";

const STATUS = "pending";
const TYPE = "meal";
const AMOUNT = 100.01;
const DESCRIPTION = "A description.";
const TIMESTAMP = 1708892217893;

// --------------------------------------------------

const mockedTicketAdd = jest.fn((ticket) => ticket);
const mockedGetTickets = jest.fn((props) => [
  {
    status: STATUS,
    timestamp: TIMESTAMP,
    amount: AMOUNT,
    submitter: UN1,
    description: DESCRIPTION,
    type: TYPE,
  },
]);

jest.mock("../../src/daos/ticketDao", () => ({
  add: mockedTicketAdd,
  getTickets: mockedGetTickets,
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

// --------------------------------------------------

describe("retrieveTickets", () => {
  let expectedResult;
  beforeEach(() => {
    expectedResult = [
      {
        status: STATUS,
        timestamp: TIMESTAMP,
        amount: AMOUNT,
        submitter: UN1,
        description: DESCRIPTION,
        type: TYPE,
      },
    ];
  });

  let data = [
    {
      input: { username: UN1, role: ROLE1 },
      expectedProps: { submitter: UN1 },
    },
    {
      input: { username: UN1, role: ROLE1, status: STATUS },
      expectedProps: { submitter: UN1, status: STATUS },
    },
    {
      input: { username: UN1, role: ROLE1, type: TYPE },
      expectedProps: { submitter: UN1, type: TYPE },
    },
    {
      input: { username: UN1, role: ROLE1, submitter: UN2 },
      expectedProps: { submitter: UN1 },
    },
    {
      input: { username: UN1, role: ROLE1, status: STATUS, type: TYPE },
      expectedProps: { submitter: UN1, status: STATUS, type: TYPE },
    },
  ];

  test.each(data)(
    "For an employee, the properties sent to the DAO must have the submitter property set to the " +
      "employee's username, along with any filter/query properties.  " +
      "Input is $input.  Expected properties should be $expectedProps.",
    async (d) => {
      const RESULT = await ticketService.retrieveTickets(d.input);

      expect(RESULT).toEqual(expectedResult);
      expect(mockedGetTickets).toHaveBeenCalledTimes(1);
      expect(mockedGetTickets).toHaveBeenCalledWith(d.expectedProps);
    }
  );

  data = [
    {
      input: { username: UN2, role: ROLE2 },
      expectedProps: {},
    },
    {
      input: { username: UN2, role: ROLE2, status: STATUS },
      expectedProps: { status: STATUS },
    },
    {
      input: { username: UN2, role: ROLE2, type: TYPE },
      expectedProps: { type: TYPE },
    },
    {
      input: { username: UN2, role: ROLE2, submitter: UN2 },
      expectedProps: { submitter: UN2 },
    },
    {
      input: { username: UN2, role: ROLE2, status: STATUS, type: TYPE, submitter: UN2 },
      expectedProps: { submitter: UN2, status: STATUS, type: TYPE },
    },
  ];

  test.each(data)(
    "For a manager, the properties sent to the DAO should include any given filter/query properties.  " +
      "Input is $input.  Expected properties should be $expectedProps.",
    async (d) => {
      const RESULT = await ticketService.retrieveTickets(d.input);

      expect(RESULT).toEqual(expectedResult);
      expect(mockedGetTickets).toHaveBeenCalledTimes(1);
      expect(mockedGetTickets).toHaveBeenCalledWith(d.expectedProps);
    }
  );
});

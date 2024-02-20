const mockedSanitizeUsername = jest.fn((username) => {
  if (username === UN) {
    return UN;
  } else {
    throw new ArgumentError();
  }
});

jest.mock("../../src/util/accountHelpers.js", () => ({
  ...jest.requireActual("../../src/util/accountHelpers.js"),
  sanitizeUsername: mockedSanitizeUsername,
}));

const {
  validateNewTicketInputs,
  validateGetTicketsInputs,
  validateProcessTicketInputs,
  sanitizeMoney,
  sanitizeTimestamp,
} = require("../../src/util/ticketHelpers");
const ArgumentError = require("../../src/errors/ArgumentError");

// --------------------------------------------------

const UN = "user1";
const ROLE = "employee";
const TYPE = "meal";
const AMOUNT = 100.01;
const DESCRIPTION = "A description.";
const STATUS = "pending";
const SUBMITTER = "user1";
const TIMESTAMP = 1708892499431;

// ==================================================

describe("validateNewTicketInputs", () => {
  test("Giving all valid submitted ticket info should return the same info.", () => {
    const REQUEST_BODY = {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    };
    const EXPECTED_RESULT = {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    };

    const RESULT = validateNewTicketInputs(REQUEST_BODY);

    expect(RESULT).toStrictEqual(EXPECTED_RESULT);
  });

  // Testing the type is separate because it always defaults to "other".
  let requestBodies = [
    {
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    },
    {
      username: UN,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
    },
  ];

  test.each(requestBodies)(
    "Giving a missing property for submitted ticket info should throw an error.",
    (requestBody) => {
      function runFunc() {
        validateNewTicketInputs(requestBody);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );

  // Testing the type is separate because it always defaults to "other".
  requestBodies = [
    {
      username: "",
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: "",
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: "",
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: AMOUNT,
      description: "",
    },
  ];

  test.each(requestBodies)(
    "Giving an empty String for username for submitted ticket info should throw an error.",
    (requestBody) => {
      function runFunc() {
        validateNewTicketInputs(requestBody);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );

  test("Giving an unidentifiable role for submitted ticket info should throw an error.", () => {
    const REQUEST_BODY = {
      username: UN,
      role: "CEO",
      type: TYPE,
      amount: AMOUNT,
      description: DESCRIPTION,
    };

    function runFunc() {
      validateNewTicketInputs(REQUEST_BODY);
    }

    expect(runFunc).toThrow(ArgumentError);
  });

  requestBodies = [
    {
      username: UN,
      role: ROLE,
      amount: AMOUNT,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: "",
      amount: AMOUNT,
      description: DESCRIPTION,
    },
  ];

  test.each(requestBodies)(
    "Giving an invalid value for type should return 'other' for type.",
    (requestBody) => {
      const EXPECTED_RESULT = {
        username: UN,
        role: ROLE,
        type: "other",
        amount: AMOUNT,
        description: DESCRIPTION,
      };

      const RESULT = validateNewTicketInputs(requestBody);

      expect(RESULT).toStrictEqual(EXPECTED_RESULT);
    }
  );

  requestBodies = [
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: -648,
      description: DESCRIPTION,
    },
    {
      username: UN,
      role: ROLE,
      type: TYPE,
      amount: 0,
      description: DESCRIPTION,
    },
  ];

  test.each(requestBodies)(
    "Giving an amount <= 0 should throw an error.  Amount is $amount.",
    (requestBody) => {
      function runFunc() {
        validateNewTicketInputs(requestBody);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );
});

// --------------------------------------------------

describe("validateGetTicketsInputs", () => {
  let data = [
    {
      input: {
        body: {
          username: UN,
          role: ROLE,
        },
        query: {
          status: STATUS,
          type: TYPE,
          submitter: SUBMITTER,
        },
      },
      expectedResult: {
        username: UN,
        role: ROLE,
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    },
    {
      input: {
        body: {
          username: UN,
          role: ROLE,
        },
        query: {
          status: STATUS,
        },
      },
      expectedResult: {
        username: UN,
        role: ROLE,
        status: STATUS,
      },
    },
    {
      input: {
        body: {
          username: UN,
          role: ROLE,
        },
        query: {
          type: TYPE,
        },
      },
      expectedResult: {
        username: UN,
        role: ROLE,
        type: TYPE,
      },
    },
    {
      input: {
        body: {
          username: UN,
          role: ROLE,
        },
        query: {
          submitter: SUBMITTER,
        },
      },
      expectedResult: {
        username: UN,
        role: ROLE,
        submitter: SUBMITTER,
      },
    },
    {
      input: {
        body: {
          username: UN,
          role: ROLE,
        },
        query: {
          status: STATUS,
          type: TYPE,
        },
      },
      expectedResult: {
        username: UN,
        role: ROLE,
        status: STATUS,
        type: TYPE,
      },
    },
  ];

  test.each(data)("Giving all valid info for getting tickets should return the same info.", (d) => {
    const RESULT = validateGetTicketsInputs(d.input);

    expect(RESULT).toStrictEqual(d.expectedResult);
  });

  let requests = [
    {
      body: {
        role: ROLE,
      },
      query: {
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
      },
      query: {
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    },
  ];

  test.each(requests)(
    "Giving a missing necessary property in info for getting tickets should throw an error.",
    (request) => {
      function runFunc() {
        validateGetTicketsInputs(request);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );

  requests = [
    {
      body: {
        username: "",
        role: ROLE,
      },
      query: {
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: "",
      },
      query: {
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    },
  ];

  test.each(requests)(
    "Giving an empty String for a necessary property in info for getting tickets should throw an error.",
    (request) => {
      function runFunc() {
        validateGetTicketsInputs(request);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );

  test("Giving an unidentifiable role for when getting tickets should throw an error.", () => {
    const REQUEST = {
      body: {
        username: UN,
        role: "CEO",
      },
      query: {
        status: STATUS,
        type: TYPE,
        submitter: SUBMITTER,
      },
    };

    function runFunc() {
      validateGetTicketsInputs(REQUEST);
    }

    expect(runFunc).toThrow(ArgumentError);
  });
});

// --------------------------------------------------

describe("sanitizeMoney", () => {
  test("Giving whole numbers should return the same number.", () => {
    const AMOUNT = 739928;

    const RESULT = sanitizeMoney(AMOUNT);

    expect(RESULT).toBe(AMOUNT);
  });

  test("Giving decimal amounts should return a number rounded to 2 decimals.", () => {
    const AMOUNT = 888.8888;
    const EXPECTED_AMOUNT = 888.89;

    const RESULT = sanitizeMoney(AMOUNT);

    expect(RESULT).toBe(EXPECTED_AMOUNT);
  });

  test("Giving undefined should return 0.", () => {
    const AMOUNT = undefined;
    const EXPECTED_AMOUNT = 0;

    const RESULT = sanitizeMoney(AMOUNT);

    expect(RESULT).toBe(EXPECTED_AMOUNT);
  });

  test("Giving a non-number should return 0.", () => {
    const AMOUNT = "abc";
    const EXPECTED_AMOUNT = 0;

    const RESULT = sanitizeMoney(AMOUNT);

    expect(RESULT).toBe(EXPECTED_AMOUNT);
  });
});

// --------------------------------------------------

describe("sanitizeTimestamp", () => {
  test("Giving a valid timestamp should return the same timestamp and in a Number data type.", () => {
    const TIMESTAMP = Date.now() - 1000000;

    const RESULT = sanitizeTimestamp(TIMESTAMP);

    expect(RESULT).toBe(TIMESTAMP);
  });

  test("Giving a timestamp that is negative should throw an error.", () => {
    const TIMESTAMP = -2991028;

    function runFunc() {
      sanitizeTimestamp(TIMESTAMP);
    }

    expect(runFunc).toThrow(ArgumentError);
  });

  test("Giving a timestamp of zero should throw an error.", () => {
    const TIMESTAMP = 0;

    function runFunc() {
      sanitizeTimestamp(TIMESTAMP);
    }

    expect(runFunc).toThrow(ArgumentError);
  });

  test("Giving a timestamp that is in the future should throw an error.", () => {
    const TIMESTAMP = Date.now() + 1000000000;

    function runFunc() {
      sanitizeTimestamp(TIMESTAMP);
    }

    expect(runFunc).toThrow(ArgumentError);
  });

  let timestamps = ["abc", false, true, null, undefined, { timestamp: 9999999 }, [8888888, 77777]];
  test.each(timestamps)(
    "Giving a non-integer timestamp of %s should throw an error.",
    (timestamp) => {
      function runFunc() {
        sanitizeTimestamp(timestamp);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );
});

// --------------------------------------------------

describe("validateProcessTicketInputs", () => {
  test("Giving all valid needed info for processing a ticket should an object", () => {
    const REQUEST = {
      body: { username: UN, role: ROLE, status: "denied" },
      params: { submitter: SUBMITTER, timestamp: TIMESTAMP },
    };
    const EXPECTED_RESULT = {
      username: UN,
      role: ROLE,
      submitter: SUBMITTER,
      timestamp: TIMESTAMP,
      status: "denied",
    };

    const RESULT = validateProcessTicketInputs(REQUEST);

    expect(RESULT).toStrictEqual(EXPECTED_RESULT);
    expect(mockedSanitizeUsername).toHaveBeenCalledTimes(1);
    expect(mockedSanitizeUsername).toHaveBeenCalledWith(UN);
  });

  requests = [
    {
      body: {
        role: ROLE,
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: STATUS,
      },
      params: {
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
      },
    },
    {
      body: {
        username: "",
        role: ROLE,
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: "",
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: "",
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: STATUS,
      },
      params: {
        timestamp: "",
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: "",
      },
    },
  ];

  test.each(requests)("Giving a missing or empty parameter should throw an error.", (request) => {
    function runFunc() {
      validateProcessTicketInputs(request);
    }

    expect(runFunc).toThrow(ArgumentError);
    expect(mockedSanitizeUsername).toHaveBeenCalledTimes(1);
  });

  requests = [
    {
      body: {
        username: UN,
        role: "admin",
        status: STATUS,
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
    {
      body: {
        username: UN,
        role: ROLE,
        status: "waiting",
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    },
  ];

  test.each(requests)(
    "Giving a property with an unidentifiable value should throw an error.",
    (request) => {
      function runFunc() {
        validateProcessTicketInputs(request);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );

  test("Giving a new status of pending should throw an error.", () => {
    const REQUEST = {
      body: {
        username: UN,
        role: ROLE,
        status: "pending",
      },
      params: {
        timestamp: TIMESTAMP,
        submitter: SUBMITTER,
      },
    };

    function runFunc() {
      validateProcessTicketInputs(REQUEST);
    }

    expect(runFunc).toThrow(ArgumentError);
  });
});

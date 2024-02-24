const { validateTicketInputs, sanitizeMoney } = require("../../src/util/ticketHelpers");
const ArgumentError = require("../../src/errors/ArgumentError");

// --------------------------------------------------

const UN = "user1";
const ROLE = "employee";
const TYPE = "meal";
const AMOUNT = 100.01;
const DESCRIPTION = "A description.";

// ==================================================

describe("validateTicketInputs", () => {
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

    const RESULT = validateTicketInputs(REQUEST_BODY);

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
        validateTicketInputs(requestBody);
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
        validateTicketInputs(requestBody);
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
      validateTicketInputs(REQUEST_BODY);
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

      const RESULT = validateTicketInputs(requestBody);

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
        validateTicketInputs(requestBody);
      }

      expect(runFunc).toThrow(ArgumentError);
    }
  );
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

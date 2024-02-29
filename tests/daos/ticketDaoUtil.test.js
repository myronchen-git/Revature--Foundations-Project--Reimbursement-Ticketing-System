const env = require("dotenv").config();

// ==================================================

const UN1 = "user1";
const STATUS = "pending";
const TYPE = "insurance";

const QC = "QueryCommand";
const SC = "ScanCommand";

// --------------------------------------------------

const mockedQueryCommand = jest.fn((command) => ({ type: QC }));
const mockedScanCommand = jest.fn((command) => ({ type: SC }));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  QueryCommand: mockedQueryCommand,
  ScanCommand: mockedScanCommand,
}));

const tickatDao = require("../../src/daos/ticketDaoUtil");

// ==================================================

describe("constructGetTicketsCommand", () => {
  test("Passing no properties should return a ScanCommand object.", () => {
    const PROPS = {};
    const EXPECTED_RESULT_OBJECT_TYPE = SC;
    const EXPECTED_COMMAND_OBJECT = {
      TableName: process.env.TABLE_TICKETS_NAME,
      IndexName: process.env.TABLE_TICKETS_INDEX_1,
    };

    const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

    expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
    expect(mockedScanCommand).toHaveBeenCalledTimes(1);
    expect(mockedScanCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
    expect(mockedQueryCommand).not.toHaveBeenCalled();
  });

  test(
    "Passing properties that only includes submitter should return " +
      "a QueryCommand object that uses the base table.",
    () => {
      const PROPS = { submitter: UN1 };
      const EXPECTED_RESULT_OBJECT_TYPE = QC;
      const EXPECTED_COMMAND_OBJECT = {
        TableName: process.env.TABLE_TICKETS_NAME,
        KeyConditionExpression: "submitter = :submitter",
        ExpressionAttributeValues: { ":submitter": UN1 },
      };

      const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

      expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
      expect(mockedQueryCommand).toHaveBeenCalledTimes(1);
      expect(mockedQueryCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
      expect(mockedScanCommand).not.toHaveBeenCalled();
    }
  );

  test(
    "Passing properties that only includes status should return " +
      `a QueryCommand object that uses the ${process.env.TABLE_TICKETS_INDEX_1}.`,
    () => {
      const PROPS = { status: STATUS };
      const EXPECTED_RESULT_OBJECT_TYPE = QC;
      const EXPECTED_COMMAND_OBJECT = {
        TableName: process.env.TABLE_TICKETS_NAME,
        IndexName: process.env.TABLE_TICKETS_INDEX_1,
        KeyConditionExpression: "#s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": STATUS },
      };

      const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

      expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
      expect(mockedQueryCommand).toHaveBeenCalledTimes(1);
      expect(mockedQueryCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
      expect(mockedScanCommand).not.toHaveBeenCalled();
    }
  );

  test(
    "Passing properties that only includes type should return " +
      `a QueryCommand object that uses the ${process.env.TABLE_TICKETS_INDEX_2}.`,
    () => {
      const PROPS = { type: TYPE };
      const EXPECTED_RESULT_OBJECT_TYPE = QC;
      const EXPECTED_COMMAND_OBJECT = {
        TableName: process.env.TABLE_TICKETS_NAME,
        IndexName: process.env.TABLE_TICKETS_INDEX_2,
        KeyConditionExpression: "#t = :type",
        ExpressionAttributeNames: { "#t": "type" },
        ExpressionAttributeValues: { ":type": TYPE },
      };

      const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

      expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
      expect(mockedQueryCommand).toHaveBeenCalledTimes(1);
      expect(mockedQueryCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
      expect(mockedScanCommand).not.toHaveBeenCalled();
    }
  );

  test(
    "Passing properties that includes status, and type should return " +
      `a QueryCommand object that uses the ${process.env.TABLE_TICKETS_INDEX_1}.`,
    () => {
      const PROPS = { status: STATUS, type: TYPE };
      const EXPECTED_RESULT_OBJECT_TYPE = QC;
      const EXPECTED_COMMAND_OBJECT = {
        TableName: process.env.TABLE_TICKETS_NAME,
        IndexName: process.env.TABLE_TICKETS_INDEX_1,
        KeyConditionExpression: "#s = :status",
        FilterExpression: "#t = :type",
        ExpressionAttributeNames: { "#s": "status", "#t": "type" },
        ExpressionAttributeValues: {
          ":status": STATUS,
          ":type": TYPE,
        },
      };

      const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

      expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
      expect(mockedQueryCommand).toHaveBeenCalledTimes(1);
      expect(mockedQueryCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
      expect(mockedScanCommand).not.toHaveBeenCalled();
    }
  );

  test(
    "Passing properties that includes submitter, status, and type should return " +
      `a QueryCommand object that uses the base table.`,
    () => {
      const PROPS = { submitter: UN1, status: STATUS, type: TYPE };
      const EXPECTED_RESULT_OBJECT_TYPE = QC;
      const EXPECTED_COMMAND_OBJECT = {
        TableName: process.env.TABLE_TICKETS_NAME,
        KeyConditionExpression: "submitter = :submitter",
        FilterExpression: "#s = :status AND #t = :type",
        ExpressionAttributeNames: { "#s": "status", "#t": "type" },
        ExpressionAttributeValues: {
          ":submitter": UN1,
          ":status": STATUS,
          ":type": TYPE,
        },
      };

      const RESULT = tickatDao.constructGetTicketsCommand(PROPS);

      expect(RESULT.type).toBe(EXPECTED_RESULT_OBJECT_TYPE);
      expect(mockedQueryCommand).toHaveBeenCalledTimes(1);
      expect(mockedQueryCommand).toHaveBeenCalledWith(EXPECTED_COMMAND_OBJECT);
      expect(mockedScanCommand).not.toHaveBeenCalled();
    }
  );
});

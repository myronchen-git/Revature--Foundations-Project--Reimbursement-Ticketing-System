const logger = require("../util/logger");
const { QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// --------------------------------------------------

const TABLE_NAME = "Foundations_Project-ERS-Tickets";
const INDEX1 = "status-timestamp-index";
const INDEX2 = "type-timestamp-index";

// ==================================================

/**
 * Helps to create the DynamoDB query or scan command by using the given filter options.
 *
 * @param {Object} props The filter choices, including any of {status, type, submitter}.
 * @returns A DynamoDB QueryCommand or ScanCommand object.
 */
function constructGetTicketsCommand(props) {
  logger.info(`ticketDao.constructGetTicketsCommand(${JSON.stringify(props)})`);

  const COMMAND_OBJECT = { TableName: TABLE_NAME };
  const FILTER_EXPRESSION = [];
  const EXPRESSION_ATTRIBUTE_NAMES = {};
  const EXPRESSION_ATTRIBUTE_VALUES = {};

  if (props.submitter) {
    COMMAND_OBJECT["KeyConditionExpression"] = "submitter = :submitter";
    EXPRESSION_ATTRIBUTE_VALUES[":submitter"] = props.submitter;

    if (props.status) {
      FILTER_EXPRESSION.push("#s = :status");
      EXPRESSION_ATTRIBUTE_NAMES["#s"] = "status";
      EXPRESSION_ATTRIBUTE_VALUES[":status"] = props.status;
    }

    if (props.type) {
      FILTER_EXPRESSION.push("#t = :type");
      EXPRESSION_ATTRIBUTE_NAMES["#t"] = "type";
      EXPRESSION_ATTRIBUTE_VALUES[":type"] = props.type;
    }
  } else if (props.status) {
    COMMAND_OBJECT["IndexName"] = INDEX1;
    COMMAND_OBJECT["KeyConditionExpression"] = "#s = :status";
    EXPRESSION_ATTRIBUTE_NAMES["#s"] = "status";
    EXPRESSION_ATTRIBUTE_VALUES[":status"] = props.status;

    if (props.type) {
      FILTER_EXPRESSION.push("#t = :type");
      EXPRESSION_ATTRIBUTE_NAMES["#t"] = "type";
      EXPRESSION_ATTRIBUTE_VALUES[":type"] = props.type;
    }
  } else if (props.type) {
    COMMAND_OBJECT["IndexName"] = INDEX2;
    COMMAND_OBJECT["KeyConditionExpression"] = "#t = :type";
    EXPRESSION_ATTRIBUTE_NAMES["#t"] = "type";
    EXPRESSION_ATTRIBUTE_VALUES[":type"] = props.type;
  } else {
    COMMAND_OBJECT["IndexName"] = INDEX1;
  }

  if (FILTER_EXPRESSION.length !== 0) {
    COMMAND_OBJECT["FilterExpression"] = FILTER_EXPRESSION.join(" AND ");
  }
  if (Object.keys(EXPRESSION_ATTRIBUTE_NAMES).length !== 0) {
    COMMAND_OBJECT["ExpressionAttributeNames"] = EXPRESSION_ATTRIBUTE_NAMES;
  }
  if (Object.keys(EXPRESSION_ATTRIBUTE_VALUES).length !== 0) {
    COMMAND_OBJECT["ExpressionAttributeValues"] = EXPRESSION_ATTRIBUTE_VALUES;
  }

  logger.info(
    `ticketDaoUtil.constructGetTicketsCommand: Command argument is ${JSON.stringify(
      COMMAND_OBJECT
    )}.`
  );

  if (Object.keys(props).length !== 0) {
    return new QueryCommand(COMMAND_OBJECT);
  } else {
    return new ScanCommand(COMMAND_OBJECT);
  }
}

// ==================================================

module.exports = {
  constructGetTicketsCommand,
};

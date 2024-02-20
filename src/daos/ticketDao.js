const logger = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const { constructGetTicketsCommand } = require("./ticketDaoUtil");

// --------------------------------------------------

const TABLE_NAME = "Foundations_Project-ERS-Tickets";

// ==================================================

/**
 * Adds a ticket entry into the database, if the ticket ID does not already exist.
 *
 * @param {Object} ticket The ticket to add: {submitter, timestamp, status, type, amount, description}.
 * @returns The ticket that was saved or null.
 */
async function add(ticket) {
  logger.info(`ticketDao.add(${JSON.stringify(ticket)})`);

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: ticket,
    ConditionExpression: "attribute_not_exists(id)",
  });

  let data;
  try {
    data = await documentClient.send(command);
  } catch (err) {
    logger.error(err);
    throw err;
  }

  const SUCCESS = data.$metadata.httpStatusCode === 200;

  logger.info(
    `ticketDao.add: Ticket<${JSON.stringify(ticket)}> added ${
      SUCCESS ? "successfully" : "unsuccessfully"
    }.`
  );

  return SUCCESS ? ticket : null;
}

/**
 * Makes a query or scan request to the database.
 * @param {Object} props Object containing the query or scan properties {status, type, submitter}.
 * @returns A list of tickets or an empty list.
 */
async function getTickets(props) {
  logger.info(`ticketDao.getTickets(${JSON.stringify(props)})`);

  const COMMAND = constructGetTicketsCommand(props);

  let data;
  try {
    data = await documentClient.send(COMMAND);
  } catch (err) {
    logger.error(err);
    throw err;
  }

  const SUCCESS = data.$metadata.httpStatusCode === 200;

  logger.info(
    `ticketDao.getTickets: Tickets retrieved ${
      SUCCESS ? "successfully" : "unsuccessfully"
    }:\n${JSON.stringify(data.Items)}.`
  );

  return data.Items;
}

/**
 * Updates the status and the resolver of a ticket in the database, if the ticket status is pending.
 *
 * @param {Object} props The properties to use in the DynamoDB update command {submitter, timestamp, status, resolver}.
 * @returns The updated Ticket {submitter, timestamp, status, type, amount, description}.
 * @throws  ConditionalCheckFailedException if ticket status is not pending.
 */
async function setTicketStatus(props) {
  logger.info(`ticketDao.setTicketStatus(${JSON.stringify(props)})`);

  const COMMAND = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      submitter: props.submitter,
      timestamp: props.timestamp,
    },
    ConditionExpression: "#s = :pending",
    UpdateExpression: "SET #s = :s, resolver = :r",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":pending": "pending", ":s": props.status, ":r": props.resolver },
    ReturnValues: "ALL_NEW",
    ReturnValuesOnConditionCheckFailure: "ALL_OLD",
  });

  let data;
  try {
    data = await documentClient.send(COMMAND);
  } catch (err) {
    logger.error(
      `ticketDao.setTicketStatus: ${err}\nCurrent ticket info: ${JSON.stringify(err.Item)}.`
    );
    throw err;
  }
  const UPDATED_TICKET = data.Attributes;

  logger.info(
    `ticketDao.setTicketStatus: Ticket status updated, new ticket is ${JSON.stringify(
      UPDATED_TICKET
    )}.`
  );

  return UPDATED_TICKET;
}

// ==================================================

module.exports = {
  add,
  getTickets,
  setTicketStatus,
};

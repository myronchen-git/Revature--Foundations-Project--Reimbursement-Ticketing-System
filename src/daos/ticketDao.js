const logger = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

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

// ==================================================

module.exports = {
  add,
  getTickets,
};

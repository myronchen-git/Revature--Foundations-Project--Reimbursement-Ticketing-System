const logger = require("../util/logger");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-1" });
const documentClient = DynamoDBDocumentClient.from(client);
const tableName = "Foundations_Project-ERS-Tickets";

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
    TableName: tableName,
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

// ==================================================

module.exports = {
  add,
};
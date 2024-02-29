const logger = require("../util/logger");
const env = require("dotenv").config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });
const documentClient = DynamoDBDocumentClient.from(client);

const AccountError = require("../errors/AccountError");

// ==================================================

/**
 * Retrieves an account from the database.
 *
 * @param {String} username The username of the account.
 * @returns Account object or undefined.
 */
async function get(username) {
  logger.info(`accountDao.get("${username}")`);

  const COMMAND = new GetCommand({
    TableName: process.env.TABLE_ACCOUNTS_NAME,
    Key: { username },
  });

  let data;
  try {
    data = await documentClient.send(COMMAND);
  } catch (err) {
    logger.error(err);
    throw err;
  }

  const ACCOUNT = data.Item;

  logger.info(`accountDao.get: Account<${JSON.stringify(ACCOUNT)}>`);
  return ACCOUNT;
}

/**
 * Adds a new account to the database accounts table, if the new account's username doesn't already exist.
 *
 * @param {String} username The username to use for the new account.
 * @param {String} password The password to use for the new account.
 * @param {String} role The job role of the user.
 * @returns An object with username and role, or null.
 */
async function add(username, password, role) {
  logger.info(`accountDao.add(${username}, ${password}, ${role})`);

  const COMMAND = new PutCommand({
    TableName: process.env.TABLE_ACCOUNTS_NAME,
    Item: { username, password, role },
    ConditionExpression: "attribute_not_exists(username)",
  });

  let data;
  try {
    data = await documentClient.send(COMMAND);
  } catch (err) {
    logger.error(err);
    throw err;
  }

  const SUCCESS = data.$metadata.httpStatusCode === 200;

  logger.info(
    `accountDao.add: (${username}, ${password}, ${role}) added ${
      SUCCESS ? "successfully" : "unsuccessfully"
    }.`
  );

  if (SUCCESS) {
    return { username, role };
  } else {
    throw new AccountError("Database failed to add a new account.");
  }
}

// ==================================================

module.exports = {
  get,
  add,
};

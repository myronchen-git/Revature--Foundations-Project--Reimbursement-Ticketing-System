const logger = require("./logger");

const { ROLES, sanitizeUsername } = require("./accountHelpers");
const ArgumentError = require("../errors/ArgumentError");

// --------------------------------------------------

const STATUSES = new Set(["pending", "approved", "denied"]);

// ==================================================

/**
 * Sanitizes, formats, and validates the info for a new ticket.
 *
 * @param {Object} submittedTicketInfo Submitted user and ticket info: {username, role, type, amount, description}.
 * @returns A new Object that is ready to be placed into the database: {username, role, type, amount, description}.
 */
function validateNewTicketInputs(submittedTicketInfo) {
  logger.info(`ticketHelpers.validateNewTicketInputs(${JSON.stringify(submittedTicketInfo)})`);

  let { username, role, type, amount, description } = submittedTicketInfo;

  amount = sanitizeMoney(amount);
  type = String(type || "other");

  if (username && role && ROLES.has(role) && amount > 0 && description) {
    const SANITIZED_SUBMITTED_TICKET_INFO = { username, role, type, amount, description };

    logger.info(
      `ticketHelpers.validateNewTicketInputs: Sanitized submitted ticket info is ${JSON.stringify(
        SANITIZED_SUBMITTED_TICKET_INFO
      )}.`
    );
    return SANITIZED_SUBMITTED_TICKET_INFO;
  } else {
    logger.error(
      `ticketHelpers.validateNewTicketInputs: Invalid request body parameters in ${JSON.stringify(
        submittedTicketInfo
      )}`
    );

    throw new ArgumentError("Invalid request body parameters for ticket submission.");
  }
}

/**
 * Sanitizes, formats, and validates the info for getting tickets.  Query parameters are optional.
 *
 * @param {Request} req Request Object with user info in the body and query parameters:
 * {body: {username, role}, query: {status, type, submitter}}.
 * @returns A new Object to be used to query tickets from the database {username, role, status, type, submitter}.
 */
function validateGetTicketsInputs(req) {
  logger.info(
    `ticketHelpers.validateGetTicketsInputs({` +
      `body: ${JSON.stringify(req.body)}, ` +
      `query: ${JSON.stringify(req.query)}` +
      `})`
  );

  let { username, role } = req.body;
  let { status, type, submitter } = req.query;

  if (username && role && ROLES.has(role)) {
    const SANITIZED_GET_TICKETS_INFO = { username, role };

    if (submitter) {
      SANITIZED_GET_TICKETS_INFO.submitter = String(submitter);
    }

    if (status) {
      SANITIZED_GET_TICKETS_INFO.status = String(status);
    }

    if (type) {
      SANITIZED_GET_TICKETS_INFO.type = String(type);
    }

    logger.info(
      `ticketHelpers.validateGetTicketsInputs: Sanitized get-tickets info is ${JSON.stringify(
        SANITIZED_GET_TICKETS_INFO
      )}.`
    );
    return SANITIZED_GET_TICKETS_INFO;
  } else {
    logger.error(
      `ticketHelpers.validateGetTicketsInputs: Invalid request parameters in {` +
        `body: ${JSON.stringify(req.body)}, ` +
        `query: ${JSON.stringify(req.query)}` +
        `}`
    );

    throw new ArgumentError("Invalid request parameters for getting tickets.");
  }
}

/**
 * Sanitizes, validates, and formats the parameters for processing a pending ticket,
 * and returns an Object of the parameters/properties that can be used to process a ticket.
 *
 * @param {Request} req Request Object with user info and new status in the body and path parameters:
 * {body: {username, role, status}, params: submitter, timestamp}}.
 * @returns A new Object to be used to process a ticket from the database {username, role, submitter, timestamp, status}.
 */
function validateProcessTicketInputs(req) {
  logger.info(
    `ticketHelpers.validateProcessTicketInputs({` +
      `body: ${JSON.stringify(req.body)}, ` +
      `params: ${JSON.stringify(req.params)}` +
      `})`
  );

  let { username, role, status } = req.body;
  let submitter = sanitizeUsername(req.params.submitter);
  let timestamp = sanitizeTimestamp(req.params.timestamp);

  if (
    username &&
    role &&
    ROLES.has(role) &&
    status &&
    STATUSES.has(status) &&
    status !== "pending" &&
    submitter &&
    timestamp
  ) {
    const SANITIZED_PROCESS_TICKET_INFO = { username, role, submitter, timestamp, status };

    logger.info(
      `ticketHelpers.validateProcessTicketInputs: Sanitized info for processing ticket is ${JSON.stringify(
        SANITIZED_PROCESS_TICKET_INFO
      )}.`
    );
    return SANITIZED_PROCESS_TICKET_INFO;
  } else {
    logger.error(
      `ticketHelpers.validateProcessTicketInputs: Invalid request parameters in {` +
        `body: ${JSON.stringify(req.body)}, ` +
        `params: ${JSON.stringify(req.params)}` +
        `}`
    );

    throw new ArgumentError(
      "Invalid username, role, status, submitter, or timestamp in request parameters for processing ticket."
    );
  }
}

// --------------------------------------------------

/**
 * Takes any value and converts it to a number with at most 2 decimals.  If it can not be converted, then 0 is returned.
 *
 * @param {*} amount Value to convert to a money format.
 * @returns Amount as a number, rounded to 2 decimals.
 */
function sanitizeMoney(amount) {
  logger.info(`ticketHelpers.sanitizeMoney(${amount})`);

  const NEW_AMOUNT = Math.round(Number(amount) * 100) / 100 || 0;

  logger.info(`ticketHelpers.sanitizeMoney: Sanitized amount is ${NEW_AMOUNT}.`);
  return NEW_AMOUNT;
}

/**
 * Checks if a provided value is a timestamp.
 *
 * @param {Number} timestamp A number representing a timestamp.
 * @returns A valid timestamp.
 * @throws ArgumentError if the value is not a valid unix timestamp.
 */
function sanitizeTimestamp(timestamp) {
  logger.info(`ticketHelpers.sanitizeTimestamp(${timestamp})`);

  const NEW_TIMESTAMP = Number(timestamp) && Math.round(Number(timestamp));

  if (NEW_TIMESTAMP && NEW_TIMESTAMP > 1 && NEW_TIMESTAMP < Date.now()) {
    logger.info(`ticketHelpers.sanitizeTimestamp: Sanitized timestamp is ${NEW_TIMESTAMP}.`);
    return NEW_TIMESTAMP;
  }

  logger.error(
    `ticketHelpers.sanitizeTimestamp: ${timestamp} is not a valid unix timestamp number.`
  );
  throw new ArgumentError("Timestamp is not a valid unix timestamp number.");
}

// ==================================================

module.exports = {
  STATUSES,
  validateNewTicketInputs,
  validateGetTicketsInputs,
  validateProcessTicketInputs,
  sanitizeMoney,
  sanitizeTimestamp,
};

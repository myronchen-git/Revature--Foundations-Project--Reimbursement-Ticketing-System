const logger = require("./logger");

const { ROLES } = require("../util/accountHelpers");
const ArgumentError = require("../errors/ArgumentError");

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
 * Sanitizes, formats, and validates the info for getting tickets.  Query parameters are optional.
 *
 * @param {Object} req Request Object with user info in the body and query parameters:
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

// ==================================================

module.exports = {
  validateNewTicketInputs,
  sanitizeMoney,
  validateGetTicketsInputs,
};

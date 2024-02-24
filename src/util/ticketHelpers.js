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
function validateTicketInputs(submittedTicketInfo) {
  logger.info(`ticketHelpers.validateTicketInputs(${JSON.stringify(submittedTicketInfo)})`);

  let { username, role, type, amount, description } = submittedTicketInfo;

  amount = sanitizeMoney(amount);
  type = String(type || "other");

  if (username && role && ROLES.has(role) && amount > 0 && description) {
    const SANITIZED_SUBMITTED_TICKET_INFO = { username, role, type, amount, description };

    logger.info(
      `ticketHelpers.validateTicketInputs: Sanitized submitted ticket info is ${JSON.stringify(
        SANITIZED_SUBMITTED_TICKET_INFO
      )}.`
    );
    return SANITIZED_SUBMITTED_TICKET_INFO;
  } else {
    logger.error(
      `ticketHelpers.validateTicketInputs: Invalid request body parameters in ${JSON.stringify(
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

// ==================================================

module.exports = {
  validateTicketInputs,
  sanitizeMoney,
};

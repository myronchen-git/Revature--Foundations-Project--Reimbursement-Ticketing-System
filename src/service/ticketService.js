const logger = require("../util/logger");
const crypto = require("crypto");

const ticketDao = require("../daos/ticketDao");
const AuthorizationError = require("../errors/AuthorizationError");

// ==================================================

/**
 * Takes a sanitized user ticket submission, transforms it to a suitable database model, and adds it to the database.
 *
 * @param {Object} submittedTicketInfo Sanitized user inputs for creating a new ticket:
 * {username, role, type, amount, description}.
 * @returns The ticket object {id, status, submitter, type, amount, description, timestamp} that was added,
 * containing the same attributes that the database has.
 */
async function submitTicket(submittedTicketInfo) {
  logger.info(`ticketService.submitTicket(${JSON.stringify(submittedTicketInfo)})`);

  if (submittedTicketInfo.role === "employee") {
    const SUBMITTED_TICKET = await ticketDao.add({
      id: crypto.randomUUID(),
      status: "pending",
      submitter: submittedTicketInfo.username,
      type: submittedTicketInfo.type,
      amount: submittedTicketInfo.amount,
      description: submittedTicketInfo.description,
      timestamp: Date.now(),
    });

    logger.info(
      `ticketService.submitTicket: Ticket successfully submitted... ${JSON.stringify(
        SUBMITTED_TICKET
      )}.`
    );

    return SUBMITTED_TICKET;
  } else {
    logger.error(
      `ticketService.submitTicket: ${submittedTicketInfo.username} does not have a role of employee.`
    );

    throw new AuthorizationError(
      `Account with username ${submittedTicketInfo.username} can not submit a new ticket.  ` +
        `Only accounts with role of employee can.`
    );
  }
}

// ==================================================

module.exports = {
  submitTicket,
};

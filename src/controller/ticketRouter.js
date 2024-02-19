const logger = require("../util/logger");
const express = require("express");

const ticketService = require("../service/ticketService");
const { authenticateTokenMiddleware } = require("../util/accountHelpers");
const { validateNewTicketInputs, validateGetTicketsInputs } = require("../util/ticketHelpers");
const AuthorizationError = require("../errors/AuthorizationError");

const router = express.Router();

// ==================================================

/**
 * Submit ticket
 */
router.post("/", authenticateTokenMiddleware, validationMiddleware, async (req, res) => {
  try {
    const SUBMITTED_TICKET = await ticketService.submitTicket(req.body);
    res.status(201).json({ message: `Ticket successfully submitted.`, ticket: SUBMITTED_TICKET });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      logger.error(`ticketRouter -> /: ${err.message}.`);
      res.status(err.status).json({ message: err.message });
    } else {
      logger.error(`ticketRouter -> /: Internal Server Error\n${err}`);
      res.status(500).json({ message: "Server error." });
    }
  }
});

/**
 * Get tickets
 */
router.get("/", authenticateTokenMiddleware, validationMiddleware, async (req, res) => {
  try {
    const TICKETS = await ticketService.retrieveTickets(req.body);

    res.status(200).json({ message: `Tickets successfully retrieved.`, tickets: TICKETS });
  } catch (err) {
    logger.error(`ticketRouter -> /: Internal Server Error\n${err}`);
    res.status(500).json({ message: "Server error." });
  }
});

// --------------------------------------------------

/**
 * Validates user inputs.
 */
function validationMiddleware(req, res, next) {
  try {
    if (req.method === "POST") {
      req.body = validateNewTicketInputs(req.body);
    } else if (req.method === "GET") {
      req.body = validateGetTicketsInputs(req);
    }

    next();
  } catch (err) {
    logger.error(`ticketRouter.validationMiddleware: Validation failed.`);
    res.status(400).json({ message: err.message });
  }
}

// ==================================================

module.exports = router;

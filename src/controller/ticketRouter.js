const logger = require("../util/logger");
const express = require("express");

const ticketService = require("../service/ticketService");
const { authenticateTokenMiddleware } = require("../util/accountHelpers");
const {
  validateNewTicketInputs,
  validateGetTicketsInputs,
  validateProcessTicketInputs,
} = require("../util/ticketHelpers");
const AuthorizationError = require("../errors/AuthorizationError");
const ArgumentError = require("../errors/ArgumentError");

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

/**
 * Updates a ticket
 */
router.patch(
  "/:submitter-:timestamp",
  authenticateTokenMiddleware,
  validationMiddleware,
  async (req, res) => {
    try {
      const UPDATED_TICKET = await ticketService.processTicket(req.body);
      res.status(200).json({ message: `Ticket successfully processed.`, ticket: UPDATED_TICKET });
    } catch (err) {
      if (
        err instanceof ArgumentError ||
        err instanceof AuthorizationError ||
        err.name === "ConditionalCheckFailedException"
      ) {
        logger.error(`ticketRouter -> /${req.body.submitter}-${req.body.timestamp}: ${err}`);
        res.status(err.status).json({ message: err.message });
      } else {
        logger.error(
          `ticketRouter -> /${req.body.submitter}-${req.body.timestamp}: Internal Server Error\n${err}`
        );
        res.status(500).json({ message: "Server error." });
      }
    }
  }
);

// --------------------------------------------------

/**
 * Validates user inputs.
 */
function validationMiddleware(req, res, next) {
  try {
    if (req.path === "/") {
      if (req.method === "POST") {
        req.body = validateNewTicketInputs(req.body);
      } else if (req.method === "GET") {
        req.body = validateGetTicketsInputs(req);
      }
    } else if (req.method === "PATCH") {
      req.body = validateProcessTicketInputs(req);
    }

    next();
  } catch (err) {
    logger.error(`ticketRouter.validationMiddleware: Validation failed.`);
    res.status(400).json({ message: err.message });
  }
}

// ==================================================

module.exports = router;

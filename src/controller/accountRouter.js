const logger = require("../util/logger");
const express = require("express");
const bcrypt = require("bcrypt");

const accountService = require("../service/accountService");
const { sanitizeUsername, validatePassword } = require("../util/accountHelpers");
const RegisteringExistingUsernameError = require("../errors/RegisteringExistingUsernameError");
const AccountError = require("../errors/AccountError");

const router = express.Router();

// --------------------------------------------------

const SALT_ROUNDS = 10;

// ==================================================

/**
 * Register account
 */
router.post("/register", validationMiddleware, async (req, res) => {
  try {
    const HASHED_PASSWORD = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const ACCOUNT = await accountService.register(req.body.username, HASHED_PASSWORD);

    logger.info(`accountRouter -> /register: Created account ${JSON.stringify(ACCOUNT)}.`);
    res.status(200).json({ message: `${ACCOUNT.username} successfully registered.`, ACCOUNT });
  } catch (err) {
    if (err instanceof RegisteringExistingUsernameError || err instanceof AccountError) {
      logger.error(`accountRouter -> /register: ${err}`);
      res.status(err.status).json({ message: err.message });
    } else {
      logger.error(`accountRouter -> /register: Internal Server Error\n${err}`);
      res.status(500).json({ message: "Internal Server Error." });
    }
  }
});

/**
 * Validates that the username and password inputs are valid.
 */
function validationMiddleware(req, res, next) {
  try {
    req.body.username = sanitizeUsername(req.body.username);
    req.body.password = validatePassword(req.body.password);
    next();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// ==================================================

module.exports = router;

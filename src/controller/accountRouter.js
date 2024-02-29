const logger = require("../util/logger");
const express = require("express");
const bcrypt = require("bcrypt");

const accountService = require("../service/accountService");
const { sanitizeUsername, validatePassword } = require("../util/accountHelpers");
const RegisteringExistingUsernameError = require("../errors/RegisteringExistingUsernameError");
const AccountError = require("../errors/AccountError");
const InvalidLoginError = require("../errors/InvalidLoginError");

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
    res
      .status(200)
      .json({ message: `${ACCOUNT.username} successfully registered.`, account: ACCOUNT });
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
 * Log in account
 */
router.post("/login", validationMiddleware, async (req, res) => {
  try {
    const AUTH_TOKEN = await accountService.login(req.body.username, req.body.password);

    logger.info(
      `accountRouter -> /login: "${req.body.username}" successfully logged in and is given ${AUTH_TOKEN}`
    );
    res.status(200).json({ message: "Successfully logged in.", authToken: AUTH_TOKEN });
  } catch (err) {
    if (err instanceof InvalidLoginError) {
      logger.error(`accountRouter -> /login: ${err}`);
      res.status(err.status).json({ message: "Incorrect username or password." });
    } else {
      logger.error(`accountRouter -> /login: Internal Server Error\n${err}`);
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
    logger.error(`accountRouter.validationMiddleware: Validation failed.`);
    res.status(400).json({ message: err.message });
  }
}

// ==================================================

module.exports = router;

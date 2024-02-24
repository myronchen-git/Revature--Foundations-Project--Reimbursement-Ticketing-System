const logger = require("./logger");

const authToken = require("../util/authToken");

// --------------------------------------------------

MAX_USERNAME_LENGTH = 40;
MAX_PASSWORD_LENGTH = 200;
const ROLES = new Set(["employee", "manager"]);

// ==================================================

/**
 * Converts and checks if a value is a valid username.  It is valid if it only has alphanumeric characters and is
 * not longer than the set max length.
 *
 * @param {*} username A value of any type, representing a username.
 * @returns A sanitized username.
 * @throws Error if username is not valid.
 */
function sanitizeUsername(username) {
  logger.info(`accountHelpers.sanitizeUsername(${username})`);

  const usernameString = String(username);

  if (
    username &&
    /^[a-zA-Z0-9]+$/.test(usernameString) &&
    usernameString.length <= MAX_USERNAME_LENGTH
  ) {
    return usernameString;
  }

  logger.error(`accountHelpers.sanitizeUsername: '${username}' is not a valid username.`);
  throw new Error(
    `Username is invalid.  Only alphanumeric characters are allowed and ` +
      `length has to be at most ${MAX_USERNAME_LENGTH} long.`
  );
}

/**
 * Converts and checks to see if password is valid.
 *
 * @param {*} password A value of any type, representing a password.
 * @returns A password String.
 * @throws Error if password is not valid.
 */
function validatePassword(password) {
  logger.info(`accountHelpers.validatePassword((password))`);

  const passwordString = String(password);

  if (password && passwordString.length <= MAX_PASSWORD_LENGTH) {
    return passwordString;
  }

  logger.error(`accountHelpers.validatePassword: Password is not valid.`);
  throw new Error(`Password is invalid.  Max length is ${MAX_PASSWORD_LENGTH}.`);
}

/**
 * Middleware function for an Express route that authenticates a token that a user has provided.
 * The decoded token payload will be saved to the request body.
 *
 * @param {Request} req Request from a user.
 * @param {Response} res Response to a user.
 * @param {Next} next The next middleware function to call.
 */
function authenticateTokenMiddleware(req, res, next) {
  logger.info(`accountHelpers.authenticateTokenMiddleware(req, res, next)`);
  const AUTH_HEADER = req.headers["authorization"];
  const TOKEN = AUTH_HEADER && AUTH_HEADER.split(" ")[1];

  if (!TOKEN) {
    logger.error(`Missing authentication token for ${req.originalUrl} ${req.method}.`);
    res.status(401).json({ message: "Missing authentication token." });
    return;
  }

  try {
    const { username: USERNAME, role: ROLE } = authToken.decode(TOKEN);
    req.body.username = USERNAME;
    req.body.role = ROLE;

    logger.info(
      `accountHelpers.authenticateTokenMiddleware: Username is "${USERNAME}", role is "${ROLE}".`
    );
    next();
  } catch (err) {
    logger.error(
      `accountHelpers.authenticateTokenMiddleware: ` +
        `Invalid authentication token for request for ${req.originalUrl} ${req.method}.`
    );
    res.status(401).json({ message: "Invalid authentication token." });
  }
}

// ==================================================

module.exports = {
  ROLES,
  sanitizeUsername,
  validatePassword,
  authenticateTokenMiddleware,
};

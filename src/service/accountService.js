const logger = require("../util/logger");
const accountDao = require("../daos/accountDao");
const RegisteringExistingUsernameError = require("../errors/RegisteringExistingUsernameError");

// ==================================================

/**
 * Adds a new user account into the database if the username does not already exist.
 *
 * @param {String} username The new unused username.
 * @param {String} password A password for the account associated with the username.
 * @returns An object with username and role.
 * @throws Error if username already exists.
 */
async function register(username, password) {
  logger.info(`accountService.register("${username}", "(password)")`);

  if (await accountDao.get(username)) {
    logger.error(`accountService.register: Username "${username}" already exists.`);
    throw new RegisteringExistingUsernameError(username);
  }

  const RETURNED_ACCOUNT = await accountDao.add(username, password, "employee");

  logger.info(
    `accountService.register: Username "${RETURNED_ACCOUNT.username}" successfully registered.`
  );
  return RETURNED_ACCOUNT;
}

// ==================================================

module.exports = {
  register,
};

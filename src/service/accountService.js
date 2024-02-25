const logger = require("../util/logger");
const bcrypt = require("bcrypt");

const accountDao = require("../daos/accountDao");
const authToken = require("../util/authToken");
const RegisteringExistingUsernameError = require("../errors/RegisteringExistingUsernameError");
const InvalidLoginError = require("../errors/InvalidLoginError");

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

/**
 * Logs in a user by checking if the username and password are correct, and then returns an authentication token.
 *
 * @param {String} username Username of the account to log in to.
 * @param {String} password Password associated with the username.
 * @returns Authentication token.
 * @throws Error invalid username or password.
 */
async function login(username, password) {
  logger.info(`AccountService.login("${username}", "(password)")`);

  let token;

  const account = await accountDao.get(username);
  if (account && (await bcrypt.compare(password, account.password))) {
    token = authToken.generate({ username: account.username, role: account.role });
  } else {
    logger.error(`AccountService.login: Incorrect username "${username}" or password.`);
    throw new InvalidLoginError(username);
  }

  logger.info(`AccountService.login: Username (${username}) successfully logged in.`);
  return token;
}

// ==================================================

module.exports = {
  register,
  login,
};

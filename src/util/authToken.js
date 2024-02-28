const jwt = require("jsonwebtoken");
const env = require("dotenv").config();

// --------------------------------------------------

const TOKEN_EXPIRATION_TIME = "1h";
const KEY = process.env.SECRET_KEY;

// ==================================================

/**
 * Generates an authentication token to be used when interacting with this system.
 *
 * @param {Object} payload An object containing username and role.
 * @returns A String representing the token.
 */
function generate(payload) {
  return jwt.sign(payload, KEY, { expiresIn: TOKEN_EXPIRATION_TIME });
}

/**
 * Returns the encrypted payload or throws an Error if the JSON web token is invalid.
 * @param {String} token The JSON web token containing username and role.
 * @returns Object with username and role.
 * @throws Error if JSON web token is invalid.
 */
function decode(token) {
  return jwt.verify(token, KEY);
}

// ==================================================

module.exports = {
  generate,
  decode,
};

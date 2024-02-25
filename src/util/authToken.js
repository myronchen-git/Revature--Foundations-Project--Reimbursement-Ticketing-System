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

// ==================================================

module.exports = {
  generate,
};

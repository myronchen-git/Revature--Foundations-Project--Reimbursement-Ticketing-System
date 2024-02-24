class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthorizationError";
    this.status = 403;
  }
}

module.exports = AuthorizationError;

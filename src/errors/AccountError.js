class AccountError extends Error {
  constructor(message) {
    super(message);
    this.name = "AccountError";
    this.status = 500;
  }
}

module.exports = AccountError;

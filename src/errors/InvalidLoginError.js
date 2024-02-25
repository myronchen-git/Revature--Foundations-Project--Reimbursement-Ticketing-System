class InvalidLoginError extends Error {
  constructor(username) {
    super(`Incorrect username or password for username input (${username}).`);
    this.name = "InvalidLoginError";
    this.status = 400;
  }
}

module.exports = InvalidLoginError;

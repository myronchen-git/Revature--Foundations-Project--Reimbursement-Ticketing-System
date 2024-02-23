class RegisteringExistingUsernameError extends Error {
  constructor(username) {
    super(`Username (${username}) already exists.`);
    this.name = "RegisteringExistingUsernameError";
    this.status = 400;
  }
}

module.exports = RegisteringExistingUsernameError;

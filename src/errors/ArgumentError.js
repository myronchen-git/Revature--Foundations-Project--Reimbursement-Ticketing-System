class ArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArgumentError";
    this.status = 400;
  }
}

module.exports = ArgumentError;

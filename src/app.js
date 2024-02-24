const logger = require("./util/logger");
const express = require("express");

const app = express();

// --------------------------------------------------

const PORT = 3000;

// ==================================================

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.url} ${req.method}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}.`);
  logger.info(`Server listening on http://localhost:${PORT}.`);
});

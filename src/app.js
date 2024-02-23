const logger = require("./util/logger");
const express = require("express");

const accountRouter = require("./controller/accountRouter");

const app = express();

// --------------------------------------------------

const PORT = 3000;

// ==================================================

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.url} ${req.method}`);
  next();
});

app.use("/accounts", accountRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}.`);
  logger.info(`Server listening on http://localhost:${PORT}.`);
});

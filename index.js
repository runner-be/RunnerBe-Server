const express = require("./config/express");
const { logger } = require("./config/winston");

const port = 3000;

process.on("SIGINT", async () => {
  await express().close();
  process.exit(0);
});

express().listen(port, () => {
  process.send("ready"); //ready 전달
});

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

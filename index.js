const express = require("./config/express");
const { logger } = require("./config/winston");

const port = 3000;
express().listen(port);
// let server = express().listen(port, () => {
//   process.send("ready"); //ready 전달
// });

// process.on("SIGINT", async () => {
//   await server.close();
//   process.exit(0);
// });

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

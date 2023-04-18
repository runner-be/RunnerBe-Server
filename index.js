const express = require("./config/express");
const { logger } = require("./config/winston");

const port = 3000;
const server = express().listen(port);

server.keepAliveTimeout = 61 * 1000;
server.headersTimeout = 65 * 1000;
// let server = express().listen(port, () => {
//   process.send("ready"); //ready 전달
// });

// process.on("SIGINT", async () => {
//   await server.close();
//   process.exit(0);
// });

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);

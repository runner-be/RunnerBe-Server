const mysql = require("mysql2/promise");
const { logger } = require("./winston");
const DBpassword = require("./secret.js").DBpassword;
const pool = mysql.createPool({
  host: "runnerbe.c0ewkxiorgu8.ap-northeast-2.rds.amazonaws.com",
  user: "park",
  port: "3306",
  password: DBpassword,
  database: "Runnerbe",
});

module.exports = {
  pool: pool,
};

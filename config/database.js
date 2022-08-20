const mysql = require("mysql2/promise");
const { logger } = require("./winston");
const DBpassword = require("./secret.js").DBpassword;
const DBhost = require("./secret.js").DBhost;
const DBadmin = require("./secret.js").DBadmin;
const DBschema = require("./secret.js").DBschema;
const pool = mysql.createPool({
  host: DBhost,
  user: DBadmin,
  port: "3306",
  password: DBpassword,
  database: DBschema,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  acquireTimeout: 20,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

module.exports = {
  pool: pool,
};

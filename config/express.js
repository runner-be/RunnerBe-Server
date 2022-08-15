const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
var cors = require("cors");
module.exports = function () {
  const app = express();

  app.use(compression());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(methodOverride());

  app.use(cors());

  require("../src/app/Route/userRoute")(app);
  require("../src/app/Route/postingRoute")(app);
  require("../src/app/Route/messageRoute")(app);
  require("../src/app/Route/runningRoute")(app);

  return app;
};

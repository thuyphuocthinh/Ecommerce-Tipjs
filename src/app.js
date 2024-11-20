// 106k + 10k
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const { checkOverload } = require("./helpers/check.connect.js");


const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db
require("./database/init.mongodb.level1.js");
// checkOverload();

// init router

// handle error

module.exports = app;

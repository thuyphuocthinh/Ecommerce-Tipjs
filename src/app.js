// 106k + 10k
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init db
require("./database/init.mongodb.level1.js");

// init router
app.use("/", require("./routes/index.route.js"));

// handle error

module.exports = app;

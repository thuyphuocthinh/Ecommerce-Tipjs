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

// test redis
app.use("/redis", () => {
  const productTest = require("./tests/product.test.js");
  require("./tests/inventory.test.js");
  setTimeout(() => {
    productTest.purchaseProduct("product_id_01", 10);
  }, 1000);
});


// init router
app.use("/", require("./routes/index.route.js"));

// handle error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;

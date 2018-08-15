const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

mongoose.connect(
  "mongodb://mendezdev:" +
    process.env.MONGO_ATLAS_PW +
    "@react-rest-shop-shard-00-00-2uaec.mongodb.net:27017,react-rest-shop-shard-00-01-2uaec.mongodb.net:27017,react-rest-shop-shard-00-02-2uaec.mongodb.net:27017/test?ssl=true&replicaSet=react-rest-shop-shard-0&authSource=admin&retryWrites=true",
  {
    useMongoClient: true
  }
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  // this example may be for some specific url
  // res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
  res.header("Access-Control-Allow-Origin", "*");
  // could be all, passing *
  // res.header('Access-Control-Allow-Headers', '*');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;

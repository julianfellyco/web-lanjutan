const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const mobileRoutes = require("./mobile/mobile");

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Pengaturan Cross-Origin (Modul Autentikasi dan Otorisasi)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    return res.status(200).json({});
  }
  next();
});

// Modul untuk logger yang berfungsi untuk pencatatan tiap request ke server
app.use(morgan("dev"));

//Router
app.use("/mobile", mobileRoutes);

//Opsional jika ingin menggunakan assets
app.use("/images", express.static(__dirname + "/assets/images"));

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
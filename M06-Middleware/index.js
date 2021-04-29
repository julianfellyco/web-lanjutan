var express = require("express");
var app = express();
var bodyParser = require("body-parser");

//https://github.com/expressjs/morgan
var logger = require("morgan");

//Module morgan merupakan modul untuk logger yang berfungsi untuk pencatatan tiap request ke server. Pencatatan ini atau istilahnya logging akan ditunjukkan di console terminal.
//Middleware package
app.use(logger("dev"));

//Middleware cek nim
const myMiddleware = (req, res, next) => {
  if (req.params.nim === "123") {
    console.log("Nim terverifikasi");
    next();
  } else {
    const err = {
      status: "error",
      data: {
        nim: req.params.nim,
      },
    };
    next(err);
  }
};

//route dengan method get
app.get("/api/:nim/:nama", myMiddleware, function (req, res) {
  res.statusCode = 200;
  //content-type pada expressjs
  res.setHeader("Content-Type", "text/plain");
  res.send(req.params);
});

//ErrorHandling
app.use((error, req, res, next) => {
  res.send(error);
});

app.listen(4000, function () {
  console.log("Server run");
});
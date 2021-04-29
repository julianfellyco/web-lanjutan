var express = require("express");
var server = express();

//https://github.com/expressjs/morgan
var logger = require("morgan");

//Module morgan merupakan modul untuk logger yang berfungsi untuk pencatatan tiap request ke server. Pencatatan ini atau istilahnya logging akan ditunjukkan di console terminal.
server.use(logger("dev"));

server.use(express.static(__dirname + "/publik"));

server.listen(4000, function () {
  console.log("Server run");
});
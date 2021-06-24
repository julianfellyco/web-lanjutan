var mysql = require("mysql");

//koneksi disesuaikan dengan pengaturan akses database lokal.
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_buku",
  dateStrings: "date",
});

module.exports = connection;
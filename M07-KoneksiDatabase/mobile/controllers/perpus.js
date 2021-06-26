const conn = require("./db");
const async = require("async");
exports.cariBuku = (req, res, next) => {
  var id = req.params.id;

  let query = "select * from tbl_buku where id = ?";

  conn.query(query, [id], (err, rows) => {
    if (err) {
      return res.status(400).send({
        message: "Failed when query data",
      });
    } else {
      if (rows.length < 1) {
        return res.status(404).send({
          message: "Not Found",
        });
      } else {
        return res.status(200).send({
          data: rows,
        });
      }
    }
  });
};

exports.tambahBuku = (req, res, next) => {
  let nama = req.body.nama; //body.nama; nama sesuai dengan body yang dikirim dari client
  let deskripsi = req.body.deskripsi;
  let harga = req.body.harga;

  var data = {
    nama: nama, //"nama" : nama, nama dalam kutip disesuaikan dengan nama field (kolom) dari tabel
    deskripsi: deskripsi,
    harga: wa,
  };
  let sql = "insert into tbl_buku set ?";

  conn.query(sql, data, (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400,
      });
    } else {
      return res.status(200).send({
        status: 200,
      });
    }
  });
};

exports.updateBuku = (req, res) => {
  var id = req.body.id;
  let nama = req.body.nama;
  let deskripsi = req.body.deskripsi;
  let harga = req.body.harga;

  var sql = "UPDATE tbl_buku SET nama=?, deskripsi= ?, harga= ? WHERE id= ?";

  // params dalam kurung siku "[]", diurutkan sesuai dengan tanda tanya pada query di atas.
  conn.query(sql, [nama, deskripsi, harga, id], (err, result) => {
    if (err) {
      return res.status(400).send({
        status: 400,
      });
    } else {
      return res.status(200).send({
        status: 200,
      });
    }
  });
};
const conn = require("./db");
const async = require("async");
const bcrypt = require("bcryptjs");

exports.get_customer = (req, res, next) => {
  conn.query(
    "select a.id, a.nama, a.email, a.no_hp, a.alamat, a.poin, b.nama as kota from tbl_customers a LEFT JOIN tbl_kota b ON a.id_kota = b.id order by a.nama asc",
    (err, rows) => {
      res.json(rows);
    }
  );
};

exports.get_kota = (req, res, next) => {
  conn.query(
    "select id, concat(type , ' ' , nama) as nama_kota from tbl_kota order by nama asc",
    (err, rows) => {
      res.send({ data: rows });
    }
  );
};

exports.simpan_customer = (req, res, next) => {
  var data = req.body;
  conn.query("INSERT INTO tbl_customers SET ?", data, (err, result) => {
    if (err) res.status(400).json(err);
    else res.json(result);
  });
};

exports.get_customer_single = (req, res, next) => {
  var id = req.params.id;
  conn.query(
    "SELECT customer.id, customer.nama as nama_customer, email, no_hp, alamat, poin, poin_pending, aktif, kode, id_kota, tgl_lahir, hari_besar, kota.nama as nama_kota FROM tbl_customers as customer LEFT JOIN tbl_kota as kota on id_kota = kota.id WHERE customer.id = " +
      id,
    (err, row) => {
      if (row.length > 0) res.json(row[0]);
      else res.json({});
    }
  );
};

exports.update_customer = (req, res, next) => {
  var data = req.body;
  conn.query(
    "update tbl_customers set ? where id = " + data.id,
    data,
    (err, result) => {
      if (err) res.status(400).json(err);
      else res.json(result);
    }
  );
};

exports.hapus_customer = (req, res, next) => {
  var id = req.params.id;
  conn.query("delete from tbl_customers where id = " + id, (err, result) => {
    if (err) res.status(400).json(err);
    else res.json(result);
  });
};

exports.cek_otp = (req, res, next) => {
  var id = req.params.id;
  var sql = "SELECT * from tbl_customers WHERE id = ?";

  conn.query(sql, [id], (err, result) => {
    console.log(result);
    if (result) {
      return res.status(200).send({ status: 200, data: result });
    } else {
      return res.status(400).send({ status: 400 });
    }
  });
};

//Router saat aktivasi token
exports.get_customer_by_kode = (req, res, next) => {
  var kode = req.params.kode;
  var sql =
    "SELECT customer.id, customer.nama as nama_customer, email, no_hp, alamat, poin, aktif, kode, id_kota, tgl_lahir, hari_besar, kota.nama as nama_kota FROM tbl_customers as customer LEFT JOIN tbl_kota as kota on id_kota = kota.id WHERE kode = ?";

  conn.query(sql, [kode], (err, row) => {
    if (row.length > 0) res.json(row[0]);
    else res.json({});
  });
};

exports.update_customer_by_kode = (req, res, next) => {
  var kode = req.params.kode;
  var nama = req.body.nama;
  var email = req.body.email;
  var no_hp = req.body.no_hp;
  var alamat = req.body.alamat;
  var id_kota = req.body.id_kota;
  var tgl_lahir = req.body.tgl_lahir;
  var hari_besar = req.body.hari_besar;

  var sql =
    "update tbl_customers set nama = ?, email = ?, no_hp = ?, alamat= ?, id_kota = ?, tgl_lahir = ?, hari_besar = ? WHERE kode = ?";

  conn.query(
    sql,
    [nama, email, no_hp, alamat, id_kota, tgl_lahir, hari_besar, kode],
    (err, row) => {
      if (err) res.status(400).json(err);
      else if (row.affectedRows == 0) {
        res.status(400).send({ status: 400 });
      } else if (row.affectedRows == 1) {
        res.status(200).send({ status: 200 });
      }
    }
  );
};

exports.update_customer_password = async (req, res, next) => {
  var kode = req.params.kode;
  var passwd = req.body.passwd;
  var sql =
    "update tbl_customers set tbl_customers.password = ? WHERE kode = ?";

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(passwd, salt, function (err, hash) {
      conn.query(sql, [hash, kode], (err, row) => {
        if (err) res.status(400).json(err);
        else if (row.affectedRows == 0) {
          res.status(400).send({ status: 400 });
        } else if (row.affectedRows == 1) {
          res.status(200).send({ status: 200 });
        }
      });
    });
  });
};

exports.updateFCMToken = (req, res) => {
  var id = req.body.id;
  var token = req.body.token;
  var topic = req.body.topic;

  var sql = "UPDATE tbl_customers SET token= ?, topic_fcm =? WHERE id= ?";

  conn.query(sql, [token, topic, id], (err, result) => {
    if (err) {
      return res.status(400).send({ status: 400 });
    } else {
      return res.status(200).send({ status: 200 });
    }
  });
};

exports.notifikasi = (req, res, next) => {
  var topic = req.body.topic;
  var sql =
    "select a.id, a.title, a.isi, a.tanggal from tbl_notifikasi a WHERE topic_fcm = ? ORDER BY tanggal DESC LIMIT 10";

  conn.query(sql, [topic], (err, rows) => {
    res.status(200).send({ data: rows });
  });
};

exports.notifikasiDetail = (req, res, next) => {
  var id = req.params.id;
  var sql =
    "select a.id, a.title, a.isi, a.tanggal from tbl_notifikasi a WHERE id = ? ";

  conn.query(sql, [id], (err, rows) => {
    res.status(200).send({ data: rows });
  });
};

exports.reqcashback = (req, res, next) => {
  var id_customer = req.params.id;
  var data = req.body;
  const gbr = req.files;
  if (!gbr) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }
  conn.query(
    "INSERT INTO tbl_request_cashback SET id_customer = ?, message = ?",
    [id_customer, data.message],
    (err, result) => {
      if (err) throw err;
      var id_request = result.insertId;

      gbr.forEach((element) => {
        conn.query(
          "INSERT INTO tbl_request_cashback_images SET id_request = ?, image = ?",
          [id_request, element.filename],
          (err, result) => {
            if (err) throw err;
          }
        );
      });
      if (err) res.status(400).json(err);
      else res.json(result);
    }
  );
};

exports.getreqcashback = (req, res, next) => {
  var id_customer = req.params.id;

  var query = "select * from tbl_request_cashback where id_customer = ?";

  conn.query(query, [id_customer], (err, rows) => {
    var items = [];
    async.eachSeries(
      rows,
      (item, cb) => {
        conn.query(
          "select id_request, image from tbl_request_cashback_images where id_request = ? limit 1",
          [item.id],
          (err, row) => {
            if (row.length > 0) {
              item.image = row[0].image;
              items.unshift(item);
              cb(null);
            }
          }
        );
      },
      (error) => {
        res.status(200).send({ status: 200, data: items });
        // res.json(items);
      }
    );
  });
};

exports.cekklaim = (req, res, next) => {
  var id_order = req.params.idorder;
  var id_customer = req.userData.userId;

  var query =
    "select status_klaim, status_invoice, total from tbl_order where id = ?";

  conn.query(query, [id_order], (err, rows) => {
    console.log(rows);
    if (err) {
      res.status(500);
      res.end();
    } else if (rows.length === 0) {
      res.status(401).send({ status: false });
      res.end();
    } else if (rows[0].status_klaim === 1) {
      res.status(200).send({
        status: false,
        statusinvoice: 0,
        total: 0,
        poin: 0,
      });
    } else {
      var q2 = "select poin, poin_pending from tbl_customers where id = ?";
      conn.query(q2, [id_customer], (err, result) => {
        console.log(result);
        if (err) {
          res.status(500);
          res.end();
        } else if (result.length === 0) {
          res.status(401).send({ status: false });
        } else {
          res.status(200).send({
            status: true,
            statusinvoice: rows[0].status_invoice,
            total: rows[0].total,
            poin: result[0].poin,
            poinpending: result[0].poin_pending,
          });
        }
      });
    }
  });
};

exports.klaim_cashback = (req, res, next) => {
  var id_order = req.params.idorder;
  var total = req.params.total;
  var poin = req.params.poin;
  var id_customer = req.userData.userId;

  console.log("point masuk" + poin);

  var cashback = (5 * parseInt(total)) / 100;
  var ttl = parseInt(cashback) + parseInt(poin);

  console.log("Total" + ttl);

  // flag 1 adalah point masuk
  var flag = 1;

  var query = "UPDATE tbl_customers SET poin = ? where id = ?";
  conn.query(query, [ttl, id_customer], (err, result) => {
    if (err) {
      res.status(500);
      res.end();
    } else {
      var query = "UPDATE tbl_order SET status_klaim = 1 where id = ?";
      conn.query(query, [id_order], (err, result) => {
        if (err) {
          res.status(500);
          res.end();
        } else {
          var query =
            "INSERT INTO tbl_history_poin (id_customer, id_order, poin, flag) VALUES (?,?,?,?)";

          conn.query(
            query,
            [id_customer, id_order, cashback, flag],
            (err, result) => {
              if (err) {
                res.status(500).send({ status: "error" });
                res.end();
              } else {
                return res.status(200).send({
                  status: true,
                });
              }
            }
          );
        }
      });
    }
  });
};

exports.klaim_cashback_pending = (req, res, next) => {
  var id_order = req.params.idorder;
  var total = req.params.total;
  var poin = req.params.poin;
  var id_customer = req.userData.userId;

  console.log("point masuk" + poin);

  var cashback = (5 * parseInt(total)) / 100;
  var ttl = parseInt(cashback) + parseInt(poin);

  console.log("Total" + ttl);

  // flag 1 adalah status pending
  var flag = 2;

  var query = "UPDATE tbl_customers SET poin_pending = ? where id = ?";
  conn.query(query, [ttl, id_customer], (err, result) => {
    if (err) {
      res.status(500);
      res.end();
    } else {
      var query = "UPDATE tbl_order SET status_klaim = 1 where id = ?";
      conn.query(query, [id_order], (err, result) => {
        if (err) {
          res.status(500);
          res.end();
        } else {
          var query =
            "INSERT INTO tbl_history_poin (id_customer, id_order, poin, flag) VALUES (?,?,?,?)";

          conn.query(
            query,
            [id_customer, id_order, cashback, flag],
            (err, result) => {
              if (err) {
                res.status(500).send({ status: "error" });
                res.end();
              } else {
                return res.status(200).send({
                  status: true,
                });
              }
            }
          );
        }
      });
    }
  });
};

exports.klaim_riwayat = (req, res, next) => {
  var id_customer = req.userData.userId;

  var query =
    "select * from tbl_history_poin where id_customer = ? ORDER BY date DESC";

  conn.query(query, [id_customer], (err, rows) => {
    var data = [];
    if (err) {
      res.status(500);
      res.end();
    } else if (rows.length === 0) {
      res.status(401).send({ status: false });
      res.end();
    } else {
      // res.status(200).send({ status: true, data: rows });
      async.eachSeries(
        rows,
        (item, cb) => {
          var query =
            "select id_order, nama_pasien from tbl_order where id = ?";
          conn.query(query, [item.id_order], (err, rows) => {
            if (rows.length > 0) {
              var info = {
                idorder: rows[0].id_order,
                namapasien: rows[0].nama_pasien,
              };
              item.info = info;
              data.push(item);
              cb();
            }
          });
        },
        (error) => {
          res.status(200).send({ status: true, data: data });
        }
      );
    }
  });
};

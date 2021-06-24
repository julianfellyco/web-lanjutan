const conn = require("./db");
const async = require("async");

function getDateNow() {
  var dt = new Date();
  return (
    dt.getFullYear() +
    "-" +
    (dt.getMonth() < 9 ? "0" : "") +
    (dt.getMonth() + 1) +
    "-" +
    (dt.getDate() < 10 ? "0" : "") +
    dt.getDate()
  );
}

function genNoOrder(value) {
  var str_alpha = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  var number = value.substr(value.length - 3, 3);
  var alpha = value.substring(0, value.length - 3);
  if (Number(number) == 999) {
    var tmp = 1;
    alpha_str = "";
    for (let i = alpha.length - 1; i >= 0; i--) {
      console.log(alpha);
      if (alpha[i] == "Z" && tmp == 1) {
        tmp = 1;
        alpha_str = "A" + alpha_str;
      } else if (tmp == 1) {
        var alpha_tmp = alpha[i];
        alpha_str = str_alpha[str_alpha.indexOf(alpha_tmp) + 1] + alpha_str;
        tmp = 0;
      } else {
        alpha_str = alpha[i] + alpha_str;
      }
    }
    if (tmp == 1) alpha_str = "A" + alpha_str;
    alpha = alpha_str;
    number = "001";
  } else {
    var nmb = Number(number) + 1;
    number = nmb + "";
    for (let i = 1; i <= 3 - nmb.toString().length; i++) {
      number = "0" + number;
    }
  }
  return alpha + number;
}

exports.generate_no_order = (req, res, next) => {
  conn.query(
    "select id_order from tbl_order order by id desc limit 1",
    (err, row) => {
      if (row.length > 0) {
        res.json({
          id: genNoOrder(row[0].id_order),
        });
      } else
        res.end({
          id: "A001",
        });
    }
  );
};

exports.get_customers = (req, res, next) => {
  conn.query("select * from tbl_customers order by nama asc", (err, rows) => {
    if (err) res.status(400).json(err);
    else res.json(rows);
  });
};

exports.get_products = (req, res, next) => {
  conn.query(
    "select a.id, a.nama, a.id_bahan, a.harga, a.durasi, b.nama as bahan, a.poin from tbl_product a, tbl_bahan b where b.id = a.id_bahan",
    (err, rows) => {
      res.send({
        data: rows,
      });
    }
  );
};

exports.get_product_single = (req, res, next) => {
  var id = req.params.id;
  conn.query(
    "select a.id, a.nama, a.harga, a.durasi, b.nama as bahan from tbl_product a, tbl_bahan b where b.id = a.id_bahan and a.id = " +
      id,
    (err, row) => {
      if (row.length > 0) res.json(row[0]);
      else res.json({});
    }
  );
};

exports.get_vouchers = (req, res, next) => {
  var dt = new Date();
  var tanggal =
    dt.getFullYear() +
    "-" +
    (dt.getMonth() < 9 ? "0" : "") +
    (dt.getMonth() + 1) +
    "-" +
    (dt.getDate() < 10 ? "0" : "") +
    dt.getDate();
  conn.query(
    "select * from tbl_voucher where tanggal >=" + tanggal,
    (err, rows) => {
      res.json(rows);
    }
  );
};

exports.simpan_order = (req, res, next) => {
  var order = req.body.order;
  order.tanggal = getDateNow();
  var detail_order = req.body.detail_order;
  var grand_total =
    order.total +
    order.ongkir +
    order.extra_charge -
    (order.diskon / 100) * order.total -
    order.poin;
  var sisa_poin = 0;
  if (grand_total < 0) {
    sisa_poin = grand_total * -1;
    order.poin = order.poin - sisa_poin;
  }
  conn.query("INSERT INTO tbl_preorder SET ?", order, (err, result) => {
    if (err) res.status(400).json(err);
    else {
      conn.query(
        "update tbl_customers set poin = " +
          sisa_poin +
          " where id = " +
          order.id_customer,
        (errr, rsltt) => {}
      );

      var id = result.insertId;
      var data_detail = [];
      for (let item of detail_order) {
        data_detail.push([
          id,
          item.id_product,
          item.warna,
          item.posisi,
          item.harga_product,
          item.poin,
          1,
          item.garansi,
        ]);
      }
      conn.query(
        "INSERT INTO tbl_preorder_detail (id_order, id_product, warna, posisi_gigi, harga, poin, status, garansi) VALUES ?",
        [data_detail],
        (er, rslt) => {
          console.log(er);
          res.json(result);
        }
      );
    }
  });
};

exports.simpan_preorder = (req, res, next) => {
  var order = req.body.order;
  order.tanggal = getDateNow();
  var detail_order = req.body.detail_order;
  var grand_total =
    order.total +
    order.ongkir +
    order.extra_charge -
    (order.diskon / 100) * order.total -
    order.poin;
  var sisa_poin = 0;
  if (grand_total < 0) {
    sisa_poin = grand_total * -1;
    order.poin = order.poin - sisa_poin;
  }
  conn.query("INSERT INTO tbl_preorder SET ?", order, (err, result) => {
    if (err) res.status(400).json(err);
    else {
      conn.query(
        "update tbl_customers set poin = " +
          sisa_poin +
          " where id = " +
          order.id_customer,
        (errr, rsltt) => {}
      );

      var id = result.insertId;
      var data_detail = [];
      for (let item of detail_order) {
        data_detail.push([
          id,
          item.id_product,
          item.warna,
          item.posisi,
          item.harga_product,
          item.poin,
          1,
          item.garansi,
        ]);
      }
      conn.query(
        "INSERT INTO tbl_order_detail (id_order, id_product, warna, posisi_gigi, harga, poin, status, garansi) VALUES ?",
        [data_detail],
        (er, rslt) => {
          console.log(er);
          res.json(result);
        }
      );
    }
  });
};

exports.list_order = (req, res, next) => {
  var id = req.params.id;
  var sql =
    "select a.id, a.id_order, a.nama_pasien, a.total, a.ongkir, a.extra_charge, a.poin, a.diskon, a.id_customer, a.status, a.status_invoice, a.tanggal, b.nama as customer from tbl_order a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE id_customer = ? and status != 2 ORDER BY a.id DESC LIMIT 200";

  conn.query(sql, [id], (err, rows) => {
    res.status(200).send({
      data: rows,
    });
  });
};

exports.get_view_order = (req, res, next) => {
  var id = req.params.id;

  conn.query(
    "select a.id, a.id_order, a.id_customer, a.nama_pasien, b.nama as customer, b.email as email_customer, b.no_hp as no_hp_customer, b.alamat as alamat_customer, b.poin as poin_customer, a.tanggal, a.tanggal_target_selesai, a.status, a.ongkir, a.extra_charge, a.poin, a.kode_voucher, a.diskon, a.status_invoice, a.tanggal_invoice from tbl_order a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE a.id = " +
      id,
    (err, rows) => {
      var order = rows.length > 0 ? rows[0] : {};
      var details = [];
      if (rows.length > 0) {
        conn.query(
          "select a.id, a.id_order, a.id_product, b.nama as nama_product, a.warna, a.posisi_gigi as posisi, a.harga as harga_product, a.poin, a.garansi, c.nama as bahan_product from tbl_order_detail a, tbl_product b, tbl_bahan c WHERE c.id = b.id_bahan AND b.id = a.id_product AND a.id_order = " +
            order.id +
            " order by a.posisi_gigi asc",
          (err, row) => {
            details = [];
            for (let item of row) {
              var selected = details.filter(
                (it) =>
                  it.warna == item.warna && it.id_product == item.id_product
              );
              if (selected.length > 0) {
                var index = details.indexOf(selected[0]);
                details[index].posisi.push({
                  pos: item.posisi,
                });
              } else {
                var data = {
                  id_product: item.id_product,
                  nama_product: item.nama_product,
                  bahan_product: item.bahan_product,
                  warna: item.warna,
                  posisi: [
                    {
                      pos: item.posisi,
                    },
                  ],
                };
                details.push(data);
              }
            }

            res.json({
              order: order,
              details: details,
            });
          }
        );
      } else {
        res.json({
          order: order,
          details: details,
        });
      }
    }
  );
};

exports.edit_order = (req, res, next) => {
  var order = req.body.order;
  var detail_order = req.body.detail_order;

  conn.query(
    "UPDATE tbl_order set nama_pasien = '" +
      order.nama_pasien +
      "', total = " +
      order.total +
      ", poin = " +
      order.poin +
      ", extra_charge = " +
      order.extra_charge +
      ", ongkir =" +
      order.ongkir +
      ", diskon=" +
      order.diskon +
      ", kode_voucher='" +
      order.kode_voucher +
      "' where id = " +
      order.id,
    (err, result) => {
      if (err) res.status(400).json(err);
      else {
        conn.query(
          "update tbl_customers set poin = " +
            order.poin_customer +
            " where id = " +
            order.id_customer,
          (errr, rsltt) => {}
        );
        var id = result.insertId;
        var data_detail = [];
        for (let item of detail_order) {
          data_detail.push([
            item.id,
            item.id_order,
            item.id_product,
            item.warna,
            item.posisi,
            item.harga_product,
            item.poin,
            1,
            item.garansi,
          ]);
        }
        conn.query(
          "REPLACE INTO tbl_order_detail (id, id_order, id_product, warna, posisi_gigi, harga, poin, status, garansi) VALUES ?",
          [data_detail],
          (er, rslt) => {
            console.log(er);
            res.json(result);
          }
        );
      }
    }
  );
};

exports.simpan_spk = (req, res, next) => {
  var spk = req.body.spk;
  var data_progress = req.body.data_progress;

  var query_spk = [[spk.id_order, spk.spv, 2]];
  for (let tekniker of spk.tekniker) {
    query_spk.push([spk.id_order, tekniker, 1]);
  }
  conn.query(
    "INSERT INTO tbl_spk (id_order, id_pegawai, privilege) VALUES ?",
    [query_spk],
    (err, result) => {
      async.eachSeries(
        data_progress,
        (progress, cb) => {
          async.eachSeries(
            progress.jobs,
            (item, cb2) => {
              var dt_progress = {
                id_order: spk.id_order,
                id_product: item.id_product,
                id_proses: item.id,
                status: 0,
              };
              conn.query(
                "INSERT INTO tbl_progress SET ?",
                dt_progress,
                (err2, rslt) => {
                  console.log("Error progress : " + err2);
                  cb2(null);
                }
              );
            },
            (error) => {
              cb(null);
            }
          );
        },
        (error) => {
          conn.query(
            "update tbl_order set tanggal_target_selesai = '" +
              spk.tanggal_target_selesai +
              "', status = 1 where id = " +
              spk.id_order,
            (err, rslt) => {
              if (err) res.status(400).json(err);
              else
                res.status(200).json({
                  message: "Success",
                });
            }
          );
        }
      );
    }
  );
};

//Invoice: Sudah selesai namun belum ditagih atau belum bayar.
exports.list_order_invoice = (req, res, next) => {
  var id = req.params.id;
  var sql =
    "select a.id, a.id_order, a.nama_pasien, a.total, a.ongkir, a.extra_charge, a.poin, a.diskon, a.id_customer, a.status, a.status_invoice, a.tanggal_invoice, a.tanggal, b.nama as customer from tbl_order a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE a.status = 2 AND (a.status_invoice= 0 or a.status_invoice = 1) and id_customer = ? ORDER BY a.id DESC";

  conn.query(sql, [id], (err, rows) => {
    res.status(200).send({
      data: rows,
    });
  });
};

//Riwayat order: Sudah selesai.
exports.invoice = (req, res, next) => {
  var id = req.params.id;
  var sql =
    "select a.id, a.id_order, a.nama_pasien, a.total, a.ongkir, a.extra_charge, a.poin, a.diskon, a.id_customer, a.status, a.status_invoice, a.tanggal_invoice, a.tanggal, b.nama as customer from tbl_order a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE a.status_invoice = 2 and id_customer = ? ORDER BY a.id DESC";

  conn.query(sql, [id], (err, rows) => {
    res.status(200).send({
      data: rows,
    });
  });
};

exports.update_invoice = (req, res, next) => {
  var order = req.body.order;
  var detail_order = req.body.detail_order;
  var tanggal_invoice =
    order.status_invoice == 1
      ? ", tanggal_invoice = '" + getDateNow() + "'"
      : "";
  var tanggal_bayar = order.tanggal_bayar
    ? ", tanggal_bayar = '" + order.tanggal_bayar + "'"
    : "";

  conn.query(
    "UPDATE tbl_order set nama_pasien = '" +
      order.nama_pasien +
      "', total = " +
      order.total +
      ", poin = " +
      order.poin +
      ", extra_charge = " +
      order.extra_charge +
      ", ongkir =" +
      order.ongkir +
      ", diskon=" +
      order.diskon +
      ", kode_voucher='" +
      order.kode_voucher +
      "', status_invoice = " +
      order.status_invoice +
      tanggal_invoice +
      tanggal_bayar +
      " where id = " +
      order.id,
    (err, result) => {
      if (err) res.status(400).json(err);
      else {
        var data_detail = [];
        var status = order.status_invoice == 2 ? 2 : 1;
        var earn_poin = 0;
        for (let item of detail_order) {
          earn_poin += item.poin;
          data_detail.push([
            item.id,
            item.id_order,
            item.id_product,
            item.warna,
            item.posisi,
            item.harga_product,
            item.poin,
            status,
            item.garansi,
          ]);
        }
        var poin_customer = order.poin_customer;
        if (status == 2) {
          if (order.poin > 0) {
            conn.query(
              "INSERT INTO tbl_history_poin SET ?",
              {
                id_customer: order.id_customer,
                id_order: order.id,
                poin: order.poin * -1,
              },
              (err, rslt) => {}
            );
          }

          poin_customer = poin_customer + earn_poin;
          conn.query(
            "INSERT INTO tbl_history_poin SET ?",
            {
              id_customer: order.id_customer,
              id_order: order.id,
              poin: earn_poin,
            },
            (err, rslt) => {}
          );
        }
        conn.query(
          "update tbl_customers set poin = " +
            poin_customer +
            " where id = " +
            order.id_customer,
          (errr, rsltt) => {}
        );

        conn.query(
          "REPLACE INTO tbl_order_detail (id, id_order, id_product, warna, posisi_gigi, harga, poin, status, garansi) VALUES ?",
          [data_detail],
          (er, rslt) => {
            console.log(er);
            res.json(result);
          }
        );
      }
    }
  );
};

exports.simpan_team = (req, res, next) => {
  var data = {
    id: req.body.id,
    id_order: req.body.id_order,
    id_pegawai: req.body.id_pegawai,
    privilege: req.body.privilege,
  };

  conn.query("REPLACE INTO tbl_spk SET ?", data, (err, result) => {
    if (err) res.status(400).json(err);
    else res.status(200).json(result);
  });
};

exports.hapus_team = (req, res, next) => {
  var id = req.params.id;
  conn.query("DELETE from tbl_spk WHERE id = " + id, (err, result) => {
    if (err) res.status(400).json(err);
    else res.status(200).json(result);
  });
};

exports.tambah_wishlist = (req, res, next) => {
  var id_customer = req.body.id_customer;
  var id_product = req.body.id_product;
  var warna = req.body.warna;
  var posisi = req.body.posisi;
  var harga_product = req.body.harga_product;

  var sql =
    "INSERT INTO tbl_wishlist_product (id_customer, id_product, warna, posisi, harga) VALUES (?,?,?,?,?)";
  console.log(sql);

  conn.query(
    sql,
    [id_customer, id_product, warna, posisi, harga_product],
    function (err, result) {
      if (err) {
        return res.status(400).send({
          status: 400,
        });
      } else {
        return res.status(200).send({
          status: 200,
        });
      }
    }
  );
};

exports.hapuswishlist = (req, res, next) => {
  var id = req.params.id;

  var sql = "DELETE FROM tbl_wishlist_product WHERE id = ?";
  console.log(sql);

  conn.query(sql, [id], function (err, result) {
    console.log(result);
    if (result.affectedRows > 0) {
      return res.status(200).send({
        status: 200,
      });
    } else if (result.affectedRows <= 0) {
      return res.status(404).send({
        status: 404,
      });
    } else {
      return res.status(400).send({
        status: 400,
      });
    }
  });
};

exports.lihatWislist = (req, res, next) => {
  var id = req.params.id;

  var sql =
    "SELECT TBLWISHLIST.id, TBLWISHLIST.id_customer, TBLWISHLIST.id_product, TBLWISHLIST.warna, TBLWISHLIST.posisi, TBLBAHAN.nama as nama_bahan, TBLWISHLIST.harga, TBLWISHLIST.tanggal_buat, TBLPRODUCT.nama FROM tbl_wishlist_product TBLWISHLIST LEFT JOIN tbl_product TBLPRODUCT ON TBLPRODUCT.id = TBLWISHLIST.id_product LEFT JOIN tbl_bahan TBLBAHAN on TBLPRODUCT.id_bahan = TBLBAHAN.id WHERE id_customer = ?";

  conn.query(sql, [id], function (err, result) {
    if (result) {
      return res.status(200).send({
        status: 200,
        data: result,
      });
    } else {
      return res.status(400).send({
        status: 400,
      });
    }
  });
};

exports.get_totalharga = (req, res, next) => {
  var id = req.params.id;

  var sql =
    "SELECT SUM(harga) as totalHarga FROM tbl_wishlist_product WHERE id_customer = ?";

  conn.query(sql, [id], function (err, result) {
    if (result) {
      return res.status(200).send({
        status: 200,
        data: result,
      });
    } else {
      return res.status(400).send({
        status: 400,
      });
    }
  });
};

exports.list_order_preorder = (req, res, next) => {
  var id = req.params.id;
  var sql =
    "select a.id, a.nama_pasien, a.total, a.ongkir, a.extra_charge, a.poin, a.diskon, a.id_customer, a.status, a.status_invoice, a.tanggal_invoice, a.tanggal, b.nama as customer from tbl_preorder a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE id_customer = ? ORDER BY date_time DESC";

  conn.query(sql, [id], (err, rows) => {
    res.status(200).send({
      data: rows,
    });
  });
};

exports.get_detail_order = (req, res, next) => {
  var id = req.params.id;
  conn.query(
    "select a.id, a.id_order, a.id_customer, a.nama_pasien, b.nama as customer, b.email, b.alamat, a.tanggal, a.tanggal_target_selesai, a.status from tbl_order a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE a.id = " +
      id,
    (err, rows) => {
      var item = rows.length > 0 ? rows[0] : {};
      if (rows.length > 0) {
        conn.query(
          "select a.id_product, b.nama as nama_product, a.warna, a.posisi_gigi, c.nama as namabahan from tbl_order_detail a LEFT JOIN tbl_product b ON a.id_product = b.id LEFT JOIN tbl_bahan c on b.id_bahan = c.id WHERE a.id_order = " +
            item.id,
          (err, row) => {
            item.details = row;
            res.json(item);
          }
        );
      } else {
        res.json(item);
      }
    }
  );
};

exports.get_detail_preorder = (req, res, next) => {
  var id = req.params.id;
  conn.query(
    "select a.id, a.id_customer, a.nama_pasien, b.nama as customer, b.email as email_customer, b.no_hp as no_hp_customer, b.alamat as alamat_customer, b.poin as poin_customer, a.tanggal, a.tanggal_target_selesai, a.status, a.ongkir, a.extra_charge, a.poin, a.kode_voucher, a.diskon, a.status_invoice, a.tanggal_invoice, a.instruksi from tbl_preorder a LEFT JOIN tbl_customers b ON a.id_customer = b.id WHERE a.id = " +
      id,
    (err, rows) => {
      var order = rows.length > 0 ? rows[0] : {};
      var details = [];
      if (rows.length > 0) {
        conn.query(
          "select a.id, a.id_product, b.nama as nama_product, a.warna, a.posisi_gigi as posisi, a.harga as harga_product, a.poin, a.garansi, c.nama as bahan_product from tbl_preorder_detail a, tbl_product b, tbl_bahan c WHERE c.id = b.id_bahan AND b.id = a.id_product AND a.id_order = " +
            order.id +
            " order by a.posisi_gigi asc",
          (err, row) => {
            details = [];
            for (let item of row) {
              var selected = details.filter(
                (it) =>
                  it.warna == item.warna && it.id_product == item.id_product
              );
              if (selected.length > 0) {
                var index = details.indexOf(selected[0]);
                details[index].posisi.push({
                  pos: item.posisi,
                });
              } else {
                var data = {
                  id_product: item.id_product,
                  nama_product: item.nama_product,
                  bahan_product: item.bahan_product,
                  warna: item.warna,
                  posisi: [
                    {
                      pos: item.posisi,
                    },
                  ],
                };
                details.push(data);
              }
            }

            res.json({
              order: order,
              details: details,
            });
          }
        );
      } else {
        res.json({
          order: order,
          details: details,
        });
      }
    }
  );
};

exports.get_totalorder = (req, res, next) => {
  var id = req.params.id;

  var sql =
    "SELECT COUNT(tbl_order.id_customer) as total from tbl_order WHERE (tbl_order.id_customer = ? and tbl_order.status_invoice != 2) and (tbl_order.id_customer = ? and tbl_order.status_invoice != 1)";

  conn.query(sql, [id, id], function (err, result) {
    if (result) {
      return res.status(200).send({
        data: result,
      });
    } else {
      return res.status(400).send({
        status: 400,
      });
    }
  });
};

exports.get_totalpreorder = (req, res, next) => {
  var id = req.params.id;

  var sql =
    "SELECT COUNT(tbl_preorder.id_customer) as total FROM tbl_preorder WHERE tbl_preorder.id_customer = ?";

  conn.query(sql, [id], function (err, result) {
    if (result) {
      return res.status(200).send({
        data: result,
      });
    } else {
      return res.status(400).send({
        status: 400,
      });
    }
  });
};

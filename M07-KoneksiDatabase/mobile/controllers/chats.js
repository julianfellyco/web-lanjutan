const async = require("async");
const conn = require("./db");

exports.get_chats = (req, res, next) => {
  var userId = req.body.userId;
  var channel = req.body.channel;
  var room = req.body.room;
  conn.query(
    "select * from tbl_chats where channel = " +
      channel +
      " and room ='" +
      room +
      "' order by id desc limit 20",
    (err, rows) => {
      var items = [];
      async.eachSeries(
        rows,
        (item, cb) => {
          conn.query(
            "select nama " +
              (item.tbl == "pegawai" ? ", privilege " : "") +
              " from tbl_" +
              item.tbl +
              " where id = " +
              item.pengirim,
            (err, row) => {
              if (row.length > 0) {
                item.nama = row.length > 0 ? row[0].nama : "";
                if (item.tbl == "customers") item.privilege = "Customer";
                else {
                  if (row[0].privilege == 1) item.privilege = "Admin";
                  else if (row[0].privilege == 2) item.privilege = "Tekniker";
                  else if (row[0].privilege == 3) item.privilege = "Supervisor";
                  else item.privilege = "";
                }
              } else {
                item.nama = "";
                item.privilege = "";
              }

              item.sent = item.pengirim == userId;
              item.date_number = new Date(item.date).getTime();

              items.unshift(item);
              cb(null);
            }
          );
        },
        (error) => {
          res.json(items);
        }
      );
    }
  );
};

exports.get_global_chat = (req, res, next) => {
  var start = parseInt(req.query.start);
  var limit = parseInt(req.query.limit);
  var id = parseInt(req.query.id);

  var query =
    "SELECT pengirim, tbl, room, channel, pesan, lampiran, date FROM `tbl_chats` WHERE (room = 'general' and pengirim = ? and tbl= 'customers') or (tbl = 'pegawai' and room = 'general' and channel = ?) ORDER BY tbl_chats.date DESC LIMIT ?,?";

  conn.query(query, [id, id, start, limit], (err, rows) => {
    var items = [];
    async.eachSeries(
      rows,
      (item, cb) => {
        conn.query(
          "select nama " +
            (item.tbl == "pegawai" ? ", privilege " : "") +
            " from tbl_" +
            item.tbl +
            " where id = " +
            item.pengirim,
          (err, row) => {
            if (row.length > 0) {
              item.nama = row.length > 0 ? row[0].nama : "";
              if (item.tbl == "customers") item.privilege = "Customer";
              else {
                if (row[0].privilege == 1) item.privilege = "Admin";
                else if (row[0].privilege == 2) item.privilege = "Tekniker";
                else if (row[0].privilege == 3) item.privilege = "Supervisor";
                else item.privilege = "";
              }
            } else {
              item.nama = "";
              item.privilege = "";
            }
            item.date_number = new Date(item.date).getTime();

            items.unshift(item);
            cb(null);
          }
        );
      },
      (error) => {
        res.status(200).send({ status: 200, data: items });
      }
    );
  });
};

exports.get_private_chat = (req, res, next) => {
  var start = parseInt(req.query.start);
  var limit = parseInt(req.query.limit);
  var channel = parseInt(req.query.channel);

  var query =
    "SELECT pengirim, tbl, room, channel, pesan, lampiran, date FROM `tbl_chats` WHERE room = 'order' and channel = ? ORDER BY tbl_chats.date DESC LIMIT ?,?";

  conn.query(query, [channel, start, limit], (err, rows) => {
    var items = [];
    async.eachSeries(
      rows,
      (item, cb) => {
        conn.query(
          "select token, nama " +
            (item.tbl == "pegawai" ? ", privilege " : "") +
            " from tbl_" +
            item.tbl +
            " where id = " +
            item.pengirim,
          (err, row) => {
            if (row.length > 0) {
              item.token = row.length > 0 ? row[0].token : "";
              item.nama = row.length > 0 ? row[0].nama : "";
              if (item.tbl == "customers") item.privilege = "Customer";
              else {
                if (row[0].privilege == 1) item.privilege = "Admin";
                else if (row[0].privilege == 2) item.privilege = "Tekniker";
                else if (row[0].privilege == 3) item.privilege = "Supervisor";
                else item.privilege = "";
              }
            } else {
              item.nama = "";
              item.privilege = "";
            }
            item.date_number = new Date(item.date).getTime();

            items.unshift(item);
            cb(null);
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

exports.get_list_chat = (req, res, next) => {
  var userid = parseInt(req.query.userid);

  conn.query(
    "select a.channel, a.room, b.id_order as nama, c.nama as customer, b.nama_pasien from tbl_chats a, tbl_order b, tbl_customers c where b.id = a.channel and c.id = b.id_customer and a.room = 'order' and a.pengirim = ? group by a.channel",
    [userid],
    (err, rows) => {
      var items = rows;

      async.eachSeries(
        items,
        (item, cb) => {
          conn.query(
            "select pesan, date from tbl_chats where channel = " +
              item.channel +
              " and room = 'order' order by id desc limit 1",
            (err, row) => {
              item.pesan = row[0].pesan;
              item.date = row[0].date;
              item.date_number = new Date(row[0].date).getTime();
              cb(null);
            }
          );
        },
        (error) => {
          res.status(200).send({ status: 200, data: items });
        }
      );
    }
  );
};

exports.get_tekniker_list_chat = (req, res, next) => {
  var userid = parseInt(req.query.userid);

  conn.query(
    "select chat.channel, chat.room, orders.status, orders.id_order as nama, customer.nama as customer, orders.nama_pasien from tbl_chats chat, tbl_order orders, tbl_customers customer, tbl_spk spk where orders.id = chat.channel and customer.id = orders.id_customer and chat.room = 'order' and spk.id_pegawai = ? AND orders.status != 2 group by chat.channel",
    [userid],
    (err, rows) => {
      var items = rows;

      async.eachSeries(
        items,
        (item, cb) => {
          conn.query(
            "select pesan, date from tbl_chats where channel = " +
              item.channel +
              " and room = 'order' order by id desc limit 1",
            (err, row) => {
              item.pesan = row[0].pesan;
              item.date = row[0].date;
              item.date_number = new Date(row[0].date).getTime();
              cb(null);
            }
          );
        },
        (error) => {
          res.status(200).send({ status: 200, data: items });
        }
      );
    }
  );
};

exports.chat_photo_global = (req, res, next) => {
  var start = parseInt(req.query.start);
  var limit = parseInt(req.query.limit);
  var id = parseInt(req.query.id);

  var query =
    "select a.lampiran, a.tbl, a.date, a.pengirim, a.pesan from tbl_chats a where (a.room = 'general' and a.pengirim = ? and a.tbl= 'customers' and a.lampiran IS NOT NULL and a.lampiran != 'null') or (a.tbl = 'pegawai' and a.room = 'general' and a.channel = ? and a.lampiran IS NOT NULL and a.lampiran != 'null') ORDER BY a.date DESC LIMIT ?,?";

  conn.query(query, [id, id, start, limit], (err, rows) => {
    var items = [];
    async.eachSeries(
      rows,
      (item, cb) => {
        conn.query(
          "select nama " +
            (item.tbl == "pegawai" ? ", privilege " : "") +
            " from tbl_" +
            item.tbl +
            " where id = " +
            item.pengirim,
          (err, row) => {
            if (row.length > 0) {
              item.nama = row.length > 0 ? row[0].nama : "";
              if (item.tbl == "customers") item.privilege = "Customer";
              else {
                if (row[0].privilege == 1) item.privilege = "Admin";
                else if (row[0].privilege == 2) item.privilege = "Tekniker";
                else if (row[0].privilege == 3) item.privilege = "Supervisor";
                else item.privilege = "";
              }
            } else {
              item.nama = "";
              item.privilege = "";
            }
            item.date_number = new Date(item.date).getTime();

            items.unshift(item);
            cb(null);
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

exports.chat_photo_private = (req, res, next) => {
  var start = parseInt(req.query.start);
  var limit = parseInt(req.query.limit);
  var channel = parseInt(req.query.channel);

  var query =
    "select a.lampiran,  a.tbl, a.date, a.pengirim,a.pesan, a.channel, a.room, c.nama as nama_customer from tbl_chats a, tbl_customers c where a.room = 'order' and a.channel = ? and (a.lampiran IS NOT NULL or a.lampiran != 'null') Group by lampiran ORDER BY a.date DESC LIMIT ?,?";

  conn.query(query, [channel, start, limit], (err, rows) => {
    var items = [];
    async.eachSeries(
      rows,
      (item, cb) => {
        conn.query(
          "select nama " +
            (item.tbl == "pegawai" ? ", privilege " : "") +
            " from tbl_" +
            item.tbl +
            " where id = " +
            item.pengirim,
          (err, row) => {
            if (row.length > 0) {
              item.nama = row.length > 0 ? row[0].nama : "";
              if (item.tbl == "customers") item.privilege = "Customer";
              else {
                if (row[0].privilege == 1) item.privilege = "Admin";
                else if (row[0].privilege == 2) item.privilege = "Tekniker";
                else if (row[0].privilege == 3) item.privilege = "Supervisor";
                else item.privilege = "";
              }
            } else {
              item.nama = "";
              item.privilege = "";
            }
            item.date_number = new Date(item.date).getTime();

            items.unshift(item);
            cb(null);
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

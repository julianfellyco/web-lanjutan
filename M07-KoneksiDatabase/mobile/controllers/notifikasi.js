var request = require("request");
const variables = require("../../variables");
const async = require("async");
const conn = require("./db");

exports.send_notifikasi = (req, res, next) => {
  var data = req.body;
  if (data.to) {
    sendMessageToUser(data.to, data.body, data.title);
  }
  res.status(200).send({
    status: "done"
  });
};

function sendMessageToUser(deviceId, message, title, idorder, id, idproduct, customer, pasien) {
  request({
    url: "https://fcm.googleapis.com/fcm/send",
    method: "POST",
    headers: {
      "Content-Type": " application/json",
      Authorization: variables.tokenfcm
    },
    body: JSON.stringify({
      notification: {
        title: title,
        body: message,
        content_available: true,
        priority: "high"
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "default",
        status: idorder,
        screen: [id, idorder, idproduct, customer, pasien],

      },
      to: deviceId
    })
  },
    function (error, response, body) {
      if (error) {
        console.error(error, response, body);
      } else if (response.statusCode >= 400) {
        console.error(
          "HTTP Error: " +
          response.statusCode +
          " - " +
          response.statusMessage +
          "\n" +
          body
        );
      } else {
        console.log("Done!");
      }
    }
  );
}

function saveNotif(title, body, userid, id, idorder, idproduct, customer, pasien) {
  var query =
    "INSERT INTO tbl_notifikasi(title, isi, user_id, tbl, status, id_order, id_order_string, id_product, customer, pasien) VALUES(?, ?, ?, ?, ?, ?,?,?,?,?)"
  var tbl = "pegawai"
  var status = 0
  conn.query(query, [title, body, userid, tbl, status, id, idorder, idproduct, customer, pasien], (err, rows) => {
    if (err) {
      console.log("tidak berhasil disimpan")
    } else {
      console.log("berhasil disimpan")

    }
  });
}

exports.notificationToPegawai = (req, res, next) => {
  var id = req.body.id;
  var idorder = req.body.idorder;
  var idproduct = req.body.idproduct;
  var privilege = req.body.privilege;
  var customer = req.body.customer;
  var pasien = req.body.pasien;
  var step = req.body.step;
  var title = "Order #" + idorder + " butuh aksi !";
  var body = "Segera update progress " + step + " pada Order #" + idorder + ".";
  var query = "SELECT tbl_pegawai.token, tbl_pegawai.id from tbl_spk LEFT JOIN tbl_pegawai on tbl_spk.id_pegawai = tbl_pegawai.id WHERE tbl_spk.id_order = ? and tbl_spk.privilege = ?";
  conn.query(query, [id, privilege], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      rows.forEach(element => {
        sendMessageToUser(element.token, body, title, idorder, id, idproduct, customer, pasien)
        saveNotif(title, body, element.id, id, idorder, idproduct, customer, pasien)
      })
      return res.status(200).send({
        status: 200,
        data: "Done"
      });
    }
  });
};


exports.notifToCustomer = (req, res, next) => {
  var channel = 13;
  var query =
    "SELECT tbl_customers.token from tbl_order LEFT JOIN tbl_customers on tbl_order.id_customer = tbl_customers.id WHERE tbl_order.id = ?";
  conn.query(query, [channel], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};

exports.notifToPegawai = (req, res, next) => {
  var channel = 13;
  var query =
    "SELECT tbl_pegawai.token from tbl_order LEFT JOIN tbl_spk on tbl_order.id = tbl_spk.id_order LEFT JOIN tbl_pegawai on tbl_spk.id_pegawai = tbl_pegawai.id WHERE tbl_order.id = ?";
  conn.query(query, [channel], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};

exports.notifikasiTargeted = (req, res, next) => {
  var title = req.body.title
  var isi = req.body.isi;
  var user_id = req.body.user_id
  var tbl = req.body.tbl
  var status = req.body.status

  var query =
    "INSERT INTO tbl_notifikasi(title, isi, user_id, tbl, status) VALUES(?, ?, ?, ?, ?)"
  conn.query(query, [title, isi, user_id, tbl, status], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};

exports.notifikasiToAllbyTopic = (req, res, next) => {
  var title = req.body.title
  var isi = req.body.isi
  var topic = req.body.topic

  var query =
    "INSERT INTO tbl_notifikasi(title, isi, topic) VALUES(?, ?, ?)"
  conn.query(query, [title, isi, topic], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};


exports.getAllNotificationByTopic = (req, res, next) => {
  var topic = req.params.topic;
  var query =
    "SELECT * FROM tbl_notifikasi WHERE tbl_notifikasi.topic = ? ORDER BY tbl_notifikasi.tanggal DESC";
  conn.query(query, [topic], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};

exports.getTotalNotificationTargeted = (req, res, next) => {
  var tbl = req.params.tbl;
  var id = req.params.id;

  var sql =
    "SELECT COUNT(tbl_notifikasi.id) as total FROM tbl_notifikasi WHERE tbl_notifikasi.tbl = ? AND tbl_notifikasi.user_id = ? AND tbl_notifikasi.status = 0";

  conn.query(sql, [tbl, id], function (err, result) {
    if (result) {
      return res.status(200).send({
        data: result
      });
    } else {
      return res.status(400).send({
        status: 400
      });
    }
  });
};

exports.getNotificationTargeted = (req, res, next) => {
  var tbl = req.params.tbl;
  var id = req.params.id;
  var query =
    "SELECT * FROM tbl_notifikasi WHERE tbl_notifikasi.tbl = ? AND tbl_notifikasi.user_id = ? ORDER BY tbl_notifikasi.tanggal DESC";
  conn.query(query, [tbl, id], (err, rows) => {
    if (err) {
      return res.status(400).send({
        status: 400
      });
    } else {
      return res.status(200).send({
        status: 200,
        data: rows
      });
    }
  });
};



exports.updateNotificationTargetedStatus = (req, res, next) => {
  var id = req.params.id;
  var sql = " UPDATE tbl_notifikasi SET tbl_notifikasi.status = 1 WHERE tbl_notifikasi.id = ?";

  conn.query(sql, [id], (err, rows) => {
    if (rows.changedRows <= 0) {
      res.status(404).send({
        status: 404
      });
    } else if (rows.changedRows > 0) {
      res.status(200).send({
        status: 200
      });
    } else {
      res.status(400).send({
        status: 400
      });
    }
  });
};

exports.deleteNotificationTargetedStatus = (req, res, next) => {
  var id = req.params.id;
  var sql = " DELETE from tbl_notifikasi WHERE tbl_notifikasi.id = ?";

  conn.query(sql, [id], (err, rows) => {
    if (rows.affectedRows <= 0) {
      res.status(404).send({
        status: 404
      });
    } else if (rows.affectedRows > 0) {
      res.status(200).send({
        status: 200
      });
    } else {
      res.status(400).send({
        status: 400
      });
    }
  });
};
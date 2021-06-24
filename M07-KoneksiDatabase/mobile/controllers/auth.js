const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const conn = require("./db");
const request = require("request");

exports.cek_token_valid = (req, res, next) => {
  var token = req.query.token;
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      res.status(401).send({ status: "400", data: "not valid" });
    } else {
      res.status(200).send({ status: "200", data: "valid" });
    }
  });
};

exports.do_login = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  conn.query(
    "select id, nama, email, password, privilege from tbl_pegawai where email = '" +
      email +
      "'",
    (err, rw) => {
      if (rw.length < 1) {
        return res
          .status(401)
          .json({ message: "Email & password anda tidak valid" });
      }
      var user = rw[0];
      bcrypt.compare(password, user.password, (error, result) => {
        if (error)
          return res
            .status(401)
            .json({ message: "Email & password anda tidak valid" });
        if (result) {
          const token = jwt.sign(
            {
              email: email,
              nama: user.nama,
              id: user.id,
              privilege: user.privilege,
            },
            process.env.JWT_KEY,
            {}
          );

          return res.status(200).json({
            nama: user.nama,
            email: user.email,
            id: user.id,
            privilege: user.privilege,
            token: token,
          });
        }
        return res
          .status(401)
          .json({ message: "Username & password anda tidak valid" });
      });
    }
  );
};

exports.do_customer_login = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  conn.query(
    "select id, nama, email, kode, password from tbl_customers where email = '" +
      email +
      "'",
    (err, rw) => {
      if (rw.length < 1) {
        return res
          .status(401)
          .json({ message: "Kode tidak valid atau sudah perna di aktivasi" });
      }
      var user = rw[0];
      const token = jwt.sign(
        {
          id: user.id,
          nama: user.nama,
          email: email,
          kode: user.kode,
        },
        process.env.JWT_KEY,
        {}
      );

      return res.status(200).json({
        nama: user.nama,
        email: user.email,
        id: user.id,
        kode: user.kode,
        token: token,
      });
    }
  );
};

exports.do_cek_otp = (req, res, next) => {
  var otp = req.body.otp;
  var query = "UPDATE tbl_customers set aktif= 1 WHERE kode = " + otp + " ";
  conn.query(query, (err, result) => {
    console.log(result);
    if (result.changedRows < 1) {
      return res
        .status(401)
        .json({ message: "Email & password anda tidak valid" });
    } else {
      return res.status(200).send({ status: 200 });
    }
  });
};

exports.do_login_customer = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  conn.query(
    "select id, nama, email, kode, password from tbl_customers where email = '" +
      email +
      "' ",
    (err, rw) => {
      if (rw.length < 1) {
        return res
          .status(401)
          .json({ message: "Email & password anda tidak valid" });
      }
      var user = rw[0];
      bcrypt.compare(password, user.password, (error, result) => {
        if (error)
          return res
            .status(401)
            .json({ message: "1Email & password anda tidak valid" });
        if (result) {
          console.log("Ada result");
          const token = jwt.sign(
            {
              email: email,
              userId: user.id,
              nama: user.nama,
              kode: user.kode,
            },
            process.env.JWT_KEY,
            {}
          );

          return res.status(200).json({
            email: user.email,
            userId: user.id,
            nama: user.nama,
            kode: user.kode,
            token: token,
          });
        }
        return res
          .status(401)
          .json({ message: "Username & password anda tidak valid" });
      });
    }
  );
};

exports.cekhp = (req, res, next) => {
  var hp = req.params.hp;
  conn.query(
    "select kode from tbl_customers where no_hp = '" + hp + "' ",
    (err, rw) => {
      if (rw.length < 1) {
        return res.status(401).json({ message: "No Hp anda tidak valid" });
      } else {
        return res.status(200).json({
          data: rw[0],
        });
      }
    }
  );
};
const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth");

//Tekniker auth
router.post("/login", authCtrl.do_login);
router.get("/login-cek", authCtrl.cek_token_valid);

router.post("/login-costumer", authCtrl.do_customer_login);
router.post("/otp", authCtrl.do_cek_otp);
router.post("/do-login-costumer", authCtrl.do_login_customer);

router.get("/cekhp/:hp", authCtrl.cekhp);

module.exports = router;

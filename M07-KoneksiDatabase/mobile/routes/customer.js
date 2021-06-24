const express = require("express");
const router = express.Router();
const customerCtrl = require("../controllers/customer");
const multer = require("multer");
const variables = require("../../variables");
const checkAuth = require("../middleware/check-auth");

//handleIMG
var storageFileImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, variables.PATH + "/assets/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

var uploadImages = multer({ storage: storageFileImage });

router.get("/all", customerCtrl.get_customer);
router.get("/kota", customerCtrl.get_kota);
router.post("/tambah", customerCtrl.simpan_customer);
router.post("/update", customerCtrl.update_customer);

router.get("/single/:id", customerCtrl.get_customer_single);
router.delete("/:id", customerCtrl.hapus_customer);
router.get("/cek-otp/:id", customerCtrl.cek_otp);

//Router saat aktivasi token
router.get("/data/:kode", customerCtrl.get_customer_by_kode);
router.put("/update/:kode", customerCtrl.update_customer_by_kode);
router.put("/update_password/:kode", customerCtrl.update_customer_password);

//FCM and notifikasi
router.put("/updatefcm/", customerCtrl.updateFCMToken);
router.post("/notifikasi/", customerCtrl.notifikasi);
router.get("/notifikasi/:id", customerCtrl.notifikasiDetail);

//RequestCashBack
router.post(
  "/reqcashback/:id",
  uploadImages.array("foto", 10),
  customerCtrl.reqcashback
);
router.get("/reqcashback/:id", customerCtrl.getreqcashback);

//ClaimCashBack
router.get("/cekklaim/:idorder", checkAuth, customerCtrl.cekklaim);
router.get(
  "/klaim-cashback/:idorder/:total/:poin",
  checkAuth,
  customerCtrl.klaim_cashback
);

router.get(
  "/klaim-cashback-pending/:idorder/:total/:poin",
  checkAuth,
  customerCtrl.klaim_cashback_pending
);
router.get("/klaim-riwayat", checkAuth, customerCtrl.klaim_riwayat);

module.exports = router;

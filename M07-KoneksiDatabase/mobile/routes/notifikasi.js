const express = require("express");
const router = express.Router();
const notifikasiCtrl = require("../controllers/notifikasi");

router.post("/send-notifikasi", notifikasiCtrl.send_notifikasi);

router.get("/notif-to-pegawai", notifikasiCtrl.notifToPegawai);
router.get("/notif-to-customer", notifikasiCtrl.notifToCustomer);

//Notifikasi targeted
router.post("/notifikasi-target/", notifikasiCtrl.notifikasiTargeted);
router.post("/notifikasi-bytopic/", notifikasiCtrl.notifikasiToAllbyTopic);

router.get("/notifikasi-total/:id/:tbl/", notifikasiCtrl.getTotalNotificationTargeted);
router.get("/notifikasi-target/:id/:tbl/", notifikasiCtrl.getNotificationTargeted);
router.get("/notifikasi-bytopic/:topic/", notifikasiCtrl.getAllNotificationByTopic);
router.put('/notifikasi-update-status/:id/', notifikasiCtrl.updateNotificationTargetedStatus)
router.delete('/notifikasi-delete-status/:id/', notifikasiCtrl.deleteNotificationTargetedStatus)

//Notification to pegawai on progress order
router.post("/notif-progress/", notifikasiCtrl.notificationToPegawai);
module.exports = router;
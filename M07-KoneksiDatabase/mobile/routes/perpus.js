const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const perpusCtrl = require("../controllers/perpus");

//Method
router.get("/buku/:id", checkAuth, teknikerCtrl.cariBuku);
router.post("/buku/", checkAuth, teknikerCtrl.tambahBuku);
router.put("/buku/", checkAuth, teknikerCtrl.updateBuku);
router.delete("/buku/:id", checkAuth, teknikerCtrl.hapusBuku);

module.exports = router;
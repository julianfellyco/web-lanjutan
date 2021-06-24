const express = require("express");
const router = express.Router();
const perpusRoutes = require("./routes/perpus");

// Router yang digunakan
router.use("/perpus", perpusRoutes);
module.exports = router;
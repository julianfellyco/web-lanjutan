const express = require("express");
const router = express.Router();
const ordersCtrl = require("../controllers/orders");

router.get("/customers", ordersCtrl.get_customers);
router.get("/gen-id-order", ordersCtrl.generate_no_order);
router.get("/products", ordersCtrl.get_products);
router.get("/product/:id", ordersCtrl.get_product_single);
router.get("/vouchers", ordersCtrl.get_vouchers);
router.post("/new", ordersCtrl.simpan_order);
router.post("/newpreorder", ordersCtrl.simpan_preorder);
router.get("/list/:id", ordersCtrl.list_order);
router.get("/view/:id", ordersCtrl.get_view_order);
router.post("/edit", ordersCtrl.edit_order);

router.post("/spk", ordersCtrl.simpan_spk);

router.get("/list-invoice/:id", ordersCtrl.list_order_invoice);
router.get("/invoice/:id", ordersCtrl.invoice);

router.post("/update-invoice", ordersCtrl.update_invoice);

router.post("/team", ordersCtrl.simpan_team);
router.delete("/team/:id", ordersCtrl.hapus_team);

router.post("/addwishlist", ordersCtrl.tambah_wishlist);
router.get("/hapuswishlist/:id", ordersCtrl.hapuswishlist);
router.get("/wishlist/:id", ordersCtrl.lihatWislist);

router.get("/list-preorder/:id", ordersCtrl.list_order_preorder);

//Cek Product Detail
router.get("/order/:id", ordersCtrl.get_detail_order);
router.get("/detail-preorder/:id", ordersCtrl.get_detail_preorder);
router.get("/totalhargawishlist/:id", ordersCtrl.get_totalharga);

//Rute TOtal Order Simbio Mpbile
router.get("/total-order/:id", ordersCtrl.get_totalorder);
router.get("/total-preorder/:id", ordersCtrl.get_totalpreorder);
module.exports = router;

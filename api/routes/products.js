const express = require("express");
const router = express.Router();
const multer = require("multer");

const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", ProductsController.products_get_all);
router.post("/", checkAuth, upload.single("productImage"), ProductsController.products_create_product);
router.get("/:productId", ProductsController.products_get_product);
router.patch("/:productId", checkAuth, ProductsController.products_patch_product);
router.delete("/:productId", checkAuth, ProductsController.products_delete_product);

module.exports = router;

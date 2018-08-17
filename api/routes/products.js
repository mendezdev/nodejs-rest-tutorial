const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");

const keys = require('../../config/keys');

cloudinary.config({
  cloud_name: keys.CLOUDINARY_CLOUD_NAME,
  api_key: keys.CLOUDINARY_API_KEY,
  api_secret: keys.CLOUDINARY_API_SECRET
});

const imageStorage = require('../../core/image-storage')(cloudinary);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});

const upload = multer({ storage: storage });
const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("_id name price image")
      .exec();
    const response = {
      count: products.length,
      products: products.map(prod => {
        const { _id, name, price, image } = prod;
        return {
          _id,
          name,
          price,
          image,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + prod._id
          }
        };
      })
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

router.post("/", upload.single("productImage"), async (req, res, next) => {
  const pathFile = req.file.path.replace("\\", "/");

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  try {
    const newProduct = await product.save();
    const { _id, name, price } = newProduct;

    const imgResult = await imageStorage.saveImage(pathFile);
    const removeResult = await imageStorage.removeTempImage(pathFile);

    const result = await Product.update(
      { _id: _id },
      {
        $set: {
          image: {
            url: imgResult.url,
            secure_url: imgResult.secure_url,
            public_id: imgResult.public_id  
          }
        }
      }
    ).exec();

    res.status(201).json({
      message: "Created product successfully",
      createdProduct: {
        _id,
        name,
        price,
        // imageUrl: result.image.url,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + _id
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

router.get("/:productId", async (req, res, next) => {
  const id = req.params.productId;

  try {
    const product = await Product.findById(id)
      .select("_id name price image")
      .exec();

    if (product) {
      const { _id, name, price } = product;
      const response = {
        product,
        request: {
          type: "GET",
          url: "http://localhost:3000/products"
        }
      };
      res.status(200).json(response);
    } else {
      res.status(404).json({
        message: "No valid entry found for provided ID"
      });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.patch("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  try {
    const result = await Product.update(
      { _id: id },
      { $set: updateOps }
    ).exec();
    res.status(200).json({
      message: "Product updated",
      request: {
        type: "GET",
        url: "http://localhost:3000/products/" + id
      }
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  try {
    const result = await Product.remove({ _id: id }).exec();
    res.status(200).json({
      message: "Product deleted",
      request: {
        type: "POST",
        url: "http://localhost:3000/products",
        body: { name: "String", price: "Number" }
      }
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

module.exports = router;

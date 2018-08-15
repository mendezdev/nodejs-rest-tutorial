const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().exec();
    console.log("products", products);
    res.status(200).json(products);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error
    });
  }
});

router.post("/", async (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  try {
    const newProduct = await product.save();
    res.status(201).json({
      message: "Handling POST request to /products",
      createdProduct: newProduct
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error
    });
  }
});

router.get("/:productId", async (req, res, next) => {
  const id = req.params.productId;

  try {
    const product = await Product.findById(id).exec();
    console.log(product);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        message: "No valid entry found for provided ID"
      });
    }
  } catch (error) {
    console.log("err", error);
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
    console.log("result", result);
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error });
  }
});

router.delete("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  try {
    const result = await Product.remove({ _id: id }).exec();
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error
    });
  }
});

module.exports = router;

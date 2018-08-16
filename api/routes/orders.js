const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/orders");
const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find()
      .select("product quantity _id")
      .populate('product', 'name')
      .exec();
    res.status(200).json({
      count: orders.length,
      orders: orders.map(o => {
        const { _id, product, quantity } = o;
        return {
          _id,
          product,
          quantity,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders/" + _id
          }
        };
      })
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

router.post("/", async (req, res, next) => {
  let existingProduct = null;

  try {
    existingProduct = await Product.findById(req.body.productId).exec();

    if (!existingProduct) {
      res.status(404).json({
        message: "Product not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred finding the Product",
      error
    });
  }
  try {
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId
    });
    const result = await order.save();
    const { _id, product, quantity } = result;
    res.status(201).json({
      message: "Order created",
      createdOrder: {
        _id,
        product,
        quantity
      },
      request: {
        type: "GET",
        url: "http://localhost:3000/orders/" + result._id
      }
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('product')
      .select(
        "_id product quantity"
      );

    if (!order) {
      res.status(404).json({
        message: 'Order not found'
      })
    }
    res.status(200).json({
      order,
      request: {
        type: "GET",
        url: "http://localhost:3000/orders"
      }
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
});

router.delete("/:orderId", async (req, res, next) => {
  try {
    const result = await Order.remove({
      _id: req.params.orderId
    });
    res.status(200).json({
      message: 'Order deleted',
      request: {
        type: 'POST',
        url: "http://localhost:3000/orders",
        body: {
          productId: 'ID',
          quantity: 'Number'
        }
      }
    })
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;

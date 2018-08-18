const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const keys = require("../../config/keys");
const User = require("../models/user");

const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(password, salt)
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
};

exports.users_get_all = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error
    });
  }
}

exports.users_signup = async (req, res, next) => {
  let passHashed = null;
  try {
    const existingUser = await User.find({ email: req.body.email }).exec();
    if (existingUser.length >= 1) {
      res.status(409).json({
        message: "Mail exists"
      });
    }
    passHashed = await hashPassword(req.body.password, 10);
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred trying to hash the password",
      error
    });
  }

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: passHashed
  });

  try {
    const userSaved = await user.save();
    res.status(201).json({
      message: "User created"
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred creating the User",
      error
    });
  }
}

exports.users_login = async (req, res, next) => {
  const message = "Auth failed";
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length < 1) {
      res.status(401).json({
        message
      });
    }

    const success = await bcrypt.compare(req.body.password, user[0].password);
    if (!success) {
      res.status(401).json({
        message
      });
    }

    const token = jwt.sign(
      {
        email: user[0].email,
        userId: user[0]._id
      },
      keys.JWT_KEY,
      {
        expiresIn: "1h"
      }
    );

    res.status(200).json({
      message: "Auth successful",
      token
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
}

exports.users_delete = async (req, res, next) => {
  try {
    const result = await User.remove({ _id: req.params.userId });
    res.status(200).json({
      message: "User deleted"
    });
  } catch (error) {
    res.status(500).json({
      error
    });
  }
}
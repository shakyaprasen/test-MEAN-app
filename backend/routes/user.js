const express = require("express");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User ({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          return res.status(201).json({ message: "User Created", data: result});
        })
        .catch(err => {
          return res.status(500).json({message: "Invalid Authentication Credentials!"});
        });
    });
});

router.post("/login", (req, res, next) => {
  let searchedUser;
  User.findOne({ email: req.body.email})
    .then((user) => {
      if(!user){
        return res.status(401).json({ message: "Email Authentication Failed" });
      }
      searchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {;
      if(!result) {
        return res.status(401).json({ message: "Password Authentication Failed" });
      }
      const token = jwt.sign(
        {
          email: searchedUser.email,
          userId: searchedUser._id
        },
        'longer_than_this_secret_key',
        { expiresIn: '1h' }
      );
      return res.status(200).json(
        {
          token: token,
          expiresIn: 3600,
          userId: searchedUser._id
        }
      );
    })
    .catch(err => {
      return res.status(401).json({ message: "Invalid Authentication Credentials", err:err });
    });
});

module.exports = router;

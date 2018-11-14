const express = require("express");

const checkAuth = require("../middleware/check-auth.js");
const ExtractFile = require("../middleware/file");
const PostController = require("../controller/posts");

const router = express.Router();

router.post("", checkAuth, ExtractFile, PostController.createPost);

router.put("/:id", checkAuth, ExtractFile, PostController.editPost);

router.delete("/:id", checkAuth, PostController.deletePost);

router.get("", PostController.getAllPosts);

router.get("/:id", PostController.getSinglePost);

module.exports = router;

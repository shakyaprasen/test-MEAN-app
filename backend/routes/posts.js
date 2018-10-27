const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth.js");

const router = express();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Mime Type");
    if(isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post('', checkAuth ,multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post Added Successfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

router.put('/:id', checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  console.log(post);
  Post.updateOne({_id: req.params.id}, post)
    .then((postData) => {
      res.status(200).json({
        message: 'Update Successful',
        updatedPost: post
      })
    })
});

router.delete('/:id', checkAuth, (req, res, next) =>{
  Post.deleteOne({ _id: req.params.id })
    .then((result) => {
      console.log(result);
    });
  res.status(200).json({
    message: 'Post Deleted'
  })
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();

  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.find()
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: 'Posts Fetched Successfully',
        posts: fetchedPosts,
        maxPosts: count
      })
    });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((postData) => {
    if(postData) {
      res.status(200).json({ message: 'Post fetched successfully', post: postData })
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  });
});


module.exports = router;

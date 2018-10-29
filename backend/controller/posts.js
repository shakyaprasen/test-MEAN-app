const Post = require("../models/post");

exports.getAllPosts = (req, res, next) => {
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
      return res.status(200).json({
        message: 'Posts Fetched Successfully',
        posts: fetchedPosts,
        maxPosts: count
      })
    })
    .catch(error => {
      return res.status(500).json({ message:"Fetcing Posts Failed!"});
    });
}

exports.getSinglePost = (req, res, next) => {
  Post.findById(req.params.id).then((postData) => {
    if(postData) {
      return res.status(200).json({ message: 'Post fetched successfully', post: postData })
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  })
  .catch(error => {
    return res.status(500).json({ message:"Fetcing Post Failed!"});
  });
}

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then((createdPost) => {
    return res.status(201).json({
      message: 'Post Added Successfully',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  })
  .catch(error => {
    return res.status(500).json({ message: "Creating a Post Failed!"});
  });
}

exports.editPost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({_id: req.params.id, creator: req.userData.userId }, post)
    .then((postData) => {
      if(postData.n > 0) {
        return res.status(200).json({
          message: 'Update Successful',
          updatedPost: post
        });
      } else {
        return res.status(401).json({
          message: 'Not authorized!'
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ message:"Couldn't update Post!"});
    });
}

exports.deletePost = (req, res, next) =>{
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if(result.n > 0) {
        return res.status(200).json({
          message: 'Deletion Successful'
        });
      } else {
        return res.status(401).json({
          message: 'Not authorized!'
        });
      }
    })
    .catch(error => {
      return res.status(500).json({ message:"Deleting Post Failed!"});
    });
}



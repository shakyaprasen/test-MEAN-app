const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

const app = express();

mongoose.connect("mongodb+srv://prasen:XUVShHKr88JDZO8x@cluster0-e0gph.mongodb.net/node-angular?retryWrites=true", { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database');
  })
  .catch(() => {
    console.log('Connection failed');
  });

app.use(bodyparser.json());
app.use(bodyparser.urlencoded( { extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader( "Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
//XUVShHKr88JDZO8x

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;

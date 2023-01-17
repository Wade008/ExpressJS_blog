
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: { type: mongoose.Types.ObjectId, ref: "User" }
});

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post }
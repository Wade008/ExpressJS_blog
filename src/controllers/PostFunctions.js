

const { Post } = require('../models/PostModel');


// Model.find({}) returns all documents in a collection.
async function getAllPosts() {
    return await Post.find({}).exec();
}


async function getPostById(postID) {
    return await Post.findById(postID).exec();
}

async function getPostsByAuthor(userID) {
    return await Post.find({ author: userID }).exec();
}


async function createPost(postDetails) {
    return await Post.create(postDetails);
}

async function updatePost(postDetails) {
    // Find user, update it, return the updated user data.
    return await Post.findByIdAndUpdate(postDetails.postID, postDetails.updatedData, { returnDocument: 'after' }).exec();

}


async function deletePost(postID) {
    return await Post.findByIdAndDelete(postID).exec();

}


module.exports = {
    getAllPosts, getPostById, getPostsByAuthor, createPost, updatePost, deletePost
}




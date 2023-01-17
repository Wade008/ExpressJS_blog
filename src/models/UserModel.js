const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    usernames: String,
    country: String,
    role: { type: mongoose.Types.ObjectId, ref: "Role" }

});

const User = mongoose.model("User", UserSchema);

module.exports = { User };







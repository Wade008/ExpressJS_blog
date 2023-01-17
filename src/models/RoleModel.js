const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    name: String,
    description: String
})

const Role = mongoose.model("Role", RoleSchema);

module.exports = { Role };


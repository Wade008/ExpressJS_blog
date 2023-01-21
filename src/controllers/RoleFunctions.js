const { Role } = require("../models/RoleModel");
const { User } = require("../models/UserModel");


//get all roles

async function getAllRoles() {
    return await Role.find({});

}

// async function get Users with a specific role

async function getUsersWithRole(roleName) {

    const roleID = await Role.findOne({name: roleName}).exec();

    const usersFound = await User.find({role: roleID}).exec();

    return usersFound;
}

// Export the functions for our routes to use.
module.exports = {
    getAllRoles,
    getUsersWithRole
}
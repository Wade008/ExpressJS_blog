

// Import Express
const express = require('express');
// Create an instance of an Express Router
const router = express.Router();

const { User } = require('../models/UserModel');

const {
    encryptString, decryptString, decryptObject, hashString, validateHashedData,
    generateJWT, generateUserJWT, verifyUserJWT,
    getAllUsers, getSpecificUser, createUser, updateUser, deleteUser
} = require('./UserFunctions');

const { uniqueEmailCheck, handleErrors } = require("../../src/middlewares/val_err_handling")

const jwt = require("jsonwebtoken");

const { Role } = require("../models/RoleModel");

// Make sure the JWT available in the headers is valid,
// and refresh it to keep the JWT usable for longer.
const verifyJwtHeader = async (request, response, next) => {
    let rawJwtHeader = request.headers.jwt;

    let jwtRefresh = await verifyUserJWT(rawJwtHeader);

    request.headers.jwt = jwtRefresh;

    next();
}

const verifyJwtRole = async (request, response, next) => {
    // Verify that the JWT is still valid.
    let userJwtVerified = jwt.verify(request.headers.jwt,process.env.JWT_SECRET, {complete: true});
    // Decrypt the encrypted payload.
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    // Parse the decrypted data into an object.
    let userData = JSON.parse(decryptedJwtPayload);
    
    // Because the JWT doesn't include role info, we must find the full user document first:
    let userDoc = await User.findById(userData.userID).exec();
    let userRoleName = await Role.findById(userDoc.role).exec();

    // Attach the role to the request for the backend to use.
    // Note that the user's role will never be available on the front-end
    // with this technique.
    // This means they can't just manipulate the JWT to access admin stuff.
    console.log("User role is: " + userRoleName.name);
    request.headers.userRole = userRoleName.name;

    next();
}

// The actual authorization middleware.
// Throw to the error-handling middleware
// if the user is not authorized.
// Different middleware can be made for
// different roles, just like this.
const onlyAllowAdmins = (request, response, next) => {
    if (request.headers.userRole == "admin"){
        next(); 
    } else {
        next(new Error("User not authorized."));
    }
}



// Sign-up a new user
router.post('/sign-up', uniqueEmailCheck, handleErrors, async (request, response) => {
    let userDetails = {
        email: request.body.email,
        password: request.body.password,
        username: request.body.username,
        country: request.body.country,
        roleID: request.body.roleID
    }
    let newUserDoc = await createUser(userDetails);

    response.json({
        user: newUserDoc
    });

});


// Sign-in an existing user
router.post('/sign-in', async (request, response) => {
    let targetUser = await User.findOne({ email: request.body.email }).exec();

    if (await validateHashedData(request.body.password, targetUser.password)) {
        let encryptedUserJwt = await generateUserJWT(
            {
                userID: targetUser.id,
                email: targetUser.email,
                password: targetUser.password
            }
        );

        response.json(encryptedUserJwt);

    } else {
        response.status(400).json({ message: "Invalid user details provided." });
    }
});

// Extend a user's JWT validity
router.post('/token-refresh', async (request, response) => {
    let oldToken = request.body.jwt;
    let refreshResult = await verifyUserJWT(oldToken).catch(error => { return { error: error.message } })
    response.json(refreshResult);
});

// Update a user
router.put('/:userID', async (request, response) => {
    let userDetails = {
        userID: request.params.userID,
        updatedData: request.body.newUserData
    };

    response.json(await updateUser(userDetails));
});

// Delete a user
router.delete('/:userID', async (request, response) => {
    response.json(await deleteUser(request.params.userID));
});

// List all users
router.get('/', verifyJwtHeader, verifyJwtRole, onlyAllowAdmins, async (request, response) => {
    let allUsers = await getAllUsers();

    response.json({
        userCount: allUsers.length,
        usersArray: allUsers
    });
});

// Show a specific user
router.get('/:userID',  async (request, response) => {
    response.json(await getSpecificUser(request.params.userID));
});

// Export the router so that other files can use it:
module.exports = router;
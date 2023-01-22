
const { User } = require("../models/UserModel");

const dotenv = require("dotenv").config();


// ----- Encryption & decryption functionality


const crypto = require("crypto");
const encAlgorithm = "aes-256-cbc";
const encPrivateKey = crypto.scryptSync(process.env.ENC_KEY, "SpecialSalt", 32);
const encIV = crypto.scryptSync(process.env.ENC_IV, "SpecialSalt", 16);
const cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
const decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);

// Convert a given string into an encrypted string.
function encryptString(data) {
    cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// Turn the encrypted data back into a plaintext string.
function decryptString(data) {
    decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
    return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
}

// Assumes an encrypted string is a JSON object.
// Decrypts that string and turns it into a regular JavaScript object.
function decryptObject(data) {
    return JSON.parse(decryptString(data));
}

// --------------------------------------
// ----- Hashing & Salting functionality

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashString(stringToHash) {
    let saltToAdd = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(stringToHash, saltToAdd);
}

async function validateHashedData(providedUnhashedData, storedHashedData) {
    return await bcrypt.compare(providedUnhashedData, storedHashedData);
}


// --------------------------------------
// ----- JWT functionality

const jwt = require('jsonwebtoken');

function generateJWT(payloadObj) {
    return jwt.sign(payloadObj, process.env.JWT_SECRET, { expiresIn: "7d" });
}


async function generateUserJWT(userDetails) {
    // Encrypt the payload so that it's not plaintext when viewed outside of this app.
    let encryptedUserData = encryptString(JSON.stringify(userDetails));
    // The expiresIn option only works if the payload is an object, not a string.
    return generateJWT({ data: encryptedUserData });
}


async function verifyUserJWT(userJWT) {
    // Verify that the JWT is still valid.
    let userJwtVerified = jwt.verify(userJWT, process.env.JWT_SECRET, { complete: true });
    // Decrypt the encrypted payload.
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    // Parse the decrypted data into an object.
    let userData = JSON.parse(decryptedJwtPayload);
    // Find the user mentioned in the JWT.
    let targetUser = await User.findById(userData.userID).exec();
    // If the JWT data matches the stored data...
    if (targetUser.password == userData.password && targetUser.email == userData.email) {
        // ...User details are valid, make a fresh JWT to extend their token's valid time
        return generateJWT({ data: userJwtVerified.payload.data });
    } else {
        // Otherwise, user details are invalid and they don't get a new token.
        // When a frontend receives this error, it should redirect to a sign-in page.
        throw new Error({ message: "Invalid user token." });
    }
}


// --------------------------------------
// ----- MongoDB/MongooseJS functionality

async function getAllUsers() {
    // Returns an array of raw MongoDB database documents.
    return await User.find({});

}


async function getSpecificUser(userID) {
    // Returns the raw MongoDB database document.
    return await User.findById(userID);
}


async function createUser(userDetails) {


    // Hash the password
    userDetails.hashedPassword = await hashString(userDetails.password);

    // Create new user based on userDetails data
    let newUser = new User(
        {
            email: userDetails.email,
            password: userDetails.hashedPassword,
            username: userDetails.username,
            country: userDetails.country,
            role: userDetails.roleID
        }
    )

    // And save it to DB
    return await newUser.save();
}


async function updateUser(userDetails) {
    // Find user, update it, return the updated user data.
    return await User.findByIdAndUpdate(userDetails.userID, userDetails.updatedData, { returnDocument: 'after' }).exec();

}


async function deleteUser(userID) {
    return await User.findByIdAndDelete(userID).exec();
}

// --------------------------------------
// ----- Exports

module.exports = {
    encryptString, decryptString, decryptObject, hashString, validateHashedData, 
    generateJWT, generateUserJWT, verifyUserJWT, 
    getAllUsers, getSpecificUser, createUser, updateUser, deleteUser
}

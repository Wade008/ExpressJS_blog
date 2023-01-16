
const mongoose = require("mongoose");

async function databaseConnector(dbURL) {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbURL);
}

async function databaseDisconnector() {
    await mongoose.connection.close();
}

module.exports = {
    databaseConnector,
    databaseDisconnector
}
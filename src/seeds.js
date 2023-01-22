const mongoose = require('mongoose');
const { databaseConnector } = require('./database');

// Import the models that we'll seed, so that 
// we can do things like Role.insertMany()
const { Role } = require('./models/RoleModel');
const { User } = require('./models/UserModel');
const { Post } = require('./models/PostModel');

// Make sure this file can read environment variables.
const dotenv = require('dotenv');
dotenv.config();

const { hashString } = require('./controllers/UserFunctions');

// Create some raw data for the Roles collection,
// obeying the needed fields from the Role schema.
const roles = [
    {
        name: "regular",
        description: "A regular user can view, create and read data. They can edit and delete only their own data."
    },
    {
        name: "admin",
        description: "An admin user has full access and permissions to do anything and everything within this API."
    },
    {
        name: "banned",
        description: "A banned user can read data, but cannot do anything else."
    }
]

// To fill in after creating user data encryption functionality.
const users = [

    {
        username: "seedUser1",
        email: "seed1@email.com",
        password: null,
        country: "Australia",
        role: null
    },
    {
        username: "seedUser2",
        email: "seed2@email.com",
        password: null,
        country: "TheBestOne",
        role: null
    }
];

// To fill in after creating users successfully.
const posts = [
    {
        title: "Some seeded post",
        description: "Very cool. Best post. Huge post. No other posts like it!",
        author: null
    },
    {
        title: "Some other seeded post",
        description: "Very cool. Best post. Huge post. One other post like it!",
        author: null
    },
    {
        title: "Another seeded post",
        description: "Very cool. Best post. Huge post. Two other posts like it!",
        author: null
    }
];



// Connect to the database.
var databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        databaseURL = process.env.DEV_DATABASE_URL + "-test";
        break;
    case "development":
        databaseURL = process.env.DEV_DATABASE_URL;
        break;
    case "production":
        databaseURL = process.env.DATABASE_URL;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}


// This functionality is a big promise-then chain.
// This is because it requires some async functionality,
// and that doesn't work without being wrapped in a function.
// Since .then(callback) lets us create functions as callbacks,
// we can just do stuff in a nice .then chain.
databaseConnector(databaseURL).then(() => {
    console.log("Database connected successfully!");
}).catch(error => {
    console.log(`
    Some error occurred connecting to the database! It was: 
    ${error}
    `);
}).then(async () => {
    if (process.env.WIPE == "true") {
        // Get the names of all collections in the DB.
        const collections = await mongoose.connection.db.listCollections().toArray();

        // Empty the data and collections from the DB so that they no longer exist.
        collections.map((collection) => collection.name)
            .forEach(async (collectionName) => {
                mongoose.connection.db.dropCollection(collectionName);
            });
        console.log("Old DB data deleted.");
    }
}).then(async () => {
    // Add new data into the database.
    // Store the new documents as a variable for use later.
    let rolesCreated = await Role.insertMany(roles);

    // Iterate through the users array, using for-of to enable async/await.
    for (const user of users) {
        // Set the password of the user.
        user.password = await hashString("SomeRandomPassword1");
        // Pick a random role from the roles created and set that for the user.
        user.role = rolesCreated[Math.floor(Math.random() * rolesCreated.length)].id;
    }
    // Save the users to the database.
    let usersCreated = await User.insertMany(users);

    // Same again for posts;
    // pick a random user and assign that user as the author of a post.
    for (const post of posts) {
        post.author = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
    }
    // Then save the posts to the database.
    let postsCreated = await Post.insertMany(posts);

    // Log modified to list all data created.
    console.log("New DB data created.\n" + JSON.stringify({ roles: rolesCreated, users: usersCreated, posts: postsCreated }, null, 4));

}).then(() => {
    // Disconnect from the database.
    mongoose.connection.close();
    console.log("DB seed connection closed.")
});
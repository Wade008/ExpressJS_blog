
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

const helmet = require("helmet");
app.use(helmet());

app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"]
    }
}));

const cors = require('cors');
var corsOptions = {
    origin: ["http://localhost:5000", "https://deployedApp.com"], //update these for the front-end react site
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));


// Configure some API-friendly request data formatting.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        message: "Testing, testing"
    })
})


// Keep this route at the end of this file, only before the module.exports!
// A 404 route should only trigger if no preceding routes or middleware was run. 
// So, put this below where any other routes are placed within this file.
app.get('*', (request, response) => {
    response.status(404).json({
        message: "No route with that path found!",
        attemptedPath: request.path
    });
});

// Export everything needed to run the server.
module.exports = {
    HOST,
    PORT,
    app
}


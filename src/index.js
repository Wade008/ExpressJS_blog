
//import all config items from the server file

const { app, PORT, HOST } = require("./server");

//run the server

app.listen(PORT, HOST, () => {
    console.log(`ExpressJS Blog API running on port: ${PORT}`)
})


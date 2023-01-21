const { response } = require("express");
const express = require("express");

const router = express.Router();

const { getUsersWithRole, getAllRoles } = require("./RoleFunctions")

//show all role

router.get("/", async(req,res) =>{
    const responseData = {};

    responseData = await getAllRoles();

    response.json({
        data: responseData
    })
})

// Show all users with a matching role
// Uses route params, notice the request.params too!
router.get('/:roleName', async (request, response) => {
    let responseData = {};

    responseData = await getUsersWithRole(request.params.roleName);

    response.json({
        data: responseData
    });
});


// Export the router so that other files can use it:
module.exports = router;


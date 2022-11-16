const {Router}  = require('express');
const route = Router();
const userController = require('../../Controller/userController/userController')


// Signup route
route.post('/booing/signup', userController.signup)
//Code Verification
route.post('/booing/signup/codeVerification', userController.codeVerification)
// Singin route
route.post('/booing/signin', userController.signin)
route.get('/', (req,res) => {
    res.json({
        'hello': 'yo yo '
    })
})



module.exports = route
const { Router } = require('express');
const route = Router();
const userController = require('../../Controller/userController/userController')
const Authentification = require('../../Middleware/Authentification')

// Signup route
route.post('/booing/signup', userController.signup)
//Code Verification
route.post('/booing/signup/codeVerification', userController.codeVerification)
// Singin route
route.post('/booing/signin', userController.signin)
// Update profile
route.post('/booing/logged-in-user/updateProfile', Authentification, userController.updateProfile)
// Update password
route.post('/booing/logged-in-user/updatePassword', Authentification, userController.updatePassword)

i=0
route.get('/', (req, res) => {

    res.setHeader('Content-Type', 'text/html');
    setInterval(() => {
        res.write("A")
    }, 100)
   
})



module.exports = route
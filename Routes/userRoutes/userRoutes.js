const { Router } = require('express');
const route = Router();
const userController = require('../../Controller/userController/userController')
const Authentification = require('../../Middleware/Authentification')

const fs = require("fs");
const path = require('path');

// Signup route
route.post('/booing/signup', userController.signup)
// Social Media Signup route
route.post('/booing/socialMediaSignup', userController.socialMediaSignup)
//Code Verification
route.post('/booing/signup/codeVerification', userController.codeVerification)
// Singin route
route.post('/booing/signin', userController.signin)
// Update profile
route.post('/booing/logged-in-user/updateProfile',
//  Authentification,
  userController.updateProfile)
// Update password
route.post('/booing/logged-in-user/updatePassword',
//  Authentification,
 userController.updatePassword)
// Forgot password
route.post('/booing/forgotPassword', userController.forgotPassword)
route.post("/booing/logged-in-user/getMembership/:user_id", userController.getMembership);
route.post("/booing/logged-in-user/purchaseMembership", userController.purchaseMembership);

route.get('/', async (req, res) => {
   res.send("hello")
})



module.exports = route
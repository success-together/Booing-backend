const {Router}  = require('express');
const route = Router();
const uploadController = require("../../Controller/uploadFileController/uploadController")
const Authentification = require('../../Middleware/Authentification')
const upload = require("../../Middleware/UploadFile")
// Update password
route.post('/booing/logged-in-user/uploadFile', Authentification, upload.array("file", 10), uploadController.upload)

module.exports = route
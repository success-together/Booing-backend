const { Router } = require("express");
const route = Router();
const downloadController = require('../../Controller/downloadController/downloadController')

route.get("/booing/logged-in-user/downloadFile", downloadController.download)

module.exports = route;
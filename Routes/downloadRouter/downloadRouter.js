const { Router } = require("express");
const {
  checkForDownloads, checkForUploads,
} = require("../../Controller/checkController/checkController");
const route = Router();
const downloadController = require("../../Controller/downloadController/downloadController");

route.get("/booing/logged-in-user/downloadFile/:id", downloadController.download);
route.post("/booing/logged-in-user/checkForDownloads", checkForDownloads);
route.post("/booing/logged-in-user/checkForUploads", checkForUploads);


module.exports = route;

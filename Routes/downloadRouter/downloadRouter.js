const { Router } = require("express");
const {
  checkForDownloads, checkForUploads, uploadFragments
} = require("../../Controller/fragmentsController/fragmentsController");
const route = Router();
const downloadController = require("../../Controller/downloadController/downloadController");


route.get("/booing/logged-in-user/downloadFile/:user_id/:type", downloadController.download);

route.post("/booing/logged-in-user/checkForDownloads", checkForDownloads);
route.post("/booing/logged-in-user/checkForUploads", checkForUploads);
route.post("/booing/logged-in-user/uploadFragments", uploadFragments);


module.exports = route;

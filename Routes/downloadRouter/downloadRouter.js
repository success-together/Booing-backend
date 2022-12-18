const { Router } = require("express");
const {
  checkForDownloads,
  checkForUploads,
  uploadFragments,
  deleteFile,
  getDeletedFiles,
  deleteFiles,
} = require("../../Controller/fragmentsController/fragmentsController");
const route = Router();
const downloadController = require("../../Controller/downloadController/downloadController");

route.get(
  "/booing/logged-in-user/downloadFile/:user_id/:type",
  downloadController.download
);

route.post("/booing/logged-in-user/checkForDownloads", checkForDownloads);
route.post("/booing/logged-in-user/checkForUploads", checkForUploads);
route.post("/booing/logged-in-user/uploadFragments", uploadFragments);
route.post("/booing/logged-in-user/deleteFiles", deleteFiles);
// ! to test
route.get('/booing/logged-in-user/getDeletedFiles/:user_id', getDeletedFiles);

module.exports = route;

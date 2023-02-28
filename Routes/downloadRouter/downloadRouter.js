const { Router } = require("express");
const {
  checkForDownloads,
  checkForUploads,
  uploadFragments,
  deleteFile,
  getDeletedFiles,
  getMyFiles,
  deleteFiles,
  getUsedStorage,
  deleteFilesPermanently,
  restoreFiles,
} = require("../../Controller/fragmentsController/fragmentsController");
const route = Router();
const downloadController = require("../../Controller/downloadController/downloadController");

route.get(
  "/booing/logged-in-user/downloadFile/:user_id/:type",
  downloadController.download
);

route.post("/booing/logged-in-user/downloadByOffer/:filename", downloadController.downloadByOffer);
// route.post("/booing/logged-in-user/checkForDownloads", checkForDownloads);
// route.post("/booing/logged-in-user/checkForUploads", checkForUploads);
// route.post("/booing/logged-in-user/uploadFragments", uploadFragments);
route.post("/booing/logged-in-user/deleteFiles", deleteFiles);
route.post(
  "/booing/logged-in-user/deleteFilesPermanently",
  deleteFilesPermanently
);
route.post("/booing/logged-in-user/restoreFiles", restoreFiles);
route.post("/booing/logged-in-user/getMyFiles", getMyFiles);
// // ! to test
route.get("/booing/logged-in-user/getDeletedFiles/:user_id", getDeletedFiles);
route.get("/booing/logged-in-user/getUsedSpace/:user_id", getUsedStorage);

module.exports = route;

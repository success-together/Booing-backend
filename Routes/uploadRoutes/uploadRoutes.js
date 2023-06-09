const { Router } = require("express");
const route = Router();
const uploadController = require("../../Controller/uploadFileController/uploadController");
const upload = require("../../Middleware/UploadFile");
const fragmentation = require("../../Middleware/Fragmentation");
// Update password
route.post(
  "/booing/logged-in-user/uploadFile/:user_id",
  // Authentification
  upload.array("file", 10),
  uploadController.upload,
  fragmentation
);

module.exports = route;

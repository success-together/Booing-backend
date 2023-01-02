const express = require("express");
const router = express.Router();

const directoriesController = require("../../Controller/DirectoryController/directoryController");

router.post(
  "/booing/logged-in-user/directory",
  directoriesController.createDirectory
);

router.post(
  "/booing/logged-in-user/directories",
  directoriesController.getAllDirectories
);

router.post(
  "/booing/logged-in-user/directories/:id",
  directoriesController.getDirectory
);

router.post(
  "/booing/logged-in-user/recentDirectories",
  directoriesController.getRecentDirectories
);

module.exports = router;

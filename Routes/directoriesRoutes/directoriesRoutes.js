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

router.post(
  "/booing/logged-in-user/deleteDirectory/:id",
  directoriesController.deleteDirectory
);

router.post(
  "/booing/logged-in-user/renameDirectory/:id",
  directoriesController.renameDirectory
);

router.post(
  "/booing/logged-in-user/copyDirectory/:id",
  directoriesController.copyDirectory
);

router.post(
  "/booing/logged-in-user/addFilesToDirectory/:id",
  directoriesController.addFilesToDirectory
);
router.post(
  "/booing/logged-in-user/getCategoryInfo",
  directoriesController.getCategoryInfo
);

module.exports = router;

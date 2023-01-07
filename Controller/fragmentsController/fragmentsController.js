const Fragments = require("../../Model/fragmentsModel/Fragments");
const mongoose = require("mongoose");
const isArray = require("../../Helpers/isArray");
const isObjectId = require("../../Helpers/isObjectId");

const uploadFragments = async (req, res) => {
  try {
    const { file_id, fragment } = req.body;
    if (!file_id) return res.status(400).json({ msg: "no file_id received." });
    if (!fragment)
      return res.status(400).json({ msg: "no fragments received." });
    const fileFragments = await Fragments.updateOne(
      { _id: file_id, "updates.fragmentID": fragment.fragmentID },
      { $set: { "updates.$.fragment": fragment.fragment } },
      { new: true }
    );
    if (fileFragments?.modifiedCount == 1)
      return res.status(200).json({
        msg: "fragment uploaded successfully.",
        success: true,
        data: fileFragments,
      });

    return res
      .status(400)
      .json({ msg: "error while uploading fragment.", success: false });
  } catch (err) {
    return res.status(500).json({ msg: err?.message, success: false });
  }
};

const checkForDownloads = async (req, res) => {
  try {
    const { device_id } = req.body;

    const fragments = await Fragments.find({
      "updates.isDownloaded": false,
    });

    if (!fragments)
      return res
        .satus(400)
        .json({ msg: "no fragments found.", success: false });

    let fragmentToDownload = [];

    fragments.forEach((fragment) => {
      fragment.updates.forEach((update) => {
        if (update.isDownloaded === false)
          update.devices.forEach((device) => {
            if (device.device_id.toString() == device_id) {
              let found = fragmentToDownload.some(
                (frag) => frag.fragment === update.fragment
              );
              if (!found) fragmentToDownload.push(update);
            }
          });
      });
    });

    if (fragmentToDownload.length != 0)
      return res
        .status(200)
        .json({ msg: "success", success: true, data: fragmentToDownload });

    return res
      .status(400)
      .json({ msg: "no fragments to download.", success: false });
  } catch (err) {
    return res.status(500).json({ msg: err?.message, success: false });
  }
};

const checkForUploads = async (req, res) => {
  try {
    const { device_id } = req.body;

    const fragments = await Fragments.find({
      "updates.isUploaded": false,
    });

    if (!fragments)
      return res
        .status(400)
        .json({ msg: "nothing to upload.", success: false });

    let fragmentToUpload = [];
    fragments.forEach((fragment) => {
      fragment.updates.forEach((update) => {
        update.devices.forEach((device) => {
          if (device.device_id.toString() == device_id) {
            let found = fragmentToUpload.some(
              (frag) => frag._id === fragment._id
            );
            if (!found) fragmentToUpload.push(fragment);
          }
        });
      });
    });
    if (fragmentToUpload.length != 0)
      return res
        .status(200)
        .json({ msg: "success", success: true, data: fragmentToUpload });

    return res.status(400).json({ msg: "Error.", success: false });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, success: false });
  }
};

const deleteFiles = async (req, res) => {
  try {
    const { files_id } = req.body;

    files_id?.forEach(async (file_id) => {
      await Fragments.findOneAndUpdate(
        { _id: file_id },
        // ! delete fragment only after duration
        // { $set: { "updates.$[].fragment": "",
        { isDeleted: true, expireAt: new Date() }
      ).catch((err) => {
        return res.status(400).json({ msg: err?.message, success: false });
      });
    });
    return res
      .status(200)
      .json({ msg: "File deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, success: false });
  }
};

const deleteFilesPermanently = async (req, res) => {
  try {
    const { files_ids, user_id } = req.body;

    if (!isObjectId(user_id)) {
      return res.status(401).json({
        status: "fail",
        message: "you must be logged in !",
      });
    }

    if (!isArray(files_ids) || files_ids.some((id) => !isObjectId(id))) {
      return res.status(401).json({
        status: "fail",
        message: "invalid files ids",
      });
    }

    const files = await Fragments.find({ _id: { $in: files_ids } });

    if (files.some((file) => file.user_id.toString() !== user_id)) {
      return res.status(401).json({
        status: "fail",
        message: "you dont have permission to delete these files",
      });
    }

    await Promise.all(files.map((file) => file.delete()));
    return res.status(200).json({
      status: "success",
      message: "files delete successfully",
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const restoreFiles = async (req, res) => {
  try {
    const { files_ids, user_id } = req.body;

    if (!isObjectId(user_id)) {
      return res.status(401).json({
        status: "fail",
        message: "you must be logged in !",
      });
    }

    if (!isArray(files_ids) || files_ids.some((id) => !isObjectId(id))) {
      return res.status(401).json({
        status: "fail",
        message: "invalid files ids",
      });
    }

    const files = await Fragments.find({ _id: { $in: files_ids } });

    if (files.some((file) => file.user_id.toString() !== user_id)) {
      return res.status(401).json({
        status: "fail",
        message: "you dont have permission to restore these files",
      });
    }

    await Promise.all(
      files.map((file) => {
        file.isDeleted = false;
        file.expireAt = null;
        return file.save();
      })
    );

    return res.status(200).json({
      status: "success",
      message: "files restored successfully",
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

const getDeletedFiles = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!isObjectId(user_id)) {
      return res.status(400).json({ msg: "user not found", success: false });
    }
    await Fragments.find({ isDeleted: true, user_id: user_id })
      .then((fragments) => {
        if (fragments) {
          let fileBase64 = "";
          let extension = "";
          // let result = false;
          let fileName = "";
          let base64 = [];

          fragments.forEach((item) => {
            // result = false;
            //   console.log("item file : ", item.updates[0].fileName);
            fileBase64 = "";
            item.updates.forEach((update) => {
              fileName = update.fileName.slice(
                0,
                update.fileName.lastIndexOf(".") - 1
              );
              extension = update.fileName.slice(
                update.fileName.lastIndexOf(".") + 1,
                update.fileName.length
              );
              fileBase64 = fileBase64 + update.fragment;
            });

            let elementToPush = "data:" + item.type + ";base64," + fileBase64;
            base64.push({
              uri: elementToPush,
              id: item._id,
              name: fileName + "." + extension,
            });

            //   result = downloadFile(fileBase64, extension, fileName);
            // console.log({ ...base64.length, id: item._id });
          });
          // if (result) {
          //   let uploadedFiles = await fs.readdirSync("./downloadedFiles");
          return res.status(200).json({
            msg: "file downloaded successfully",
            success: true,
            data: base64,
          });
        } else
          return res
            .status(200)
            .json({ success: true, msg: "no files in the trash" });
      })
      .catch((err) => {
        return res.status(400).json({ success: false, msg: err?.message });
      });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, success: false });
  }
};

// get files not inside a directory
const getMyFiles = async (req, res, next) => {
  const { user_id } = req.body;

  if (!isObjectId(user_id)) {
    return res.status(401).json({
      status: "fail",
      message: "you must be logged in !",
    });
  }

  try {
    const data = (
      await Fragments.find({
        isDeleted: false,
        directory: null,
        user_id,
      })
    ).map((file) => ({
      id: file._id,
      name: file.updates[0].fileName,
      isDirectory: file.isDirectory,
    }));

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (e) {
    console.log({ error: e });
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
};

module.exports = {
  checkForDownloads,
  checkForUploads,
  uploadFragments,
  deleteFiles,
  getDeletedFiles,
  getMyFiles,
  deleteFilesPermanently,
  restoreFiles,
};

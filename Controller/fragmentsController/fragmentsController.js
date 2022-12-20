const Fragments = require("../../Model/fragmentsModel/Fragments");
const mongoose = require("mongoose");

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
        { isDeleted: true }
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

const getDeletedFiles = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Fragments.find({ isDeleted: true, user_id: user_id })
      .then((files) => {
        if (files)
          return res
            .status(200)
            .json({ success: true, msg: "success", data: files });
        else
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

module.exports = {
  checkForDownloads,
  checkForUploads,
  uploadFragments,
  deleteFiles,
  getDeletedFiles,
};

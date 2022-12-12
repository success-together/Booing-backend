const Fragments = require("../../Model/fragmentsModel/Fragments");
const mongoose = require("mongoose");

const uploadFragments = async (req, res) => {
  try {
    const { file_id, fragment } = req.body;
    if (!file_id) return res.status(400).json({ msg: "no file_id received." });
    if (!fragment)
      return res.status(400).json({ msg: "no fragments received." })
    const fileFragments = await Fragments.updateOne({ _id: file_id, "updates.fragmentID": fragment.fragmentID },
      { $set: { "updates.$.fragment": fragment.fragment } }, { new: true })
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
    return res.status(500).json({ msg: err.message, success: false });
  }
};

const checkForDownloads = async (req, res) => {
  const { device_id } = req.body

  const fragments = await Fragments.find({
    "updates.isDownloaded": false,
  });

  if (!fragments)
    return res.satus(400).json({ msg: "no fragments found.", success: false })

  let fragmentToDownload = []

  fragments.forEach(fragment => {

    fragment.updates.forEach(update => {
      if (update.isDownloaded === false)
        update.devices.forEach(device => {
          if (device.device_id.toString() == device_id) {
            let found = fragmentToDownload.some(frag => frag.fragment === update.fragment)
            if (!found)
              fragmentToDownload.push(update)
          }
        })

    })
  })

  if (fragmentToDownload.length != 0)
    return res.status(200).json({ msg: "success", success: true, data: fragmentToDownload });

  return res.status(400).json({ msg: "no fragments to download.", success: false });
};

const checkForUploads = async (req, res) => {

  const { device_id } = req.body

  const fragments = await Fragments.find({
    "updates.isUploaded": false
  })

  if (!fragments)
    return res.status(400).json({ msg: "nothing to upload.", success: false });

  let fragmentToUpload = []
  fragments.forEach(fragment => {

    fragment.updates.forEach(update => {
      update.devices.forEach(device => {
        if (device.device_id.toString() == device_id) {
          let found = fragmentToUpload.some(frag => frag._id === fragment._id)
          if (!found)
            fragmentToUpload.push(fragment)
        }
      })

    })
  })
  if (fragmentToUpload.length != 0)
    return res
      .status(200)
      .json({ msg: "success", success: true, data: fragmentToUpload });

  return res.status(400).json({ msg: "Error.", success: false });
};

const deleteFile = async (req, res) => {
  console.log(req.body);
  const file_id = req.params.file_id
  await Fragments.findOneAndUpdate(
    { _id: file_id },
    { $set: { "updates.$[].fragment": "" }, isDeleted: true }
  )
    .then(() => {
      return res
        .status(200)
        .json({ msg: "File deleted successfully", success: true });
    })
    .catch((err) => {
      return res.status(400).json({ msg: err?.message, success: false });
    });
};

module.exports = { checkForDownloads, checkForUploads, uploadFragments ,deleteFile};

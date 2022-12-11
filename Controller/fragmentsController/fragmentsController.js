const Fragments = require("../../Model/fragmentsModel/Fragments");
const mongoose = require("mongoose")

const uploadFragments = async (req, res) => {
  try {
    const { file_id, fragment } = req.body
    if (!file_id)
      return res.status(400).json({ msg: "no file_id received." })
    if (!fragment)
      return res.status(400).json({ msg: "no fragments received." })
    const fileFragments = await Fragments.updateOne({ _id: file_id, "updates.fragmentID": fragment.fragmentID },
      { $set: { "updates.$.fragment": fragment.fragment } }, { new: true })
    console.log(fileFragments);
    if (fileFragments?.modifiedCount == 1)
      return res.status(200).json({ msg: "fragment uploaded successfully.", success: true, data: fileFragments })

    return res.status(400).json({ msg: "error while uploading fragment.", success: false })
  }
  catch (err) {
    return res.status(500).json({ msg: err.message, success: false })
  }
}

const checkForDownloads = async (req, res) => {
  const { user_id } = req.body

  const fragments = await Fragments.find({
    user_id: user_id,
  })

  if (!fragments)
    return res.satus(400).json({ msg: "no fragments found.", success: false })

  let isDownloadedFragments = []

  fragments.forEach(fragment => {
    let filtredFagment = fragment.updates.filter((item) =>
      item.isDownloaded === false
    );
    isDownloadedFragments.push(...filtredFagment)
  });

  if (isDownloadedFragments.length == 0)
    return res.status(400).json({ msg: "no fragments to download.", success: false });

  return res.status(200).json({ msg: "success", success: true, data: isDownloadedFragments });
};

const checkForUploads = async (req, res) => {

  const { device_id } = req.body

  const fragments = await Fragments.find({
    "updates.isDownloaded": false
  })

  if (!fragments)
    return res.status(400).json({ msg: "nothing to upload.", success: false });

  let fragmentToUpload = []
  fragments.forEach(fragment => {
    
    fragment.updates.forEach(update => {
      
      let filtredFagment = update.devices.filter((item) => {
        item.device_id.toString() == device_id
        console.log(item.device_id.toString() == device_id);
      })
      fragmentToUpload.push(...filtredFagment)
    })
  })
  if (fragmentToUpload.length != 0)
    return res.status(200).json({ msg: "success", success: true, data: fragmentToUpload });

  return res.status(400).json({ msg: "Error.", success: false });
};

module.exports = { checkForDownloads, checkForUploads, uploadFragments };

const Fragments = require("../../Model/fragmentsModel/Fragments");

const checkForDownloads = async (req, res) => {
  const { user_id } = req.body;
  const fragments = await Fragments.find({
    user_id: user_id,
    isDownloaded: false,
  });
  if (!fragments)
    return res.satus(400).json({ msg: "no fragments found", success: false });
  console.log(fragments);
  return res
    .status(200)
    .json({ msg: "success", success: true, data: fragments });
};

const checkForUploads = async (req, res) => {
  const { user_id } = req.body;
  const fragments = await Fragments.find({
    user_id: user_id,
    isUploaded: false,
  });
  if (!fragments)
    return res.status(400).json({ msg: "nothing to upload", success: false });
  console.log(fragments);
  return res
    .status(200)
    .json({ msg: "success", success: true, data: fragments });
};

module.exports = { checkForDownloads, checkForUploads };

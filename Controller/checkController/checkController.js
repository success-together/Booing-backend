const Fragments = require("../../Model/fragmentsModel/Fragments");

const checkForDownloads = async (req, res) => {
  const { user_id } = req.body

  const fragments = await Fragments.find({
    user_id: user_id,
  })

  if (!fragments)
    return res.satus(400).json({ msg: "no fragments found", success: false })

  let isDownloadedFragments = []
  
  fragments.forEach( fragment => {
   isDownloadedFragments = fragment.updates.filter((item) => 
    item.isDownloaded === false
   )
  });
 
  return res
    .status(200)
    .json({ msg: "success", success: true, data: isDownloadedFragments });
};

const checkForUploads = async (req, res) => {

  const { user_id } = req.body

  const fragments = await Fragments.find({
    user_id: user_id,
  })

  if (!fragments)
    return res.status(400).json({ msg: "nothing to upload", success: false });

  let isUploadedFragments = []

  fragments.forEach(fragment => {
    isUploadedFragments = fragment.updates.filter((item) =>
    item.isUploaded === false)
  })
  return res
    .status(200)
    .json({ msg: "success", success: true, data: isUploadedFragments });
};

module.exports = { checkForDownloads, checkForUploads };

const { file } = require("googleapis/build/src/apis/file");
const { downloadFile } = require("../../Middleware/DownloadFile");
const Fragments = require("../../Model/fragmentsModel/Fragments");
const fs = require("fs");

//Download File
const download = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const type = req.params.type;
    console.log(type);
    if (!user_id) {
      return res.status(400).json({ msg: "user not found", success: false });
    }
    const fragments = await Fragments.find({ user_id: user_id });
    if (fragments.length == 0)
      return res.status(400).json({ msg: "no fragment found", success: false });

    let fileBase64 = "";
    let extension = "";
    // let result = false;
    let fileName = "";
    let base64 = [];

    fragments.forEach((item) => {
      // result = false;
      //   console.log("item file : ", item.updates[0].fileName);
      if (!item.isDeleted) {
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

        // * checking if file type exists in fragmenet colluction to return only needed files ...
        if (item.type && item.type.includes(type)) {
          let elementToPush = "data:" + item.type + ";base64," + fileBase64;
          base64.push({
            file: elementToPush,
            id: item._id,
            name: fileName + "." + extension,
          });
        }
      }
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
    // }
    // return res.status(500).json({ msg: result, success: false });
  } catch (err) {
    return res.status(400).json({ msg: err?.message, success: false });
  }
};

module.exports = { download };

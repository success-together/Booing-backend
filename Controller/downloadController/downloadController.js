const { file } = require("googleapis/build/src/apis/file");
const { downloadFile } = require("../../Middleware/DownloadFile");
const Fragments = require("../../Model/fragmentsModel/Fragments");
const fs = require("fs");
const isObjectId = require("../../Helpers/isObjectId");

const types = {
  document: (type) => {
    const arr = [
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
      "text/calendar",
      "text/javascript",
      "application/json",
      "application/ld+json",
      "text/javascript",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.text",
      "application/pdf",
      "application/x-httpd-php",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/rtf",
      "application/x-sh",
      "text/plain",
      "application/xhtml+xml",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/xml",
      "application/vnd.mozilla.xul+xml",
    ];

    return arr.includes(type) || arr.find((e) => e.includes(type));
  },
  apk: (type) => type === "application/vnd.android.package-archive",
  video: (type) => type?.startsWith("video/"),
  audio: (type) => type?.startsWith("audio/"),
  image: (type) => type?.startsWith("image/"),
  download(type) {
    return (
      !this.document(type) &&
      !this.apk(type) &&
      !this.video(type) &&
      !this.audio(type) &&
      !this.image(type)
    );
  },
};

//Download File
const download = async (req, res) => {
  // try {
    const user_id = req.params.user_id;
    const type = req.params.type;
    if (!Object.keys(types).includes(type) && type !== 'all') {
      return res.status(403).json({ msg: "invalid type", success: false });
    }
    if (!isObjectId(user_id)) {
      return res.status(400).json({ msg: "user not found", success: false });
    }
    const fragments = await Fragments.find({
      user_id: user_id,
      isDeleted: false,
      isDirectory: false,
      category: type
    });
    console.log(fragments.length)
    if (fragments.length == 0)
      return res.status(400).json({ msg: "no fragment found", success: false });

    let fileBase64 = "";
    let extension = "";
    // let result = false;
    let fileName = "";
    let base64 = [];

    fragments.forEach((item) => {
      base64.push({
        uri: '',
        updates: item.updates,
        id: item._id,
        name: item.filename,
        thumbnail: item.thumbnail,
        type: item.type,
        category: item.category,
        createdAt: item.created_at,
      });
    });
    return res.status(200).json({
      msg: "file downloaded successfully",
      success: true,
      data: base64,
    });
    // }
    // return res.status(500).json({ msg: result, success: false });
  // } catch (err) {
  //   return res.status(400).json({ msg: err?.message, success: false });
  // }
};

//Download File
const search = async (req, res) => {
  // try {
    const {user_id, search} = req.body;
    if (!isObjectId(user_id)) {
      return res.status(400).json({ msg: "user not found", success: false });
    }
    if (!search) {
      return res.status(400).json({ msg: "please input search value", success: false });
    }
    const fragments = await Fragments.find({
      user_id: user_id,
      isDeleted: false,
      isDirectory: false,
      filename: {$regex: new RegExp("" + search + "")}
    });

    console.log(fragments.length)
    if (fragments.length == 0)
      return res.status(400).json({ msg: "no fragment found", success: false });

    let fileBase64 = "";
    let extension = "";
    // let result = false;
    let fileName = "";
    let base64 = [];

    fragments.forEach((item) => {
      base64.push({
        uri: '',
        updates: item.updates,
        id: item._id,
        name: item.filename,
        thumbnail: item.thumbnail,
        type: item.type,
        category: item.category,
        createdAt: item.created_at,
      });
    });
    return res.status(200).json({
      msg: "file downloaded successfully",
      success: true,
      data: base64,
    });
    // }
    // return res.status(500).json({ msg: result, success: false });
  // } catch (err) {
  //   return res.status(400).json({ msg: err?.message, success: false });
  // }
};
const downloadByOffer = async (req, res) => {
  const {filename} = req.params;
  let encodedFile64 = fs.readFileSync(__dirname + '/../../uploadedFiles/'+filename, { encoding: "base64" });
  console.log(encodedFile64.length)
  return res.status(200).json({
    success: true,
    data: encodedFile64
  })
}
module.exports = { download, downloadByOffer, search };

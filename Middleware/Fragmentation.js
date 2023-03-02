const fs = require("fs");
const imageThumbnail = require('image-thumbnail');
const { file } = require("googleapis/build/src/apis/file");
const { fields } = require("./UploadFile");
const devices = require("../Controller/deviceController/deviceController");
const Device = require("../Model/deviceModel/Device");
const SendFragments = require("../Middleware/SendFragments");
const socket = require('./Socket');
const {getCategoryByType} = require("../Middleware/CheckMimetype");


const fragmentation = async (req, res) => {
  try {
    // Get connected user
    let user_id = req.params.user_id;

    // Get available devices
    // let allDevices = await devices.getDevices();
    // let availableDevices = socket.checkDevices(allDevices);
    let availableDevices = await devices.getAvailableDevices(user_id);
    if (availableDevices.length > 1) delete availableDevices[user_id];
    availableDevices.sort((a, b)=>{return Math.random()>0.5?1:-1})
    let noad = availableDevices?.length; // Number of availble devices
    while(availableDevices.length < 100) {  //device id copy
      for (var i = 0; i < noad; i++) {
        availableDevices.push(availableDevices[i]);
      }
    }
    noad = availableDevices?.length;
    let zone = Math.floor(noad/7);
    console.log(
      "There are " + noad + " available devices : ",
      availableDevices
    );

    let files = req.files;
    const filesData = await Promise.all(
      files?.map(async (file) => {
        console.log("file ", file);
        // Convert file to bytes (base64)
        let encodedFile64 = fs.readFileSync(file.path, { encoding: "base64" });
        let lengthFile64 = encodedFile64.length; //Number of bytes
        console.log(lengthFile64)
        let sliceLength = Math.trunc((lengthFile64-10) / zone);
        let i = 0;
        let j = 0;
        let fragment = "";
        let fragmentPath = {};
        let fragments = [];
        console.log("length of the file (base64) : ", lengthFile64);

        //Divide the file over the number of available devices
        while (i < lengthFile64 - sliceLength) {
          fragment = encodedFile64.slice(i, i + sliceLength);
          const devices = [
            {device_id: availableDevices[j]._id},
            {device_id: availableDevices[j+zone*1]._id},
            {device_id: availableDevices[j+zone*2]._id},
            {device_id: availableDevices[j+zone*3]._id},
            {device_id: availableDevices[j+zone*4]._id},
            {device_id: availableDevices[j+zone*5]._id},
            {device_id: availableDevices[j+zone*6]._id}
          ];
          fragmentPath = {
            fragmentID: j,
            fragment: fragment,
            fileName: file.filename,
            uid: Date.now(),
            size: fragment.length,
            user_id: user_id,
            devices: devices
          };
          fragments.push(fragmentPath);
          i = i + sliceLength;
          j++;
        }
        fragments[fragments.length - 1].fragment = fragments[fragments.length - 1].fragment + encodedFile64.slice(i, lengthFile64);
        fragments[fragments.length - 1].size = fragments[fragments.length - 1].fragment.length;

        console.log("file fragments : ", fragments.length)
        const category = getCategoryByType(file.mimetype);
        let thumbnail = "";
        if (category==="image") {
          let options = { width: 100, responseType: 'base64', fit: 'cover' }  
          thumbnail = await imageThumbnail(encodedFile64, options);
          thumbnail = "data:image/"+file.mimetype+";base64, " + thumbnail;
        }   

        const {_id, frag} = await SendFragments(
          fragments,
          user_id,
          file.mimetype,
          lengthFile64,
          file.filename,
          thumbnail,
          category
        );

        return { id: _id, name: file.filename, updates: frag, thumbnail: thumbnail };
      })
    );

    res.status(200).json({
      message: "file(s) uploaded successfully !",
      data: filesData,
    });
  } catch (e) {
    console.log({ error: e });

    if (e.code === "ERR_OUT_OF_RANGE") {
      return res.status(403).json({
        status: "fail",
        message: "file has exceeded the maximum size (16mb) ",
      });
    }

    res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = fragmentation;

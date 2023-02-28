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
    let availableDevices = socket.getDevices();
    if (availableDevices.length > 1) delete availableDevices[user_id];
    availableDevices.sort((a, b)=>{return Math.random()>0.5?1:-1})
    let noad = availableDevices?.length; // Number of availble devices
    while(availableDevices.length < 10) {  //device id copy
      for (var i = 0; i < noad; i++) {
        availableDevices.push(availableDevices[i]);
      }
    }
    noad = availableDevices?.length;
    noad = noad >15?15:noad;
    console.log(
      "There are " + noad + " available devices : ",
      availableDevices
    );
    // get files

    let files = req.files;
    console.log(req.files)
    const filesData = await Promise.all(
      files?.map(async (file) => {
        console.log("file ", file);
        if (file.size > 16000000) { noad = Math.min(noad, 16) }
        else if (file.size > 10000000) { noad = Math.min(noad, 10) }
        else if (file.size > 5000000) { noad = Math.min(noad, 8) }
        else if (file.size > 2000000) { noad = Math.min(noad, 5) }
        else if (file.size > 1000000) { noad = Math.min(noad, 3)}
        else noad = Math.min(noad, 2);
        // Convert file to bytes (base64)
        let encodedFile64 = fs.readFileSync(file.path, { encoding: "base64" });
        let lengthFile64 = encodedFile64.length; //Number of bytes
        console.log(lengthFile64)
        let sliceLength = Math.trunc((lengthFile64-10) / noad);
        let i = 0;
        let j = 0;
        let fragment = "";
        let fragmentPath = {};
        let fragments = [];
        console.log("length of the file (base64) : ", lengthFile64);
        // console.log("encodedFile64", encodedFile64);
        // console.log("Fragment length : ", sliceLength)

        //Divide the file over the number of available devices
        while (i < lengthFile64 - sliceLength) {
          fragment = encodedFile64.slice(i, i + sliceLength);
          let device_id = availableDevices[j]._id;
          const devices = device_id === user_id?[{ device_id: user_id }]:[{ device_id: device_id }, { device_id: user_id }];
          fragmentPath = {
            fragmentID: j,
            fragment: fragment,
            fileName: file.filename,
            uid: Date.now(),
            user_id: user_id,
            devices: devices,
            size: fragment.length,
            isUploaded: false,
            isDownloaded: false,
          };
          fragments.push(fragmentPath);
          i = i + sliceLength;
          j++;
        }
          fragments[fragments.length - 1].fragment = fragments[fragments.length - 1].fragment + encodedFile64.slice(i, lengthFile64);
          fragments[fragments.length - 1].size = fragments[fragments.length - 1].fragment.length;

        // console.log("file " + index + " fragments : ", fragments.length)
        // console.log("file " + index + " fragments : ", fragments)
        // console.log(fragments.length, user_id, file.mimetype, file.size)     
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
          file.size,
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

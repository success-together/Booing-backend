const fs = require("fs");
const imageThumbnail = require('image-thumbnail');
const { file } = require("googleapis/build/src/apis/file");
const { fields } = require("./UploadFile");
const devices = require("../Controller/deviceController/deviceController");
const Device = require("../Model/deviceModel/Device");
const SendFragments = require("../Middleware/SendFragments");
const socket = require('./Socket');
const {getCategoryByType} = require("../Middleware/CheckMimetype");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
var ffprobe = require('ffprobe-static');
ffmpeg.setFfprobePath(ffprobe.path);

const tempFile = 'thumbnail_video.png';
const generateThumb = (filename) => {
  console.log( __dirname+'/../'+filename)
  return new Promise((resolve, reject) => {
    ffmpeg({ source: __dirname+'/../'+filename })
    .screenshots({
         count: 1,
         timestamps: ['5%'],
         folder: __dirname+'/../tmp/',
         size: '?x100',
         filename: tempFile
    })
    .on('error', function (error) {
      console.log(error)
       reject(error)
    })
    .on('end', function(aaa) {
      resolve(tempFile)
    })    
  });
}

const fragmentation = async (req, res) => {
  try {
    // Get connected user
    let user_id = req.params.user_id;
    let availableDevices = await devices.getAvailableDevices(user_id);

    if (availableDevices.length === 0) {
      return res.status(403).json({
        status: "fail",
        message: "now booing cloud full. try again later.",
      });
    }

    //for testing, manually add devices.
    if (availableDevices.length > 1) delete availableDevices[user_id];
    let noad = availableDevices?.length; // Number of availble devices
    while(availableDevices.length < 100) {  //device id copy
      for (var i = 0; i < noad; i++) {
        availableDevices.push(availableDevices[i]);
      }
    }
    //end

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
          thumbnail = "data:"+file.mimetype+";base64, " + thumbnail;
        } else if (category === 'video') {
          // try {
            console.log('Before')
            await generateThumb(file.path);
            console.log('After')
            thumbnail = "data:image/png;base64, " + fs.readFileSync(__dirname+"/../tmp/"+tempFile, { encoding: "base64" });
            console.log('thumbnail')
          // } catch {
            // thumbnail = "";
          // }
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
        console.log(file.path)
        await fs.unlinkSync(file.path);
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

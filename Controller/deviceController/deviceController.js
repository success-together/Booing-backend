const Device = require("../../Model/deviceModel/Device");
const User = require("../../Model/userModel/User");
const Fragments = require("../../Model/fragmentsModel/Fragments");
const File = require("../../Model/fileModel/File");

const addDevice = async (req, res) => {
  const { device_ref, created_at, type, name, user_id, lat, lon } = req.body;
  await User.findOneAndUpdate({_id: user_id}, {lat: lat, lon: lon, device_ref: device_ref});

  // ADD DEVICE TO DEVICE COLLECTION
  let dev = new Device({
    device_ref,
    created_at,
    type,
    name,
    user_id,
    lat,
    lon,
    status: 5,
  });
  const isExistedDevice = await Device.findOne({ device_ref: device_ref });
  if (!isExistedDevice) {
    await dev
      .save()
      .then((Newdevice) => {
        if (Newdevice) {
          // PUSH THE NEW DEVICE ID TO USER COLLECTION
          User.findOneAndUpdate(
            { _id: user_id },
            {
              $push: { devices: Newdevice._id },
            }
          )
            .then((savedUser) => {
              if (savedUser)
                return res.status(200).json({
                  success: true,
                  msg: "device created successfully",
                  data: dev,
                });
              else
                return res
                  .status(400)
                  .json({ success: false, msg: "failed to add device" });
            })
            .catch((err) => {
              return res
                .status(400)
                .json({ success: false, msg: err?.message });
            });
        } else
          return res
            .status(400)
            .json({ success: false, msg: "failed to add device" });
      })
      .catch((err) =>
        res.status(400).json({ success: false, msg: err?.message })
      );
  } else if (isExistedDevice) {
    const checkDeviceInUserDevices = await User.findOne({
      _id: user_id,
      devices: isExistedDevice._id,
    });
    if (!checkDeviceInUserDevices) {
      await User.findOneAndUpdate(
        { _id: user_id },
        {
          $push: { devices: isExistedDevice._id },
        }
      );
      return res.status(200).json({
        sucess: true,
        msg: "Device already exists. Device has been successfully added to user devices.",
        data: isExistedDevice,
      });
    } else {
      return res.status(200).json({
        sucess: false,
        msg: "Device already exists",
        data: isExistedDevice,
      });
    }
  } else
    return res.status(500).json({
      sucess: false,
      msg: "Error while addind device",
    });
};

const getAvailableDevices = async (user_id) => {
  const user = await User.findOne({_id: user_id});
  const lat = user['lat']?user['lat']:1;
  const lon = user['lon']?user['lon']:1;
  const users = await User.aggregate([   
    {$sort:{_id:-1}}, 
    {
      $addFields: {
        coord: [
          {$convert:{input:"$lat", to:"double"}}, 
          {$convert:{input:"$lon", to:"double"}}
        ]           
      }   
    },   
    {
      $match:{
        //is online check
        is_online: true,
        coord: {       
          $geoWithin: { 
            $center: [[ lat, lon ], 9999999] 
          }    
        }   
      }   
    },
    { $project: {
        _id: 1,
        coord: 1,
        occupy_cloud: 1,
        used_occupycloud: 1
    }},
  ])
  let availableList = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i]['used_occupycloud']/(users[i]['occupy_cloud']*1000000000) < 0.9) {
      availableList.push(users[i]);
    }
  }
  console.log("availableList=> ", availableList);
  return availableList;
}

//Get Available Devices
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    if (devices) {
      return devices;
    }
    return 0;
  } catch (err) {
    //Return errors
    return err.message;
  }
};

//Get User Registred Devices
const getUserDevices = async (req, res) => {
  try {
    const { user_id } = req.body;
    let userDevices = [];
    if (!user_id)
      return res
        .status(400)
        .json({
          success: false,
          msg: "error while fetching devices, no user_id found.",
        });

    const user = await User.findOne({ _id: user_id });
    console.log(user);
    if (!user)
      return res
        .status(400)
        .json({
          success: false,
          msg: "error while fetching devices, we can't find the user.",
        });

  
      let dev = await Device.find({ _id: { $in: user.devices } });  
    console.log(dev);
    if (dev) {
      return res
        .status(200)
        .json({ success: true, data: dev, msg: "sucess" });
    }
    return res
      .status(400)
      .json({ success: false, msg: "error while fetching devices" });
  } catch (err) {
    //Return errors
    res?.status(500).json({ success: false, msg: err.message });
  }
};

const checkAvailability = async (req, res) => {
  const { device_ref } = req.body;
  try {
    let deviceSchema = await Device.findOne({ device_ref: device_ref });


    if (deviceSchema) {
      if (deviceSchema.status < 4) {
        await Device.findOneAndUpdate(
          { _id: deviceSchema._id },

          { status: ++deviceSchema.status, updated_at: Date.now() }
        );
      }
      return res.status(200).json({
        msg: "device status updated successfully",
        data: deviceSchema,
        success: true,
      });
    } else
      return res
        .status(400)
        .json({ success: false, msg: "error when fetching device" });
  } catch (err) {
    //Return errors
    res.status(400).json({ msg: err?.message, success: false });
  }
};

const updateGeoLocation = async (req, res) => {
  try {
    const { device_ref, lat, lon } = req.body;
    await User.findOneAndUpdate(
      { device_ref: device_ref },
      { lat: lat, lon: lon }
    ).then((rec) => {
      if (rec) {
        return res.status(200).json({
          msg: "device geolocation updated successfully",
          success: true,
        });
      } else
        return res
          .status(400)
          .json({ msg: "error updating device informations", success: false });
    });
  } catch (error) {
    res.status(400).json({ msg: error?.message, success: false });
  }
};

const checkFragments = async (req, res) => {
  const {user_id} = req.params;
  console.log('checkFragments', user_id)
  try {
    const fragments = await File
      .find({
        "devices": {
          "$elemMatch": {
            "device_id": user_id
          }
        }
      })
    return res.status(200).json({
      msg: `Your device have to be ${fragments.length} fragments.`,
      data: fragments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
}

// db.getCollection("files").find({
//   "devices": {
//     "$elemMatch": {
//       "device_id": ObjectId("6446a82fee84415a3dd4807b")
//     }
//   }
// })


module.exports = {
  addDevice,
  getDevices,
  getAvailableDevices,
  getUserDevices,
  checkAvailability,
  updateGeoLocation,
  checkFragments
};

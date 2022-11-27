const Device = require("../../Model/deviceModel/Device");
const User = require("../../Model/userModel/User");

const addDevice = async (req, res) => {
  const device = req.body;
  // ADD DEVICE TO DEVICE COLLECTION
  let dev = new Device(device);
  await dev
    .save()
    .then((res) => {
      if (res) {
        console.log("device added seccussfully to collection");

        // PUSH THE NEW DEVICE ID TO USER COLLECTION
        User.findOneAndUpdate(device?.user_id, {
          $push: { devices: res._id },
        })
          .then((savedUser) => {
            console.log(savedUser);
            if (savedUser)
              return res
                .status(200)
                .json({ success: true, msg: "device created successfully" });
            else
              return res
                .status(400)
                .json({ success: false, msg: "failed to add device" });
          })
          .catch((err) =>
            res.status(400).json({ success: false, msg: err?.message })
          );
      } else
        res.status(400).json({ success: false, msg: "failed to add device" });
    })
    .catch((err) =>
      res.status(400).json({ success: false, msg: err?.message })
    );
};

const getDevices = async (req, res) => {
  await Device.find()
    .then((devices) => {
      console.log({ success: true, data: devices, msg: "sucess" });
      if (devices)
        return res
          .status(200)
          .json({ success: true, data: devices, msg: "sucess" });
      else
        return res
          .status(400)
          .json({ success: false, msg: "error while fetching devices" });
    })
    .catch((err) =>
      res.status(400).json({ success: false, msg: err?.message })
    );
};

const checkAvailability = async (req, res) => {
  const device = req.body;
  try {
    let deviceSchema = await Device.findOne({ _id: device._id });
    console.log(deviceSchema);

    if (deviceSchema) {
      if (deviceSchema.status < 4) {
        await Device.findOneAndUpdate(
          { _id: deviceSchema._id },
          { status: ++deviceSchema.status, updated_at : Date.now() }
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

const updateGeoLocation = async (req,res) => {
  try {
    
  } catch (error) {
    res.status(400).json({ msg: err?.message, success: false });
  }
}

module.exports = { addDevice, getDevices, checkAvailability };

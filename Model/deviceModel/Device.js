const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");

const deviceSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: null
  },
  type: {
    type: String,
  },
  name:{
    type: String,
  },
  status: {
    type : Number,
  },
  geoLocation: {
    type: String,
  },
});

const Device = model("Device", deviceSchema);
module.exports = Device;

const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");


const tempSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // 0: server notification, 
  // 1: offer
  // 2:fragement delete request
  type: {
    type: Number,
    required: true
  },
  data: {
    type: String
  }
});



const Temp = model("Temp", tempSchema);

module.exports = Temp;

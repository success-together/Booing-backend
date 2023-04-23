const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");

const fileSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  fragmentID: {
    type: Number, 
    required: true
  },
  fileName: {
    type: String, 
    required: true
  },
  uid: {
    type: String, 
    required: true
  },
  size: {
    type: Number, 
    required: true
  },
  devices: {
    type: Array
  }
});

const File = model("File", fileSchema);
module.exports = File;

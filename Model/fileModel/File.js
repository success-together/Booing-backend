const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");

const fileSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  realName: {
    type: String,
  },
  extension: {
    type: String,
  },
  fragments: {
    type: Array,
  },
  created_at: {
    type: Date,
    default: Date.now
  },

});

const File = model("File", deviceSchema);
module.exports = File;

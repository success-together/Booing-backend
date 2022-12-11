const { Schema, model } = require("mongoose");
let mongoose = require('mongoose');

const fragmentsSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  updates: {
    type: Array,
  },
  user_id: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
  },
  type: {
    type: String,
  }
});

const Fragments = model("Fragments", fragmentsSchema);

module.exports = Fragments;

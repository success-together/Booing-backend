const { Schema, model } = require("mongoose");
let mongoose = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true
  },

  socialMedia_ID: {
    type: String,
  },

  devices: {
    type: Array,
  },

  password: {
    type: String,
    required: true,
    min: 6,
  },
  last_login: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  code: {
    type: Number,
    default: 0,
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
});

const User = model("User", userSchema);

module.exports = User;

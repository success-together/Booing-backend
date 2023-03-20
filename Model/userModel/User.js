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
  birth: {
    type: Date
  },
  address: {
    type: String
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
  avatar: String,
  size: { type: Number, default: 0 },
  accountVerified: { type: Boolean, default: false },
  occupy_cloud: { type: Number, default: 1 },
  used_occupycloud: { type: Number, default: 0 },
  my_cloud: {type: Number, default: 1},
  mermbership: {
    m_id: {type: String, default: 'Free'},
    start: {type: Number, default: 0},
    expire: {type: Number, default: 0},
    isMonth: {type: Boolean, default: true},
    quantity: {type: Number, default: 0},
  },
  used_mycloud: { type: Number, default: 0 },
  lat: { type: Number, default: 1 },
  lon: { type: Number, default: 1 },
  divice_ref: {type: String},
  traffic: { type: Number, default: 0 },
  traffic_cloud: { type: Number, default: 0 },
  is_online: {type: Boolean, default: false},
});

const User = model("User", userSchema);

module.exports = User;

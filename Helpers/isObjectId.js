const mongoose = require("mongoose");

module.exports = function isObjectId(id) {
  return id && id === new mongoose.Types.ObjectId(id).toString();
};

const mongoose = require("mongoose");

module.exports = function isObjectId(id) {
  return (
    id &&
    (id.length === 12 || id.length === 24) &&
    id === new mongoose.Types.ObjectId(id).toString()
  );
};

const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isDirectory: {
    type: Boolean,
    default: false,
    required: true,
  },
  directory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fragments",
    default: null,
  },
  openedAt: {
    type: Date,
  },
});

fragmentsSchema.post(/^find/, async function (result, next) {
  const Model = this.model;

  if (typeof result === "object" && Array.isArray(result)) {
    await Promise.all(
      result.map(async (item) => {
        if (item.isDirectory) {
          item._doc.items = await Model.find({ directory: item._doc._id });
        }
        return item;
      })
    );
  } else {
    if (result.isDirectory) {
      result._doc.items = await Model.find({ directory: result._doc._id });
    }
  }

  return result;
});

const Fragments = model("Fragments", fragmentsSchema);

module.exports = Fragments;

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
  updates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    }
  ],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
  },
  filename: {
    type: String
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
  },
  uid: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },

  size: {
    type: Number,
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
  expireAt: {
    type: Number,
  },
  weight: {
    type: Number, //initial 10000, -100 each day, when user download file +5000
    default: 10000 //when value is 0, delete request
  }
});

fragmentsSchema.post(/^find/, async function (result, next) {
  const Model = this.model;

  if (!result) {
    return result;
  }

  if (typeof result === "object" && Array.isArray(result)) {
    await Promise.all(
      result.map(async (item) => {
        if (item.isDirectory) {
          item._doc.items = await Model.find({
            directory: item._doc._id,
            isDeleted: false,
          });
        }
        return item;
      })
    );
  } else {
    if (result.isDirectory) {
      result._doc.items = await Model.find({
        directory: result._doc._id,
        isDeleted: false,
      });
    }
  }

  return result;
});

const Fragments = model("Fragments", fragmentsSchema);

module.exports = Fragments;

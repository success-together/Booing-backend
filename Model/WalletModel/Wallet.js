const { Schema, model } = require("mongoose");
let mongoose = require("mongoose");


const walletSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    default: 0,
  },
  transactions: {
    type: Array
  },
});



const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;

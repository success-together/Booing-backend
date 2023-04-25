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
  transactions: [{
      status: {type: Number, default: 0}, //0: pending, 1: sell, 2: gift, 3: receive, 4: buy, 5: send 
      amount: {type: Number, default: 0},
      date: {type: Date, default: Date.now()},
      quantity: {type: Number, default: 0},
      before: {type: Number, default: 0},
      after: {type: Number, default: 0},
      info: {type: String}
  }],
  updated_at: Date,
  isSpaceSelled : {
    type : Boolean,
    default : false,
  }
});



const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;

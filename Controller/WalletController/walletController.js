const { default: mongoose } = require("mongoose");
const Wallet = require("../../Model/WalletModel/Wallet");

const getWallet = async (req, res) => {
  const user_id = req.params.id;
  console.log(user_id);
  await Wallet.findOne({ user_id: mongoose.Types.ObjectId(user_id) })
    .then((wallet) => {
      console.log(wallet);
      return res
        .status(200)
        .json({ data: wallet, success: true, msg: "success" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, msg: err.message });
    });
};

const walletTransaction = async (req, res) => {
  const { isIncremenet, coins, user_id, isSpaceSelled } = req.body;
  console.log(req.body)
  await Wallet.findOneAndUpdate(
    { user_id: user_id },
    {
      isSpaceSelled: isSpaceSelled,
      $inc: { amount: isIncremenet ? coins : -coins },
      $push: {
        transactions: {
          isIncremenet: isIncremenet,
          amount: coins,
          date: new Date(),
        },
      },
    }
  )
    .then((updatedWalled) => {
      return res.status(200).json({
        msg: "wallet updated successfully",
        success: true,
        data: updatedWalled,
      });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, msg: err.message });
    });
};

module.exports = { walletTransaction, getWallet };

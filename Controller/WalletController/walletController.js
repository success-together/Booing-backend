const { default: mongoose } = require("mongoose");
const Wallet = require("../../Model/WalletModel/Wallet");
const stripe = require('stripe')('sk_test_51MjkVyFXtBJLEoWyonULYxNGHZlwnlS6ySLxhbidpRmsfFiSHBGXYEV3OVHmWmKbWwoW108HdfrxQHBJqHY9vpmX00sHbk7SjG');

const getWallet = async (req, res) => {
  const user_id = req.params.id;
  console.log(user_id);
  await Wallet.findOne({ user_id: mongoose.Types.ObjectId(user_id) })
    .then((wallet) => {
      return res
        .status(200)
        .json({ data: wallet, success: true, msg: "success" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, msg: err.message });
    });
};

const walletTransaction = async (req, res) => {
  const { space, coins, user_id, isSpaceSelled } = req.body;
  await Wallet.findOneAndUpdate(
    { user_id: user_id },
    {
      isSpaceSelled: isSpaceSelled,
      $inc: { amount: isIncremenet ? coins : -coins },
      $push: {
        transactions: {
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

const stripeSheet = async (req, res) => {
  const {product, user_id} = req.body;
  let price = 0;
  if (product.offer) {
    price = product.after;
  } else {
    const basic = product.isMonth?product.monthly:product.yearly;
    price = product.quantity * basic - product.leftPrice;
    price = Math.trunc(price*100)/100;
  }
  console.log(price)
  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: "2022-11-15"}
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price*100,
      currency: "eur",
      customer: customer.id,

      payment_method_types: [
          "card"
      ]
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      merchantName: product.id,
      publishableKey: "pk_test_51MjkVyFXtBJLEoWydBEh9IL3AsnH5mNpeTO4A6mq58R6rrqb1HuOX0BgH9xcVJJXBY74fNAMcRR77tcFVErZebLp001fnnhhdH"
    })
  } catch {
    res.status(500).json({
      status: "fail",
      message: "something went wrong",
    });
  }
}
const checkoutSpace = (req, res) => {}
module.exports = { walletTransaction, getWallet, stripeSheet };

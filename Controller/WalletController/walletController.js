const { default: mongoose } = require("mongoose");
const Wallet = require("../../Model/WalletModel/Wallet");
const User = require("../../Model/userModel/User");

const dotenv = require("dotenv");
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_PRIVATEKEY);

const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', // Set to 'live' for production
    'client_id': process.env.PAYPAL_CLIENTID,
    'client_secret': process.env.PAYPAL_SECRET
});

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


const purchaseMemberShip = async (data) => {
  console.log(data)
  const { id, quantity, isMonth, user_id, offer, total } = data; 
  let user = await User.findOne({ _id: user_id });
  if (!user) {
    return { 
      msg: "You must be logined.", 
      success: false 
    };
  }
  let space = 1;
  if (id === 'Pluse-100G') space = 100;
  if (id === 'Pluse-500G') space = 500;
  if (id === 'Pluse-1T') space = 1000;
  if (id === 'Pluse-5T') space = 5000;
  if (id === 'Pluse-10T') space = 10000;
  if (id === 'Pluse-50T') space = 50000;
  if (id === '2TB-Booing-Space') space = 2000;
  user.my_cloud = space
  user.mermbership.m_id = id;
  user.mermbership.start = Date.now();
  if (offer) {

  } else {
    //get expire date
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();
    //next date
    let nmonth = 0;
    let nyear = 0;
    if (isMonth) {
      let temp = month*1 + quantity;
      nyear = year*1 + Math.trunc(temp/12);
      nmonth = temp%12;
      if (nmonth < 10)  nmonth = `0${nmonth}`; 
    } else {
      nyear = year*1 + quantity;
      nmonth = month;
    }
    //end get expire date

    user.mermbership.expire = new Date(`${nyear}-${nmonth}-${day}`).getTime();
    user.mermbership.isMonth = isMonth;
    user.mermbership.quantity = quantity;
  }
  const wallet = await Wallet.findOne({user_id: user_id});
  wallet.transactions.push({
    status: 4,
    amount: total*50000000,
    before: wallet.amount,
    after: wallet.amount,
    info: "You purchased " + id,
  });
  wallet.amount = wallet.amount + total*50000000;
  wallet.updated_at = Date.now();
  await wallet.save().then( async aaa => {
    console.log('saved transaction in wallet')
  })
  await user.save().then(sss => {
    console.log("update user info")
  })
  return {
    msg: `Purchase completed!`,
    success: true,
  }
}

//STRIPE PAYMENT
const createStripePayment = async (req, res) => {
  const {amount, id} = req.body;

  try {

  const session = await stripe.checkout.sessions.create({ 
    payment_method_types: ["card"], 
    line_items: [ 
      { 
        price_data: { 
          currency: "eur", 
          product_data: { 
            name: id, 
          }, 
          unit_amount: amount * 100, 
        }, 
        quantity: 1, 
      }, 
    ], 
    mode: "payment", 
    success_url: req.protocol+"://"+req.headers.host+"/success-payment?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: req.protocol+"://"+req.headers.host+"/cancel-payment?session_id={CHECKOUT_SESSION_ID}",
  }); 
  res.json({ success: true, url: session.url });     
   
  } catch {
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
}
const executeStripePayment = async (req, res) => {
  const {product, user_id, session_id} = req.body;
  // const session = await stripe.checkout.sessions.retrieve(req.body.session_id);
  try {
    const save = await purchaseMemberShip({...product, user_id});
    if (save.success) res.json(save);
    else res.status(400).json(save);
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: err.message, success: false });
  }
}
//PAYPAL PAYMENT

// Create payment
const createPayPalPayment = (req, res) => {
  const {amount, id} = req.body;
  const paymentData = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": req.protocol+"://"+req.headers.host+"/success-payment",
          "cancel_url": req.protocol+"://"+req.headers.host+"/cancel-payment"
      },
      "transactions": [{
          "amount": {
              "currency": "EUR",
              "total": amount
          },
          "description": `Purchase Booing membership ${id}`
      }]
  };
  paypal.payment.create(paymentData, (error, payment) => {
      if (error) {
          console.log(error);
          res.status(500).send(error);
      } else {
          res.status(200).json(payment);
      }
  });
}
const executePayPalPayment = (req, res) => {
  const {paymentId, payerId, user_id, product} = req.body;
  console.log(paymentId, payerId, user_id)
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "EUR",
        "total": product.total
      }
    }]
  }  
  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
          res.status(500).send(error);
      } else {
          try {
            const save = await purchaseMemberShip({...product, user_id});
            if (save.success) res.json(save);
            else res.status(400).json(save);
          } catch (err) {
            console.log(err)
            res.status(500).json({ msg: err.message, success: false });
          }
      }
  });
}


const checkoutSpace = (req, res) => {}

module.exports = { 
  walletTransaction, 
  getWallet, 
  createStripePayment,
  executeStripePayment,
  createPayPalPayment,
  executePayPalPayment
};

const { Router } = require("express");
const router = Router();
const walletController = require('../../Controller/WalletController/walletController');

router.get('/booing/getWallet/:id', walletController.getWallet);
router.post('/booing/transaction', walletController.walletTransaction);
router.post('/booing/stripe/create-payment', walletController.createStripePayment)
router.post("/booing/stripe/execute-payment", walletController.executeStripePayment);
router.post('/booing/paypal/create-payment', walletController.createPayPalPayment)
router.post('/booing/paypal/execute-payment', walletController.executePayPalPayment)
router.all('/success-payment', (req, res) => {return res.json({success: true})})
router.all('/cancel-payment', (req, res) => {return res.json({success: false})})
module.exports = router;
const { Router } = require("express");
const router = Router();
const walletController = require('../../Controller/WalletController/walletController');

router.get('/booing/getWallet/:id', walletController.getWallet);
router.post('/booing/transaction', walletController.walletTransaction);
router.post('/booing/stripe-sheet/:user_id', walletController.stripeSheet)
module.exports = router;
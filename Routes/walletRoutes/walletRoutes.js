const { Router } = require("express");
const router = Router();
const walletController = require('../../Controller/WalletController/walletController');

router.get('/booing/getWallet/:id', walletController.getWallet);
router.post('/booing/transaction', walletController.walletTransaction);
module.exports = router;
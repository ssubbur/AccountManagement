/* eslint-disable no-param-reassign */
const express = require('express');
const accountsController = require('../controllers/accountsController');
const router = express.Router();

router.get('/accounts', 
            accountsController.validateCustomer,
            accountsController.getAccounts);
router.put('/accounts/transfer',
            accountsController.validateTransferAccounts,
            accountsController.withDraw,
            accountsController.deposit,
            accountsController.completeTransfer);
router.put('/accounts/withdraw',
            accountsController.validateCustomerAccounts,
            accountsController.withDraw,
            accountsController.completeTransaction);
router.put('/accounts/deposit',
            accountsController.validateCustomerAccounts,
            accountsController.deposit,
            accountsController.completeTransaction);


module.exports = router;

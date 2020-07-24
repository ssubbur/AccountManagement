const customers = require("../customers.json");
const currency = {
    USD: 0.50,
    MXN: 10.00
}

const getCustomer = (req, res) => {
    const customer = customers.find(customer => customer.customerId === req.body.customerId);
    if (customer) {
        return customer;
    }
    res.end();
}
const getAccounts = (req, res) => {
    const customer = customers.find(customer => customer.customerId === req.body.customerId);
    if (customer) {
        res.status(200);
        return res.send(customer.accounts);
    }
    res.end();
}
const completeTransaction = (req,res) => {
    return res.json(res.account);
}
const makeTransaction = (req, res, next) => {
    const request = req.body || req;
    const transactionType = req.params.transaction;
    const customer = customers.find(customer => customer.customerId === request.customerId);

    const accounts = customer.accounts
        .filter(account => account.accountNumber === request.accountId)
        .map(account => {
            const exchangeRate = (request.currency === 'CAD') ? 1 : (1 / currency[request.currency]);
            const exchangeAmount = Math.round(exchangeRate * parseFloat(request.amount) * 100) / 100;

            if (transactionType === "withdraw") {
                if (exchangeAmount <= account.balance) {
                    account.balance = account.balance - exchangeAmount;
                } else {
                    res.status(400);
                    return res.send("No enough balance to withdraw");
                }
            }
            if (transactionType === "deposit") {
                account.balance = account.balance + exchangeAmount;
            }
            res.status(201);
            res.success = true;
            res.customer = customer;
            res.account = account;
        });
    return next();
        
}
const completeTransfer = (req,res) => {
    return res.json(res.customer);
}
const withDraw = (req, res, next) => {
    const request = {
        customerId: req.body.customerId || req.body.fromCustomerId ,
        accountId: req.body.accountId || req.body.fromAccountId,
        amount: req.body.amount,
        currency: req.body.currency,
        params: {
            transaction: "withdraw"
        }
    }
    makeTransaction(request, res, next);
    /*const customer = customers.find(customer => customer.customerId === customerId);
    res.customer = customer;*/
    return next();
}
const deposit = (req, res, next) => {
    const request = {
        customerId: req.body.customerId || req.body.toCustomerId,
        accountId: req.body.accountId || req.body.toAccountId,
        amount: req.body.amount,
        currency: req.body.currency,
        params: {
            transaction: "deposit"
        }
    }
    makeTransaction(request, res, next);
    return next();
}

const validateCustomer = (req, res, next) => {
    console.log(req.body);
    const customer = customers.find(customer => customer.customerId === req.body.customerId);

    if (customer === undefined) {
        return res.status(400).send("Customer Not Found");
    }
    next();
}

const validateCustomerAccounts = (req, res, next) => {
    const customer = customers.find(customer => customer.customerId === req.body.customerId);
    const accountId = req.body.accountId;
    if (customer === undefined) {
         res.status(400);
         return res.send("Customer Not Found");
    }
    const accounts = customer.accounts.filter(account => account.accountNumber === accountId);

    if (accounts.length === 0) {
        res.status(400);
        return res.send("Invalid Account");
    }
    next();
}

const validateTransferAccounts = (req, res, next) => {
    const customer = customers.find(customer => customer.customerId === req.body.customerId);
    const fromAccountId = req.body.fromAccountId;
    const toccountId = req.body.toAccountId;
    if (customer === undefined) {
        return res.status(400).send("Customer Not Found");
    }
    const fromAccounts = customer.accounts.filter(account => account.accountNumber === fromAccountId);
    const toAccounts = customer.accounts.filter(account => account.accountNumber === toccountId);

    if (fromAccounts.length === 0) {
        return res.status(400).send("Invalid From Account");
    }
    if (toAccounts.length === 0) {
        return res.status(400).send("Invalid To Account");
    }
    next();
}
accountsController = () => {
    return { validateCustomer, 
            validateCustomerAccounts, 
            validateTransferAccounts,
            getAccounts,
            completeTransaction,
            withDraw,deposit,completeTransfer,getCustomer }
}


module.exports = accountsController();

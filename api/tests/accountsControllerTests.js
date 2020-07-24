const should = require('should');
const sinon = require('sinon');
const accountsController = require('../controllers/accountsController');

describe('Account Controller Tests:', () => {
  describe('Get Accounts List', () => {
    it('should return list of Accounts for the Customer', () => {

      const req = {
        body: {
          firstName: "Stewie",
          lasName: "Griffin",
          customerId: "777"
        }
      };
      const res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };

      accountsController.getAccounts(req, res);

      res.status.calledWith(200).should.equal(true, `OK ${res.status.args[0][0]}`);
      res.send.calledWith([{
        "accountNumber": "1234",
        "balance": 100
      }]).should.deepEqual(true, `OK ${res.status.args[0][0]}`);
    });
    it('Case1: Stewie Griffin deposits $300.00 USD to account number 1234. Should update balance to 700', () => {

      const req = {
        body: {
          customerId: "777",
          accountId: "1234",
          amount: 300,
          currency: "USD"
        },
        params: {
          transaction: "deposit"
        }
      };

      const res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };
      const next = sinon.spy();
      accountsController.deposit(req, res, next);
      accountsController.completeTransaction(req, res);
      account = res.json.firstCall.args[0];
      res.status.calledWith(201).should.equal(true, `OK ${res.status.args[0][0]}`);
      account.should.property("balance", 700);
      /*res.send.calledWith(
        {
          "accountNumber": "1234",
          "balance": 700}).should.deepEqual(true,"OK");*/
    });
    it(`Case 2: Glenn Quagmire withdraws $5,000.00 MXN from account number 2001. 
        Glenn Quagmire withdraws $12,500.00 USD from account number 2001. 
        Glenn Quagmire deposits $300.00 CAD to account number 2001. 
        Should update balance 9800`, () => {

      const req = {
        body: {
          customerId: "504",
          accountId: "2001",
          amount: 5000,
          currency: "MXN"
        },
        params: {
          transaction: "withdraw"
        }
      };
      const next = sinon.spy();
      const res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };
      accountsController.withDraw(req, res, next);

      req.body.amount = 12500;
      req.body.currency = "USD"
      accountsController.withDraw(req, res, next);

      req.body.amount = 300;
      req.body.currency = "CAD";
      accountsController.deposit(req, res, next);
      accountsController.completeTransaction(req, res);

      const account = res.json.firstCall.args[0];
      // res.status.calledWith(201).should.equal(true,`OK ${res.status.args[0][0]}`);
      account.should.property("accountNumber", "2001");
      account.should.property("balance", 9800);
    });

    it(`Case 3: Joe Swanson withdraws $5,000.00 CAD from account number 5500.
        Joe Swanson transfers $7,300.00 CAD from account number 1010 to account number 5500. 
        Joe Swanson deposits $13,726.00 MXN to account number 1010`, () => {
      const next = sinon.spy();
      const req = {
        body: {
          customerId: "002",
          accountId: "5500",
          amount: 5000,
          currency: "CAD"
        },
        params: {
          transaction: "withdraw"
        }
      };

      const res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };
      accountsController.withDraw(req, res, next);


      const transferReq = {
        body: {
          customerId: "002",
          fromAccountId: "1010",
          toAccountId: "5500",
          amount: 7300,
          currency: "CAD"
        }
      }
      accountsController.withDraw(transferReq, res, next);
      accountsController.deposit(transferReq, res, next);
      accountsController.completeTransfer(transferReq, res);

      req.body.accountId = "1010"
      req.body.amount = 13726;
      req.body.currency = "MXN";
      req.params.transaction = "deposit";
      accountsController.deposit(req, res, next)
      accountsController.completeTransaction(req, res);

      accountsController.getAccounts(req, res);
      const customer = res.json.firstCall.args[0];
      // res.status.calledWith(201).should.equal(true,`OK ${res.status.args[0][0]}`);
      customer.accounts[0].should.property("accountNumber", "1010");
      customer.accounts[0].should.property("balance", 1497.60);
      customer.accounts[1].should.property("accountNumber", "5500");
      customer.accounts[1].should.property("balance", 17300.00);
    });
    it(`Case 4: Peter Griffin withdraws $70.00 USD from account number 0123. 
        Lois Griffin deposits $23,789.00 USD to account number 0456. 
        Lois Griffin transfers $23.75 CAD from account number 0456 to Peter Griffin (account number 0123)`, () => {
      const next = sinon.spy();
      const req1 = {
        body: {
          customerId: "123",
          accountId: "0123",
          amount: 70,
          currency: "USD"
        },
        params: {
          transaction: "withdraw"
        }
      };
      const req2 = {
        body: {
          customerId: "456",
          accountId: "0456",
          amount: 23789.00,
          currency: "USD"
        },
        params: {
          transaction: "deposit"
        }
      };
      let res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };
      accountsController.withDraw(req1, res, next);
      accountsController.deposit(req2, res, next);

      const transferReq = {
        body: {
          fromCustomerId: "456",
          toCustomerId: "123",
          fromAccountId: "0456",
          toAccountId: "0123",
          amount: 23.75,
          currency: "CAD"
        }
      }
      accountsController.withDraw(transferReq, res, next);
      accountsController.deposit(transferReq, res, next);
      accountsController.completeTransfer(transferReq, res);

      const customer1 = accountsController.getCustomer(req1, res);
      const getReq2 = {
        body: {
          customerId: "456"
        }
      }
      const customer2 = accountsController.getCustomer(getReq2, res);
      customer1.accounts[0].should.property("accountNumber", "0123");
      customer1.accounts[0].should.property("balance", 33.75);
      customer2.accounts[0].should.property("accountNumber", "0456");
      customer2.accounts[0].should.property("balance", 112554.25);
    });
    it(`Case 5: Famous social engineer and thief John Shark (Customer ID 219) attempts to withdraw $100 USD from account 1010.
        The bank determines that the account is not John’s and refuses to give him the money.`, () => {
      const next = sinon.spy();
      const req = {
        body: {
          customerId: "219",
          accountId: "1010",
          amount: 100,
          currency: "USD"
        },
        params: {
          transaction: "withdraw"
        }
      };
      
      const res = {
        status: sinon.spy(),
        send: sinon.spy(),
        json: sinon.spy()
      };
      accountsController.validateCustomerAccounts(req, res, next);

      res.status.calledWith(400).should.equal(true, `Bad Request ${res.status.args[0][0]}`);
    });
  });
});

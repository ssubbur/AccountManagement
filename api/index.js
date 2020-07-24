const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const accountRouter = require('./routes/accountRouter');
const customers = require("./customers.json");

app.use(bodyParser.json());
app.use(cors());

app.get('/customers', (req,res) => {
    res.send(customers);
});

app.get('/customers/:customerId', (req, res) => {
    const customer = customers.find(customer => customer.customerId === req.params.customerId);

    if(customer){
        res.send(customer);
    }else{
        res.send('Customer Not Found');
    }

  });
app.use(accountRouter);

app.listen(4000,() =>{
    console.log('Accounts Service listening on 4000');
});

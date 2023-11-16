require('dotenv').config();
const express = require('express');
const { createInvoice, pay, authenticatedLndGrpc, getPayment, getInvoice } = require('ln-service');
const { bech32 } = require('bech32');
const app = express();

const port = process.env.PORT || 3000;

const { lnd } = authenticatedLndGrpc({
  cert: process.env.LND_CERT,
  macaroon: process.env.LND_MACAROON,
  socket: process.env.LND_SOCKET
});

const invoiceStore = [];

app.get('/generate-ln-invoice', async (req, res) => {
  const { amount } = req.query;

  if (!amount) {
    return res.status(400).send('Amount is required');
  }

  try {
    const invoice = await createInvoice({ lnd, tokens: parseInt(amount) });
    invoiceStore.push(invoice.id)
    console.log(invoiceStore)
    
    res.json({ invoice: `ln:${invoice.request}` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/get-ln-status', async (req, res) => {
  try {
    const invoice = await getInvoice({id: invoiceStore[0], lnd: lnd})
    res.json({ status: invoice });
  } catch (error) {
    console.error('Error processing invoice:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`LNURL API server running at http://localhost:${port}`);
});
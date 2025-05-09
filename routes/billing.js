const express = require("express");
const router = express.Router();
const billing = require("../services/billing");

router.post("/getsubscriptioninvoice", async function (req, res, next) {
  try {
    res.json(await billing.getSubscriptionInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getsalesinvoice", async function (req, res, next) {
  try {
    res.json(await billing.getSalesInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the recurring invocie: ${er}`);
    next(er);
  }
});

router.post("/getvoucher", async function (req, res, next) {
  try {
    res.json(await billing.getVouchers(req.body));
  } catch (er) {
    console.log(`Error while Fetching the created vouchers: ${er}`);
    next(er);
  }
});

router.post("/consolidateledger", async function (req, res, next) {
  try {
    res.json(await billing.ConsolidateLedger(req.body));
  } catch (er) {
    console.log(`Error while Fetching the consolidate ledger: ${er}`);
    next(er);
  }
});

module.exports = router;

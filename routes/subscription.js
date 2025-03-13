const express = require("express");
const router = express.Router();
const subscription = require("../services/subscription");

router.post("/addrecurringinvoice", async function (req, res, next) {
  try {
    res.json(await sales.addRecurringInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getrecurredinvoice", async function (req, res, next) {
  try {
    res.json(await sales.GetRecurredInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Recurred invoice : ${er}`);
    next(er);
  }
});

module.exports = router;

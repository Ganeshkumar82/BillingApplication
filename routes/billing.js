const express = require("express");
const router = express.Router();
const subscription = require("../services/subscription");

router.post("/getsubscriptioninvoice", async function (req, res, next) {
  try {
    res.json(await billing.getSubscriptionInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Recurring invoice : ${er}`);
    next(er);
  }
});
module.exports = router;

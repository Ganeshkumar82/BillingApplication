const express = require("express");
const router = express.Router();
const subscription = require("../services/subscription");

router.post("/addrecurringinvoice", async function (req, res, next) {
  try {
    res.json(await subscription.addRecurringInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getrecurredinvoice", async function (req, res, next) {
  try {
    res.json(await subscription.GetRecurredInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Recurred invoice : ${er}`);
    next(er);
  }
});

router.post("/getprocesslist", async function (req, res, next) {
  try {
    res.json(await subscription.GetProcessList(req.body));
  } catch (er) {
    console.error(
      `Error while Fetching the subscription process list: ${er.message}`
    );
    next(er);
  }
});

router.post("/addfeedback", async function (req, res, next) {
  try {
    res.json(await subscription.addFeedback(req.body));
  } catch (er) {
    console.error(`Error while Fetching the feedback : ${er.message}`);
    next(er);
  }
});

router.post("/getprocesscustomer", async function (req, res, next) {
  try {
    res.json(await subscription.GetProcessCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the process customer: ${er}`);
    next(er);
  }
});

router.post("/getbinaryfile", async function (req, res, next) {
  try {
    res.json(await subscription.getBinaryFile(req.body));
  } catch (er) {
    console.log(`Error while getting the binary file : ${er}`);
    next(er);
  }
});

router.post("/deleteprocess", async function (req, res, next) {
  try {
    res.json(await subscription.DeleteProcess(req.body));
  } catch (er) {
    console.log(`Error while deleting the process : ${er}`);
    next(er);
  }
});

router.post("/archiveprocess", async function (req, res, next) {
  try {
    res.json(await subscription.ArchiveProcess(req.body));
  } catch (er) {
    console.log(`Error while Archiving the process : ${er}`);
    next(er);
  }
});

router.post("/clientprofile", async function (req, res, next) {
  try {
    res.json(await subscription.clientProfile(req.body));
  } catch (er) {
    console.log(`Error while getting the client profile : ${er}`);
    next(er);
  }
});

router.post("/approvedquotation", async function (req, res, next) {
  try {
    res.json(await subscription.approvedQuotation(req.body));
  } catch (er) {
    console.log(`Error while getting the approved quotation : ${er}`);
    next(er);
  }
});

router.post("/uploadmor", async function (req, res, next) {
  try {
    res.json(await subscription.uploadMor(req, res, next));
  } catch (er) {
    console.log(`Error while uploading mor: ${er}`);
    next(er);
  }
});

router.post("/addsubscus", async function (req, res, next) {
  try {
    res.json(await subscription.addSubscriptionCustomerreq(req, res, next));
  } catch (er) {
    console.log(
      `Error while adding the Subscription Customer requirement: ${er}`
    );
    next(er);
  }
});

router.post("/subscriptiondata", async function (req, res, next) {
  try {
    res.json(await subscription.Subscriptiondata(req.body));
  } catch (er) {
    console.log(`Error while getting the subscription data : ${er}`);
    next(er);
  }
});

router.post("/detailspreloader", async function (req, res, next) {
  try {
    res.json(await subscription.detailsPreLoader(req.body));
  } catch (er) {
    console.log(
      `Error while fetching the auto generated id for the events: ${er}`
    );
    next(er);
  }
});

router.post("addquotation", async function (req, res, next) {
  try {
    res.json(await subscription.AddQuotation(req.body));
  } catch (er) {
    console.log(`Error while adding the quotation : ${er}`);
    next(er);
  }
});

router.post("/addcustominvoice", async function (req, res, next) {
  try {
    res.json(await subscription.addCustomInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Custom Recurring invoice : ${er}`);
    next(er);
  }
});
module.exports = router;

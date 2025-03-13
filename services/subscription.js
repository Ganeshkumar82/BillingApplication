const db = require("../db");
const helper = require("../helper");
const config = require("../config");
const multer = require("multer");
const uploadFile = require("../middleware");
const fs = require("fs");
const mailer = require("../mailer");
const axios = require("axios");
const path = require("path");
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##################################################################################################################################################################################################

async function addRecurringInvoice(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadrecurringinvoicepdf(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD RECURRING INVOICE"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD RECURRING INVOICE",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("siteids") || querydata.siteids == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Site id missing. Please provide the Site id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("subscriptionbillid") ||
      querydata.subscriptionbillid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription bill id missing. Please provide the Subscription bill id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddressname") ||
      querydata.clientaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address name missing. Please provide the Client address name missing",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddress") ||
      querydata.clientaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address missing. Please provide the Client address",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("billingaddressname") ||
      querydata.billingaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address name missing. Please provide the Billing Address name",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("billingaddress") ||
      querydata.billingaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address missing. Please provide the Billing address.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("planname") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("totalamount") ||
      querydata.totalamount == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Total amount missing. Please provide the total amount.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("invoicegenid") ||
      querydata.invoicegenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice Generated id missing. Please provide the invoice generated id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice date missing. Please provide the invoice date.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("messagetype") ||
      querydata.messagetype == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Message type missing. Please provide the message type.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
      [
        querydata.subscriptionbillid,
        querydata.siteids,
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        req.file.path,
        querydata.invoicegenid,
        querydata.totalamount,
        userid,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const invoiceid = objectvalue2["@sprocessid"];
    var Quoteid;

    const sql = await db.query(
      `Update Generatesubinvoiceid set status = 0 where subinvoice_id IN('${querydata.invoicegenid}')`
    );
    if (querydata.messagetype == 1 || querydata.messagetype == 3) {
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
      WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
        phoneno: querydata.phoneno,
        feedback: querydata.feedback,
        pdfpath: req.file.path,
      });
      if (WhatsappSent.data.code == true) {
        WhatsappSent = WhatsappSent.data.code;
      } else {
        WhatsappSent = WhatsappSent.data.code;
      }
    }
    const promises = [];
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())
          .filter((num) => num !== "") // Removes empty values
      : [];
    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: number,
                feedback: querydata.feedback,
                pdfpath: req.file.path,
              }
            );
            return response.data.code;
          } catch (error) {
            console.error(`WhatsApp Error for ${number}:`, error.message);
            return false;
          }
        })
      );
    } else if (querydata.messagetype === 3) {
      // Send both email & WhatsApp in parallel
      promises.push(
        mailer.sendInvoice(
          querydata.clientaddressname,
          querydata.emailid,
          "Your invoice from Sporada Secure India Private Limited",
          "invoicepdf.html",
          ``,
          "INVOICE_PDF_SEND",
          req.file.path,
          querydata.invoicegenid,
          querydata.date,
          querydata.totalamount,
          querydata.ccemail,
          querydata.feedback
        )
      );

      promises.push(
        Promise.all(
          phoneNumbers.map(async (number) => {
            try {
              const response = await axios.post(
                `${config.whatsappip}/billing/sendpdf`,
                {
                  phoneno: number,
                  feedback: querydata.feedback,
                  pdfpath: req.file.path,
                }
              );
              return response.data.code;
            } catch (error) {
              console.error(`WhatsApp Error for ${number}:`, error.message);
              return false;
            }
          })
        ).then((results) => (WhatsappSent = results))
      );

      // Run both requests in parallel and wait for completion
      [EmailSent] = await Promise.all(promises);

      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Invoice added Successfully",
        { EmailSent: EmailSent, WhatsappSent: WhatsappSent },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetRecurredInvoice(req) {
  try {
    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD RECURRING INVOICE",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("siteids") || querydata.siteids == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Site id missing. Please provide the Site id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("subscriptionbillid") ||
      querydata.subscriptionbillid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription bill id missing. Please provide the Subscription bill id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddressname") ||
      querydata.clientaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address name missing. Please provide the Client address name missing",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddress") ||
      querydata.clientaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address missing. Please provide the Client address",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("billingaddressname") ||
      querydata.billingaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address name missing. Please provide the Billing Address name",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("billingaddress") ||
      querydata.billingaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address missing. Please provide the Billing address.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("planname") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("totalamount") ||
      querydata.totalamount == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Total amount missing. Please provide the total amount.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("invoicegenid") ||
      querydata.invoicegenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice Generated id missing. Please provide the invoice generated id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice date missing. Please provide the invoice date.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("messagetype") ||
      querydata.messagetype == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Message type missing. Please provide the message type.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
      [
        querydata.subscriptionbillid,
        querydata.siteids,
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        req.file.path,
        querydata.invoicegenid,
        querydata.totalamount,
        userid,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const invoiceid = objectvalue2["@sprocessid"];
    var Quoteid;

    const sql = await db.query(
      `Update Generatesubinvoiceid set status = 0 where subinvoice_id IN('${querydata.invoicegenid}')`
    );
    if (querydata.messagetype == 1 || querydata.messagetype == 3) {
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
      WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
        phoneno: querydata.phoneno,
        feedback: querydata.feedback,
        pdfpath: req.file.path,
      });
      if (WhatsappSent.data.code == true) {
        WhatsappSent = WhatsappSent.data.code;
      } else {
        WhatsappSent = WhatsappSent.data.code;
      }
    }
    const promises = [];
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())
          .filter((num) => num !== "") // Removes empty values
      : [];
    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: number,
                feedback: querydata.feedback,
                pdfpath: req.file.path,
              }
            );
            return response.data.code;
          } catch (error) {
            console.error(`WhatsApp Error for ${number}:`, error.message);
            return false;
          }
        })
      );
    } else if (querydata.messagetype === 3) {
      // Send both email & WhatsApp in parallel
      promises.push(
        mailer.sendInvoice(
          querydata.clientaddressname,
          querydata.emailid,
          "Your invoice from Sporada Secure India Private Limited",
          "invoicepdf.html",
          ``,
          "INVOICE_PDF_SEND",
          req.file.path,
          querydata.invoicegenid,
          querydata.date,
          querydata.totalamount,
          querydata.ccemail,
          querydata.feedback
        )
      );

      promises.push(
        Promise.all(
          phoneNumbers.map(async (number) => {
            try {
              const response = await axios.post(
                `${config.whatsappip}/billing/sendpdf`,
                {
                  phoneno: number,
                  feedback: querydata.feedback,
                  pdfpath: req.file.path,
                }
              );
              return response.data.code;
            } catch (error) {
              console.error(`WhatsApp Error for ${number}:`, error.message);
              return false;
            }
          })
        ).then((results) => (WhatsappSent = results))
      );

      // Run both requests in parallel and wait for completion
      [EmailSent] = await Promise.all(promises);

      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Invoice added Successfully",
        { EmailSent: EmailSent, WhatsappSent: WhatsappSent },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

module.exports = {
  addRecurringInvoice,
  GetRecurredInvoice,
};

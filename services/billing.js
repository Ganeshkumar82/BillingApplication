const db = require("../db");
const helper = require("../helper");
const config = require("../config");
const multer = require("multer");
const uploadFile = require("../middleware");
const fs = require("fs-extra");
const mailer = require("../mailer");
const moment = require("moment");
const axios = require("axios");
const path = require("path");
const mqttclient = require("../mqttclient");
const { Console } = require("console");

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function getSubscriptionInvoice(billing) {
  try {
    if (!billing.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH SUBSCRIPTION INVOICE",
        ""
      );
    }
    secret = billing.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH SUBSCRIPTION INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SUBSCRIPTION INVOICE",
        secret
      );
    }
    var sql = [];
    // Check if querystring is provided
    if (!billing.querystring) {
      sql = await db.query(
        `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
        ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date from subscriptionbillmaster sbm
         JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid where sbm.Email_sent = 1 and sbm.status = 1;`
      );
    } else {
      // Decrypt querystring
      try {
        querydata = await helper.decrypt(billing.querystring, secret);
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
      if (querydata.hasOwnProperty("customerid") == false) {
        return helper.getErrorResponse(
          false,
          "error",
          "Customer id missing. Please provide the customer id",
          "ADD RECURRING INVOICE",
          secret
        );
      }
      sql = await db.query(
        `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
        ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date from subscriptionbillmaster sbm
         JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid where sbm.Email_sent = 1 and sbm.status = 1 and sbm.customer_id = ?`,
        [querydata.customerid]
      );
    }

    if (sql.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "The generated Recurring Invoice is successfully fetched.",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "The generated Recurring Invoice is successfully fetched.",
        sql,
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
  getSubscriptionInvoice,
};

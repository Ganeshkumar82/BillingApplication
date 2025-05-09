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

//###############################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################

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
        ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,sbm.Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,CASE WHEN CURDATE() > sbm.Due_date THEN DATEDIFF(CURDATE(), sbm.Due_date) ELSE 0 END AS overdue_days,CASE WHEN CURDATE() > sbm.Due_date THEN 1 ELSE 0 END AS is_overdue from subscriptionbillmaster sbm JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`
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
      var sqlParams = [];
      let query = `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
    ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,sbm.Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,cvm.voucher_number,CASE WHEN CURDATE() > sbm.Due_date THEN DATEDIFF(CURDATE(), sbm.Due_date) ELSE 0 END AS overdue_days,CASE WHEN CURDATE() > sbm.Due_date THEN 1 ELSE 0 END AS is_overdue from subscriptionbillmaster sbm
    JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`;
      if (
        querydata.customerid != 0 &&
        querydata.customerid != undefined &&
        querydata.customerid != null
      ) {
        query += ` AND Processid in(select cprocess_id from salesprocessmaster where customer_id = ?)`;
        sqlParams.push(querydata.customerid);
      } else if (
        querydata.startdate != null &&
        querydata.startdata != 0 &&
        querydata.startdate != undefined &&
        querydata.enddate != null &&
        querydata.enddate != 0 &&
        querydata.enddate != undefined
      ) {
        query += ` AND salesprocess_date BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      } else if (
        querydata.paymentstatus != null &&
        querydata.paymentstatus != undefined
      ) {
        if (querydata.paymentstatus == 0) {
          query += ` AND salesprocess_date BETWEEN ? and ?`;
          sqlParams.push(querydata.startdate, querydata.enddate);
        } else if (querydata.paymentstatus == 1) {
          query += ` AND salesprocess_date BETWEEN ? and ?`;
          sqlParams.push(querydata.startdate, querydata.enddate);
        }
      }
      sql = await db.query(query, sqlParams);
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

//###############################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################

async function getSalesInvoice(billing) {
  try {
    if (!billing.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH SALES INVOICE",
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
        "FETCH SALES INVOICE",
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
        "FETCH SALES INVOICE",
        secret
      );
    }
    var sql = [];
    // Check if querystring is provided
    if (!billing.querystring) {
      sql = await db.query(
        `select spl.cprocess_id event_id,spl.cprocess_gene_id invoicenumber,spl.custsales_name client_addressname, spl.client_address, spl.billingaddress_name billing_addressname,spl.billing_address,spl.gst_number gstnumber,spl.email_id,
        spl.phone_number phone_no, spl.ccemail, spl.invoice_amount, spl.processid,spl.salesprocess_date date,cvm.voucher_id,cvm.voucher_number from
        salesprocesslist spl JOIN clientvouchermaster cvm ON cvm.invoice_number = spl.cprocess_gene_id where spl.process_type = 4 and spl.status = 1;`
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
          "ADD SALES INVOICE",
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
          "ADD SALES INVOICE",
          secret
        );
      }
      var sqlParams = [];
      let query = `select spl.cprocess_id event_id,spl.cprocess_gene_id invoicenumber,spl.custsales_name client_addressname, spl.client_address, spl.billingaddress_name billing_addressname,spl.billing_address,spl.gst_number gstnumber,spl.email_id,
      spl.phone_number phone_no, spl.ccemail, spl.invoice_amount, spl.processid,spl.salesprocess_date date,cvm.voucher_id from
      salesprocesslist spl JOIN clientvouchermaster cvm ON cvm.invoice_number = spl.cprocess_gene_id where spl.process_type = 4 and spl.status = 1`;

      if (
        querydata.customerid != 0 &&
        querydata.customerid != undefined &&
        querydata.customerid != null
      ) {
        query += ` AND spl.Processid in(select cprocess_id from salesprocessmaster where customer_id = ?)`;
        sqlParams.push(querydata.customerid);
      } else if (
        querydata.startdate != null &&
        querydata.startdata != 0 &&
        querydata.startdate != undefined &&
        querydata.enddate != null &&
        querydata.enddate != 0 &&
        querydata.enddate != undefined
      ) {
        query += ` AND spl.salesprocess_date BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      } else if (
        querydata.paymentstatus != null &&
        querydata.paymentstatus != undefined
      ) {
        if (querydata.paymentstatus == 0) {
          query += ` AND spl.spl.payment BETWEEN ? and ?`;
          sqlParams.push(querydata.startdate, querydata.enddate);
        } else if (querydata.paymentstatus == 1) {
          query += ` AND spl.salesprocess_date BETWEEN ? and ?`;
          sqlParams.push(querydata.startdate, querydata.enddate);
        }
      }
      sql = await db.query(query, sqlParams);
    }

    if (sql.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "The Sales invoice is successfully fetched.",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "The Sales Invoice is successfully fetched.",
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
  getSalesInvoice,
};

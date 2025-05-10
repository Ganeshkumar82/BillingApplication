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
      }
      if (
        querydata.startdate != null &&
        querydata.startdata != 0 &&
        querydata.startdate != undefined &&
        querydata.enddate != null &&
        querydata.enddate != 0 &&
        querydata.enddate != undefined
      ) {
        query += ` AND salesprocess_date BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
      if (
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
      if (
        querydata.duedays != null &&
        querydata.duedays != undefined &&
        querydata.duedays > 0
      ) {
        query += ` AND DATEDIFF(CURDATE(), sbm.Due_date) >= ?`;
        sqlParams.push(querydata.duedays);
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
          query += ` AND spl.payment_status = 0`;
        } else if (querydata.paymentstatus == 1) {
          query += ` AND spl.payment_status = 1`;
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getBinaryFile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET BINARY DATA FOR PDF",
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
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("recurredbillid") ||
      querydata.recurredbillid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Recurred bill id missing. Please provide the Recurred bill",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select pdf_path from subscriptionbillgenerated where subscription_generatedid = ?`,
      [querydata.recurredbillid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].pdf_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].pdf_path);
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        binarydata,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        { binarydata: data },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getVouchers(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET VOUCHERS",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET VOUCHERS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET VOUCHERS",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `select invoice_number,voucher_type,name, email_id, phone_number,client_name,client_address,pending_amount,fully_cleared,partial_cleared,gstnumber,Total_amount,sub_total,IGST,CGST,SGST,voucher_number from clientvouchermaster where status = 1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET VOUCHERS",
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
        "GET VOUCHERS",
        secret
      );
    }

    sql = `select invoice_number,voucher_type,name, email_id, phone_number,client_name,client_address,pending_amount,fully_cleared,partial_cleared,gstnumber,Total_amount,sub_total,IGST,CGST,SGST,voucher_number,invoice_type from clientvouchermaster where status = 1`;

    if (
      querydata.vouchertype != null &&
      querydata.vouchertype != 0 &&
      querydata.vouchertype != undefined
    ) {
      if (querydata.vouchertype == "payment") {
        sql += ` and voucher_type LIKE '%payment%'`;
      } else if (querydata.vouchertype == "receipt") {
        sql += ` and voucher_type LIKE '%receipt%'`;
      } else {
        sql += ` and voucher_type LIKE '%consolidate%'`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and invoice_type like '%sales%'`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and invoice_type like '%subscription%'`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and invoice_type like '%vendor%'`;
      }
    }
    console.log(sql);
    // if (
    //   querystring.clientname != null &&
    //   querydata.clientname != 0 &&
    //   querydata.clientname != undefined
    // ) {
    // }
    const query = await db.query(sql, sqlParams);
    if (query[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers fetched Successfully",
        query,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers fetched Successfully",
        query,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function ClearVouchers(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CLEAR VOUCHERS",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "CLEAR VOUCHERS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CLEAR VOUCHERS",
        secret
      );
    }
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CLEAR VOUCHERS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLEAR VOUCHERS",
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
        "CLEAR VOUCHERS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("voucherid") || querydata.voucherid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Voucher id missing. Please provide the Voucher id",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    if (query[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers Cleared Successfully",
        query,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers Cleared Successfully",
        query,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

module.exports = {
  getSubscriptionInvoice,
  getSalesInvoice,
  getBinaryFile,
  getVouchers,
  ClearVouchers,
};

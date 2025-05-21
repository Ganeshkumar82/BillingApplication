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
const { el } = require("date-fns/locale");

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

async function getTransactionFile(subscription) {
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
      !querydata.hasOwnProperty("transactionid") ||
      querydata.transactionid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Transaction id missing. Please provide the transaction id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select file_path from vouchertransactions where vouchertrans_id = ?`,
      [querydata.transactionid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].file_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].file_path);
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
      sql = `SELECT voucher_id,invoice_number,voucher_type,email_id,phone_number,client_name,client_address, pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,
      IGST,CGST,SGST,voucher_number,invoice_type,customer_id,CASE WHEN invoice_type IN ('sales', 'subscription') THEN 1 WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount, payment_details, Description,DATE(Row_updated_date) as date FROM clientvouchermaster WHERE status = 1`;
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

    sql = `SELECT voucher_id,invoice_number,voucher_type,email_id,phone_number,client_name,client_address, pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,
    IGST,CGST,SGST,voucher_number,invoice_type,customer_id,CASE WHEN invoice_type IN ('sales', 'subscription') THEN 1 WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount, payment_details,Description, DATE(Row_updated_date) as date FROM clientvouchermaster WHERE status = 1`;

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
      querydata.paymentstatus != null &&
      querydata.paymentstatus != 0 &&
      querydata.paymentstatus != undefined
    ) {
      if (querydata.paymentstatus == "partial") {
        sql += ` and voucher_type LIKE '%payment%'`;
      } else if (querydata.paymentstatus == "complete") {
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
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and customer_id = ?`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    }

    console.log(sql);
    var query = await db.query(sql, sqlParams);
    // if (query[0] && Array.isArray(query)) {
    //   query = query.map((row) => {
    //     if (row.invoice_type == "sales" || row.invoice_type == "subscription") {
    //       row.tds_calculation = 1;
    //     }
    //     return row;
    //   });
    // }

    if (query.length > 0) {
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
//#####
async function ClearVouchers(req, res, next) {
  let secret, querydata, billing;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
      // Check if the session token exists
      if (!billing.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "CLEAR VOUCHERS",
          ""
        );
      }
      secret = billing.STOKEN.substring(0, 16);
      querydata;
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
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
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
    if (!billing.querystring) {
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
    const requiredFields = [
      { field: "voucherid", message: "Voucher id missing." },
      { field: "vouchernumber", message: "Voucher number missing." },
      { field: "paymentstatus", message: "Payment status missing." },
      { field: "IGST", message: "IGST missing." },
      { field: "SGST", message: "SGST missing." },
      { field: "CGST", message: "CGST missing." },
      { field: "tds", message: "tds deductions missing." },
      {
        field: "grossamount",
        message: "totalamount missing.",
      },
      {
        field: "subtotal",
        message: "Sub total missing.",
      },
      { field: "date", message: "Date missing" },
      { field: "paidamount", message: "Paid amount missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "invoicenumber", message: "Invoice number missing." },
      { field: "emailid", message: "Email id missing." },
      { field: "phoneno", message: "Phone no missing." },
      { field: "tdsstatus", message: "TDS status missing." },
      { field: "invoicetype", message: "Invoice type missing." },
      { field: "gstnumber", message: "GST number missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "transactiondetails", message: "Transaction details missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLEAR VOUCHERS",
          secret
        );
      }
    }
    let totalamount = querydata.grossamount || 0;
    let subtotal = querydata.subtotal || 0;
    let IGST = querydata.IGST || 0;
    let CGST = querydata.CGST || 0;
    let SGST = querydata.SGST || 0;
    let tdsamount = 0;
    let partially = 0;
    var paymentdetails = null;
    var description = null;
    var transactionid = 0;
    try {
      var path = null;
      if (req.file != null) {
        path = req.file.path;
      }
      const [sql50] = await db.spcall(
        `CALL InsertVoucherTransaction(?, ?, ?, ?, ?, ?, ?,@transaction_id);select @transaction_id;`,
        [
          querydata.voucherid,
          querydata.vouchernumber,
          querydata.paidamount,
          querydata.transactiondetails,
          path || null,
          querydata.paymentstatus,
          querydata.tdsstatus,
        ]
      );
      const objectvalue = sql50[1][0];
      transactionid = objectvalue["@transaction_id"];
    } catch (er) {
      console.log(er);
    }
    try {
      var pending_amount = 0;
      if (querydata.paymentstatus == "partial") {
        const sql9 = await db.query(
          `select Pending_amount from clientvouchermaster where voucher_id = ?`,
          [querydata.voucherid]
        );
        if (sql9.length > 0) {
          const pending_amount = parseFloat(sql9[0].Pending_amount || 0);
          const updatedPending =
            pending_amount - parseFloat(querydata.paidamount || 0);
          if (updatedPending <= 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "Partial payment cannot be the same as the total amount. Please clear the Voucher in FULL payment",
              "CLEAR THE VOUCHER",
              secret
            );
          }
        }
        const sql = await db.query(
          `UPDATE clientvouchermaster SET  partially_cleared = 1, Pending_amount = Pending_amount - ?, paid_amount = paid_amount + ? ,payment_details = JSON_ARRAY_APPEND( IFNULL(payment_details, JSON_ARRAY()), '$', 
           JSON_OBJECT('date', NOW(), 'amount', ?, 'transanctiondetails',?,'feedback',?,'transactionid',?)),cleared_date = ? WHERE voucher_id = ? and fully_cleared != 1 and total_amount > ? and pending_amount > 0`,
          [
            querydata.paidamount,
            querydata.paidamount,
            querydata.paidamount,
            querydata.transactiondetails,
            querydata.feedback,
            transactionid,
            querydata.date,
            querydata.voucherid,
            querydata.paidamount,
          ]
        );
        if (sql.changedRows > 0) {
          partially = 1;
          if (querydata.invoicetype == "sales") {
            const sql1 = await db.query(
              `Update salesprocesslist SET payment_status = 2, Paid_amount = Paid_amount + ? where invoice_number = ? and payment_status != 1`,
              [querydata.paidamount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "subscription") {
            const sql2 = await db.query(
              `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 2,sbm.Paidamount =sbm.Paidamount + ?, 
           sbm.pendingpayments = ? WHERE sbg.invoice_no = ? and sbg.payment_status != 1
          `,
              [querydata.paidamount, pending_amount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "vendor") {
          }
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Voucher not cleared",
            querydata.vouchernumber,
            secret
          );
        }
      } else if (querydata.paymentstatus == "complete") {
        if (querydata.tdsstatus) {
          tdsamount = Math.round(querydata.subtotal * 0.02);
        } else {
          tdsamount = 0;
        }

        const sql = await db.query(
          `UPDATE clientvouchermaster SET fully_cleared = 1, partially_cleared = 0,Pending_amount = 0,paid_amount = paid_amount + ?,payment_details = JSON_ARRAY_APPEND(
               COALESCE(
                 NULLIF(payment_details, ''), 
                 JSON_ARRAY()
               ), 
               '$', 
               JSON_OBJECT(
                 'date', ?, 
                 'amount', ?, 
                 'transanctiondetails', ?,
                 'transactionid',?,
                 'feedback',? )),cleared_date = ? WHERE voucher_id = ? AND ROUND(Total_amount) = ROUND(paid_amount + ? + ?)`,
          [
            querydata.paidamount,
            querydata.date,
            querydata.paidamount,
            querydata.transactiondetails,
            transactionid,
            querydata.feedback,
            querydata.date,
            querydata.voucherid,
            querydata.paidamount,
            tdsamount,
          ]
        );
        if (sql.changedRows > 0) {
          const sql43 = await db.query(
            `select payment_details,description from clientvouchermaster where voucher_id = ?`,
            [querydata.voucherid]
          );
          if (sql43.length > 0) {
            paymentdetails = sql43[0].payment_details;
            description = sql43[0].description;
          }
          if (querydata.invoicetype == "sales") {
            const sql1 = await db.query(
              `Update salesprocesslist SET Paid_amount = Paid_amount + ?,payment_status = 1 where cprocess_gene_id = ?`,
              [querydata.paidamount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "subscription") {
            const sql2 = await db.query(
              `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 1,sbm.Paidamount =sbm.Paidamount + ? 
        WHERE sbg.invoice_no = ?
          `,
              [querydata.paidamount, querydata.invoicenumber]
            );
            if (querydata.tdsstatus == true) {
              const [sql4] = await db.spcall(
                `CALL upsert_tdsledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  querydata.voucherid,
                  querydata.vouchernumber,
                  querydata.clientaddressname,
                  querydata.IGST,
                  querydata.CGST,
                  querydata.SGST,
                  querydata.grossamount,
                  querydata.subtotal,
                  tdsamount,
                  querydata.gstnumber,
                  "receivable",
                  description,
                  JSON.stringify(paymentdetails),
                  JSON.stringify({
                    gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                    tds: tdsamount || 0,
                    total: totalamount || 0,
                    subtotal: subtotal || 0,
                  }),
                ]
              );
            }
          } else if (querydata.invoicetype == "vendor") {
          }
          const [sql5] = await db.spcall(
            `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              querydata.voucherid,
              querydata.vouchernumber,
              querydata.clientaddressname,
              querydata.IGST,
              querydata.CGST,
              querydata.SGST,
              querydata.grossamount,
              querydata.subtotal,
              querydata.gstnumber,
              "output",
              description,
              JSON.stringify(paymentdetails),
              JSON.stringify({
                gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                tds: tdsamount || 0,
                total: totalamount || 0,
                subtotal: subtotal || 0,
              }),
            ]
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Paid Amount not matching the total amount.",
            querydata.vouchernumber,
            secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Voucher not cleared",
          querydata.vouchernumber,
          secret
        );
      }
    } catch (er) {
      const sql6 = await db.query(
        `delete from gstledger where voucher_number = ?`,
        [querydata.vouchernumber]
      );
      const sql7 = await db.query(
        `DELETE FROM tdsledger WHERE voucher_number = ?`,
        [querydata.vouchernumber]
      );

      return helper.getErrorResponse(
        false,
        "error",
        "Error clearing the Voucher",
        querydata.vouchernumber,
        secret
      );
    }
    try {
      const sql9 = await db.spcall(
        `CALL SP_CREDIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid;`,
        [
          querydata.invoicenumber,
          querydata.clientaddressname,
          JSON.stringify({
            gst: { IGST: IGST, SGST: SGST, CGST: CGST },
            tds: tdsamount || 0,
            total: totalamount || 0,
            subtotal: subtotal || 0,
          }),
          JSON.stringify({
            amount: querydata.paidamount,
            transactiondetails: querydata.transactiondetails,
            date: querydata.date,
            feedback: querydata.feedback,
            tdsamount: tdsamount,
          }),
          querydata.gstnumber,
          querydata.paidamount,
          subtotal,
          IGST,
          CGST,
          SGST,
          tdsamount,
          "subscription",
          querydata.voucherid,
          querydata.vouchernumber,
          "receivable",
          description,
          partially,
        ]
      );
    } catch (er) {
      console.log(er);
    }
    await mqttclient.publishMqttMessage(
      "refresh",
      "Voucher Cleared Successfully"
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Voucher Cleared Successfully",
      querydata.vouchernumber,
      secret
    );
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
//#####
async function ClearConsolidateVouchers(req, res, next) {
  let secret, querydata1, billing;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
      // Check if the session token exists
      if (!billing.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "CLEAR CONSOLIDATE VOUCHERS",
          ""
        );
      }
      secret = billing.STOKEN.substring(0, 16);
      querydata;
      // Validate session token length
      if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
          "CLEAR CONSOLIDATE VOUCHERS",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
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
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }
    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata1 = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata1 = JSON.parse(querydata1);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }
    if (querydata1.feedback == null || querydata1.feedback == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        `Transaction details missing.`,
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }
    const requiredFields1 = [
      { field: "voucherid", message: "Voucher id missing." },
      { field: "vouchernumber", message: "Voucher number missing." },
      { field: "totalpaidamount", message: "Paid amount missing." },
      { field: "tdsstatus", message: "TDS status missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "date", message: "Date missing." },
      { field: "transactiondetails", message: "Transaction details missing." },
      { field: "voucherlist", message: "Voucher list missing." },
    ];
    for (const { field, message } of requiredFields1) {
      if (!querydata1.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLEAR CONSOLIDATE VOUCHERS",
          secret
        );
      }
    }
    let tdsamount = 0;
    let partially = 0;
    var paymentdetails = null;
    var description = null;
    var transactionid = 0;
    try {
      var path = null;
      if (req.file != null) {
        path = req.file.path;
      }
      const [sql50] = await db.spcall(
        `CALL InsertVoucherTransaction(?, ?, ?, ?, ?, ?, ?,@transaction_id);select @transaction_id;`,
        [
          querydata1.voucherid,
          querydata1.vouchernumber,
          querydata1.paidamount,
          querydata1.transactiondetails,
          path || null,
          querydata1.paymentstatus,
          querydata1.tdsstatus,
        ]
      );
      const objectvalue = sql50[1][0];
      transactionid = objectvalue["@transaction_id"];
    } catch (er) {
      console.log(er);
    }

    if (!Array.isArray(voucherlist)) {
      querydata1 = [voucherlist]; // Wrap in an array if it's a single object
    }

    for (const querydata of querydata1) {
      const requiredFields = [
        { field: "voucherid", message: "Voucher id missing." },
        { field: "vouchernumber", message: "Voucher number missing." },
        { field: "paymentstatus", message: "Payment status missing." },
        { field: "IGST", message: "IGST missing." },
        { field: "SGST", message: "SGST missing." },
        { field: "CGST", message: "CGST missing." },
        { field: "tds", message: "tds deductions missing." },
        { field: "paidamount", message: "Paid amount missing." },
        {
          field: "grossamount",
          message: "totalamount missing.",
        },
        {
          field: "subtotal",
          message: "Sub total missing.",
        },
        { field: "clientaddressname", message: "Client address name missing." },
        { field: "clientaddress", message: "Client address missing." },
        { field: "invoicenumber", message: "Invoice number missing." },
        { field: "emailid", message: "Email id missing." },
        { field: "phoneno", message: "Phone no missing." },
        { field: "tdsstatus", message: "TDS status missing." },
        { field: "invoicetype", message: "Invoice type missing." },
        { field: "gstnumber", message: "GST number missing." },
      ];

      for (const { field, message } of requiredFields) {
        if (!querydata.hasOwnProperty(field)) {
          return helper.getErrorResponse(
            false,
            "error",
            message,
            "CLEAR VOUCHERS",
            secret
          );
        }
      }
      let totalamount = querydata.grossamount || 0;
      let subtotal = querydata.subtotal || 0;
      let IGST = querydata.IGST || 0;
      let CGST = querydata.CGST || 0;
      let SGST = querydata.SGST || 0;

      try {
        if (querydata.paymentstatus == "complete") {
          if (querydata.tdsstatus) {
            tdsamount = Math.round(querydata.subtotal * 0.02);
          } else {
            tdsamount = 0;
          }
          const sql = await db.query(
            `UPDATE clientvouchermaster SET fully_cleared = 1, partially_cleared = 0,Pending_amount = 0,paid_amount = paid_amount + ?,payment_details = JSON_ARRAY_APPEND(
               COALESCE(
                 NULLIF(payment_details, ''), 
                 JSON_ARRAY()
               ), 
               '$', 
               JSON_OBJECT(
                 'date', ?, 
                 'amount', ?, 
                 'transanctiondetails', ?,
                 'transactionid',?,
                 'feedback',? )),cleared_date = ? WHERE voucher_id = ? AND ROUND(Total_amount) = ROUND(paid_amount + ? + ?)`,
            [
              querydata.paidamount,
              querydata.date,
              querydata.paidamount,
              querydata.transactiondetails,
              transactionid,
              querydata.feedback,
              querydata.date,
              querydata.voucherid,
              querydata.paidamount,
              tdsamount,
            ]
          );
          if (sql.changedRows > 0) {
            const sql43 = await db.query(
              `select payment_details,description from clientvouchermaster where voucher_id = ?`,
              [querydata.voucherid]
            );
            if (sql43.length > 0) {
              paymentdetails = sql43[0].payment_details;
              description = sql43[0].description;
            }
            if (querydata.invoicetype == "sales") {
              const sql1 = await db.query(
                `Update salesprocesslist SET Paid_amount = Paid_amount + ?,payment_status = 1 where cprocess_gene_id = ?`,
                [querydata.paidamount, querydata.invoicenumber]
              );
            } else if (querydata.invoicetype == "subscription") {
              const sql2 = await db.query(
                `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 1,sbm.Paidamount =sbm.Paidamount + ? 
        WHERE sbg.invoice_no = ?
          `,
                [querydata.paidamount, querydata.invoicenumber]
              );
              if (querydata.tdsstatus == true) {
                const [sql4] = await db.spcall(
                  `CALL upsert_tdsledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    querydata.voucherid,
                    querydata.vouchernumber,
                    querydata.clientaddressname,
                    querydata.IGST,
                    querydata.CGST,
                    querydata.SGST,
                    querydata.grossamount,
                    querydata.subtotal,
                    tdsamount,
                    querydata.gstnumber,
                    "receivable",
                    ``,
                    JSON.stringify(paymentdetails),
                    JSON.stringify({
                      gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                      tds: tdsamount || 0,
                      total: totalamount || 0,
                      subtotal: subtotal || 0,
                    }),
                  ]
                );
              }
            } else if (querydata.invoicetype == "vendor") {
            }
            const [sql5] = await db.spcall(
              `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                querydata.voucherid,
                querydata.vouchernumber,
                querydata.clientaddressname,
                querydata.IGST,
                querydata.CGST,
                querydata.SGST,
                querydata.grossamount,
                querydata.subtotal,
                querydata.gstnumber,
                "output",
                description,
                JSON.stringify(paymentdetails),
                JSON.stringify({
                  gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                  tds: tdsamount || 0,
                  total: totalamount || 0,
                  subtotal: subtotal || 0,
                }),
              ]
            );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Paid Amount not matching the total amount.",
              querydata.vouchernumber,
              secret
            );
          }
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Voucher not cleared",
            querydata.vouchernumber,
            secret
          );
        }
      } catch (er) {
        const sql6 = await db.query(
          `delete from gstledger where voucher_number = ?`,
          [querydata.vouchernumber]
        );
        const sql7 = await db.query(
          `DELETE FROM tdsledger WHERE voucher_number = ?`,
          [querydata.vouchernumber]
        );

        return helper.getErrorResponse(
          false,
          "error",
          "Error clearing the Voucher",
          querydata.vouchernumber,
          secret
        );
      }
      try {
        const sql9 = await db.spcall(
          `CALL SP_CREDIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid;`,
          [
            querydata.invoicenumber,
            querydata.clientaddressname,
            JSON.stringify({
              gst: { IGST: IGST, SGST: SGST, CGST: CGST },
              tds: tdsamount || 0,
              total: totalamount || 0,
              subtotal: subtotal || 0,
            }),
            JSON.stringify({
              amount: querydata.paidamount,
              transactiondetails: querydata.transactiondetails,
              date: querydata.date,
              feedback: querydata.feedback,
              tdsamount: tdsamount,
            }),
            querydata.gstnumber,
            querydata.paidamount,
            subtotal,
            IGST,
            CGST,
            SGST,
            tdsamount,
            "subscription",
            querydata.voucherid,
            querydata.vouchernumber,
            "receivable",
            description,
            partially,
          ]
        );
      } catch (er) {
        console.log(er);
      }
    }
    await mqttclient.publishMqttMessage(
      "refresh",
      "Voucher Cleared Successfully"
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Voucher Cleared Successfully",
      querydata.vouchernumber,
      secret
    );
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

async function accountLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CLIENT LEDGER",
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
        "CLIENT LEDGER",
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
        "CLIENT LEDGER",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date) date,debitamount, creditamount,billdetails,description, partially_cleared,Payment_details FROM clientledger where status =1 and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%' or invoice_type like '%subscription%')`;
    }
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLIENT LEDGER",
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
        "CLIENT LEDGER",
        secret
      );
    }

    sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date) date,debitamount, creditamount,billdetails,description, partially_cleared,Payment_details FROM clientledger where status =1`;

    if (
      querydata.ledgertype != null &&
      querydata.ledgertype != 0 &&
      querydata.ledgertype != undefined
    ) {
      if (querydata.ledgertype == "receivable") {
        sql += ` and ledger_type LIKE '%receivable%'`;
      } else if (querydata.ledgertype == "payable") {
        sql += ` and ledger_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.paymenttype != null &&
      querydata.paymenttype != 0 &&
      querydata.paymenttype != undefined
    ) {
      if (querydata.paymenttype == "credit") {
        sql += ` and creditamount != 0`;
      } else if (querydata.paymenttype == "debit") {
        sql += ` and debitamount != 0`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    }

    console.log(sql);
    const query = await db.query(sql, sqlParams);
    if (query) {
      let netAmount = 0;
      let creditAmount = 0;
      let debitAmount = 0;
      const updatedRows = query.map((entry) => {
        const debit = parseFloat(entry.debitamount || 0);
        const credit = parseFloat(entry.creditamount || 0);
        creditAmount += credit;
        debitAmount += debit;
        netAmount += credit - debit;

        return {
          ...entry,
          balance: parseFloat(netAmount.toFixed(2)), // Add running net amount
        };
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Client Ledger fetched Successfully",
        {
          ledgerlist: updatedRows,
          creditAmount: creditAmount,
          debitAmount: debitAmount,
          balanceAmount: netAmount,
        },
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

async function consolidateLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CONSOLIDATE LEDGER",
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
        "CONSOLIDATE LEDGER",
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
        "CONSOLIDATE LEDGER",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date),debitamount, creditamount,billdetails FROM clientledger where status =1`;
    }
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CONSOLIDATE LEDGER",
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
        "CONSOLIDATE LEDGER",
        secret
      );
    }

    sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date),debitamount, creditamount,billdetails FROM clientledger where status =1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.ledgertype == "receivable") {
        sql += ` and ledger_type LIKE '%receivable%'`;
      } else if (querydata.ledgertype == "payable") {
        sql += ` and ledger_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.paymenttype != null &&
      querydata.paymenttype != 0 &&
      querydata.paymenttype != undefined
    ) {
      if (querydata.paymenttype == "credit") {
        sql += ` and creditamount != 0`;
      } else if (querydata.paymenttype == "debit") {
        sql += ` and debitamount != 0`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    }

    console.log(sql);
    const query = await db.query(sql, sqlParams);
    if (query) {
      let netAmount = 0;
      let creditAmount = 0;
      let debitAmount = 0;
      const updatedRows = query.map((entry) => {
        const debit = parseFloat(entry.debitamount || 0);
        const credit = parseFloat(entry.creditamount || 0);
        creditAmount += credit;
        debitAmount += debit;
        netAmount += credit - debit;
        return {
          ...entry,
          netamount: parseFloat(netAmount.toFixed(2)), // Add running net amount
        };
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Consolidate Ledger fetched Successfully",
        {
          ledgerlist: updatedRows,
          creditAmount: creditAmount,
          debitAmount: debitAmount,
          balanceAmount: netAmount,
        },
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

async function TDSLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "TDS LEDGER",
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
        "TDS LEDGER",
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
        "TDS LEDGER",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT tdsledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,tds_type,Row_updated_date,tds_filed,payment_details,description,bill_details FROM tdsledger where status =1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "TDS LEDGER",
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
        "TDS LEDGER",
        secret
      );
    }

    sql = `SELECT tdsledger_id, voucher_id ,voucher_number ,client_name, IGST, CGST, SGST, totalamount,subtotal,tdsamount,gst_number,tds_type,Row_updated_date,tds_filed,payment_details,description,bill_details FROM tdsledger where status = 1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.tdstype == "receivable") {
        sql += ` and tds_type LIKE '%receivable%'`;
      } else if (querydata.tdstype == "payable") {
        sql += ` and tds_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    }

    console.log(sql);
    const query = await db.query(sql, sqlParams);

    if (query) {
      let netTdsAmount = 0;
      let totalTds = 0;
      let totalPaid = 0;
      let totalReceivables = 0;
      let totalPayables = 0;
      let updatedRows = [];

      query.forEach((entry) => {
        // payment_details can be object or array
        let paid = 0;
        if (Array.isArray(entry.payment_details)) {
          paid = entry.payment_details.reduce(
            (sum, pd) => sum + parseFloat(pd.amount || 0),
            0
          );
        } else if (
          entry.payment_details &&
          typeof entry.payment_details === "object"
        ) {
          paid = parseFloat(entry.payment_details.amount || 0);
        }
        const tds = parseFloat(entry.tdsamount || 0);
        totalPaid += paid;
        totalTds += tds;
        netTdsAmount += tds - paid;

        // Sum receivables/payables
        if (entry.tds_type === "receivable") {
          totalReceivables += tds;
        } else if (entry.tds_type === "payable") {
          totalPayables += tds;
        }

        updatedRows.push({
          ...entry,
          paidamount: paid,
          balance: parseFloat((tds - paid).toFixed(2)),
          runningbalance: parseFloat(netTdsAmount.toFixed(2)),
        });
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Tds Ledger fetched Successfully",
        {
          tdsledger: updatedRows,
          totalTds: totalTds,
          totalPaid: totalPaid,
          netTdsBalance: netTdsAmount,
          totalReceivables: totalReceivables,
          totalPayables: totalPayables,
          netTds: totalReceivables - totalPayables,
        },
        secret
      );
    }
    if (query[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Tds Ledger fetched Successfully",
        query,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Tds Ledger fetched Successfully",
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

async function GSTLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GST LEDGER",
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
        "GST LEDGER",
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
        "GST LEDGER",
        secret
      );
    }
    var sql,
      query1,
      query2,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT gstledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,gst_number,(IGST+CGST+SGST) totalgst,gst_type,DATE(Row_updated_date) date,gst_filed,totalamount,subtotal,payment_details,description,bill_details
       FROM gstledger where status = 1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GST LEDGER",
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
        "GST LEDGER",
        secret
      );
    }

    sql = `SELECT gstledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,gst_number,(IGST+CGST+SGST) totalgst,gst_type,DATE(Row_updated_date) date,gst_filed,totalamount,subtotal,payment_details,description,bill_details FROM gstledger where status = 1`;
    query1 = `select SUM(IGST) IGST,SUM(CGST) CGST,SUM(SGST) SGST FROM gstledger WHERE status = 1 and gst_type = 'input'`;
    query2 = `select SUM(IGST) IGST,SUM(CGST) CGST,SUM(SGST) SGST FROM gstledger WHERE status = 1 and gst_type = 'output'`;
    if (
      querydata.gsttype != null &&
      querydata.gsttype != 0 &&
      querydata.gsttype != undefined
    ) {
      if (querydata.gsttype == "input") {
        sql += ` and gst_type LIKE '%input%'`;
      } else if (querydata.gsttype == "output") {
        sql += ` and gst_type LIKE '%output%'`;
      } else {
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
        query1 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
        query2 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
        query1 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
        query2 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
        query1 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
        query2 += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      query1 += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      query2 += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      query1 += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      query2 += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    } else {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate.setMinutes(
        startDate.getMinutes() - startDate.getTimezoneOffset()
      );
      endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());
      const formatDate = (date) => date.toISOString().split("T")[0];
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      query1 += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      query2 += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(formattedStartDate, formattedEndDate);
    }
    console.log(sql);
    const query = await db.query(sql, sqlParams);
    const sql1 = await db.query(query1, sqlParams);
    const sql2 = await db.query(query2, sqlParams);
    var input = 0,
      output = 0,
      total = 0,
      inputsgst = 0,
      outputsgst = 0,
      totalsgst = 0,
      inputcgst = 0,
      outputcgst = 0,
      totalcgst = 0,
      inputigst = 0,
      outputigst = 0,
      totaligst = 0;
    if (sql1.length > 0 && sql2.length > 0) {
      input = sql1[0].IGST + sql1[0].SGST + sql1[0].CGST;
      output = sql2[0].IGST + sql2[0].SGST + sql2[0].CGST;
      total = output - input;
      inputsgst = sql1[0].SGST;
      outputsgst = sql2[0].SGST;
      totalsgst = outputsgst - inputsgst;
      inputcgst = sql1[0].CGST;
      outputcgst = sql2[0].CGST;
      totalcgst = outputcgst - inputcgst;
      inputigst = sql1[0].IGST;
      outputigst = sql2[0].IGST;
      totaligst = outputigst - inputigst;
    }
    if (query.length > 0) {
      if (
        querydata.gsttype != null &&
        querydata.gsttype != 0 &&
        querydata.gsttype != undefined
      ) {
        if (querydata.gsttype == "input") {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: input,
              outputgst: 0,
              totalgst: 0,
              inputsgst: inputsgst,
              outputsgst: 0,
              totalsgst: 0,
              inputcgst: inputcgst,
              outputcgst: 0,
              totalcgst: 0,
              inputigst: inputigst,
              outputigst: 0,
              totaligst: 0,
            },
            secret
          );
        } else if (querydata.gsttype == "output") {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: 0,
              outputgst: output,
              totalgst: 0,
              inputsgst: 0,
              outputsgst: outputsgst,
              totalsgst: 0,
              inputcgst: 0,
              outputcgst: outputcgst,
              totalcgst: 0,
              inputigst: 0,
              outputigst: outputigst,
              totaligst: 0,
            },
            secret
          );
        } else {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: input,
              outputgst: output,
              totalgst: total,
              inputsgst: inputsgst,
              outputsgst: outputsgst,
              totalsgst: totalsgst,
              inputcgst: inputcgst,
              outputcgst: outputcgst,
              totalcgst: totalcgst,
              inputigst: inputigst,
              outputigst: outputigst,
              totaligst: totaligst,
            },
            secret
          );
        }
      }
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
        {
          gstlist: query,
          inputgst: input,
          outputgst: output,
          totalgst: total,
          inputsgst: inputsgst,
          outputsgst: outputsgst,
          totalsgst: totalsgst,
          inputcgst: inputcgst,
          outputcgst: outputcgst,
          totalcgst: totalcgst,
          inputigst: inputigst,
          outputigst: outputigst,
          totaligst: totaligst,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
        {
          gstlist: query,
          inputgst: 0,
          outputgst: 0,
          totalgst: 0,
          inputsgst: 0,
          outputsgst: 0,
          totalsgst: 0,
          inputcgst: 0,
          outputcgst: 0,
          totalcgst: 0,
          inputigst: 0,
          outputigst: 0,
          totaligst: 0,
        },
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

async function getSubscriptionCustomer(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
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
        "GET SUBSCRIPTION CUSTOMER",
        secret
      );
    }

    const sql =
      await db.query(`select scustomer_id customer_id, scustomer_name customer_name,scustomer_phoneno customer_phoneno,scustomer_gstno customer_gstno from enquirysubscriptionmaster where 
         status = 1`);
    if (sql.length) {
      const updatedSql = sql.map((row) => ({
        ...row,
        customer_id: `SB-${row.customer_id}`,
      }));
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription customer Fetched Successfully",
        updatedSql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Subscription customer Fetched Successfully",
        sql,
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

async function getSalesCustomer(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SALES CUSTOMER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET SALES CUSTOMER",
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
        "GET SALES CUSTOMER",
        secret
      );
    }

    const sql = await db.query(
      `select customer_id, customer_name,customer_phoneno,customer_gstno from enquirycustomermaster where status = 1`
    );
    if (sql.length) {
      const updatedSql = sql.map((row) => ({
        ...row,
        customer_id: `SA-${row.customer_id}`,
      }));
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales customer Fetched Successfully",
        updatedSql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Sales customer Fetched Successfully",
        sql,
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
  getTransactionFile,
  getVouchers,
  ClearVouchers,
  ClearConsolidateVouchers,
  accountLedger,
  consolidateLedger,
  TDSLedger,
  GSTLedger,
  getSubscriptionCustomer,
  getSalesCustomer,
};

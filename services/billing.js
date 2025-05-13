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
      sql = `SELECT invoice_number,voucher_type,email_id,phone_number,client_name,client_address,pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,IGST,CGST,SGST,
      voucher_number,invoice_type,customer_id,CASE WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount,payment_details,DATE(Row_updated_date) as date
      FROM clientvouchermaster WHERE status = 1`;
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

    sql = `SELECT invoice_number,voucher_type,email_id,phone_number,client_name,client_address,pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,IGST,CGST,SGST,
    voucher_number,invoice_type,customer_id,CASE WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount,payment_details,DATE(Row_updated_date) as date
    FROM clientvouchermaster WHERE status = 1`;

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

async function ClearVouchers(req, res, next) {
  let secret, querydata, billing;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
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
    try {
      const sql50 = await db.query(
        `Insert into vouchertransactions(voucher_id,voucher_number, amount,transaction_details,file_path) VALUES(?,?,?,?,?)`,
        [
          querydata.voucherid,
          querydata.vouchernumber,
          querydata.paidamount,
          querydata.transactiondetails,
          req.file.path || null,
        ]
      );
    } catch (er) {
      console.log(er);
    }
    try {
      if (querydata.paymentstatus == "partial") {
        const sql = await db.query(
          `UPDATE clientvouchermaster SET  partially_cleared = 1,   Pending_amount = ? - ?,  payment_details = JSON_ARRAY_APPEND( IFNULL(payment_details, JSON_ARRAY()), '$', 
           JSON_OBJECT('date', NOW(), 'amount', ?, 'transanctiondetails',?)) WHERE voucher_id = ? and fully_cleared != 0`,
          [
            querydata.grossamount,
            querydata.paidamount,
            querydata.paidamount,
            querydata.transactiondetails,
            querydata.voucherid,
          ]
        );

        if (querydata.invoicetype == "sales") {
          const sql1 = await db.query(
            `Update salesprocesslist SET payment_status = 2, Paid_amount = ? where invoice_number = ? and payment_status != 1`,
            [querydata.paidamount, querydata.invoicenumber]
          );
        } else if (querydata.invoicetype == "subscription") {
          const sql2 = await db.query(
            `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 2,sbm.Paid_amount = ?, 
           sbm.pendingpayments = ? - ? WHERE sbg.invoice_number = ? and sbg.payment_status != 1
          `,
            [
              querydata.paidamount,
              querydata.grossamount,
              querydata.paidamount,
              querydata.invoicenumber,
            ]
          );
        } else if (querydata.invoicetype == "vendor") {
        }
      } else if (querydata.paymentstatus == "complete") {
        var tdsamount;
        if (querydata.tdsstatus == true) {
          tdsamount = querydata.tdsstatus ? +(subtotal * 0.02).toFixed(2) : 0;
        } else {
          tdsamount = 0;
        }
        const sql = await db.query(
          `UPDATE clientvouchermaster SET fully_cleared = 1, partially_cleared = 0 , payment_details = JSON_ARRAY_APPEND( IFNULL(payment_details, JSON_ARRAY()), '$', 
          JSON_OBJECT('date', NOW(), 'amount', ?, 'transanctiondetails',?)) WHERE voucher_id = ? AND FLOOR(total_amount) = FLOOR(? + ?)`,
          [
            querydata.paidamount,
            querydata.transactiondetails,
            querydata.voucherid,
            querydata.paidamount,
            tdsamount,
          ]
        );
        if (sql.affectedRows > 0) {
          if (querydata.invoicetype == "sales") {
            const sql1 = await db.query(
              `Update salesprocesslist SET payment_status = 1 where cprocess_gene_id = ?`,
              [querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "subscription") {
            const sql2 = await db.query(
              `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 1,sbm.Paid_amount = ? 
        WHERE sbg.invoice_number = ?
          `,
              [querydata.paidamount, querydata.invoicenumber]
            );
            if (querydata.tdsstatus == true) {
              const [sql4] = await db.spcall(
                `CALL upsert_tdsledger(?,?,?,?,?,?,?,?,?,?,?)`,
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
                ]
              );
            }
          } else if (querydata.invoicetype == "vendor") {
          }
          const [sql5] = await db.spcall(
            `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?)`,
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
    return helper.getSuccessResponse(
      true,
      "success",
      "Vouchers Cleared Successfully",
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
      sql = `SELECT tdsledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,tds_type,Row_updated_date,tds_filed FROM tdsledger where status =1`;
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

    sql = `SELECT tdsledger_id, voucher_id ,voucher_number ,client_name, IGST, CGST, SGST, totalamount,subtotal,tdsamount,gst_number,tds_type,Row_updated_date,tds_filed FROM tdsledger where status = 1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.tdstype == "receivable") {
        sql += ` and tds_type LIKE '%receivable%'`;
      } else if (querydata.vouchertype == "payable") {
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
        "Tds Ledger  fetched Successfully",
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
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT tdsledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,tds_type,Row_updated_date,tds_filed FROM tdsledger where status =1`;
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

    sql = `SELECT gstledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,gst_number,gst_type,Row_updated_date,gst_filed,totalamount,subtotal FROM gstledger where status = 1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.tdstype == "input") {
        sql += ` and gst_type LIKE '%input%'`;
      } else if (querydata.vouchertype == "output") {
        sql += ` and gst_type LIKE '%output%'`;
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
    if (query[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
        query,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
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
  TDSLedger,
  GSTLedger,
};

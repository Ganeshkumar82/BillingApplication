const db = require("../db");
const helper = require("../helper");
const multer = require("multer");
const path = require("path");
// const fs = require("fs-extra");
const config = require("../config");
const uploadFile = require("../middleware");
const fs = require("fs");
const mailer = require("../mailer");
const axios = require("axios");
// const db = new database();
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// {
//   "vendorname":"JK constructiond",
//   "vendormailid":"jk@gmail.com",
//   "vendorphoneno":"8393923242",
//   "vendoraddress":"chinnverampatti,udumallai",
//   "vendorgst":"33ABCD43wsd123"
//   }
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Vendor Added Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

// async function addsale(req, res) {
//   try {
//     try {
//       await uploadFile.uploadCustomerrequ(req, res);

//       if (!req.file) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Please upload a file!",
//           "ADD SALES"
//         );
//       }
//     } catch (er) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         `Could not upload the file. ${er.message}`,
//         er.message,
//         ""
//       );
//     }
//     let sales = req.body;
//     if (!sales.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token missing. Please provide the Login session token",
//         "ADD SALES",
//         ""
//       );
//     }
//     var secret = sales.STOKEN.substring(0, 16);
//     var querydata;
//     // Validate session token length
//     if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token size invalid. Please provide the valid Session token",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT   @result;",
//       [sales.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Check if querystring is provided
//     if (!sales.hasOwnProperty("querystring")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring missing. Please provide the querystring",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Decrypt querystring
//     try {
//       querydata = await helper.decrypt(sales.querystring, secret);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring Invalid error. Please provide the valid querystring.",
//         ex.message,
//         secret
//       );
//     }

//     // Parse the decrypted querystring
//     try {
//       querydata = JSON.parse(querydata);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring JSON error. Please provide valid JSON",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Validate required fields
//     if (!querydata.hasOwnProperty("name") || querydata.name == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client name missing. Please provide the Client name",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Phone number missing. Please provide the Phone number missing",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Email id missing. Please provide the Email id",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("address") || querydata.address == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client address missing. Please provide the Client address",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("gst") || querydata.gst == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client GST Number missing. Please provide the Client GST number",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("billingaddressname") ||
//       querydata.billingaddressname == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Billing address name missing. Please provide the Billing Address name",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("billingaddress") ||
//       querydata.billingaddress == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Billing address missing. Please provide the Billing address.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("modeofrequest") ||
//       querydata.modeofrequest == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Mode of Request missing. Please provide the Mode of request.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("MORreference") ||
//       querydata.MORreference == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Mode of Request missing. Please provide the Mode of request.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("date") || querydata.date == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Date missing. Please provide the Date.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("invoiceamount") ||
//       querydata.invoiceamount == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Invoice amount missing. Please provide the Invoice amount.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("customerrequirementid") ||
//       querydata.customerrequirementid == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Customer requirement id missing. Please provide the Customer requirement id.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("product") || querydata.product == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Details missing. Please provide the Product Details.",
//         "ADD PROCESS OF SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Notes missing. Please provide the Product Notes.",
//         "ADD SALES",
//         secret
//       );
//     }

//     if (
//       !querydata.hasOwnProperty("messagetype") ||
//       querydata.messagetype == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Message Type missing. Please provide the Message Type.",
//         "ADD SALES",
//         secret
//       );
//     }

//     const [sql] = await db.spcall(
//       `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
//       [
//         querydata.name,
//         querydata.emailid,
//         querydata.phoneno,
//         querydata.gst,
//         querydata.address,
//         querydata.billingaddressname,
//         querydata.billingaddress,
//         querydata.modeofrequest,
//         querydata.MORreference,
//         userid,
//         req.file.path,
//         1,
//       ]
//     );

//     const objectvalue1 = sql[1][0];
//     const salesid = objectvalue1["@salesid"];
//     if (salesid != null && salesid != "") {
//       const [sql] = await db.spcall(
//         `CALL SP_ADD_SALES_PROCESS(?,?,@processid); select @processid;`,
//         [salesid, userid]
//       );
//       const objectvalue1 = sql[1][0];
//       const processid = objectvalue1["@processid"];
//       if (processid != null && processid != "") {
//         const [sql1] = await db.spcall(
//           `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
//           [
//             querydata.name,
//             userid,
//             processid,
//             querydata.customerrequirementid,
//             1,
//             req.file.path,
//             querydata.address,
//             querydata.billingaddress,
//             querydata.billingaddressname,
//           ]
//         );
//         const objectvalue2 = sql1[1][0];
//         const prolistid = objectvalue2["@prolistid"];
//         if (!prolistid) {
//           return helper.getErrorResponse(
//             false,
//             "error",
//             "Error adding Customer Requirements.",
//             "ADD PROCESS OF SALES",
//             secret
//           );
//         }

//         // Insert Products in Parallel
//         const productQueries = querydata.product.map((product) => {
//           if (!product.productname || !product.productquantity) {
//             return helper.getErrorResponse(
//               false,
//               "error",
//               "Product details are incomplete.",
//               "ADD PROCESS OF SALES",
//               secret
//             );
//           }
//           return db.spcall(
//             `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,?,@productid); SELECT @productid;`,
//             [
//               product.productname,
//               product.productquantity,
//               prolistid,
//               querydata.notes,
//               filePath,
//             ]
//           );
//         });

//         await Promise.all(productQueries);

//         // Update generateecid
//         await db.query(
//           `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
//           [querydata.customerrequirementid]
//         );

//         var EmailSent = 0;
//         var WhatsappSent = 0;

//         if (querydata.messagetype == 1 || querydata.messagetype == 3) {
//           EmailSent = await mailer.sendInvoice(
//             querydata.name,
//             querydata.emailid,
//             "Invoice",
//             "invoicepdf.html",
//             ``,
//             "INVOICE_PDF_SEND",
//             querydata.customerrequirementid,
//             querydata.date,
//             querydata.invoiceamount
//           );
//         } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
//           WhatsappSent = await axios.post(
//             `${config.whatsappip}/billing/sendpdf`,
//             {
//               phoneno: querydata.phoneno,
//               feedback: `We hope you're doing well. Please find attached your invoice
//                   with Sporada Secure.`,
//               pdfpath: req.file.path,
//             }
//           );
//           if (WhatsappSent.data.code == true) {
//             WhatsappSent = 1;
//           } else {
//             WhatsappSent = 0;
//           }
//         }
//         const sql4 = await db.query(
//           `Insert into morupload(MOR_path,Created_by,Email_sent,Whatsapp_sent) VALUES(?,?,?,?)`,
//           [req.file.path, userid, EmailSent, WhatsappSent]
//         );
//         return helper.getSuccessResponse(
//           true,
//           "success",
//           "Sales Product Added Successfully",
//           salesid,
//           secret
//         );
//       }
//     } else {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Error adding the Cusotmer requirements",
//         "ADD PROCESS OF SALES",
//         secret
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "error",
//       "Internal error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function addsale(req, res) {
  try {
    var secret;
    // Upload file handling
    try {
      await uploadFile.uploadCustomerrequ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD SALES"
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

    // Validate Login Session Token
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD SALES",
        ""
      );
    }

    secret = sales.STOKEN.substring(0, 16);
    let querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD SALES",
        secret
      );
    }

    // Validate session token with stored procedure
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD SALES",
        secret
      );
    }

    // Validate the querystring
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD SALES",
        secret
      );
    }

    // Decrypt and parse querystring

    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring error. Please provide a valid querystring or valid JSON.",
        ex.message,
        secret
      );
    }

    // Validate required fields in the query data
    const requiredFields = [
      {
        field: "name",
        message: "Client name missing. Please provide the Client name",
      },
      {
        field: "phoneno",
        message: "Phone number missing. Please provide the Phone number",
      },
      {
        field: "emailid",
        message: "Email id missing. Please provide the Email id",
      },
      {
        field: "address",
        message: "Client address missing. Please provide the Client address",
      },
      {
        field: "gst",
        message:
          "Client GST Number missing. Please provide the Client GST number",
      },
      {
        field: "billingaddressname",
        message:
          "Billing address name missing. Please provide the Billing Address name",
      },
      {
        field: "billingaddress",
        message: "Billing address missing. Please provide the Billing address",
      },
      {
        field: "modeofrequest",
        message: "Mode of Request missing. Please provide the Mode of request",
      },
      {
        field: "MORreference",
        message:
          "MOR reference missing. Please provide the Mode of request reference",
      },
      { field: "date", message: "Date missing. Please provide the Date" },
      {
        field: "customer_type",
        message: "Customer type missing. Please provide the Customer type",
      },
      {
        field: "product",
        message: "Product Details missing. Please provide the Product Details",
      },
      {
        field: "notes",
        message: "Product Notes missing. Please provide the Product Notes",
      },
      {
        field: "title",
        message: "Title missing. Please provide the Title",
      },
      {
        field: "companyid",
        message: "Company id missing. Please provide the Company id",
      },
      {
        field: "branchid",
        message: "Branch id missing. Please provide the Branch id.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLIENT REQUIREMENT ADD",
          secret
        );
      }
    }

    if (querydata.customer_type == 1) {
      const [result1] = await db.spcall(
        `CALL GenerateCustomerReqId(?,@p_customerreq_id); select @p_customerreq_id`,
        [userid]
      );
      const objectValue = result1[1][0];
      requirementid = objectValue["@p_customerreq_id"];

      // Update generateecid status
      await db.query(
        `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
        [requirementid]
      );
    } else {
      var customercode;
      if (querydata.companyid != 0) {
        const sql1 = await db.query1(
          `select ccode from customermaster where customer_id in(?) and status = 1`,
          [querydata.companyid]
        );
        if (sql1[0]) customercode = sql1[0].ccode;
      } else {
        const sql1 = await db.query1(
          `select branch_code from branchmaster where branch_id in(?) and status =1`,
          querydata.branchid
        );
        if (sql1[0]) customercode = sql1[0].branch_code;
      }
      if (customercode == "" || customercode == null) {
        return helper.getErrorResponse(
          false,
          "error",
          "There is No customer code for the selected company/branch",
          "CLIENT REQUIREMENT ADD",
          secret
        );
      }
      const [result1] = await db.spcall(
        `CALL Gen_sub_reqId(?,?,@p_req_id); SELECT @p_req_id;`,
        [userid, customercode]
      );
      const objectValue = result1[1][0];
      requirementid = objectValue["@p_req_id"];
    }
    // Insert sales data into the database
    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
      [
        querydata.name,
        querydata.emailid,
        querydata.phoneno,
        querydata.gst,
        querydata.address,
        querydata.billingaddressname,
        querydata.billingaddress,
        querydata.modeofrequest,
        querydata.MORreference,
        userid,
        querydata.customer_type,
        req.file.path,
        querydata.companyid,
        JSON.stringify(querydata.branchid),
        querydata.title,
      ]
    );

    const objectvalue1 = sql[1][0];
    const salesid = objectvalue1["@salesid"];

    if (salesid) {
      const [processSql] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
        [salesid, userid, querydata.customerrequirementid]
      );
      const objectvalue2 = processSql[1][0];
      const processid = objectvalue2["@processid"];

      if (processid) {
        const [proListSql] = await db.spcall(
          `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
          [
            querydata.name,
            userid,
            processid,
            requirementid,
            1,
            req.file.path,
            querydata.address,
            querydata.billingaddress,
            querydata.billingaddressname,
            querydata.title,
          ]
        );
        const objectvalue3 = proListSql[1][0];
        const prolistid = objectvalue3["@prolistid"];

        if (prolistid) {
          // Insert Products in Parallel
          const productQueries = querydata.product.map((product) => {
            if (!product.productname || !product.productquantity) {
              return helper.getErrorResponse(
                false,
                "error",
                "Product details are incomplete.",
                "CLIENT REQUIREMENT ADD",
                secret
              );
            }
            return db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,@productid); SELECT @productid;`,
              [
                product.productname,
                product.productquantity,
                prolistid,
                querydata.notes,
              ]
            );
          });

          await Promise.all(productQueries);

          // Update generateecid status
          if (querydata.customer_type == 1) {
            await db.query(
              `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
              [requirementid]
            );
          } else {
            await db.query(
              `UPDATE gen_subscrreq_id SET status = 0 WHERE req_id = ?`,
              [requirementid]
            );
          }
          // Send Email or WhatsApp
          let EmailSent = 0;
          let WhatsappSent = 0;

          // if (querydata.messagetype == 1 || querydata.messagetype == 3) {
          //   EmailSent = await mailer.sendInvoice(
          //     querydata.name,
          //     querydata.emailid,
          //     "Invoice",
          //     "invoicepdf.html",
          //     "",
          //     "INVOICE_PDF_SEND",
          //     req.file.path,
          //     querydata.customerrequirementid,
          //     querydata.date,
          //     querydata.invoiceamount
          //   );
          // }
          // if (querydata.messagetype == 2 || querydata.messagetype == 3) {
          //   WhatsappSent = await axios.post(
          //     `${config.whatsappip}/billing/sendpdf`,
          //     {
          //       phoneno: querydata.phoneno,
          //       feedback: `We hope you're doing well. Please find your invoice with Sporada Secure attached.`,
          //       pdfpath: req.file.path,
          //     }
          //   );
          //   if (WhatsappSent.data.code == true) {
          //     WhatsappSent = WhatsappSent.data.code;
          //   } else {
          //     WhatsappSent = WhatsappSent.data.code;
          //   }
          // }

          // Log in morupload table
          await db.query(
            `INSERT INTO morupload(MOR_path, Created_by, Email_sent, Whatsapp_sent) VALUES(?,?,?,?)`,
            [req.file.path, userid, EmailSent, WhatsappSent]
          );

          return helper.getSuccessResponse(
            true,
            "success",
            "Client requirement created successfully",
            {
              clientrequirementid: salesid,
            },
            secret
          );
        }
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Customer requirements",
        "CLIENT REQUIREMENT ADD",
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
//####################################################################### REQUEST BODY  #########################################################################################################

async function UpdateenqCustomer(req, res) {
  try {
    var secret;
    // Upload file handling
    try {
      await uploadFile.uploadCustomerrequ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "UPDATE SALES"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        +""
      );
    }

    const sales = req.body;

    // Validate Login Session Token
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE SALES",
        ""
      );
    }

    secret = sales.STOKEN.substring(0, 16);
    let querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE SALES",
        secret
      );
    }

    // Validate session token with stored procedure
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE SALES",
        secret
      );
    }

    // Validate the querystring
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES",
        secret
      );
    }

    // Decrypt and parse querystring

    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring error. Please provide a valid querystring or valid JSON.",
        ex.message,
        secret
      );
    }

    // Validate required fields in the query data
    const requiredFields = [
      {
        field: "name",
        message: "Client name missing. Please provide the Client name",
      },
      {
        field: "phoneno",
        message: "Phone number missing. Please provide the Phone number",
      },
      {
        field: "emailid",
        message: "Email id missing. Please provide the Email id",
      },
      {
        field: "address",
        message: "Client address missing. Please provide the Client address",
      },
      {
        field: "gst",
        message:
          "Client GST Number missing. Please provide the Client GST number",
      },
      {
        field: "billingaddressname",
        message:
          "Billing address name missing. Please provide the Billing Address name",
      },
      {
        field: "billingaddress",
        message: "Billing address missing. Please provide the Billing address",
      },
      {
        field: "modeofrequest",
        message: "Mode of Request missing. Please provide the Mode of request",
      },
      {
        field: "MORreference",
        message:
          "MOR reference missing. Please provide the Mode of request reference",
      },
      { field: "date", message: "Date missing. Please provide the Date" },
      {
        field: "customerrequirementid",
        message:
          "Customer requirement id missing. Please provide the Customer requirement id",
      },
      {
        field: "product",
        message: "Product Details missing. Please provide the Product Details",
      },
      {
        field: "notes",
        message: "Product Notes missing. Please provide the Product Notes",
      },
      {
        field: "title",
        message: "Title missing. Please provide the Title",
      },
      {
        field: "companyid",
        message: "Company id missing. Please provide the Company id",
      },
      {
        field: "branchid",
        message: "Branch id missing. Please provide the Branch id.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE SALES",
          secret
        );
      }
    }

    // Insert sales data into the database
    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
      [
        querydata.name,
        querydata.emailid,
        querydata.phoneno,
        querydata.gst,
        querydata.address,
        querydata.billingaddressname,
        querydata.billingaddress,
        querydata.modeofrequest,
        querydata.MORreference,
        userid,
        1,
        req.file.path,
        ,
        querydata.customerid,
        querydata.branchid,
      ]
    );

    const objectvalue1 = sql[1][0];
    const salesid = objectvalue1["@salesid"];

    if (salesid) {
      const [processSql] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
        [salesid, userid, querydata.customerrequirementid]
      );
      const objectvalue2 = processSql[1][0];
      const processid = objectvalue2["@processid"];

      if (processid) {
        const [proListSql] = await db.spcall(
          `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
          [
            querydata.name,
            userid,
            processid,
            querydata.customerrequirementid,
            1,
            req.file.path,
            querydata.address,
            querydata.billingaddress,
            querydata.billingaddressname,
            querydata.title,
          ]
        );
        const objectvalue3 = proListSql[1][0];
        const prolistid = objectvalue3["@prolistid"];

        if (prolistid) {
          // Insert Products in Parallel
          const productQueries = querydata.product.map((product) => {
            if (!product.productname || !product.productquantity) {
              return helper.getErrorResponse(
                false,
                "error",
                "Product details are incomplete.",
                "UPDATE SALES",
                secret
              );
            }
            return db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,@productid); SELECT @productid;`,
              [
                product.productname,
                product.productquantity,
                prolistid,
                querydata.notes,
              ]
            );
          });

          await Promise.all(productQueries);

          // Update generateecid status
          await db.query(
            `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
            [querydata.customerrequirementid]
          );

          // Send Email or WhatsApp
          let EmailSent = 0;
          let WhatsappSent = 0;

          // Log in morupload table
          await db.query(
            `INSERT INTO morupload(MOR_path, Created_by, Email_sent, Whatsapp_sent) VALUES(?,?,?,?)`,
            [req.file.path, userid, EmailSent, WhatsappSent]
          );

          return helper.getSuccessResponse(
            true,
            "success",
            "Client requirement created successfully",
            {
              clientrequirementid: salesid,
            },
            secret
          );
        }
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Customer requirements",
        "UPDATE SALES",
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

// Image or pdf data
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function uploadMor(req, res, next) {
//   try {
//     console.log("Before preParse.any:", req.body);

//     // Use the preParse middleware with the correct callback pattern
//     preParse.any()(req, res, (err) => {
//       if (err) {
//         return res.status(500).send({ message: `Error in preParse middleware: ${err.message}` });
//       }

//       console.log("After preParse.any:", req.body); // req.body will now be populated

//       // Proceed with the file upload using multer
//       uploadFile.uploadFileMiddleware(req, res, (err) => {
//         if (err) {
//           return res.status(500).send({ message: `Error uploading file. ${err.message}` });
//         }

//         // Validate the file
//         if (!req.file) {
//           return res.status(400).send({ message: "Please upload a file!" });
//         }

//         // Validate category
//         if (!req.body.category) {
//           return res.status(400).send({ message: "Category is required!" });
//         }

//         // File uploaded successfully
//         res.status(200).send({
//           message: `Uploaded the file successfully: ${req.file.originalname}`,
//           category: req.body.category,
//           path: req.file.path,
//         });
//       });
//     });

//   } catch (err) {
//     res.status(500).send({
//       message: `Could not upload the file. ${err.message}`,
//     });
//   }
// }

async function uploadMor(req, res) {
  var secret;
  try {
    await uploadFile.uploadFileMOR(req, res);
    var sales = req.body;
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD SALES",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    // Validate the file
    if (!req.file) {
      return helper.getErrorResponse(
        false,
        "error",
        "Please upload a file!",
        "ADD SALES",
        secret
      );
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    return helper.getSuccessResponse(
      true,
      "success",
      `Uploaded the file successfully: ${req.file.originalname}`,
      { path: req.file.path },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not upload the file. ${er.message}`,
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addInvoice(req, res) {
  let secret;
  try {
    // Upload File Handling
    try {
      await uploadFile.uploadFileInvoice(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD INVOICE"
        );
      }
    } catch (err) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${err.message}`,
        err.message
      );
    }

    const sales = req.body;

    // Validate STOKEN
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the login session token.",
        "Upload Invoice"
      );
    }
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide a valid session token.",
        "Upload Invoice"
      );
    }

    secret = sales.STOKEN.substring(0, 16);

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const userid = result[1][0]["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid session token. Please provide a valid session token.",
        "Upload Invoice"
      );
    }

    // Validate QueryString
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring.",
        "Upload Invoice",
        secret
      );
    }

    let querydata;
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring. Please provide a valid JSON querystring.",
        "Upload Invoice",
        secret
      );
    }

    // Validate Required Fields
    const requiredFields = [
      { field: "title", message: "Title missing." },
      { field: "processid", message: "Process ID missing." },
      { field: "phoneno", message: "Contact number missing." },
      { field: "emailid", message: "Email ID missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "gst_number", message: "Client GST number missing." },
      {
        field: "billingaddressname",
        message: "Billing address name missing.",
      },
      { field: "billingaddress", message: "Billing address missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "product", message: "Product details missing." },
      { field: "notes", message: "Product notes missing." },
      { field: "invoicegenid", message: "Generated Invoice ID missing." },
      { field: "date", message: "Invoice date missing." },
      { field: "invoice_amount", message: "Invoice amount missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "feedback", message: "Feedback type missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD INVOICE",
          secret
        );
      }
    }
    var EmailSent;
    var WhatsappSent;
    // Insert Invoice
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE(?,?,?,?,?,?,?,?,?,?,?,@prolistid); SELECT @prolistid;`,
      [
        querydata.clientaddressname,
        querydata.gst_number,
        userid,
        querydata.processid,
        querydata.invoicegenid,
        4,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );

    const invoiceid = sql1[1][0]["@prolistid"];
    if (!invoiceid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the invoice.",
        "ADD INVOICE",
        secret
      );
    }

    let Quoteid;

    // Insert Products
    for (const product of querydata.product) {
      if (
        !product.productname ||
        !product.productquantity ||
        !product.productgst ||
        !product.productprice ||
        !product.producthsn ||
        !product.productsno ||
        !product.producttotal
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Incomplete product details. Provide productname, productquantity, producthsn, productgst, and productprice.",
          "ADD INVOICE",
          secret
        );
      }

      const [sql2] = await db.spcall(
        `CALL SP_INVOICE_ADD(?,?,?,?,?,?,?,?,?,?,?,@invid); SELECT @invid;`,
        [
          product.productname,
          product.productquantity,
          product.productgst,
          product.productprice,
          product.producthsn,
          querydata.invoicegenid,
          JSON.stringify(querydata.notes),
          req.file.path,
          invoiceid,
          product.productsno,
          product.producttotal,
        ]
      );

      Quoteid = sql2[1][0]["@invid"];
    }

    // Update Invoice Status
    await db.query(
      `UPDATE generateinvoiceid SET status = 0 WHERE invoice_id in(?)`,
      [querydata.invoicegenid]
    );

    // Send Email or WhatsApp Message
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
        querydata.invoice_amount
      );
    } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
      WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
        phoneno: querydata.phoneno,
        feedback: `We hope you're doing well. Please find attached your invoice with Sporada Secure.`,
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
        querydata.invoice_amount
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
        mailer.sendQuotation(
          querydata.clientaddressname,
          querydata.emailid,
          "Your invoice from Sporada Secure India Private Limited",
          "invoicepdf.html",
          ``,
          "INVOICE_PDF_SEND",
          req.file.path,
          querydata.invoicegenid,
          querydata.date,
          querydata.invoice_amount
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
    }
    // Insert MOR Upload Entry
    // await db.query(
    //   `INSERT INTO morupload (MOR_path, Created_by, Email_sent) VALUES (?, ?, ?)`,
    //   [req.file.path, userid, WhatsappSent]
    // );

    return helper.getSuccessResponse(
      true,
      "success",
      "Invoice added successfully",
      {
        invoiceid: Quoteid,
        EmailSent: EmailSent,
        WhatsappSent: WhatsappSent,
        filepath: req.file.path,
      },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not add the invoice. ${er.message}`,
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//##############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function uploadCustomerReq(req, res) {
  try {
    await uploadFile.uploadCustomerrequ(req, res);

    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function uploadQuotatation(req, res) {
  try {
    await uploadFile.uploadQuotationp(req, res);

    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//#############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #######################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function uploadDeliveryChallan(req, res) {
  try {
    await uploadFile.uploadDeliverychln(req, res);

    // Validate the file
    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function uploadRFQ(req, res) {
  try {
    await uploadFile.uploadRFQuotation(req, res);

    // Validate the file
    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getProcesslist(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE AVAILBLE SALES",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE AVAILBLE SALES",
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
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET THE AVAILBLE SALES",
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
        "GET THE AVAILBLE SALES",
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
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("customerid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("listtype")) {
      return helper.getErrorResponse(
        false,
        "error",
        "List type missing. Please provide the list type",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    var sql;
    if (querydata.listtype == 1) {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
        sp.cprocess_id processid,
        s.process_name title,
        cr.customer_name,
        DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
        DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
        COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
        (
          SELECT JSON_ARRAYAGG(t.TimelineEvent)
          FROM (
            SELECT JSON_OBJECT(
                     'Eventid', s2.cprocess_id,
                     'Eventname', psl2.Processname,
                     'feedback', s2.feedback,
                     'Allowed_process', psl2.Allowed_process,
                     'pdfpath', s2.salesprocess_path
                   ) AS TimelineEvent
            FROM salesprocesslist s2
            LEFT JOIN processshowlist psl2 
              ON psl2.processshowlist_id = s2.process_type
            WHERE s2.processid = sp.cprocess_id
            ORDER BY s2.cprocess_id ASC
          ) t
        ) AS TimelineEvents  
    FROM salesprocessmaster sp 
    JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
    LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
    LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
    WHERE sp.status = 1 
    AND sp.active_status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
    GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name
    ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
      sp.cprocess_id processid,
      s.process_name title,
      cr.customer_name,
      DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
      DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
      COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
      (
        SELECT JSON_ARRAYAGG(t.TimelineEvent)
        FROM (
          SELECT JSON_OBJECT(
                   'Eventid', s2.cprocess_id,
                   'Eventname', psl2.Processname,
                   'feedback', s2.feedback,
                   'Allowed_process', psl2.Allowed_process,
                   'pdfpath', s2.salesprocess_path
                 ) AS TimelineEvent
          FROM salesprocesslist s2
          LEFT JOIN processshowlist psl2 
            ON psl2.processshowlist_id = s2.process_type
          WHERE s2.processid = sp.cprocess_id
          ORDER BY s2.cprocess_id ASC
        ) t
      ) AS TimelineEvents  
  FROM salesprocessmaster sp 
  JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
  LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
  LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
  WHERE sp.status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
  AND sp.active_status = 1 
  AND sp.customer_id = ?
  GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name;
  `,
          [querydata.customerid]
        );
      }
    } else {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
        sp.cprocess_id processid,
        s.process_name title,
        cr.customer_name,
        DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
        DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
        COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
        (
          SELECT JSON_ARRAYAGG(t.TimelineEvent)
          FROM (
            SELECT JSON_OBJECT(
                     'Eventid', s2.cprocess_id,
                     'Eventname', psl2.Processname,
                     'feedback', s2.feedback,
                     'Allowed_process', psl2.Allowed_process,
                     'pdfpath', s2.salesprocess_path
                   ) AS TimelineEvent
            FROM salesprocesslist s2
            LEFT JOIN processshowlist psl2 
              ON psl2.processshowlist_id = s2.process_type
            WHERE s2.processid = sp.cprocess_id
            ORDER BY s2.cprocess_id ASC
          ) t
        ) AS TimelineEvents 
    FROM salesprocessmaster sp 
    JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
    LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
    LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
    WHERE sp.status = 1 
    AND sp.active_status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
    GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name
    ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
      sp.cprocess_id processid,
      s.process_name title,
      cr.customer_name,
      DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
      DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
      COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
      (
        SELECT JSON_ARRAYAGG(t.TimelineEvent)
        FROM (
          SELECT JSON_OBJECT(
                   'Eventid', s2.cprocess_id,
                   'Eventname', psl2.Processname,
                   'feedback', s2.feedback,
                   'Allowed_process', psl2.Allowed_process,
                   'pdfpath', s2.salesprocess_path
                 ) AS TimelineEvent
          FROM salesprocesslist s2
          LEFT JOIN processshowlist psl2 
            ON psl2.processshowlist_id = s2.process_type
          WHERE s2.processid = sp.cprocess_id
          ORDER BY s2.cprocess_id ASC
        ) t
      ) AS TimelineEvents 
  FROM salesprocessmaster sp 
  JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
  LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
  LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
  WHERE sp.status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
  AND sp.active_status = 1 
  AND sp.customer_id = ?
  GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name;
  `,
          [querydata.customerid]
        );
      }
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales process Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################

async function AddSalesProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD PROCESS OF SALES",
        ""
      );
    }

    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD PROCESS OF SALES",
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
        "ADD PROCESS OF SALES",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD PROCESS OF SALES",
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
        "ADD PROCESS OF SALES",
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
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("processdate") ||
      querydata.processdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process date missing. Please provide the Process date",
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD PROCESS OF SALES",
        secret
      );
    }

    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
      [querydata.processdate, querydata.customerid, userid]
    );
    const objectvalue1 = sql[1][0];
    const processid = objectvalue1["@processid"];
    if (processid != null && processid != "") {
      const [sql1] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,@prolistid); select @prolistid;`,
        ["Requirements", querydata.processdate, userid, processid]
      );
      const objectvalue2 = sql1[1][0];
      const prolistid = objectvalue2["@prolistid"];
      if (prolistid != null && prolistid != "") {
        for (const product of querydata.product) {
          if (
            !product.hasOwnProperty("productname") ||
            !product.hasOwnProperty("productquantity")
          ) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product details are incomplete. Please provide productname and productquantity.",
              "ADD PROCESS OF SALES",
              secret
            );
          } else {
            const [sql2] = await db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,@productid); SELECT @productid;`,
              [product.productname, product.productquantity, prolistid]
            );
            const objectvalue3 = sql2[1][0];
            const productid = objectvalue3["@productid"];
          }

          return helper.getSuccessResponse(
            true,
            "success",
            "Sales Product Added Successfully",
            processid,
            secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error adding the Cusotmer requirements",
          "ADD PROCESS OF SALES",
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Sales Process",
        "ADD PROCESS OF SALES",
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//#####################################################################################################################################################################################
//###############################################################################################################################################################################
//######################################################################################################################################################################################
//######################################################################################################################################################################################

async function AddProcessList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD SALES PROCESS LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD SALES PROCESS LIST",
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
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD SALES PROCESS LIST",
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
        "ADD SALES PROCESS LIST",
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
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales missing. Please provide the Customer sales",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("salesprocesspath") ||
      querydata.salesprocesspath == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process path missing. Please provide the Sales process path.",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales Process date missing. Please provide the Sales Process date",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("processid") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process id missing. Please provide the Sales Process id",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("processtype") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process type missing. Please provide the Sales Process type",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,@prolist); select @prolist;`,
      [
        querydata.custsalesname,
        querydata.salesprocesspath,
        querydata.salesprocessdate,
        userid,
        querydata.processid,
        querydata.processtype,
      ]
    );
    const objectvalue1 = sql[1][0];
    const processlistid = objectvalue1["@prolist"];
    if (processlistid != null && processlistid != "") {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process List Added Successfully",
        processlistid,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Sales Process List",
        "ADD SALES PROCESS LIST",
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

async function GetProcessList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SALES PROCESS LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET SALES PROCESS LIST",
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
        "GET SALES PROCESS LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET SALES PROCESS LIST",
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
        "GET SALES PROCESS LIST",
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
        "GET SALES PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("processid") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "GET SALES PROCESS LIST",
        secret
      );
    }
    // const sql1 = await db.query(`select custsales_name,salesprocess_path,salesprocess_date,Apporved_status from salesprocesslist where processid = ?`,[querydata.processid])
    const sql = await db.query(
      `select custsales_name,salesprocess_path,salesprocess_date,Approved_status from salesprocesslist where processid = ?`,
      [querydata.processid]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Process list Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Process list Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      "GET SALES PROCESS LIST",
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function UpdateProcessList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE SALES PROCESS LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "UPDATE SALES PROCESS LIST",
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
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES PROCESS LIST",
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
        "UPDATE SALES PROCESS LIST",
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
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales name missing. Please provide the Customer sales name",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocesspath") ||
      querydata.salesprocesspath == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process path missing. Please provide the Sales process path",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process date missing. Please provide the Sales process date",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("processlistid") ||
      querydata.cprocessid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process list id missing. Please provide the process ",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    const sql = await db.query(
      `UPDATE salesprocesslist set custsales_name = ?,salesprocess_path = ?, siteprocess_date = ?, process_id = ? where cprocess_id = ?`,
      [
        querydata.custsalesname,
        querydata.salesprocesspath,
        querydata.salesprocessdate,
        querydata.processid,
        querydata.processlistid,
      ]
    );

    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Process list Updated Successfully.",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while updating the data.",
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

async function UpdateSalesProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE SALES PROCESS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "UPDATE SALES PROCESS",
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
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES PROCESS",
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
        "UPDATE SALES PROCESS",
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
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales name missing. Please provide the Customer sales name",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process date missing. Please provide the Sales process date",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "UPDATE SALES PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("cprocessid") || querydata.cprocessid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Client Process id missing. Please provide the Client Process id",
        "UPDATE SALES PROCESS",
        secret
      );
    }
    const sql = await db.query(
      `UPDATE salesprocessmaster SET Client_name = ?,Process_date = ?,Customer_id = ? where cprocess_id = ?`,
      [
        querydata.custsalesname,
        querydata.salesprocessdate,
        querydata.customerid,
        querydata.cprocessid,
      ]
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

async function FetchIdforEvents(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
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
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }
    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH AUTO GENERATED ID FOR EVENTS",
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
        "FETCH AUTO GENERATED ID FOR EVENTS",
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
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("eventtype") || querydata.eventtype == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event type missing. Please provide the event type",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    const sql = await db.query(
      `select customer_type,customer_id,exist_customerid,exist_branchid,customer_name,customer_phoneno,customer_mailid,customer_gstno,billing_address,address,BillingAdddress_name,Process_titile from enquirycustomermaster where customer_id IN(select customer_id from salesprocessmaster where cprocess_id In(select processid from salesprocesslist where cprocess_id in(?)))`,
      [querydata.eventid]
    );
    var eventnumber,
      title,
      customerid,
      customertype,
      branchid,
      gstno,
      emailid,
      contact_number,
      customer_name,
      billing_address,
      billingaddress_name,
      client_address,
      client_addressname,
      product;
    if (sql[0]) {
      customertype = sql[0].customer_type;
      customerid = sql[0].exist_customerid;
      branchid = sql[0].exist_branchid;
      title = sql[0].Process_titile;
      gstno = sql[0].customer_gstno;
      contact_number = sql[0].customer_phoneno;
      customer_name = sql[0].customer_name;
      billing_address = sql[0].billing_address;
      billingaddress_name = sql[0].BillingAdddress_name;
      client_address = sql[0].address;
      client_addressname = sql[0].customer_name;
      emailid = sql[0].customer_mailid;

      if (customertype == 1) {
        if (querydata.eventtype == "invoice") {
          const customercode = "SSIPL-ENQINV";
          const [result1] = await db.spcall(
            `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from quotation_productmaster where process_id = ?`,
            [querydata.eventid]
          );
        } else if (querydata.eventtype == "quotation") {
          const customercode = "SSIPL-ENQQ";
          const [result1] = await db.spcall(
            `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_quotation_id"];
        } else if (querydata.eventtype == "deliverychallan") {
          var ccode;
          const sql = await db.query(
            `SELECT cprocess_gene_id  FROM salesprocesslist 
             WHERE processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
             AND process_type = 5 ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          if (sql[0]) {
            ccode = sql[0].cprocess_gene_id;
          } else {
            ccode = "ssipl-dc/";
          }
          const [result1] = await db.spcall(
            `CALL GenerateDeliverychId(?,?,@p_deliverychallan_id); select @p_deliverychallan_id`,
            [userid, ccode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_deliverychallan_id"];
          product = await db.query(
            `select inv_productid productid,product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from invoice_productmaster where process_id = ? and inv_productid not in (select dc_productid from dc_productmaster)`,
            [querydata.eventid]
          );
        } else if (querydata.eventtype == "requestforquotation") {
          const [result1] = await db.spcall(
            `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
            [userid]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "debitnote") {
          const [result] = await db.query(
            `CALL Generate_debitnote(?,@p_debitnote_id); select @p_debitnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_debitnote_id"];
        } else if (querydata.eventtype == "creditnote") {
          const [result] = await db.query(
            `CALL Generate_creditnote(?,@p_creditnote_id); select @p_creditnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_creditnote_id"];
        } else if (querydata.eventtype == "revisedquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where cprocess_id In(?)`,
            [querydata.eventid]
          );
          if (sql[0]) {
            const ccode = sql[0].cprocess_gene_id;
            const [result] = await db.spcall(
              `CALL Generate_revisedquotation(?,?,@p_quotation_id); select @p_quotation_id`,
              [userid, ccode]
            );
            const objectValue = result[1][0];
            eventnumber = objectValue["@p_quotation_id"];
            product = await db.query(
              `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from revisedquotation_productmaster where process_id = ?`,
              [querydata.eventid]
            );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Event id not found",
              "GET THE EVENT NUMBER",
              secret
            );
          }
        }
      } else if (customertype == 2) {
        var sql1, sql2, customercode;
        if (customerid != 0 && customerid != "") {
          sql1 = await db.query1(
            `select ccode from customercode where customer_id IN (?)`,
            [customerid]
          );
        } else {
          sql2 = await db.query1(
            `select branch_code from branchmaster where branch_id in(?)`,
            branchid
          );
        }
        if (sql1[0]) {
          customercode = sql1[0].ccode;
        } else if (sql2[0]) {
          customercode = sql2[0].branch_code;
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Company or branch id not found",
            "GET THE EVENT NUMBER",
            secret
          );
        }
        if (querydata.eventtype == "invoice") {
          const [result1] = await db.spcall(
            `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
          product = await db.query(
            `select product_name productname,product_quantity productquantity, product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from quotation_productmaster where process_id = ?`,
            [querydata.eventid]
          );
        } else if (querydata.eventtype == "quotation") {
          const [result1] = await db.spcall(
            `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_quotation_id"];
        } else if (querydata.eventtype == "deliverychallan") {
          const [result1] = await db.spcall(
            `CALL GenerateDeliverychId(?,@p_deliverychallan_id); select @p_deliverychallan_id`,
            [userid]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_deliverychallan_id"];
          product = await db.query(
            `select inv_productid productid,product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from invoice_productmaster where process_id = ? and inv_productid not in (select dc_productid from dc_productmaster)`,
            [querydata.eventid]
          );
        } else if (querydata.eventtype == "requestforquotation") {
          const [result1] = await db.spcall(
            `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
            [userid]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "debitnote") {
          const [result] = await db.query(
            `CALL Generate_debitnote(?,@p_debitnote_id); select @p_debitnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_debitnote_id"];
        } else if (querydata.eventtype == "creditnote") {
          const [result] = await db.query(
            `CALL Generate_creditnote(?,@p_creditnote_id); select @p_creditnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_creditnote_id"];
        } else if (querydata.eventtype == "revisedquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where cprocess_id In(?)`,
            [querydata.eventid]
          );
          if (sql[0]) {
            const ccode = sql[0].cprocess_gene_id;
            const [result] = await db.query(
              `CALL Generate_revisedquotation(?,?,@p_quotation_id); select @p_quotation_id`,
              [userid, ccode]
            );
            const objectValue = result[1][0];
            eventnumber = objectValue["@p_quotation_id"];
            product = await db.query(
              `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from revisedquotation_productmaster where process_id = ?`,
              [querydata.eventid]
            );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Event id not found",
              "GET THE EVENT NUMBER",
              secret
            );
          }
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Please provide the valid customer",
          "FETCH AUTO GENERATED ID FOR EVENTS",
          secret
        );
      }
    }
    if (eventnumber != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Event number fetched successfully",
        {
          eventnumber: eventnumber,
          title: title,
          gstnumber: gstno,
          emailid: emailid,
          contact_number: contact_number,
          billing_address: billing_address,
          billingaddress_name: billingaddress_name,
          client_address: client_address,
          client_addressname: client_addressname,
          product: product,
        },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Event number",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }
  } catch (er) {
    console.log(er);
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

async function GetProcessShow(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS SHOW LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET PROCESS SHOW LIST",
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
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET PROCESS SHOW LIST",
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
        "GET PROCESS SHOW LIST",
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

        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("currentprocess") ||
      querydata.currentprocess == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Current process missing. Please provide the Current process",
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    const sql = await db.query(
      `select Allowed_process from processshowlist where processname = ? and status = 1`,
      [querydata.currentprocess]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Allowed Process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Process not found",
        "GET PROCESS SHOW LIST",
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

async function GetProcessCustomer(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET PROCESS CUSTOMER",
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
        "GET PROCESS CUSTOMER",
        secret
      );
    }

    const sql =
      await db.query(`select Customer_id, customer_name,customer_phoneno,customer_gstno from enquirycustomermaster where customer_id In
      (select customer_id from salesprocessmaster where status = 1 and active_status = 1 and deleted_flag = 0);`);
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Process customer Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Process customer Fetched Successfully",
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

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function GetCustomerList(sales) {
//   try {
//     // Check if the session token exists
//     if (!sales.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken missing. Please provide the Login sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }

//     // Validate session token length
//     if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [sales.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }
//     var secret = sales.STOKEN.substring(0, 16);
//     const [result1] = await db.spcall(
//       `CALL Gen_sub_reqId(?,?,@p_req_id); select @p_req_id`,
//       [userid]
//     );
//     const objectValue = result1[1][0];
//     const Sub_requirement_id = objectValue["@p_req_id"];

//     const sql = await db.query1(
//       `select Customer_id, customer_name from customermaster where status = 1 and deleted_flag = 0;`
//     );
//     if (sql[0]) {
//       return helper.getSuccessResponse(true, Sub_requirement_id, sql, secret);
//     } else {
//       return helper.getErrorResponse(
//         false,
//         "Customers not available",
//         "GET CUSTOMER LIST",
//         secret
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "Internal Error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function GetCustomerList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER LIST",
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
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Fetch customer list
    const sql = await db.query1(
      `SELECT Customer_id, customer_name,ccode FROM customermaster WHERE status = 1 AND deleted_flag = 0;`
    );
    try {
      if (sql[0]) {
        const customerList = sql;
        // Generate unique Sub_requirement_id for all customers in parallel
        const promises = customerList.map(async (customer) => {
          const [result1] = await db.spcall(
            `CALL Gen_sub_reqId(?,?,@p_req_id); SELECT @p_req_id;`,
            [userid, customer.ccode]
          );
          const objectValue = result1[1][0];
          customer.Sub_requirement_id = objectValue["@p_req_id"];
        });

        // Wait for all Sub_requirement_id generation to complete
        await Promise.all(promises);
        // Return success response with the updated customer list
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer list retrieved",
          customerList,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
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
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetCustomerDetails(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      const sql = await db.query1(
        `SELECT customer_id,customer_name,Email_id,Admin_username,Contact_no,Address,Billing_address,
        (SELECT gstno FROM branchmaster WHERE branchmaster.customer_id = customermaster.customer_id LIMIT 1) AS gstno FROM customermaster WHERE status = 1 AND deleted_flag = 0;`
      );
      if (sql[0]) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer Details Fetched Successfully",
          sql,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
          secret
        );
      }
    } else {
      var secret = sales.STOKEN.substring(0, 16);
      var querydata;

      // Decrypt querystring
      try {
        querydata = await helper.decrypt(sales.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "GET CUSTOMER LIST",
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
          "GET CUSTOMER LIST",
          secret
        );
      }

      // Validate required fields
      if (
        !querydata.hasOwnProperty("customerid") ||
        querydata.custsalesname == ""
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Customer id missing. Please provide the Customer id",
          "GET CUSTOMER LIST",
          secret
        );
      }
      const sql = await db.query1(
        `SELECT customer_id,customer_name,Email_id,Admin_username,Contact_no,Address,Billing_address,
      (SELECT gstno FROM branchmaster WHERE branchmaster.customer_id = customermaster.customer_id LIMIT 1) AS gstno FROM customermaster WHERE status = 1 AND deleted_flag = 0 and customer_id =?;`,
        [querydata.customerid]
      );
      if (sql[0]) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer Details Fetched Successfully",
          sql,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
          secret
        );
      }
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

//############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getQuotationId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH QUOTATION ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH QUOTATION ID",
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
        "FETCH QUOTATION ID",
        secret
      );
    }

    const customercode = "ssipl-quo";
    const [result1] = await db.spcall(
      `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
      [userid, customercode]
    );
    const objectValue = result1[1][0];
    const Quotationid = objectValue["@p_quotation_id"];
    if (Quotationid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Quotation id fetched successfully",
        { Quotationid: Quotationid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Customer Quotation id",
        "FETCH QUOTATION ID",
        secret
      );
    }
  } catch (er) {
    console.log(er);
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getInvoiceId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH INVOICE ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH INVOICE ID",
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
        "FETCH INVOICE ID",
        secret
      );
    }

    const customercode = "ssipl-inv";
    const [result1] = await db.spcall(
      `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
      [userid, customercode]
    );
    const objectValue = result1[1][0];
    const Invoiceid = objectValue["@p_invoice_id"];
    if (Invoiceid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Invoice id fetched successfully",
        { Invoiceid: Invoiceid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Customer Invoice id",
        "FETCH INVOICE ID",
        secret
      );
    }
  } catch (er) {
    console.log(er);
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getDeliveryChalnId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH DELIVERY CHALLAN ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH DELIVERY CHALLAN ID",
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
        "FETCH DELIVERY CHALLAN ID",
        secret
      );
    }

    const customercode = "ssipl-dc";
    const [result1] = await db.spcall(
      `CALL GenerateDeliverychId(?,@p_deliverychallan_id); select @p_deliverychallan_id`,
      [userid]
    );
    const objectValue = result1[1][0];
    const DeliveryChallanid = objectValue["@p_deliverychallan_id"];
    if (DeliveryChallanid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Delivery challan id fetched successfully",
        { DeliveryChallanid: DeliveryChallanid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching id for the Delivery Challan",
        "FETCH DELIVERY CHALLAN ID",
        secret
      );
    }
  } catch (er) {
    console.log(er);
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

async function getRequestforQuotationId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH REQUEST FOR QUOTATION ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH REQUEST FOR QUOTATION ID",
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
        "FETCH REQUEST FOR QUOTATION ID",
        secret
      );
    }

    const customercode = "ssipl-rfq";
    const [result1] = await db.spcall(
      `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
      [userid]
    );
    const objectValue = result1[1][0];
    const Requestforquotationid = objectValue["@p_rfq_id"];
    if (Requestforquotationid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Request for Quotation id fetched successfully",
        { Requestforquotationid: Requestforquotationid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching id for the Request for quotation",
        "FETCH REQUEST FOR QUOTATION ID",
        secret
      );
    }
  } catch (er) {
    console.log(er);
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

async function getCusReq(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET CUSTOMER REQUIREMENT",
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
        "GET CUSTOMER LIST",
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
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("processid") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "process id missing. Please provide the process id",
        "GET CUSTOMER LIST",
        secret
      );
    }
    const sql = await db.query(
      `select cm.Customer_id,cm.customer_name,cm.customer_mailid,cm.customer_phoneno,cm.customer_gstno,cm.address,cm.billing_address,cm.pdf_path,cr.custsales_name,
      cr.salesprocess_date,cr.cprocess_gene_id from salesprocesslist cr,enquirycustomermaster cm,salesprocessmaster sp where cm.customer_id = sp.customer_id and sp.cprocess_id = cr.processid and cr.processid = ?`,
      [querydata.processid]
    );
    if (sql[0]) {
      const pdfpath = sql[0].pdf_path;
      var pdfbinary;
      if (pdfpath != null) {
        pdfbinary = await helper.convertFileToBinary(pdfpath);
      }
      try {
        if (secret != null && secret != "") {
          const returnstr = JSON.stringify({
            code: true,
            status: "success",
            message: "Customer requiement fetched Successfully",
            data: sql,
            pdfpath,
            pdfbinary,
          });
          encryptedResponse = await helperencrypt(returnstr, secret);
          return { encryptedResponse };
        } else {
          return {
            code: true,
            status: "success",
            message: "Customer requiement fetched Successfully",
            data: sql,
            pdfpath,
            pdfbinary,
          };
        }
      } catch (er) {
        return {
          code: true,
          status: "success",
          message: "Customer requiement fetched Successfully",
          data: sql,
          pdfpath,
          pdfbinary,
        };
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Customers not available",
        "GET CUSTOMER LIST",
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
//##################################################################################################################################################################################################

async function addQuotation(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadQuotationp(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD QUOTATION"
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD QUOTATION",
        secret
      );
    }
    //
    // // if (!querydata.hasOwnProperty("producthsn") || querydata.producthsn == "") {
    // //   return helper.getErrorResponse(
    // //     false,
    // //     "Product HSN missing. Please provide the Product hsn",
    // //     "ADD QUATATION",
    // //     secret
    // //   );
    // // }
    // // if (!querydata.hasOwnProperty("productgst") || querydata.productgst == "") {
    // //   return helper.getErrorResponse(
    // //     false,
    // //     "Client GST Number missing. Please provide the Client GST number",
    // //     "ADD QUATATION",
    // //     secret
    // //   );
    // // }
    // // if (
    // //   !querydata.hasOwnProperty("productprice") ||
    // //   querydata.productprice == ""
    // // ) {
    // //   return helper.getErrorResponse(
    // //     false,
    // //     "Product Price missing. Please provide the Product price",
    // //     "ADD QUATATION",
    // //     secret
    // //   );
    // // }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD QUATATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD QUATATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD QUOTATION",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("quotationgenid") ||
      querydata.quotationgenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Quatation generated id missing. Please provide the Quotation id",
        "ADD QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD QUOTATION",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.title,
        userid,
        querydata.processid,
        querydata.quotationgenid,
        2,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var Quoteid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD QUATATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.quotationgenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Quoteid = objectvalue3["@quoteid"];
        }
        const sql = await db.query(
          `Update generatequotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
        );
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
          EmailSent = await mailer.sendQuotation(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Quotation from Sporada Secure India Private Limited",
            "quotationpdf.html",
            ``,
            "QUOTATION_PDF_SEND",
            req.file.path,
            querydata.feedback,
            querydata.ccemail
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
            mailer.sendQuotation(
              querydata.clientaddressname,
              querydata.emailid,
              "Your Quotation from Sporada Secure India Private Limited",
              "quotationpdf.html",
              ``,
              "QUOTATION_PDF_SEND",
              req.file.path,
              querydata.feedback,
              querydata.ccemail
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
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Quotation added successfully",
          {
            quotationid: Quoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Quotation.",
        "ADD QUOTATION",
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

async function Dummy(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD INVOICE",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD INVOICE",
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
        "ADD INVOICE",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD INVOICE",
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
        "ADD INVOICE",
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
        "ADD INVOICE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("gstno") || querydata.gstno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Gst number missing. Please provide the Gst number",
        "ADD INVOICE",
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
        "ADD INVOICE",
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
        "ADD INVOICE",
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
        "ADD INVOICE",
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
        "ADD INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("pdfpath") || querydata.pdfpath == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Pdf path missing. Please provide the pdf path.",
        "ADD INVOICE",
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
        "Invoice generated id missing. Please provide the Invoice id",
        "ADD INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD INVOICE",
        secret
      );
    }
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE(?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.gstno,
        userid,
        querydata.processid,
        querydata.invoicegenid,
        3,
        querydata.pdfpath,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var Quoteid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD INVOICE",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.invoicegenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Quoteid = objectvalue3["@quoteid"];
        }
        const sql = await db.query(
          `Update generateinvoiceid set status = 0 where invoice_id = '${querydata.invoicegenid}'`
        );
        return helper.getSuccessResponse(
          true,
          "success",
          "Invoice added successfully",
          Quoteid,
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Quotation.",
        "ADD INVOICE",
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

async function addDeliveryChallan(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadDeliverychln(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD DELIVERY CHALLAN FOR PROCESS"
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
      0;
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the Feedback.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("dcgenid") || querydata.dcgenid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Delivery challan id missing. Please provide the Delivery Challan id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gst_number")) {
      return helper.getErrorResponse(
        false,
        "error",
        "GST number missing. Please provide the GST number.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Date missing. Please provide the Date.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("productfeedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Product feedback missing. Please provide the Product feedback.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE(?,?,?,?,?,?,?,?,?,?,?,@invoiceid); select @invoiceid;`,
      [
        querydata.clientaddressname,
        querydata.gst_number,
        userid,
        querydata.processid,
        querydata.dcgenid,
        5,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const deliverychallanid = objectvalue2["@invoiceid"];
    var deliverychallan;
    if (deliverychallanid != null && deliverychallanid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productid") ||
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productid, productname ,productquantity, producthsn, productgst,producttotal,productsno and productprice.",
            "ADD DELIVERY CHALLAN",
            secret
          );
          // return helper.getErrorResponse(false,"error","Product details are incomplete. Please provide the Productname, Productquantity,producthsn")
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_DELIVERYCHALLAN_ADD(?,?,?,?,?,?,?,?,?,?,?,?,@dcid); SELECT @dcid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.dcgenid,
              JSON.stringify(querydata.notes),
              req.file.path,
              deliverychallanid,
              product.productsno,
              product.producttotal,
              product.productid,
            ]
          );
          const objectvalue2 = sql1[1][0];
          deliverychallan = objectvalue2["@dcid"];
          // Quoteid = objectvalue3["@quoteid"];
        }
        const sql2 = await db.query(
          `Update salesprocesslist set feedback = '${querydata.productfeedback}' where dc_id IN('${querydata.dcgenid}')`
        );
        const sql = await db.query(
          `Update generatedeliverychallanid set status = 0 where dc_id IN('${querydata.dcgenid}')`
        );
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
          EmailSent = await mailer.sendQuotation(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Delivery Challlan from Sporada Secure India Private Limited",
            "deliverychallanpdf.html",
            ``,
            "DELIVERYCHALLAN_PDF_SEND",
            req.file.path,
            querydata.feedback,
            querydata.ccemail
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
            mailer.sendQuotation(
              querydata.clientaddressname,
              querydata.emailid,
              "Your Delivery Challlan from Sporada Secure India Private Limited",
              "deliverychallanpdf.html",
              ``,
              "DELIVERYCHALLAN_PDF_SEND",
              req.file.path,
              querydata.feedback,
              querydata.ccemail
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
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Delivery challan added successfully",
          {
            dcid: deliverychallanid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Delivery Challan.",
        "ADD DELIVERY CHALLAN",
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

async function addFeedback(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD FEEDBACK FOR EVENTS",
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
        "ADD FEEDBACK FOR EVENTS",
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
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback") || querydata.feedback == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }
    const sql = await db.query(
      `Update salesprocesslist set feedback = ? where cprocess_id = ?`,
      [querydata.feedback, querydata.eventid]
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Feedback added successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Failed to add feedback",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getBinaryFile(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select salesprocess_path from salesprocesslist where cprocess_id = ?`,
      [querydata.eventid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].salesprocess_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].salesprocess_path);
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function DeleteProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "DELETE PROCESS OF THE CUSTOMER",
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
        "DELETE PROCESS OF THE CUSTOMER",
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
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the process id",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    const processIdsString = querydata.processid
      .map((id) => `'${id}'`)
      .join(",");
    const sql = await db.query(
      `UPDATE salesprocessmaster SET status = 0, deleted_flag = 0, active_status = 0 WHERE cprocess_id IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process Deleted Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Sales Process found to delete",
        "DELETE PROCESS OF THE CUSTOMER",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function ArchiveProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ARCHIVE PROCESS OF THE CUSTOMER",
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
        "ARCHIVE PROCESS OF THE CUSTOMER",
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
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the process id",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("type")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Archive type missing. Please provide the archive type",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    const processIdsString = querydata.processid
      .map((id) => `'${id}'`)
      .join(",");
    const sql = await db.query(
      `UPDATE salesprocessmaster SET archive_status = ${querydata.type} WHERE cprocess_id IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process Archived Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Sales Process found to archive",
        "DELETE PROCESS OF THE CUSTOMER",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addRFQ(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadRFQuotation(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD REQUEST FOR QUOTATION"
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD REQUEST FOR QUATATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("rfqgenid") || querydata.rfqgenid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Request for Quatation generated id missing.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.title,
        userid,
        querydata.processid,
        querydata.rfqgenid,
        6,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var Rfqid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD REQUEST FOR QUOTATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_RFQ_ADD(?,?,?,?,?,?,?,?,?,?,?,@rfqid); SELECT @rfqid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.rfqgenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Rfqid = objectvalue3["@rfqid"];
        }
        const sql = await db.query(
          `Update generaterfqid set status = 0 where quotation_id = '${querydata.rfqgenid}'`
        );
        // Send Email or WhatsApp Message
        if (querydata.messagetype == 1 || querydata.messagetype == 3) {
          EmailSent = await mailer.sendInvoice(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Request for Quotation from Sporada Secure India Private Limited",
            "rfgpdf.html",
            ``,
            "RFQ_PDF_SEND",
            req.file.path
          );
        } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
          WhatsappSent = await axios.post(
            `${config.whatsappip}/billing/sendpdf`,
            {
              phoneno: querydata.phoneno,
              feedback: `We hope you're doing well. Please find attached your invoice with Sporada Secure.`,
              pdfpath: req.file.path,
            }
          );
          if (WhatsappSent.data.code == true) {
            WhatsappSent = WhatsappSent.data.code;
          } else {
            WhatsappSent = WhatsappSent.data.code;
          }
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Request for Quotation added successfully",
          {
            rfqid: Rfqid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the request for Quotation.",
        "ADD REQUEST FOR QUOTATION",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addRevisedQuotation(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadRFQuotation(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD REVISED QUOTATION FOR PROCESS"
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("quotationgenid") ||
      querydata.quotationgenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Revised Quotation generated id missing.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.clientaddressname,
        userid,
        querydata.processid,
        querydata.quotationgenid,
        3,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var RevQuoteid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD REVISED QUOTATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_REVISEDQUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?,@revquoteid); SELECT @revquoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.quotationgenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          RevQuoteid = objectvalue3["@revquoteid"];
        }
        const sql = await db.query(
          `Update generaterevisedquotationid set status = 0 where revquotation_id IN('${querydata.quotationgenid}')`
        );
        // Send Email or WhatsApp Message
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
          EmailSent = await mailer.sendQuotation(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Revised Quotation from Sporada Secure India Private Limited",
            "revisedquotationpdf.html",
            ``,
            "REVISEDQUOTATION_PDF_SEND",
            req.file.path,
            querydata.feedback,
            querydata.ccemail
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
            mailer.sendQuotation(
              querydata.clientaddressname,
              querydata.emailid,
              "Your Revised Quotation from Sporada Secure India Private Limited",
              "revisedquotationpdf.html",
              ``,
              "REVISEDQUOTATION_PDF_SEND",
              req.file.path,
              querydata.feedback,
              querydata.ccemail
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
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Revised Quotation added successfully",
          {
            rfqid: RevQuoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Revised Quotation.",
        "ADD REVISED QUOTATION FOR PROCESS",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addCreditNote(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadCreditNote(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD CREDIT NOTE FOR PROCESS"
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("creditnoteid") ||
      querydata.creditnoteid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Credit note generated id missing.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback") || querydata.feedback == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.clientaddressname,
        userid,
        querydata.processid,
        querydata.creditnoteid,
        7,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const creditnoteid = objectvalue2["@prolistid"];
    var Creditnoteid;
    if (creditnoteid != null && creditnoteid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD CREDIT NOTE",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_CREDITNOTE_ADD(?,?,?,?,?,?,?,?,?,?,?,@crdnteid); SELECT @crdnteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.creditnoteid,
              JSON.stringify(querydata.notes),
              req.file.path,
              creditnoteid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Creditnoteid = objectvalue3["@crdnteid"];
        }
        const sql = await db.query(
          `Update generatecreditnteid set status = 0 where creditnotegen_id = '${querydata.creditnoteid}'`
        );
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
            "Your Credit Note from Sporada Secure India Private Limited",
            "quotationpdf.html",
            ``,
            "CREDITNOTE_PDF_SEND",
            req.file.path
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
              "Your Credit Note from Sporada Secure India Private Limited",
              "quotationpdf.html",
              ``,
              "CREDITNOTE_PDF_SEND",
              req.file.path
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
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Credit note added successfully",
          {
            creditnoteid: Creditnoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Credit Note.",
        "ADD CREDIT NOTE FOR PROCESS",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addDebitNote(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadCreditNote(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD DEBIT NOTE FOR PROCESS"
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
        "ADD DEBIT NOTE FOR PROCESS",
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
        "ADD DEBIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("creditnoteid") ||
      querydata.creditnoteid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Credit note generated id missing.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.title,
        userid,
        querydata.processid,
        querydata.creditnoteid,
        7,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const creditnoteid = objectvalue2["@prolistid"];
    var RevQuoteid;
    if (creditnoteid != null && creditnoteid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD CREDIT NOTE",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_CREDITNOTE_ADD(?,?,?,?,?,?,?,?,?,?,?,@revquoteid); SELECT @revquoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.creditnoteid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              creditnoteid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          RevQuoteid = objectvalue3["@revquoteid"];
        }
        const sql = await db.query(
          `Update generatecreditnteid set status = 0 where creditnotegen_id = '${querydata.creditnoteid}'`
        );
        // Send Email or WhatsApp Message
        if (querydata.messagetype == 1 || querydata.messagetype == 3) {
          EmailSent = await mailer.sendInvoice(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Credit Note from Sporada Secure India Private Limited",
            "quotationpdf.html",
            ``,
            "QUOTATION_PDF_SEND",
            req.file.path
          );
        }
        if (querydata.messagetype == 2 || querydata.messagetype == 3) {
          WhatsappSent = await axios.post(
            `${config.whatsappip}/billing/sendpdf`,
            {
              phoneno: querydata.phoneno,
              feedback: `We hope you're doing well. Please find attached your credit note with Sporada Secure.`,
              pdfpath: req.file.path,
            }
          );
          if (WhatsappSent.data.code == true) {
            WhatsappSent = WhatsappSent.data.code;
          } else {
            WhatsappSent = WhatsappSent.data.code;
          }
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Credit note added successfully",
          {
            rfqid: RevQuoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Revised Quotation.",
        "ADD CREDIT NOTE FOR PROCESS",
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

async function getProducts(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE AVAILABLE PRODUCTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE AVAILABLE PRODUCTS",
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
        "GET THE AVAILABLE PRODUCTS",
        secret
      );
    }
    const sql = await db.query(
      `select product_name,product_hsn,product_price,product_gst from productmaster where status = 1`
    );

    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Products Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Products Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getNotes(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE NOTES",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE NOTES",
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
        "GET THE NOTES",
        secret
      );
    }
    const sql = await db.query(
      `select notes from notesmaster where status = 1`
    );

    if (sql[0]) {
      const allNotes = sql.flatMap((row) => JSON.parse(row.notes));
      return helper.getSuccessResponse(
        true,
        "success",
        "Notes Fetched successfully",
        { notes: allNotes },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Notes Fetched successfully",
        { notes: [] },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function salesData(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH SALES DATA",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH SALES DATA",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SALES DATA",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH SALES DATA",
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
        "FETCH SALES DATA",
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
        "FETCH SALES DATA",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("salesperiod") ||
      querydata.salesperiod == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales period missing. Please provide the sales period",
        "FETCH SALES DATA",
        secret
      );
    }
    var sql;
    let startDate;

    if (querydata.salesperiod === "monthly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (querydata.salesperiod === "yearly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    sql = await db.query(
      `SELECT 
          SUM(product_total) AS Total_amount,
          COUNT(inv_productid) AS Total_invoices,
          SUM(CASE WHEN payment_status = 1 THEN product_total ELSE 0 END) AS Paid_total,
          COUNT(CASE WHEN payment_status = 1 THEN inv_productid ELSE NULL END) AS Paid_invoices,
          SUM(CASE WHEN payment_status = 0 THEN product_total ELSE 0 END) AS Pending_total,
          COUNT(CASE WHEN payment_status = 0 THEN inv_productid ELSE NULL END) AS Pending_invoices
       FROM invoice_productmaster 
       WHERE status = 1 AND DATE(Row_updated_date) >= ?`,
      [startDate.toISOString().split("T")[0]]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales data fetched successfully",
        {
          totalamount: sql[0].Total_amount,
          paidamount: sql[0].Paid_total,
          unpaidamount: sql[0].Pending_total,
          totalinvoices: sql[0].Total_invoices,
          paidinvoices: sql[0].Paid_invoices,
          unpaidinvoices: sql[0].Pending_invoices,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales data fetched successfully",
        {
          totalamount: 0,
          paidamount: 0,
          unpaidamount: 0,
          totalinvoices: 0,
          paidinvoices: 0,
          unpaidinvoices: 0,
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

async function clientProfile(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH CLIENT PROFILE DATE",
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
        "FETCH CLIENT PROFILE DATE",
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
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the customer id",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }
    var sql;
    let startDate;

    sql = await db.query(
      `SELECT customer_name, customer_mailid, customer_phoneno, customer_gstno, 
      Address, Billing_address, billingadddress_name, Customer_type,exist_customerid,exist_branchid,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND status = 1) AS total_process,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND active_status = 1 AND status = 1) AS active_process,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND active_status = 0 AND status = 1) AS inactive_process
FROM enquirycustomermaster c
WHERE customer_id = ? and status =1`,
      [querydata.customerid]
    );
    var customertype, companycount, sitecount;
    if (sql[0]) {
      if (sql[0].Customer_type == 1) {
        customertype = "Enquiry";
        companycount = 0;
        sitecount = 0;
      } else {
        var sql1;
        if (sql[0].exist_customerid != 0) {
          sql1 = await db.query1(
            `SELECT COUNT(*) AS companycount, Customer_type,(SELECT COUNT(*) FROM branchmaster WHERE customer_id = c.customer_id) AS branch_count
     FROM customermaster c WHERE customer_id = ?`,
            [sql[0].exist_customerid]
          );
        } else if (sql[0].exist_branchid != 0) {
          sql1 = await db.query1(
            `SELECT COUNT(*) AS branch_count, c.Customer_type,(SELECT COUNT(*) FROM customermaster WHERE customer_id IN  (SELECT customer_id FROM branchmaster WHERE branch_id = b.branch_id)) AS companycount FROM branchmaster b JOIN customermaster c ON b.customer_id = c.customer_id WHERE b.branch_id = ?`,
            [sql[0].exist_branchid]
          );
        }
        if (sql1[0].Customer_type == 1) {
          customertype = "Company";
        } else {
          customertype = "Organization";
        }
        companycount = sql1[0].companycount;
        sitecount = sql1[0].branch_count;
      }
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Client Profile Data fetched successfully",
        {
          customername: sql[0].customer_name,
          mailid: sql[0].customer_mailid,
          Phonenumber: sql[0].customer_phoneno,
          gstnumber: sql[0].customer_gstno,
          clientaddress: sql[0].Address,
          clientaddressname: sql[0].customer_name,
          billingaddress: sql[0].Billing_address,
          billingaddressname: sql[0].billingadddress_name,
          totalprocess: sql[0].total_process,
          inactive_process: sql[0].inactive_process,
          activeprocess: sql[0].active_process,
          clienttype: customertype,
          companycount: companycount,
          sitecount: sitecount,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Client Profile Data fetched successfully",
        {
          customername: "",
          mailid: "",
          Phonenumber: "",
          gstnumber: "",
          clientaddress: "",
          clientaddressname: "",
          billingaddress: "",
          billingaddressname: "",
          clienttype: "",
          totalprocess: 0,
          inactive_process: 0,
          activeprocess: 0,
          companycount: 0,
          sitecount: 0,
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

module.exports = {
  addsale,
  UpdateenqCustomer,
  uploadMor,
  addInvoice,
  uploadCustomerReq,
  uploadQuotatation,
  uploadDeliveryChallan,
  uploadRFQ,
  getProcesslist,
  AddSalesProcess,
  AddProcessList,
  GetProcessList,
  UpdateSalesProcess,
  UpdateProcessList,
  FetchIdforEvents,
  GetProcessShow,
  GetProcessCustomer,
  GetCustomerList,
  GetCustomerDetails,
  getDeliveryChalnId,
  getRequestforQuotationId,
  getCusReq,
  getQuotationId,
  getInvoiceId,
  addQuotation,
  Dummy,
  addDeliveryChallan,
  addFeedback,
  getBinaryFile,
  DeleteProcess,
  ArchiveProcess,
  addRFQ,
  addRevisedQuotation,
  addCreditNote,
  addDebitNote,
  getProducts,
  getNotes,
  salesData,
  clientProfile,
};

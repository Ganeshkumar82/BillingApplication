const db = require("../db");
// const config = require('../config');
const helper = require("../helper");
const config = require("../config");
const mailer = require("../mailer");
const axios = require("axios");
const { query } = require("express");
const passwordValidator = require("password-validator");
// const smsClient = require("../smsclient");

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetCustomerDetails(admin) {
  try {
    if (!admin?.customerid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing.",
        "GET CUSTOMER DETAILS",
        ""
      );
    }
    const sql = await db.spcall(
      `select * from customermaster where customer_id = ?`,
      [admin.customerid]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Details Fetched Successfully.",
        sql,
        ""
      );
    } else {
      return helper.getErrorResponse(false, "error", sql, "");
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      ""
    );
  }
}

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function Login(admin, clientIp) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER LOGIN",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER LOGIN",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "LOGIN",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER LOGIN",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER LOGIN",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER LOGIN",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER LOGIN",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER LOGIN",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "LOGIN",
          user.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "LOGIN",
          user.Secret
        );
    }
    if (querydata.password.length < 5 || querydata.password.length > 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid password. Please check your password and try again.",
        "LOGIN",
        admin.Secret
      );
    }

    var userid;
    //Validation RULE 4. Check if the username & Password is matched
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "LOGIN",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
    }

    const [result1] = await db.spcall(
      "CALL SP_USER_EXIST(?,?,?,@result);select @result;",
      [querydata.username, querydata.password, utype]
    );
    const objectValue = result1[1][0];
    if (objectValue["@result"] == null || objectValue["@result"] == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Incorrect username or password. Please verify your username/password and try again.",
        "LOGIN",
        admin.Secret
      );
    } else {
      const [result2] = await db.spcall(
        "CALL SP_USER_LOGIN(?,?,@result);select @result;",
        [objectValue["@result"], clientIp]
      );
      const objectValue1 = result2[1][0];
      const SESSIONTOKEN = objectValue1["@result"];
      try {
        const returnstr = JSON.stringify({
          code: true,
          status: "success",
          message: "Login successfull",
          data: { userid: objectValue["@result"], SESSIONTOKEN: SESSIONTOKEN },
          // userid: objectValue["@result"],
          // SESSIONTOKEN,
        });
        if (admin.Secret != "") {
          const encryptedResponse = await helper.encrypt(
            returnstr,
            admin.Secret
          );
          // console.log("returnstr=>"+JSON.stringify(encryptedResponse));
          return { encryptedResponse };
        } else {
          return {
            code: true,
            status: "success",
            message: "Login successfull",
            data: {
              userid: objectValue["@result"],
              SESSIONTOKEN: SESSIONTOKEN,
            },
            // userid: objectValue["@result"],
            // SESSIONTOKEN,
          };
        }
      } catch (Ex) {
        return {
          code: true,
          status: "success",
          message: "Login successfull",
          data: { userid: objectValue["@result"], SESSIONTOKEN: SESSIONTOKEN },
          // userid: objectValue["@result"],
          // SESSIONTOKEN,
        };
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      admin.Secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function ForgotPassword(admin, clientIp) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER FORGOT PASSWORD",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER FORGOT PASSWORD",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "USER FORGOT PASSWORD ",
          admin.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "USER FORGOT PASSWORD",
          admin.Secret
        );
    }

    var userid;
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
      if (isEmailID == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["0", querydata.username]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp email->" + otpText);
        if (otpText != null) {
          EmailSent = await mailer.sendEmail(
            "User",
            querydata.username,
            "Forgot password",
            "sendotp.html",
            otpText,
            "LOGIN_FORGET_PASSWORD"
          );
          return helper.getSuccessResponse(
            true,
            "success",
            "Forgot Password OTP sent successfully to your email.",
            otpText,
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while sending OTP. Please try again.",
            "USER FORGOT PASSWORD",
            admin.Secret
          );
        }
      } else if (isphone == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["1", querydata.username]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp mobile->" + otpText);
        if (otpText != null) {
          console.log("phone no ->" + querydata.username);
          // smsClient.sendSMS("sporad", querydata.username, "2", otpText);
          return helper.getSuccessResponse(
            true,
            "success",
            "Forgot password OTP sent Successfully to your Phone.",
            otpText,
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while sending the OTP. Please try again",
            "USER FORGOT PASSWORD",
            admin.Secret
          );
        }
      } else {
        const sql = await db.query(
          `select Email_id from usermaster where username = '${querydata.username}' and status = 1`
        );
        if (sql.length > 0) {
          const emailid = sql[0].Email_id;
          const [result] = await db.spcall(
            "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
            ["0", emailid]
          );
          const objectvalue = result[1][0];
          const otpText = objectvalue["@result"];
          console.log("otp email->" + otpText);
          if (otpText != null) {
            EmailSent = await mailer.sendEmail(
              "User",
              emailid,
              "Forgot password",
              "sendotp.html",
              otpText,
              "LOGIN_FORGET_PASSWORD"
            );
            return helper.getSuccessResponse(
              true,
              "success",
              "Forgot Password OTP sent successfully to your email.",
              otpText,
              admin.Secret
            );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Error while sending OTP. Please try again.",
              "USER FORGOT PASSWORD",
              admin.Secret
            );
          }
        }
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "Internal error. Please contact Administration",
      er,
      admin.Secret
    );
  }
}

//###########################################################################################################################################################################################
//##################################################################################################################################################################################
async function verifyOTP(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "VERIFY USER OTP",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "VERIFY USER OTP",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("OTP") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "OTP missing. Please provide the OTP",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    var otpresult = 0;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "VERIFY USER OTP",
          admin.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "VERIFY USER OTP",
          admin.Secret
        );
    }

    var userid;
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "VERIFY USER OTP",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
      if (isEmailID == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
          [0, querydata.username, querydata.OTP]
        );
        const data = result[1][0];
        console.log("otp check ->" + data["@result"]);
        otpresult = data["@result"];
      } else if (isphone == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
          [1, querydata.username, querydata.OTP]
        );
        const data = result[1][0];
        console.log("otp check ->" + data["@result"]);
        otpresult = data["@result"];
      } else {
        const sql = await db.query(
          `select Email_id from usermaster where username = '${querydata.username}' and status = 1`
        );
        if (sql.length > 0) {
          const [result] = await db.spcall(
            "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
            [0, sql[0].Email_id, querydata.OTP]
          );
          const data = result[1][0];
          console.log("otp check ->" + data["@result"]);
          otpresult = data["@result"];
        }
      }
    }
    if (otpresult == 1) {
      return helper.getSuccessResponse(
        true,
        "success",
        "OTP Verified Successfully",
        otpresult,
        admin.Secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid OTP",
        otpresult,
        admin.Secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er,
      admin.Secret
    );
  }
}

//###########################################################################################################################################################################################
//##################################################################################################################################################################################
async function changepassword(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "CHANGE NEW PASSWORD",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "CHANGE NEW PASSWORD",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    if (querydata.username != null) {
      const resultAPI = await db.query(
        `select user_id,email_id,phone from usermaster where username= '${querydata.username}' OR Email_id= '${querydata.username}' OR phone= '${querydata.username}' and status=1`
      );

      if (resultAPI[0].email_id != null) {
        const user_id = resultAPI[0].user_id;
        const [result] = await db.spcall(
          `CALL SP_UPDATE_PASSWORD(?,?,@result); select @result;`,
          [querydata.password, user_id]
        );
        const object = result[1][0];
        console.log("password status ->" + object["@result"]);

        if (object["@result"] == 1) {
          return helper.getSuccessResponse(
            true,
            "success",
            "The New password was updated successfully",
            object["@result"],
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while updating the password",
            object["@result"],
            admin.Secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Please provide the Valid Username.",
          querydata.username,
          admin.Secret
        );
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      admin.Secret
    );
  }
}

////#############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function SendEmailWhatsapp(admin) {
  try {
    if (admin.hasOwnProperty("phoneno") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Phone number missing. Please provide the Phone number.",
        "SEND MAIL OR WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("emailid") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Emailid missing. Pleae provide the email id",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("pdfpath") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "PDF File path missing. Please provide the PDF File path",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("feedback") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feddback",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("documenttype") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Document type missing. Please provide the Document type",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    const mail = await mailer.sendPDF(
      "customer",
      admin.emailid,
      admin.documenttype,
      "sendpdf.html",
      admin.feedback,
      "SITE_ALARM_CONF",
      admin.pdfpath
    );
    const whatsapp = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
      phoneno: admin.phoneno, // Add the required parameters
      feedback: admin.feedback,
      pdfpath: admin.pdfpath,
    });
    console.log("API call successful:", whatsapp.data.code);
    if (mail == true && whatsapp.data.code == true) {
      return helper.getErrorResponse(
        true,
        "success",
        "Mail and whatsapp sended successfully",
        "",
        ""
      );
    } else if (mail == true) {
      return helper.getErrorResponse(true, "Mail sended successfully", "", "");
    } else if (whatsapp.data.code == true) {
      return helper.getErrorResponse(
        true,
        "success",
        "Whatsapp sended successfully",
        whatsapp.data.code,
        ""
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Error sending both whatsapp and email",
        "",
        ""
      );
    }
  } catch (er) {
    console.log(er);
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er,
      ""
    );
  }
}

//###########################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//#############################################################################################################################################################################################
async function Register(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER REGISTER",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER REGISTER",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "REGISTER",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER REGISTER",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER REGISTER",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("name") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("emailid") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("phoneno") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }

    if (querydata.name.length > 100) {
      return helper.getErrorResponse(
        false,
        "error",
        "Please provide a name with the appropriate size.",
        "REGISTER",
        admin.Secret
      );
    }

    if (
      querydata.emailid.indexOf(".") == -1 ||
      querydata.emailid.indexOf("@") == -1
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid email format. Please provide a valid email address.",
        "REGISTER",
        admin.Secret
      );
    }
    if (helper.phonenumber(querydata.phoneno)) {
      console.log("Valid");
    } else {
      console.log("Invalid");
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid phone number. Please provide a valid phone number.",
        "REGISTER",
        admin.Secret
      );
    }

    //Begin Validation:- 5. Password should have minimum 8 characters and maximum 15 characters with mix of uppercase, lowercase, numeric and special character.
    if (querydata.password.length > 40 || querydata.password.length < 5) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password must be of valid size. Please provide a password with appropriate length.",
        "REGISTER",
        admin.Secret
      );
    }
    var schema = new passwordValidator();
    schema
      .is()
      .min(5) // Minimum length 5
      .is()
      .max(100) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits(1) // Must have at least 1 digits
      .has()
      .not()
      .spaces();
    if (schema.validate(querydata.password) == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password does not meet the required guidelines.",
        "REGISTER",
        admin.Secret
      );
    }
    try {
      const [sql] = await db.spcall(
        `CALL SP_ADD_USER(?,?,?,?,@userid); select @userid`,
        [
          querydata.name,
          querydata.emailid,
          querydata.phoneno,
          querydata.password,
        ]
      );
      const objectvalue = sql[1][0];
      const userid = objectvalue["@userid"];

      if (userid != null) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["0", querydata.emailid]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp email->" + otpText);
        if (otpText != null) {
          EmailSent = await mailer.sendEmail(
            querydata.name,
            querydata.emailid,
            "User registration",
            "registerotp.html",
            `${config.serverurl}/verification?email=${querydata.emailid}&token=${otpText}`,
            "REGISTER_OTP_SEND"
          );
        }
        if (EmailSent == true) {
          return helper.getSuccessResponse(
            true,
            "success",
            "Email sent successfully. Please Verify your account.",
            "REGISTER",
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error sending the Email. Please try again later.",
            "REGISTER",
            admin.Secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error in adding user",
          "REGISTER",
          admin.Secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "User already exists",
        er.message,
        admin.Secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      ""
    );
  }
}

//###########################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function OrganizationList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH ORGANIZATION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH ORGANIZATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH ORGANIZATION",
        secret
      );
    }
    var sql;
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH ORGANIZATION",
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
          "FETCH ORGANIZATION",
          secret
        );
      }
      if (querydata.hasOwnProperty("organizationid") == false) {
        return helper.getSuccessResponse(
          true,
          "error",
          `Organization id missing. Please provide the Organization id`,
          "FETCH ORGANIZATION CUSTOMERS",
          secret
        );
      }
      sql = await db.query1(
        `select Organization_id,Organization_name,orgcode from organizations where status = 1 and Deleted_flag = 0  and organization_id in (?)`,
        [querydata.organizationid]
      );
    } else {
      sql = await db.query1(
        `select Organization_id,Organization_name,orgcode from organizations where status = 1 and Deleted_flag = 0`
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization Fetched Successfully",
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

async function CompanyList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH COMPANY LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH COMPANY LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken.",
        "FETCH COMPANY LIST",
        secret
      );
    }
    var sql;
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH COMPANY LIST",
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
          "FETCH COMPANY LIST",
          secret
        );
      }
      if (querydata.hasOwnProperty("organizationid") == false) {
        return helper.getErrorResponse(
          false,
          "error",
          "Organization id missing. Please provide the Organization id.",
          "FETCH COMPANY LIST",
          secret
        );
      }
      sql = await db.query1(
        `select Customer_id companyid,Customer_name companyname,Email_id emailid,Address client_address,customer_name billing_addressname,Billing_address billing_address,Contact_No contact_number,customer_name client_addressname,gst_number from customermaster where status = 1 and deleted_flag = 0 and organization_id = ?`,
        [querydata.organizationid]
      );
    } else {
      sql = await db.query1(
        `select Customer_id companyid,Customer_name companyname,Email_id emailid,Address client_address,customer_name billing_addressname,Billing_address billing_address,Contact_No contact_number,customer_name client_addressname,gst_number where status = 1 and deleted_flag = 0 and Customer_type = 1`
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Fetched Successfully",
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
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function BranchList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH BRANCH LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH BRANCH LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH BRANCH LIST",
        secret
      );
    }
    var sql;
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH BRANCH LIST",
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
          "FETCH BRANCH LIST",
          secret
        );
      }
      if (querydata.hasOwnProperty("companyid") == false) {
        return helper.getErrorResponse(
          false,
          "error",
          "Company id missing. Please provide the Company id",
          "FETCH BRANCH LIST",
          secret
        );
      }
      sql = await db.query1(
        `select bm.Branch_id , bm.Branch_name, bm.Branch_code,bm.branch_name client_addressname,bm.address clientaddress,gstno gst_number,cm.Email_id emailid,cm.Contact_no contact_number,cm.billing_address ,cm.Customer_name billing_addressname from branchmaster bm ,customermaster cm where cm.customer_id = bm.customer_id and bm.status =1 and bm.deleted_flag =0 and bm.Customer_id = ?`,
        [querydata.companyid]
      );
    } else {
      sql = await db.query1(
        `select bm.Branch_id , bm.Branch_name, bm.Branch_code,bm.branch_name client_addressname,bm.address clientaddress,gstno gst_number,cm.Email_id emailid,cm.Contact_no contact_number,cm.billing_address ,cm.Customer_name billing_addressname from branchmaster bm ,customermaster cm where cm.customer_id = bm.customer_id and bm.status =1 and bm.deleted_flag =0`
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
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
  GetCustomerDetails,
  Login,
  SendEmailWhatsapp,
  ForgotPassword,
  verifyOTP,
  changepassword,
  Register,
  OrganizationList,
  CompanyList,
  BranchList,
};

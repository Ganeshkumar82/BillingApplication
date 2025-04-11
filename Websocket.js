const config = require("./config");
const admin = require("./services/admin");
const WebSocket = require("ws");
const cron = require("node-cron");
const db = require("./db");

let socket = null;
let isConnected = false;
let interval = null; // Store interval to prevent duplicate jobs

function connectWebSocket() {
  socket = new WebSocket("ws://192.168.0.111:8081");

  socket.on("open", () => {
    console.log("Connected to WebSocket server");
    isConnected = true;
  });

  socket.on("message", async (data) => {
    console.log(`Message from server: ${data}`);
    await admin.SendEmailWhatsapp(data);
  });

  socket.on("close", () => {
    console.log("WebSocket disconnected, attempting to reconnect...");
    isConnected = false;
    reconnectWebSocket();
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
    isConnected = false;
  });
}

function reconnectWebSocket() {
  setTimeout(() => {
    if (!isConnected) {
      console.log("Reconnecting WebSocket...");
      connectWebSocket();
    }
  }, 10000); // Retry connection every 5 seconds
}

async function sendInvoice() {
  if (isConnected) {
    const sql = await db.query(`WITH LastInvoice AS (
      SELECT sbm.*
      FROM subscriptionbillmaster sbm
      WHERE sbm.Invoice_status = 0 
      AND sbm.status = 1
      AND sbm.bill_date = (
          SELECT MAX(bill_date)
          FROM subscriptionbillmaster sbm2
          WHERE sbm2.Site_list = sbm.Site_list
          AND sbm2.status = 1
      )
  )
  SELECT 
      sbm.invoice_No AS invoiceNo,
      sbm.bill_date AS date,
      sbm.gstPercent AS gstPercent,
      sbm.pendingAmount AS pendingAmount,
      CASE 
          WHEN EXISTS (
              SELECT 1 FROM subscriptionbillmaster prev
              WHERE prev.Invoice_status = 0 
              AND prev.status = 1
              AND prev.invoice_No <> sbm.invoice_No
              AND prev.Site_list = sbm.Site_list
          ) THEN 1 
          ELSE 0 
      END AS isPending,
      JSON_OBJECT(
          'client_addressname', sbm.Client_addressname,
          'client_address', sbm.client_address,
          'billing_addressname', sbm.Billing_addressname,
          'billing_address', sbm.Billing_address
      ) AS address,
      JSON_OBJECT(
          'planname', sbm.Plan_name,
          'customertype', sbm.customer_type,
          'plancharges', sbm.plancharges,
          'internetcharges', sbm.Internet_charges, 
          'billperiod', sbm.bill_Period,
          'billdate', sbm.bill_date,
          'duedate', sbm.Due_date,
          'subscription_billid' , sbm.subscription_billid
      ) AS billplandetails,
      JSON_OBJECT(
          'customerid', sbm.customer_id,
          'relationshipid', sbm.Relationshipid,
          'billnumber', sbm.billnumber,
          'customergstin', sbm.customer_GST,
          'hsncode', sbm.HSN_code,
          'customerpo', sbm.Customer_po,
          'contactperson', sbm.Contact_person,
          'contactnumber', sbm.Contact_number
      ) AS customeraccountdetails,
      sbm.Site_list AS sitesubscription,
      JSON_OBJECT(
          'emailid', sbm.Email_id,
          'phoneno', sbm.Contact_number,
          'ccemail',sbm.ccemail
      ) AS contactdetails,
      (
          SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                  'invoiceid', prev.invoice_No,
                  'duedate', prev.Due_date,
                  'overduedays', DATEDIFF(NOW(), prev.Due_date),
                  'charges', prev.pendingAmount
              )
          )
          FROM subscriptionbillmaster prev
          WHERE prev.Invoice_status = 0 
          AND prev.status = 1
          AND prev.invoice_No <> sbm.invoice_No  
          AND prev.Site_list = sbm.Site_list
      ) AS previousPendingInvoices
  FROM LastInvoice sbm;  
`);
    for (let i = 0; i < sql.length; i++) {
      socket.send(JSON.stringify(sql[i]));
    }
    console.log("Invoice message sent to WebSocket server.");
  } else {
    console.log("WebSocket not connected, skipping message.");
    reconnectWebSocket();
  }
}
sendInvoice();
// Cron job to start sending messages every minute after 03:14 AM
cron.schedule("40 15 * * *", () => {
  console.log("Cron job started at 07:16 PM");
  sendInvoice();
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    // sendInvoice();
  }, 60 * 1000); // Send every 1 minute
});

// Start WebSocket client
// connectWebSocket();

module.exports = {
  startWebSocketClient: connectWebSocket,
};

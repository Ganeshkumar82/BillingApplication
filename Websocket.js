const config = require("./config");
const admin = require("./services/admin");
const WebSocket = require("ws");
const cron = require("node-cron");
const db = require("./db");

let socket = null;
let isConnected = false;
let interval = null; // Store interval to prevent duplicate jobs

function connectWebSocket() {
  socket = new WebSocket("ws://192.168.1.108:8081");

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
  }, 5000); // Retry connection every 5 seconds
}

async function sendInvoice() {
  if (isConnected) {
    const sql = await db.query(`SELECT 
    invoice_No AS invoiceNo,
    bill_date AS date,
    gstPercent AS gstPercent,
    pendingAmount AS pendingAmount,
    JSON_OBJECT(
        'client_addressname', Client_addressname,
        'client_address', client_address,
        'billing_addressname', Billing_addressname,
        'billing_address', Billing_address
    ) AS address,
    JSON_OBJECT(
        'planname', Plan_name,
        'customertype', customer_type,
        'plancharges', plancharges,
        'internetcharges', 4300, 
        'billperiod', bill_Period,
        'billdate', bill_date,
        'duedate', Due_date
    ) AS billplandetails,
    JSON_OBJECT(
        'relationshipid', Relationshipid,
        'billnumber', billnumber,
        'customergstin', customer_GST,
        'hsncode', HSN_code,
        'customerpo', Customer_po,
        'contactperson', Contact_person,
        'contactnumber', Contact_number
    ) AS customeraccountdetails,
    Site_list AS sitesubscription
FROM subscriptionbillmaster where Invoice_status = 0 and status =1;
`);
    for (let i = 0; i < sql.length; i++) {
      socket.send(JSON.stringify(sql[i]));
    }
    console.log("Invoice message sent to WebSocket server.");
  } else {
    console.log("WebSocket not connected, skipping message.");
  }
}

// Cron job to start sending messages every minute after 03:14 AM
cron.schedule("02 02 * * *", () => {
  console.log("Cron job started at 03:37 AM");
  sendInvoice();
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    sendInvoice();
  }, 60 * 1000); // Send every 1 minute
});

// Start WebSocket client
connectWebSocket();

module.exports = {
  startWebSocketClient: connectWebSocket,
};

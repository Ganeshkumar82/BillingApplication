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
    // sendInvoice();
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
    const sql = await db.query(`
    WITH NumberedInvoices AS (
      SELECT 
          sbm.*,
          ROW_NUMBER() OVER (
              PARTITION BY sbm.Branch_code, DATE_FORMAT(sbm.bill_date, '%Y-%m')
              ORDER BY sbm.subscription_billid
          ) AS invoice_sequence
      FROM subscriptionbillmaster sbm
      LEFT JOIN subscriptionbillgenerated sbg
          ON sbm.subscription_billid = sbg.subscription_billid
      WHERE sbm.Invoice_status = 0 
        AND sbm.status = 1
        AND sbg.subscription_billid IS NULL 
        AND sbm.bill_date = (
            SELECT MAX(bill_date)
            FROM subscriptionbillmaster sbm2
            WHERE sbm2.Site_list = sbm.Site_list
              AND sbm2.status = 1
        )
  )
  
  SELECT 
      CONCAT(
          Branch_code, '_',
          DATE_FORMAT(bill_date, '%y%m'),
          LPAD(invoice_sequence, 2, '0')
      ) AS invoiceNo,
      bill_date AS date,
      IFNULL(gstPercent, 18) AS gstPercent, 
      pendingAmount,
  
      CASE 
          WHEN EXISTS (
              SELECT 1
              FROM subscriptionbillmaster sbm2
              JOIN subscriptionbillgenerated sbg2 
                ON sbm2.subscription_billid = sbg2.subscription_billid
              WHERE sbg2.payment_status = 0
                AND sbm2.status = 1
                AND sbm2.subscription_billid <> sbm.subscription_billid
                AND sbm2.Site_list = sbm.Site_list
                AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
          ) THEN 1 
          ELSE 0 
      END AS isPending,
  
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
          'internetcharges', Internet_charges, 
          'billperiod', bill_Period,
          'billdate', bill_date,
          'duedate', Due_date,
          'subscription_billid', subscription_billid
      ) AS billplandetails,
  
      JSON_OBJECT(
          'customerid', customer_id,
          'relationshipid', Relationshipid,
          'billnumber', billnumber,
          'customergstin', customer_GST,
          'hsncode', HSN_code,
          'customerpo', Customer_po,
          'contactperson', Contact_person,
          'contactnumber', Contact_number,
          'consolidate_email', Consolidate_email
      ) AS customeraccountdetails,
  
      Site_list AS sitesubscription,
  
      JSON_OBJECT(
          'emailid', Email_id,
          'phoneno', Contact_number,
          'ccemail', ccemail
      ) AS contactdetails,
  
      (
          SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                  'invoiceid', sbg2.invoice_No,
                  'duedate', sbm2.Due_date,
                  'overduedays', DATEDIFF(NOW(), sbm2.Due_date),
                  'charges', sbm2.plancharges
              )
          )
          FROM subscriptionbillmaster sbm2
          JOIN subscriptionbillgenerated sbg2 
            ON sbm2.subscription_billid = sbg2.subscription_billid
          WHERE sbg2.payment_status = 0
            AND sbm2.status = 1
            AND sbm2.subscription_billid <> sbm.subscription_billid
            AND sbm2.Site_list = sbm.Site_list
            AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
      ) AS previousPendingInvoices,
  
      (
          SELECT IFNULL(SUM(sbm2.plancharges), 0)
          FROM subscriptionbillmaster sbm2
          JOIN subscriptionbillgenerated sbg2 
            ON sbm2.subscription_billid = sbg2.subscription_billid
          WHERE sbg2.payment_status = 0
            AND sbm2.status = 1
            AND sbm2.subscription_billid <> sbm.subscription_billid
            AND sbm2.Site_list = sbm.Site_list
            AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
      ) AS totalPreviousPendingAmount
  
  FROM NumberedInvoices sbm;`);
    // for (let i = 0; i < sql.length; i++) {
    socket.send(JSON.stringify(sql));
    // }
    console.log("Invoice message sent to WebSocket server.");
  } else {
    console.log("WebSocket not connected, skipping message.");
    reconnectWebSocket();
  }
}

// Cron job to start sending messages every minute after 03:14 AM
cron.schedule("40 17 * * *", () => {
  console.log("Cron job started at 07:16 PM");
  sendInvoice();
  // if (interval) {
  //   clearInterval(interval);
  // }

  // interval = setInterval(async () => {
  //   await sendInvoice();
  // }, 60 * 1000); // Send every 1 minute
});
connectWebSocket();

cron.schedule("39 17 * * *", () => {
  console.log("Cron for fetching job started at 07:16 PM");
  syncConsolidatedBills();
  syncIndividualBills();
});

async function syncIndividualBills() {
  try {
    // Fetch data from source DB
    const rows = await db.query1(`
    SELECT
    JSON_ARRAYAGG(sct.branch_id) AS site_Ids,
    cm.customer_name AS Client_addressname,
    sct.customer_address AS client_address,
    cm.customer_name AS Billing_addressname,
    sct.billing_address AS Billing_address,
    sm.Subscription_name AS Plan_name,
    sct.customer_type,
    SUM(sct.Amount) AS plancharges,
    CURDATE() AS bill_date,
    CASE 
        WHEN MAX(sct.billing_plan) = 'prepaid' THEN DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY)
        WHEN MAX(sct.billing_plan) = 'postpaid' THEN DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY)
    END AS Due_date,
    CASE 
        WHEN MAX(sct.billing_plan) = 'prepaid' THEN CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%b-%Y'))
        WHEN MAX(sct.billing_plan) = 'postpaid' THEN CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH), '%d-%b-%Y'))
    END AS bill_Period,
    sct.Relationship_id,
    CONCAT('BILL-', sct.Relationship_id, '-', sct.branch_id, '-', DATE_FORMAT(CURDATE(), '%Y%m')) AS billnumber,
	sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    'SSIPL_INV' AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'monthly_charges', sct.Amount
        )
    ) AS Site_list,
    CURRENT_TIMESTAMP() AS Row_updated_date,
    1 AS Status, 0 AS Invoice_status, 0 AS Deleted_flag, NULL AS Invoice_no, 18 AS gstPercent,
    sct.emailid AS Email_id,
    sct.Phoneno AS Phone_number,
    0 AS Internet_charges,
    sct.customer_id,
    sct.consolidate_email,
    sct.branchcode
FROM subscriptioncustomertrans sct
JOIN customermaster cm ON cm.customer_id = sct.customer_id
JOIN subscriptionmaster sm ON sm.subscription_id = sct.Subscription_ID
JOIN branchmaster bm ON bm.branch_id = sct.branch_id
WHERE sct.bill_type = 'Individual'
GROUP BY sct.Relationship_id, sct.branch_id
HAVING (
    (MAX(sct.billing_plan) = 'prepaid' AND DAY(CURDATE()) = 23)
    OR
    (MAX(sct.billing_plan) = 'postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
);
`);

    // Loop and insert into target DB
    for (const row of rows) {
      try {
        await db.query(
          `
        INSERT INTO subscriptionbillmaster (
          site_Ids, Client_addressname, client_address, Billing_addressname,
          Billing_address, Plan_name, customer_type, plancharges,
          bill_date, Due_date, bill_Period, Relationshipid, billnumber,
          customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
          Site_list, Row_updated_date, Status, Invoice_status, Deleted_flag,
          Invoice_no, gstPercent, Email_id, Phone_number, Internet_charges,
          customer_id, consolidate_email, branch_code
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
          [
            row.site_Ids,
            row.Client_addressname,
            row.client_address,
            row.Billing_addressname,
            row.Billing_address,
            row.Plan_name,
            row.customer_type,
            row.plancharges,
            row.bill_date,
            row.Due_date,
            row.bill_Period,
            row.Relationship_id,
            row.billnumber,
            row.customer_GST,
            row.HSN_code,
            row.Customer_po,
            row.Contact_person,
            row.Contact_number,
            row.Site_list,
            row.Row_updated_date,
            row.Status,
            row.Invoice_status,
            row.Deleted_flag,
            row.Invoice_no,
            row.gstPercent,
            row.Email_id,
            row.Phone_number,
            row.Internet_charges,
            row.customer_id,
            row.consolidate_email,
            row.branchcode,
          ]
        );
      } catch (er) {
        console.error(
          `Failed to insert row for RelationshipId: ${row.Relationship_id}`,
          er.message
        );
      }
    }
    console.log(`${rows.length} rows inserted to target database.`);
  } catch (error) {
    console.error("Error syncing data:", error.message);
  }
}

async function syncConsolidatedBills() {
  try {
    // Fetch data from source DB
    const rows = await db.query1(`
    SELECT
    JSON_ARRAYAGG(sct.branch_id) AS site_Ids,
    cm.customer_name AS Client_addressname,
    sct.customer_address AS client_address,
    cm.customer_name AS Billing_addressname,
    sct.billing_address AS Billing_address,
    sm.Subscription_name AS Plan_name,
    sct.customer_type,
    SUM(sct.Amount) AS plancharges,

    -- Set bill_date based on plan type
    CURDATE() AS bill_date,

    -- Due Date logic
    CASE 
        WHEN MAX(sct.billing_plan) = 'prepaid' THEN DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY)
        WHEN MAX(sct.billing_plan) = 'postpaid' THEN DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY)
    END AS Due_date,

    -- Bill Period
    CASE 
        WHEN MAX(sct.billing_plan) = 'prepaid' THEN CONCAT(
            DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%b-%Y')
        )
        WHEN MAX(sct.billing_plan) = 'postpaid' THEN CONCAT(
            DATE_FORMAT(DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'), '%d-%b-%Y'), ' To ',
            DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH), '%d-%b-%Y')
        )
    END AS bill_Period,

    sct.Relationship_id,
    CONCAT('BILL-', sct.Relationship_id, '-', DATE_FORMAT(CURDATE(), '%Y%m')) AS billnumber,
    sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    'SSIPL_INV' AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'monthly_charges', sct.Amount
        )
    ) AS Site_list,

    CURRENT_TIMESTAMP() AS Row_updated_date,
    1 AS Status, 0 AS Invoice_status, 0 AS Deleted_flag, NULL AS Invoice_no, 18 AS gstPercent,
    sct.emailid AS Email_id,
    sct.Phoneno AS Phone_number,
    0 AS Internet_charges,
    sct.customer_id,
    sct.consolidate_email,
    sct.branchcode

FROM subscriptioncustomertrans sct
JOIN customermaster cm ON cm.customer_id = sct.customer_id
JOIN subscriptionmaster sm ON sm.subscription_id = sct.Subscription_ID
JOIN branchmaster bm ON bm.branch_id = sct.branch_id

WHERE sct.bill_type = 'Consolidate'

GROUP BY sct.Relationship_id, sct.customer_id

HAVING (
    (MAX(sct.billing_plan) = 'prepaid' AND DAY(CURDATE()) = 23)
    OR
    (MAX(sct.billing_plan) = 'postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
);`);

    // Loop and insert into target DB
    for (const row of rows) {
      try {
        await db.query(
          `
        INSERT INTO subscriptionbillmaster (
          site_Ids, Client_addressname, client_address, Billing_addressname,
          Billing_address, Plan_name, customer_type, plancharges,
          bill_date, Due_date, bill_Period, Relationshipid, billnumber,
          customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
          Site_list, Row_updated_date, Status, Invoice_status, Deleted_flag,
          Invoice_no, gstPercent, Email_id, Phone_number, Internet_charges,
          customer_id, consolidate_email, branch_code
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
          [
            row.site_Ids,
            row.Client_addressname,
            row.client_address,
            row.Billing_addressname,
            row.Billing_address,
            row.Plan_name,
            row.customer_type,
            row.plancharges,
            row.bill_date,
            row.Due_date,
            row.bill_Period,
            row.Relationship_id,
            row.billnumber,
            row.customer_GST,
            row.HSN_code,
            row.Customer_po,
            row.Contact_person,
            row.Contact_number,
            row.Site_list,
            row.Row_updated_date,
            row.Status,
            row.Invoice_status,
            row.Deleted_flag,
            row.Invoice_no,
            row.gstPercent,
            row.Email_id,
            row.Phone_number,
            row.Internet_charges,
            row.customer_id,
            row.consolidate_email,
            row.branchcode,
          ]
        );
      } catch (er) {
        console.error(
          `Failed to insert row for RelationshipId: ${row.Relationship_id}`,
          err.message
        );
      }
    }
    console.log(`${rows.length} rows inserted to target database.`);
  } catch (error) {
    console.error("Error syncing data:", error.message);
  }
}
module.exports = {
  startWebSocketClient: connectWebSocket,
};

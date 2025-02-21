const config = require("./config");
const admin = require("./services/admin");

module.exports = {
  startWebSocketClient: () => {
    const WebSocket = require("ws");
    const cron = require("node-cron");

    // Connect to the WebSocket server
    const socket = new WebSocket("ws://192.168.1.109:8081");

    let isConnected = false;

    socket.on("open", () => {
      console.log("Connected to the server");
      isConnected = true;
    });

    socket.on("message", async (data) => {
      console.log(`Message from server: ${data}`);
      //   const message = data.toString("utf8").trim();
      await admin.SendEmailWhatsapp(JSON.parse(data));
    });

    socket.on("close", () => {
      console.log("Disconnected from the server");
      isConnected = false;
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      isConnected = false;
    });

    cron.schedule("21 12 * * *", () => {
      console.log("Running cron job...");

      if (isConnected) {
        socket.send(
          JSON.stringify({
            invoiceProducts: [
              {
                productName: 6456,
                hsn: 546,
                price: 645.0,
                quantity: 6456,
                gst: 456.0,
              },
              {
                productName: 6456,
                hsn: 645654,
                price: 654654.0,
                quantity: 654645,
                gst: 645654.0,
              },
            ],
            invoiceClientAddrName: "34",
            invoiceClientAddr: "34",
            invoiceBillAddrName: "234",
            invoiceBillAddr: "324",
            invoiceNo: "34",
            date: "2023-12-23 23:43:00",
            invoiceTitle: "",
            invoice_table_heading: "Invoice",
            invoice_noteList: [
              {
                notecontent:
                  "Delivery within 30 working days from the date of issuing the PO.",
              },
              { notecontent: "Payment terms: 100% along with PO." },
            ],
            invoice_recommendationList: [
              { key: 6645, value: 6565 },
              { key: 6565, value: 65 },
            ],
          })
        );
        console.log("Message sent to the server.");
      } else {
        console.log("WebSocket is not connected. Reconnecting...");
        reconnectAndSend();
      }
    });

    function reconnectAndSend() {
      const newSocket = new WebSocket("ws://192.168.1.109:8081");

      newSocket.on("open", () => {
        console.log("Reconnected to the server");
        newSocket.send(
          JSON.stringify({
            invoiceProducts: [
              {
                productName: 6456,
                hsn: 546,
                price: 645.0,
                quantity: 6456,
                gst: 456.0,
              },
              {
                productName: 6456,
                hsn: 645654,
                price: 654654.0,
                quantity: 654645,
                gst: 645654.0,
              },
            ],
            invoiceClientAddrName: "34",
            invoiceClientAddr: "34",
            invoiceBillAddrName: "234",
            invoiceBillAddr: "324",
            invoiceNo: "34",
            date: "2023-12-23 23:43:00",
            invoiceTitle: "",
            invoice_table_heading: "Invoice",
            invoice_noteList: [
              {
                notecontent:
                  "Delivery within 30 working days from the date of issuing the PO.",
              },
              { notecontent: "Payment terms: 100% along with PO." },
            ],
            invoice_recommendationList: [
              { key: 6645, value: 6565 },
              { key: 6565, value: 65 },
            ],
          })
        );
        console.log("Message sent after reconnect.");
      });

      newSocket.on("message", async (data) => {
        console.log(`Message from server (reconnect): ${data}`);
        await admin.SendEmailWhatsapp(data);
      });

      newSocket.on("close", () => {
        console.log("Disconnected after reconnect attempt");
      });

      newSocket.on("error", (error) => {
        console.error("Reconnection WebSocket error:", error);
      });
    }
  },
};

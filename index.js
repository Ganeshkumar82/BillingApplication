const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const path = require("path");
const adminRouter = require("./routes/admin");
const vendorRouter = require("./routes/vendor");
const salesRouter = require("./routes/sales");
const SubscriptionRouter = require("./routes/subscription");
const productRouter = require("./routes/product");
const verificaitonRouter = require("./routes/verification");
const { startWebSocketClient } = require("./Websocket");
const port = 8081;

startWebSocketClient();

app.use(express.json({ limit: "100mb" }));
app.use(cors());
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.text());

app.use(express.static(path.join((__dirname, "./mailpage"))));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - Received request for: ${req.method} ${req.url}`);
  next(); // Call the next middleware in the stack
});

// Fallback for client-side routing: serve index.html for all unknown routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./mailpage", "index.html"));
});
// app.get("/", (req, res) => {
//   res.send("welcome");
// });
app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);
app.use("/sales", salesRouter);
app.use("/product", productRouter);
app.use("/verification", verificaitonRouter);
app.use("/subscription", SubscriptionRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message }).end();
});

const server = http.createServer(app);
// Set keep-alive timeouts
server.keepAliveTimeout = 60 * 1000; // Keep connections alive for 60 seconds
server.headersTimeout = 65 * 1000; // Ensure this is slightly larger than keepAliveTimeout

server.listen(port, async () => {
  console.log(`App is listening at the port http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    process.exit(1); // Exit the process to avoid multiple instances
  }
});

const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const adminRouter = require("./routes/admin");
const vendorRouter = require("./routes/vendor");
const salesRouter = require("./routes/sales");
const productRouter = require("./routes/product");
const verificaitonRouter = require("./routes/verification");
const { startWebSocketClient } = require("./Websocket");
const port = 8081;

startWebSocketClient();

app.use(express.json({ limit: "100mb" }));
app.use(cors());
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - Received request for: ${req.method} ${req.url}`);
  next(); // Call the next middleware in the stack
});

app.get("/", (req, res) => {
  res.send("welcome");
});
app.use("/admin", adminRouter);
app.use("/vendor", vendorRouter);
app.use("/sales", salesRouter);
app.use("/product", productRouter);
app.use("/verification", verificaitonRouter);

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

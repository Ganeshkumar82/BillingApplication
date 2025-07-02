const util = require("util");
const multer = require("multer");
const config = require("./config");
const fs = require("fs-extra");

// Dynamically set the storage path
let storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/ModeofRequest`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize = 2 * 1024 * 1024;

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMOR = util.promisify(uploadFile);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage1 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Invoices`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const YYYYMMDD =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");
    cb(null, `${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize1 = 2 * 1024 * 1024;

let uploadFile1 = multer({
  storage: storage1,
  limits: { fileSize: maxSize1 },
}).single("file");

let uploadFileInvoice = util.promisify(uploadFile1);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage2 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/CustomerRequirements`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const YYYYMMDD =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize2 = 2 * 1024 * 1024;

let uploadFile2 = multer({
  storage: storage2,
  limits: { fileSize: maxSize2 },
}).single("file");

let uploadCustomerrequ = util.promisify(uploadFile2);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage3 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Quotation`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize3 = 2 * 1024 * 1024;

let uploadFile3 = multer({
  storage: storage3,
  limits: { fileSize: maxSize3 },
}).single("file");

let uploadQuotationp = util.promisify(uploadFile3);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage4 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/DeliveryChallan`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize4 = 2 * 1024 * 1024;

let uploadFile4 = multer({
  storage: storage4,
  limits: { fileSize: maxSize4 },
}).single("file");

let uploadDeliverychln = util.promisify(uploadFile4);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage5 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/RequestforQuotation`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize5 = 2 * 1024 * 1024;

let uploadFile5 = multer({
  storage: storage5,
  limits: { fileSize: maxSize5 },
}).single("file");

let uploadRFQuotation = util.promisify(uploadFile5);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage6 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      let clientAddressName = req.body.clientaddressname || "Salesclient";
      clientAddressName = clientAddressName
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "_");
      folder = path.join(
        folder,
        year.toString(),
        month,
        clientAddressName,
        day.toString()
      );
      folder = `${folder}/${year}/${month}/${clientAddressName}/Creditnote/${day}`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize6 = 2 * 1024 * 1024;

let uploadFile6 = multer({
  storage: storage6,
  limits: { fileSize: maxSize6 },
}).single("file");

let uploadCreditNote = util.promisify(uploadFile6);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage7 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      let clientAddressName = req.body.clientaddressname || "Salesclient";
      clientAddressName = clientAddressName
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "_");
      folder = path.join(
        folder,
        year.toString(),
        month,
        clientAddressName,
        day.toString()
      );
      folder = `${folder}/${year}/${month}/${clientAddressName}/Debitnote/${day}`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize7 = 2 * 1024 * 1024;

let uploadFile7 = multer({
  storage: storage7,
  limits: { fileSize: maxSize7 },
}).single("file");

let uploadDebitNote = util.promisify(uploadFile7);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

/// Dynamically set the storage path
let storage8 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/SendPDF`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize8 = 2 * 1024 * 1024;

let uploadFile8 = multer({
  storage: storage8,
  limits: { fileSize: maxSize8 },
}).single("file");

let uploadcustompdf = util.promisify(uploadFile8);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

/// Dynamically set the storage path
let storage9 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Subscription/recurringinvoice`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const cleanedFileName = file.originalname.replace(/\s+/g, ""); // Remove all spaces
    cb(null, `SSIPL-${cleanedFileName}`);
  },
});

// Set max file size to 2MB
const maxSize9 = 2 * 1024 * 1024;

let uploadFile9 = multer({
  storage: storage9,
  limits: { fileSize: maxSize9 },
}).array("files", 100);

let uploadrecurringinvoicepdf = util.promisify(uploadFile9);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage12 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Subscription/CustomInvoice`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const YYYYMMDD =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize12 = 2 * 1024 * 1024;

let uploadFile12 = multer({
  storage: storage12,
  limits: { fileSize: maxSize12 },
}).single("file");

let uploadcustominvoicepdf = util.promisify(uploadFile12);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage10 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Subscription/CustomerRequirements`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const YYYYMMDD =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0");
    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize10 = 2 * 1024 * 1024;

let uploadFile10 = multer({
  storage: storage10,
  limits: { fileSize: maxSize10 },
}).single("file");

let uploadSubCustomerrequ = util.promisify(uploadFile10);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage11 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/SubQuotation`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    cb(null, `${timestamp}_${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize11 = 2 * 1024 * 1024;

let uploadFile11 = multer({
  storage: storage11,
  limits: { fileSize: maxSize11 },
}).single("file");

let uploadSubQuotationp = util.promisify(uploadFile11);

//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################
//#############################################################################################################################################################################################

// Dynamically set the storage path
let storage13 = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "long" }); // e.g., December
      const day = now.getDate();
      let folder = config.filestorage; // Default folder

      folder = `${folder}/${year}/${month}/${day}/Voucher/receipts`;

      // Ensure the folder exists
      await fs.ensureDir(folder);

      cb(null, folder);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    cb(null, `${file.originalname}`); // Use timestamp to avoid duplicate filenames
  },
});

// Set max file size to 2MB
const maxSize13 = 5 * 1024 * 1024;

let uploadFile13 = multer({
  storage: storage13,
  limits: { fileSize: maxSize13 },
}).fields([
  { name: "files", maxCount: 10 },
  { name: "file", maxCount: 10 },
]);

let uploadVoucher = util.promisify(uploadFile13);

module.exports = {
  uploadFileMOR,
  uploadFileInvoice,
  uploadCustomerrequ,
  uploadQuotationp,
  uploadDeliverychln,
  uploadRFQuotation,
  uploadCreditNote,
  uploadDebitNote,
  uploadcustompdf,
  uploadrecurringinvoicepdf,
  uploadSubCustomerrequ,
  uploadSubQuotationp,
  uploadcustominvoicepdf,
  uploadVoucher,
};

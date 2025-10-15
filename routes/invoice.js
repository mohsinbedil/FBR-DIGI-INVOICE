const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { upload, handleMulterError } = require('../middleware/uploadExcel');



// Upload invoices in bulk with proper error handling
router.post(
  '/upload-excel', 
  upload.single('file'),
  handleMulterError, // Add multer error handling
  invoiceController.uploadInvoicesExcel
);



// POST /invoices
// router.post("/", invoiceController.createInvoice);
router.get("/export", invoiceController.exportInvoicesCSV);
router.get("/", invoiceController.listInvoices);
router.get("/:uuid", invoiceController.getInvoiceByUUID);
router.post("/save", invoiceController.saveInvoice);
router.post("/post-unposted", invoiceController.postUnpostedInvoices);

router.post("/post/:uuid", invoiceController.postInvoiceToFBR);




module.exports = router;
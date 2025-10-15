const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const connection = require('../config/db'); // adjust path as needed
const validator = require('validator');
const xlsx = require('xlsx');
const path = require('path');
const fastcsv = require('fast-csv');
const fs = require('fs')


// ✅ GET /api/invoices/:uuid
exports.getInvoiceByUUID = async (req, res) => {
  try {
    const { uuid } = req.params;

    // 1️⃣ Fetch invoice by UUID
    const [invoiceResult] = await db.promise().query(
      `
      SELECT 
        id,
        uuid,
        invoice_type AS invoiceType,
        invoice_date AS invoiceDate,
        seller_ntn_cnic AS sellerNTNCNIC,
        seller_business_name AS sellerBusinessName,
        seller_province AS sellerProvince,
        seller_address AS sellerAddress,
        buyer_ntn_cnic AS buyerNTNCNIC,
        buyer_business_name AS buyerBusinessName,
        buyer_province AS buyerProvince,
        buyer_address AS buyerAddress,
        buyer_registration_type AS buyerRegistrationType,
        invoice_ref_no AS invoiceRefNo,
        scenario_id AS scenarioId,
        total_value AS totalValue,
        total_tax AS totalTax,
        status,
        created_at AS createdAt
      FROM invoices
      WHERE uuid = ?
      LIMIT 1
      `,
      [uuid]
    );

    // 2️⃣ Check if found
    if (invoiceResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceResult[0];

    // 3️⃣ Fetch related items
    const [items] = await db.promise().query(
      `
      SELECT 
      id,
        uuid,
        invoice_id,
        hs_code AS hsCode,
        product_description AS productDescription,
        rate_desc AS rate,
        rate_percent AS ratePercent,
        uom AS uoM,
        quantity,
        total_values AS totalValues,
        value_sales_excl_st AS valueSalesExcludingST,
        sales_tax_applicable AS salesTaxApplicable,
        further_tax AS furtherTax,
        sro_schedule_no AS sroScheduleNo,
        fed_payable AS fedPayable,
        discount,
        sale_type AS saleType,
        sro_item_serial_no AS sroItemSerialNo
      FROM invoice_items
      WHERE invoice_id = ?
      ORDER BY id ASC
      `,
      [invoice.id]
    );

    // 4️⃣ Calculate totals
    let totalSubValue = 0; // Sum of valueSalesExcludingST
    let totalTax = 0;      // Sum of salesTaxApplicable + furtherTax
    let totalValue = 0;    // Sum of totalValues

    items.forEach(item => {
      totalSubValue += parseFloat(item.valueSalesExcludingST || 0);
      totalTax += parseFloat(item.salesTaxApplicable || 0) + parseFloat(item.furtherTax || 0);
      totalValue += parseFloat(item.totalValues || 0);
    });

    // 5️⃣ Attach items and totals
    invoice.items = items;
    invoice.itemsCount = items.length;
    invoice.totalSubValue = totalSubValue.toFixed(2);
    invoice.totalTax = totalTax.toFixed(2);
    invoice.totalValue = totalValue.toFixed(2);

    // 6️⃣ Send response
    res.json({
      success: true,
      data: { invoice }
    });

  } catch (error) {
    console.error('❌ Error fetching invoice by UUID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};



// POST /api/invoices/save
exports.saveInvoice = async (req, res) => {
  const data = req.body;
  const errors = [];

  if (!data.invoiceType || !["Sale Invoice", "Debit Note"].includes(data.invoiceType))
    errors.push({ field: "invoiceType", code: "0001", message: "Invalid or missing invoiceType" });

  if (!data.invoiceDate) errors.push({ field: "invoiceDate", code: "0002", message: "Missing invoiceDate" });


  try {
    // 1️⃣ Validate header & items (use your existing validation logic)
    if (errors.length > 0) {
      return res.status(400).json({ status: "Invalid", errors });
    }

    // 2️⃣ Compute totals
    const totalValue = data.items.reduce((sum, i) => sum + parseFloat(i.totalValues || 0), 0);
    const totalTax = data.items.reduce((sum, i) => sum + parseFloat(i.salesTaxApplicable || 0), 0);

    // 3️⃣ Insert invoice
    const invoiceUUID = uuidv4();
    const [invoiceResult] = await db.promise().query(
      `INSERT INTO invoices 
      (uuid, invoice_type, invoice_date, seller_ntn_cnic, seller_business_name, seller_province, seller_address,
      buyer_ntn_cnic, buyer_business_name, buyer_province, buyer_address, buyer_registration_type, invoice_ref_no, scenario_id, total_value, total_tax, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        invoiceUUID, data.invoiceType, data.invoiceDate, data.sellerNTNCNIC, data.sellerBusinessName,
        data.sellerProvince, data.sellerAddress, data.buyerNTNCNIC || null, data.buyerBusinessName,
        data.buyerProvince, data.buyerAddress, data.buyerRegistrationType, data.invoiceRefNo || null,
        data.scenarioId, totalValue, totalTax, "unposted"
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // 4️⃣ Insert items
    for (const item of data.items) {
      const itemUUID = uuidv4();
      await db.promise().query(
        `INSERT INTO invoice_items
        (invoice_id, uuid, hs_code, product_description, rate_desc, rate_percent, uom, quantity, total_values, value_sales_excl_st,
         fixed_notified_value_or_retail_price, sales_tax_applicable, sales_tax_withheld_at_source, extra_tax, further_tax, fed_payable,
         discount, sale_type, sro_schedule_no, sro_item_serial_no)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          invoiceId, itemUUID, item.hsCode, item.productDescription, item.rate, parseFloat(item.rate.replace("%", "")),
          item.uoM, item.quantity, item.totalValues, item.valueSalesExcludingST || 0,
          item.fixedNotifiedValueOrRetailPrice || 0, item.salesTaxApplicable, item.salesTaxWithheldAtSource || 0,
          item.extraTax || 0, item.furtherTax || 0, item.fedPayable || 0,
          item.discount || 0, item.saleType, item.sroScheduleNo || null, item.sroItemSerialNo || null
        ]
      );
    }

    return res.status(200).json({ status: "success", message: "Invoice saved locally", invoiceUUID });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", error: err.message });
  }
};


const axios = require("axios");

exports.postUnpostedInvoices = async (req, res) => {
  const FBR_API_URL = "https://sandbox.fbr.gov.pk/api/invoice"; // replace with actual
  const FBR_TOKEN = process.env.FBR_TOKEN; // your FBR token

  try {
    // --- Fetch unposted invoices ---
    const [invoices] = await db.promise().query(`SELECT * FROM invoices WHERE status = 'unposted'`);

    if (invoices.length === 0) return res.json({ status: "success", message: "No unposted invoices found" });

    const results = [];

    for (const invoice of invoices) {
      try {
        // --- Fetch invoice items ---
        const [items] = await db.promise().query(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [invoice.id]);

        // --- Prepare FBR payload ---
        const payload = {
          invoiceType: invoice.invoice_type,
          invoiceDate: invoice.invoice_date,
          sellerBusinessName: invoice.seller_business_name,
          buyerBusinessName: invoice.buyer_business_name,
          items: items.map(item => ({
            hsCode: item.hs_code,
            productDescription: item.product_description,
            quantity: item.quantity,
            totalValues: item.total_values
          }))
        };

        // --- Send to FBR ---
        const fbrResponse = await axios.post(FBR_API_URL, payload, {
          headers: { Authorization: `Bearer ${FBR_TOKEN}` }
        });

        // --- Update status based on FBR response ---
        if (fbrResponse.data.status === "Valid") {
          await db.promise().query(
            `UPDATE invoices SET status = 'posted', fbr_response = ? WHERE id = ?`,
            [JSON.stringify(fbrResponse.data), invoice.id]
          );
          results.push({ invoiceUUID: invoice.uuid, status: "posted" });
        } else {
          await db.promise().query(
            `UPDATE invoices SET fbr_response = ? WHERE id = ?`,
            [JSON.stringify(fbrResponse.data), invoice.id]
          );
          results.push({ invoiceUUID: invoice.uuid, status: "failed", error: fbrResponse.data });
        }
      } catch (err) {
        console.error(`Error posting invoice ${invoice.uuid}:`, err.message);
        results.push({ invoiceUUID: invoice.uuid, status: "failed", error: err.message });
      }
    }

    return res.json({ status: "success", results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};




// POST /api/invoices/post/:uuid
exports.postInvoiceToFBR = async (req, res) => {
  const invoiceUUID = req.params.uuid;

  try {
    // 1️⃣ Fetch invoice + items
    const [invoices] = await db.promise().query(`SELECT * FROM invoices WHERE uuid = ?`, [invoiceUUID]);
    if (invoices.length === 0) return res.status(404).json({ error: "Invoice not found" });

    const invoice = invoices[0];
    const [items] = await db.promise().query(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [invoice.id]);

    // 2️⃣ Build payload for FBR
    const fbrPayload = {
      invoiceType: invoice.invoice_type,
      invoiceDate: invoice.invoice_date,
      invoiceRefNo: invoice.invoice_ref_no,
      scenarioId: invoice.scenario_id,
      sellerNTNCNIC: invoice.seller_ntn_cnic,
      sellerBusinessName: invoice.seller_business_name,
      sellerProvince: invoice.seller_province,
      sellerAddress: invoice.seller_address,
      buyerNTNCNIC: invoice.buyer_ntn_cnic,
      buyerBusinessName: invoice.buyer_business_name,
      buyerProvince: invoice.buyer_province,
      buyerAddress: invoice.buyer_address,
      buyerRegistrationType: invoice.buyer_registration_type,
      items: items.map(i => ({
        hsCode: i.hs_code,
        productDescription: i.product_description,
        rate: i.rate_desc,
        uoM: i.uom,
        quantity: i.quantity,
        totalValues: i.total_values,
        valueSalesExcludingST: i.value_sales_excl_st,
        fixedNotifiedValueOrRetailPrice: i.fixed_notified_value_or_retail_price,
        salesTaxApplicable: i.sales_tax_applicable,
        salesTaxWithheldAtSource: i.sales_tax_withheld_at_source,
        extraTax: i.extra_tax,
        furtherTax: i.further_tax,
        fedPayable: i.fed_payable,
        discount: i.discount,
        saleType: i.sale_type,
        sroScheduleNo: i.sro_schedule_no,
        sroItemSerialNo: i.sro_item_serial_no
      }))
    };

    // 3️⃣ Send to FBR (sandbox)
    const axios = require("axios");
    const token = process.env.FBR_ACCESS_TOKEN;
    const response = await axios.post(
      "https://gw.fbr.gov.pk/imsp/v1/api/Sandbox/PostData",
      fbrPayload,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    // 4️⃣ Update invoice as posted
    await db.promise().query(
      `UPDATE invoices SET status='posted', fbr_irn=?, fbr_response=? WHERE id=?`,
      [response.data.irn || null, JSON.stringify(response.data), invoice.id]
    );

    return res.status(200).json({ status: "success", fbrResponse: response.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", error: err.message });
  }
};



exports.listInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status; // optional filter: 'posted' or 'unposted'

    // Build WHERE clause
    let where = '';
    const params = [];
    if (statusFilter && ['posted', 'unposted'].includes(statusFilter)) {
      where = 'WHERE status = ?';
      params.push(statusFilter);
    }

    // Fetch total counts and revenue
    const [totals] = await db.promise().query(
      `SELECT 
          COUNT(*) AS totalInvoices,
          SUM(total_value) AS totalRevenue,
          SUM(CASE WHEN status='posted' THEN 1 ELSE 0 END) AS totalPostedCount,
          SUM(CASE WHEN status='unposted' THEN 1 ELSE 0 END) AS totalUnpostedCount,
          SUM(CASE WHEN status='posted' THEN total_value ELSE 0 END) AS totalPostedValue,
          SUM(CASE WHEN status='unposted' THEN total_value ELSE 0 END) AS totalUnpostedValue
       FROM invoices`
    );

    // Fetch paginated invoices
    const [invoices] = await db.promise().query(
      `SELECT id, uuid, invoice_type, invoice_date, buyer_business_name, total_value, status
       FROM invoices
       ${where}
       ORDER BY invoice_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      page,
      limit,
      totalInvoices: totals[0].totalInvoices,
      totalRevenue: totals[0].totalRevenue,
      totalPostedCount: totals[0].totalPostedCount,
      totalUnpostedCount: totals[0].totalUnpostedCount,
      totalPostedValue: totals[0].totalPostedValue,
      totalUnpostedValue: totals[0].totalUnpostedValue,
      invoices
    });
  } catch (err) {
    console.error("❌ List Invoices Error:", err);
    res.status(500).json({ status: 'error', error: err.message });
  }
};



exports.exportInvoicesCSV = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start_date and end_date',
      });
    }

    // 1️⃣ Fetch invoices
    const [invoices] = await db.promise().query(
      `
      SELECT
        id,
        uuid,
        invoice_type AS invoiceType,
        invoice_date AS invoiceDate,
        seller_business_name AS seller,
        buyer_business_name AS buyer,
        total_value AS totalValue,
        total_tax AS totalTax,
        status
      FROM invoices
      WHERE invoice_date BETWEEN ? AND ?
      ORDER BY invoice_date ASC
      `,
      [start_date, end_date]
    );

    if (!invoices.length) {
      return res.status(404).json({
        success: false,
        message: 'No invoices found for the given date range',
      });
    }

    // 2️⃣ Fetch related items
    const invoiceIds = invoices.map(inv => inv.id);
    const [items] = await db.promise().query(
      `
      SELECT
        invoice_id,
        hs_code AS hsCode,
        product_description AS productDescription,
        rate_desc AS rate,
        rate_percent AS ratePercent,
        uom AS uoM,
        quantity,
        total_values AS totalValues,
        value_sales_excl_st AS valueSalesExcludingST,
        sales_tax_applicable AS salesTaxApplicable,
        further_tax AS furtherTax,
        discount
      FROM invoice_items
      WHERE invoice_id IN (?)
      ORDER BY invoice_id ASC
      `,
      [invoiceIds]
    );

    // 3️⃣ Ensure export folder exists
    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // 🕒 Make unique filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-') // Replace invalid characters for Windows
      .replace('T', '_')
      .split('Z')[0];

    const fileName = `invoices_${start_date}_to_${end_date}_${timestamp}.csv`;
    const filePath = path.join(exportDir, fileName);

    // 4️⃣ Create CSV
    const writableStream = fs.createWriteStream(filePath);
    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(writableStream);

    invoices.forEach(inv => {
      const relatedItems = items.filter(it => it.invoice_id === inv.id);
      relatedItems.forEach(it => {
        csvStream.write({
          UUID: inv.uuid,
          'Invoice Type': inv.invoiceType,
          'Invoice Date': inv.invoiceDate,
          Seller: inv.seller,
          Buyer: inv.buyer,
          'Total Value': inv.totalValue,
          'Total Tax': inv.totalTax,
          Status: inv.status,
          'HS Code': it.hsCode,
          'Product Description': it.productDescription,
          'Rate': it.rate,
          'Rate %': it.ratePercent,
          'Quantity': it.quantity,
          'UoM': it.uoM,
          'Item Value (Excl. ST)': it.valueSalesExcludingST,
          'Sales Tax Applicable': it.salesTaxApplicable,
          'Further Tax': it.furtherTax,
          Discount: it.discount,
        });
      });
    });

    csvStream.end();

    writableStream.on('finish', () => {
      res.download(filePath, fileName, err => {
        if (err) {
          console.error('❌ Error sending CSV:', err);
          res.status(500).json({
            success: false,
            message: 'Error downloading CSV file',
          });
        }

        // 🧹 Optional: delete file after 10 seconds
        setTimeout(() => {
          fs.unlink(filePath, () => {});
        }, 10000);
      });
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};



exports.uploadInvoicesExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty.' });
    }

    const db = connection.promise();
    const invoiceMap = new Map(); // avoid duplicate invoices

    for (const row of data) {
      const {
        invoiceType,
        invoiceDate,
        sellerNTNCNIC,
        sellerBusinessName,
        sellerProvince,
        sellerAddress,
        buyerNTNCNIC,
        buyerBusinessName,
        buyerProvince,
        buyerAddress,
        buyerRegistrationType,
        invoiceRefNo,
        scenarioId,
        hsCode,
        productDescription,
        rate_desc, // string like "15%"
        uoM,
        quantity,
        totalValues,
        valueSalesExcludingST,
        fixedNotifiedValueOrRetailPrice,
        salesTaxApplicable,
        salesTaxWithheldAtSource,
        extraTax,
        furtherTax,
        sroScheduleNo,
        fedPayable,
        discount,
        saleType,
        sroItemSerialNo,
      } = row;

      // ✅ Format date properly
      let formattedDate = null;
      if (typeof invoiceDate === 'number') {
        formattedDate = new Date(Math.round((invoiceDate - 25569) * 86400 * 1000))
          .toISOString()
          .split('T')[0];
      } else if (typeof invoiceDate === 'string') {
        const parts = invoiceDate.split(/[\/\-]/);
        if (parts.length === 3) {
          const [day, month, year] =
            parts[0].length === 4 ? [parts[2], parts[1], parts[0]] : [parts[0], parts[1], parts[2]];
          const parsedDate = new Date(`${year}-${month}-${day}`);
          if (!isNaN(parsedDate)) {
            formattedDate = parsedDate.toISOString().split('T')[0];
          }
        }
      }

      // ✅ Extract numeric rate percent from rate_desc
      const rate_percent =
        rate_desc && typeof rate_desc === 'string'
          ? parseFloat(rate_desc.replace('%', '').trim()) || 0
          : 0;

      // ✅ Unique invoice key
      const invoiceKey = `${invoiceRefNo}_${scenarioId}`;
      let invoiceId;

      // ✅ Insert invoice only once
      if (!invoiceMap.has(invoiceKey)) {
        const invoiceUuid = uuidv4();

        const [invoiceResult] = await db.query(
          `INSERT INTO invoices 
            (uuid, invoice_type, invoice_date, seller_ntn_cnic, seller_business_name, seller_province, seller_address,
             buyer_ntn_cnic, buyer_business_name, buyer_province, buyer_address, buyer_registration_type,
             invoice_ref_no, scenario_id, total_value, total_tax)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceUuid,
            invoiceType,
            formattedDate,
            sellerNTNCNIC,
            sellerBusinessName,
            sellerProvince,
            sellerAddress,
            buyerNTNCNIC,
            buyerBusinessName,
            buyerProvince,
            buyerAddress,
            buyerRegistrationType,
            invoiceRefNo,
            scenarioId,
            totalValues || 0,
            salesTaxApplicable || 0,
          ]
        );

        invoiceId = invoiceResult.insertId;
        invoiceMap.set(invoiceKey, invoiceId);
      } else {
        invoiceId = invoiceMap.get(invoiceKey);
      }

      // ✅ Insert invoice item (including rate_desc string)
      // ✅ Insert invoice item (including rate_desc string)
      const itemUuid = uuidv4();
      await db.query(
        `INSERT INTO invoice_items 
    (invoice_id, uuid, hs_code, product_description, rate_desc, rate_percent, uom, quantity,
     total_values, value_sales_excl_st, fixed_notified_value_or_retail_price,
     sales_tax_applicable, sales_tax_withheld_at_source, extra_tax, further_tax,
     fed_payable, discount, sale_type, sro_schedule_no, sro_item_serial_no)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          itemUuid,
          hsCode || '',
          productDescription || '',
          // ✅ FIXED: ensures "15%" even if Excel gave 0.15
          typeof rate_desc === 'number'
            ? `${(rate_desc * 100).toFixed(2)}%`
            : rate_desc || null,
          rate_percent,
          uoM || '',
          quantity || 0,
          totalValues || 0,
          valueSalesExcludingST || 0,
          fixedNotifiedValueOrRetailPrice || 0,
          salesTaxApplicable || 0,
          salesTaxWithheldAtSource || 0,
          extraTax || 0,
          furtherTax || 0,
          fedPayable || 0,
          discount || 0,
          saleType || '',
          sroScheduleNo || '',
          sroItemSerialNo || '',
        ]
      );

    }

    res.status(200).json({
      success: true,
      message: '✅ Invoices uploaded successfully with rate_desc saved correctly.',
    });
  } catch (error) {
    console.error('❌ Error uploading invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading invoices.',
      error: error.message,
    });
  }
};

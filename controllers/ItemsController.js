const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

// ✅ Helper to auto-generate next HSCODE
async function generateHsCode() {
  const [rows] = await db.promise().query("SELECT hsCode FROM items ORDER BY id DESC LIMIT 1");
  if (rows.length === 0) return "2025.000";

  // Extract numeric part and increment
  const lastCode = rows[0].hsCode;
  const parts = lastCode.split(".");
  let next = parseInt(parts[1]) + 1;
  return `${parts[0]}.${next.toString().padStart(4, "0")}`;
}

// ===============================
// CREATE ITEM
// ===============================
exports.createItem = async (req, res) => {
  try {
    const {
      productDescription,
      rate,
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
    } = req.body;

    const uuid = uuidv4();
    const hsCode = await generateHsCode();

    await db.promise().query(
      `INSERT INTO items (
        uuid, hsCode, productDescription, rate, uoM, quantity, totalValues, valueSalesExcludingST,
        fixedNotifiedValueOrRetailPrice, salesTaxApplicable, salesTaxWithheldAtSource, extraTax,
        furtherTax, sroScheduleNo, fedPayable, discount, saleType, sroItemSerialNo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        hsCode,
        productDescription,
        rate,
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
      ]
    );

    res.status(201).json({ message: "Item created successfully", uuid, hsCode });
  } catch (error) {
    console.error("❌ Create Item Error:", error);
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
};

// ===============================
// GET ALL ITEMS
// ===============================
// ===============================
// GET ALL ITEMS (with pagination, hide ID)
// ===============================
exports.getAllItems = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Search parameter
    const search = req.query.search ? `%${req.query.search}%` : null;

    // Query conditions
    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = "WHERE hsCode LIKE ? OR productDescription LIKE ?";
      params.push(search, search);
    }

    // Count total items
    const [[{ total }]] = await db
      .promise()
      .query(`SELECT COUNT(*) as total FROM items ${whereClause}`, params);

    // Add pagination params
    params.push(limit, offset);

    // Fetch paginated items (excluding 'id')
    const [rows] = await db
      .promise()
      .query(
        `SELECT uuid, hsCode, productDescription, rate, uoM, quantity,
                totalValues, valueSalesExcludingST, fixedNotifiedValueOrRetailPrice,
                salesTaxApplicable, salesTaxWithheldAtSource, extraTax, furtherTax,
                sroScheduleNo, fedPayable, discount, saleType, sroItemSerialNo, created_at
         FROM items
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        params
      );

    // Pagination info
    const pagination = {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };

    res.status(200).json({
      pagination,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching items:", error.message);
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};

// ===============================
// GET SINGLE ITEM BY UUID
// ===============================
exports.getItemByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;

    const [rows] = await db
      .promise()
      .query(
        `SELECT uuid, hsCode, productDescription, rate, uoM, quantity,
                totalValues, valueSalesExcludingST, fixedNotifiedValueOrRetailPrice,
                salesTaxApplicable, salesTaxWithheldAtSource, extraTax, furtherTax,
                sroScheduleNo, fedPayable, discount, saleType, sroItemSerialNo, created_at
         FROM items WHERE uuid = ?`,
        [uuid]
      );

    if (rows.length === 0)
      return res.status(404).json({ message: "Item not found" });

    res.status(200).json(rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching item", error: error.message });
  }
};


// ===============================
// UPDATE ITEM
// ===============================
exports.updateItem = async (req, res) => {
  try {
    const { uuid } = req.params;
    const fields = req.body;

    const [existing] = await db.promise().query("SELECT * FROM items WHERE uuid = ?", [uuid]);
    if (existing.length === 0)
      return res.status(404).json({ message: "Item not found" });

    // Merge with existing
    const updated = { ...existing[0], ...fields };

    await db.promise().query(
      `UPDATE items SET 
        productDescription=?, rate=?, uoM=?, quantity=?, totalValues=?, valueSalesExcludingST=?, 
        fixedNotifiedValueOrRetailPrice=?, salesTaxApplicable=?, salesTaxWithheldAtSource=?, 
        extraTax=?, furtherTax=?, sroScheduleNo=?, fedPayable=?, discount=?, saleType=?, 
        sroItemSerialNo=?, updated_at=NOW() WHERE uuid=?`,
      [
        updated.productDescription,
        updated.rate,
        updated.uoM,
        updated.quantity,
        updated.totalValues,
        updated.valueSalesExcludingST,
        updated.fixedNotifiedValueOrRetailPrice,
        updated.salesTaxApplicable,
        updated.salesTaxWithheldAtSource,
        updated.extraTax,
        updated.furtherTax,
        updated.sroScheduleNo,
        updated.fedPayable,
        updated.discount,
        updated.saleType,
        updated.sroItemSerialNo,
        uuid,
      ]
    );

    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
};

// ===============================
// DELETE ITEM
// ===============================
exports.deleteItem = async (req, res) => {
  try {
    const { uuid } = req.params;
    const [rows] = await db.promise().query("DELETE FROM items WHERE uuid = ?", [uuid]);
    if (rows.affectedRows === 0)
      return res.status(404).json({ message: "Item not found" });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};

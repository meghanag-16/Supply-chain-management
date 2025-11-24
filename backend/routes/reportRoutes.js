const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkAuth, ensureIsAdmin } = require('../middleware/authMiddleware');

// --- 1. AGGREGATION QUERIES ---

// Query A: Total Sales Volume by Status (User inputs 'Completed', 'Pending', etc.)
router.post('/reports/agg-sales-by-status', checkAuth, async (req, res) => {
  try {
    const { status } = req.body;
    // Aggregation: SUM with WHERE clause
    const sql = `
      SELECT status, COUNT(order_id) as total_orders, SUM(total_amount) as total_revenue 
      FROM Orders 
      JOIN Payment ON Orders.payment_id = Payment.payment_id
      WHERE Payment.status = ?
      GROUP BY status
    `;
    const [rows] = await pool.query(sql, [status]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Query B: Average Product Price by Category (User inputs 'Smartphone', 'Laptop', etc.)
router.post('/reports/agg-avg-price-category', checkAuth, async (req, res) => {
  try {
    const { category } = req.body;
    // Aggregation: AVG with WHERE clause
    const sql = `
      SELECT category, COUNT(product_id) as product_count, AVG(unit_price) as average_price 
      FROM Product 
      WHERE category LIKE ?
      GROUP BY category
    `;
    const [rows] = await pool.query(sql, [`%${category}%`]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// --- 2. COMPLEX JOIN SEARCHES ---

// 2.1 EXISTING: Find all orders where the Customer is from [User Input City]
router.post('/reports/complex-search', checkAuth, async (req, res) => {
  try {
    const { city } = req.body;
    
    const sql = `
      SELECT o.order_id, o.total_amount, c.customer_name, c.city 
      FROM Orders o
      JOIN Customer c ON o.customer_id = c.customer_id
      WHERE c.city LIKE ?
    `;
    
    const [rows] = await pool.query(sql, [`%${city}%`]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- 3. NESTED QUERY ---

// "Find products that are cheaper than the average price of all products" or similar logic
router.post('/reports/nested', checkAuth, async (req, res) => {
  try {
    const { min_price } = req.body;
    
    // Example: Find suppliers who supply products costing more than X
    const sql = `
      SELECT supplier_name, city 
      FROM Supplier 
      WHERE supplier_id IN (
        SELECT supplier_id FROM Product WHERE unit_price > ?
      )
    `;
    
    const [rows] = await pool.query(sql, [min_price]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- 4. LOGS VIEWER ---

router.get('/logs/triggers', checkAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product_Price_Log ORDER BY change_timestamp DESC LIMIT 10'); 
    res.status(200).json(rows);
  } catch (error) {
    console.log("Log table might not exist yet");
    res.status(200).json([]); 
  }
});

// ==================================================================
//  NEW ADDITIONS: FUNCTIONS & PROCEDURES (Admin Only)
// ==================================================================

// --- SQL FUNCTIONS ---

router.post('/functions/utilization', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { warehouse_id } = req.body;
    const [rows] = await pool.query('SELECT fn_get_warehouse_utilization_percent(?) AS result', [warehouse_id]);
    res.status(200).json({ result: rows[0].result + '%' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/functions/customer-order-count', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { customer_id } = req.body;
    const [rows] = await pool.query('SELECT fn_get_customer_total_orders(?) AS result', [customer_id]);
    res.status(200).json({ result: rows[0].result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/functions/product-availability', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { product_id } = req.body;
    const [rows] = await pool.query('SELECT fn_get_product_availability(?) AS result', [product_id]);
    res.status(200).json({ result: rows[0].result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/functions/tax', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const [rows] = await pool.query('SELECT fn_calculate_order_tax(?) AS result', [amount]);
    res.status(200).json({ result: rows[0].result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/functions/manufacturer-count', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { manufacturer_id } = req.body;
    const [rows] = await pool.query('SELECT fn_get_manufacturer_product_count(?) AS result', [manufacturer_id]);
    res.status(200).json({ result: rows[0].result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- STORED PROCEDURES ---

router.post('/procedures/customer-orders', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { customer_id } = req.body;
    const [rows] = await pool.query('CALL sp_get_orders_by_customer(?)', [customer_id]);
    res.status(200).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/procedures/low-stock', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { threshold } = req.body;
    const [rows] = await pool.query('CALL sp_get_low_stock_products(?)', [threshold]);
    res.status(200).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/procedures/update-shipment', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { shipment_id, status } = req.body;
    await pool.query('CALL sp_update_shipment_status(?, ?)', [shipment_id, status]);
    res.status(200).json({ message: 'Shipment status updated successfully via Procedure.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/procedures/add-stock', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { warehouse_id, amount } = req.body;
    await pool.query('CALL sp_add_stock_to_warehouse(?, ?)', [warehouse_id, amount]);
    res.status(200).json({ message: 'Stock added to warehouse successfully.' });
  } catch (error) {
    // Return Trigger Error (400 Bad Request)
    if(error.sqlState === '45000') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// --- ADDITIONAL LOGS ---

router.get('/logs/price', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product_Price_Log ORDER BY change_timestamp DESC');
    res.status(200).json(rows);
  } catch (error) { res.status(200).json([]); }
});

router.get('/logs/shipment', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Shipment_Status_Log ORDER BY change_timestamp DESC');
    res.status(200).json(rows);
  } catch (error) { res.status(200).json([]); }
});

module.exports = router;
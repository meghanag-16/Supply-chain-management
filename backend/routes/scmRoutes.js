const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkAuth, checkPermission } = require('../middleware/authMiddleware');

// --- HELPERS ---
const isOwner = async (table, idCol, idVal, foreignCol, foreignVal) => {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idCol} = ? AND ${foreignCol} = ?`, [idVal, foreignVal]);
  return rows.length > 0;
};

// 1. SUPPLIER ROUTES
router.post('/suppliers', checkAuth, checkPermission('Supplier', 'can_edit'), async (req, res) => {
  try {
    const { supplier_id, supplier_name, phone_number, contact_person, city, postal_code, rating } = req.body;
    const sql = `INSERT INTO Supplier (supplier_id, supplier_name, phone_number, contact_person, city, postal_code, rating) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [supplier_id, supplier_name, phone_number, contact_person, city, postal_code, rating]);
    res.status(201).json({ message: 'Supplier created successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/suppliers/:id', checkAuth, checkPermission('Supplier', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;
    
    // FIX: Convert both to String to ensure "112" matches 112
    if (role === 'Supplier' && String(id) !== String(entity_id)) {
      return res.status(403).json({ error: 'You can only update your own profile.' });
    }

    const { supplier_name, phone_number, contact_person, city, postal_code, rating } = req.body;
    const sql = `UPDATE Supplier SET supplier_name=?, phone_number=?, contact_person=?, city=?, postal_code=?, rating=? WHERE supplier_id=?`;
    await pool.query(sql, [supplier_name, phone_number, contact_person, city, postal_code, rating, id]);
    res.status(200).json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. MANUFACTURER ROUTES
router.post('/manufacturers', checkAuth, checkPermission('Manufacturer', 'can_edit'), async (req, res) => {
  try {
    const { manufacturer_id, manufacturer_name, phone_number, city, postal_code, production_capacity, license_number } = req.body;
    const sql = `INSERT INTO Manufacturer (manufacturer_id, manufacturer_name, phone_number, city, postal_code, production_capacity, license_number) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [manufacturer_id, manufacturer_name, phone_number, city, postal_code, production_capacity, license_number]);
    res.status(201).json({ message: 'Manufacturer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/manufacturers/:id', checkAuth, checkPermission('Manufacturer', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;

    // FIX: Added String() conversion
    if (role === 'Manufacturer' && String(id) !== String(entity_id)) {
      return res.status(403).json({ error: 'You can only update your own profile.' });
    }

    const { manufacturer_name, phone_number, city, postal_code, production_capacity, license_number } = req.body;
    const sql = `UPDATE Manufacturer SET manufacturer_name=?, phone_number=?, city=?, postal_code=?, production_capacity=?, license_number=? WHERE manufacturer_id=?`;
    await pool.query(sql, [manufacturer_name, phone_number, city, postal_code, production_capacity, license_number, id]);
    res.status(200).json({ message: 'Manufacturer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. WAREHOUSE ROUTES
router.post('/warehouses', checkAuth, checkPermission('Warehouse', 'can_edit'), async (req, res) => {
  try {
    const { warehouse_id, warehouse_name, city, postal_code, capacity, current_utilization } = req.body;
    const sql = `INSERT INTO Warehouse (warehouse_id, warehouse_name, city, postal_code, capacity, current_utilization) VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [warehouse_id, warehouse_name, city, postal_code, capacity, current_utilization]);
    res.status(201).json({ message: 'Warehouse created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/warehouses/:id', checkAuth, checkPermission('Warehouse', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;

    if (role === 'Warehouse' && String(id) !== String(entity_id)) {
        return res.status(403).json({ error: 'You can only update your own warehouse.' });
    }

    const { warehouse_name, city, postal_code, capacity, current_utilization } = req.body;
    
    const sql = `UPDATE Warehouse SET warehouse_name=?, city=?, postal_code=?, capacity=?, current_utilization=? WHERE warehouse_id=?`;
    
    await pool.query(sql, [warehouse_name, city, postal_code, capacity, current_utilization, id]);
    res.status(200).json({ message: 'Warehouse updated successfully' });

  } catch (error) {
    console.error("Update Error:", error);
    // --- CATCH TRIGGER ERROR ---
    if (error.sqlState === '45000') {
        // Send the specific trigger message (e.g., "Capacity Exceeded")
        return res.status(400).json({ error: error.message }); 
    }
    res.status(500).json({ error: error.message });
  }
});

// 4. CUSTOMER ROUTES
router.post('/customers', checkAuth, checkPermission('Customer', 'can_edit'), async (req, res) => {
  try {
    const { customer_id, customer_name, phone_number, customer_type, city, postal_code } = req.body;
    const sql = `INSERT INTO Customer (customer_id, customer_name, phone_number, customer_type, city, postal_code) VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [customer_id, customer_name, phone_number, customer_type, city, postal_code]);
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/customers/:id', checkAuth, checkPermission('Customer', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;

    // FIX: Added String() conversion
    if (role === 'Customer' && String(id) !== String(entity_id)) {
        return res.status(403).json({ error: 'You can only update your own profile.' });
    }

    const { customer_name, phone_number, customer_type, city, postal_code } = req.body;
    const sql = `UPDATE Customer SET customer_name=?, phone_number=?, customer_type=?, city=?, postal_code=? WHERE customer_id=?`;
    await pool.query(sql, [customer_name, phone_number, customer_type, city, postal_code, id]);
    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 5. PRODUCT ROUTES
router.post('/products', checkAuth, checkPermission('Product', 'can_edit'), async (req, res) => {
  try {
    let { product_id, product_name, product_desc, unit_price, quantity_available, category, supplier_id, manufacturer_id } = req.body;
    const { role, entity_id } = req.user;

    if (role === 'Supplier') {
        supplier_id = entity_id; 
    } else if (role === 'Manufacturer') {
        manufacturer_id = entity_id; 
    }

    const sql = `INSERT INTO Product (product_id, product_name, product_desc, unit_price, quantity_available, category, supplier_id, manufacturer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [product_id, product_name, product_desc, unit_price, quantity_available, category, supplier_id, manufacturer_id]);
    res.status(201).json({ message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

router.put('/products/:id', checkAuth, checkPermission('Product', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;
    
    if (role === 'Supplier') {
       const valid = await isOwner('Product', 'product_id', id, 'supplier_id', entity_id);
       if (!valid) return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
    }
    if (role === 'Manufacturer') {
       const valid = await isOwner('Product', 'product_id', id, 'manufacturer_id', entity_id);
       if (!valid) return res.status(403).json({ error: 'Forbidden: You do not own this product.' });
    }

    const { product_name, product_desc, unit_price, quantity_available, category, supplier_id, manufacturer_id } = req.body;
    const sql = `UPDATE Product SET product_name=?, product_desc=?, unit_price=?, quantity_available=?, category=?, supplier_id=?, manufacturer_id=? WHERE product_id=?`;
    await pool.query(sql, [product_name, product_desc, unit_price, quantity_available, category, supplier_id, manufacturer_id, id]);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 6. SHIPMENT ROUTES
router.post('/shipments', checkAuth, checkPermission('Shipment', 'can_edit'), async (req, res) => {
  try {
    let { shipment_id, carrier_name, transport_mode, shipping_cost, status, warehouse_id } = req.body;
    const { role, entity_id } = req.user;

    if (role === 'Warehouse') {
        warehouse_id = entity_id; 
    }

    const sql = `INSERT INTO Shipment (shipment_id, carrier_name, transport_mode, shipping_cost, status, warehouse_id) VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [shipment_id, carrier_name, transport_mode, shipping_cost, status, warehouse_id]);
    res.status(201).json({ message: 'Shipment created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/shipments/:id', checkAuth, checkPermission('Shipment', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;

    if (role === 'Warehouse') {
        const valid = await isOwner('Shipment', 'shipment_id', id, 'warehouse_id', entity_id);
        if (!valid) return res.status(403).json({ error: 'Forbidden: This shipment is not from your warehouse.' });
    }

    const { carrier_name, transport_mode, shipping_cost, warehouse_id } = req.body;
    const sql = `UPDATE Shipment SET carrier_name=?, transport_mode=?, shipping_cost=?, warehouse_id=? WHERE shipment_id=?`;
    await pool.query(sql, [carrier_name, transport_mode, shipping_cost, warehouse_id, id]);
    res.status(200).json({ message: 'Shipment details updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// SPECIAL: Update Shipment Status
router.put('/shipments/:id/status', checkAuth, checkPermission('Shipment', 'can_edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, entity_id } = req.user;
    const { status } = req.body;

    if (role === 'Warehouse') {
        const valid = await isOwner('Shipment', 'shipment_id', id, 'warehouse_id', entity_id);
        if (!valid) return res.status(403).json({ error: 'Forbidden: Not your shipment.' });
    }

    await pool.query('CALL sp_update_shipment_status(?, ?)', [id, status]);
    res.status(200).json({ message: 'Shipment status updated!' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// 7. PAYMENT & 8. ORDERS ROUTES
router.post('/payments', checkAuth, checkPermission('Orders', 'can_edit'), async (req, res) => {
    try {
        const { payment_id, payment_mode, status } = req.body;
        const sql = `INSERT INTO Payment (payment_id, payment_mode, status) VALUES (?, ?, ?)`;
        await pool.query(sql, [payment_id, payment_mode, status]);
        res.status(201).json({ message: 'Payment created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Database error' });
      }
});

router.put('/payments/:id', checkAuth, checkPermission('Orders', 'can_edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_mode, status } = req.body;
        const sql = `UPDATE Payment SET payment_mode=?, status=? WHERE payment_id=?`;
        await pool.query(sql, [payment_mode, status, id]);
        res.status(200).json({ message: 'Payment updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Database error' });
      }
});

router.post('/orders', checkAuth, checkPermission('Orders', 'can_edit'), async (req, res) => {
    try {
        let { order_id, total_amount, ordered_item, customer_id, shipment_id, payment_id } = req.body;
        if (req.user.role === 'Customer') customer_id = req.user.entity_id;

        const sql = `INSERT INTO Orders (order_id, total_amount, ordered_item, customer_id, shipment_id, payment_id) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [order_id, total_amount, ordered_item, customer_id, shipment_id, payment_id]);
        res.status(201).json({ message: 'Order created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Database error' });
      }
});

router.put('/orders/:id', checkAuth, checkPermission('Orders', 'can_edit'), async (req, res) => {
    try {
        const { id } = req.params;
        const { total_amount, ordered_item, customer_id, shipment_id, payment_id } = req.body;
        
        if (req.user.role === 'Customer') {
             const valid = await isOwner('Orders', 'order_id', id, 'customer_id', req.user.entity_id);
             if (!valid) return res.status(403).json({error: 'Not your order'});
        }

        const sql = `UPDATE Orders SET total_amount=?, ordered_item=?, customer_id=?, shipment_id=?, payment_id=? WHERE order_id=?`;
        await pool.query(sql, [total_amount, ordered_item, customer_id, shipment_id, payment_id, id]);
        res.status(200).json({ message: 'Order updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Database error' });
      }
});

module.exports = router;
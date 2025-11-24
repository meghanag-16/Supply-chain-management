const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { checkAuth, JWT_SECRET } = require('../middleware/authMiddleware');

// --- REGISTER (WITH AUTOMATIC PROFILE CREATION) ---
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection(); // 1. Start a specific connection
  try {
    // Extract all possible fields from the request body
    const { 
      user_id, username, password, role, // Auth Info
      name, phone, city, postal_code, contact_person, // Common Profile Info
      type, rating, capacity, production_capacity, license_number // Specific Profile Info
    } = req.body;

    // 2. Begin Transaction (All or Nothing)
    await connection.beginTransaction();

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Insert into USERS table
    // NOTICE: We set linked_entity_id = user_id so the user is linked to their own profile
    const userSql = `INSERT INTO Users (user_id, username, password_hash, role, linked_entity_id) VALUES (?, ?, ?, ?, ?)`;
    await connection.query(userSql, [user_id, username, password_hash, role, user_id]);

    // 5. Insert into the SPECIFIC Role Table
    if (role === 'Supplier') {
      const sql = `INSERT INTO Supplier (supplier_id, supplier_name, phone_number, contact_person, city, postal_code, rating) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      // Use 'name' from body as supplier_name, default rating to 5 if missing
      await connection.query(sql, [user_id, name, phone, contact_person, city, postal_code, rating || 5.0]);
    } 
    else if (role === 'Manufacturer') {
      const sql = `INSERT INTO Manufacturer (manufacturer_id, manufacturer_name, phone_number, city, postal_code, production_capacity, license_number) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(sql, [user_id, name, phone, city, postal_code, production_capacity || 0, license_number || 'PENDING']);
    }
    else if (role === 'Warehouse') {
      const sql = `INSERT INTO Warehouse (warehouse_id, warehouse_name, city, postal_code, capacity, current_utilization) VALUES (?, ?, ?, ?, ?, ?)`;
      await connection.query(sql, [user_id, name, city, postal_code, capacity || 1000, 0]);
    }
    else if (role === 'Customer') {
      const sql = `INSERT INTO Customer (customer_id, customer_name, phone_number, customer_type, city, postal_code) VALUES (?, ?, ?, ?, ?, ?)`;
      await connection.query(sql, [user_id, name, phone, type || 'Retail', city, postal_code]);
    }
    // If Role is 'Admin', we usually don't need a separate profile table, or you can add logic here.

    // 6. Commit the Transaction (Save Changes)
    await connection.commit();

    res.status(201).json({ message: `User and ${role} profile created successfully!` });

  } catch (error) {
    // 7. Rollback if ANY error occurs (Clean up partial data)
    await connection.rollback();
    console.error('Registration Transaction Error:', error);
    res.status(500).json({ error: 'Registration failed. Ensure ID is unique and fields are valid.' });
  } finally {
    connection.release(); // Release connection back to pool
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Include linked_entity_id in the token payload
    const payload = { 
      user: { 
        id: user.user_id, 
        role: user.role, 
        entity_id: user.linked_entity_id 
      } 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- GET CURRENT USER INFO ---
router.get('/auth/me', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const [userRows] = await pool.query('SELECT user_id, username, role, linked_entity_id, created_at FROM Users WHERE user_id = ?', [userId]);
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });

    const [permRows] = await pool.query('SELECT * FROM Role_Permissions WHERE role = ?', [role]);

    res.status(200).json({ user: userRows[0], permissions: permRows });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
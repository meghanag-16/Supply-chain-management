const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkAuth, ensureIsAdmin } = require('../middleware/authMiddleware');

router.get('/users', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, role, created_at FROM Users');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/permissions', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Role_Permissions');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/permissions', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { role, entity_name, can_view, can_edit, can_delete } = req.body;
    const sql = `UPDATE Role_Permissions SET can_view=?, can_edit=?, can_delete=? WHERE role=? AND entity_name=?`;
    await pool.query(sql, [can_view, can_edit, can_delete, role, entity_name]);
    res.status(200).json({ message: 'Permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/admin/query', checkAuth, ensureIsAdmin, async (req, res) => {
  try {
    const { query } = req.body;
    if (query.includes(';')) return res.status(400).json({ error: 'Only single SQL queries are allowed.' });
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/admin/tables/:tableName', checkAuth, ensureIsAdmin, async (req, res) => {
  const { tableName } = req.params;
  const blockedTables = ['Users', 'Role_Permissions'];
  if (blockedTables.includes(tableName)) {
    return res.status(403).json({ error: `Deleting data from '${tableName}' is not allowed.` });
  }
  try {
    await pool.query(`TRUNCATE TABLE ${tableName}`);
    res.status(200).json({ message: `All data from table '${tableName}' has been deleted.` });
  } catch (error) {
    res.status(500).json({ error: 'Table not found or permission denied.' });
  }
});

module.exports = router;
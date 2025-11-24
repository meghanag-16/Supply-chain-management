const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

const checkAuth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const checkPermission = (entity_name, action) => {
  return async (req, res, next) => {
    try {
      const role = req.user.role;
      if (role === 'Admin') return next();

      const sql = `SELECT ${action} FROM Role_Permissions WHERE role = ? AND entity_name = ?`;
      const [rows] = await pool.query(sql, [role, entity_name]);

      if (rows.length === 0 || !rows[0][action]) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission.' });
      }
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Server error during permission check' });
    }
  };
};

const ensureIsAdmin = (req, res, next) => {
  if (req.user.role === 'Admin') next();
  else res.status(403).json({ error: 'Forbidden: You must be an admin.' });
};

module.exports = { checkAuth, checkPermission, ensureIsAdmin, JWT_SECRET };
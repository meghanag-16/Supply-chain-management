const { checkAuth, checkPermission } = require('../middleware/authMiddleware');
const pool = require('../config/db');

const createCrudRoutes = (app, entityName, tableName, customIdColumn = null) => {
  const basePath = `/api/${tableName.toLowerCase()}`;
  const idColumn = customIdColumn || `${tableName.toLowerCase()}_id`;

  // GET ALL (FILTERED)
  app.get(basePath, checkAuth, checkPermission(entityName, 'can_view'), async (req, res) => {
    try {
      const role = req.user.role;
      const entityId = req.user.entity_id;
      
      let sql = `SELECT * FROM ${tableName}`;
      let params = [];

      // --- ROW LEVEL SECURITY LOGIC ---
      if (role !== 'Admin' && entityId) {
        // 1. Suppliers viewing data
        if (role === 'Supplier') {
          if (tableName === 'Supplier') {
             sql += ` WHERE supplier_id = ?`; // View own profile
             params.push(entityId);
          } else if (tableName === 'Product') {
             sql += ` WHERE supplier_id = ?`; // View own products
             params.push(entityId);
          }
        }
        // 2. Manufacturers viewing data
        else if (role === 'Manufacturer') {
          if (tableName === 'Manufacturer') {
            sql += ` WHERE manufacturer_id = ?`;
            params.push(entityId);
          } else if (tableName === 'Product') {
            sql += ` WHERE manufacturer_id = ?`;
            params.push(entityId);
          }
        }
        // 3. Customers viewing data
        else if (role === 'Customer') {
          if (tableName === 'Customer') {
            sql += ` WHERE customer_id = ?`;
            params.push(entityId);
          } else if (tableName === 'Orders') {
            sql += ` WHERE customer_id = ?`; // View own orders
            params.push(entityId);
          }
        }
        // 4. Warehouse viewing data
        else if (role === 'Warehouse') {
          if (tableName === 'Warehouse') {
            sql += ` WHERE warehouse_id = ?`;
            params.push(entityId);
          } else if (tableName === 'Shipment') {
             sql += ` WHERE warehouse_id = ?`;
             params.push(entityId);
          }
        }
        // 5. Product (Manager) Role
        // As per requirement: "view suppliers manufacturers... but change only product"
        // We assume 'Product' role can view ALL, so no filter applied here.
      }

      const [rows] = await pool.query(sql, params);
      res.status(200).json(rows);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET ONE (Standard)
  app.get(`${basePath}/:id`, checkAuth, checkPermission(entityName, 'can_view'), async (req, res) => {
    try {
      const { id } = req.params;
      // Note: For strict security, you should apply the same filters here as above
      const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`, [id]);
      if (rows.length === 0) return res.status(404).json({ error: `${entityName} not found` });
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error(`Error fetching one ${tableName}:`, error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // DELETE (Standard - Ownership checks handled better in custom routes or via UI logic for simplicity)
  app.delete(`${basePath}/:id`, checkAuth, checkPermission(entityName, 'can_delete'), async (req, res) => {
    try {
      const { id } = req.params;
      const role = req.user.role;
      const entityId = req.user.entity_id;

      // Quick ownership check for Delete
      if (role !== 'Admin' && entityId) {
         if (tableName === 'Product' && role === 'Supplier') {
            const [check] = await pool.query(`SELECT * FROM Product WHERE ${idColumn}=? AND supplier_id=?`, [id, entityId]);
            if(check.length === 0) return res.status(403).json({error: "Cannot delete product you don't own"});
         }
         // Add similar checks for Manufacturer/Warehouse if needed
      }

      await pool.query(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`, [id]);
      res.status(200).json({ message: `${entityName} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      res.status(500).json({ error: 'Database error' });
    }
  });
};

module.exports = createCrudRoutes;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const createCrudRoutes = require('./utils/genericCrud');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const scmRoutes = require('./routes/scmRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3001;

// Apply Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('SCM Backend API is running!');
});

// Use Route Modules
app.use('/api', authRoutes);
app.use('/api', scmRoutes);
app.use('/api', reportRoutes);
app.use('/api', adminRoutes);

// Init Generic CRUD Routes (Note: These attach directly to app as per original utility)
createCrudRoutes(app, 'Supplier', 'Supplier');
createCrudRoutes(app, 'Manufacturer', 'Manufacturer');
createCrudRoutes(app, 'Warehouse', 'Warehouse');
createCrudRoutes(app, 'Customer', 'Customer');
createCrudRoutes(app, 'Product', 'Product');
createCrudRoutes(app, 'Shipment', 'Shipment');
createCrudRoutes(app, 'Payment', 'Payment');
createCrudRoutes(app, 'Orders', 'Orders', 'order_id');

// Start Server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
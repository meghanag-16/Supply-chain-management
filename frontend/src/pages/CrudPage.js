import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import GenericTable from '../components/GenericTable';
import DynamicForm from '../components/DynamicForm';

// --- (Keep tableSchemas, tableMap, apiGetPathMap, apiSubmitPathMap, idColumnMap exactly as they were) ---
// ... (Paste your existing schema objects here to keep file short, I will assume they exist) ...
const tableSchemas = {
  Supplier: { supplier_id: 'text', supplier_name: 'text', phone_number: 'text', contact_person: 'text', city: 'text', postal_code: 'text', rating: 'number' },
  Manufacturer: { manufacturer_id: 'text', manufacturer_name: 'text', phone_number: 'text', city: 'text', postal_code: 'text' },
  Warehouse: { warehouse_id: 'text', warehouse_name: 'text', city: 'text', postal_code: 'text', capacity: 'number', current_utilization: 'number' },
  Customer: { customer_id: 'text', customer_name: 'text', phone_number: 'text', city: 'text', postal_code: 'text' },
  Product: { product_id: 'text', product_name: 'text', product_desc: 'textarea', unit_price: 'number', quantity_available: 'number', category: 'text', supplier_id: 'text', manufacturer_id: 'text' },
  Shipment: { shipment_id: 'text', shipment_date: 'date', est_delivery_date: 'date', status: 'text', warehouse_id: 'text' },
  Payment: { payment_id: 'text', order_id: 'text', payment_date: 'date', amount: 'number', payment_method: 'text', status: 'text' },
  Orders: { order_id: 'text', customer_id: 'text', product_id: 'text', shipment_id: 'text', order_date: 'date', total_amount: 'number', ordered_item: 'text', quantity: 'number' },
};

const tableMap = { Suppliers: 'Supplier', Manufacturers: 'Manufacturer', Warehouses: 'Warehouse', Customers: 'Customer', Products: 'Product', Shipments: 'Shipment', Payments: 'Payment', Orders: 'Orders' };
const apiGetPathMap = { Supplier: 'supplier', Manufacturer: 'manufacturer', Warehouse: 'warehouse', Customer: 'customer', Product: 'product', Shipment: 'shipment', Payment: 'payment', Orders: 'orders' };
const apiSubmitPathMap = { Supplier: 'suppliers', Manufacturer: 'manufacturers', Warehouse: 'warehouses', Customer: 'customers', Product: 'products', Shipment: 'shipments', Payment: 'payments', Orders: 'orders' };
const idColumnMap = { Supplier: 'supplier_id', Manufacturer: 'manufacturer_id', Warehouse: 'warehouse_id', Customer: 'customer_id', Product: 'product_id', Shipment: 'shipment_id', Payment: 'payment_id', Orders: 'order_id' };


const CrudPage = () => {
  const { user, checkPermission } = useAuth();
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [action, setAction] = useState(null); 
  const [currentItem, setCurrentItem] = useState(null);

  // --- 1. STRICT FILTERING FOR DROPDOWN ---
  const roleAccess = {
    Admin: Object.keys(tableMap), // All
    Supplier: ['Suppliers', 'Products'],
    Manufacturer: ['Manufacturers', 'Products'],
    Warehouse: ['Warehouses', 'Shipments'],
    Customer: ['Customers', 'Orders', 'Products']
  };

  const availableTables = roleAccess[user.role] || [];

  // Fetch data
  useEffect(() => {
    if (!selectedTable) { setData([]); return; }
    setAction(null); setCurrentItem(null); setMessage('');
    
    const entityName = tableMap[selectedTable];
    const apiPath = apiGetPathMap[entityName];

    // Permission Check
    if (checkPermission(entityName, 'can_view')) {
      setLoading(true);
      api.get(`/${apiPath}`)
        .then(res => setData(res.data))
        .catch(err => setError('Failed to fetch data.'))
        .finally(() => setLoading(false));
    } else {
      setError('Access Denied.');
    }
  }, [selectedTable, checkPermission]);

  // --- 2. HANDLE SPECIAL PROCEDURE (Shipment Status) ---
  const handleShipmentStatusUpdate = async (item) => {
    const newStatus = window.prompt("Enter new status (e.g., Delivered, Shipped):", item.status);
    if (!newStatus || newStatus === item.status) return;

    try {
      // Call the special endpoint that triggers the Stored Procedure
      await api.put(`/shipments/${item.shipment_id}/status`, { status: newStatus });
      setMessage('Shipment status updated successfully via Procedure!');
      // Refresh Data
      const res = await api.get(`/shipment`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status.');
    }
  };

  // Form Submit
  const handleFormSubmit = async (formData) => {
    setMessage(''); setError('');
    const entityName = tableMap[selectedTable];
    const apiPath = apiSubmitPathMap[entityName];
    const idColumn = idColumnMap[entityName];

    try {
      if (action === 'create') {
        if (formData[idColumn] === '') delete formData[idColumn];
        await api.post(`/${apiPath}`, formData);
        setMessage('Created successfully!');
      } else if (action === 'update') {
        await api.put(`/${apiPath}/${currentItem[idColumn]}`, formData);
        setMessage('Updated successfully!');
      }
      setAction(null); setCurrentItem(null);
      // Refresh
      const getPath = apiGetPathMap[entityName];
      const res = await api.get(`/${getPath}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (item) => {
    const entityName = tableMap[selectedTable];
    const apiPath = apiGetPathMap[entityName];
    const idColumn = idColumnMap[entityName];
    if (window.confirm(`Delete ${entityName} ID ${item[idColumn]}?`)) {
        try {
            await api.delete(`/${apiPath}/${item[idColumn]}`);
            setMessage('Deleted successfully.');
            const res = await api.get(`/${apiPath}`);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed.');
        }
    }
  };
  
  const entityName = tableMap[selectedTable];

  return (
    <div className="page-container">
      <h1>Data Management</h1>
      <p>Manage your {user.role} data.</p>

      <select className="form-select" onChange={(e) => setSelectedTable(e.target.value)} value={selectedTable}>
        <option value="">-- Select a Table --</option>
        {availableTables.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      
      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message error">{error}</p>}

      {selectedTable && (
        <div style={{marginTop: '1rem'}}>
          {/* HIDE CREATE BUTTON FOR CUSTOMERS */}
          {!action && checkPermission(entityName, 'can_edit') && user.role !== 'Customer' && (
            <button className="btn btn-primary" onClick={() => { setAction('create'); setCurrentItem(null); }}>
              + Create New {entityName}
            </button>
          )}

          {action && (
            <DynamicForm
              schema={tableSchemas[entityName]}
              initialData={currentItem}
              onSubmit={handleFormSubmit}
              onCancel={() => setAction(null)}
              formTitle={`${action === 'create' ? 'Create New' : 'Update'} ${entityName}`}
            />
          )}

          {!action && !loading && (
            <GenericTable
              data={data}
              entityName={entityName}
              onEdit={(item) => { setCurrentItem(item); setAction('update'); window.scrollTo(0,0); }}
              onDelete={handleDelete}
              // Pass the special function for Warehouses
              onCustomAction={entityName === 'Shipment' && user.role === 'Warehouse' ? handleShipmentStatusUpdate : null}
              customActionLabel="Update Status"
            />
          )}
          {loading && <p>Loading data...</p>}
        </div>
      )}
    </div>
  );
};

export default CrudPage;
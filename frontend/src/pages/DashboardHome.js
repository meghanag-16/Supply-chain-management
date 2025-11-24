import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import TablePreviewCard from '../components/TablePreviewCard';
import DataModal from '../components/DataModal';

const DashboardHome = () => {
  const { user } = useAuth();
  const [modalData, setModalData] = useState(null); 

  // 1. Define the Full List
  const allTables = [
    { entityName: 'Supplier', apiPath: '/supplier' },
    { entityName: 'Manufacturer', apiPath: '/manufacturer' },
    { entityName: 'Warehouse', apiPath: '/warehouse' },
    { entityName: 'Customer', apiPath: '/customer' },
    { entityName: 'Product', apiPath: '/product' },
    { entityName: 'Shipment', apiPath: '/shipment' },
    { entityName: 'Orders', apiPath: '/orders' },
    { entityName: 'Payment', apiPath: '/payment' },
  ];

  // 2. Define Visibility Rules based on Role
  const roleAccess = {
    Admin: ['Supplier', 'Manufacturer', 'Warehouse', 'Customer', 'Product', 'Shipment', 'Orders', 'Payment'],
    Supplier: ['Supplier', 'Product'], // Only see self and products
    Manufacturer: ['Manufacturer', 'Product'], // Only see self and products
    Warehouse: ['Warehouse', 'Shipment'], // Only see self and shipments
    Customer: ['Customer', 'Orders', 'Product'] // See self, orders, and view products
  };

  // 3. Filter the cards
  const visibleTables = allTables.filter(table => {
    // Safety check: if role is undefined, show nothing
    if (!user || !user.role) return false;
    // Get allowed list for this role
    const allowed = roleAccess[user.role] || [];
    return allowed.includes(table.entityName);
  });

  return (
    <div className="page-container">
      <h1>Welcome, {user?.username}!</h1>
      <p>Your role is: <span className="badge">{user?.role}</span></p>
      
      <hr />

      <h2>Your Data Dashboard</h2>
      <p>Click a card to see details.</p>
      <div className="table-preview-container">
        {visibleTables.length > 0 ? (
          visibleTables.map(table => (
            <TablePreviewCard 
              key={table.entityName}
              entityName={table.entityName}
              apiPath={table.apiPath}
              onCardClick={(data) => setModalData({ entityName: table.entityName, data: data })}
            />
          ))
        ) : (
          <p>No data available for your role.</p>
        )}
      </div>

      {modalData && (
        <DataModal 
          entityName={modalData.entityName}
          data={modalData.data}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};

export default DashboardHome;
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>LogiVerse</h3>
          <button onClick={onClose} className="sidebar-close-btn">&times;</button>
        </div>
        
        <div className="sidebar-links">
          <NavLink to="/dashboard" end className="sidebar-link" onClick={onClose}>
            Dashboard Home
          </NavLink>
          
          {/* Only show Reports to Admin or Warehouse (example logic) */}
          {(user?.role === 'Admin' || user?.role === 'Warehouse' || user?.role === 'Product') && (
            <NavLink to="/dashboard/reports" className="sidebar-link" onClick={onClose}>
              View Reports
            </NavLink>
          )}

          {/* Everyone logs in to manage data, so this is always visible, 
              but the content inside is filtered */}
          <NavLink to="/dashboard/crud" className="sidebar-link" onClick={onClose}>
            Manage Data
          </NavLink>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;
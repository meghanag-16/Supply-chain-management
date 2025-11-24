import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  // Change default state to 'false' (closed)
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      {/* Pass toggleSidebar to both Navbar (for hamburger) and Sidebar (for 'X') */}
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="dashboard-main-content">
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <main className={`dashboard-page-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Outlet /> {/* This renders the nested child route */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
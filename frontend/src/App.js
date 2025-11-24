// /src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CrudPage from './pages/CrudPage';
import ReportsPage from './pages/ReportsPage';
import RegisterPage from './pages/RegisterPage'; // <-- 1. MAKE SURE THIS IMPORT EXISTS

// Import Styles
import './styles/App.css';
import './styles/Navbar.css';
import './styles/LoginPage.css';
import './styles/Dashboard.css';

function App() {
  return (
    // <Router> must be the parent of <AuthProvider>
    // This gives AuthProvider access to hooks like useNavigate
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> {/* <-- 2. MAKE SURE THIS ROUTE EXISTS */}

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* These are nested routes inside DashboardLayout */}
              <Route index element={<DashboardHome />} />
              <Route path="crud" element={<CrudPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            
            {/* 404 Not Found Page */}
            <Route path="*" element={<h1 style={{padding: '2rem'}}>404: Page Not Found</h1>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo.png';

const Navbar = ({ onToggleSidebar }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  // Get user's initials for the icon
  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={onToggleSidebar} className="sidebar-toggle">
          ☰
        </button>
        {/* <img src={logo} alt="LogiVerse Logo" className="navbar-logo" /> */}
        <span className="navbar-brand">LogiVerse</span>
      </div>
      <div className="navbar-right">
        <div className="user-menu" onClick={() => setDropdownOpen(!isDropdownOpen)}>
          <div className="user-icon">{getInitials(user?.username)}</div>

          {isDropdownOpen && (
            <div className="user-dropdown">
              <span className="user-dropdown-item" onClick={logout}>
                Logout
              </span>
              <span className="user-dropdown-item">
                Change Password
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
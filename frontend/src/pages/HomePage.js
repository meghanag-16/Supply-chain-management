import { Link } from 'react-router-dom';
// You can add your logo to /src/assets/logo.png
import logo from '../assets/logo.png'; 
import scm from '../assets/scm.jpg';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* 1. Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          {<img src={logo} alt="LogiVerse Logo" className="navbar-logo" /> }
          <span className="navbar-brand">LogiVerse</span>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </nav>

      {/* 2. Full-width Image */}
      <div className="hero-image-container">
        {<img src={scm} alt="LogiVerse image" />}
        <div className="hero-image-placeholder">
          
          <span>Your Full-Screen Width Image Goes Here</span>
        </div>
      </div>

      {/* 3. Tagline and Explanation */}
      <div className="tagline-container page-container">
        <h1>Streamline Your Supply Chain.</h1>
        <p>
          LogiVerse is a comprehensive Supply Chain Management (SCM) tool
          designed to give you full visibility and control over your inventory,
          shipments, and operations.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
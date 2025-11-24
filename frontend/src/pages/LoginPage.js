import { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT LINK
import useAuth from '../hooks/useAuth';
// import logo from '../assets/logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // Navigation happens inside the login function
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* <img src={logo} alt="LogiVerse Logo" className="login-logo" /> */}
        <h1 className="login-title">LogiVerse</h1>

        <form onSubmit={handleSubmit}>
          {error && <p className="login-error">{error}</p>}
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* 2. ADD THIS LINK AT THE BOTTOM */}
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
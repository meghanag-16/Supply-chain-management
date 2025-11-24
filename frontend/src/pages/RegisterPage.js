import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/LoginPage.css'; // Ensures styles are loaded

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    password: '',
    role: 'Supplier', // Default
    // Profile Fields
    name: '',
    phone: '',
    city: '',
    postal_code: '',
    contact_person: '',
    production_capacity: '',
    license_number: '',
    type: 'Retail'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', formData);
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Registration Failed: ' + (error.response?.data?.error || 'Check your inputs and ID uniqueness.'));
    }
  };

  // Helper: Is the selected role Admin?
  const isAdmin = formData.role === 'Admin';

  return (
    <div className="login-container">
      <div className="login-card"> {/* Added wrapper for card styling */}
        <h2 className="login-title">Register New User</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* --- SECTION 1: ACCOUNT DETAILS (Always Visible) --- */}
          <div className="form-group">
            <label>User ID (e.g., 112)</label>
            <input 
              className="form-input" 
              name="user_id" 
              type="number" 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Username</label>
            <input 
              className="form-input" 
              name="username" 
              type="text" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              className="form-input" 
              name="password" 
              type="password" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select className="form-select" name="role" onChange={handleChange} value={formData.role}>
              <option value="Supplier">Supplier</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* --- SECTION 2: PROFILE DETAILS (Hidden for Admin) --- */}
          {!isAdmin && (
            <div className="profile-section fade-in">
              <h4 className="section-divider">Profile Details</h4>
              
              {/* Common Fields for Everyone except Admin */}
              <div className="form-group">
                <label>Full Name / Company Name</label>
                <input 
                  className="form-input" 
                  name="name" 
                  type="text" 
                  onChange={handleChange} 
                  required={!isAdmin} 
                  placeholder={formData.role === 'Customer' ? "Your Name" : "Company Name"}
                />
              </div>

              <div className="form-row"> {/* Side by side inputs */}
                <div className="form-group half-width">
                  <label>Phone Number</label>
                  <input 
                    className="form-input" 
                    name="phone" 
                    type="text" 
                    onChange={handleChange} 
                    required={!isAdmin} 
                  />
                </div>
                <div className="form-group half-width">
                    <label>City</label>
                    <input 
                      className="form-input" 
                      name="city" 
                      type="text" 
                      onChange={handleChange} 
                      required={!isAdmin} 
                    />
                </div>
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input 
                  className="form-input" 
                  name="postal_code" 
                  type="text" 
                  onChange={handleChange} 
                  required={!isAdmin} 
                />
              </div>

              {/* Dynamic Fields Specific to Role */}
              {formData.role === 'Supplier' && (
                <div className="form-group">
                  <label>Contact Person</label>
                  <input className="form-input" name="contact_person" type="text" onChange={handleChange} />
                </div>
              )}

              {formData.role === 'Manufacturer' && (
                <>
                  <div className="form-group">
                    <label>Production Capacity</label>
                    <input className="form-input" name="production_capacity" type="number" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input className="form-input" name="license_number" type="text" onChange={handleChange} />
                  </div>
                </>
              )}

              {formData.role === 'Customer' && (
                <div className="form-group">
                  <label>Customer Type</label>
                  <select className="form-select" name="type" onChange={handleChange}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <button className="login-btn" type="submit">Register</button>
        </form>
        
        <p className="login-footer">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
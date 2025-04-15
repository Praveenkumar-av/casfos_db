/**
 * Overview:
 * This is a React component for a login page used in an asset management system. 
 * It provides a user interface for authentication with role-based access. 
 * The component includes:
 * - A role selection panel with radio buttons for different user roles.
 * - A login form with username, password fields, and password visibility toggle.
 * - API integration using axios for authentication.
 * - Navigation to role-specific dashboards upon successful login.
 * - Error handling and loading states for user feedback.
 * - Styling with CSS classes and Font Awesome icons for a modern look.
 * 
 * The component uses React Router for navigation and state management with useState hooks.
 * It communicates with a backend API at 'http://localhost:3001/api/users/login' for authentication.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaLongArrowAltRight } from 'react-icons/fa';
import '../styles/main1.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/util.css';

// Define role options for selection
const ROLE_OPTIONS = [
  { value: 'headofoffice', label: 'Head of Office' },
  { value: 'principal', label: 'Principal' },
  { value: 'assetmanager', label: 'Asset Manager' },
  { value: 'storekeeper', label: 'Storekeeper' },
  { value: 'facultyentrystaff', label: 'Faculty Entry Staff' },
  { value: 'facultyverifier', label: 'Faculty Verifier' },
  { value: 'viewer', label: 'Viewer' },
];

const Login = () => {
  // State management for form inputs and UI
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles login form submission
   * @param {Event} e - Form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:3001/api/users/login', {
        name,
        password,
        role,
      });

      setLoading(false);

      // Handle successful login
      if (response.data === 'success') {
        // Navigate to the appropriate dashboard based on role
        const dashboardRoutes = {
          headofoffice: '/headofofficedashboard',
          principal: '/principaldashboard',
          assetmanager: '/assetmanagerdashboard',
          storekeeper: '/storekeeperdashboard',
          facultyentrystaff: '/facultyentrystaffdashboard',
          facultyverifier: '/facultyverifierdashboard',
          viewer: '/viewerdashboard',
        };

        const route = dashboardRoutes[role];
        if (route) {
          navigate(`${route}?username=${encodeURIComponent(name)}`);
        } else {
          setMessage('Invalid role');
        }
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      // Handle login errors
      setLoading(false);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100 fade-in">
            {/* Left Panel: Role Selection and Logo */}
            <div className="login-left-panel">
              <div className="login-image-container">
                <img
                  src="public/images/CASFOS-Coimbatore.ico"
                  alt="CASFOS Logo"
                  className="login-image"
                />
              </div>

              <div className="role-selection-container">
                <h3 className="role-selection-title">Select Your Role</h3>
                <form className="role-selection-form">
                  {ROLE_OPTIONS.map((option, index) => (
                    <label key={index} className="role-option">
                      <input
                        type="radio"
                        value={option.value}
                        name="role"
                        checked={role === option.value}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span className="role-label">{option.label}</span>
                    </label>
                  ))}
                </form>
              </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="login-right-panel">
              <h1 className="login-title">Login</h1>
              <form onSubmit={handleLogin} className="login-form">
                {/* Username Input */}
                <div className="input-group">
                  <label htmlFor="username" className="input-label">
                    Username
                  </label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      id="username"
                      type="text"
                      name="name"
                      placeholder="Enter your username"
                      value={name}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    Password
                  </label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                      <FaEyeSlash
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <FaEye
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* Error Message */}
                {message && <p className="error-message">{message}</p>}

                {/* Additional Links */}
                <div className="login-links">
                
                  <Link to="/register" className="register-link">
                    Create your Account
                    <FaLongArrowAltRight />
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
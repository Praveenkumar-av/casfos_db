/**
 * Overview:
 * This is a React component for a registration page used in an asset management system.
 * It provides a user interface for registering new users with role-based access.
 * The component includes:
 * - A role selection panel with radio buttons for individual roles.
 * - A registration form with fields for username, password, date of birth, designation, phone, organization, and ministry.
 * - Password visibility toggle functionality.
 * - API integration using axios to send registration data to the backend.
 * - Error handling for cases like existing usernames or invalid inputs, displayed in red text.
 * - Display of "User submitted for approval" message in green, centered text upon successful registration, styled like the login warning but in green.
 * - Form clearing and delayed navigation to the login page after successful registration.
 * - Styling with CSS classes and Font Awesome icons for a modern look.
 *
 * The component uses React Router for navigation and state management with useState hooks.
 * It communicates with a backend API at 'http://localhost:3001/api/users/register' for registration.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCalendar, FaBriefcase, FaPhone, FaBuilding, FaUniversity, FaLongArrowAltRight } from 'react-icons/fa';
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

const Register = () => {
  // State management for form inputs and UI
  const [name, setUsername] = useState(''); // Stores username input
  const [password, setPassword] = useState(''); // Stores password input
  const [dob, setDob] = useState(''); // Stores date of birth input
  const [designation, setDesignation] = useState(''); // Stores designation input
  const [phone, setPhone] = useState(''); // Stores phone number input
  const [organization, setOrganization] = useState(''); // Stores organization input
  const [ministry, setMinistry] = useState(''); // Stores ministry input
  const [role, setRole] = useState('headofoffice'); // Stores selected role
  const [loading, setLoading] = useState(false); // Loading state for registration process
  const [message, setMessage] = useState(''); // Stores error/success messages
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const navigate = useNavigate(); // Navigation hook from react-router

  /**
   * Toggles password visibility between text and password types
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Handles registration form submission
   * @param {Event} e - Form submission event
   */
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true); // Set loading state
    setMessage(''); // Clear any previous messages

    try {
      // Send registration request to the backend
      const response = await axios.post('http://localhost:3001/api/users/register', {
        name,
        password,
        dob,
        designation,
        phone,
        organization,
        ministry,
        role,
      });

      setLoading(false); // Reset loading state

      // Handle successful registration
      if (response.data.message === 'User registered successfully!') {
        setMessage('User submitted for approval'); // Display approval message
        // Clear form fields
        setUsername('');
        setPassword('');
        setDob('');
        setDesignation('');
        setPhone('');
        setOrganization('');
        setMinistry('');
        setRole('headofoffice');
        // Navigate to login page after 3 seconds
        setTimeout(() => {
          setMessage(''); // Clear message before navigation
          navigate('/');
        }, 3000);
      } else {
        setMessage(response.data.message); // Display server response message
      }
    } catch (error) {
      // Handle registration errors
      setLoading(false);
      const errorMessage = error.response?.data?.message;
      setMessage(errorMessage || 'Something went wrong'); // Show specific error like 'Username already exists'
    }
  };

  return (
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          {/* Main registration wrapper with fade-in animation */}
          <div className="wrap-login100 fade-in">
            {/* Left Panel: Role Selection and Logo */}
            <div className="login-left-panel" style={{ justifyContent: 'flex-start' }}>
              {/* Logo container */}
              <div className="login-image-container">
                <img
                  src="public/images/CASFOS-Coimbatore.ico"
                  alt="CASFOS Logo"
                  className="login-image"
                />
              </div>

              {/* Role selection container */}
              <div className="role-selection-container">
                <h3 className="role-selection-title">Select Your Role</h3>
                <form className="role-selection-form">
                  {/* Map through role options to create radio buttons */}
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

            {/* Right Panel: Registration Form */}
            <div className="login-right-panel">
              {/* Registration form title */}
              <h1 className="login-title">Register</h1>
              {/* Registration form */}
              <form onSubmit={handleRegister} className="login-form">
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

                {/* Date of Birth Input */}
                <div className="input-group">
                  <label htmlFor="dob" className="input-label">
                    Date of Birth
                  </label>
                  <div className="input-wrapper">
                    <FaCalendar className="input-icon" />
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Designation Input */}
                <div className="input-group">
                  <label htmlFor="designation" className="input-label">
                    Designation
                  </label>
                  <div className="input-wrapper">
                    <FaBriefcase className="input-icon" />
                    <input
                      id="designation"
                      type="text"
                      name="designation"
                      placeholder="Enter your designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="input-group">
                  <label htmlFor="phone" className="input-label">
                    Phone No
                  </label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Organization Input */}
                <div className="input-group">
                  <label htmlFor="organization" className="input-label">
                    Organization
                  </label>
                  <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <input
                      id="organization"
                      type="text"
                      name="organization"
                      placeholder="Enter your organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Ministry Input */}
                <div className="input-group">
                  <label htmlFor="ministry" className="input-label">
                    Ministry
                  </label>
                  <div className="input-wrapper">
                    <FaUniversity className="input-icon" />
                    <input
                      id="ministry"
                      type="text"
                      name="ministry"
                      placeholder="Enter your ministry"
                      value={ministry}
                      onChange={(e) => setMinistry(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input with visibility toggle */}
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
                    {/* Toggle password visibility icon */}
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
                  {loading ? 'Registering...' : 'Register'}
                </button>

                {/* Display error/success messages */}
                {message && (
                  <p className={message === 'User submitted for approval' ? 'success-message' : 'error-message'}>
                    {message}
                  </p>
                )}

                {/* Additional Links */}
                <div className="login-links">
                  <Link to="/login" className="register-link">
                    Already have an account? Login
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

export default Register;
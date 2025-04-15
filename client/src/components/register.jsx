/**
 * Overview:
 * This is a React component for a registration page in an asset management system.
 * It allows users to create accounts with detailed personal and organizational information,
 * supporting role-based access with conditional sub-roles for specific roles.
 * The component includes:
 * - A role selection panel with radio buttons for main roles and sub-roles (e.g., Asset Manager/Storekeeper).
 * - A registration form for collecting user details (username, password, DOB, designation, phone, organization, ministry).
 * - API integration using axios to send registration data to a backend server.
 * - Navigation to the login page upon successful registration.
 * - Error handling and loading states for user feedback.
 * - Styling with CSS classes and Font Awesome icons for a modern UI.
 * 
 * The component uses React Router for navigation and state management with useState hooks.
 * It communicates with a backend API at 'http://localhost:3001/api/users/register' for user registration.
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/main1.css';
import '../styles/util.css';
import '../styles/font-awesome.min.css';

// Define role options for selection
const ROLE_OPTIONS = [
  { value: 'headofoffice', label: 'Head of Office' },
  { value: 'principal', label: 'Principal' },
  { value: 'assetmanagerentry', label: 'Asset Manager/Storekeeper' },
  { value: 'facultyentrysuper', label: 'Faculty Entry Staff/Verifier' },
  { value: 'viewer', label: 'Viewer' },
];

// Define sub-role options for specific roles
const SUB_ROLE_OPTIONS = {
  assetmanagerentry: [
    { value: 'assetmanager', label: 'Asset Manager' },
    { value: 'storekeeper', label: 'Storekeeper' },
  ],
  facultyentrysuper: [
    { value: 'facultyentrystaff', label: 'Faculty Entry Staff' },
    { value: 'facultyverifier', label: 'Faculty Verifier' },
  ],
};

const Register = () => {
  // State management for form inputs and UI
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [ministry, setMinistry] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [subRole, setSubRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  /**
   * Handles role selection and resets sub-role
   * @param {string} selectedRole - The selected role value
   */
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setSubRole(''); // Reset subRole when main role changes
  };

  /**
   * Handles registration form submission
   * @param {Event} e - Form submission event
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Determine the actual role to send to the backend
    let actualRole = role;
    if (role === 'assetmanagerentry') {
      actualRole = subRole || 'assetmanager'; // Default to assetmanager if no subRole
    } else if (role === 'facultyentrysuper') {
      actualRole = subRole || 'facultyentrystaff'; // Default to facultyentrystaff if no subRole
    }

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
        role: actualRole,
      });

      setLoading(false);

      // Handle successful registration
      if (response.data.message === 'User registered successfully!') {
        navigate('/');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      // Handle registration errors
      setLoading(false);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          {/* Left Panel: Role Selection and Logo */}
          <div className="login100-pic js-tilt">
            <img src="images/CASFOS-Coimbatore.jpg" alt="CASFOS Logo" />
            <div className="role-selection-container">
              <form>
                {ROLE_OPTIONS.map((option, index) => (
                  <label key={index} className="particles-checkbox-container">
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value={option.value}
                      name="role"
                      checked={role === option.value}
                      onChange={() => handleRoleChange(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </form>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="login100-form validate-form">
            <p className="login100-form-title">Register</p>
            <form onSubmit={handleRegister}>
              {/* Username Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={name}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-user" aria-hidden="true" />
                </span>
              </div>

              {/* Date of Birth Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="date"
                  name="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-calendar" aria-hidden="true" />
                </span>
              </div>

              {/* Designation Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="text"
                  name="designation"
                  placeholder="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-briefcase" aria-hidden="true" />
                </span>
              </div>

              {/* Phone Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-phone" aria-hidden="true" />
                </span>
              </div>

              {/* Organization Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-building" aria-hidden="true" />
                </span>
              </div>

              {/* Ministry Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="text"
                  name="ministry"
                  placeholder="Ministry"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-university" aria-hidden="true" />
                </span>
              </div>

              {/* Password Input */}
              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="focus-input100" />
                <span className="symbol-input100">
                  <i className="fa fa-lock" aria-hidden="true" />
                </span>
              </div>

              {/* Conditional Sub-Role Selection */}
              {(role === 'assetmanagerentry' || role === 'facultyentrysuper') && (
                <div className="sub-role-container">
                  <p className="sub-role-title">Select Role:</p>
                  {SUB_ROLE_OPTIONS[role].map((subOption, index) => (
                    <label
                      key={index}
                      className="particles-checkbox-container"
                      style={{ marginLeft: index > 0 ? '20px' : '0' }}
                    >
                      <input
                        type="radio"
                        className="particles-checkbox"
                        value={subOption.value}
                        name="subRole"
                        checked={subRole === subOption.value}
                        onChange={(e) => setSubRole(e.target.value)}
                      />
                      <span>{subOption.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <div className="container-login100-form-btn">
                <button
                  className="login100-form-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>

              {/* Error Message */}
              {message && <p className="error-message">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
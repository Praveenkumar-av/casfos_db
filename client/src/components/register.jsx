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
  const [showPassword, setShowPassword] = useState(false);
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
   * Toggles password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100 fade-in">
            {/* Left Panel: Role Selection and Logo */}
            <div className="login-left-panel" style={{ justifyContent: 'flex-start' }}>
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
                        onChange={() => handleRoleChange(option.value)}
                      />
                      <span className="role-label">{option.label}</span>
                    </label>
                  ))}
                </form>
              </div>
            </div>

            {/* Right Panel: Registration Form */}
            <div className="login-right-panel">
              <h1 className="login-title">Register</h1>
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

                {/* Conditional Sub-Role Selection */}
                {(role === 'assetmanagerentry' || role === 'facultyentrysuper') && (
                  <div className="input-group">
                    <label className="input-label">Select Sub-Role</label>
                    <div className="role-selection-form">
                      {SUB_ROLE_OPTIONS[role].map((subOption, index) => (
                        <label key={index} className="role-option">
                          <input
                            type="radio"
                            value={subOption.value}
                            name="subRole"
                            checked={subRole === subOption.value}
                            onChange={(e) => setSubRole(e.target.value)}
                          />
                          <span className="role-label">{subOption.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>

                {/* Error Message */}
                {message && <p className="error-message">{message}</p>}

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
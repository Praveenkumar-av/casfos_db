import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import '../styles/main1.css';
import '../fonts/font-awesome-4.7.0/css/font-awesome.min.css';
import '../styles/util.css'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaLongArrowAltRight } from 'react-icons/fa';
const Login = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/users/login', {
        name,
        password,
        role,
      });

      setLoading(false);

      if (response.data === "success") {
        switch (role) {
          case 'headofoffice':
            navigate(`/headofofficedashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'principal':
            navigate(`/principaldashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'assetmanager':
            navigate(`/assetmanagerdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'storekeeper':
            navigate(`/storekeeperdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'facultyentrystaff':
            navigate(`/facultyentrystaffdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'facultyverifier':
            navigate(`/facultyverifierdashboard?username=${encodeURIComponent(name)}`);
            break;
          case 'viewer':
            navigate(`/viewerdashboard?username=${encodeURIComponent(name)}`);
            break;
          default:
            setMessage('Invalid role');
        }
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100 fade-in">
            {/* Left Panel */}
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
                  {[
                    {value: 'headofoffice', label: 'Head of Office'},
                    {value: 'principal', label: 'Principal'},
                    {value: 'assetmanager', label: 'Asset Manager'},
                    {value: 'storekeeper', label: 'Storekeeper'},
                    {value: 'facultyentrystaff', label: 'Faculty Entry Staff'},
                    {value: 'facultyverifier', label: 'Faculty Verifier'},
                    {value: 'viewer', label: 'Viewer'}
                  ].map((option, index) => (
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

            {/* Right Panel */}
            <div className="login-right-panel">
              <h1 className="login-title">Login</h1>
              <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                  <label htmlFor="username" className="input-label">Username</label>
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

                <div className="input-group">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                      <FaEyeSlash 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <FaEye 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </div>

                <button className="login-button" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {message && <p className="error-message">{message}</p>}

                <div className="login-links">
                  <a href="#" className="forgot-link">Forgot Username / Password?</a>
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
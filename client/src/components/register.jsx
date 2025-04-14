import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import '../styles/main1.css';
import '../styles/util.css';
import '../styles/font-awesome.min.css';

const Register = () => {
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [ministry, setMinistry] = useState('');
  const [role, setRole] = useState('headofoffice');
  const [subRole, setSubRole] = useState(''); // New state for sub-role
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Determine the actual role to send to the backend
    let actualRole = role;
    if (role === 'assetmanagerentry') {
      actualRole = subRole || 'assetmanager'; // Default to assetmanager if no subRole selected
    } else if (role === 'facultyentrysuper') {
      actualRole = subRole || 'facultyentrystaff'; // Default to facultyentrystaff if no subRole selected
    }

    try {
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

      if (response.data.message === "User registered successfully!") {
        navigate('/');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <div className="login100-pic js-tilt">
            <img src="images/CASFOS-Coimbatore.jpg" alt="IMG" /><br /><br />
            <div>
              <form>
                {['Head of Office', 'Principal', 'Asset Manager/Storekeeper', 'Faculty Entry Staff/Verifier', 'Viewer'].map((label, index) => (
                  <label key={index} className="particles-checkbox-container">
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value={['headofoffice', 'principal', 'assetmanagerentry', 'facultyentrysuper', 'viewer'][index]}
                      name="role"
                      checked={role === ['headofoffice', 'principal', 'assetmanagerentry', 'facultyentrysuper', 'viewer'][index]}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setSubRole(''); // Reset subRole when main role changes
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </form>
            </div>
          </div>

          <div className="login100-form validate-form">
            <p className="login100-form-title">Register</p>
            <form onSubmit={handleRegister}>
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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-user" aria-hidden="true"></i></span>
              </div>

              <div className="wrap-input100 validate-input">
                <input
                  className="input100"
                  type="date"
                  name="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-calendar" aria-hidden="true"></i></span>
              </div>

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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-briefcase" aria-hidden="true"></i></span>
              </div>

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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-phone" aria-hidden="true"></i></span>
              </div>

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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-building" aria-hidden="true"></i></span>
              </div>

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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-university" aria-hidden="true"></i></span>
              </div>

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
                <span className="focus-input100"></span>
                <span className="symbol-input100"><i className="fa fa-lock" aria-hidden="true"></i></span>
              </div>

              {/* Conditional Sub-Role Radio Buttons */}
              {role === 'assetmanagerentry' && (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '5px' }}>Select Role:</p>
                  <label className="particles-checkbox-container">
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value="assetmanager"
                      name="subRole"
                      checked={subRole === 'assetmanager'}
                      onChange={(e) => setSubRole(e.target.value)}
                    />
                    <span>Asset Manager</span>
                  </label>
                  <label className="particles-checkbox-container" style={{ marginLeft: '20px' }}>
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value="storekeeper"
                      name="subRole"
                      checked={subRole === 'storekeeper'}
                      onChange={(e) => setSubRole(e.target.value)}
                    />
                    <span>Storekeeper</span>
                  </label>
                </div>
              )}

              {role === 'facultyentrysuper' && (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '5px' }}>Select Role:</p>
                  <label className="particles-checkbox-container">
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value="facultyentrystaff"
                      name="subRole"
                      checked={subRole === 'facultyentrystaff'}
                      onChange={(e) => setSubRole(e.target.value)}
                    />
                    <span>Faculty Entry Staff</span>
                  </label>
                  <label className="particles-checkbox-container" style={{ marginLeft: '20px' }}>
                    <input
                      type="radio"
                      className="particles-checkbox"
                      value="facultyverifier"
                      name="subRole"
                      checked={subRole === 'facultyverifier'}
                      onChange={(e) => setSubRole(e.target.value)}
                    />
                    <span>Faculty Verifier</span>
                  </label>
                </div>
              )}

              <div className="container-login100-form-btn">
                <button className="login100-form-btn" type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>

            {message && (
              <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
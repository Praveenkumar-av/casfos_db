import React, { useEffect, useState } from "react";
import "../styles/style.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/viewFaculty.css";

const FacultyUpdation = () => {
  const [facultyType, setFacultyType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [yearOfAllotment, setYearOfAllotment] = useState("");
  const [status, setStatus] = useState("");
  const [modulesHandled, setModulesHandled] = useState("");
  const [majorDomains, setMajorDomains] = useState([]);
  const [minorDomains, setMinorDomains] = useState([]);
  const [areasOfExpertise, setAreasOfExpertise] = useState("");
  const [institution, setInstitution] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableData, setTableData] = useState([]);
  const [totalFaculties, setTotalFaculties] = useState(0);
  const [message, setMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // Faculty ID for confirmation
  const [deleteStatus, setDeleteStatus] = useState({}); // Track deletion status per faculty

  const domainOptions = {
    "Forest & Wildlife": [
      "Silviculture",
      "Mensuration and Biometry",
      "Non – Timber Forest Products and Medicinal plants",
      "Tree Harvesting, Wood Science and Technology",
      "Forest Survey & Engineering",
      "Forest Health and Disaster Management",
      "Forest-People Interface",
      "Forest Policy and Law",
      "Forest Resource Management",
      "Wildlife Conservation & Management",
      "Land Resources and Conservation",
      "Economics of Forests and Natural Resources",
      "Environmental Laws & Management",
      "Applied Ecology and Biodiversity Conservation",
      "Forest Administration and Accounts",
      "General Biology/ Forest Botany & Taxonomy",
      "Forest Statistics/Mathematics",
      "Computer Application, Remote Sensing and GIS in Forestry",
      "Urban Forestry/Recreation Forestry & Land Scaping",
    ],
    Environment: [
      "Environmental Laws & Management",
      "Climate Change: Adaptation & Mitigation",
      "Wasteland Management",
      "Environmental Economics & Accounting",
      "Coastal Regulation Zone",
      "Environmental Impact Assessment & Auditing",
      "Ecosystem Services Valuation",
      "Sustainable Development Goals",
      "Green Energy",
      "Ecosystem Health",
      "Others",
    ],
    "Disaster Management": [
      "Forest Fire Management & Damage assessment",
      "Cyclone",
      "Flood",
      "Desertification",
      "Others",
    ],
    "Human Resource Development": [
      "Time Management",
      "Leadership Management",
      "Effective Leadership and Conflict Resolution",
      "Communication Skills and Management",
      "Crowd Management",
      "Delegation and Interdepartmental Coordination",
      "Emotional Intelligence",
      "Gender Sensitization",
      "Building competencies for personal Excellence",
      "Others",
    ],
    "Health and Fitness": [
      "First Aid",
      "Counselling",
      "Physical, mental and Social Health",
      "Stress Management",
      "Yoga and Meditation",
      "Others",
    ],
    "Ethics and Public Governance": [
      "Public administration, Public Grievance and Public Finance",
      "Decision Making",
      "Ethics in Governance",
      "Anti-corruption Measures",
      "Conflict Management",
      "Transparency in working",
      "Accountability",
      "Public Relations, Crisis control",
      "E-governance",
      "Project Implementation and Management",
      "Others",
    ],
    "Jurisprudence (Acts and Rules)": [
      "The Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      "Bharatiya Nyaya Sanhita (BNS)",
      "Bharatiya Sakshya Adhiniyam (BSA)",
      "POSH Act, 2013",
      "Right to Information (RTI) Act, 2005",
      "Cyber Security Laws",
      "Others",
    ],
    "CCS Rules and Regulation": [
      "Service Rules and matters",
      "Conduct Rules",
      "Disciplinary Proceedings",
      "Others",
    ],
    "Media Management": [
      "The Art of Interacting with Print and Electronic Media",
      "Role of Media",
      "Media Relations and Image Management",
      "Proactive Media Engagement",
      "Social Media Management",
      "Others",
    ],
  };

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const handleUpdateDetails = async (facultyId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/faculty/search/${facultyId}`);
      const facultyData = response.data.data;
      navigate(`/updatefacultyentryhoo?username=${encodeURIComponent(username)}`, {
        state: { facultyData, isUpdate: true },
      });
    } catch (error) {
      console.error("Error fetching faculty details:", error);
    }
  };

  const handleDeleteFaculty = (facultyId) => {
    setDeleteConfirmation(facultyId); // Show confirmation popup
  };

  const confirmDelete = async (facultyId) => {
    setDeleteConfirmation(null); // Close confirmation popup
    setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Deleting..." }));

    try {
      const response = await axios.delete(`http://localhost:3001/api/faculty/delete/${facultyId}`);
      if (response.data.success) {
        setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Deleted" }));
        setTableData((prevData) => prevData.filter((faculty) => faculty._id !== facultyId));
        setTotalFaculties((prev) => prev - 1);
        setTimeout(() => {
          setDeleteStatus((prev) => ({ ...prev, [facultyId]: "" }));
        }, 2000); // Clear status after 2 seconds
      } else {
        setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Failed to Delete" }));
      }
    } catch (error) {
      setDeleteStatus((prev) => ({ ...prev, [facultyId]: "Failed to Delete" }));
      console.error("Error deleting faculty:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null); // Close confirmation popup
  };

  const handleApplyFilter = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/faculty/filterFaculties", {
        facultyType,
        name,
        email,
        yearOfAllotment,
        status,
        modulesHandled: modulesHandled ? [modulesHandled] : undefined,
        majorDomains: majorDomains.length > 0 ? majorDomains : undefined,
        minorDomains: minorDomains.length > 0 ? minorDomains : undefined,
        areasOfExpertise,
        institution,
        mobileNumber,
      });

      setTableData(response.data);
      setTotalFaculties(response.data.length);
      setMessage(response.data.length > 0 ? "" : "No matching records found.");
    } catch (error) {
      setTableData([]);
      setTotalFaculties(0);
      setMessage("No matching records.");
      console.error("Error fetching filtered faculty:", error);
    }
  };

  useEffect(() => {
    handleApplyFilter(); // Fetch all faculties initially
  }, []);

  useEffect(() => {
    handleApplyFilter();
  }, [
    facultyType,
    name,
    email,
    yearOfAllotment,
    status,
    modulesHandled,
    majorDomains,
    minorDomains,
    areasOfExpertise,
    institution,
    mobileNumber,
  ]);

  const renderPopupContent = (data) => {
    const renderValue = (value, key) => {
      if (key === "photograph" && typeof value === "string") {
        const imageUrl = `http://localhost:3001/uploads/${value.split("\\").pop()}`;
        return (
          <img
            src={imageUrl}
            alt="Photograph"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        );
      }
      if (Array.isArray(value)) {
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, key)}</li>
            ))}
          </ul>
        );
      }
      if (typeof value === "object" && value !== null) {
        return (
          <ul>
            {Object.entries(value)
              .filter(([key]) => key !== "_id")
              .map(([key, val]) => (
                <li key={key}>
                  <strong>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                  </strong>{" "}
                  {renderValue(val, key)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };

    return Object.entries(data)
      .filter(([key]) => key !== "_id")
      .map(([key, value]) => (
        <tr key={key}>
          <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
          </td>
          <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value, key)}</td>
        </tr>
      ));
  };

  const handleClearFilter = () => {
    setFacultyType("");
    setName("");
    setEmail("");
    setYearOfAllotment("");
    setStatus("");
    setModulesHandled("");
    setMajorDomains([]);
    setMinorDomains([]);
    setAreasOfExpertise("");
    setInstitution("");
    setMobileNumber("");
    handleApplyFilter();
  };

  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  const closePopup = () => {
    setSelectedFaculty(null);
  };

  const filterStyles = {
    filterContainer: {
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      marginBottom: "20px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    filterItem: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      marginBottom: "5px",
      fontWeight: "500",
      color: "#333",
    },
    input: {
      padding: "8px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    inputFocus: {
      borderColor: "#007BFF",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    clearButton: {
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    clearButtonHover: {
      backgroundColor: "#5a6268",
    },
  };

  const viewButtonStyles = {
    viewButton: {
      padding: "6px 12px",
      backgroundColor: "#007BFF",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    viewButtonHover: {
      backgroundColor: "#0056b3",
    },
  };

  const deleteButtonStyles = {
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#ff4444",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
    },
    deleteButtonHover: {
      backgroundColor: "#cc0000",
    },
    deleteButtonDisabled: {
      backgroundColor: "#6c757d",
      cursor: "not-allowed",
    },
  };

  const popupStyles = {
    popup: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    popupContent: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "600px",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
      animation: "slideIn 0.3s ease-out",
    },
    popupHeader: {
      marginBottom: "15px",
      color: "#333",
    },
    closeButton: {
      marginTop: "15px",
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  const confirmationStyles = {
    confirmationPopup: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1001,
    },
    confirmationContent: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      textAlign: "center",
      width: "90%",
      maxWidth: "400px",
      animation: "fadeIn 0.3s ease-out",
    },
    confirmationText: {
      marginBottom: "20px",
      fontSize: "16px",
      color: "#333",
    },
    confirmationButtons: {
      display: "flex",
      justifyContent: "space-around",
    },
    yesButton: {
      padding: "8px 16px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    yesButtonHover: {
      backgroundColor: "#218838",
    },
    cancelButton: {
      padding: "8px 16px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    cancelButtonHover: {
      backgroundColor: "#c82333",
    },
  };

  const styles = {
    usernameContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "#555",
    },
    userIcon: {
      fontSize: "30px",
      color: "#007BFF",
    },
    username: {
      fontWeight: "bold",
      fontSize: "18px",
    },
    totalFaculties: {
      position: "absolute",
      top: "10px",
      right: "20px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
      backgroundColor: "#f1f1f1",
      padding: "5px 10px",
      borderRadius: "4px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    loadingIcon: { fontSize: "14px", color: "#007BFF" },
    successIcon: { fontSize: "14px", color: "#28a745" },
    errorIcon: { fontSize: "14px", color: "#dc3545" },
  };

  return (
    <div className="faculty-view">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">User Approval</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-package" />
              <span className="text">Faculty Approval</span>
            </a>
          </li>
          <li className="active">
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-reply" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
          <li>
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty View</span>
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="/" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="content">
        <nav>
          <i className="bx bx-menu" />
          <span className="head-title">Dashboard</span>
          <form action="#">
            <div className="form-input"></div>
          </form>
          <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span>
          </div>
        </nav>
        <main style={{ position: "relative" }}>
          <div style={styles.totalFaculties}>Total No of Faculties: {totalFaculties}</div>
          <div className="dash-content">
            <div className="title">
              <span className="text">EXISTING FACULTY UPDATION</span>
            </div>
            <div style={filterStyles.filterContainer}>
              <div style={filterStyles.filterGrid}>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="facultyType">
                    Faculty Type:
                  </label>
                  <select
                    id="facultyType"
                    value={facultyType}
                    onChange={(e) => setFacultyType(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  >
                    <option value="">Select</option>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="name">
                    Name:
                  </label>
                  <input
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="email">
                    Email:
                  </label>
                  <input
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="yearOfAllotment">
                    Year of Allotment:
                  </label>
                  <input
                    id="yearOfAllotment"
                    placeholder="YYYY"
                    value={yearOfAllotment}
                    onChange={(e) => setYearOfAllotment(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="status">
                    Status:
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  >
                    <option value="">Select</option>
                    <option value="serving">Serving</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="modulesHandled">
                    Modules Handled:
                  </label>
                  <input
                    id="modulesHandled"
                    placeholder="Module Name"
                    value={modulesHandled}
                    onChange={(e) => setModulesHandled(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="majorDomains">
                    Major Domains:
                  </label>
                  <select
                    id="majorDomains"
                    value={majorDomains[0] || ""}
                    onChange={(e) => setMajorDomains([e.target.value])}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  >
                    <option value="">Select Major Domain</option>
                    {Object.keys(domainOptions).map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="minorDomains">
                    Minor Domains:
                  </label>
                  <select
                    id="minorDomains"
                    value={minorDomains[0] || ""}
                    onChange={(e) => setMinorDomains([e.target.value])}
                    disabled={!majorDomains[0]}
                    style={{
                      ...filterStyles.input,
                      opacity: !majorDomains[0] ? 0.7 : 1,
                      cursor: !majorDomains[0] ? "not-allowed" : "pointer",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  >
                    <option value="">Select Minor Domain</option>
                    {majorDomains[0] &&
                      domainOptions[majorDomains[0]]?.map((subDomain) => (
                        <option key={subDomain} value={subDomain}>
                          {subDomain}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="areasOfExpertise">
                    Areas of Expertise:
                  </label>
                  <input
                    id="areasOfExpertise"
                    placeholder="Areas of Expertise"
                    value={areasOfExpertise}
                    onChange={(e) => setAreasOfExpertise(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="institution">
                    Institution:
                  </label>
                  <input
                    id="institution"
                    placeholder="Institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
                <div style={filterStyles.filterItem}>
                  <label style={filterStyles.label} htmlFor="mobileNumber">
                    Mobile Number:
                  </label>
                  <input
                    id="mobileNumber"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    style={filterStyles.input}
                    onFocus={(e) =>
                      (e.target.style.borderColor = filterStyles.inputFocus.borderColor)
                    }
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>
              </div>
              <div style={filterStyles.buttonContainer}>
                <button
                  style={filterStyles.clearButton}
                  onClick={handleClearFilter}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = filterStyles.clearButtonHover.backgroundColor)
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = filterStyles.clearButton.backgroundColor)
                  }
                >
                  Clear Filter
                </button>
              </div>
            </div>

            {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}
            {tableData.length > 0 && (
              <table className="faculty-table" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Photograph</th>
                    <th>Faculty Type</th>
                    <th>Mobile Number</th>
                    <th>Email</th>
                    <th>Year of Allotment</th>
                    <th>View</th>
                    <th>Update</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.name}</td>
                      <td>
                        {row.photograph ? (
                          <img
                            src={`http://localhost:3001/uploads/${row.photograph.split("\\").pop()}`}
                            alt="Photograph"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "5px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>{row.facultyType}</td>
                      <td>{row.mobileNumber}</td>
                      <td>{row.email}</td>
                      <td>{row.yearOfAllotment}</td>
                      <td>
                        <button
                          style={viewButtonStyles.viewButton}
                          onClick={() => handleViewDetails(row)}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor =
                              viewButtonStyles.viewButtonHover.backgroundColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)
                          }
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <button
                          style={viewButtonStyles.viewButton}
                          onClick={() => handleUpdateDetails(row._id)}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor =
                              viewButtonStyles.viewButtonHover.backgroundColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = viewButtonStyles.viewButton.backgroundColor)
                          }
                        >
                          Update
                        </button>
                      </td>
                      <td>
                        <button
                          style={{
                            ...deleteButtonStyles.deleteButton,
                            ...(deleteStatus[row._id] === "Deleting..."
                              ? deleteButtonStyles.deleteButtonDisabled
                              : {}),
                          }}
                          onClick={() => handleDeleteFaculty(row._id)}
                          onMouseOver={(e) =>
                            deleteStatus[row._id] !== "Deleting..." &&
                            (e.target.style.backgroundColor =
                              deleteButtonStyles.deleteButtonHover.backgroundColor)
                          }
                          onMouseOut={(e) =>
                            deleteStatus[row._id] !== "Deleting..." &&
                            (e.target.style.backgroundColor =
                              deleteButtonStyles.deleteButton.backgroundColor)
                          }
                          disabled={deleteStatus[row._id] === "Deleting..."}
                        >
                          {deleteStatus[row._id] === "Deleting..." && (
                            <>
                              <i
                                className="bx bx-loader-circle bx-spin"
                                style={styles.loadingIcon}
                              ></i>
                              Deleting...
                            </>
                          )}
                          {deleteStatus[row._id] === "Deleted" && (
                            <>
                              <i className="bx bx-check-circle" style={styles.successIcon}></i>
                              Deleted
                            </>
                          )}
                          {deleteStatus[row._id] === "Failed to Delete" && (
                            <>
                              <i className="bx bx-error-circle" style={styles.errorIcon}></i>
                              Failed
                            </>
                          )}
                          {!deleteStatus[row._id] && "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </section>
      {selectedFaculty && (
        <div style={popupStyles.popup}>
          <div style={popupStyles.popupContent}>
            <h3 style={popupStyles.popupHeader}>Faculty Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>{renderPopupContent(selectedFaculty)}</tbody>
            </table>
            <button
              style={popupStyles.closeButton}
              onClick={closePopup}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {deleteConfirmation && (
        <div style={confirmationStyles.confirmationPopup}>
          <div style={confirmationStyles.confirmationContent}>
            <p style={confirmationStyles.confirmationText}>
              Are you sure you want to delete this faculty?
            </p>
            <div style={confirmationStyles.confirmationButtons}>
              <button
                style={confirmationStyles.yesButton}
                onClick={() => confirmDelete(deleteConfirmation)}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = confirmationStyles.yesButtonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = confirmationStyles.yesButton.backgroundColor)
                }
              >
                Yes
              </button>
              <button
                style={confirmationStyles.cancelButton}
                onClick={cancelDelete}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor =
                    confirmationStyles.cancelButtonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = confirmationStyles.cancelButton.backgroundColor)
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyUpdation;
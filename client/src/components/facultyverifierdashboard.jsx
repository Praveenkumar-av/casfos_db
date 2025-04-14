import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet"; // For managing document head
import "../styles/style.css"; // General styles
import axios from "axios"; // HTTP client for API requests
import { useLocation } from "react-router-dom"; // For accessing URL query parameters
import { Bar, Line } from "react-chartjs-2"; // Chart components
import Chart from "chart.js/auto"; // Chart.js core (auto-registered)

// facultyverifierDashboard component: Displays dashboard analytics and notifications for facultyverifier
const facultyverifierDashboard = () => {
  // Notification-related states
  const [notifications, setNotifications] = useState([]); // List of pending notifications
  const [expandedNotification, setExpandedNotification] = useState(null); // ID of expanded notification
  const [selectedFaculty, setSelectedFaculty] = useState(null); // Faculty selected for detailed view
  const [acknowledgeStatus, setAcknowledgeStatus] = useState({}); // Acknowledge status per notification

  // Dashboard analytics states
  const [assetData, setAssetData] = useState([]); // Monthly asset data
  const [internalData, setInternalData] = useState([]); // Internal faculty data
  const [externalData, setExternalData] = useState([]); // External faculty data
  const [selectedYear, setSelectedYear] = useState("All"); // Selected year for asset filters
  const [selectedFacultyYear, setSelectedFacultyYear] = useState("All"); // Selected year for faculty chart
  const [sessionData, setSessionData] = useState([]); // Session count data
  const [selectedSessionYear, setSelectedSessionYear] = useState("All"); // Selected year for session chart
  const [sessionLabels, setSessionLabels] = useState([]); // Labels for session chart
  const [selectedLocation, setSelectedLocation] = useState("All"); // Selected location for asset filters
  const [facultyLabels, setFacultyLabels] = useState([]); // Labels for faculty chart
  const [labels, setLabels] = useState([]); // Labels for asset chart
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 }); // User role counts

  // Asset chart-specific states
  const [permanentLabels, setPermanentLabels] = useState([]); // Labels for permanent assets chart
  const [permanentChartData, setPermanentChartData] = useState([]); // Data for permanent assets chart
  const [permanentCategories, setPermanentCategories] = useState([]); // Categories for permanent assets
  const [consumableLabels, setConsumableLabels] = useState([]); // Labels for consumable assets chart
  const [consumableChartData, setConsumableChartData] = useState([]); // Data for consumable assets chart
  const [consumableCategories, setConsumableCategories] = useState([]); // Categories for consumable assets
  const [issuedPermanentLabels, setIssuedPermanentLabels] = useState([]); // Labels for issued permanent assets chart
  const [issuedPermanentChartData, setIssuedPermanentChartData] = useState([]); // Data for issued permanent assets chart
  const [issuedPermanentCategories, setIssuedPermanentCategories] = useState([]); // Categories for issued permanent assets
  const [issuedConsumableLabels, setIssuedConsumableLabels] = useState([]); // Labels for issued consumable assets chart
  const [issuedConsumableChartData, setIssuedConsumableChartData] = useState([]); // Data for issued consumable assets chart
  const [issuedConsumableCategories, setIssuedConsumableCategories] = useState([]); // Categories for issued consumable assets

  // Location hook to get username from URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // Fetch notifications pending for facultyverifier (notifyprincipal: true, notifyhoo: true, notifysi: false)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/faculty/notify-si-pending");
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.notificationDate) - new Date(a.notificationDate)) // Sort by date descending
          .slice(0, 10); // Limit to 10 most recent
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notify SI pending notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch session data based on selected year
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const url = `http://localhost:3001/api/faculty/sessions?year=${selectedSessionYear}`;
        const sessionRes = await axios.get(url);
        setSessionData(sessionRes.data.sessionCounts);
        const labels =
          selectedSessionYear === "All"
            ? [...Array(11)].map((_, i) => (2025 + i).toString()) // Years from 2025 to 2035
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setSessionLabels(labels);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };
    fetchSessionData();
  }, [selectedSessionYear]);

  // Fetch user counts and monthly asset data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const userRes = await axios.get("http://localhost:3001/api/users/count");
        setUserCounts(userRes.data.data);
        const assetRes = await axios.get("http://localhost:3001/api/assets/monthly");
        setLabels(assetRes.data.labels);
        setAssetData(assetRes.data.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };
    fetchAnalyticsData();
  }, []);

  // Fetch faculty data based on selected year
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const url = `http://localhost:3001/api/faculty/monthly?year=${selectedFacultyYear}`;
        const facultyRes = await axios.get(url);
        setInternalData(facultyRes.data.internal);
        setExternalData(facultyRes.data.external);
        const labels =
          selectedFacultyYear === "All"
            ? [...Array(11)].map((_, i) => (2025 + i).toString()) // Years from 2025 to 2035
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setFacultyLabels(labels);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };
    fetchFacultyData();
  }, [selectedFacultyYear]);

  // Fetch asset data based on selected year and location
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        // Permanent assets in store
        let permanentUrl = `http://localhost:3001/api/assets/purchased-types?assetType=Permanent&year=${selectedYear === "All" ? "all" : selectedYear}`;
        if (selectedLocation !== "All") permanentUrl += `&location=${selectedLocation}`;
        const permanentResponse = await axios.get(permanentUrl);
        const { data: permanentData, categories: permanentCats } = permanentResponse.data;
        setPermanentChartData(permanentData);
        setPermanentCategories(permanentCats);
        setPermanentLabels(
          selectedYear === "All"
            ? [...Array(12)].map((_, i) => (2024 + i).toString()) // Years from 2024 to 2035
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        );

        // Consumable assets in store
        const consumableUrl = `http://localhost:3001/api/assets/store-consumables?year=${selectedYear === "All" ? "all" : selectedYear}`;
        const consumableResponse = await axios.get(consumableUrl);
        const { data: consumableData, categories: consumableCats } = consumableResponse.data;
        setConsumableChartData(consumableData);
        setConsumableCategories(consumableCats);
        setConsumableLabels(
          selectedYear === "All"
            ? [...Array(12)].map((_, i) => (2024 + i).toString())
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        );

        // Issued permanent assets
        const issuedPermanentUrl = `http://localhost:3001/api/assets/issued-permanent?year=${selectedYear === "All" ? "all" : selectedYear}`;
        const issuedPermanentResponse = await axios.get(issuedPermanentUrl);
        const { data: issuedPermanentData, categories: issuedPermanentCats } = issuedPermanentResponse.data;
        setIssuedPermanentChartData(issuedPermanentData);
        setIssuedPermanentCategories(issuedPermanentCats);
        setIssuedPermanentLabels(
          selectedYear === "All"
            ? [...Array(12)].map((_, i) => (2024 + i).toString())
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        );

        // Issued consumable assets
        const issuedConsumableUrl = `http://localhost:3001/api/assets/issued-consumable?year=${selectedYear === "All" ? "all" : selectedYear}`;
        const issuedConsumableResponse = await axios.get(issuedConsumableUrl);
        const { data: issuedConsumableData, categories: issuedConsumableCats } = issuedConsumableResponse.data;
        setIssuedConsumableChartData(issuedConsumableData);
        setIssuedConsumableCategories(issuedConsumableCats);
        setIssuedConsumableLabels(
          selectedYear === "All"
            ? [...Array(12)].map((_, i) => (2024 + i).toString())
            : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        );
      } catch (error) {
        console.error("Error fetching asset data:", error);
      }
    };
    fetchFilteredData();
  }, [selectedLocation, selectedYear]);

  // Toggle expand/collapse of notification
  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  // Open faculty details popup
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  // Close faculty details popup
  const closePopup = () => {
    setSelectedFaculty(null);
  };

  // Acknowledge a notification
  const handleAcknowledge = async (facultyId) => {
    setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Acknowledging..." }));
    try {
      const response = await axios.put(`http://localhost:3001/api/faculty/acknowledge-si/${facultyId}`);
      if (response.data.success) {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Acknowledged" }));
        setNotifications((prev) => prev.filter((n) => n._id !== facultyId));
        setTimeout(() => setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "" })), 2000);
      } else {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Failed to Acknowledge" }));
      }
    } catch (error) {
      setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Failed to Acknowledge" }));
      console.error("Error acknowledging notification:", error);
    }
  };

  // Render notification details
  const renderNotificationDetails = (notification) => (
    <div style={styles.notificationDetails}>
      <p>
        <strong>Notification Time:</strong> {new Date(notification.notificationDate).toLocaleString()}
      </p>
      <p>
        <strong>Remarks:</strong> {notification.notifyremarks || "No remarks provided"}
      </p>
      <div style={styles.notificationActions}>
        <button style={styles.viewButton} onClick={() => handleViewDetails(notification)}>
          View Details
        </button>
        <button
          style={{
            ...styles.acknowledgeButton,
            ...(acknowledgeStatus[notification._id] === "Acknowledging..." ? styles.buttonDisabled : {}),
          }}
          onClick={() => handleAcknowledge(notification._id)}
          disabled={acknowledgeStatus[notification._id] === "Acknowledging..."}
        >
          {acknowledgeStatus[notification._id] === "Acknowledging..." && <>Acknowledging...</>}
          {acknowledgeStatus[notification._id] === "Acknowledged" && <>Acknowledged</>}
          {acknowledgeStatus[notification._id] === "Failed to Acknowledge" && <>Failed</>}
          {!acknowledgeStatus[notification._id] && "Acknowledge"}
        </button>
      </div>
    </div>
  );

  // Render faculty details in popup
  const renderFacultyDetails = (faculty) => {
    const renderValue = (value) => {
      if (Array.isArray(value)) return <ul>{value.map((item, idx) => <li key={idx}>{item}</li>)}</ul>;
      if (typeof value === "object" && value !== null) {
        return (
          <ul>
            {Object.entries(value)
              .filter(([key]) => key !== "_id" && key !== "conduct")
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong> {renderValue(val)}
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-";
    };

    return (
      <div style={styles.popup}>
        <div style={styles.popupContent}>
          <h3 style={styles.popupHeader}>Faculty Details</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(faculty)
                .filter(([key]) => key !== "_id" && key !== "conduct")
                .map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: "bold", padding: "10px", border: "1px solid #ddd" }}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>{renderValue(value)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button
            style={styles.closeButton}
            onClick={closePopup}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Filter chart data based on current year/month
  const filterChartData = (data, labels, isYearly) => {
    if (isYearly) {
      const currentYear = new Date().getFullYear();
      const startYear = 2024;
      const endIndex = Math.min(currentYear - startYear + 1, data.length);
      return {
        filteredData: data.slice(0, endIndex),
        filteredLabels: labels.slice(0, endIndex),
      };
    } else {
      const currentMonthIndex = new Date().getMonth();
      return {
        filteredData: data.slice(0, currentMonthIndex + 1),
        filteredLabels: labels.slice(0, currentMonthIndex + 1),
      };
    }
  };

  // Chart configurations
  const permanentChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(permanentChartData, permanentLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: permanentCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map((row) => row[idx]),
        borderColor: `hsl(${idx * 30}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 30}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const consumableChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(consumableChartData, consumableLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: consumableCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map((row) => row[idx]),
        borderColor: `hsl(${idx * 40}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 40}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const issuedPermanentChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(issuedPermanentChartData, issuedPermanentLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: issuedPermanentCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map((row) => row[idx]),
        borderColor: `hsl(${idx * 50}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 50}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const issuedConsumableChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(issuedConsumableChartData, issuedConsumableLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: issuedConsumableCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map((row) => row[idx]),
        borderColor: `hsl(${idx * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const generateSessionChartConfig = () => ({
    labels: sessionLabels,
    datasets: [
      {
        label: "Total Sessions Handled",
        data: sessionData,
        backgroundColor: "rgba(9, 172, 248, 0.6)",
        borderColor: "rgb(6, 213, 254)",
        borderWidth: 1,
      },
    ],
  });

  const generateFacultyChartConfig = () => ({
    labels: facultyLabels,
    datasets: [
      { label: "Internal Faculty", data: internalData, backgroundColor: "rgba(75, 192, 192, 0.6)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
      { label: "External Faculty", data: externalData, backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1 },
    ],
  });

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom", labels: { font: { size: 14 } } }, title: { display: true, font: { size: 18 } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f2f2f2" }, ticks: { min: 0, stepSize: 10 } } },
  };

  // Filter change handlers
  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleLocationChange = (event) => setSelectedLocation(event.target.value);
  const handleFacultyYearChange = (event) => setSelectedFacultyYear(event.target.value);

  // Inline styles
  const styles = {
    notificationPanel: { maxWidth: "800px", margin: "20px auto", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", backgroundColor: "#fff", maxHeight: "500px", overflowY: "auto" },
    notificationHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", position: "sticky", top: 0, backgroundColor: "#fff", padding: "10px 0", zIndex: 1 },
    notificationList: { maxHeight: "400px", overflowY: "auto", paddingRight: "5px" },
    notificationBanner: { padding: "15px", marginBottom: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
    notificationSummary: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    notificationTitle: { flex: 1, fontWeight: "bold", display: "flex", flexDirection: "column" },
    notificationTime: { fontSize: "0.8em", color: "#666", fontWeight: "normal", marginTop: "5px" },
    expandButton: { padding: "5px 10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px", minWidth: "30px" },
    notificationDetails: { marginTop: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px", fontSize: "0.9em" },
    notificationActions: { display: "flex", gap: "10px", marginTop: "10px" },
    viewButton: { padding: "5px 10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
    acknowledgeButton: { padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
    buttonDisabled: { backgroundColor: "#6c757d", cursor: "not-allowed" },
    noNotifications: { textAlign: "center", color: "#666", padding: "20px" },
    popup: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    popupContent: { background: "white", padding: "20px", borderRadius: "10px", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", position: "relative" },
    popupHeader: { marginBottom: "15px", color: "#333" },
    closeButton: { marginTop: "15px", padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
    usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
    userIcon: { fontSize: "30px", color: "#007BFF" },
    username: { fontWeight: "bold", fontSize: "18px" },
  };

  const moduleStyle = { width: "45%", padding: "20px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" };
  const titleStyle = { marginBottom: "15px", fontSize: "1.2em", color: "#28a745" };

  // Render the component
  return (
    <div>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="stylesheet" href="../styles/style.css" />
        <title>CASFOS</title>
      </Helmet>

      {/* Sidebar */}
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">Faculty Verifier</span>
        </a>
        <ul className="side-menu top">
          <li className="active">
            <a href={`/facultyverifierdashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li>
            <a href={`/facultyverify?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Verify</span>
            </a>
          </li>
          <li>
            <a href={`/facultyverifierfacultyview?username=${encodeURIComponent(username)}`}>
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

      {/* Main content */}
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

        <main>
          {/* Notification Panel */}
          <div style={styles.notificationPanel}>
            <div style={styles.notificationHeader}>
              <h2>Pending Notifications</h2>
            </div>
            {notifications.length === 0 ? (
              <p style={styles.noNotifications}>No pending notifications</p>
            ) : (
              <div style={styles.notificationList}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{ ...styles.notificationBanner, backgroundColor: "#fff3cd" }} // Yellowish for pending
                  >
                    <div style={styles.notificationSummary}>
                      <span style={styles.notificationTitle}>
                        Faculty Notification - {notification.name}
                        <span style={styles.notificationTime}>{new Date(notification.notificationDate).toLocaleString()}</span>
                      </span>
                      <div>
                        <button style={styles.expandButton} onClick={() => toggleExpand(notification._id)}>
                          {expandedNotification === notification._id ? "▲" : "▼"}
                        </button>
                      </div>
                    </div>
                    {expandedNotification === notification._id && renderNotificationDetails(notification)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Charts */}
          <div className="analytics-container" style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
            <div style={moduleStyle}>
              <h3 style={titleStyle}>Permanent Assets in Store</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select value={selectedYear} onChange={handleYearChange}>
                    <option value="All">All</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </label>
                <label style={{ marginTop: "20px", marginLeft: "20px" }}>
                  Location:
                  <select value={selectedLocation} onChange={handleLocationChange}>
                    <option value="All">All</option>
                    <option value="faculty_chamber">Faculty Chamber</option>
                    <option value="officer_quarters">Officer Quarters</option>
                    <option value="staff_quarters">Staff Quarters</option>
                    <option value="corbett_hall">Corbett Hall</option>
                    <option value="champion_hall">Champion Hall</option>
                    <option value="gis_lab">GIS Lab</option>
                    <option value="van_vatika">Van Vatika</option>
                    <option value="hostel">Hostel</option>
                    <option value="officers_mess">Officers Mess</option>
                    <option value="van_sakthi">Van Sakthi</option>
                    <option value="library">Library</option>
                    <option value="classroom">Classroom</option>
                    <option value="office_room">Office Room</option>
                    <option value="officers_lounge">Officer's Lounge</option>
                    <option value="gymnasium">Gymnasium</option>
                  </select>
                </label>
              </div>
              <Line data={permanentChartConfig()} options={lineChartOptions} />
            </div>

            <div style={moduleStyle}>
              <h3 style={titleStyle}>Consumable Assets in Store</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select value={selectedYear} onChange={handleYearChange}>
                    <option value="All">All</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </label>
              </div>
              <Line data={consumableChartConfig()} options={lineChartOptions} />
            </div>

            <div style={moduleStyle}>
              <h3 style={titleStyle}>Issued Permanent Assets</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select value={selectedYear} onChange={handleYearChange}>
                    <option value="All">All</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </label>
              </div>
              <Line data={issuedPermanentChartConfig()} options={lineChartOptions} />
            </div>

            <div style={moduleStyle}>
              <h3 style={titleStyle}>Issued Consumable Assets</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select value={selectedYear} onChange={handleYearChange}>
                    <option value="All">All</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </label>
              </div>
              <Line data={issuedConsumableChartConfig()} options={lineChartOptions} />
            </div>

            <div style={moduleStyle}>
              <h3 style={titleStyle}>Count of Faculties Entered</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select onChange={handleFacultyYearChange} value={selectedFacultyYear}>
                    <option value="All">All</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </label>
              </div>
              <Bar data={generateFacultyChartConfig()} />
            </div>

            <div style={moduleStyle}>
              <h3 style={titleStyle}>Total Sessions Handled</h3>
              <div className="filters">
                <label style={{ marginTop: "20px" }}>
                  Year:
                  <select onChange={(e) => setSelectedSessionYear(e.target.value)} value={selectedSessionYear}>
                    <option value="All">All</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </label>
              </div>
              <Bar data={generateSessionChartConfig()} />
            </div>
          </div>
        </main>
      </section>

      {/* Faculty Details Popup */}
      {selectedFaculty && renderFacultyDetails(selectedFaculty)}
    </div>
  );
};

export default facultyverifierDashboard;
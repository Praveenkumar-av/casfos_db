import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const HOODashboard = () => {
  // Existing dashboard states
  const [assetData, setAssetData] = useState([]);
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedFacultyYear, setSelectedFacultyYear] = useState("All");
  const [sessionData, setSessionData] = useState([]);
  const [selectedSessionYear, setSelectedSessionYear] = useState("All");
  const [sessionLabels, setSessionLabels] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [facultyLabels, setFacultyLabels] = useState([]);
  const [labels, setLabels] = useState([]);
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 });
  
  // New notification states
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [acknowledgeStatus, setAcknowledgeStatus] = useState({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  const [permanentLabels, setPermanentLabels] = useState([]);
  const [permanentChartData, setPermanentChartData] = useState([]);
  const [permanentCategories, setPermanentCategories] = useState([]);
  const [consumableLabels, setConsumableLabels] = useState([]);
  const [consumableChartData, setConsumableChartData] = useState([]);
  const [consumableCategories, setConsumableCategories] = useState([]);
  const [issuedPermanentLabels, setIssuedPermanentLabels] = useState([]);
  const [issuedPermanentChartData, setIssuedPermanentChartData] = useState([]);
  const [issuedPermanentCategories, setIssuedPermanentCategories] = useState([]);
  const [issuedConsumableLabels, setIssuedConsumableLabels] = useState([]);
  const [issuedConsumableChartData, setIssuedConsumableChartData] = useState([]);
  const [issuedConsumableCategories, setIssuedConsumableCategories] = useState([]);

  // Fetch notifications where notifyhoo is false
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/faculty/notifyhoo-false");
        const sortedNotifications = response.data
          .sort((a, b) => new Date(b.notificationDate) - new Date(a.notificationDate))
          .slice(0, 10);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifyhoo false notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Toggle expand/collapse of notification
  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  // Handle view button click
  const handleViewDetails = (faculty) => {
    setSelectedFaculty(faculty);
  };

  // Close faculty details popup
  const closePopup = () => {
    setSelectedFaculty(null);
  };

  // Handle acknowledge button click
  const handleAcknowledge = async (facultyId) => {
    setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Acknowledging..." }));
    try {
      const response = await axios.put(`http://localhost:3001/api/faculty/acknowledge-hoo/${facultyId}`);
      if (response.data.success) {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Acknowledged" }));
        setNotifications((prev) => prev.filter((n) => n._id !== facultyId));
        setTimeout(() => {
          setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "" }));
        }, 2000);
      } else {
        setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Failed to Acknowledge" }));
      }
    } catch (error) {
      setAcknowledgeStatus((prev) => ({ ...prev, [facultyId]: "Failed to Acknowledge" }));
      console.error("Error acknowledging notification:", error);
    }
  };

  // Render notification details
  const renderNotificationDetails = (notification) => {
    return (
      <div style={styles.notificationDetails}>
        <p><strong>Notification Time:</strong> {new Date(notification.notificationDate).toLocaleString()}</p>
        <p><strong>Remarks:</strong> {notification.notifyremarks || "No remarks provided"}</p>
        <div style={styles.notificationActions}>
          <button
            style={styles.viewButton}
            onClick={() => handleViewDetails(notification)}
          >
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
            {acknowledgeStatus[notification._id] === "Acknowledging..." && (
              <>Acknowledging...</>
            )}
            {acknowledgeStatus[notification._id] === "Acknowledged" && (
              <>Acknowledged</>
            )}
            {acknowledgeStatus[notification._id] === "Failed to Acknowledge" && (
              <>Failed</>
            )}
            {!acknowledgeStatus[notification._id] && "Acknowledge"}
          </button>
        </div>
      </div>
    );
  };

  // Render faculty details popup
  const renderFacultyDetails = (faculty) => {
    const renderValue = (value) => {
      if (Array.isArray(value)) return <ul>{value.map((item, idx) => <li key={idx}>{item}</li>)}</ul>;
      if (typeof value === "object" && value !== null) {
        return (
          <ul>
            {Object.entries(value).filter(([key]) => key !== "_id" && key !== "conduct").map(([key, val]) => (
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
                .filter(([key]) => key !== "_id")
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

  // Existing useEffect hooks for fetching data (unchanged)
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        let url = "http://localhost:3001/api/faculty/sessions";
        if (selectedSessionYear !== "All") url += `?year=${selectedSessionYear}`;
        else url += `?year=All`;
        const sessionRes = await axios.get(url);
        setSessionData(sessionRes.data.sessionCounts);
        const labels = selectedSessionYear === "All"
          ? [...Array(11)].map((_, i) => (2025 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setSessionLabels(labels);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };
    fetchSessionData();
  }, [selectedSessionYear]);

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

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        let url = "http://localhost:3001/api/faculty/monthly";
        if (selectedFacultyYear !== "All") url += `?year=${selectedFacultyYear}`;
        else url += `?year=All`;
        const facultyRes = await axios.get(url);
        setInternalData(facultyRes.data.internal);
        setExternalData(facultyRes.data.external);
        const labels = selectedFacultyYear === "All"
          ? [...Array(11)].map((_, i) => (2025 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        setFacultyLabels(labels);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };
    fetchFacultyData();
  }, [selectedFacultyYear]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        let permanentUrl = "http://localhost:3001/api/assets/purchased-types?assetType=Permanent";
        if (selectedLocation !== "All") permanentUrl += `&location=${selectedLocation}`;
        if (selectedYear !== "All") permanentUrl += `&year=${selectedYear}`;
        else permanentUrl += `&year=all`;

        const permanentResponse = await axios.get(permanentUrl);
        const { data: permanentData, categories: permanentCats } = permanentResponse.data;
        setPermanentChartData(permanentData);
        setPermanentCategories(permanentCats);
        setPermanentLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        let consumableUrl = "http://localhost:3001/api/assets/store-consumables";
        if (selectedYear !== "All") consumableUrl += `?year=${selectedYear}`;
        else consumableUrl += `?year=all`;

        const consumableResponse = await axios.get(consumableUrl);
        const { data: consumableData, categories: consumableCats } = consumableResponse.data;
        setConsumableChartData(consumableData);
        setConsumableCategories(consumableCats);
        setConsumableLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        let issuedPermanentUrl = "http://localhost:3001/api/assets/issued-permanent";
        if (selectedYear !== "All") issuedPermanentUrl += `?year=${selectedYear}`;
        else issuedPermanentUrl += `?year=all`;

        const issuedPermanentResponse = await axios.get(issuedPermanentUrl);
        const { data: issuedPermanentData, categories: issuedPermanentCats } = issuedPermanentResponse.data;
        setIssuedPermanentChartData(issuedPermanentData);
        setIssuedPermanentCategories(issuedPermanentCats);
        setIssuedPermanentLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);

        let issuedConsumableUrl = "http://localhost:3001/api/assets/issued-consumable";
        if (selectedYear !== "All") issuedConsumableUrl += `?year=${selectedYear}`;
        else issuedConsumableUrl += `?year=all`;

        const issuedConsumableResponse = await axios.get(issuedConsumableUrl);
        const { data: issuedConsumableData, categories: issuedConsumableCats } = issuedConsumableResponse.data;
        setIssuedConsumableChartData(issuedConsumableData);
        setIssuedConsumableCategories(issuedConsumableCats);
        setIssuedConsumableLabels(selectedYear === "All"
          ? [...Array(12)].map((_, i) => (2024 + i).toString())
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
      } catch (error) {
        console.error("Error fetching asset data:", error);
      }
    };
    fetchFilteredData();
  }, [selectedLocation, selectedYear]);

  // Filter chart data (unchanged)
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

  // Chart configurations (unchanged)
  const permanentChartConfig = () => {
    const { filteredData, filteredLabels } = filterChartData(permanentChartData, permanentLabels, selectedYear === "All");
    return {
      labels: filteredLabels,
      datasets: permanentCategories.map((category, idx) => ({
        label: category,
        data: filteredData.map(row => row[idx]),
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
        data: filteredData.map(row => row[idx]),
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
        data: filteredData.map(row => row[idx]),
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
        data: filteredData.map(row => row[idx]),
        borderColor: `hsl(${idx * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.2)`,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      })),
    };
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 14 } } },
      title: { display: true, font: { size: 18 } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f2f2f2" }, ticks: { min: 0, stepSize: 10 } },
    },
  };

  const generateSessionChartConfig = () => ({
    labels: sessionLabels,
    datasets: [{
      label: "Total Sessions Handled",
      data: sessionData,
      backgroundColor: "rgba(9, 172, 248, 0.6)",
      borderColor: "rgb(6, 213, 254)",
      borderWidth: 1,
    }],
  });

  const generateFacultyChartConfig = () => ({
    labels: facultyLabels,
    datasets: [
      { label: "Internal Faculty", data: internalData, backgroundColor: "rgba(75, 192, 192, 0.6)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
      { label: "External Faculty", data: externalData, backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1 },
    ],
  });

  const salesData = [
    { id: 1, value: userCounts.adminCount || "0", title: "Admin", bgColor: "#bfecff", iconColor: "#5ccbff", iconClass: "fas fa-user-shield" },
    { id: 2, value: userCounts.dataEntryCount || "0", title: "Data Entry Staff", bgColor: "#FFF3D2", iconColor: "#FFA85C", iconClass: "fas fa-keyboard" },
    { id: 3, value: userCounts.viewerCount || "0", title: "Data Viewer", bgColor: "#D2FFD2", iconColor: "#5CFF5C", iconClass: "fas fa-eye" },
  ];

  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleLocationChange = (event) => setSelectedLocation(event.target.value);
  const handleFacultyYearChange = (event) => setSelectedFacultyYear(event.target.value);

  return (
    <>
      <div>
        <Helmet>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
          <link rel="stylesheet" href="style.css" />
          <title>CASFOS</title>
        </Helmet>

        <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">HEAD OF OFFICE</span>
          </a>
          <ul className="side-menu top">
            <li className="active"><a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li><a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">User Approval</span></a></li>
            <li><a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Faculty Approval</span></a></li>
            <li><a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li>
            <li><a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
          <ul className="side-menu">
            <li><a href="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
          </ul>
        </section>

        <section id="content">
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <div style={styles.usernameContainer}>
              <i className="bx bxs-user-circle" style={styles.userIcon}></i>
              <span style={styles.username}>{username}</span>
            </div>
          </nav>

          <main>
            <Helmet>
              <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet" />
            </Helmet>

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
                      style={{
                        ...styles.notificationBanner,
                        backgroundColor: "#fff3cd", // Yellowish for pending notifications
                      }}
                    >
                      <div style={styles.notificationSummary}>
                        <span style={styles.notificationTitle}>
                          Faculty Notification - {notification.name}
                          <span style={styles.notificationTime}>
                            {new Date(notification.notificationDate).toLocaleString()}
                          </span>
                        </span>
                        <div>
                          <button
                            style={styles.expandButton}
                            onClick={() => toggleExpand(notification._id)}
                          >
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
    </>
  );
};

const styles = {
  notificationPanel: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    maxHeight: "500px",
    overflowY: "auto",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    padding: "10px 0",
    zIndex: 1,
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: "5px",
  },
  notificationBanner: {
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  notificationSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    flex: 1,
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
  },
  notificationTime: {
    fontSize: "0.8em",
    color: "#666",
    fontWeight: "normal",
    marginTop: "5px",
  },
  expandButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
    minWidth: "30px",
  },
  notificationDetails: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    fontSize: "0.9em",
  },
  notificationActions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  viewButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  acknowledgeButton: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
  },
  noNotifications: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
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
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
};

const moduleStyle = { width: "45%", padding: "20px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" };
const titleStyle = { marginBottom: "15px", fontSize: "1.2em", color: "#28a745" };

export default HOODashboard;
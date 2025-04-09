import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/style.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const FacultyEntryStaffDashboard = () => {
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [expandedNotification, setExpandedNotification] = useState(null);

  // Dashboard states
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);
  const [selectedFacultyYear, setSelectedFacultyYear] = useState("All");
  const [sessionData, setSessionData] = useState([]);
  const [selectedSessionYear, setSelectedSessionYear] = useState("All");
  const [sessionLabels, setSessionLabels] = useState([]);
  const [facultyLabels, setFacultyLabels] = useState([]);
  const [userCounts, setUserCounts] = useState({ adminCount: 0, dataEntryCount: 0, viewerCount: 0 });

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  // Format notification title based on type
  const formatNotificationTitle = (notification) => {
    if (notification.approvalRejection) {
      return `Faculty Approval Rejected - ${notification.name}`;
    } else if (notification.verificationRejection) {
      return `Faculty Verification Rejected - ${notification.name}`;
    } else if (notification.notifyprincipal && notification.notifyhoo && notification.notifysi) {
      return `Faculty Notification - ${notification.name}`;
    }
    return "Unknown Notification";
  };

  // Fetch all types of notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [approvalResponse, verificationResponse, notifyResponse] = await Promise.all([
          axios.get("http://localhost:3001/api/faculty/rejected-approvals"),
          axios.get("http://localhost:3001/api/faculty/rejected-verifications"),
          axios.get("http://localhost:3001/api/faculty/notify-all-true")
        ]);
  
        const allNotifications = [
          ...approvalResponse.data.map((n) => ({ ...n, type: "approvalRejection" })),
          ...verificationResponse.data.map((n) => ({ ...n, type: "verificationRejection" })),
          ...notifyResponse.data.map((n) => ({ ...n, type: "notifyFaculty" }))
        ];
  
        const sortedNotifications = allNotifications
          .map((notification) => {
            // Determine the appropriate timestamp based on type
            let timestamp;
            if (notification.type === "approvalRejection" || notification.type === "verificationRejection") {
              timestamp = notification.updatedAt || notification.notificationDate || new Date(0); // Fallback to epoch if undefined
            } else if (notification.type === "notifyFaculty") {
              timestamp = notification.notificationDate || notification.updatedAt || new Date(0); // Prioritize notificationDate for notifyFaculty
            }
            return { ...notification, timestamp: new Date(timestamp) };
          })
          .sort((a, b) => b.timestamp - a.timestamp) // Sort by the normalized timestamp
          .slice(0, 10);
  
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Toggle expand/collapse of notification
  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  // Handle reenter button click
  const handleReenter = (notification) => {
    navigate(`/facultyentry?username=${encodeURIComponent(username)}`, {
      state: { facultyData: notification }
    });
  };

  // Render notification details based on type
  const renderNotificationDetails = (notification) => {
    const isRejection = notification.type === "approvalRejection" || notification.type === "verificationRejection";
    const timeField = isRejection ? "updatedAt" : "notificationDate";
    const remarksField = isRejection ? "rejectionRemarks" : "notifyremarks";

    return (
      <div style={styles.notificationDetails}>
        <p><strong>{isRejection ? "Rejection" : "Notification"} Time:</strong> {new Date(notification[timeField]).toLocaleString()}</p>
        <p><strong>Remarks:</strong> {notification[remarksField] || "No remarks provided"}</p>
        <button
          style={styles.reenterButton}
          onClick={() => handleReenter(notification)}
        >
          Reenter
        </button>
      </div>
    );
  };

  // Fetch session data
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

  // Fetch user counts
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const userRes = await axios.get("http://localhost:3001/api/users/count");
        setUserCounts(userRes.data.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };
    fetchAnalyticsData();
  }, []);

  // Fetch faculty data
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

  // Chart configurations
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
            <span className="text">FACULTY ENTRY STAFF</span>
          </a>
          <ul className="side-menu top">
            <li className="active"><a href={`/facultyentrydashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li><a href={`/facultyentry?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty Entry</span></a></li>
            <li><a href={`/viewfaculty?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
          <ul className="side-menu">
            <li><a href="/" className="logout"><i className="bx bxs-log-out-circle" /><span className="text">Logout</span></a></li>
          </ul>
        </section>

        <section id="content">
          <nav>
            <i className="bx bx-menu" />
            <span className="head-title">Dashboard</span>
            <form action="#"><div className="form-input"></div></form>
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
                <h2>Recent Notifications</h2>
              </div>
              {notifications.length === 0 ? (
                <p style={styles.noNotifications}>No notifications available</p>
              ) : (
                <div style={styles.notificationList}>
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      style={{
                        ...styles.notificationBanner,
                        backgroundColor:
                          notification.type === "approvalRejection" || notification.type === "verificationRejection"
                            ? "#f8d7da" // Reddish for rejections
                            : "#d4edda", // Greenish for fully acknowledged
                      }}
                    >
                      <div style={styles.notificationSummary}>
                        <span style={styles.notificationTitle}>
                          {formatNotificationTitle(notification)}
                          <span style={styles.notificationTime}>
                            {new Date(notification.updatedAt || notification.notificationDate).toLocaleString()}
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
  reenterButton: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  notificationDetails: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    fontSize: "0.9em",
  },
  noNotifications: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  usernameContainer: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555" },
  userIcon: { fontSize: "30px", color: "#007BFF" },
  username: { fontWeight: "bold", fontSize: "18px" },
};

const moduleStyle = { width: "45%", padding: "20px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", textAlign: "center" };
const titleStyle = { marginBottom: "15px", fontSize: "1.2em", color: "#28a745" };

export default FacultyEntryStaffDashboard;
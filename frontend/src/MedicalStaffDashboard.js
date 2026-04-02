import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./staff/Sidebar";
import Profile from "./staff/Profile";
import Appointments from "./staff/Appointments";
import LabTests from "./staff/LabTests";
import Telemedicine from "./staff/Telemedicine";
import "./MedicalStaffDashboard.css";
import {
  fetchAllAppointments,
  fetchReports,
  fetchStaffProfile,
  fetchStaffStats,
  fetchTelemedicineReviewQueue,
  fetchTelemedicineSessions,
} from "./api";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString();
};

// Dashboard Home Component
const DashboardHome = () => {
  const [stats, setStats] = React.useState({});
  const [profile, setProfile] = React.useState(null);
  const [appointments, setAppointments] = React.useState([]);
  const [labTests, setLabTests] = React.useState([]);
  const [reviewQueue, setReviewQueue] = React.useState([]);
  const [assignedSessions, setAssignedSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        statsRes,
        profileRes,
        appointmentsRes,
        reportsRes,
        reviewQueueRes,
        sessionsRes,
      ] = await Promise.all([
        fetchStaffStats(),
        fetchStaffProfile(),
        fetchAllAppointments(),
        fetchReports(),
        fetchTelemedicineReviewQueue(),
        fetchTelemedicineSessions(),
      ]);

      const appointmentRows = Array.isArray(appointmentsRes?.data) ? appointmentsRes.data : [];
      const reportRows = Array.isArray(reportsRes?.data) ? reportsRes.data : [];
      const queueRows = Array.isArray(reviewQueueRes?.data) ? reviewQueueRes.data : [];
      const sessionRows = Array.isArray(sessionsRes?.data) ? sessionsRes.data : [];

      const fallbackStats = {
        totalAppointments: appointmentRows.length,
        pendingAppointments: appointmentRows.filter((item) => item.status === "SCHEDULED").length,
        ongoingAppointments: appointmentRows.filter((item) => item.status === "ACCEPTED").length,
        upcomingAppointments: appointmentRows.filter((item) => item.status === "SCHEDULED").length,
        completedAppointments: appointmentRows.filter((item) => item.status === "COMPLETED").length,
        totalReports: reportRows.length,
        pendingLabTests: reportRows.filter((item) => item.status === "PENDING").length,
        inProgressLabTests: reportRows.filter((item) => item.status === "IN_PROGRESS").length,
        distributedLabTests: reportRows.filter((item) => item.status === "DISTRIBUTED").length,
        pendingTelemedicineReviews: queueRows.length,
        myReviewedRequests: sessionRows.length,
        myApprovedRequests: sessionRows.filter((item) => item.requestStatus === "STAFF_APPROVED").length,
        myRejectedRequests: sessionRows.filter((item) => item.requestStatus === "STAFF_REJECTED").length,
        doctorScheduledRequests: sessionRows.filter((item) => item.requestStatus === "DOCTOR_SCHEDULED").length,
      };

      setStats({
        ...fallbackStats,
        ...(statsRes?.success && statsRes?.data ? statsRes.data : {}),
      });

      setProfile(profileRes?.success ? profileRes.data : null);
      setAppointments(appointmentRows.slice(0, 6));
      setLabTests(
        reportRows
          .filter((report) => String(report.reportType || "").toUpperCase() !== "PRESCRIPTION")
          .slice(0, 6)
      );
      setReviewQueue(queueRows.slice(0, 6));
      setAssignedSessions(sessionRows.slice(0, 6));
    } catch (loadError) {
      setError(loadError?.message || "Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    { label: "All Appointments", value: stats.totalAppointments || 0 },
    { label: "Pending Appointments", value: stats.pendingAppointments || 0 },
    { label: "Accepted Appointments", value: stats.ongoingAppointments || 0 },
    { label: "Lab Tests Pending", value: stats.pendingLabTests || 0 },
    { label: "Lab Tests In Progress", value: stats.inProgressLabTests || 0 },
    { label: "Lab Tests Distributed", value: stats.distributedLabTests || 0 },
    { label: "Telemedicine Queue", value: stats.pendingTelemedicineReviews || 0 },
    { label: "My Reviewed Requests", value: stats.myReviewedRequests || 0 },
  ];

  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <div>
          <h2>{`Welcome${profile?.name ? `, ${profile.name}` : ""}!`}</h2>
          <p className="dashboard-subtitle">MediPortal helps you coordinate safer and faster patient care.</p>
        </div>
        <button type="button" className="refresh-btn" onClick={loadDashboard} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <p className="dashboard-error">{error}</p> : null}

      {loading ? <p className="dashboard-loading">Loading dashboard data...</p> : null}

      <div className="overview-cards">
        {statCards.map((card) => (
          <div className="card" key={card.label}>
            <h3>{card.label}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-sections-grid">
        <section className="dashboard-panel">
          <h3>Recent Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <div className="dashboard-list">
              {appointments.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <div>
                    <strong>{`Patient #${item.P_ID || "-"}`}</strong>
                    <p>{`${formatDate(item.date)} ${item.time || ""}`.trim()}</p>
                  </div>
                  <span className="status-pill">{item.status || "SCHEDULED"}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h3>Recent Lab Tests</h3>
          {labTests.length === 0 ? (
            <p>No lab tests found.</p>
          ) : (
            <div className="dashboard-list">
              {labTests.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <div>
                    <strong>{item.testName || `Test #${item.Test_ID || item.id}`}</strong>
                    <p>{`Patient #${item.P_ID || "-"}`}</p>
                  </div>
                  <span className="status-pill">{item.status || "PENDING"}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h3>Telemedicine Review Queue</h3>
          {reviewQueue.length === 0 ? (
            <p>No pending telemedicine requests.</p>
          ) : (
            <div className="dashboard-list">
              {reviewQueue.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <div>
                    <strong>{item?.PatientUser?.name || `Patient #${item.P_ID || "-"}`}</strong>
                    <p>{`TXN: ${item.transactionId || "-"}`}</p>
                  </div>
                  <span className="status-pill">{item.requestStatus || "PAYMENT_SUBMITTED"}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h3>My Reviewed Sessions</h3>
          {assignedSessions.length === 0 ? (
            <p>No reviewed sessions yet.</p>
          ) : (
            <div className="dashboard-list">
              {assignedSessions.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <div>
                    <strong>{item?.PatientUser?.name || `Patient #${item.P_ID || "-"}`}</strong>
                    <p>{item?.Doctor?.User?.name || `Doctor #${item.D_ID || "-"}`}</p>
                  </div>
                  <span className="status-pill">{item.requestStatus || "-"}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const MedicalStaffDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="labTests" element={<LabTests />} />
          <Route path="telemedicine" element={<Telemedicine />} />
        </Routes>
      </div>
    </div>
  );
};

export default MedicalStaffDashboard;

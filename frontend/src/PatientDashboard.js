import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./patient/Sidebar";
import Profile from "./patient/Profile";
import "./PatientDashboard.css";
import {
  bookAppointment,
  fetchDoctors,
  fetchMyAppointments,
  fetchPatientSummary,
  fetchReports,
} from "./api";

const getStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "accepted") return "status-accepted";
  if (normalized === "completed") return "status-completed";
  if (normalized === "rejected") return "status-rejected";
  return "status-scheduled";
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [summary, setSummary] = React.useState({
    upcomingAppointments: 0,
    reports: 0,
    teleconsultations: 0,
    nextAppointment: null,
  });
  const [loadingSummary, setLoadingSummary] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      setLoadingSummary(true);
      const res = await fetchPatientSummary();
      if (mounted && res?.success && res?.data) {
        setSummary(res.data);
      }
      if (mounted) {
        setLoadingSummary(false);
      }
    };
    loadSummary();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome Back, {user.name || "Patient"}</h1>
          <p className="page-subtitle">Here's your health overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Upcoming Appointments</h3>
            <p className="stat-number">{loadingSummary ? "..." : summary.upcomingAppointments}</p>
            <button onClick={() => navigate("/PatientDashboard/appointments")} className="stat-link">View All →</button>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Recent Reports</h3>
            <p className="stat-number">{loadingSummary ? "..." : summary.reports}</p>
            <button onClick={() => navigate("/PatientDashboard/reports")} className="stat-link">View Reports →</button>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💻</div>
          <div className="stat-info">
            <h3>Teleconsultations</h3>
            <p className="stat-number">{loadingSummary ? "..." : summary.teleconsultations}</p>
            <button onClick={() => navigate("/PatientDashboard/teleconsultation")} className="stat-link">Open Sessions →</button>
          </div>
        </div>
      </div>

      {summary.nextAppointment && (
        <div className="content-card compact-card">
          <h3 className="card-title">Next Appointment</h3>
          <p className="next-appointment-text">
            Dr. #{summary.nextAppointment.D_ID} on {new Date(summary.nextAppointment.date).toLocaleDateString()} at {summary.nextAppointment.time}
          </p>
        </div>
      )}

      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/PatientDashboard/appointments")} className="action-btn">
            <span className="action-icon">📅</span>
            <span>Book Appointment</span>
          </button>
          <button onClick={() => navigate("/PatientDashboard/teleconsultation")} className="action-btn">
            <span className="action-icon">💻</span>
            <span>Teleconsultation</span>
          </button>
          <button onClick={() => navigate("/PatientDashboard/reports")} className="action-btn">
            <span className="action-icon">📋</span>
            <span>View Records</span>
          </button>
          <button onClick={() => navigate("/PatientDashboard/billing")} className="action-btn">
            <span className="action-icon">💳</span>
            <span>Billing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Appointments = () => {
  const [appointments, setAppointments] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [form, setForm] = React.useState({ D_ID: "", date: "", time: "" });
  const [loading, setLoading] = React.useState(false);

  const loadAppointments = React.useCallback(() => {
    fetchMyAppointments().then((res) => {
      setAppointments(Array.isArray(res?.data) ? res.data : []);
    });
  }, []);

  React.useEffect(() => {
    loadAppointments();
    fetchDoctors().then((res) => setDoctors(Array.isArray(res?.data) ? res.data : []));
  }, [loadAppointments]);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await bookAppointment({
      D_ID: Number(form.D_ID),
      date: form.date,
      time: form.time,
    });
    setLoading(false);
    if (!result?.success) {
      alert(result?.message || "Failed to book appointment");
      return;
    }
    alert("Appointment booked successfully!");
    setForm({ D_ID: "", date: "", time: "" });
    loadAppointments();
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Manage your appointments with doctors</p>
      </div>

      <div className="content-card">
        <h3 className="card-title">Book New Appointment</h3>
        <form onSubmit={handleBook} className="appointment-form">
          <div className="form-row">
            <div className="form-field">
              <label>Select Doctor</label>
              <select
                required
                value={form.D_ID}
                onChange={(e) => setForm((prev) => ({ ...prev, D_ID: e.target.value }))}
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name || `Doctor #${doctor.id}`} {doctor.speciality && `- ${doctor.speciality}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                required
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="form-field">
              <label>Time</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      <div className="content-card">
        <h3 className="card-title">Your Appointments</h3>
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found.</p>
            <p className="empty-subtitle">Book your first appointment above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id}>
                    <td><span className="badge">Dr. #{item.D_ID}</span></td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.time}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status || "SCHEDULED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const MedicalRecords = () => (
  <div className="dashboard-content">
    <div className="page-header">
      <h1 className="page-title">Medical Records</h1>
      <p className="page-subtitle">Access your complete medical history</p>
    </div>
    <div className="content-card">
      <div className="empty-state">
        <p>📋 Your medical records will appear here</p>
        <p className="empty-subtitle">This feature is coming soon</p>
      </div>
    </div>
  </div>
);

const Prescriptions = () => (
  <div className="dashboard-content">
    <div className="page-header">
      <h1 className="page-title">My Prescriptions</h1>
      <p className="page-subtitle">View your current and past prescriptions</p>
    </div>
    <div className="content-card">
      <div className="empty-state">
        <p>💊 Your prescriptions will appear here</p>
        <p className="empty-subtitle">This feature is coming soon</p>
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [reports, setReports] = React.useState([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const loadReports = async () => {
      setLoadingReports(true);
      const res = await fetchReports();
      if (mounted) {
        setReports(Array.isArray(res?.data) ? res.data : []);
        setLoadingReports(false);
      }
    };
    loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Lab Reports</h1>
        <p className="page-subtitle">Access your laboratory test results</p>
      </div>
      <div className="content-card">
        {loadingReports ? (
          <div className="empty-state">
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>🧪 No reports available</p>
            <p className="empty-subtitle">New reports will appear here once published.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>RPT-{report.id}</td>
                    <td>{report.date ? new Date(report.date).toLocaleDateString() : "-"}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Teleconsultation = () => (
  <div className="dashboard-content">
    <div className="page-header">
      <h1 className="page-title">Teleconsultation</h1>
      <p className="page-subtitle">Connect with doctors through video consultation</p>
    </div>
    <div className="content-card">
      <div className="empty-state">
        <p>💻 Online consultation feature</p>
        <p className="empty-subtitle">This feature is coming soon</p>
      </div>
    </div>
  </div>
);

const Billing = () => (
  <div className="dashboard-content">
    <div className="page-header">
      <h1 className="page-title">Billing & Payments</h1>
      <p className="page-subtitle">View bills and manage payments</p>
    </div>
    <div className="content-card">
      <div className="empty-state">
        <p>💳 Your billing history will appear here</p>
        <p className="empty-subtitle">This feature is coming soon</p>
      </div>
    </div>
  </div>
);

const PatientDashboard = () => {
  return (
    <div className="patient-dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="teleconsultation" element={<Teleconsultation />} />
          <Route path="billing" element={<Billing />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientDashboard;

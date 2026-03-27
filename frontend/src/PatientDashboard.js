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
  fetchTelemedicineSessions,
  submitTelemedicineRequest,
} from "./api";

const getStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "accepted") return "status-accepted";
  if (normalized === "completed") return "status-completed";
  if (normalized === "rejected") return "status-rejected";
  return "status-scheduled";
};

const extractSessionTime = (session) => {
  const fromPrescription = String(session?.prescription || "").match(/(\d{1,2}:\d{2})/);
  return fromPrescription ? fromPrescription[1] : "-";
};

const isPrescriptionReport = (report) => String(report?.reportType || "").toUpperCase() === "PRESCRIPTION";

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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const loadPrescriptions = async () => {
      setLoadingPrescriptions(true);
      const res = await fetchReports();
      if (mounted) {
        const allReports = Array.isArray(res?.data) ? res.data : [];
        setPrescriptions(allReports.filter(isPrescriptionReport));
        setLoadingPrescriptions(false);
      }
    };
    loadPrescriptions();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">My Prescriptions</h1>
        <p className="page-subtitle">View your current and past prescriptions</p>
      </div>
      <div className="content-card">
        {loadingPrescriptions ? (
          <div className="empty-state">
            <p>Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <p>💊 No prescriptions available</p>
            <p className="empty-subtitle">Doctor prescriptions will appear here once published.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((report) => (
                  <tr key={report.id}>
                    <td>PRX-{report.id}</td>
                    <td>{report.date ? new Date(report.date).toLocaleDateString() : "-"}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(report.status)}`}>
                        {report.status || "PENDING"}
                      </span>
                    </td>
                    <td>{report.notes || "-"}</td>
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

const Reports = () => {
  const [reports, setReports] = React.useState([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const loadReports = async () => {
      setLoadingReports(true);
      const res = await fetchReports();
      if (mounted) {
        const allReports = Array.isArray(res?.data) ? res.data : [];
        setReports(allReports.filter((report) => !isPrescriptionReport(report)));
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

const Teleconsultation = () => {
  const [sessions, setSessions] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    D_ID: "",
    date: "",
    requestedTime: "",
    transactionId: "",
  });
  const [loading, setLoading] = React.useState(true);
  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === String(form.D_ID));

  React.useEffect(() => {
    let mounted = true;

    const loadSessions = async () => {
      setLoading(true);
      const [sessionsRes, doctorsRes] = await Promise.all([
        fetchTelemedicineSessions(),
        fetchDoctors(),
      ]);
      if (mounted) {
        setSessions(Array.isArray(sessionsRes?.data) ? sessionsRes.data : []);
        setDoctors(Array.isArray(doctorsRes?.data) ? doctorsRes.data : []);
        setLoading(false);
      }
    };

    loadSessions();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!form.D_ID || !form.date || !form.transactionId.trim()) {
      alert("Please select doctor, preferred date, and transaction ID.");
      return;
    }

    setSubmitting(true);
    const result = await submitTelemedicineRequest({
      D_ID: Number(form.D_ID),
      date: form.date,
      requestedTime: form.requestedTime || null,
      transactionId: form.transactionId.trim(),
    });
    setSubmitting(false);

    if (!result?.success) {
      alert(result?.message || "Failed to submit payment request.");
      return;
    }

    alert("Payment request submitted. Staff will verify and then forward to doctor.");
    setForm({ D_ID: "", date: "", requestedTime: "", transactionId: "" });

    const sessionsRes = await fetchTelemedicineSessions();
    setSessions(Array.isArray(sessionsRes?.data) ? sessionsRes.data : []);
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Teleconsultation</h1>
        <p className="page-subtitle">Pay by bKash, submit transaction ID, then staff verification and doctor scheduling</p>
      </div>

      <div className="content-card teleconsultation-request-card">
        <div className="teleconsultation-request-head">
          <h3>Request Online Session</h3>
          <p>Complete payment first, then submit your request for staff verification.</p>
        </div>

        <div className="teleconsultation-payment-box">
          <span className="payment-label">bKash Payment Number</span>
          <strong className="payment-number">01978896352</strong>
          <span className="payment-note">Use this number to pay and keep your transaction ID.</span>
        </div>

        <form className="teleconsultation-request-form" onSubmit={handleSubmitRequest}>
          <div className="form-grid teleconsultation-grid">
            <div className="form-group full-width">
              <label>Doctor</label>
              <select
                value={form.D_ID}
                onChange={(e) => setForm((prev) => ({ ...prev, D_ID: e.target.value }))}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name || `Dr. #${doctor.id}`}
                    {doctor.department ? ` - ${doctor.department}` : ""}
                  </option>
                ))}
              </select>
              {selectedDoctor ? (
                <span className="field-hint">
                  Department: {selectedDoctor.department || "Not specified"}
                </span>
              ) : null}
            </div>

            <div className="form-group">
              <label>Preferred Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Preferred Time (Optional)</label>
              <input
                type="time"
                value={form.requestedTime}
                onChange={(e) => setForm((prev) => ({ ...prev, requestedTime: e.target.value }))}
              />
            </div>

            <div className="form-group full-width">
              <label>bKash Transaction ID</label>
              <input
                type="text"
                placeholder="Example: 9H6K8J2P"
                value={form.transactionId}
                onChange={(e) => setForm((prev) => ({ ...prev, transactionId: e.target.value.toUpperCase() }))}
                required
              />
              <span className="field-hint">Staff will verify this transaction before sending your request to doctor.</span>
            </div>
          </div>

          <div className="teleconsultation-actions">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Payment Request"}
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="empty-state">
            <p>Loading teleconsultation sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No online sessions scheduled yet.</p>
            <p className="empty-subtitle">Once doctor schedules a session, date/time/link will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Transaction ID</th>
                  <th>Payment Status</th>
                  <th>Request Status</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Video Link</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td>TEL-{session.id}</td>
                    <td>{session?.Doctor?.User?.name || `Dr. #${session.D_ID || "-"}`}</td>
                    <td>{session?.Doctor?.Department?.name || session?.Doctor?.department || "-"}</td>
                    <td>{session.transactionId || "-"}</td>
                    <td>{session.paymentStatus || "PENDING"}</td>
                    <td>{session.requestStatus || "PAYMENT_SUBMITTED"}</td>
                    <td>{session.date ? new Date(session.date).toLocaleDateString() : "-"}</td>
                    <td>{extractSessionTime(session)}</td>
                    <td>
                      {session.media ? (
                        <a href={session.media} target="_blank" rel="noreferrer">Open Session Link</a>
                      ) : (
                        "Not available"
                      )}
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

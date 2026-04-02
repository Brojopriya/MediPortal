import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
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
  submitPatientFeedback,
  submitTelemedicineRequest,
} from "./api";

const parseTimeToMinutes = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = (match[3] || "").toLowerCase();

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    return null;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    if (meridiem === "pm" && hour !== 12) {
      hour += 12;
    }
    if (meridiem === "am" && hour === 12) {
      hour = 0;
    }
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return (hour * 60) + minute;
};

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const parseScheduleRanges = (scheduleText) => {
  if (!scheduleText) {
    return [];
  }

  const normalized = String(scheduleText)
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks = normalized.split(/[;,]/).map((part) => part.trim()).filter(Boolean);
  const ranges = [];

  for (const chunk of chunks) {
    const tokens = chunk.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi) || [];
    if (tokens.length < 2) {
      continue;
    }

    const start = parseTimeToMinutes(tokens[0]);
    const end = parseTimeToMinutes(tokens[1]);
    if (start === null || end === null || start > end) {
      continue;
    }

    ranges.push({ start, end });
  }

  return ranges;
};

const buildTimeSlots = (ranges, stepMinutes = 30) => {
  const slots = [];
  for (const range of ranges) {
    for (let current = range.start; current <= range.end; current += stepMinutes) {
      slots.push(formatMinutes(current));
    }
  }
  return [...new Set(slots)];
};

const getReportType = (report) => String(report?.reportType || "").trim().toUpperCase();

const isPrescriptionReport = (report) => {
  const type = getReportType(report);
  return type.includes("PRESCRIPTION") || type === "RX";
};

const formatReportTypeLabel = (reportType) => {
  const normalized = String(reportType || "").trim();
  if (!normalized) {
    return "Lab Report";
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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
          <button onClick={() => navigate("/PatientDashboard/feedback")} className="action-btn">
            <span className="action-icon">📝</span>
            <span>System Feedback</span>
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
  const selectedDoctor = React.useMemo(
    () => doctors.find((doctor) => String(doctor.id) === String(form.D_ID)),
    [doctors, form.D_ID]
  );
  const selectedDoctorName = selectedDoctor?.name || (form.D_ID ? `Doctor #${form.D_ID}` : "");
  const selectedDoctorAvailability = String(
    selectedDoctor?.availableTime || selectedDoctor?.timeSchedule || selectedDoctor?.availableTime || ""
  ).trim();
  const availableTimeSlots = React.useMemo(
    () => buildTimeSlots(parseScheduleRanges(selectedDoctorAvailability)),
    [selectedDoctorAvailability]
  );

  const loadAppointments = React.useCallback(() => {
    fetchMyAppointments().then((res) => {
      setAppointments(Array.isArray(res?.data) ? res.data : []);
    });
  }, []);

  React.useEffect(() => {
    loadAppointments();
    fetchDoctors().then((res) => setDoctors(Array.isArray(res?.data) ? res.data : []));
  }, [loadAppointments]);

  React.useEffect(() => {
    if (!availableTimeSlots.length) {
      setForm((prev) => ({ ...prev, time: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      time: availableTimeSlots.includes(prev.time) ? prev.time : "",
    }));
  }, [availableTimeSlots]);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await bookAppointment({
      D_ID: Number(form.D_ID),
      date: form.date,
      time: form.time || null,
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
              {selectedDoctorName ? (
                <p className="empty-subtitle" style={{ textAlign: "left", marginTop: 8 }}>
                  {selectedDoctorName}{selectedDoctorAvailability ? ` · Available time: ${selectedDoctorAvailability}` : ""}
                </p>
              ) : null}
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
              <label>Preferred Time (Optional)</label>
              <select
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                disabled={!form.D_ID}
              >
                <option value="">{form.D_ID ? "No preferred time" : "Select a doctor first"}</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {form.D_ID && !availableTimeSlots.length ? (
                <p className="empty-subtitle" style={{ textAlign: "left", marginTop: 8 }}>
                  This doctor has not configured slots yet. You can still continue without preferred time.
                </p>
              ) : null}
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
                  <th>Doctor Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id}>
                    <td><span className="badge">{item.doctorName || item.doctor?.name || `Dr. #${item.D_ID}`}</span></td>
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

const MedicalRecords = () => {
  const [appointments, setAppointments] = React.useState([]);
  const [doctors, setDoctors] = React.useState([]);
  const [loadingRecords, setLoadingRecords] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadMedicalRecords = async () => {
      setLoadingRecords(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetchMyAppointments(),
        fetchDoctors(),
      ]);

      if (!mounted) {
        return;
      }

      setAppointments(Array.isArray(appointmentsRes?.data) ? appointmentsRes.data : []);
      setDoctors(Array.isArray(doctorsRes?.data) ? doctorsRes.data : []);
      setLoadingRecords(false);
    };

    loadMedicalRecords();
    return () => {
      mounted = false;
    };
  }, []);

  const getDoctorName = React.useCallback((doctorId) => {
    const doctor = doctors.find((entry) => String(entry?.id) === String(doctorId));
    if (doctor?.name) {
      return doctor.name;
    }
    return doctorId ? `Dr. #${doctorId}` : "Doctor Not Assigned";
  }, [doctors]);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Medical Records</h1>
        <p className="page-subtitle">Your appointment history with doctor and date details</p>
      </div>

      <div className="content-card compact-card">
        <h3 className="card-title">Appointment Summary</h3>
        <p className="next-appointment-text">
          Total Appointments Taken: <strong>{loadingRecords ? "..." : appointments.length}</strong>
        </p>
      </div>

      <div className="content-card">
        <h3 className="card-title">Appointment Records</h3>
        {loadingRecords ? (
          <div className="empty-state">
            <p>Loading medical records...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found</p>
            <p className="empty-subtitle">Your doctor visit history will appear here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.doctorName || getDoctorName(appointment.D_ID)}</td>
                    <td>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "-"}</td>
                    <td>{appointment.time || "-"}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                        {appointment.status || "SCHEDULED"}
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

const Prescriptions = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(true);

  const resolveDoctorName = React.useCallback((report) => {
    if (report?.doctorName || report?.doctor || report?.doctor_full_name) {
      return report?.doctorName || report?.doctor || report?.doctor_full_name;
    }

    const doctorId = report?.D_ID ?? report?.doctorId ?? report?.Doctor_ID ?? null;
    if (doctorId) {
      return `Dr. #${doctorId}`;
    }

    if (report?.createdBy) {
      return String(report.createdBy);
    }

    if (report?.staffName) {
      return String(report.staffName);
    }

    if (report?.doctorName) {
      return report.doctorName;
    }

    return "Doctor Name Not Available";
  }, []);

  const resolveHospitalName = React.useCallback((report) => {
    if (report?.hospitalName || report?.hospital || report?.hospital_name) {
      return report?.hospitalName || report?.hospital || report?.hospital_name;
    }
    return "MediPortal Hospital";
  }, []);

  const resolveDoctorDepartment = React.useCallback((report) => {
    if (report?.doctorDepartment || report?.department || report?.doctor_department) {
      return report?.doctorDepartment || report?.department || report?.doctor_department;
    }
    return "Department Not Available";
  }, []);

  const downloadPrescriptionPdf = React.useCallback((report) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const doctorName = resolveDoctorName(report);
    const doctorDepartment = resolveDoctorDepartment(report);
    const hospitalName = resolveHospitalName(report);
    const prescriptionId = `PRX-${report.id}`;
    const issuedDate = report?.date ? new Date(report.date).toLocaleDateString() : "-";
    const patientName = user?.name || "Patient";
    const notes = report?.notes || "No clinical notes provided.";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Medical Prescription", 40, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Hospital: ${hospitalName}`, 40, 74);
    doc.text(`Prescription ID: ${prescriptionId}`, 40, 92);
    doc.text(`Date: ${issuedDate}`, 320, 92);

    doc.setDrawColor(24, 74, 117);
    doc.line(40, 104, 555, 104);

    doc.text(`Patient Name: ${patientName}`, 40, 130);
    doc.text(`Doctor Name: ${doctorName}`, 40, 148);
    doc.text(`Department: ${doctorDepartment}`, 40, 166);
    doc.text(`Type: ${String(report?.reportType || "PRESCRIPTION").toUpperCase()}`, 40, 184);

    doc.setFont("helvetica", "bold");
    doc.text("Prescription Details", 40, 214);
    doc.setFont("helvetica", "normal");

    const wrappedNotes = doc.splitTextToSize(notes, 500);
    doc.text(wrappedNotes, 40, 236);

    doc.setFontSize(10);
    doc.text("This document was generated from MediPortal Patient Dashboard.", 40, 780);

    doc.save(`${prescriptionId}.pdf`);
  }, [resolveDoctorDepartment, resolveDoctorName, resolveHospitalName, user?.name]);

  React.useEffect(() => {
    let mounted = true;
    const loadPrescriptions = async () => {
      setLoadingPrescriptions(true);
      const reportsRes = await fetchReports();

      if (mounted) {
        const allReports = Array.isArray(reportsRes?.data) ? reportsRes.data : [];
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
        <p className="page-subtitle">Professional prescriptions from your doctor, with downloadable PDF copies</p>
      </div>
      <div className="content-card">
        {!loadingPrescriptions && prescriptions.length > 0 && (
          <div className="prescriptions-summary" aria-label="Prescription summary">
            <div className="prescription-summary-item">
              <span className="summary-label">Total Prescriptions</span>
              <span className="summary-value">{prescriptions.length}</span>
            </div>
            <div className="prescription-summary-item">
              <span className="summary-label">Latest Issued</span>
              <span className="summary-value">
                {prescriptions[0]?.date ? new Date(prescriptions[0].date).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        )}

        {loadingPrescriptions ? (
          <div className="empty-state">
            <p>Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <p>No prescriptions available</p>
            <p className="empty-subtitle">Doctor prescriptions will appear here once published.</p>
          </div>
        ) : (
          <div className="prescription-list">
            {prescriptions.map((report) => (
              <article key={report.id} className="prescription-sheet">
                <div className="prescription-sheet-head">
                  <div>
                    <h3>Medical Prescription</h3>
                    <p>{resolveHospitalName(report)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary prescription-download-btn"
                    onClick={() => downloadPrescriptionPdf(report)}
                  >
                    Download PDF
                  </button>
                </div>

                <div className="prescription-meta-grid">
                  <div className="prescription-meta-item">
                    <span className="meta-label">Prescription ID</span>
                    <span className="meta-value">PRX-{report.id}</span>
                  </div>
                  <div className="prescription-meta-item">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{report.date ? new Date(report.date).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="prescription-meta-item">
                    <span className="meta-label">Doctor Name</span>
                    <span className="meta-value">{resolveDoctorName(report)}</span>
                  </div>
                  <div className="prescription-meta-item">
                    <span className="meta-label">Doctor Department</span>
                    <span className="meta-value">{resolveDoctorDepartment(report)}</span>
                  </div>
                  <div className="prescription-meta-item">
                    <span className="meta-label">Hospital Name</span>
                    <span className="meta-value">{resolveHospitalName(report)}</span>
                  </div>
                </div>

                <div className="prescription-body">
                  <h4>Prescription Details</h4>
                  <p>{report.notes || "No clinical notes provided."}</p>
                </div>
              </article>
            ))}
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
        const labReports = allReports.filter((report) => !isPrescriptionReport(report));
        setReports(labReports.length ? labReports : allReports);
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
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>RPT-{report.id}</td>
                    <td>{formatReportTypeLabel(report.reportType)}</td>
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

const Feedback = () => {
  const [submitting, setSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [form, setForm] = React.useState({
    category: "GENERAL",
    rating: "5",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedMessage = form.message.trim();
    if (!trimmedMessage) {
      setNotice("Please write your feedback before submitting.");
      return;
    }

    setSubmitting(true);
    const payload = {
      category: form.category,
      rating: Number(form.rating),
      message: trimmedMessage,
    };

    const result = await submitPatientFeedback(payload);
    if (!result?.success) {
      setSubmitting(false);
      setNotice(result?.message || "Unable to submit feedback right now.");
      return;
    }

    setForm({ category: "GENERAL", rating: "5", message: "" });
    setNotice("Thanks for your feedback. It will be shown on the home page.");
    setSubmitting(false);
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">System Feedback</h1>
        <p className="page-subtitle">Share your experience to help us improve the patient portal</p>
      </div>

      <div className="content-card feedback-card">
        <h3 className="card-title">Provide Feedback</h3>
        <form className="form-grid feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="GENERAL">General</option>
              <option value="UI_UX">Design & Usability</option>
              <option value="PERFORMANCE">Performance</option>
              <option value="BUG">Bug Report</option>
              <option value="FEATURE">Feature Request</option>
            </select>
          </div>

          <div className="form-group">
            <label>Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Needs Improvement</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Message</label>
            <textarea
              placeholder="Tell us what is working well and what needs improvement..."
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              required
            />
          </div>

          <div className="feedback-actions">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>

        {notice ? <p className="feedback-notice">{notice}</p> : null}
      </div>
    </div>
  );
};

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
          <Route path="feedback" element={<Feedback />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientDashboard;

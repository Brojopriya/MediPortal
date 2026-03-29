import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./nurse/Sidebar";
import Profile from "./nurse/Profile";
import {
  fetchNurseDashboardSummary,
  fetchNursePatients,
  fetchNurseSchedule,
} from "./api";
import Telemedicine from "./nurse/Telemedicine";
import "./NurseDashboard.css";

const EmptyState = ({ title, message }) => (
  <div className="nurse-empty-state">
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

const DashboardHome = () => {
  const [summary, setSummary] = useState({
    assignedPatients: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchNurseDashboardSummary()
      .then((res) => {
        if (res?.success && res?.data) setSummary(res.data);
      })
      .catch(() => null);
  }, []);

  return (
    <div className="nurse-page dashboard-home">
      <div className="nurse-page-header">
        <h2>Nurse Operations Dashboard</h2>
        <p>Clinical workload, patient coordination, and shift indicators.</p>
      </div>
      <div className="overview-cards">
        <div className="card">
          <h3>Assigned Patients</h3>
          <p>{summary.assignedPatients}</p>
        </div>
        <div className="card">
          <h3>Appointments Today</h3>
          <p>{summary.appointmentsToday}</p>
        </div>
        <div className="card">
          <h3>Pending Appointments</h3>
          <p>{summary.pendingAppointments}</p>
        </div>
        <div className="card">
          <h3>Completed Appointments</h3>
          <p>{summary.completedAppointments}</p>
        </div>
        <div className="card">
          <h3>Pending Reports</h3>
          <p>{summary.pendingReports}</p>
        </div>
      </div>
    </div>
  );
};

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchNursePatients()
      .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPatients([]));
  }, []);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>My Patients</h2>
        <p>Patients currently mapped to your nursing assignment.</p>
      </div>
      {!patients.length ? (
        <EmptyState title="No Assigned Patients" message="Admin can map patients to your account from nurse-patient assignments." />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Last Visit</th>
              <th>Last Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.name || `Patient #${p.id}`}</td>
                <td>{p.email || "-"}</td>
                <td>{p.phone || "-"}</td>
                <td>{p.gender || "-"}</td>
                <td>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "-"}</td>
                <td>{p.lastAppointmentStatus || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Schedule = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchNurseSchedule()
      .then((res) => setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>Upcoming Schedule</h2>
        <p>Appointments for your assigned patients.</p>
      </div>
      {!items.length ? (
        <EmptyState title="No Upcoming Appointments" message="There are no future appointments for your assigned patients." />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Doctor ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                <td>{item.time || "-"}</td>
                <td>{item.patientName || `Patient #${item.patientId}`}</td>
                <td>{item.status || "-"}</td>
                <td>{item.doctorId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const WardManagement = () => (
  <div className="nurse-page">
    <div className="nurse-page-header">
      <h2>Ward Management</h2>
      <p>Use My Patients and Schedule sections to coordinate care in your ward.</p>
    </div>
    <EmptyState title="Ward Tools Coming Soon" message="Bed management and room-level tracking can be added next." />
  </div>
);

const Medication = () => (
  <div className="nurse-page">
    <div className="nurse-page-header">
      <h2>Medication Administration</h2>
      <p>Track medication rounds for your assigned patients.</p>
    </div>
    <EmptyState title="Medication Module Pending" message="Medication charting APIs are not yet connected in this release." />
  </div>
);

const VitalSigns = () => (
  <div className="nurse-page">
    <div className="nurse-page-header">
      <h2>Vital Signs Monitoring</h2>
      <p>Capture and monitor patient vitals over time.</p>
    </div>
    <EmptyState title="Vitals Module Pending" message="Vitals recording endpoints can be added when diagnosis charting is finalized." />
  </div>
);

const Reports = () => (
  <div className="nurse-page">
    <div className="nurse-page-header">
      <h2>Nursing Reports</h2>
      <p>Report summaries currently reflect pending report counts in the dashboard.</p>
    </div>
    <EmptyState title="Detailed Reports View Pending" message="Detailed nurse report creation can be wired to the Report module next." />
  </div>
);

const NurseDashboard = () => {
  return (
    <div className="nurse-dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="patients" element={<Patients />} />
          <Route path="ward-management" element={<WardManagement />} />
          <Route path="medication" element={<Medication />} />
          <Route path="vital-signs" element={<VitalSigns />} />
          <Route path="reports" element={<Reports />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="telemedicine" element={<Telemedicine />} />
        </Routes>
      </main>
    </div>
  );
};

export default NurseDashboard;

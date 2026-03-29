import React, { useState, useEffect } from "react";
import { fetchNurseOperationsContext, fetchNursePatients } from "../api";
import "../NurseDashboard.css";

const Schedule = () => {
  const [operations, setOperations] = useState({
    assignment: {
      assignmentComplete: false,
      departmentId: null,
      departmentName: null,
      wardId: null,
      wardLabel: null,
      wardCapacity: null,
      shift: null,
    },
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchNurseOperationsContext(), fetchNursePatients()])
      .then(([opsRes, patientsRes]) => {
        if (opsRes?.success && opsRes?.data) {
          setOperations(opsRes.data);
        } else {
          setError("Failed to load assignment information");
        }
        if (patientsRes?.success && Array.isArray(patientsRes?.data)) {
          setPatients(patientsRes.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching schedule:", err);
        setError("Unable to fetch schedule details");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>My Schedule</h2>
        </div>
        <p className="muted">Loading schedule information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>My Schedule</h2>
        </div>
        <div className="error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { assignment } = operations;
  const assignmentReady = Boolean(assignment?.assignmentComplete);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>My Schedule</h2>
        <p>Department and ward-based shift and patient overview.</p>
      </div>

      <section className="nurse-summary-grid">
        <article className="nurse-summary-card">
          <span className="summary-label">Department</span>
          <strong className="summary-value">{assignment.departmentName || "Not assigned"}</strong>
        </article>
        <article className="nurse-summary-card">
          <span className="summary-label">Ward</span>
          <strong className="summary-value">{assignment.wardLabel || "Not assigned"}</strong>
        </article>
        <article className="nurse-summary-card">
          <span className="summary-label">Patients</span>
          <strong className="summary-value">{patients.length}</strong>
        </article>
      </section>

      {/* My Schedule / Assignment Section */}
      <section className="nurse-schedule-section">
        <div className="schedule-card assignment-card">
          <div className="card-header">
            <h3>Assignment Details</h3>
          </div>
          <div className="card-content">
            {!assignmentReady ? (
              <div className="warning-box">
                Incomplete assignment
                <p>Admin must assign you to a department and ward. Please contact administrator.</p>
              </div>
            ) : (
              <div className="assignment-details">
                <div className="detail-row">
                  <label>Department:</label>
                  <span className="detail-value department-badge">
                    {assignment.departmentName || "—"}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Ward:</label>
                  <span className="detail-value ward-badge">
                    {assignment.wardLabel || "—"}
                  </span>
                </div>
                {assignment.wardCapacity && (
                  <div className="detail-row">
                    <label>Ward Beds:</label>
                    <span className="detail-value">{assignment.wardCapacity}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>Shift:</label>
                  <span className="detail-value shift-badge">
                    {assignment.shift || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* My Patients Section */}
      {patients.length > 0 && (
        <section className="nurse-schedule-section">
          <div className="schedule-card patients-card">
            <div className="card-header">
              <h3>Patients In My Assignment</h3>
              <p className="card-subtitle">{patients.length} assigned</p>
            </div>
            <div className="card-content">
              <div className="table-wrapper">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Gender</th>
                      <th>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id}>
                        <td className="patient-name">{p.name || `Patient #${p.id}`}</td>
                        <td>{p.email || "—"}</td>
                        <td>
                          {p.phone ? (
                            <a href={`tel:${p.phone}`} className="call-button">
                              📞 {p.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{p.gender || "—"}</td>
                        <td className="schedule-cell">
                          {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {!patients.length && (
        <section className="nurse-schedule-section">
          <div className="empty-state">
            <p>No patients are assigned to this nurse yet.</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Schedule;

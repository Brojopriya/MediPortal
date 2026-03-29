import React, { useEffect, useState } from "react";
import { fetchNursePatients } from "../api";
import "../NurseDashboard.css";

const AssignedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNursePatients()
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          setPatients(res.data);
        } else {
          setError("Unable to load assigned patients");
        }
      })
      .catch((err) => {
        console.error("Error fetching assigned patients:", err);
        setError("Unable to load assigned patients");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>Assigned Patients List</h2>
        </div>
        <p className="muted">Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>Assigned Patients List</h2>
        </div>
        <div className="error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>Assigned Patients List</h2>
        <p>All patients currently mapped to this nurse account.</p>
      </div>

      <section className="nurse-summary-grid">
        <article className="nurse-summary-card">
          <span className="summary-label">Actual Patient Number</span>
          <strong className="summary-value">{patients.length}</strong>
        </article>
      </section>

      <section className="nurse-schedule-section">
        <div className="schedule-card patients-card">
          <div className="card-header">
            <h3>Patient Directory</h3>
            <p className="card-subtitle">Details and last visit information</p>
          </div>
          <div className="card-content">
            {!patients.length ? (
              <div className="inline-empty">No patients are assigned to this nurse yet.</div>
            ) : (
              <div className="table-wrapper">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Email</th>
                      <th>Patient Number</th>
                      <th>Gender</th>
                      <th>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="patient-name">{patient.name || `Patient #${patient.id}`}</td>
                        <td>{patient.email || "-"}</td>
                        <td>{patient.phone || "-"}</td>
                        <td>{patient.gender || "-"}</td>
                        <td className="schedule-cell">
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssignedPatients;

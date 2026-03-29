import React, { useEffect, useState } from "react";
import { fetchNurseOperationsContext, fetchNursePatients } from "../api";
import "../NurseDashboard.css";

const DepartmentContacts = () => {
  const [operations, setOperations] = useState({
    assignment: {
      departmentName: null,
    },
    emergencySectors: [],
    departmentDoctors: [],
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
          setError("Unable to load department contacts");
        }

        if (patientsRes?.success && Array.isArray(patientsRes?.data)) {
          setPatients(patientsRes.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching department contacts:", err);
        setError("Unable to load department contacts");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>Department Contacts</h2>
        </div>
        <p className="muted">Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nurse-page">
        <div className="nurse-page-header">
          <h2>Department Contacts</h2>
        </div>
        <div className="error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { assignment, emergencySectors, departmentDoctors } = operations;

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>Department Contacts</h2>
        <p>Doctors and emergency sectors for your hospital assignment.</p>
      </div>

      <section className="nurse-summary-grid">
        <article className="nurse-summary-card">
          <span className="summary-label">Department</span>
          <strong className="summary-value">{assignment.departmentName || "Not assigned"}</strong>
        </article>
        <article className="nurse-summary-card">
          <span className="summary-label">Actual Patient Number</span>
          <strong className="summary-value">{patients.length}</strong>
        </article>
        <article className="nurse-summary-card">
          <span className="summary-label">Doctors</span>
          <strong className="summary-value">{departmentDoctors.length}</strong>
        </article>
        <article className="nurse-summary-card">
          <span className="summary-label">Emergency Sectors</span>
          <strong className="summary-value">{emergencySectors.length}</strong>
        </article>
      </section>

      <section className="nurse-schedule-section">
        <div className="schedule-card doctors-card">
          <div className="card-header">
            <h3>Doctors In {assignment.departmentName || "Department"}</h3>
            <p className="card-subtitle">All doctors with direct phone numbers</p>
          </div>
          <div className="card-content">
            {!departmentDoctors.length ? (
              <div className="inline-empty">No doctors found for this department.</div>
            ) : (
              <div className="table-wrapper">
                <table className="doctors-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialty</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentDoctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td className="doctor-name">{doctor.name}</td>
                        <td>{doctor.specialty || "-"}</td>
                        <td>
                          {doctor.phone ? (
                            <a
                              href={`tel:${doctor.phone}`}
                              className="call-button doctor-call"
                              title={`Call ${doctor.name}`}
                            >
                              {doctor.phone}
                            </a>
                          ) : (
                            <span className="no-contact">No phone number</span>
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
      </section>

      <section className="nurse-schedule-section">
        <div className="schedule-card emergency-card">
          <div className="card-header">
            <h3>Hospital Emergency Sectors</h3>
            <p className="card-subtitle">Direct call for emergency support</p>
          </div>
          <div className="card-content">
            {!emergencySectors.length ? (
              <div className="inline-empty">No emergency sector data found for this hospital.</div>
            ) : (
              <div className="contacts-list">
                {emergencySectors.map((sector) => (
                  <div key={sector.id} className="contact-item emergency-item">
                    <div className="contact-info">
                      <strong className="contact-name">{sector.name}</strong>
                      <span className="contact-phone">Emergency: {sector.callNumber}</span>
                    </div>
                    <a
                      href={`tel:${sector.callNumber}`}
                      className="call-button emergency-call"
                      title="Call Emergency Sector"
                    >
                      Call Now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DepartmentContacts;

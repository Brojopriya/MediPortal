import React, { useEffect, useState } from "react";
import { fetchNursePatients } from "../api";

const AssignedPatients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchNursePatients()
      .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPatients([]));
  }, []);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>Assigned Patients</h2>
        <p>Patients assigned to your department scope.</p>
      </div>

      {!patients.length ? (
        <p>No assigned patients found in your department.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Last Visit</th>
              <th>Last Appointment Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name || `Patient #${patient.id}`}</td>
                <td>{patient.email || "-"}</td>
                <td>{patient.phone || "-"}</td>
                <td>{patient.gender || "-"}</td>
                <td>{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "-"}</td>
                <td>{patient.lastAppointmentStatus || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssignedPatients;

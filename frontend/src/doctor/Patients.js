import React, { useEffect, useState } from "react";
import { fetchDoctorPatients } from "../api";

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchDoctorPatients()
      .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPatients([]));
  }, []);

  return (
    <div className="patients-page">
      <h2>My Patients</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Last Visit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.email || "-"}</td>
              <td>{p.phone}</td>
              <td>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "-"}</td>
              <td>
                <button onClick={() => window.location.href = `/DoctorDashboard/prescriptions?patientId=${p.id}`}>
                  Add Note
                </button>
                <button onClick={() => alert(`Viewing medical history for ${p.name}`)}>
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;

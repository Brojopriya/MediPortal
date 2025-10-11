// dashboard/Appointments.js
import React, { useState, useEffect } from "react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch("/api/doctor/appointments")
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(() => setAppointments([]));
  }, []);

  return (
    <div className="appointments-page">
      <h2>My Appointments</h2>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date / Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>{a.patientName}</td>
              <td>{a.datetime}</td>
              <td>{a.status}</td>
              <td>
                <button>View</button>
                <button>Complete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;

import React, { useEffect, useState } from "react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch("/api/appointments/staff") // backend endpoint for this staff
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  const handleStatus = (id, status) => {
    fetch(`/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(() =>
      setAppointments(appointments.map(app => (app.id === id ? { ...app, status } : app)))
    );
  };

  return (
    <div>
      <h2>Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments assigned</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id}>
                <td>{app.patientName}</td>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.status}</td>
                <td>
                  <button onClick={() => handleStatus(app.id, "Accepted")}>Accept</button>
                  <button onClick={() => handleStatus(app.id, "Rejected")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Appointments;

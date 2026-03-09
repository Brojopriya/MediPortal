import React, { useEffect, useState } from "react";
import { fetchAllAppointments } from "../api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAllAppointments()
      .then((data) => setAppointments(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setAppointments([]));
  }, []);

  const handleStatus = (id, status) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5001/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
                <td>{app.P_ID || "-"}</td>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.status || "SCHEDULED"}</td>
                <td>
                  <button onClick={() => handleStatus(app.id, "ACCEPTED")}>Accept</button>
                  <button onClick={() => handleStatus(app.id, "REJECTED")}>Reject</button>
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

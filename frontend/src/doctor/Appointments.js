// dashboard/Appointments.js
import React, { useState, useEffect } from "react";
import { createReport, fetchDoctorAppointments, startTelemedicineSession } from "../api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDoctorAppointments()
      .then((res) => setAppointments(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setAppointments([]));
  }, []);

  const handleStartTelemedicine = async (appointment) => {
    const result = await startTelemedicineSession({
      D_ID: appointment.D_ID,
      P_ID: appointment.P_ID,
      date: appointment.date,
      media: "Video",
      prescription: "Follow telemedicine instructions",
    });
    alert(result?.success ? "Telemedicine session created." : result?.message || "Failed to create session.");
  };

  const handleRecommendTest = async (appointment) => {
    const result = await createReport({
      date: new Date().toISOString().slice(0, 10),
      P_ID: appointment.P_ID,
      Test_ID: null,
      S_ID: null,
    });
    alert(result?.success ? "Test recommendation/report request sent." : result?.message || "Failed to recommend test.");
  };

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
              <td>{a.P_ID || "-"}</td>
              <td>{`${a.date || "-"} ${a.time || ""}`}</td>
              <td>{a.status || "SCHEDULED"}</td>
              <td>
                <button onClick={() => handleStartTelemedicine(a)}>Telemedicine</button>
                <button onClick={() => handleRecommendTest(a)}>Recommend Test</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;

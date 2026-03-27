// dashboard/Appointments.js
import React, { useState, useEffect } from "react";
import {
  createReport,
  fetchDoctorAppointments,
  updateAppointmentById,
} from "../api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = () => {
    fetchDoctorAppointments()
      .then((res) => setAppointments(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setAppointments([]));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleRecommendTest = async (appointment) => {
    const result = await createReport({
      date: new Date().toISOString().slice(0, 10),
      P_ID: appointment.P_ID,
      Test_ID: null,
      S_ID: null,
    });
    alert(result?.success ? "Test recommendation/report request sent." : result?.message || "Failed to recommend test.");
  };

  const handleStatusUpdate = async (appointment, status) => {
    const result = await updateAppointmentById(appointment.id, { status });
    if (!result?.success) {
      alert(result?.message || "Failed to update appointment status.");
      return;
    }
    loadAppointments();
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
              <td>{a.patientName || (a.P_ID ? `Patient #${a.P_ID}` : "-")}</td>
              <td>{`${a.date || "-"} ${a.time || ""}`}</td>
              <td>{a.status || "SCHEDULED"}</td>
              <td>
                <button onClick={() => handleStatusUpdate(a, "ACCEPTED")}>Accept</button>
                <button onClick={() => handleStatusUpdate(a, "COMPLETED")}>Complete</button>
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

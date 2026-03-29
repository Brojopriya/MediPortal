import React, { useEffect, useState } from "react";
import { fetchNurseSchedule } from "../api";

const Schedule = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNurseSchedule()
      .then((res) => {
        if (!res?.success) {
          setError(res?.message || "Failed to load nurse schedule.");
          setItems([]);
          return;
        }
        setError("");
        setItems(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        setError("Failed to load nurse schedule.");
        setItems([]);
      });
  }, []);

  return (
    <div className="nurse-page">
      <div className="nurse-page-header">
        <h2>My Schedule</h2>
        <p>Upcoming appointments for assigned patients in your department scope.</p>
      </div>

      {error ? (
        <p>{error}</p>
      ) : !items.length ? (
        <p>No upcoming appointments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                <td>{item.time || "-"}</td>
                <td>{item.patientName || `Patient #${item.patientId || "-"}`}</td>
                <td>{item.doctorName || `Doctor #${item.doctorId || "-"}`}</td>
                <td>{item.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Schedule;

import React, { useEffect, useMemo, useState } from "react";
import { fetchTelemedicineSessions } from "../api";

const extractScheduledTime = (session) => {
  const match = String(session?.prescription || "").match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : "";
};

const Telemedicine = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchTelemedicineSessions();
    setSessions(Array.isArray(res?.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const scheduled = useMemo(
    () => sessions.filter((session) => String(session.requestStatus || "").toUpperCase() === "DOCTOR_SCHEDULED"),
    [sessions]
  );

  return (
    <div className="appointments-page">
      <h2>Telemedicine Sessions</h2>
      <p>View telemedicine sessions for your assigned patients.</p>

      {loading ? (
        <p>Loading sessions...</p>
      ) : scheduled.length === 0 ? (
        <p>No scheduled telemedicine sessions for your assigned patients.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Meeting Link</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduled.map((session) => (
              <tr key={session.id}>
                <td>{session?.PatientUser?.name || `Patient #${session.P_ID || "-"}`}</td>
                <td>{session?.Doctor?.User?.name || `Dr. #${session.D_ID || "-"}`}</td>
                <td>{session.date || "-"}</td>
                <td>{extractScheduledTime(session) || session.requestedTime || "-"}</td>
                <td>
                  {session.media ? (
                    <a href={session.media} target="_blank" rel="noreferrer">
                      Open Link
                    </a>
                  ) : (
                    "Not available"
                  )}
                </td>
                <td>{session.paymentStatus || "PENDING"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Telemedicine;

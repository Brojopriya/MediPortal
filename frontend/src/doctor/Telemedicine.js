import React, { useEffect, useMemo, useState } from "react";
import { fetchTelemedicineSessions, startTelemedicineSession } from "../api";

const extractScheduledTime = (session) => {
  const match = String(session?.prescription || "").match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : "";
};

const Telemedicine = () => {
  const [sessions, setSessions] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadData = async () => {
    const res = await fetchTelemedicineSessions();
    setSessions(Array.isArray(res?.data) ? res.data : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      sessions.forEach((session) => {
        if (!next[session.id]) {
          next[session.id] = {
            date: session.date || new Date().toISOString().slice(0, 10),
            time: extractScheduledTime(session),
            media: session.media || "",
          };
        }
      });
      return next;
    });
  }, [sessions]);

  const pendingForDoctor = useMemo(
    () => sessions.filter((session) => String(session.requestStatus || "").toUpperCase() === "STAFF_APPROVED"),
    [sessions]
  );

  const scheduled = useMemo(
    () => sessions.filter((session) => String(session.requestStatus || "").toUpperCase() === "DOCTOR_SCHEDULED"),
    [sessions]
  );

  const updateDraft = (requestId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSchedule = async (request) => {
    const draft = drafts[request.id] || {};

    if (!draft.date) {
      alert("Please choose session date.");
      return;
    }

    if (!String(draft.media || "").trim()) {
      alert("Please enter video meeting link.");
      return;
    }

    setSavingId(request.id);

    const result = await startTelemedicineSession({
      requestId: request.id,
      date: draft.date,
      media: draft.media,
      prescription: `Telemedicine schedule time: ${draft.time || "N/A"}`,
    });

    setSavingId(null);

    if (!result?.success) {
      alert(result?.message || "Failed to schedule online session.");
      return;
    }

    alert("Online session scheduled successfully.");
    loadData();
  };

  return (
    <div className="appointments-page">
      <h2>Telemedicine</h2>
      <p>Only staff-verified paid requests are shown here for scheduling.</p>

      <h3>Verified Requests Waiting For Schedule</h3>
      {pendingForDoctor.length === 0 ? (
        <p>No verified requests pending for schedule.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Transaction ID</th>
              <th>Preferred Date / Time</th>
              <th>Checked By Staff</th>
              <th>Schedule Session</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingForDoctor.map((request) => (
              <tr key={request.id}>
                <td>{request?.PatientUser?.name || `Patient #${request.P_ID || "-"}`}</td>
                <td>{request.transactionId || "-"}</td>
                <td>{`${request.date || "-"} ${request.requestedTime || ""}`}</td>
                <td>{request?.MedicalStaff?.User?.name || `Staff #${request.S_ID || "-"}`}</td>
                <td>
                  <input
                    type="date"
                    value={drafts[request.id]?.date || ""}
                    onChange={(e) => updateDraft(request.id, "date", e.target.value)}
                  />
                  <input
                    type="time"
                    value={drafts[request.id]?.time || ""}
                    onChange={(e) => updateDraft(request.id, "time", e.target.value)}
                  />
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={drafts[request.id]?.media || ""}
                    onChange={(e) => updateDraft(request.id, "media", e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => handleSchedule(request)} disabled={savingId === request.id}>
                    {savingId === request.id ? "Scheduling..." : "Schedule"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Scheduled Online Sessions</h3>
      {scheduled.length === 0 ? (
        <p>No sessions scheduled yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Video Link</th>
            </tr>
          </thead>
          <tbody>
            {scheduled.map((session) => (
              <tr key={session.id}>
                <td>{session?.PatientUser?.name || `Patient #${session.P_ID || "-"}`}</td>
                <td>{session.date || "-"}</td>
                <td>{extractScheduledTime(session) || "-"}</td>
                <td>
                  {session.media ? (
                    <a href={session.media} target="_blank" rel="noreferrer">Open Link</a>
                  ) : (
                    "Not available"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Telemedicine;

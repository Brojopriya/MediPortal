import React, { useEffect, useState } from "react";
import {
  fetchTelemedicineReviewQueue,
  fetchTelemedicineSessions,
  reviewTelemedicineRequest,
} from "../api";

const Telemedicine = () => {
  const [queue, setQueue] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [queueRes, assignedRes] = await Promise.all([
      fetchTelemedicineReviewQueue(),
      fetchTelemedicineSessions(),
    ]);
    setQueue(Array.isArray(queueRes?.data) ? queueRes.data : []);
    setAssigned(Array.isArray(assignedRes?.data) ? assignedRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (requestId, action) => {
    setUpdatingId(requestId);
    const result = await reviewTelemedicineRequest(requestId, {
      action,
      note: notes[requestId] || "",
    });
    setUpdatingId(null);

    if (!result?.success) {
      alert(result?.message || "Failed to review request.");
      return;
    }

    alert(action === "APPROVE" ? "Request forwarded to doctor." : "Request rejected.");
    loadData();
  };

  return (
    <div className="appointments-page">
      <h2>Telemedicine Payment Review</h2>
      <p>Check payment details and forward verified requests to doctors for session scheduling.</p>

      <h3>Pending Payment Verification</h3>
      {loading ? (
        <p>Loading queue...</p>
      ) : queue.length === 0 ? (
        <p>No pending payment requests.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>bKash Number</th>
              <th>Transaction ID</th>
              <th>Preferred Date / Time</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((request) => (
              <tr key={request.id}>
                <td>{request?.PatientUser?.name || `Patient #${request.P_ID || "-"}`}</td>
                <td>{request?.Doctor?.User?.name || `Dr. #${request.D_ID || "-"}`}</td>
                <td>{request.paymentNumber || "01978896352"}</td>
                <td>{request.transactionId || "-"}</td>
                <td>{`${request.date || "-"} ${request.requestedTime || ""}`}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={notes[request.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
                  />
                </td>
                <td>
                  <button onClick={() => handleReview(request.id, "APPROVE")} disabled={updatingId === request.id}>
                    Approve
                  </button>
                  <button onClick={() => handleReview(request.id, "REJECT")} disabled={updatingId === request.id}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>My Reviewed / Assigned Requests</h3>
      {assigned.length === 0 ? (
        <p>No reviewed requests assigned yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Transaction ID</th>
              <th>Payment Status</th>
              <th>Request Status</th>
            </tr>
          </thead>
          <tbody>
            {assigned.map((item) => (
              <tr key={item.id}>
                <td>{item?.PatientUser?.name || `Patient #${item.P_ID || "-"}`}</td>
                <td>{item?.Doctor?.User?.name || `Dr. #${item.D_ID || "-"}`}</td>
                <td>{item.transactionId || "-"}</td>
                <td>{item.paymentStatus || "PENDING"}</td>
                <td>{item.requestStatus || "PAYMENT_SUBMITTED"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Telemedicine;

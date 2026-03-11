import React, { useState, useEffect } from "react";
import { createReport, fetchDoctorPatients } from "../api";

const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    fetchDoctorPatients()
      .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPatients([]));
  }, []);

  const handleSave = async () => {
    if (!selectedPatient || !prescription.trim()) {
      alert("Select a patient and write a prescription note.");
      return;
    }

    const result = await createReport({
      date: new Date().toISOString().slice(0, 10),
      P_ID: Number(selectedPatient),
      Test_ID: null,
      S_ID: null,
      status: "PENDING",
    });

    if (result?.success) {
      alert("Prescription note saved as report request.");
      setPrescription("");
      return;
    }

    alert(result?.message || "Failed to save prescription.");
  };

  return (
    <div className="prescriptions-page">
      <h2>Provide Prescription</h2>
      <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <textarea
        placeholder="Write prescription..."
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
      ></textarea>
      <button className="primary" onClick={handleSave}>Save</button>
    </div>
  );
};

export default Prescriptions;

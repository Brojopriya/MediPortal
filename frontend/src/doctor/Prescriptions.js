// dashboard/Prescriptions.js
import React, { useState, useEffect } from "react";

const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    fetch("/api/doctor/patients")
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);

  const handleSave = () => {
    fetch(`/api/doctor/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: selectedPatient, prescription }),
    }).then(() => alert("Prescription saved!"));
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

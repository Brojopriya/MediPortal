// dashboard/Patients.js
import React, { useEffect, useState } from "react";

const Patients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch patients data from backend API
    fetch("/api/doctor/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch(() =>
        setPatients([
          { id: 1, name: "John Doe", age: 35, phone: "+123456789", lastVisit: "2025-10-01" },
          { id: 2, name: "Jane Smith", age: 28, phone: "+987654321", lastVisit: "2025-09-25" },
          { id: 3, name: "Ahmed Ali", age: 42, phone: "+112233445", lastVisit: "2025-09-28" },
        ])
      );
  }, []);

  return (
    <div className="patients-page">
      <h2>My Patients</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Phone</th>
            <th>Last Visit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.phone}</td>
              <td>{p.lastVisit}</td>
              <td>
                <button onClick={() => window.location.href = `/dashboard/prescriptions?patientId=${p.id}`}>
                  Prescribe
                </button>
                <button onClick={() => alert(`Viewing medical history for ${p.name}`)}>
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;

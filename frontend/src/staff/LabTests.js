import React, { useState, useEffect } from "react";

const LabTests = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch("/api/labtests/staff")
      .then(res => res.json())
      .then(data => setTests(data));
  }, []);

  const updateStatus = (id, status) => {
    fetch(`/api/labtests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(() =>
      setTests(tests.map(test => (test.id === id ? { ...test, status } : test)))
    );
  };

  return (
    <div>
      <h2>Lab Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Test Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(test => (
            <tr key={test.id}>
              <td>{test.patientName}</td>
              <td>{test.testName}</td>
              <td>{test.date}</td>
              <td>{test.status}</td>
              <td>
                <button onClick={() => updateStatus(test.id, "Completed")}>Complete</button>
                <button onClick={() => updateStatus(test.id, "Cancelled")}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LabTests;

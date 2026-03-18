import React, { useState, useEffect } from "react";
import { fetchReports, updateReport } from "../api";

const LabTests = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchReports()
      .then((res) => {
        const all = Array.isArray(res?.data) ? res.data : [];
        setTests(all.filter((report) => report.reportType !== "PRESCRIPTION"));
      })
      .catch(() => setTests([]));
  }, []);

  const updateStatus = async (id, status) => {
    const result = await updateReport(id, { status });
    if (!result?.success) {
      alert(result?.message || "Failed to update report status");
      return;
    }
    setTests(tests.map(test => (test.id === id ? { ...test, status } : test)));
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
              <td>{test.testName || `Test #${test.Test_ID || "N/A"}`}</td>
              <td>{test.date}</td>
              <td>{test.status || "Pending"}</td>
              <td>
                <button onClick={() => updateStatus(test.id, "IN_PROGRESS")}>In Progress</button>
                <button onClick={() => updateStatus(test.id, "DISTRIBUTED")}>Distributed</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LabTests;

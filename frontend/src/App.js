import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import DoctorDashboard from "./DoctorDashboard"; // Import dashboard
import { fetchDoctors, fetchServices } from "./api.js";

function App() {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [docs, svcs] = await Promise.all([fetchDoctors(), fetchServices()]);
        setDoctors(docs);
        setServices(svcs);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <div className="loading">Loading home page...</div>
                ) : (
                  <HomePage doctors={doctors} services={services} />
                )
              }
            />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Doctor Dashboard Route */}
            <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

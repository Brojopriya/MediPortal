import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import AdminLoginPage from "./AdminLoginPage";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard"; 
import MedicalStaffDashboard from "./MedicalStaffDashboard";
import PatientDashboard from "./PatientDashboard";
import NurseDashboard from "./NurseDashboard";
import ProtectedRoute from "./ProtectedRoute";
import DoctorPublicProfile from "./DoctorPublicProfile";

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/doctors/:id" element={<DoctorPublicProfile />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Dashboard Routes with nested paths */}
            <Route
              path="/DoctorDashboard/*"
              element={
                <ProtectedRoute roles={["DOCTOR"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/MedicalStaffDashboard/*"
              element={
                <ProtectedRoute roles={["STAFF"]}>
                  <MedicalStaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PatientDashboard/*"
              element={
                <ProtectedRoute roles={["PATIENT"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/NurseDashboard/*"
              element={
                <ProtectedRoute roles={["NURSE"]}>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AdminDashboard"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

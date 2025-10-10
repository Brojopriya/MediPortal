// src/ForgotPasswordPage.js
import React, { useState } from "react";
import "./Auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      alert("Password reset link sent (check your email).");
    } catch (error) {
      console.error(error);
      alert("Failed to send reset link.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>

        <p>
          Remembered password? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

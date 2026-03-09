// src/ForgotPasswordPage.js
import React, { useState } from "react";
import "./Auth.css";
import { forgotPassword } from "./api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await forgotPassword({ email });
      if (!result?.success) {
        alert(result?.message || "Failed to send reset link.");
        return;
      }
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
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

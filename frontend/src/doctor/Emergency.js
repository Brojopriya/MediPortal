// dashboard/Emergency.js
import React from "react";

const Emergency = () => {
  return (
    <div className="emergency-page">
      <h2>Emergency</h2>
      <p>Call the ambulance or ER immediately if needed.</p>
      <button className="emergency-btn" onClick={() => window.location.href = "tel:+123456789"}>
        Call Emergency
      </button>
    </div>
  );
};

export default Emergency;

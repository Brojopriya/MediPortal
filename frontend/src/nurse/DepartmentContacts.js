import React, { useEffect, useState } from "react";
import { fetchNurseOperationsContext, fetchSiteContent } from "../api";

const toTelHref = (phone) => {
  const cleaned = String(phone || "").replace(/[^0-9+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
};

const DepartmentContacts = () => {
  const [context, setContext] = useState({
    department: null,
    doctors: [],
    emergencyContacts: [],
  });
  const [siteEmergencyNumber, setSiteEmergencyNumber] = useState("+1 234 567 890");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchNurseOperationsContext(), fetchSiteContent()])
      .then(([contextRes, siteRes]) => {
        if (!contextRes?.success) {
          setError(contextRes?.message || "Failed to load department contacts.");
          setContext({ department: null, doctors: [], emergencyContacts: [] });
        } else {
          setError("");
          setContext({
            department: contextRes?.data?.department || null,
            doctors: Array.isArray(contextRes?.data?.doctors) ? contextRes.data.doctors : [],
            emergencyContacts: Array.isArray(contextRes?.data?.emergencyContacts)
              ? contextRes.data.emergencyContacts
              : [],
          });
        }

        const emergencyFromSite =
          siteRes?.data?.emergencyContact ||
          siteRes?.emergencyContact ||
          "+1 234 567 890";
        setSiteEmergencyNumber(String(emergencyFromSite));
      })
      .catch(() => {
        setError("Failed to load department contacts.");
        setContext({ department: null, doctors: [], emergencyContacts: [] });
      });
  }, []);

  return (
    <div className="nurse-page contacts-page">
      <div className="nurse-page-header">
        <h2>Department Contacts</h2>
        <p>
          Doctors available in your department and all staff contacts available in your hospital.
          {context.department?.name ? ` Department: ${context.department.name}` : ""}
        </p>
      </div>

      {error ? <p className="nurse-error-text">{error}</p> : null}

      <div className="hotline-card">
        <div>
          <h3>Hospital Emergency Hotline</h3>
          <p className="hotline-number">{siteEmergencyNumber}</p>
        </div>
        {toTelHref(siteEmergencyNumber) ? (
          <a className="call-btn" href={toTelHref(siteEmergencyNumber)}>Call Now</a>
        ) : (
          <span className="call-btn disabled">Call Unavailable</span>
        )}
      </div>

      <section className="nurse-data-section">
        <h3>Available Doctors</h3>
        {!context.doctors.length ? (
          <p>No doctors found for your department.</p>
        ) : (
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Speciality</th>
                <th>Availability</th>
                <th>Phone</th>
                <th>Call</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {context.doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name || `Doctor #${doctor.id}`}</td>
                  <td>{doctor.speciality || "-"}</td>
                  <td>{doctor.availability || "-"}</td>
                  <td>{doctor.phone || "-"}</td>
                  <td>
                    {toTelHref(doctor.phone) ? (
                      <a className="table-call-link" href={toTelHref(doctor.phone)}>Call</a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{doctor.email || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="nurse-data-section">
        <h3>Hospital Staff Contacts</h3>
        {!context.emergencyContacts.length ? (
          <p>No hospital staff contacts available.</p>
        ) : (
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Sector</th>
                <th>Phone</th>
                <th>Call</th>
                <th>Email</th>
                <th>Hospital</th>
              </tr>
            </thead>
            <tbody>
              {context.emergencyContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name || `Staff #${contact.id}`}</td>
                  <td>{contact.role || "-"}</td>
                  <td>{contact.sector || "Emergency"}</td>
                  <td>{contact.phone || "-"}</td>
                  <td>
                    {toTelHref(contact.phone) ? (
                      <a className="table-call-link" href={toTelHref(contact.phone)}>Call</a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{contact.email || "-"}</td>
                  <td>{contact.hospitalName || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default DepartmentContacts;

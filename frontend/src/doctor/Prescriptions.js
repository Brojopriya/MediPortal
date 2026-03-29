import React, { useState, useEffect } from "react";
import { createReport, fetchDoctorPatients } from "../api";

const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
};

const createEmptyForm = () => ({
  patientId: "",
  diagnoses: [""],
  tests: [""],
  referredDoctor: "",
  medicines: [{ ...EMPTY_MEDICINE }],
  instructions: "",
});

const Prescriptions = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctorPatients()
      .then((res) => setPatients(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPatients([]));
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine
      ),
    }));
  };

  const addMedicineRow = () => {
    setForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { ...EMPTY_MEDICINE }],
    }));
  };

  const removeMedicineRow = (index) => {
    setForm((prev) => {
      if (prev.medicines.length === 1) {
        return prev;
      }

      return {
        ...prev,
        medicines: prev.medicines.filter((_, medicineIndex) => medicineIndex !== index),
      };
    });
  };

  const handleListItemChange = (listField, index, value) => {
    setForm((prev) => ({
      ...prev,
      [listField]: prev[listField].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const addListItem = (listField) => {
    setForm((prev) => ({
      ...prev,
      [listField]: [...prev[listField], ""],
    }));
  };

  const removeListItem = (listField, index) => {
    setForm((prev) => {
      if (prev[listField].length === 1) {
        return prev;
      }

      return {
        ...prev,
        [listField]: prev[listField].filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const buildPrescriptionNote = () => {
    const diagnosisLines = form.diagnoses
      .filter((item) => item.trim())
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");

    const testLines = form.tests
      .filter((item) => item.trim())
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");

    const medicineLines = form.medicines
      .map((medicine, index) => (
        `${index + 1}. ${medicine.name} | Dosage: ${medicine.dosage} | Frequency: ${medicine.frequency} | Duration: ${medicine.duration}`
      ))
      .join("\n");

    const parts = [
      "Diagnoses:",
      diagnosisLines || "N/A",
      "Recommended Tests:",
      testLines || "N/A",
      "Medicines:",
      medicineLines,
      `Referred Doctor: ${form.referredDoctor.trim() || "N/A"}`,
      `Instructions: ${form.instructions || "N/A"}`,
    ];
    return parts.join("\n");
  };

  const handleReset = () => {
    setForm(createEmptyForm());
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const hasInvalidMedicine = form.medicines.some(
      (medicine) =>
        !medicine.name.trim() ||
        !medicine.dosage.trim() ||
        !medicine.frequency.trim() ||
        !medicine.duration.trim()
    );

    const hasInvalidDiagnosis = form.diagnoses.some((diagnosis) => !diagnosis.trim());

    if (!form.patientId || hasInvalidDiagnosis || form.medicines.length === 0 || hasInvalidMedicine) {
      alert("Please fill patient, all diagnosis rows, and complete all medicine rows.");
      return;
    }

    setSaving(true);

    const result = await createReport({
      date: new Date().toISOString().slice(0, 10),
      P_ID: Number(form.patientId),
      D_ID: currentUser?.id || null,
      doctorName: currentUser?.name || null,
      doctorDepartment: currentUser?.professionalDetails?.department || null,
      hospitalName: "MediPortal Hospital",
      Test_ID: null,
      S_ID: null,
      reportType: "PRESCRIPTION",
      notes: buildPrescriptionNote(),
      status: "PENDING",
    });

    setSaving(false);

    if (result?.success) {
      alert("Prescription saved successfully.");
      setForm(createEmptyForm());
      return;
    }

    alert(result?.message || "Failed to save prescription");
  };

  const selectedPatient = patients.find((patient) => String(patient.id) === String(form.patientId));
  const nonEmptyDiagnosisCount = form.diagnoses.filter((item) => item.trim()).length;
  const nonEmptyTestCount = form.tests.filter((item) => item.trim()).length;
  const nonEmptyMedicineCount = form.medicines.filter((medicine) => medicine.name.trim()).length;

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <h2>Prescription Form</h2>
        <p>Create a complete and readable prescription with diagnoses, tests, medicines, and referral details.</p>
      </div>

      <div className="prescription-layout">
        <form className="prescription-form" onSubmit={handleSave}>
          <section className="prescription-section">
            <div className="prescription-section-head">
              <h3>Patient Details</h3>
            </div>
            <div className="prescription-grid">
              <div className="form-group full-width">
                <label>Patient</label>
                <select value={form.patientId} onChange={(e) => handleFieldChange("patientId", e.target.value)} required>
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="prescription-section">
            <div className="prescription-section-head">
              <h3>Diagnoses</h3>
              <button className="secondary" type="button" onClick={() => addListItem("diagnoses")}>Add Diagnosis</button>
            </div>

            <div className="simple-list">
              {form.diagnoses.map((diagnosis, index) => (
                <div className="simple-row" key={`diagnosis-${index}`}>
                  <input
                    type="text"
                    placeholder="e.g., Viral fever with mild dehydration"
                    value={diagnosis}
                    onChange={(e) => handleListItemChange("diagnoses", index, e.target.value)}
                    required
                  />
                  <button
                    className="danger"
                    type="button"
                    onClick={() => removeListItem("diagnoses", index)}
                    disabled={form.diagnoses.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="prescription-section">
            <div className="prescription-section-head">
              <h3>Recommended Tests</h3>
              <button className="secondary" type="button" onClick={() => addListItem("tests")}>Add Test</button>
            </div>

            <div className="simple-list">
              {form.tests.map((test, index) => (
                <div className="simple-row" key={`test-${index}`}>
                  <input
                    type="text"
                    placeholder="e.g., CBC, CRP, Chest X-ray"
                    value={test}
                    onChange={(e) => handleListItemChange("tests", index, e.target.value)}
                  />
                  <button
                    className="danger"
                    type="button"
                    onClick={() => removeListItem("tests", index)}
                    disabled={form.tests.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="prescription-section">
            <div className="prescription-section-head">
              <h3>Medicines</h3>
              <button className="secondary" type="button" onClick={addMedicineRow}>Add Medicine</button>
            </div>

            <div className="medicine-list">
              {form.medicines.map((medicine, index) => (
                <div className="medicine-row" key={`medicine-${index}`}>
                  <div className="medicine-grid">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={medicine.frequency}
                      onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                      required
                    />
                  </div>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => removeMedicineRow(index)}
                    disabled={form.medicines.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="prescription-section">
            <div className="prescription-grid">
              <div className="form-group full-width">
                <label>Referred Doctor</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. John Smith (Cardiology)"
                  value={form.referredDoctor}
                  onChange={(e) => handleFieldChange("referredDoctor", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Special Instructions</label>
                <textarea
                  rows={4}
                  placeholder="Any food timing, precautions, and follow-up notes"
                  value={form.instructions}
                  onChange={(e) => handleFieldChange("instructions", e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="prescription-actions">
            <button className="secondary" type="button" onClick={handleReset} disabled={saving}>Clear Form</button>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>

        <aside className="prescription-preview">
          <h3>Prescription Summary</h3>
          <div className="prescription-preview-meta">
            <span className="preview-chip">Patient: {selectedPatient?.name || "Not selected"}</span>
            <span className="preview-chip">Diagnoses: {nonEmptyDiagnosisCount}</span>
            <span className="preview-chip">Tests: {nonEmptyTestCount}</span>
            <span className="preview-chip">Medicines: {nonEmptyMedicineCount}</span>
          </div>
          <pre className="prescription-preview-body">{buildPrescriptionNote()}</pre>
        </aside>
      </div>
    </div>
  );
};

export default Prescriptions;

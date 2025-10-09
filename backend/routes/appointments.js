// routes/appointments.js
const express = require('express');
const router = express.Router();
const { models, sequelize } = require('../models');

router.post('/', async (req, res) => {
  const { patient_id, doctor_id, datetime, notes } = req.body;
  const t = await sequelize.transaction();
  try {
    // simple overlap check
    const conflict = await models.Appointment.findOne({
      where: { doctor_id, datetime, status: ['PENDING','CONFIRMED'] },
      transaction: t
    });
    if (conflict) {
      await t.rollback();
      return res.status(409).json({ error: 'Doctor not available at this time' });
    }
    const appt = await models.Appointment.create({ patient_id, doctor_id, datetime, notes }, { transaction: t });
    await t.commit();
    res.status(201).json(appt);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: 'Cannot create appointment' });
  }
});

router.get('/patient/:id', async (req, res) => {
  try {
    const appts = await models.Appointment.findAll({
      where: { patient_id: req.params.id },
      include: [{ model: models.Doctor, as: 'doctor' }],
      order: [['datetime','DESC']]
    });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

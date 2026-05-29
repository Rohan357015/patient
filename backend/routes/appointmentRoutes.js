const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getPatientHistory,
  getDoctorSchedule,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, bookAppointment);
router.get('/patient', protect, getPatientHistory);
router.get('/doctor', protect, getDoctorSchedule);
router.put('/:id', protect, updateAppointmentStatus);

module.exports = router;

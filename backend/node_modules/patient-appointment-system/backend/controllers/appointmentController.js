const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied: Only patients can book appointments' });
    }

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Please provide doctorId, date, and time' });
    }

    // Find the doctor's profile
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find matching slot in doctor's slots
    const slot = doctorProfile.slots.find(
      (s) => s.date === date && s.time === time && !s.isBooked
    );

    if (!slot) {
      return res.status(400).json({ message: 'Selected slot is unavailable or already booked' });
    }

    // Mark slot as booked
    slot.isBooked = true;
    await doctorProfile.save();

    // Create the appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      status: 'pending'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
};

// @desc    Get patient's appointment history
// @route   GET /api/appointments/patient
// @access  Private (Patient only)
const getPatientHistory = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied: Patients only' });
    }

    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving appointments history' });
  }
};

// @desc    Get doctor's daily/overall schedules
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
const getDoctorSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving doctor schedules' });
  }
};

// @desc    Approve or reject appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: Doctors only' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be approved or rejected' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify this doctor actually owns the appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Not your appointment' });
    }

    appointment.status = status;
    await appointment.save();

    // If rejected, free up the doctor slot
    if (status === 'rejected') {
      const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
      if (doctorProfile) {
        const slot = doctorProfile.slots.find(
          (s) => s.date === appointment.date && s.time === appointment.time
        );
        if (slot) {
          slot.isBooked = false;
          await doctorProfile.save();
        }
      }
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    res.status(200).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
};

module.exports = {
  bookAppointment,
  getPatientHistory,
  getDoctorSchedule,
  updateAppointmentStatus
};

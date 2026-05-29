const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Get all doctors with profiles populated
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate('user', 'name email');
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving doctor listings' });
  }
};

// @desc    Get logged in doctor's profile
// @route   GET /api/doctors/profile
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving doctor profile' });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateMyProfile = async (req, res) => {
  const { specialty, experience, bio } = req.body;

  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: User is not a doctor' });
    }

    let profile = await DoctorProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = new DoctorProfile({
        user: req.user._id,
        specialty: specialty || 'General Medicine',
        experience: experience || 0,
        bio: bio || '',
        slots: []
      });
    } else {
      profile.specialty = specialty || profile.specialty;
      profile.experience = experience !== undefined ? experience : profile.experience;
      profile.bio = bio || profile.bio;
    }

    const updatedProfile = await profile.save();
    const populated = await updatedProfile.populate('user', 'name email');
    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Add appointment slot for doctor
// @route   POST /api/doctors/slots
// @access  Private (Doctor only)
const addSlot = async (req, res) => {
  const { date, time } = req.body;

  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: User is not a doctor' });
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'Please provide both date and time' });
    }

    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Check if slot already exists
    const slotExists = profile.slots.some(
      (slot) => slot.date === date && slot.time === time
    );

    if (slotExists) {
      return res.status(400).json({ message: 'Slot already exists for this date and time' });
    }

    profile.slots.push({ date, time, isBooked: false });
    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding slot' });
  }
};

// @desc    Remove appointment slot for doctor
// @route   DELETE /api/doctors/slots/:slotId
// @access  Private (Doctor only)
const removeSlot = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied: User is not a doctor' });
    }

    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const slot = profile.slots.id(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a slot that has already been booked' });
    }

    profile.slots.pull(req.params.slotId);
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting slot' });
  }
};

module.exports = {
  getDoctors,
  getMyProfile,
  updateMyProfile,
  addSlot,
  removeSlot
};

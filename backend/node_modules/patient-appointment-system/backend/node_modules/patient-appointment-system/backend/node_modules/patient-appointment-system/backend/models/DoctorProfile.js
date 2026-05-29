const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:MM (e.g., 09:00, 14:30)
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  slots: [slotSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);

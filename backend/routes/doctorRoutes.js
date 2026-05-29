const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getMyProfile,
  updateMyProfile,
  addSlot,
  removeSlot
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateMyProfile);
router.post('/slots', protect, addSlot);
router.delete('/slots/:slotId', protect, removeSlot);

module.exports = router;

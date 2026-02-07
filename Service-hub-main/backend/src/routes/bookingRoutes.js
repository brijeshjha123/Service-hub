const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createBooking);
router.get('/', auth, getBookings);
router.patch('/:id', auth, updateBookingStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');



const authMiddleware = require('../middleware/authMiddleware');
const adminLimiter = require('../middleware/rateLimiter');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin only' });
    }
};

// Apply protection to all routes in this file
// Apply rate limiter specifically to this router
router.use(adminLimiter);
router.use(authMiddleware, isAdmin);

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalProviders = await User.countDocuments({ role: 'provider' });

        // Calculate Earnings
        const completedBookings = await Booking.find({ status: 'completed' });
        let totalRevenue = 0;
        let platformFees = 0;
        let providerEarnings = 0;

        completedBookings.forEach(booking => {
            const amount = booking.price || 0;
            totalRevenue += amount;
            const commission = amount * 0.03;
            platformFees += commission;
            providerEarnings += (amount - commission);
        });

        res.json({
            totalCustomers,
            totalProviders,
            totalRevenue,
            platformFees,
            providerEarnings,
            totalOrders: completedBookings.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Providers (with filters)
router.get('/providers', async (req, res) => {
    try {
        const providers = await User.find({ role: 'provider' });
        // You might want to aggregate acceptance rate here from Bookings
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage Provider (Approve/Reject/Delete)
router.put('/providers/:id', async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'approved', 'suspended' - assuming we add a status field to User later
        const provider = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage User (Block/Unblock) - Generic for now or specific to customers
router.put('/users/:id', async (req, res) => {
    try {
        // We can update any field, e.g., isBlocked: true
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

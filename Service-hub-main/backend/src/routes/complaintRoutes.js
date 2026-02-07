const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Raise a complaint
router.post('/', async (req, res) => {
    try {
        const { customerId, providerId, orderId, reason, description } = req.body;
        const complaint = new Complaint({
            customer: customerId,
            provider: providerId,
            order: orderId,
            reason,
            description
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all complaints (Admin)
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('customer', 'name email')
            .populate('provider', 'name email')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update complaint status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

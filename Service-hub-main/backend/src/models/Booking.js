const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: String,
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    serviceCategory: {
        type: String,
        enum: ['Plumber', 'Electrician', 'Cleaner', 'Other'],
        default: 'Other'
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // HH:MM
        required: true
    },
    location: {
        address: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'confirmed', 'in-progress', 'completed', 'cancelled', 'declined'],
        default: 'pending'
    },
    price: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);

const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
    try {
        const { serviceId, serviceName, date, time, price, location, providerId, serviceCategory } = req.body;

        let assignedProviderId = providerId && providerId !== 'mock-provider-id' ? providerId : null;

        // Dynamic Assignment Logic
        if (!assignedProviderId && serviceCategory) {
            // Find an active provider matching the category
            // We can add more logic here (e.g., nearest location, highest rating)
            const matchedProvider = await User.findOne({
                role: 'provider',
                serviceCategory: serviceCategory,
                isBlocked: { $ne: true }
            });

            if (matchedProvider) {
                assignedProviderId = matchedProvider._id;
                console.log(`[BOOKING] Auto-assigned provider ${matchedProvider.name} (${matchedProvider.email}) for ${serviceCategory}`);
            } else {
                console.log(`[BOOKING] No provider found for category: ${serviceCategory}`);
            }
        }

        const newBooking = new Booking({
            user: req.user.id,
            serviceId,
            serviceName,
            date,
            time,
            price,
            location, // Assuming it's a string or object based on schema
            provider: assignedProviderId,
            status: assignedProviderId ? 'pending' : 'pending', // Could be 'unassigned' if no provider found
            serviceCategory // valid to save if schema allows, otherwise just used for logic
        });

        const savedBooking = await newBooking.save();

        // Emit Socket.IO event
        const io = req.app.get('io');
        if (io) {
            console.log(`[SOCKET] Emitting newBookingRequest for service: ${serviceName}`);
            // Broadcast to the 'providers' room
            io.to('providers').emit('newBookingRequest', {
                id: savedBooking._id,
                ...req.body,
                customerId: req.user.id
            });
        }

        res.status(201).json(savedBooking);
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: "Failed to create booking", error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'provider') {
            // Providers see pending (marketplace) or assigned to them
            // Providers see pending (marketplace) MATCHING THEIR CATEGORY or assigned to them
            // strict category matching
            query = {
                $or: [
                    { status: 'pending', serviceCategory: req.user.serviceCategory },
                    { provider: req.user.id }
                ]
            };
        } else {
            // Customers see only their own
            query = { user: req.user.id };
        }

        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, rating, review } = req.body;
        const { id } = req.params;

        if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Booking ID" });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only update status if explicitly provided
        if (status) {
            booking.status = status;
            if (status === 'confirmed' || status === 'accepted') {
                booking.provider = req.user.id;
            }
        }

        // Handle rating and review
        if (rating !== undefined) {
            booking.rating = rating;
        }
        if (review !== undefined) {
            booking.review = review;
        }

        await booking.save();

        // Emit Socket.IO event to customer
        const io = req.app.get('io');
        if (io) {
            io.to(booking.user.toString()).emit('bookingStatusUpdate', {
                bookingId: booking._id,
                status: booking.status,
                serviceName: booking.serviceName
            });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Failed to update booking", error: error.message });
    }
};

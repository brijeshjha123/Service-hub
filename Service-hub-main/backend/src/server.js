require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Initialize Socket.IO
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// Socket.IO Events
io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`[SOCKET] User ${userId} joined room`);
    });

    socket.on('newBookingRequest', (data) => {
        console.log(`[SOCKET] Forwarding booking request. Targeted: ${data.providerId}`);
        if (data.providerId && data.providerId !== 'mock-provider-id') {
            io.to(data.providerId).emit('newBookingRequest', data);
        } else {
            // General marketplace broadcast
            io.to('providers').emit('newBookingRequest', data);
        }
    });

    socket.on('bookingAccepted', (data) => {
        console.log(`[SOCKET] Forwarding acceptance to customer: ${data.customerId}`);
        io.to(data.customerId).emit('bookingAccepted', data);
    });

    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected`);
    });
});

// Attach io to app for use in routes
app.set('io', io);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Graceful Shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
            });
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

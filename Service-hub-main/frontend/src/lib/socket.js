import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true
});

socket.on('connect', () => {
    console.log('[SOCKET] Connected to server:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('[SOCKET] Connection error:', error);
});

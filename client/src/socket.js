import { io } from 'socket.io-client';

// Connect to the server
// In production, this should be set via VITE_SERVER_URL
const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3077';

export const socket = io(URL, {
    autoConnect: false
});

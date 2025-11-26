import { io } from 'socket.io-client';

// Connect to the server
// In production, this should be set via VITE_SERVER_URL
let URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3077';
if (URL && !URL.startsWith('http')) {
    URL = `https://${URL}`;
}

export const socket = io(URL, {
    autoConnect: false
});

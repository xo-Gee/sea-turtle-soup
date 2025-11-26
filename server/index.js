const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*", // Use env var for production, allow all for dev
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3077;

// Socket.io event handlers
const registerRoomHandlers = require('./socket/roomHandler');
const registerGameHandlers = require('./socket/gameHandler');

const fs = require('fs');
const path = require('path');

const COUNT_FILE = path.join(__dirname, 'data', 'visitorCount.json');

// Helper to get/update count
const updateVisitorCount = () => {
    try {
        // Ensure the directory exists
        const dataDir = path.dirname(COUNT_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let json = { count: 0 };
        if (fs.existsSync(COUNT_FILE)) {
            const data = fs.readFileSync(COUNT_FILE, 'utf8');
            json = JSON.parse(data);
        }

        json.count += 1;
        fs.writeFileSync(COUNT_FILE, JSON.stringify(json, null, 2));
        return json.count;
    } catch (err) {
        console.error('Error updating visitor count:', err);
        return 0;
    }
};

const getVisitorCount = () => {
    try {
        if (fs.existsSync(COUNT_FILE)) {
            const data = fs.readFileSync(COUNT_FILE, 'utf8');
            return JSON.parse(data).count;
        }
        return 0; // File doesn't exist yet
    } catch (err) {
        console.error('Error reading visitor count:', err);
        return 0;
    }
};

const onConnection = (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send current count immediately
    socket.emit('visitor_count', getVisitorCount());

    // Increment count only on 'login' or just connection?
    // Let's increment on connection for "Total Visitors" concept
    // But to avoid refresh spam, maybe we should check something?
    // For simple "Total Visitors" counter, incrementing on connection is standard behavior for retro sites.
    const newCount = updateVisitorCount();
    io.emit('visitor_count', newCount); // Broadcast to all

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};

io.on('connection', onConnection);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

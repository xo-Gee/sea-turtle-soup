const rooms = new Map();
const singleSessions = new Map(); // Store single player states: { socketId: { scenario, messages, hintsLeft, ... } }

module.exports = { rooms, singleSessions };

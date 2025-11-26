const { rooms } = require('../state');

module.exports = (io, socket) => {
    const createRoom = ({ title, maxPlayers, password, nickname }) => {
        try {
            if (!title) return socket.emit('error', { message: '방 제목이 필요합니다.' });
            if (!nickname) return socket.emit('error', { message: '닉네임이 필요합니다.' });

            const roomId = `room_${Date.now()}`;
            const newRoom = {
                roomId,
                title,
                maxPlayers: Number(maxPlayers), // Ensure number
                password,
                hostId: socket.id,
                players: [{
                    id: socket.id,
                    nickname,
                    isHost: true,
                    role: 'ANSWERER', // Default
                    isReady: true // Host is always ready
                }],
                status: 'WAITING',
                messages: []
            };

            rooms.set(roomId, newRoom);
            socket.join(roomId);

            // Notify creator
            socket.emit('room_created', newRoom);

            // Broadcast updated room list to everyone in lobby
            io.emit('room_list_update', Array.from(rooms.values()));
        } catch (err) {
            console.error('Error creating room:', err);
            socket.emit('error', { message: '방 생성 중 오류가 발생했습니다.' });
        }
    };

    const joinRoom = ({ roomId, nickname, password }) => {
        const room = rooms.get(roomId);

        if (!room) {
            return socket.emit('error', { message: '방을 찾을 수 없습니다.' });
        }

        if (room.players.length >= room.maxPlayers) {
            return socket.emit('error', { message: '방이 꽉 찼습니다.' });
        }

        if (room.password && room.password !== password) {
            return socket.emit('error', { message: '비밀번호가 틀렸습니다.' });
        }

        const newPlayer = {
            id: socket.id,
            nickname,
            isHost: false,
            role: 'ANSWERER',
            isReady: false
        };

        room.players.push(newPlayer);
        socket.join(roomId);

        // Notify room members
        io.to(roomId).emit('player_joined', room);

        // Notify joiner
        socket.emit('joined_room', room);

        // Update lobby list (player count changed)
        io.emit('room_list_update', Array.from(rooms.values()));
    };

    const leaveRoom = () => {
        // Find room user is in
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                socket.leave(roomId);

                if (room.players.length === 0) {
                    rooms.delete(roomId);
                } else {
                    // If host left, assign new host
                    if (playerIndex === 0) { // Was host (usually first)
                        // Simple logic: next player becomes host
                        room.players[0].isHost = true;
                        room.players[0].isReady = true;
                    }
                    io.to(roomId).emit('player_left', room);
                }

                io.emit('room_list_update', Array.from(rooms.values()));
                break;
            }
        }
    };

    const getRooms = () => {
        socket.emit('room_list_update', Array.from(rooms.values()));
    };

    const getRoom = (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            socket.emit('room_data', room);
        } else {
            socket.emit('error', { message: '방을 찾을 수 없습니다.' });
        }
    };

    socket.on('create_room', createRoom);
    socket.on('join_room', joinRoom);
    socket.on('leave_room', leaveRoom);
    socket.on('get_rooms', getRooms);
    socket.on('get_room', getRoom);

    // Handle disconnect
    socket.on('disconnect', leaveRoom);
};

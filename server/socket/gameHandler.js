const { rooms } = require('../state');
const scenarios = require('../data/scenarios.json');

module.exports = (io, socket) => {
    // Helper to find room
    const getRoom = () => {
        for (const room of rooms.values()) {
            if (room.players.find(p => p.id === socket.id)) return room;
        }
        return null;
    };

    const setRole = ({ role }) => {
        const room = getRoom();
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // If trying to be Questioner, check if taken
        if (role === 'QUESTIONER') {
            const existingQ = room.players.find(p => p.role === 'QUESTIONER');
            if (existingQ && existingQ.id !== socket.id) {
                return socket.emit('error', { message: '이미 출제자가 있습니다.' });
            }
        }

        player.role = role;
        io.to(room.roomId).emit('player_update', room);
    };

    const setReady = ({ isReady }) => {
        const room = getRoom();
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isReady = isReady;
            io.to(room.roomId).emit('player_update', room);
        }
    };

    const requestStart = () => {
        const room = getRoom();
        if (!room) return;
        if (room.hostId !== socket.id) return; // Only host can request start

        // Validation
        const questioner = room.players.find(p => p.role === 'QUESTIONER');
        if (!questioner) return socket.emit('error', { message: '출제자가 필요합니다.' });

        const allReady = room.players.every(p => p.isReady);
        if (!allReady) return socket.emit('error', { message: '모두 준비해야 합니다.' });

        if (room.players.length < 2) return socket.emit('error', { message: '최소 2명 이상의 플레이어가 필요합니다.' });

        // Set pending flag
        room.pendingStart = true;

        // Notify Questioner to input scenario
        io.to(questioner.id).emit('input_scenario');

        // Notify others to wait
        room.players.forEach(p => {
            if (p.id !== questioner.id) {
                io.to(p.id).emit('waiting_scenario');
            }
        });
    };

    const submitScenario = ({ customScenario }) => {
        const room = getRoom();
        if (!room) return;
        if (!room.pendingStart) return; // Must be in pending state

        const player = room.players.find(p => p.id === socket.id);
        if (player.role !== 'QUESTIONER') return; // Only Questioner can submit

        // Start the game
        startGameInternal(room, customScenario);
    };

    const startGameInternal = (room, customScenario) => {
        // Select Scenario
        let scenario;
        if (customScenario) {
            scenario = customScenario;
        } else {
            scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        }

        room.status = 'PLAYING';
        room.scenario = scenario;
        room.startTime = Date.now();
        room.history = [];
        room.hintsLeft = 2; // Initialize hints
        room.pendingStart = false; // Clear flag

        io.to(room.roomId).emit('game_started', room);
    };

    const sendChat = ({ message, type }) => { // type: 'CHAT', 'QUESTION', 'HINT'
        console.log(`[sendChat] socket=${socket.id}, msg=${message}, type=${type}`);
        const room = getRoom();
        if (!room) return;
        // ... rest of function


        const player = room.players.find(p => p.id === socket.id);

        // If Questioner sends HINT, check count
        if (type === 'HINT') {
            if (player.role !== 'QUESTIONER') return; // Only Questioner can hint
            if (room.hintsLeft <= 0) return socket.emit('error', { message: '힌트를 모두 사용했습니다.' });
            room.hintsLeft -= 1;
            // Broadcast update to sync hint count? Or just include in message?
            // Let's include in message or emit room update.
            // Emitting room update is safer for UI sync.
            io.to(room.roomId).emit('player_update', room); // Re-using player_update or game_started? 
            // Actually 'player_update' sends the whole room object, so it works.
        }

        const msgObj = {
            id: Date.now(),
            userId: socket.id,
            nickname: player.nickname,
            message,
            type: type || 'CHAT', // CHAT, QUESTION, ANSWER, SYSTEM, HINT
            timestamp: Date.now()
        };

        room.messages.push(msgObj);
        io.to(room.roomId).emit('message_received', msgObj);
    };

    const answerQuestion = ({ questionId, answer }) => { // answer: 'YES', 'NO', 'IRRELEVANT', 'CRITICAL'
        const room = getRoom();
        if (!room) return;

        // Find the question message to reply to (optional, for UI threading)
        // For now just append answer message
        const player = room.players.find(p => p.id === socket.id);
        if (player.role !== 'QUESTIONER') return;

        const msgObj = {
            id: Date.now(),
            userId: socket.id,
            nickname: player.nickname,
            message: answer,
            type: 'ANSWER',
            targetId: questionId, // Link to question
            timestamp: Date.now()
        };

        room.messages.push(msgObj);
        io.to(room.roomId).emit('message_received', msgObj);
    };

    const submitGuess = ({ guess }) => {
        const room = getRoom();
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);

        // Notify Questioner
        const questioner = room.players.find(p => p.role === 'QUESTIONER');
        if (questioner) {
            io.to(questioner.id).emit('guess_submitted', {
                guesserId: socket.id,
                guesserName: player.nickname,
                guess
            });
        }
    };

    const judgeGuess = ({ guesserId, isCorrect }) => {
        const room = getRoom();
        if (!room) return;

        // Only Questioner can judge
        // ... check role ...

        if (isCorrect) {
            room.status = 'FINISHED';
            room.winner = room.players.find(p => p.id === guesserId)?.nickname;
            io.to(room.roomId).emit('game_over', room);
        } else {
            // Notify failure
            io.to(room.roomId).emit('guess_failed', {
                guesserName: room.players.find(p => p.id === guesserId)?.nickname
            });
        }
    };

    const resetRoom = () => {
        const room = getRoom();
        if (!room) return;

        // Only host can reset? Or anyone? 
        // Usually host. But Result page button is for everyone.
        // If everyone clicks it, it might spam reset.
        // Let's make it so that if ANYONE clicks "Return to Room", they just navigate back.
        // BUT the room state needs to be reset.
        // Ideally, when the game ends, the room state stays 'FINISHED' until Host clicks 'Reset' or 'Play Again'.
        // But the user request is "Return to room and clear chat".
        // Let's assume when the first person returns (or host), we reset.
        // Or better: Reset happens when Game Over? No, we need to see results.
        // Let's add a 'return_to_room' event.

        // If status is FINISHED, reset it to WAITING and clear messages.
        if (room.status === 'FINISHED') {
            room.status = 'WAITING';
            room.messages = []; // Clear chat log
            room.scenario = null;
            room.winner = null;
            room.players.forEach(p => {
                p.isReady = p.isHost; // Host is always ready, others reset
            });
            io.to(room.roomId).emit('room_reset', room); // Notify all to go back?
            // Or just update state so when they join/fetch they get new state.
            io.to(room.roomId).emit('player_update', room); // Update player list (ready status)
        }
    };

    // Remove existing listeners to prevent duplication if handler is re-registered (though unlikely with new socket)
    socket.removeAllListeners('set_role');
    socket.removeAllListeners('set_ready');
    socket.removeAllListeners('request_start');
    socket.removeAllListeners('submit_scenario');
    socket.removeAllListeners('send_chat');
    socket.removeAllListeners('answer_question');
    socket.removeAllListeners('submit_guess');
    socket.removeAllListeners('judge_guess');
    socket.removeAllListeners('reset_room');

    socket.on('set_role', setRole);
    socket.on('set_ready', setReady);

    socket.on('request_start', requestStart);
    socket.on('submit_scenario', submitScenario);
    socket.on('send_chat', sendChat);
    socket.on('answer_question', answerQuestion);
    socket.on('submit_guess', submitGuess);
    socket.on('judge_guess', judgeGuess);
    socket.on('reset_room', resetRoom);
};

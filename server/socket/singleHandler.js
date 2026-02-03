const { singleSessions } = require('../state');
const scenarios = require('../data/scenarios.json');
const { generateResponse } = require('../services/ai');

module.exports = (io, socket) => {
    // Start Single Game
    const startSingleGame = () => {
        const randomIndex = Math.floor(Math.random() * scenarios.length);
        const scenario = scenarios[randomIndex];

        // Init Session
        const session = {
            socketId: socket.id,
            scenario: scenario,
            messages: [],
            hintsLeft: 5, // Default max hints
            startTime: Date.now(),
            status: 'PLAYING'
        };

        singleSessions.set(socket.id, session);

        // Emit start event with scenario content (hide solution)
        const { solution, ...safeScenario } = scenario;
        socket.emit('single_game_started', {
            scenario: safeScenario,
            hintsLeft: session.hintsLeft
        });

        // Initial System Message
        const welcomeMsg = {
            id: Date.now(),
            type: 'SYSTEM',
            message: '게임이 시작되었습니다. 질문을 입력해주세요!',
            timestamp: Date.now()
        };
        session.messages.push(welcomeMsg);
        socket.emit('single_message_received', welcomeMsg);
    };

    // Handle Chat
    const singleChat = async ({ message, type }) => {
        const session = singleSessions.get(socket.id);
        if (!session || session.status !== 'PLAYING') return;

        // User Message
        const userMsgId = Date.now();
        const userMsgObj = {
            id: userMsgId,
            userId: socket.id,
            nickname: '나',
            message,
            type: 'QUESTION',
            timestamp: Date.now()
        };
        session.messages.push(userMsgObj);
        socket.emit('single_message_received', userMsgObj);

        // AI processing
        const aiResultKey = await generateResponse(message, session.scenario);

        if (aiResultKey === 'CORRECT') {
            const aiMsgObj = {
                id: Date.now() + 1,
                userId: 'AI_HOST',
                nickname: 'AI 거북이',
                message: 'YES', // Technically YES to the question
                type: 'ANSWER',
                targetId: userMsgId,
                timestamp: Date.now()
            };
            session.messages.push(aiMsgObj);
            socket.emit('single_message_received', aiMsgObj);

            session.status = 'FINISHED';
            socket.emit('single_game_over', {
                win: true,
                solution: session.scenario.solution
            });
        } else {
            const aiMsgObj = {
                id: Date.now() + 1,
                userId: 'AI_HOST',
                nickname: 'AI 거북이',
                message: aiResultKey, // YES, NO, CRITICAL, IRRELEVANT
                type: 'ANSWER',
                targetId: userMsgId,
                timestamp: Date.now()
            };
            session.messages.push(aiMsgObj);
            socket.emit('single_message_received', aiMsgObj);
        }
    };

    // Quit / Cleanup
    const leaveSingleGame = () => {
        if (singleSessions.has(socket.id)) {
            singleSessions.delete(socket.id);
        }
    };

    socket.on('start_single_game', startSingleGame);
    socket.on('single_chat', singleChat);
    socket.on('leave_single_game', leaveSingleGame);

    // Cleanup on disconnect
    socket.on('disconnect', () => {
        leaveSingleGame();
    });
};

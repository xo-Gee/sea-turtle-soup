import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';

export default function GameRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [pendingGuesses, setPendingGuesses] = useState([]);
    const chatEndRef = useRef(null);
    const { showConfirm, showPrompt, showCustom, close } = useModal();

    useEffect(() => {
        // Initial fetch
        socket.emit('get_rooms');
        const handleRoomList = (rooms) => {
            const r = rooms.find(r => r.roomId === roomId);
            if (r) {
                setRoom(r);
                setMessages(r.messages || []);
            }
        };
        socket.on('room_list_update', handleRoomList);

        const handleMessage = (msg) => {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };

        const handleGameOver = (updatedRoom) => {
            navigate(`/result/${updatedRoom.roomId}`);
        };

        const handleGuessFailed = ({ guesserName }) => {
            setMessages(prev => [...prev, {
                id: Date.now(), type: 'SYSTEM', message: `${guesserName}님의 정답 도전이 실패했습니다!`
            }]);
        };

        const handleGuessSubmitted = ({ guesserName, guess, guesserId }) => {
            // Only Questioner sees this via specific event, but we want to show system msg to all?
            // No, specific event.
            // But here we are in generic handler.
            // Wait, 'guess_submitted' is sent to Questioner ONLY.
            // We need to handle it if we are Questioner.
        };

        const handlePlayerUpdate = (updatedRoom) => {
            setRoom(updatedRoom);
        };

        const handleError = (err) => {
            if (err.message === '방을 찾을 수 없습니다.') {
                navigate('/not-found');
            }
        };

        socket.on('message_received', handleMessage);
        socket.on('game_over', handleGameOver);
        socket.on('guess_failed', handleGuessFailed);
        socket.on('player_update', handlePlayerUpdate);
        socket.on('error', handleError);

        return () => {
            socket.off('room_list_update', handleRoomList);
            socket.off('message_received', handleMessage);
            socket.off('game_over', handleGameOver);
            socket.off('guess_failed', handleGuessFailed);
            socket.off('game_over', handleGameOver);
            socket.off('guess_failed', handleGuessFailed);
            socket.off('player_update', handlePlayerUpdate);
            socket.off('error', handleError);
        };
    }, [roomId, navigate]);

    // Separate effect for Questioner specific events
    useEffect(() => {
        const handleGuessSubmitted = ({ guesserName, guess, guesserId }) => {
            setPendingGuesses(prev => [...prev, { guesserName, guess, guesserId, id: Date.now() }]);
        };
        socket.on('guess_submitted', handleGuessSubmitted);
        return () => socket.off('guess_submitted', handleGuessSubmitted);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const myId = socket.id;
    const me = room?.players.find(p => p.id === myId);
    const isQuestioner = me?.role === 'QUESTIONER';



    const handleAnswer = (targetMsg) => {
        if (!isQuestioner) return;
        if (targetMsg.type !== 'QUESTION') return;

        showCustom({
            title: '답변 선택',
            message: `"${targetMsg.message}"\n\n질문에 대한 답변을 선택하세요.`,
            children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <button className="retro-btn" style={{ background: 'var(--alert-red)', color: '#fff' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'YES' }); close(); }}>
                        YES
                    </button>
                    <button className="retro-btn" style={{ background: 'transparent', color: 'red', border: '2px solid red' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'NO' }); close(); }}>
                        NO
                    </button>
                    <button className="retro-btn" style={{ background: '#ccc', color: '#555' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'SKIP' }); close(); }}>
                        SKIP
                    </button>
                </div>
            )
        });
    };

    const handleGuess = async () => {
        const guess = await showPrompt("정답을 서술하시오:", "정답 도전");
        if (guess) {
            socket.emit('submit_guess', { guess });
        }
    };

    const handleReviewGuesses = () => {
        if (pendingGuesses.length === 0) return;

        const currentGuess = pendingGuesses[0];
        showCustom({
            title: '정답 판정',
            message: `${currentGuess.guesserName}님의 정답 도전:\n\n"${currentGuess.guess}"\n\n(남은 대기: ${pendingGuesses.length - 1}건)`,
            children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <button className="retro-btn" style={{ background: 'var(--alert-red)', color: '#fff' }}
                        onClick={() => {
                            socket.emit('judge_guess', { guesserId: currentGuess.guesserId, isCorrect: true });
                            setPendingGuesses(prev => prev.slice(1));
                            close();
                            // Re-open if more guesses exist? Maybe better to let user click again or auto-open next?
                            // Let's let user click again for better control.
                        }}>
                        정답!
                    </button>
                    <button className="retro-btn" style={{ background: 'transparent', color: '#fff', border: '2px solid #fff' }}
                        onClick={() => {
                            socket.emit('judge_guess', { guesserId: currentGuess.guesserId, isCorrect: false });
                            setPendingGuesses(prev => prev.slice(1));
                            close();
                        }}>
                        오답
                    </button>
                </div>
            )
        });
    };

    const [isHintMode, setIsHintMode] = useState(false);

    const sendMessage = () => {
        if (!inputMsg.trim()) return;

        if (isQuestioner) {
            if (isHintMode) {
                socket.emit('send_chat', { message: inputMsg, type: 'HINT' });
                setIsHintMode(false);
            } else {
                // Should not happen if disabled, but just in case
                return;
            }
        } else {
            // Answerer always sends QUESTION (or CHAT which is treated as question pending)
            socket.emit('send_chat', { message: inputMsg, type: 'QUESTION' });
        }
        setInputMsg('');
    };

    if (!room) return <div style={{ color: 'white' }}>Loading...</div>;

    return (
        <div id="screen-game" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* ... header ... */}
            <div className="game-header">
                <span>Room: {room.title}</span>
                <span onClick={() => { socket.emit('leave_room'); navigate('/lobby'); }} style={{ cursor: 'pointer' }}>[X]</span>
            </div>

            <div className="question-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'var(--alert-red)', color: 'white', padding: '2px 4px 0 4px', fontSize: '12px' }}>PROBLEM</span>
                    {isQuestioner && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--main-green)' }}>남은 힌트: {room.hintsLeft ?? 2}</span>
                            {pendingGuesses.length > 0 && (
                                <button
                                    className="retro-btn"
                                    style={{
                                        padding: '0 5px', fontSize: '12px',
                                        background: 'var(--alert-red)', color: '#fff',
                                        animation: 'blink 1s infinite'
                                    }}
                                    onClick={handleReviewGuesses}
                                >
                                    정답 확인 ({pendingGuesses.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--main-green)', fontSize: '1.1em' }}>
                    {room.scenario?.title}
                </div>
                <div style={{ marginTop: '5px', color: '#fff' }}>
                    {room.scenario?.content}
                </div>
                {isQuestioner && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', borderTop: '1px dashed #555', paddingTop: '5px' }}>
                        [정답] {room.scenario?.solution}
                    </div>
                )}
            </div>

            <div className="chat-area">
                {/* ... messages ... */}
                <div className="msg sys">--- 게임 시작 ---</div>
                {messages.map((msg, i) => {
                    const isMe = msg.userId === myId;
                    const answerMsg = messages.find(m => m.type === 'ANSWER' && m.targetId === msg.id);

                    if (msg.type === 'ANSWER') return null;
                    if (msg.type === 'SYSTEM') return <div key={i} className="msg sys">{msg.message}</div>;
                    if (msg.type === 'HINT') return <div key={i} className="msg sys" style={{ color: 'var(--main-green)', border: '1px dashed var(--main-green)' }}>[HINT] {msg.message}</div>;

                    return (
                        <div key={i}
                            className={`msg ${isMe ? 'me' : 'other'} ${(isQuestioner && msg.type === 'QUESTION' && !answerMsg) ? 'clickable' : ''}`}
                            onClick={() => handleAnswer(msg)}
                        >
                            {!isMe && <div>{msg.nickname}:</div>}
                            {msg.message}
                            {answerMsg && (
                                <div className={`answer-stamp ${answerMsg.message === 'YES' ? 'stamp-yes' :
                                    answerMsg.message === 'NO' ? 'stamp-no' :
                                        answerMsg.message === 'CRITICAL' ? 'stamp-critical' : 'stamp-skip'
                                    }`}>
                                    {answerMsg.message}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            <div className="input-bar" style={{ display: 'flex', gap: '5px' }}>
                {isQuestioner && (
                    <button className="retro-btn"
                        style={{ padding: '0 10px', fontSize: '12px', background: isHintMode ? 'var(--main-green)' : '#333', color: isHintMode ? '#000' : '#888' }}
                        onClick={() => {
                            if (room.hintsLeft <= 0) return alert('힌트를 모두 사용했습니다.');
                            setIsHintMode(!isHintMode);
                        }}
                        disabled={room.hintsLeft <= 0}
                    >
                        HINT
                    </button>
                )}
                <input type="text" className="retro-input"
                    style={{ flexGrow: 1, background: '#fff', color: '#000', fontSize: '16px' }}
                    placeholder={isQuestioner ? (isHintMode ? "힌트를 입력하세요" : "답변은 질문을 클릭하세요") : "질문 입력..."}
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') sendMessage();
                    }}
                    disabled={isQuestioner && !isHintMode}
                />
                <button className="retro-btn" style={{ padding: '8px 15px 5px 15px' }} onClick={sendMessage} disabled={isQuestioner && !isHintMode}>전송</button>
            </div>

            {!isQuestioner && (
                <button className="retro-btn"
                    style={{ width: '100%', background: 'var(--alert-red)', color: '#fff', borderColor: '#500' }}
                    onClick={handleGuess}
                >
                    !!! 정답 도전 !!!
                </button>
            )}
        </div>
    );
}

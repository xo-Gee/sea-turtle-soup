import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';
import { useLanguage } from '../context/LanguageContext';

export default function GameRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { room: initialRoom } = useOutletContext();
    const [room, setRoom] = useState(initialRoom);
    const [messages, setMessages] = useState(initialRoom?.messages || []);
    const [inputMsg, setInputMsg] = useState('');
    const [pendingGuesses, setPendingGuesses] = useState([]);
    const [isProblemOpen, setIsProblemOpen] = useState(true); // Default open
    const [showScrollButton, setShowScrollButton] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const { showConfirm, showPrompt, showCustom, close } = useModal();
    const { t } = useLanguage();

    useEffect(() => {
        // Initial fetch handled by RoomGuard (context)
        // We only need to listen for updates specific to this room/game


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
                id: Date.now(), type: 'SYSTEM', message: `${guesserName}${t('gameRoom.guessFailed')}`
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

        const handleGameStarted = (updatedRoom) => {
            setRoom(updatedRoom);
            setMessages(updatedRoom.messages || []);
        };

        const handleError = (err) => {
            if (err.message !== '방을 찾을 수 없습니다.') {
                // Generic error handling
            }
        };

        socket.on('message_received', handleMessage);
        socket.on('game_over', handleGameOver);
        socket.on('guess_failed', handleGuessFailed);
        socket.on('player_update', handlePlayerUpdate);
        socket.on('game_started', handleGameStarted);
        socket.on('error', handleError);

        return () => {
            socket.off('message_received', handleMessage);
            socket.off('game_over', handleGameOver);
            socket.off('guess_failed', handleGuessFailed);
            socket.off('player_update', handlePlayerUpdate);
            socket.off('game_started', handleGameStarted);
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
        if (!showScrollButton) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showScrollButton]);

    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    };

    const myId = socket.id;
    const me = room?.players.find(p => p.id === myId);
    const isQuestioner = me?.role === 'QUESTIONER';

    // Check if all answerers have 0 guesses left
    const answerers = room?.players.filter(p => p.role === 'ANSWERER') || [];
    const allGuessesExhausted = answerers.length > 0 && answerers.every(p => p.guessesLeft <= 0);



    const handleAnswer = (targetMsg) => {
        if (!isQuestioner) return;
        if (targetMsg.type !== 'QUESTION') return;

        showCustom({
            title: t('gameRoom.selectAnswer'),
            message: `"${targetMsg.message}"\n\n${t('gameRoom.selectAnswerPrompt')}`,
            children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    <button className="retro-btn" style={{ background: 'var(--alert-red)', color: '#fff' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'YES' }); close(); }}>
                        {t('common.yes')}
                    </button>
                    <button className="retro-btn" style={{ background: 'transparent', color: 'red', border: '2px solid red' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'NO' }); close(); }}>
                        {t('common.no')}
                    </button>
                    <button className="retro-btn" style={{ background: 'transparent', color: 'var(--main-green)', border: '2px solid var(--main-green)' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'CRITICAL' }); close(); }}>
                        {t('common.critical')}
                    </button>
                    <button className="retro-btn" style={{ background: '#ccc', color: '#555' }}
                        onClick={() => { socket.emit('answer_question', { questionId: targetMsg.id, answer: 'SKIP' }); close(); }}>
                        {t('common.skip')}
                    </button>
                </div>
            )
        });
    };

    const handleGuess = async () => {
        const guess = await showPrompt(t('gameRoom.describeAnswer'), t('gameRoom.guessChallenge'));
        if (guess) {
            socket.emit('submit_guess', { guess });
        }
    };

    const handleReviewGuesses = () => {
        if (pendingGuesses.length === 0) return;

        const currentGuess = pendingGuesses[0];
        showCustom({
            title: t('gameRoom.judgeAnswer'),
            message: `${currentGuess.guesserName}${t('gameRoom.guessAttempt')}\n\n"${currentGuess.guess}"\n\n(${t('gameRoom.pending')} ${pendingGuesses.length - 1})`,
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
                        {t('gameRoom.correct')}
                    </button>
                    <button className="retro-btn" style={{ background: 'transparent', color: '#fff', border: '2px solid #fff' }}
                        onClick={() => {
                            socket.emit('judge_guess', { guesserId: currentGuess.guesserId, isCorrect: false });
                            setPendingGuesses(prev => prev.slice(1));
                            close();
                        }}>
                        {t('gameRoom.incorrect')}
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
                <span>{t('gameRoom.room')} {room.title}</span>
                <span onClick={() => { socket.emit('leave_room'); navigate('/lobby'); }} style={{ cursor: 'pointer' }}>[X]</span>
            </div>

            <div className="question-area" style={{ transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: 'var(--alert-red)', color: 'white', padding: '2px 4px 0 4px', fontSize: '12px' }}>{t('gameRoom.problem')}</span>
                        <button
                            className="retro-btn"
                            style={{ padding: '0 5px', fontSize: '10px', height: '20px', lineHeight: '20px' }}
                            onClick={() => setIsProblemOpen(!isProblemOpen)}
                        >
                            {isProblemOpen ? '▲' : '▼'}
                        </button>
                    </div>
                    {isQuestioner && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--main-green)' }}>{t('gameRoom.hintsLeft')} {room.hintsLeft}</span>

                        </div>
                    )}
                </div>

                {isProblemOpen && (
                    <>
                        <div style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--main-green)', fontSize: '1.1em' }}>
                            {room.scenario?.title}
                        </div>
                        <div style={{ marginTop: '5px', color: '#fff' }}>
                            {room.scenario?.content}
                        </div>
                        {isQuestioner && (
                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', borderTop: '1px dashed #555', paddingTop: '5px' }}>
                                {t('gameRoom.solutionLabel')} {room.scenario?.solution}
                            </div>
                        )}
                    </>
                )}
            </div>

            {isQuestioner && pendingGuesses.length > 0 && (
                <button
                    className="retro-btn"
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--alert-red)',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        animation: 'blink 1s infinite',
                        marginBottom: '10px',
                        border: '2px solid #fff',
                        cursor: 'pointer'
                    }}
                    onClick={handleReviewGuesses}
                >
                    !!! {t('gameRoom.checkAnswer')} ({pendingGuesses.length}) !!!
                </button>
            )}

            {isQuestioner && allGuessesExhausted && pendingGuesses.length === 0 && (
                <button
                    className="retro-btn"
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#333',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2em',
                        marginBottom: '10px',
                        border: '2px solid #fff',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        if (window.confirm('모든 도전 기회가 소진되었습니다. 게임을 종료하고 정답을 공개하시겠습니까?')) {
                            socket.emit('end_game');
                        }
                    }}
                >
                    [ 게임 종료 (모든 기회 소진) ]
                </button>
            )}

            <div className="chat-area" ref={chatContainerRef} onScroll={handleScroll} style={{ position: 'relative' }}>
                {/* ... messages ... */}
                <div className="msg sys">{t('gameRoom.gameStart')}</div>
                {messages.map((msg, i) => {
                    const isMe = msg.userId === myId;
                    const answerMsg = messages.find(m => m.type === 'ANSWER' && m.targetId === msg.id);

                    if (msg.type === 'ANSWER') return null;
                    if (msg.type === 'SYSTEM') return <div key={i} className="msg sys">{msg.message}</div>;
                    if (msg.type === 'HINT') return <div key={i} className="msg sys" style={{ color: 'var(--main-green)', border: '1px dashed var(--main-green)' }}>{t('gameRoom.hintLabel')} {msg.message}</div>;

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

                {showScrollButton && (
                    <button
                        className="retro-btn"
                        style={{
                            position: 'sticky',
                            bottom: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '1px solid var(--main-green)',
                            color: 'var(--main-green)',
                            zIndex: 100
                        }}
                        onClick={scrollToBottom}
                    >
                        ↓
                    </button>
                )}
            </div>

            <div className="input-bar" style={{ display: 'flex', gap: '5px', padding: '10px 0' }}>
                {isQuestioner && (
                    <button className="retro-btn"
                        style={{ padding: '0 8px', fontSize: '12px', background: isHintMode ? 'var(--main-green)' : '#333', color: isHintMode ? '#000' : '#888', whiteSpace: 'nowrap' }}
                        onClick={() => {
                            if (room.hintsLeft <= 0) return alert(t('gameRoom.noHints'));
                            setIsHintMode(!isHintMode);
                        }}
                        disabled={room.hintsLeft <= 0}
                    >
                        HINT
                    </button>
                )}
                <input type="text" className="retro-input"
                    style={{ flexGrow: 1, background: '#fff', color: '#000', fontSize: '16px', minWidth: 0 }}
                    placeholder={isQuestioner ? (isHintMode ? t('gameRoom.enterHint') : t('gameRoom.clickQuestionToAnswer')) : t('gameRoom.enterQuestion')}
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') sendMessage();
                    }}
                    disabled={isQuestioner && !isHintMode}
                />
                <button className="retro-btn" style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} onClick={sendMessage} disabled={isQuestioner && !isHintMode}>{t('gameRoom.send')}</button>
            </div>

            {!isQuestioner && (
                <button className="retro-btn"
                    style={{ width: '100%', background: (me?.guessesLeft > 0) ? 'var(--alert-red)' : '#555', color: '#fff', borderColor: '#500' }}
                    onClick={handleGuess}
                    disabled={me?.guessesLeft <= 0}
                >
                    {t('gameRoom.guessButton')} ({me?.guessesLeft ?? 0})
                </button>
            )}
        </div>
    );
}

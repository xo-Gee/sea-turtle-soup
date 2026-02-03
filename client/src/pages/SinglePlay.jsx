import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SinglePlay = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useLanguage();

    // State
    const [scenario, setScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [isGameEnd, setIsGameEnd] = useState(false);

    // UI State for compatibility with GameRoom
    const [isProblemOpen, setIsProblemOpen] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const isMounted = useRef(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Auto-scroll logic matching GameRoom
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

    // Initialize Game & Socket Listeners
    useEffect(() => {
        isMounted.current = true;

        const handleGameStarted = (data) => {
            setScenario(data.scenario);
            setMessages([]);
            setIsGameEnd(false);
            setIsProblemOpen(true);
        };

        const handleMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };

        const handleGameOver = (data) => {
            setIsGameEnd(true);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'SYSTEM',
                message: `★ 정답입니다! ★\n\n[진상]: ${data.solution}`,
                isHighlight: true
            }]);
        };

        socket.on('single_game_started', handleGameStarted);
        socket.on('single_message_received', handleMessage);
        socket.on('single_game_over', handleGameOver);

        // Start Game
        socket.emit('start_single_game');

        return () => {
            isMounted.current = false;
            socket.off('single_game_started', handleGameStarted);
            socket.off('single_message_received', handleMessage);
            socket.off('single_game_over', handleGameOver);
            socket.emit('leave_single_game');
        };
    }, []);

    const handleSendMessage = () => {
        if (!inputMsg.trim() || isGameEnd) return;

        const userMsg = inputMsg.trim();
        setInputMsg('');
        socket.emit('single_chat', { message: userMsg });
    };

    return (
        <div id="screen-game" className={`single-play-container ${theme}`} style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--bg-color)', // Fallback if css not applied
        }}>
            {/* Header */}
            <div className="game-header">
                <span>{t('gameRoom.room') || 'Room'} AI 모드 {scenario && `- ${scenario.title}`}</span>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>[X]</span>
            </div>

            {/* Question Area - Matches GameRoom */}
            <div className="question-area" style={{ transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: 'var(--alert-red)', color: 'white', padding: '2px 4px 0 4px', fontSize: '12px' }}>
                            {t('gameRoom.problem') || 'PROBLEM'}
                        </span>
                        <button
                            className="retro-btn"
                            style={{ padding: '0 5px', fontSize: '10px', height: '20px', lineHeight: '20px' }}
                            onClick={() => setIsProblemOpen(!isProblemOpen)}
                        >
                            {isProblemOpen ? '▲' : '▼'}
                        </button>
                    </div>
                </div>

                {isProblemOpen && scenario && (
                    <>
                        <div style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--main-green)', fontSize: '1.1em' }}>
                            {scenario.title}
                        </div>
                        <div style={{ marginTop: '5px', color: 'var(--list-text)' }}>
                            {scenario.content}
                        </div>
                    </>
                )}
            </div>

            {/* Chat Area */}
            <div className="chat-area" ref={chatContainerRef} onScroll={handleScroll} style={{ position: 'relative' }}>


                {messages.map((msg, idx) => {
                    const isSystem = msg.type === 'SYSTEM';

                    if (isSystem) {
                        return <div key={idx} className="msg sys" style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>;
                    }

                    // For Single Player, user sends QUESTION. AI sends ANSWER with targetId.
                    // We render QUESTION messages, and overlay the ANSWER if it exists.
                    // We do NOT render ANSWER messages as separate bubbles.
                    if (msg.type === 'ANSWER') return null;

                    const answerMsg = messages.find(m => m.type === 'ANSWER' && m.targetId === msg.id);
                    const isMe = msg.userId === socket.id;

                    return (
                        <div key={idx} className={`msg ${isMe ? 'me' : 'other'} clickable`}>
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

                {isGameEnd && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button className="retro-btn"
                            style={{ padding: '10px 20px', background: 'var(--primary-btn-bg)', color: 'var(--primary-btn-text)' }}
                            onClick={() => socket.emit('start_single_game')}
                        >
                            다음 문제 풀기
                        </button>
                    </div>
                )}

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
                            background: 'var(--panel-bg)',
                            border: '1px solid var(--win-border-color)',
                            color: 'var(--text-color)',
                            zIndex: 100,
                            boxShadow: '2px 2px 0px var(--win-shadow-color)'
                        }}
                        onClick={scrollToBottom}
                    >
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>↓</span>
                    </button>
                )}
            </div>

            {/* Input Bar */}
            <div className="input-bar" style={{ display: 'flex', gap: '5px', padding: '10px 0' }}>
                <input type="text" className="retro-input"
                    style={{ flexGrow: 1, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '16px', minWidth: 0 }}
                    placeholder={isGameEnd ? "게임이 종료되었습니다." : "질문을 입력하세요..."}
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                    disabled={isGameEnd}
                />
                <button className="retro-btn"
                    style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}
                    onClick={handleSendMessage}
                    disabled={isGameEnd}
                >
                    {t('gameRoom.send') || 'Send'}
                </button>
            </div>
        </div>
    );
};

export default SinglePlay;

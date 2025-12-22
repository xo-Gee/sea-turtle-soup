import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';
import { useLanguage } from '../context/LanguageContext';

export default function WaitingRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { room: initialRoom } = useOutletContext();
    const [room, setRoom] = useState(initialRoom);
    const [chatMsg, setChatMsg] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const { showAlert, showCustom, close } = useModal();
    const { t } = useLanguage();

    useEffect(() => {
        // If no room data, we might need to fetch it or rely on socket events
        // Since we joined/created, we should receive updates.
        // But if we refresh, we lose state. 
        // For prototype, we assume navigation from Lobby.
        // If refresh, we might need to re-join or get state.
        // Let's just listen for updates.

        const handlePlayerJoined = (updatedRoom) => setRoom(updatedRoom);
        const handlePlayerLeft = (updatedRoom) => setRoom(updatedRoom);
        const handlePlayerUpdate = (updatedRoom) => setRoom(updatedRoom);
        const handleGameStarted = (updatedRoom) => {
            close();
            navigate(`/game/${updatedRoom.roomId}`);
        };

        // We can reuse the chat event for lobby chat too if we want
        // But gameHandler handles 'message_received'. 
        // Let's add a simple chat handler here too or reuse game one if it's generic.
        // The server sends 'message_received' for room messages.
        const handleMessage = (msg) => {
            setChatLog(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };



        const handleError = (err) => {
            // RoomGuard handles 'Room not found', handle other errors here if needed
            if (err.message !== '방을 찾을 수 없습니다.' && err.message !== 'Room not found.') {
                showAlert(err.message, t('common.error'));
            }
        };

        socket.on('player_joined', handlePlayerJoined);
        socket.on('player_left', handlePlayerLeft);
        socket.on('player_update', handlePlayerUpdate);
        socket.on('game_started', handleGameStarted);
        socket.on('message_received', handleMessage);

        // Initial fetch if needed? 
        // Actually, when we join, we get 'joined_room' event with room data.
        // But if we are here, we might have missed it if we navigated too fast?
        // No, navigation happens AFTER event.
        // But we need to store room state. 
        // Let's use a ref or just wait for update.
        // Better: Lobby passes state? No, URL params.
        // Let's emit 'get_room_info' if we want to be robust, but for now let's rely on 'joined_room' 
        // setting initial state in a global store or context?
        // Since I don't have Redux, I'll just use local state.
        // Issue: 'joined_room' was handled in Lobby to navigate here.
        // So this component mounts AFTER 'joined_room'.
        // We need to fetch room info on mount.
        // I'll add 'get_room' to server or just use 'join_room' again?
        // No, 'join_room' adds player.
        // I'll add 'get_room_state' to server roomHandler.
        socket.emit('get_room_state', roomId);
        // Wait, I didn't implement 'get_room_state' in server.
        // I should add it. Or just use 'join_room' with same info?
        // If I rejoin, it might duplicate or error.
        const handleRoomData = (r) => {
            setRoom(r);
        };

        socket.on('room_data', handleRoomData);

        socket.on('room_data', handleRoomData);

        // Request specific room data - RoomGuard already fetched it, but we might want fresh data? 
        // Actually RoomGuard's data is fresh enough for mounting.
        // We can skip emitting 'get_room' here to avoid redundant traffic.
        // socket.emit('get_room', roomId);

        const handleInputScenario = () => {
            // Custom Scenario Input
            let title = '';
            let problem = '';
            let solution = '';

            showCustom({
                title: t('waitingRoom.createScenario'),
                message: t('waitingRoom.enterScenarioInfo'),
                children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <input
                            type="text"
                            className="retro-input"
                            placeholder={t('waitingRoom.titlePlaceholder')}
                            onChange={(e) => title = e.target.value}
                        />
                        <textarea
                            className="retro-input"
                            placeholder={t('waitingRoom.problemPlaceholder')}
                            style={{ height: '80px', resize: 'none' }}
                            onChange={(e) => problem = e.target.value}
                        />
                        <textarea
                            className="retro-input"
                            placeholder={t('waitingRoom.solutionPlaceholder')}
                            style={{ height: '80px', resize: 'none' }}
                            onChange={(e) => solution = e.target.value}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="retro-btn" style={{ flex: 1, background: 'var(--alert-red)', color: '#fff' }}
                                onClick={() => {
                                    if (!title.trim() || !problem.trim() || !solution.trim()) return alert(t('waitingRoom.enterAllFields'));
                                    socket.emit('submit_scenario', { customScenario: { title: title, content: problem, solution: solution } });
                                    close();
                                }}
                            >
                                {t('waitingRoom.startGame')}
                            </button>
                        </div>
                    </div>
                )
            });
        };

        const handleWaitingScenario = () => {
            showAlert(t('waitingRoom.questionerCreating'), t('waitingRoom.waiting'));
        };

        socket.on('player_joined', handlePlayerJoined);
        socket.on('player_left', handlePlayerLeft);
        socket.on('player_update', handlePlayerUpdate);


        socket.on('player_joined', handlePlayerJoined);
        socket.on('player_left', handlePlayerLeft);
        socket.on('player_update', handlePlayerUpdate);
        socket.on('game_started', handleGameStarted);
        socket.on('game_started', handleGameStarted);
        socket.on('message_received', handleMessage);
        socket.on('error', handleError);

        socket.on('input_scenario', handleInputScenario);
        socket.on('waiting_scenario', handleWaitingScenario);

        return () => {
            socket.off('player_joined', handlePlayerJoined);
            socket.off('player_left', handlePlayerLeft);
            socket.off('player_update', handlePlayerUpdate);
            socket.off('game_started', handleGameStarted);
            socket.off('message_received', handleMessage);
            socket.off('error', handleError);
            socket.off('room_data', handleRoomData);
            socket.off('input_scenario', handleInputScenario);
            socket.off('waiting_scenario', handleWaitingScenario);
        };
    }, [roomId, navigate, showCustom, showAlert, close]);

    useEffect(() => {
        if (!showScrollButton) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatLog, showScrollButton]);

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
    const isHost = me?.isHost;

    const handleToggleRole = () => {
        // Toggle between QUESTIONER and ANSWERER
        // But only if slot is empty or I am the questioner
        const targetRole = me.role === 'QUESTIONER' ? 'ANSWERER' : 'QUESTIONER';
        socket.emit('set_role', { role: targetRole });
    };

    const handleReady = () => {
        socket.emit('set_ready', { isReady: !me.isReady });
    };



    const sendChat = () => {
        if (!chatMsg.trim()) return;
        socket.emit('send_chat', { message: chatMsg });
        setChatMsg('');
    };

    if (!room) return <div style={{ color: 'white' }}>Loading...</div>;

    const questioner = room.players.find(p => p.role === 'QUESTIONER');

    return (
        <div id="screen-waiting" style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="top-bar" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '15px', borderBottom: '2px dashed var(--main-green)', paddingBottom: '10px'
            }}>
                <button className="retro-btn" style={{ fontSize: '14px' }} onClick={() => {
                    socket.emit('leave_room');
                    navigate('/lobby');
                }}>◀</button>
                <span>{t('waitingRoom.room')} {room.title}</span>
            </div>

            {/* Questioner Slot */}
            <div className="win-box"
                style={{
                    textAlign: 'center', padding: '10px', cursor: 'pointer',
                    background: questioner ? 'var(--list-bg)' : 'transparent',
                    borderStyle: questioner ? 'solid' : 'dashed'
                }}
                onClick={handleToggleRole}
            >
                {questioner ? (
                    <div>
                        <div style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>{t('waitingRoom.questioner')}</div>
                        <div style={{ fontSize: '20px', marginTop: '10px' }}>{questioner.nickname}</div>
                        {questioner.id === myId && <div style={{ fontSize: '12px', color: '#666' }}>{t('waitingRoom.clickToCancel')}</div>}
                    </div>
                ) : (
                    <div style={{ color: '#666' }}>
                        <div>{t('waitingRoom.questionerVacant')}</div>
                        <div style={{ fontSize: '12px', marginTop: '5px' }}>{t('waitingRoom.clickToApply')}</div>
                    </div>
                )}
            </div>

            {/* Player Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
                {room.players.filter(p => p.role !== 'QUESTIONER').map(p => (
                    <div key={p.id} className="win-box" style={{
                        margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderColor: p.isReady ? 'var(--main-green)' : '#555'
                    }}>
                        <span>{p.nickname} {p.isHost && '👑'}</span>
                        <span style={{
                            fontSize: '12px',
                            color: p.isReady ? 'var(--main-green)' : '#555'
                        }}>
                            {p.isReady ? 'READY' : '...'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="chat-area" ref={chatContainerRef} onScroll={handleScroll} style={{ flexGrow: 1, marginBottom: '10px', border: '1px solid #333', position: 'relative' }}>
                {chatLog.map((msg, i) => (
                    <div key={i} style={{ fontSize: '14px', marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>{msg.nickname}:</span> {msg.message}
                    </div>
                ))}
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
            <div className="input-bar" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <input type="text" className="retro-input" style={{ flexGrow: 1, fontSize: '14px' }}
                    value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') sendChat();
                    }}
                    placeholder={t('waitingRoom.chatPlaceholder')}
                />
            </div>

            {/* Action Button */}
            <div style={{ marginTop: '10px' }}>
                {isHost ? (
                    <button className="retro-btn"
                        style={{ width: '100%', background: 'var(--alert-red)', color: '#fff', opacity: (questioner && room.players.every(p => p.isReady) && room.players.length >= 2) ? 1 : 0.5 }}
                        disabled={!questioner || !room.players.every(p => p.isReady) || room.players.length < 2}
                        onClick={() => {
                            if (room.players.length < 2) return showAlert(t('waitingRoom.minPlayersWarning'));
                            socket.emit('request_start');
                        }}
                    >
                        {t('waitingRoom.startGame')}
                    </button>
                ) : (
                    <button className="retro-btn"
                        style={{
                            width: '100%',
                            background: me?.isReady ? 'var(--highlight-bg)' : 'var(--primary-btn-bg)',
                            color: me?.isReady ? 'var(--highlight-text)' : 'var(--primary-btn-text)'
                        }}
                        onClick={handleReady}
                    >
                        {me?.isReady ? t('waitingRoom.ready') : t('waitingRoom.getReady')}
                    </button>
                )}
            </div>
        </div>
    );
}

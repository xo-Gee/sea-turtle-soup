import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';

export default function WaitingRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [chatMsg, setChatMsg] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const { showAlert, showCustom, close } = useModal();

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
            if (err.message === '방을 찾을 수 없습니다.') {
                navigate('/not-found');
            } else {
                showAlert(err.message, '오류');
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

        // Request specific room data
        socket.emit('get_room', roomId);

        const handleInputScenario = () => {
            // Custom Scenario Input
            let title = '';
            let problem = '';
            let solution = '';

            const { close } = showCustom({
                title: '문제 출제',
                message: '이번 게임에서 사용할 문제와 정답을 입력해주세요.',
                children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <input
                            type="text"
                            className="retro-input"
                            placeholder="제목 (예: 바다거북 수프)"
                            onChange={(e) => title = e.target.value}
                        />
                        <textarea
                            className="retro-input"
                            placeholder="문제 (상황 설명)"
                            style={{ height: '80px', resize: 'none' }}
                            onChange={(e) => problem = e.target.value}
                        />
                        <textarea
                            className="retro-input"
                            placeholder="정답 (진상)"
                            style={{ height: '80px', resize: 'none' }}
                            onChange={(e) => solution = e.target.value}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="retro-btn" style={{ flex: 1, background: 'var(--alert-red)', color: '#fff' }}
                                onClick={() => {
                                    if (!title.trim() || !problem.trim() || !solution.trim()) return alert('제목, 문제, 정답을 모두 입력해주세요.');
                                    socket.emit('submit_scenario', { customScenario: { title: title, content: problem, solution: solution } });
                                    close();
                                }}
                            >
                                게임 시작
                            </button>
                        </div>
                    </div>
                )
            });
        };

        const handleWaitingScenario = () => {
            showAlert('출제자가 문제를 입력 중입니다...\n잠시만 기다려주세요.', '대기 중');
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
                }}>&lt; 뒤로가기</button>
                <span>Room: {room.title}</span>
            </div>

            {/* Questioner Slot */}
            <div className="win-box"
                style={{
                    textAlign: 'center', padding: '20px', cursor: 'pointer',
                    background: questioner ? '#000' : '#111',
                    borderStyle: questioner ? 'solid' : 'dashed'
                }}
                onClick={handleToggleRole}
            >
                {questioner ? (
                    <div>
                        <div style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>[ 출제자 ]</div>
                        <div style={{ fontSize: '20px', marginTop: '10px' }}>{questioner.nickname}</div>
                        {questioner.id === myId && <div style={{ fontSize: '12px', color: '#666' }}>(클릭하여 취소)</div>}
                    </div>
                ) : (
                    <div style={{ color: '#666' }}>
                        <div>[ 출제자 공석 ]</div>
                        <div style={{ fontSize: '12px', marginTop: '5px' }}>클릭하여 지원하세요</div>
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
            <div className="chat-area" style={{ flexGrow: 1, marginBottom: '10px', border: '1px solid #333' }}>
                {chatLog.map((msg, i) => (
                    <div key={i} style={{ fontSize: '14px', marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>{msg.nickname}:</span> {msg.message}
                    </div>
                ))}
            </div>
            <div className="input-bar" style={{ padding: 0, background: 'transparent', border: 'none' }}>
                <input type="text" className="retro-input" style={{ flexGrow: 1, fontSize: '14px' }}
                    value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') sendChat();
                    }}
                    placeholder="채팅..."
                />
            </div>

            {/* Action Button */}
            <div style={{ marginTop: '10px' }}>
                {isHost ? (
                    <button className="retro-btn"
                        style={{ width: '100%', background: 'var(--alert-red)', color: '#fff', opacity: (questioner && room.players.every(p => p.isReady) && room.players.length >= 2) ? 1 : 0.5 }}
                        disabled={!questioner || !room.players.every(p => p.isReady) || room.players.length < 2}
                        onClick={() => {
                            if (room.players.length < 2) return showAlert('최소 2명 이상의 플레이어가 필요합니다.');
                            socket.emit('request_start');
                        }}
                    >
                        게임 시작
                    </button>
                ) : (
                    <button className="retro-btn"
                        style={{ width: '100%', background: me?.isReady ? 'var(--dim-green)' : 'var(--main-green)', color: '#000' }}
                        onClick={handleReady}
                    >
                        {me?.isReady ? '준비 완료!' : '준비하기'}
                    </button>
                )}
            </div>
        </div>
    );
}

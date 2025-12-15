import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import CreateRoomModal from '../components/CreateRoomModal';
import { useModal } from '../context/ModalContext';
import { useLanguage } from '../context/LanguageContext';

export default function Lobby() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const nickname = sessionStorage.getItem('nickname');

    const { showAlert, showPrompt } = useModal();
    const { t } = useLanguage();

    useEffect(() => {
        if (!nickname) {
            navigate('/');
            return;
        }

        // Request initial room list
        socket.emit('get_rooms');

        const handleRoomListUpdate = (updatedRooms) => {
            setRooms(updatedRooms);
        };

        const handleJoinedRoom = (room) => {
            navigate(`/room/${room.roomId}`);
        };

        const handleRoomCreated = (room) => {
            navigate(`/room/${room.roomId}`);
        };

        const handleError = (err) => {
            showAlert(err.message, t('common.error'));
        };

        socket.on('room_list_update', handleRoomListUpdate);
        socket.on('joined_room', handleJoinedRoom);
        socket.on('room_created', handleRoomCreated);
        socket.on('error', handleError);

        return () => {
            socket.off('room_list_update', handleRoomListUpdate);
            socket.off('joined_room', handleJoinedRoom);
            socket.off('room_created', handleRoomCreated);
            socket.off('error', handleError);
        };
    }, [navigate, nickname, showAlert]);

    const handleJoinRoom = async (roomId, isPrivate) => {
        let password = null;
        if (isPrivate) {
            password = await showPrompt(t('lobby.enterPassword'), t('lobby.privateRoom'));
            if (password === null) return; // Cancelled
        }
        socket.emit('join_room', { roomId, nickname, password });
    };

    return (
        <div id="screen-lobby" style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="top-bar" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '15px', borderBottom: '2px dashed var(--main-green)', paddingBottom: '10px'
            }}>
                <span>{t('lobby.user')} {nickname}</span>
                <button className="retro-btn" style={{ fontSize: '14px' }} onClick={() => navigate('/')}>{t('lobby.exit')}</button>
            </div>

            <div className="win-box" style={{ textAlign: 'center', marginBottom: '20px' }}>
                {t('lobby.title')}
                <div style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>v0.4.0</div>
            </div>

            <div className="room-list" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>{t('lobby.noRooms')}</div>
                ) : (
                    rooms.map(room => (
                        <div key={room.roomId} className="room-item"
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#000', border: '1px solid var(--dim-green)', padding: '10px', cursor: 'pointer'
                            }}
                            onClick={() => handleJoinRoom(room.roomId, !!room.password)}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{room.title} {room.password ? '🔒' : ''}</div>
                                <div style={{ fontSize: '14px', color: '#888' }}>{t('lobby.host')} {room.players.find(p => p.isHost)?.nickname}</div>
                            </div>
                            <span className={`status-badge ${room.status === 'WAITING' ? 'wait' : ''}`}
                                style={{
                                    fontSize: '14px', padding: '4px 5px 2px 5px',
                                    background: room.status === 'WAITING' ? 'blue' : '#555',
                                    color: '#fff', lineHeight: 1
                                }}>
                                {room.status === 'WAITING' ? `${room.players.length}/${room.maxPlayers}` : t('lobby.playing')}
                            </span>
                        </div>
                    ))
                )}

                <div className="room-item" style={{ borderStyle: 'dashed', justifyContent: 'center', color: '#555' }}>
                    {t('lobby.endOfList')}
                </div>
            </div>

            <button className="retro-btn"
                style={{ marginTop: 'auto', background: 'var(--main-green)', color: '#000' }}
                onClick={() => setShowModal(true)}
            >
                {t('lobby.createRoom')}
            </button>

            {showModal && <CreateRoomModal onClose={() => setShowModal(false)} nickname={nickname} />}
        </div>
    );
}

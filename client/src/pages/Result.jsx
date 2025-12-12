import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useLanguage } from '../context/LanguageContext';

export default function Result() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        socket.emit('get_rooms');
        const handleRoomList = (rooms) => {
            const r = rooms.find(r => r.roomId === roomId);
            if (r) {
                setRoom(r);
            } else {
                navigate('/not-found');
            }
        };
        socket.on('room_list_update', handleRoomList);
        return () => socket.off('room_list_update', handleRoomList);
    }, [roomId]);

    if (!room) return <div style={{ color: 'white' }}>Loading...</div>;

    return (
        <div id="screen-result" style={{
            display: 'flex', flexDirection: 'column', height: '100%', padding: '20px',
            textAlign: 'center', justifyContent: 'center', gap: '20px'
        }}>
            <div className="win-box" style={{ borderColor: 'var(--alert-red)', background: '#000' }}>
                <h1 style={{ color: 'var(--alert-red)', margin: '10px 0' }}>{t('result.gameOver')}</h1>
                <div style={{ fontSize: '14px', color: '#fff' }}>{t('result.winner')} {room.winner}</div>
            </div>

            <div className="win-box" style={{ textAlign: 'left', padding: '15px' }}>
                <div style={{ color: 'var(--main-green)', marginBottom: '10px', borderBottom: '1px dashed #555' }}>
                    {t('result.truthRevealed')}
                </div>
                <div style={{ lineHeight: '1.6', color: '#fff' }}>
                    {room.scenario?.solution}
                </div>
            </div>

            <div className="win-box">
                <div>{t('result.totalTime')} {Math.floor((Date.now() - room.startTime) / 1000 / 60)}{t('result.minutes')}</div>
                <div>{t('result.totalQuestions')} {room.messages.filter(m => m.type === 'QUESTION').length}</div>
            </div>

            <button className="retro-btn"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => {
                    socket.emit('reset_room');
                    navigate(`/room/${roomId}`);
                }}
            >
                {t('result.returnToWaiting')}
            </button>
        </div>
    );
}

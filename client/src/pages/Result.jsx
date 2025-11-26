import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

export default function Result() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);

    useEffect(() => {
        socket.emit('get_rooms');
        const handleRoomList = (rooms) => {
            const r = rooms.find(r => r.roomId === roomId);
            if (r) setRoom(r);
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
                <h1 style={{ color: 'var(--alert-red)', margin: '10px 0' }}>GAME OVER</h1>
                <div style={{ fontSize: '14px', color: '#fff' }}>정답자: {room.winner}</div>
            </div>

            <div className="win-box" style={{ textAlign: 'left', padding: '15px' }}>
                <div style={{ color: 'var(--main-green)', marginBottom: '10px', borderBottom: '1px dashed #555' }}>
                    [ 진상 공개 ]
                </div>
                <div style={{ lineHeight: '1.6', color: '#fff' }}>
                    {room.scenario?.solution}
                </div>
            </div>

            <div className="win-box">
                <div>총 소요 시간: {Math.floor((Date.now() - room.startTime) / 1000 / 60)}분</div>
                <div>총 질문 수: {room.messages.filter(m => m.type === 'QUESTION').length}개</div>
            </div>

            <button className="retro-btn"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => {
                    socket.emit('reset_room');
                    navigate(`/room/${roomId}`);
                }}
            >
                대기실로 돌아가기
            </button>
        </div>
    );
}

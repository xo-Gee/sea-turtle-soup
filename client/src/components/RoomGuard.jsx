import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { socket } from '../socket';
import { useLanguage } from '../context/LanguageContext';

export default function RoomGuard() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        // Reset state on roomId change
        setIsLoading(true);
        setRoom(null);

        // Limit timeout in case server doesn't respond
        const timeout = setTimeout(() => {
            if (isLoading) {
                // navigate('/not-found'); // Optional: timeout to 404? Or show error?
            }
        }, 5000);

        const handleRoomData = (data) => {
            if (data.roomId === roomId) {
                setRoom(data);
                setIsLoading(false);
                clearTimeout(timeout);
            }
        };

        const handleError = (err) => {
            // Check for specific error message from server (roomHandler.js)
            if (err.message === '방을 찾을 수 없습니다.' || err.message === 'Room not found.') {
                navigate('/not-found');
            }
        };

        socket.on('room_data', handleRoomData);
        socket.on('error', handleError);

        // Request room data
        socket.emit('get_room', roomId);

        return () => {
            socket.off('room_data', handleRoomData);
            socket.off('error', handleError);
            clearTimeout(timeout);
        };
    }, [roomId, navigate]);

    if (isLoading) {
        return (
            <div style={{
                height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: 'var(--main-green)', fontFamily: 'DOSMyungjo'
            }}>
                LOADING ROOM DATA...
            </div>
        );
    }

    // Pass room data to child routes via context
    return <Outlet context={{ room }} />;
}

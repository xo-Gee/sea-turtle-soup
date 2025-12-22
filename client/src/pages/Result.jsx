import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { socket } from '../socket';
import { useLanguage } from '../context/LanguageContext';

export default function Result() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { room } = useOutletContext();
    const { t } = useLanguage();

    // RoomGuard ensures 'room' is present. If it wasn't, we'd be in 404.
    // However, if we need to listen for updates (unlikely for result page unless restart), we can add listeners.
    // For Result page, static data from RoomGuard is usually enough.

    // useEffect(() => { ... remove old logic ... }, []);

    return (
        <div id="screen-result" style={{
            display: 'flex', flexDirection: 'column', height: '100%', padding: '20px',
            textAlign: 'center', justifyContent: 'center', gap: '20px'
        }}>
            <div className="win-box" style={{ borderColor: 'var(--alert-red)', background: 'var(--list-bg)' }}>
                <h1 style={{ color: 'var(--alert-red)', margin: '10px 0' }}>{t('result.gameOver')}</h1>
                <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>{t('result.winner')} {room.winner}</div>
            </div>

            <div className="win-box" style={{ textAlign: 'left', padding: '15px' }}>
                <div style={{ color: 'var(--main-green)', marginBottom: '10px', borderBottom: '1px dashed #555' }}>
                    {t('result.truthRevealed')}
                </div>
                <div style={{ lineHeight: '1.6', color: 'var(--list-text)' }}>
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

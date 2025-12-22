import { useState } from 'react';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';
import { useLanguage } from '../context/LanguageContext';

export default function CreateRoomModal({ onClose, nickname }) {
    const [title, setTitle] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [maxHints, setMaxHints] = useState(2);
    const [maxGuesses, setMaxGuesses] = useState(2);
    const [password, setPassword] = useState('');

    const { showAlert } = useModal();
    const { t } = useLanguage();

    const handleCreate = () => {
        if (!title.trim()) return showAlert(t('lobby.enterRoomTitle'));
        socket.emit('create_room', { title, maxPlayers, password, nickname, maxHints, maxGuesses });
        onClose();
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="win-box" style={{ width: '80%' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--main-green)', paddingBottom: '10px' }}>{t('lobby.createRoomTitle')}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label>{t('lobby.roomTitleLabel')}</label>
                        <input type="text" className="retro-input" style={{ width: '100%', boxSizing: 'border-box' }}
                            value={title} maxLength={20} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label>{t('lobby.maxPlayersLabel')} {maxPlayers}{t('lobby.people')}</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button className="retro-btn" style={{ width: '40px' }}
                                onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}>-</button>
                            <div className="retro-input" style={{ flexGrow: 1, textAlign: 'center' }}>{maxPlayers}</div>
                            <button className="retro-btn" style={{ width: '40px' }}
                                onClick={() => setMaxPlayers(Math.min(10, maxPlayers + 1))}>+</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>{t('lobby.maxHints')} {maxHints}</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button className="retro-btn" style={{ width: '30px' }}
                                    onClick={() => setMaxHints(Math.max(0, maxHints - 1))}>-</button>
                                <div className="retro-input" style={{ flexGrow: 1, textAlign: 'center' }}>{maxHints}</div>
                                <button className="retro-btn" style={{ width: '30px' }}
                                    onClick={() => setMaxHints(Math.min(5, maxHints + 1))}>+</button>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>{t('lobby.maxGuesses')} {maxGuesses}</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button className="retro-btn" style={{ width: '30px' }}
                                    onClick={() => setMaxGuesses(Math.max(1, maxGuesses - 1))}>-</button>
                                <div className="retro-input" style={{ flexGrow: 1, textAlign: 'center' }}>{maxGuesses}</div>
                                <button className="retro-btn" style={{ width: '30px' }}
                                    onClick={() => setMaxGuesses(Math.min(5, maxGuesses + 1))}>+</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label>{t('lobby.passwordLabel')}</label>
                        <input type="password" className="retro-input" style={{ width: '100%', boxSizing: 'border-box' }}
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="retro-btn" style={{ flexGrow: 1 }} onClick={onClose}>{t('common.cancel')}</button>
                        <button className="retro-btn" style={{ flexGrow: 1, background: 'var(--alert-red)', color: '#fff' }} onClick={handleCreate}>{t('lobby.create')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


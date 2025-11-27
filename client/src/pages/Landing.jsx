import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useModal } from '../context/ModalContext';
import { useLanguage } from '../context/LanguageContext';


export default function Landing() {
    const [nickname, setNickname] = useState('');
    const [visitorCount, setVisitorCount] = useState(0);
    const navigate = useNavigate();

    const { showAlert, showCustom, close } = useModal();
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        socket.on('visitor_count', (count) => {
            setVisitorCount(count);
        });
        return () => {
            socket.off('visitor_count');
        };
    }, []);

    const handleLanguageClick = () => {
        showCustom({
            title: t('landing.languageSelect'),
            message: null,
            children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    <button className="retro-btn" style={{ background: language === 'ko' ? 'var(--main-green)' : 'transparent', color: language === 'ko' ? '#000' : 'var(--main-green)' }}
                        onClick={() => { setLanguage('ko'); close(); }}>
                        한국어 (Korean)
                    </button>
                    <button className="retro-btn" style={{ background: language === 'en' ? 'var(--main-green)' : 'transparent', color: language === 'en' ? '#000' : 'var(--main-green)' }}
                        onClick={() => { setLanguage('en'); close(); }}>
                        English
                    </button>
                    <button className="retro-btn" style={{ background: language === 'ja' ? 'var(--main-green)' : 'transparent', color: language === 'ja' ? '#000' : 'var(--main-green)' }}
                        onClick={() => { setLanguage('ja'); close(); }}>
                        日本語 (Japanese)
                    </button>
                    <button className="retro-btn" style={{ background: language === 'es' ? 'var(--main-green)' : 'transparent', color: language === 'es' ? '#000' : 'var(--main-green)' }}
                        onClick={() => { setLanguage('es'); close(); }}>
                        Español (Spanish)
                    </button>
                    <button className="retro-btn" style={{ background: language === 'fr' ? 'var(--main-green)' : 'transparent', color: language === 'fr' ? '#000' : 'var(--main-green)' }}
                        onClick={() => { setLanguage('fr'); close(); }}>
                        Français (French)
                    </button>
                </div>
            )
        });
    };

    const handleEnter = () => {
        if (!nickname.trim()) return showAlert(t('landing.enterNickname'));

        // Store nickname in session storage or just pass it via socket later
        // For now, we'll just navigate. Socket ID will be the user ID.
        // We can emit 'login' or just send nickname when creating/joining room.
        // Let's store it in sessionStorage for persistence across refreshes if needed,
        // but for this SPA, state is fine if we pass it. 
        // Actually, better to store in sessionStorage so we can retrieve it easily.
        sessionStorage.setItem('nickname', nickname);

        navigate('/lobby');
    };

    return (
        <div id="screen-landing" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center',
            background: 'radial-gradient(circle, #001100 0%, #000000 90%)',
            position: 'relative'
        }}>
            <button
                className="retro-btn"
                style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '12px', padding: '5px 10px' }}
                onClick={handleLanguageClick}
            >
                [ LANGUAGE ]
            </button>

            <img src="/logo.png" alt="Sea Turtle Soup Logo" style={{ maxWidth: '100%', marginBottom: '30px' }} />

            <div className="win-box" style={{ width: '100%', boxSizing: 'border-box' }}>
                <p style={{ margin: 0, textAlign: 'left' }}>{t('landing.systemLogin')}</p>
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <input
                    type="text"
                    className="retro-input"
                    placeholder={t('landing.nicknamePlaceholder')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
                />
                <button className="retro-btn" style={{ width: '100%', height: '50px' }} onClick={handleEnter}>
                    {t('landing.enter')}
                </button>
            </div>

            {/* <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
                Total Visitors: <span style={{ color: 'red' }}>{String(visitorCount).padStart(5, '0')}</span>
            </div> */}

            <div className="marquee-container">
                <marquee scrolldelay="100">{t('landing.welcome')}</marquee>
            </div>
        </div>
    );
}

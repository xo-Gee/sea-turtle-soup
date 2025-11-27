import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Credits() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div style={{ padding: '20px', color: 'var(--main-green)', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
            <button className="retro-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px', position: 'absolute', top: '20px', left: '20px' }}>
                {t('common.back')}
            </button>
            <h1 style={{ marginTop: '50px' }}>Credits</h1>
            <div className="win-box" style={{ padding: '40px', display: 'inline-block', minWidth: '300px' }}>
                <h2 style={{ borderBottom: '1px dashed var(--main-green)', paddingBottom: '10px', marginBottom: '20px' }}>Special Thanks To</h2>
                <div style={{ fontSize: '1.2em', lineHeight: '2' }}>
                    <p>김널븐</p>
                    <p>민뿡</p>
                </div>
            </div>
            <div style={{ marginTop: '50px', fontSize: '0.8em', opacity: 0.7 }}>
                <p>Developed by xo-Gee</p>
                <p>Powered by React, Socket.io, and Retro Vibes</p>
            </div>
        </div>
    );
}

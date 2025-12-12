import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import notFoundImage from '../assets/404.png'; // Assuming the image will be placed here

export default function NotFound() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div id="screen-not-found" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
            <img src={notFoundImage} alt="404 Not Found" style={{ maxWidth: '100%', marginBottom: '20px', imageRendering: 'pixelated' }} />
            <div className="win-box" style={{ marginBottom: '20px', borderColor: 'var(--alert-red)' }}>
                <h2 style={{ color: 'var(--alert-red)', margin: '0 0 10px 0' }}>{t('notFound.title')}</h2>
                <div style={{ color: '#fff' }}>{t('notFound.message')}</div>
                <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>{t('notFound.desc')}</div>
            </div>
            <button className="retro-btn" onClick={() => navigate('/')}>
                {t('notFound.home')}
            </button>
        </div>
    );
}

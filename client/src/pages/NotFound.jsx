import { useNavigate } from 'react-router-dom';
import notFoundImage from '../assets/404.png'; // Assuming the image will be placed here

export default function NotFound() {
    const navigate = useNavigate();

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
                <h2 style={{ color: 'var(--alert-red)', margin: '0 0 10px 0' }}>ERROR 404</h2>
                <div style={{ color: '#fff' }}>페이지를 찾을 수 없습니다.</div>
                <div style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>존재하지 않는 방이거나 잘못된 주소입니다.</div>
            </div>
            <button className="retro-btn" onClick={() => navigate('/')}>
                메인으로 이동
            </button>
        </div>
    );
}

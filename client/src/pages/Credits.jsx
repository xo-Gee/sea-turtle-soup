import { useNavigate } from 'react-router-dom';

export default function Credits() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', color: 'var(--main-green)', height: '100%', overflowY: 'auto', textAlign: 'center' }}>
            <button className="retro-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px', position: 'absolute', top: '20px', left: '20px', fontSize: '20px', padding: '5px 15px' }}>
                ◀
            </button>
            <h1 style={{ marginTop: '50px' }}>Credits</h1>
            <div className="win-box" style={{ padding: '40px', display: 'inline-block', minWidth: '300px' }}>
                <h2 style={{ borderBottom: '1px dashed var(--main-green)', paddingBottom: '10px', marginBottom: '20px' }}>Special Thanks To</h2>
                <div style={{ fontSize: '1.2em', lineHeight: '2' }}>
                    <p>김널븐</p>
                    <p>민뿡</p>
                </div>
            </div>
        </div>
    );
}

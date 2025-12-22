import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            onClick={toggleTheme}
            style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                cursor: 'pointer',
                width: '50px',
                height: '24px',
                background: theme === 'light' ? '#fff' : '#000',
                border: theme === 'light' ? '2px solid #808080' : '2px solid var(--main-green)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                boxShadow: theme === 'light' ? 'inset 2px 2px 0px #000, 1px 1px 0px #fff' : 'none'
            }}
            title="Switch Theme"
        >
            <div style={{
                width: '20px',
                height: '16px',
                background: theme === 'light' ? '#000080' : 'var(--main-green)',
                transform: theme === 'light' ? 'translateX(26px)' : 'translateX(0)',
                transition: 'transform 0.1s linear',
                boxShadow: theme === 'light' ? 'inset 1px 1px 0px #fff, 1px 1px 0px #000' : 'none'
            }} />
        </div>
    );
}

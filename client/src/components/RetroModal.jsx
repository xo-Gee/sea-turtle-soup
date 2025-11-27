import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function RetroModal({ isOpen, type, title, message, onConfirm, onCancel, children }) {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div className="win-box" style={{
                width: '85%', maxWidth: '320px', background: '#000',
                boxShadow: '10px 10px 0px rgba(0,0,0,0.5)',
                border: '2px solid var(--main-green)'
            }}>
                <div style={{
                    background: 'var(--main-green)', color: '#000',
                    padding: '5px 10px', fontWeight: 'bold',
                    marginBottom: '15px', display: 'flex', justifyContent: 'space-between'
                }}>
                    <span>{title || 'SYSTEM MESSAGE'}</span>
                    <span style={{ cursor: 'pointer' }} onClick={onCancel}>[X]</span>
                </div>

                <div style={{ padding: '0 10px 15px 10px', color: '#fff', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {message}
                    {children}
                </div>

                {type !== 'custom' && (
                    <div style={{
                        display: 'flex', gap: '10px', padding: '0 10px 15px 10px',
                        justifyContent: type === 'alert' ? 'center' : 'space-between'
                    }}>
                        {type !== 'alert' && (
                            <button className="retro-btn" style={{ flexGrow: 1 }} onClick={onCancel}>
                                {t('common.cancel')}
                            </button>
                        )}
                        <button className="retro-btn"
                            style={{
                                flexGrow: 1,
                                background: 'var(--alert-red)', color: '#fff',
                                border: '2px solid #fff'
                            }}
                            onClick={onConfirm}
                        >
                            {t('common.confirm')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


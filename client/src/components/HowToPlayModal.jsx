import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HowToPlayModal({ onClose }) {
    const [step, setStep] = useState(0);
    const { t } = useLanguage();

    const steps = [
        {
            title: t('howToPlay.step1Title'),
            content: (
                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {t('howToPlay.step1Content')}
                </div>
            )
        },
        {
            title: t('howToPlay.step2Title'),
            content: (
                <div style={{ textAlign: 'left' }}>
                    <div className="win-box" style={{ padding: '10px', marginBottom: '10px', background: '#111', whiteSpace: 'pre-wrap' }}>
                        {t('howToPlay.step2Example')}
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{t('howToPlay.step2Desc')}</p>
                </div>
            )
        },
        {
            title: t('howToPlay.step3Title'),
            content: (
                <div style={{ textAlign: 'left' }}>
                    <p>{t('howToPlay.step3Desc')}</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '5px' }}>{t('howToPlay.step3Q1')} <br /><span style={{ color: 'red' }}>{t('howToPlay.step3A1')}</span></li>
                        <li style={{ marginBottom: '5px' }}>{t('howToPlay.step3Q2')} <br /><span style={{ color: 'var(--main-green)' }}>{t('howToPlay.step3A2')}</span></li>
                        <li style={{ marginBottom: '5px' }}>{t('howToPlay.step3Q3')} <br /><span style={{ color: 'var(--main-green)' }}>{t('howToPlay.step3A3')}</span></li>
                    </ul>
                    <p>{t('howToPlay.step3Desc2')}</p>
                </div>
            )
        },
        {
            title: t('howToPlay.step4Title'),
            content: (
                <div style={{ textAlign: 'left' }}>
                    <p>{t('howToPlay.step4Desc')}</p>
                    <div className="win-box" style={{ padding: '10px', marginTop: '10px', background: '#111', fontSize: '0.9em', whiteSpace: 'pre-wrap' }}>
                        {t('howToPlay.step4Answer')}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ borderBottom: '1px dashed var(--main-green)', paddingBottom: '10px', marginBottom: '15px' }}>
                {steps[step].title} ({step + 1}/{steps.length})
            </h2>

            <div style={{ flexGrow: 1, marginBottom: '20px', minHeight: '150px' }}>
                {steps[step].content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                {step > 0 ? (
                    <button className="retro-btn" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>
                        PREV
                    </button>
                ) : (
                    <div style={{ flex: 1 }}></div>
                )}

                {step < steps.length - 1 ? (
                    <button className="retro-btn" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>
                        NEXT
                    </button>
                ) : (
                    <button className="retro-btn" style={{ flex: 1, background: 'var(--main-green)', color: '#000' }} onClick={onClose}>
                        START
                    </button>
                )}
            </div>
        </div>
    );
}

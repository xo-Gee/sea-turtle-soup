import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicy() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div style={{ padding: '20px', color: 'var(--main-green)', height: '100%', overflowY: 'auto' }}>
            <button className="retro-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
                {t('common.back')}
            </button>
            <h1>Privacy Policy</h1>
            <div className="win-box" style={{ padding: '20px', textAlign: 'left' }}>
                <p>Last updated: November 27, 2025</p>
                <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
                <h2>Collecting and Using Your Personal Data</h2>
                <h3>Types of Data Collected</h3>
                <h4>Personal Data</h4>
                <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
                <ul>
                    <li>Usage Data</li>
                </ul>
                <h4>Usage Data</h4>
                <p>Usage Data is collected automatically when using the Service.</p>
                <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
                <h2>Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, You can contact us:</p>
                <ul>
                    <li>By visiting this page on our website: https://github.com/xo-Gee/sea-turtle-soup</li>
                </ul>
            </div>
        </div>
    );
}

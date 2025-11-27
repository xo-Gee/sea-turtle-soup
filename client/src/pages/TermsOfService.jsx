import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfService() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div style={{ padding: '20px', color: 'var(--main-green)', height: '100%', overflowY: 'auto' }}>
            <button className="retro-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
                {t('common.back')}
            </button>
            <h1>Terms of Service</h1>
            <div className="win-box" style={{ padding: '20px', textAlign: 'left' }}>
                <p>Last updated: November 27, 2025</p>
                <p>Please read these terms and conditions carefully before using Our Service.</p>
                <h2>Interpretation and Definitions</h2>
                <h3>Interpretation</h3>
                <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                <h2>Acknowledgment</h2>
                <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
                <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
                <h2>"AS IS" and "AS AVAILABLE" Disclaimer</h2>
                <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice.</p>
                <h2>Contact Us</h2>
                <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
                <ul>
                    <li>By visiting this page on our website: https://github.com/xo-Gee/sea-turtle-soup</li>
                </ul>
            </div>
        </div>
    );
}

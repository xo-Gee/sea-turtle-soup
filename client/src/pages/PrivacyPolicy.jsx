import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', color: 'var(--main-green)', height: '100%', overflowY: 'auto' }}>
            <button className="retro-btn" onClick={() => navigate('/')} style={{ marginBottom: '20px', fontSize: '20px', padding: '5px 15px' }}>
                ◀
            </button>
            <h1>개인정보 처리방침</h1>
            <div className="win-box" style={{ padding: '20px', textAlign: 'left', lineHeight: '1.6' }}>
                <p>최종 업데이트: 2025년 11월 27일</p>

                <h2>1. 수집하는 개인정보 항목</h2>
                <p>서비스 이용을 위해 최소한의 정보만을 수집합니다. 본 서비스는 별도의 회원가입 절차가 없습니다.</p>
                <ul>
                    <li><strong>자동 수집 항목:</strong> 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보 (시스템 운영 및 보안을 위해 서버에 일시적으로 기록될 수 있음)</li>
                    <li><strong>선택 항목:</strong> 사용자가 설정한 닉네임 (게임 진행 중 식별 용도)</li>
                    <li><strong>게임 데이터:</strong> 채팅 로그 및 게임 진행 상황 (게임 종료 시 휘발되거나, 서버 운영을 위해 일시 보관될 수 있음)</li>
                </ul>

                <h2>2. 개인정보의 수집 및 이용 목적</h2>
                <p>수집한 정보는 다음의 목적을 위해서만 이용됩니다.</p>
                <ul>
                    <li>게임 서비스 제공 (방 생성, 참여, 실시간 채팅)</li>
                    <li>서비스 부정 이용 방지 및 비인가 사용 방지</li>
                    <li>서버 장애 발생 시 원인 분석 및 트러블슈팅</li>
                </ul>

                <h2>3. 쿠키(Cookie) 및 로컬 스토리지 사용</h2>
                <p>본 서비스는 이용자의 편의를 위해 쿠키 또는 로컬 스토리지(Local Storage)를 사용합니다.</p>
                <ul>
                    <li><strong>사용 목적:</strong> 다크 모드 설정, 효과음 볼륨 등 사용자의 환경 설정 저장</li>
                    <li><strong>거부 방법:</strong> 웹 브라우저의 설정 메뉴를 통해 쿠키 저장을 거부할 수 있습니다. 단, 이 경우 일부 설정이 저장되지 않을 수 있습니다.</li>
                </ul>

                <h2>4. 제3자 광고 및 분석 도구</h2>
                <p>본 서비스는 무료로 운영되기 위해 타사 광고 서비스(Google AdSense 등)를 포함할 수 있으며, 서비스 개선을 위해 Google Analytics 등의 분석 도구를 사용할 수 있습니다. 이 과정에서 익명화된 데이터가 수집될 수 있습니다.</p>

                <h2>5. 개인정보의 제3자 제공</h2>
                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>

                <h2>6. 문의사항</h2>
                <p>본 개인정보처리방침에 대한 문의사항이 있으시면 다음 연락처로 문의해 주세요:</p>
                <ul>
                    <li>이메일: rosevirus.k@gmail.com</li>
                </ul>
            </div>
        </div>
    );
}

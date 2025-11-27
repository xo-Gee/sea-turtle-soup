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

                <h2>1. 총칙</h2>
                <p>Sea Turtle Soup(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.</p>
                <p>본 개인정보처리방침은 회사가 제공하는 Sea Turtle Soup 서비스(이하 "서비스")를 이용하는 과정에서의 개인정보 처리에 관한 사항을 규정합니다.</p>
                <p>본 서비스는 이용자의 개인정보를 수집하거나 저장하지 않으며, 게임 진행을 위해 최소한의 정보(닉네임 등)만을 일시적으로 처리합니다.</p>

                <h2>2. 수집하는 개인정보 및 이용 목적</h2>
                <h3>서비스 이용</h3>
                <ul>
                    <li>수집 정보: 닉네임 (세션 유지용)</li>
                    <li>수집 목적: 게임 진행 및 사용자 식별</li>
                    <li>보유 기간: 브라우저 종료 시 또는 로그아웃 시까지 (서버에는 저장되지 않음)</li>
                </ul>

                <h2>3. 기술적 정보 수집 (Google Analytics 등)</h2>
                <p>본 서비스는 서비스 개선을 위해 Google Analytics 등을 사용할 수 있으며, 이는 개인을 식별할 수 없는 익명화된 정보입니다.</p>
                <ul>
                    <li>방문자 수, 페이지뷰 등 웹사이트 이용 통계</li>
                    <li>브라우저 종류 및 버전, 운영체제</li>
                    <li>대략적인 지역 정보</li>
                </ul>

                <h2>4. 쿠키(Cookie) 사용</h2>
                <p>본 서비스는 원활한 서비스 제공을 위해 제한적인 목적으로 쿠키 또는 로컬 스토리지(Local Storage)를 사용합니다.</p>
                <ul>
                    <li>필수 정보: 언어 설정 저장, 닉네임 임시 저장 등</li>
                </ul>

                <h2>5. 개인정보의 제3자 제공</h2>
                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>

                <h2>6. 이용자의 권리</h2>
                <p>이용자는 언제든지 자신의 개인정보(닉네임 등)를 브라우저 캐시 삭제 등을 통해 파기할 수 있습니다.</p>

                <h2>7. 아동의 개인정보 보호</h2>
                <p>본 서비스는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>

                <h2>8. 개인정보처리방침의 변경</h2>
                <p>본 개인정보처리방침은 법령, 정책 또는 서비스 변경사항을 반영하기 위해 수정될 수 있습니다. 변경 내용은 서비스 내에 공지합니다.</p>

                <h2>9. 문의사항</h2>
                <p>본 개인정보처리방침에 대한 문의사항이 있으시면 다음 연락처로 문의해 주세요:</p>
                <ul>
                    <li>서비스명: Sea Turtle Soup</li>
                    <li>이메일: rosevirus.k@gmail.com</li>
                </ul>
            </div>
        </div>
    );
}

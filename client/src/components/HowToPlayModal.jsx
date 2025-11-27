import { useState } from 'react';

export default function HowToPlayModal({ onClose }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "바다거북 수프란?",
            content: (
                <div style={{ textAlign: 'left' }}>
                    <p>출제자가 들려주는 알 수 없는 이야기를 듣고,<br />
                        <strong>'네', '아니오', '중요하지 않습니다'</strong>로<br />
                        대답할 수 있는 질문을 던져<br />
                        숨겨진 진실을 찾아내는 추리 게임입니다.</p>
                </div>
            )
        },
        {
            title: "예시 문제",
            content: (
                <div style={{ textAlign: 'left' }}>
                    <div className="win-box" style={{ padding: '10px', marginBottom: '10px', background: '#111' }}>
                        "남자는 수프를 한 입 먹더니,<br />
                        곧바로 절벽에서 뛰어내렸다.<br />
                        왜 그랬을까?"
                    </div>
                    <p>이 기묘한 상황이 왜 일어났는지<br />질문을 통해 밝혀내야 합니다.</p>
                </div>
            )
        },
        {
            title: "질문하기",
            content: (
                <div style={{ textAlign: 'left' }}>
                    <p>여러분은 출제자에게 질문을 할 수 있습니다.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '5px' }}>Q: 수프가 상했나요? <br /><span style={{ color: 'red' }}>A: 아니오</span></li>
                        <li style={{ marginBottom: '5px' }}>Q: 누군가 죽었나요? <br /><span style={{ color: 'var(--main-green)' }}>A: 네</span></li>
                        <li style={{ marginBottom: '5px' }}>Q: 죄책감 때문인가요? <br /><span style={{ color: 'var(--main-green)' }}>A: 네</span></li>
                    </ul>
                    <p>이렇게 질문을 통해 단서를 모으세요.</p>
                </div>
            )
        },
        {
            title: "정답",
            content: (
                <div style={{ textAlign: 'left' }}>
                    <p>모든 단서를 조합해 정답을 맞추면 승리합니다!</p>
                    <div className="win-box" style={{ padding: '10px', marginTop: '10px', background: '#111', fontSize: '0.9em' }}>
                        "남자는 과거 조난당했을 때 동료의 인육을 바다거북 수프인 줄 알고 먹었고, 나중에 진짜 수프를 먹고 진실을 깨달아 자살한 것입니다."
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

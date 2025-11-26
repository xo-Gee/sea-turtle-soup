import React, { createContext, useContext, useState, useCallback } from 'react';
import RetroModal from '../components/RetroModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'alert', // alert, confirm, prompt, custom
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
        children: null
    });

    const close = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showAlert = useCallback((message, title = '알림') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'alert',
                title,
                message,
                onConfirm: () => {
                    close();
                    resolve(true);
                },
                onCancel: () => {
                    close();
                    resolve(true);
                }
            });
        });
    }, [close]);

    const showConfirm = useCallback((message, title = '확인') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                onConfirm: () => {
                    close();
                    resolve(true);
                },
                onCancel: () => {
                    close();
                    resolve(false);
                }
            });
        });
    }, [close]);

    const showPrompt = useCallback((message, title = '입력') => {
        return new Promise((resolve) => {
            let value = '';
            setModalState({
                isOpen: true,
                type: 'confirm', // Reuse confirm layout but with input child
                title,
                message,
                children: (
                    <input
                        type="text"
                        className="retro-input"
                        style={{ width: '100%', marginTop: '10px' }}
                        autoFocus
                        onChange={(e) => value = e.target.value}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                close();
                                resolve(value);
                            }
                        }}
                    />
                ),
                onConfirm: () => {
                    close();
                    resolve(value);
                },
                onCancel: () => {
                    close();
                    resolve(null);
                }
            });
        });
    }, [close]);

    // Special custom modal for GameRoom answer selection
    const showCustom = useCallback((props) => {
        setModalState({
            isOpen: true,
            type: 'custom',
            ...props,
            onCancel: () => {
                close();
                if (props.onCancel) props.onCancel();
            }
        });
    }, [close]);

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt, showCustom, close }}>
            {children}
            <RetroModal {...modalState} />
        </ModalContext.Provider>
    );
};

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { socket } from './socket';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import WaitingRoom from './pages/WaitingRoom';
import GameRoom from './pages/GameRoom';
import Result from './pages/Result';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Credits from './pages/Credits';
import { ModalProvider } from './context/ModalContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <LanguageProvider>
      <ModalProvider>
        <BrowserRouter>
          <div className="mockup-frame">
            <div className="crt-overlay"></div>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/room/:roomId" element={<WaitingRoom />} />
              <Route path="/game/:roomId" element={<GameRoom />} />
              <Route path="/result/:roomId" element={<Result />} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ModalProvider>
    </LanguageProvider>
  );
}

export default App;

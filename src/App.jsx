import React from 'react';
import Login from './components/Auth/login';
import Register from './components/Auth/register';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from './context/authContext';
import Navbar from './components/Homepage/Navbar';
import Main from './components/Homepage/Main';
import Main2 from './components/Homepage/Main2';
import Footer from './components/Homepage/Footer';
import Team from './components/Secondary_footer/team';
import About from './components/Secondary_footer/about';
import Resources from './components/Secondary_footer/resources';
import DsaSheet from './components/Secondary/DsaSheet';
import CouncilDashboard from './components/Secondary/CouncilDashboard';
import VideoRoom from './components/Secondary/VideoRoom';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);

  const hideNavbarFooter = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/dsa');

  // ==========================================
  // 1. [FIXED] useEffect is now placed BEFORE the return statement
  // ==========================================
  useEffect(() => {
    let socket = null;

    if (currentUser) {
      // Connect to the WebSocket signaling server
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

      // Register this student's User ID on the socket server
      socket.emit('register-user', currentUser.id);

      // Listen for incoming call invites targeting this student
      socket.on('incoming-invite', (data) => {
        if (data.studentId === currentUser.id) {
          setIncomingCall({
            roomId: data.roomId,
            callerName: data.callerName || 'A Mentor'
          });
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-mono flex flex-col justify-between">
      {!hideNavbarFooter && <Navbar />}

      <div className="max-w-4xl w-full mx-auto p-6 flex-grow">
        <Routes>
          <Route path="/" element={<><Main /><Main2 /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/dsa" element={<DsaSheet />} />
          <Route path="/dashboard" element={<CouncilDashboard />} />
          <Route path="/dsa/:userId" element={<DsaSheet />} />
          <Route path="/mentoring/room/:roomId" element={<VideoRoom />} />
        </Routes>
      </div>

      {!hideNavbarFooter && <Footer />}

      {/* ==========================================
          2. [WITHOUT STYLING] Raw HTML incoming call popup 
          ========================================== */}
      {/* ==========================================
          2. [WITH STYLING] Cyber-themed modal overlay 
          ========================================== */}
      {incomingCall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(9, 9, 11, 0.9)', // Dark, semi-transparent background
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          <div style={{
            backgroundColor: '#09090b',
            border: '2px solid #22d3ee', // Cyan border
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.25)', // Cyan outer glow
            padding: '35px',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '420px',
            width: '90%'
          }}>
            {/* Pulsing warning tag */}
            <h3 style={{ color: '#22d3ee', marginTop: 0, letterSpacing: '3px', fontSize: '18px', fontWeight: 'bold' }}>
              [INCOMING_CALL]
            </h3>

            <p style={{ margin: '22px 0', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.6' }}>
              Mentor <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{incomingCall.callerName}</span> is inviting you to a live mentoring session.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {/* Accept button with green background */}
              <button
                onClick={() => {
                  const room = incomingCall.roomId;
                  setIncomingCall(null);
                  navigate(`/mentoring/room/${room}`);
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                ACCEPT_CONNECTION
              </button>

              {/* Terminate/Decline button with red background */}
              <button
                onClick={() => {
                  setIncomingCall(null);
                }}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                TERMINATE
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import io from 'socket.io-client';
import { useAuth } from '../../context/authContext'; // <-- Add this

export default function VideoRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { currentUser, currentRole } = useAuth();

    // Parse the invited student's ID from the room name (e.g. 'call-studentId')
    const studentId = roomId.startsWith('call-') ? roomId.replace('call-', '') : roomId;
    const isCouncilOrPresident = currentRole === 'council' || currentRole === 'president';
    const isInvitedStudent = currentUser && currentUser.id === studentId;

    if (!(isCouncilOrPresident || isInvitedStudent)) {
        return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#f43f5e', fontFamily: 'monospace' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '15px', color: '#ef4444' }}>[ACCESS_DENIED]</h2>
            <p style={{ color: '#a1a1aa' }}>Only council members or the invited student can join this video mentoring session.</p>
        </div>;
    }

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState('Initializing Media hardware...');
    const [isMuted, setIsMuted] = useState(true); // Default to muted (audio disabled)
    const [isVideoOff, setIsVideoOff] = useState(true); // Default to camera off (video disabled)
    const [remoteMuted, setRemoteMuted] = useState(true); // Remote user starts muted
    const [remoteVideoOff, setRemoteVideoOff] = useState(true); // Remote user starts camera off
    // Refs to access streams and candidate queue synchronously across renders
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const iceQueueRef = useRef([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        let isMounted = true;
        let activeStream = null;
        let socket = null;

        const setupMediaAndSockets = async () => {
            try {
                // Request camera and microphone access
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                if (!isMounted) {
                    // Abort if the component has been unmounted during getUserMedia request
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                // DISABLE BY DEFAULT (Start muted and camera off)
                stream.getAudioTracks().forEach(track => { track.enabled = false; });
                stream.getVideoTracks().forEach(track => { track.enabled = false; });

                activeStream = stream;
                localStreamRef.current = stream;
                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Initialize socket connection
                socket = io(API_URL);
                socketRef.current = socket;

                // Register user details for invitation management
                if (currentUser) {
                    socket.emit('register-user', currentUser.id);
                }

                socket.emit('join-room', roomId);

                // Handle room join events
                socket.on('user-joined', async () => {
                    setCallStatus('Peer joined. Securing connection link...');
                    if (isCouncilOrPresident) {
                        // Mentor initiates call as the Caller
                        await initiateCall(stream);
                    } else {
                        // Student notifies mentor that they are ready to receive the call
                        socket.emit('signal', { roomId: roomId, signal: { type: 'ready' } });
                    }
                });

                // Handle incoming WebRTC signaling data
                socket.on('signal', async (data) => {
                    await handleSignalingData(data, stream);
                });

                setCallStatus('Offline (Muted // Cam Off)');

            } catch (err) {
                console.error('Error accessing camera or microphone:', err);
                if (isMounted) {
                    setCallStatus('Hardware failure: Check permissions');
                }
            }
        };

        setupMediaAndSockets();

        // Cleanup connections on unmount
        return () => {
            isMounted = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (socket) {
                socket.disconnect();
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };
    }, [roomId, API_URL]);


    // Creates the WebRTC RTCPeerConnection object
    const createPeerConnection = (stream) => {
        if (peerConnectionRef.current) {
            return peerConnectionRef.current;
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Add local tracks to send them to the remote peer
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Send local ICE candidates to the remote peer
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('signal', { roomId: roomId, signal: event.candidate });
            }
        };

        // Display the incoming remote video stream
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
            setCallStatus('Connected');
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Initiates the offer (called by the Mentor or upon peer ready)
    const initiateCall = async (stream) => {
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'stable') {
            console.log('Call initiation in progress: skipping offer duplication');
            return;
        }

        const pc = createPeerConnection(stream);
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current.emit('signal', { roomId: roomId, signal: offer });
            setCallStatus('Dialing peer...');
        } catch (err) {
            console.error("Error creating WebRTC offer:", err);
        }
    };

    // Process all incoming signals (offers, answers, ICE candidates, state syncs, hangups)
    const handleSignalingData = async (data, stream) => {
        try {
            if (!data.signal) return;

            // 1. Sync remote audio/video enabled status
            if (data.signal.type === 'track-status') {
                setRemoteMuted(data.signal.isMuted);
                setRemoteVideoOff(data.signal.isVideoOff);
                return;
            }

            // 2. Handshake ready trigger (sent by Student, received by Mentor)
            if (data.signal.type === 'ready') {
                if (isCouncilOrPresident) {
                    console.log('Remote peer is ready. Building offer...');
                    await initiateCall(stream);
                }
                return;
            }

            // 3. Hang up trigger
            if (data.signal.type === 'hangup') {
                console.log('Session termination requested by peer.');
                terminateCallLocally();
                return;
            }

            const pc = createPeerConnection(stream);

            // 4. Handle incoming SDP Offer
            if (data.signal.type === 'offer') {
                // If signaling state collision, roll back if we are the polite student
                if (pc.signalingState !== 'stable') {
                    if (isCouncilOrPresident) {
                        return; // Ignore offer (impolite mentor)
                    }
                    await pc.setLocalDescription({ type: 'rollback' });
                }

                await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketRef.current.emit('signal', { roomId: roomId, signal: answer });
                setCallStatus('Securing bridge...');

                // Instantly sync our track status with the caller
                socketRef.current.emit('signal', {
                    roomId: roomId,
                    signal: {
                        type: 'track-status',
                        isMuted: isMuted,
                        isVideoOff: isVideoOff
                    }
                });

                // Apply queued candidates
                while (iceQueueRef.current.length > 0) {
                    const candidate = iceQueueRef.current.shift();
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (e) {
                        console.warn("ICE candidate queue application error:", e);
                    }
                }
            }
            // 5. Handle incoming SDP Answer
            else if (data.signal.type === 'answer') {
                if (pc.signalingState !== 'have-local-offer') {
                    console.warn('SDP answer received out of state order:', pc.signalingState);
                    return;
                }
                await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                setCallStatus('Connected');

                // Instantly sync our track status with the answerer
                socketRef.current.emit('signal', {
                    roomId: roomId,
                    signal: {
                        type: 'track-status',
                        isMuted: isMuted,
                        isVideoOff: isVideoOff
                    }
                });

                // Apply queued candidates
                while (iceQueueRef.current.length > 0) {
                    const candidate = iceQueueRef.current.shift();
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (e) {
                        console.warn("ICE candidate queue application error:", e);
                    }
                }
            }
            // 6. Handle incoming ICE Candidate
            else if (data.signal.candidate) {
                const candidate = new RTCIceCandidate(data.signal);
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(candidate);
                } else {
                    iceQueueRef.current.push(candidate);
                }
            }
        } catch (error) {
            console.error("Error processing signaling data:", error);
        }
    };

    // Toggle Microphone audio track
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            const newMuteState = !isMuted;
            audioTracks.forEach(track => {
                track.enabled = !newMuteState;
            });
            setIsMuted(newMuteState);

            // Sync track status to remote peer
            if (socketRef.current) {
                socketRef.current.emit('signal', {
                    roomId: roomId,
                    signal: {
                        type: 'track-status',
                        isMuted: newMuteState,
                        isVideoOff: isVideoOff
                    }
                });
            }
        }
    };

    // Toggle Camera video track
    const toggleCamera = () => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            const newVideoState = !isVideoOff;
            videoTracks.forEach(track => {
                track.enabled = !newVideoState;
            });
            setIsVideoOff(newVideoState);

            // Sync track status to remote peer
            if (socketRef.current) {
                socketRef.current.emit('signal', {
                    roomId: roomId,
                    signal: {
                        type: 'track-status',
                        isMuted: isMuted,
                        isVideoOff: newVideoState
                    }
                });
            }
        }
    };

    // Clean up local tracks, close connections, and route user back
    const terminateCallLocally = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setCallStatus('Disconnected');

        // Redirect user back to dashboard or sheet
        if (isCouncilOrPresident) {
            navigate('/dashboard');
        } else {
            navigate('/dsa');
        }
    };

    // Notify other peer of disconnect and close locally
    const hangUp = () => {
        if (socketRef.current) {
            socketRef.current.emit('signal', { roomId: roomId, signal: { type: 'hangup' } });
        }
        terminateCallLocally();
    };




    return (
        <div style={{
            backgroundColor: '#09090b',
            minHeight: '85vh',
            color: '#f4f4f5',
            fontFamily: 'monospace',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '12px',
            border: '1px solid #27272a',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glow Grid */}
            <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Top HUD bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #27272a',
                paddingBottom: '16px',
                marginBottom: '24px',
                zIndex: 1,
                position: 'relative'
            }}>
                <div>
                    <span style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px' }}>[MENTORING_FEED]</span>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#ffffff', fontWeight: 'normal' }}>
                        ROOM_ID: <span style={{ color: '#a1a1aa' }}>{roomId}</span>
                    </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Status pulsing indicator */}
                    <span style={{
                        height: '10px',
                        width: '10px',
                        borderRadius: '50%',
                        backgroundColor: callStatus === 'Connected' ? '#10b981' : (callStatus.includes('Offline') ? '#ef4444' : '#22d3ee'),
                        boxShadow: `0 0 10px ${callStatus === 'Connected' ? '#10b981' : (callStatus.includes('Offline') ? '#ef4444' : '#22d3ee')}`,
                        display: 'inline-block',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }} />
                    <span style={{ fontSize: '12px', color: '#e4e4e7', textTransform: 'uppercase' }}>{callStatus}</span>
                </div>
            </div>

            {/* Video Streams Container */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                flexGrow: 1,
                alignItems: 'center',
                zIndex: 1,
                position: 'relative',
                marginBottom: '32px'
            }}>
                {/* Local Camera stream */}
                <div style={{
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: isVideoOff ? '1px solid #3f3f46' : '1px solid #22d3ee',
                    boxShadow: isVideoOff ? 'none' : '0 0 15px rgba(34, 211, 238, 0.1)',
                    position: 'relative',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(9, 9, 11, 0.75)',
                        border: '1px solid #22d3ee55',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#22d3ee',
                        zIndex: 2
                    }}>
                        LOCAL_FEED // {currentUser ? currentUser.username.toUpperCase() : 'USER'} {isMuted ? '[MUTED]' : ''}
                    </div>

                    {/* Camera Offline Overlay */}
                    {isVideoOff && (
                        <div style={{
                            textAlign: 'center',
                            color: '#71717a',
                            zIndex: 1,
                            padding: '20px'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: '#ef4444' }}>
                                <path d="m22 8-6 4 6 4V8Z" />
                                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                                <path d="m2 2 20 20" />
                            </svg>
                            <div style={{ fontSize: '13px', letterSpacing: '1px', color: '#ef4444' }}>[VIDEO_OFFLINE]</div>
                            <div style={{ fontSize: '11px', color: '#52525b', marginTop: '4px' }}>Click video icon below to stream</div>
                        </div>
                    )}

                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: isVideoOff ? 'none' : 'block',
                            transform: 'scaleX(-1)' // Mirror local view
                        }}
                    />
                </div>

                {/* Remote Peer stream */}
                <div style={{
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: remoteVideoOff || !remoteStream ? '1px solid #3f3f46' : '1px solid #10b981',
                    boxShadow: remoteVideoOff || !remoteStream ? 'none' : '0 0 15px rgba(16, 185, 129, 0.1)',
                    position: 'relative',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(9, 9, 11, 0.75)',
                        border: '1px solid #10b98155',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#10b981',
                        zIndex: 2
                    }}>
                        REMOTE_FEED // {isCouncilOrPresident ? 'STUDENT' : 'MENTOR'} {remoteMuted ? '[MUTED]' : ''}
                    </div>

                    {/* Remote Offline or Camera Off Overlay */}
                    {(!remoteStream || remoteVideoOff) && (
                        <div style={{
                            textAlign: 'center',
                            color: '#71717a',
                            zIndex: 1,
                            padding: '20px'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: '#71717a' }}>
                                <path d="M21 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
                                <path d="M10 9l5 3-5 3v-6z" />
                            </svg>
                            <div style={{ fontSize: '13px', letterSpacing: '1px' }}>
                                {!remoteStream ? '[WAITING_FOR_REMOTE_FEED]' : '[REMOTE_VIDEO_MUTED]'}
                            </div>
                            <p style={{ fontSize: '11px', color: '#52525b', marginTop: '4px', maxWidth: '240px', margin: '4px auto 0 auto' }}>
                                {!remoteStream
                                    ? 'The other user has not entered or completed the WebRTC secure bridge yet.'
                                    : 'The user has temporarily disabled their camera stream.'}
                            </p>
                        </div>
                    )}

                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: (remoteStream && !remoteVideoOff) ? 'block' : 'none'
                        }}
                    />
                </div>
            </div>

            {/* Bottom floating control bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                padding: '16px',
                backgroundColor: 'rgba(24, 24, 27, 0.75)',
                border: '1px solid #27272a',
                borderRadius: '50px',
                maxWidth: '480px',
                width: '100%',
                margin: '0 auto',
                backdropFilter: 'blur(8px)',
                zIndex: 1,
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Audio Mute toggle button */}
                <button
                    onClick={toggleMute}
                    style={{
                        backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 211, 238, 0.1)',
                        border: isMuted ? '1.5px solid #ef4444' : '1.5px solid #22d3ee',
                        color: isMuted ? '#ef4444' : '#22d3ee',
                        borderRadius: '50%',
                        width: '46px',
                        height: '46px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                >
                    {isMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="1" y1="1" x2="23" y2="23" />
                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </button>

                {/* Video Camera Toggle button */}
                <button
                    onClick={toggleCamera}
                    style={{
                        backgroundColor: isVideoOff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 211, 238, 0.1)',
                        border: isVideoOff ? '1.5px solid #ef4444' : '1.5px solid #22d3ee',
                        color: isVideoOff ? '#ef4444' : '#22d3ee',
                        borderRadius: '50%',
                        width: '46px',
                        height: '46px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                    {isVideoOff ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m16 16 6 4V4l-6 4" />
                            <rect x="1" width="15" height="12" y="6" rx="2" ry="2" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 8-6 4 6 4V8z" />
                            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                        </svg>
                    )}
                </button>

                {/* Separator */}
                <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />

                {/* Leave Session / Hang Up button */}
                <button
                    onClick={hangUp}
                    style={{
                        backgroundColor: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: '24px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.boxShadow = '0 0 18px rgba(239, 68, 68, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.4)';
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.68 13.31a16 16 0 0 0 3.41 3.41l2.28-2.28a1 1 0 0 1 .94-.27 12.07 12.07 0 0 0 3.79.6 1 1 0 0 1 1 1v3.87a1 1 0 0 1-1.12 1 22.09 22.09 0 0 1-9.76-3.48 21.6 21.6 0 0 1-6.73-6.73A22.09 22.09 0 0 1 2 3.12 1 1 0 0 1 3 2h3.87a1 1 0 0 1 1 1 12.07 12.07 0 0 0 .6 3.79 1 1 0 0 1-.27.94l-2.28 2.28z" style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }} />
                    </svg>
                    LEAVE_SESSION
                </button>
            </div>

            {/* Micro-animations CSS inside component */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.15); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </div>
    );
}

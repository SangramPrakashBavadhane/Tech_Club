import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../../context/authContext'; // <-- Add this

export default function VideoRoom() {
    const { roomId } = useParams();
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
    const [callStatus, setCallStatus] = useState('Initializing media...');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        let activeStream = null;

        const setupMediaAndSockets = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                activeStream = stream;
                setLocalStream(stream);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                socketRef.current = io(API_URL);

                // Register our active session ID with the switchboard
                if (currentUser) {
                    socketRef.current.emit('register-user', currentUser.id);
                }

                socketRef.current.emit('join-room', roomId);


                socketRef.current.on('user-joined', async () => {
                    setCallStatus('User joined. Connecting...');
                    await initiateCall(stream);
                });

                socketRef.current.on('signal', async (data) => {
                    await handleSignalingData(data, stream);
                });

                setCallStatus('Camera Active. Ready to connect');

            } catch (err) {
                console.error('Error accessing camera or microphone:', err);
                setCallStatus('Failed to access camera or microphone');
            }
        };

        setupMediaAndSockets();

        // The cleanup function is returned inside useEffect
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [roomId, API_URL]); // <-- Correctly closes the useEffect hook callback and dependency array



    const createPeerConnection = (stream) => {

        if (peerConnectionRef.current)
            return peerConnectionRef.current;

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });


        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('signal', { roomId: roomId, signal: event.candidate });
            }
        };


        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current)
                remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('Connected');

        };

        peerConnectionRef.current = pc;
        return pc;


    };

    const initiateCall = async (stream) => {
        const pc = createPeerConnection(stream);

        try {
            const offer = await pc.createOffer();

            await pc.setLocalDescription(offer);

            socketRef.current.emit('signal', { roomId: roomId, signal: offer });
        } catch (err) {
            console.error("Error creating WebRTC offer:", err);
        }
    }

    const handleSignalingData = async (data, stream) => {
        try {
            const pc = createPeerConnection(stream);

            if (data.signal && data.signal.type) {
                if (data.signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socketRef.current.emit('signal', {
                        roomId: roomId,
                        signal: answer
                    });

                    setCallStatus('Connecting...');
                }
                else if (data.signal.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.signal));

                    setCallStatus('Connected');
                }
            }
            else if (data.signal && data.signal.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.signal));
            }
        } catch (error) {
            console.error("Error processing signaling data:", error);
        }
    }




    return (
        <div>
            <h2>Video Mentoring Session: Room {roomId}</h2>
            <div>Status: {callStatus}</div>

            <div>

                {/* Local Camera stream */}
                <div>
                    <h3>Local Camera (You)</h3>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                    />
                </div>

                {/* Remote Peer stream */}
                <div>
                    <h3>Remote Peer (Mentor/Student)</h3>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                    />
                </div>

            </div>
        </div>
    );
}
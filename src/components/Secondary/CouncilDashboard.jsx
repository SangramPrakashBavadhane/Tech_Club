import React, { useEffect, useState, useRef } from 'react'; // <-- Add useRef
import { Link, useNavigate } from 'react-router-dom'; // <-- Add useNavigate
import io from 'socket.io-client'; // <-- Add socket client
import { useAuth } from '../../context/authContext'; // <-- Add useAuth context

export default function CouncilDashboard() {
    // 1. Declare states to store the list of users, loading, and error states
    const navigate = useNavigate();
    const { currentUser, currentRole } = useAuth();
    const socketRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // 2. Fetch the directory list from the server when the dashboard page loads
    // A. Connect to WebSocket server when CM opens dashboard
    useEffect(() => {
        if (currentUser) {
            socketRef.current = io(API_URL);
            socketRef.current.emit('register-user', currentUser.id);
        }
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [currentUser, API_URL]);

    // B. Fetch the directory list from the server when the dashboard page loads
    useEffect(() => {
        const fetchUsersList = async () => {
            try {
                const token = localStorage.getItem('syntax_token');

                // Fetch user data from our newly created /users endpoint
                const response = await fetch(`${API_URL}/api/dsa/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to fetch directory');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsersList();
    }, [API_URL]);


    if (loading) {
        return <div style={{ padding: '20px' }}>Loading Council Dashboard...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    const handleRoleChange = async (userId, newRole) => {
        const targetUser = users.find(u => u.id === userId);
        const username = targetUser ? targetUser.username : 'this student';

        // Add a confirmation dialog before proceeding
        const confirmChange = window.confirm(`Are you sure you want to change the role of ${username} to ${newRole.toUpperCase()}?`);
        if (!confirmChange) {
            return; // Exit early. The select dropdown will automatically revert to its old value
        }

        try {
            const token = localStorage.getItem('syntax_token');
            const response = await fetch(`${API_URL}/api/auth/update-role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, newRole })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update role');
            }

            // Instantly update the local users list state so it renders immediately
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );

            alert(`Successfully updated ${username} to ${newRole}!`);
        } catch (err) {
            alert(`Error updating user role: ${err.message}`);
        }
    };



    const handleInvite = (studentId) => {
        if (socketRef.current) {
            const roomId = `call-${studentId}`;

            // Emit targeted invite to the specific student
            socketRef.current.emit('invite-student', {
                studentId: studentId,
                roomId: roomId,
                callerName: currentUser ? currentUser.username : 'A Mentor'
            });

            // Redirect the CM to the call page
            navigate(`/mentoring/room/${roomId}`);
        }
    };


    // 3. Render the dynamic directory list of students in a table
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Council Member Dashboard</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>Student Directory & DSA Progress Audit</p>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#333' }}>
                <thead>
                    <tr style={{ textAlign: 'left', backgroundColor: '#111' }}>
                        <th>Student Name</th>
                        <th>Role</th>
                        <th>Year</th>
                        <th>Department</th>
                        <th>Tech Interests</th>
                        <th>DSA Progress</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ fontWeight: 'bold' }}>{user.username}</td>
                            <td>
                                {currentRole === 'president' ? (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{
                                            backgroundColor: '#09090b',
                                            color: '#22d3ee',
                                            border: '1px solid #22d3ee55',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontFamily: 'monospace',
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="council">Council</option>
                                        <option value="president">President</option>
                                    </select>
                                ) : (
                                    <span style={{ textTransform: 'capitalize', color: '#a1a1aa' }}>
                                        {user.role}
                                    </span>
                                )}
                            </td>
                            <td>{user.academicYear ? `${user.academicYear} Yr` : 'N/A'}</td>

                            <td style={{ color: '#a1a1aa' }}>{user.department || 'N/A'}</td>
                            <td>
                                {user.interestTags && user.interestTags.length > 0 ? (
                                    user.interestTags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '10px',
                                            backgroundColor: '#09090b',
                                            color: '#22d3ee',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            marginRight: '5px',
                                            border: '1px solid #22d3ee22',
                                            display: 'inline-block',
                                            marginBottom: '2px'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: '#52525b' }}>None</span>
                                )}
                            </td>
                            <td>
                                <span style={{ color: '#10b981' }}>{user.solvedCount}</span> / 180 Solved
                            </td>
                            <td>
                                <Link to={`/dsa/${user.id}`} style={{ color: '#06b6d4', marginRight: '15px' }}>
                                    Inspect
                                </Link>
                                <button
                                    onClick={() => handleInvite(user.id)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #10b981',
                                        color: '#10b981',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    ./invite_call
                                </button>

                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

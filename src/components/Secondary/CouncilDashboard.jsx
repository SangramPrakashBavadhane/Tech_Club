import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CouncilDashboard() {
    // 1. Declare states to store the list of users, loading, and error states
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // 2. Fetch the directory list from the server when the dashboard page loads
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

    // 3. Render the dynamic directory list of students in a table
    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Council Member Dashboard</h1>
            <p style={{ color: '#888', marginBottom: '20px' }}>Student Directory & DSA Progress Audit</p>

            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#333' }}>
                <thead>
                    <tr style={{ textAlign: 'left', backgroundColor: '#111' }}>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Problems Solved</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>{user.solvedCount} Solved</td>
                            <td>
                                {/* Clicking this redirects to /dsa/<userId> to view their detailed sheet */}
                                <Link to={`/dsa/${user.id}`} style={{ color: '#06b6d4' }}>
                                    Inspect Sheet
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

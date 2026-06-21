import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'

export default function DsaSheet() {
    const { userId } = useParams(); // Reads student ID from URL
    const isReadOnly = !!userId;    // If userId exists in the URL, this page is Read-Only
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState('');
    const [solvedProblems, setSolvedProblems] = useState('');
    const [studentName, setStudentName] = useState('');

    const API_URI = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

    useEffect(() => {
        const fetchDsaData = async () => {
            try {
                setLoading(true);

                const problemRes = await fetch(`${API_URI}/dsa/problems`);
                if (!problemRes.ok) {
                    throw new Error('Failed to fetch DSA problems');
                }
                const problemsdata = await problemRes.json();
                setProblems(problemsdata);

                const token = localStorage.getItem('syntax_token');

                if (isReadOnly) {
                    // 1. Fetch this specific student's solved questions array
                    const solvedRes = await fetch(`${API_URI}/dsa/solved/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (solvedRes.ok) {
                        const solvedData = await solvedRes.json();
                        setSolvedProblems(solvedData.solvedProblems || []);
                    }

                    // 2. Fetch users directory to look up the student's name
                    const usersRes = await fetch(`${API_URI}/dsa/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        const found = usersData.find(u => u.id === userId);
                        if (found) setStudentName(found.username);
                    }
                } else {
                    // Normal mode: Fetch logged-in user's checked list
                    if (token) {
                        const solvedRes = await fetch(`${API_URI}/dsa/solved`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            }
                        });
                        if (solvedRes.ok) {
                            const solvedData = await solvedRes.json();
                            setSolvedProblems(solvedData.solvedProblems || []);
                        }
                    }
                }



            } catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDsaData();
    }, [API_URI, isReadOnly, userId]);


    const handleToggle = async (problemId) => {
        if (isReadOnly) {
            return;
        }
        const token = localStorage.getItem('syntax_token');
        if (!token) {
            alert('Please login to track your progress');
            return;
        }

        try {
            const response = await fetch(`${API_URI}/dsa/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ problemId })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update progress');
            }

            const data = await response.json();
            // Update frontend state with the new list of solved IDs from the database
            setSolvedProblems(data.solvedProblems);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };


    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    // Group the dynamic list of problems by their topic field
    const groupedProblems = problems.reduce((acc, problem) => {
        if (!acc[problem.topic]) {
            acc[problem.topic] = [];
        }
        acc[problem.topic].push(problem);
        return acc;
    }, {});

    // Check if the user has an active login session
    const isLoggedIn = !!localStorage.getItem('syntax_token');


    return (
        <div style={{ padding: '20px' }}> {/* Wrap everything inside this single div */}

            {isReadOnly && (
                <div style={{ marginBottom: '15px' }}>
                    <Link to="/dashboard" style={{ color: '#06b6d4' }}>
                        &lt; Back to Council Dashboard
                    </Link>
                </div>
            )}

            <h1>
                {isReadOnly ? `${studentName}'s DSA Tracker` : 'DSA Striver Sheet Tracker'}
            </h1>

            {isReadOnly ? (
                <div style={{ color: 'yellow', marginBottom: '15px' }}>
                    <strong>Audit Mode:</strong> You are viewing this sheet in read-only mode.
                </div>
            ) : (
                !isLoggedIn && (
                    <div style={{ color: 'orange', marginBottom: '15px' }}>
                        <strong>Note:</strong> You must be logged in to save your checked problems.
                    </div>
                )
            )}

            <div style={{ marginBottom: '20px' }}>
                Total Problems: {problems.length} | Solved: {solvedProblems.length}
            </div>

            {Object.keys(groupedProblems).map(topic => (
                <div key={topic} style={{ marginTop: '20px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '10px', borderBottom: '1px solid #333' }}>{topic}</h2>
                    <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#333' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ width: '80px' }}>Status</th>
                                <th style={{ width: '50px' }}>ID</th>
                                <th>Problem Name</th>
                                <th style={{ width: '100px' }}>Platform</th>
                                <th style={{ width: '80px' }}>Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedProblems[topic].map(problem => {
                                const isSolved = solvedProblems.includes(problem.id);
                                return (
                                    <tr key={problem.id} style={{ backgroundColor: isSolved ? '#14532d' : 'transparent' }}>
                                        <td align="center">
                                            <input
                                                type="checkbox"
                                                checked={isSolved}
                                                onChange={() => handleToggle(problem.id)}
                                                disabled={isReadOnly} // Grayed out if in read-only audit mode
                                            />
                                        </td>
                                        <td>{problem.id}</td>
                                        <td>{problem.name}</td>
                                        <td>{problem.platform}</td>
                                        <td>
                                            <a href={problem.link} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4' }}>
                                                Solve
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ))}

        </div> // Close the wrapper div
    );



}
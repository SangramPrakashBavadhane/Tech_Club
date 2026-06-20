import React, { useEffect, useState } from 'react';

export default function DsaSheet() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState('');
    const [solvedProblems, setSolvedProblems] = useState('');

    const API_URI = import.meta.env.VITE_API_URI ||
        'http://localhost:5000/api';

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


            } catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDsaData();
    }, [API_URI]);


    const handleToggle = async (problemId) => {
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
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>DSA Striver Sheet Tracker</h1>

            {/* Show warning if user is a guest (not logged in) */}
            {!isLoggedIn && (
                <div style={{ color: 'orange', marginBottom: '15px' }}>
                    <strong>Note:</strong> You must be logged in to save your checked problems.
                </div>
            )}

            {/* Solved Problems Counter */}
            <div style={{ marginBottom: '20px' }}>
                Total Problems: {problems.length} | Solved: {solvedProblems.length}
            </div>

            {/* Loop through each grouped topic and draw a table */}
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
                                // Check if this problem's ID is inside our solvedProblems array
                                const isSolved = solvedProblems.includes(problem.id);
                                return (
                                    <tr key={problem.id} style={{ backgroundColor: isSolved ? '#14532d' : 'transparent' }}>
                                        <td align="center">
                                            <input
                                                type="checkbox"
                                                checked={isSolved}
                                                onChange={() => handleToggle(problem.id)}
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
        </div>
    );


}
import React from 'react';

export default function Resources() {
    return (
        <div>
            {/* 1. Title */}
            <h1>Syntax Learning Resources</h1>
            <p>Curated learning roadmaps, syllabus logs, and study materials compiled by the club.</p>

            {/* 2. Resources Lists */}
            <div>

                {/* CS Subjects */}
                <section style={{ borderBottom: '1px solid #333', padding: '16px 0' }}>
                    <h2>CS Subjects</h2>
                    <ul>
                        <li>Operating Systems (OS)</li>
                        <li>Computer Networks (CN)</li>
                        <li>Database Management Systems (DBMS)</li>
                    </ul>
                </section>

                {/* DSA */}
                <section style={{ borderBottom: '1px solid #333', padding: '16px 0' }}>
                    <h2>Data Structures & Algorithms (DSA)</h2>
                    <ul>
                        <li>Striver's SDE Sheet Playlist</li>
                        <li>NeetCode 150 Checklist</li>
                        <li>Codeforces & CodeChef starter guides</li>
                    </ul>
                </section>

                {/* AI / ML */}
                <section style={{ borderBottom: '1px solid #333', padding: '16px 0' }}>
                    <h2>AI / Machine Learning</h2>
                    <ul>
                        <li>Mathematics for Machine Learning (Linear Algebra/Calculus)</li>
                        <li>Python Data Science Stack (NumPy, Pandas, Scikit-Learn)</li>
                        <li>Intro to Neural Networks & PyTorch</li>
                    </ul>
                </section>

                {/* WEBDEV */}
                <section style={{ borderBottom: '1px solid #333', padding: '16px 0' }}>
                    <h2>Web Development</h2>
                    <ul>
                        <li>Frontend: HTML, CSS, JavaScript ES6+, and React</li>
                        <li>Backend: Node.js, Express, and REST APIs</li>
                        <li>Databases: MongoDB (NoSQL) and PostgreSQL (SQL)</li>
                    </ul>
                </section>

                {/* GATE */}
                <section style={{ borderBottom: '1px solid #333', padding: '16px 0' }}>
                    <h2>GATE Preparation</h2>
                    <ul>
                        <li>GATE CS Syllabus Breakdown</li>
                        <li>Discrete Mathematics & Theory of Computation</li>
                        <li>Previous Year Question Paper (PYQ) logs</li>
                    </ul>
                </section>

            </div>
        </div>
    );
}

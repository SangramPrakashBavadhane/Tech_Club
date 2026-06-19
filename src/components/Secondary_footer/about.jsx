import React from 'react';

export default function About() {
    return (
        <div>
            {/* 1. Page Title */}
            <h1>About Syntax Coding Club</h1>

            {/* 2. Content Sections */}
            <div>
                <h2>Our Origin</h2>
                <p>Syntax was founded in 2023 by a group of computer science students who wanted to build a strong developer community on campus.</p>
            </div>

            <div>
                <h2>What We Do</h2>
                <p>We focus on building real-world projects, hosting algorithmic competitive programming sprints, and running collaborative peer mentorship sessions.</p>
                <ul>
                    <li>Weekly Algorithm Sprints</li>
                    <li>Web and App Development projects</li>
                    <li>GATE exam study sessions</li>
                    <li>Peer-to-peer code reviews</li>
                </ul>
            </div>
        </div>
    );
}

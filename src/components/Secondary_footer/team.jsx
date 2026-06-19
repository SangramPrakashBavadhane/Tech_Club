import React from 'react';

// 1. Our Team Data (A list of 12 member objects with photos, github, and instagram links)
const teamMembers = [
    {
        id: 1,
        name: "Aarav Sharma",
        role: "President",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 2,
        name: "Isha Patel",
        role: "Vice President",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 3,
        name: "Rohan Das",
        role: "Lead Developer",
        dept: "AI/ML",
        photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 4,
        name: "Ananya Iyer",
        role: "Treasurer",
        dept: "Data Science",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 5,
        name: "Kabir Mehta",
        role: "PR Lead",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 6,
        name: "Sneha Reddy",
        role: "Event Coordinator",
        dept: "AI/ML",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 7,
        name: "Aditya Verma",
        role: "DSA Lead",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 8,
        name: "Meera Nair",
        role: "Design Lead",
        dept: "ECE",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 9,
        name: "Aryan Sen",
        role: "Web Developer",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 10,
        name: "Diya Roy",
        role: "App Developer",
        dept: "AI/ML",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 11,
        name: "Yash Gupta",
        role: "Cybersecurity Lead",
        dept: "CSE",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    },
    {
        id: 12,
        name: "Riya Kapoor",
        role: "Content Writer",
        dept: "Data Science",
        photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80",
        github: "https://github.com",
        instagram: "https://instagram.com"
    }
];

export default function Team() {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">We are Syntax Members.</div>
                <div className="mt-4 text-lg text-slate-400">We are here.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {teamMembers.map((member) => (
                    <div key={member.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 -translate-y-0 hover:-translate-y-2 transition-all duration-300">
                        {/* Hover glow effect background decoration */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="card-img relative w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500 transition-colors duration-300 bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">img</div>
                        <div className='name text-xl font-bold text-white mt-5 tracking-tight group-hover:text-indigo-300 transition-colors'>{member.name}</div>
                        <div className="role text-indigo-400 font-semibold text-sm mt-1">{member.role}</div>
                        <div className="dept text-slate-400 text-xs mt-1 uppercase tracking-wider">{member.dept}</div>
                        <div className='social flex justify-center gap-4 mt-6 relative z-10'>
                            <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-900/80">GitHub</a>
                            <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-900/80">Instagram</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react';

export default function Team() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/team`);
                if (!response.ok) {
                    throw new Error('Failed to retrieve team catalog');
                }
                const data = await response.json();

                // Map high-quality visual assets and custom links to each database user
                const mappedMembers = data.map((user, index) => {
                    const defaultPhotos = [
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
                    ];

                    return {
                        id: user.id || user._id,
                        name: user.username,
                        role: user.role === 'president' ? 'President' : 'Council Member',
                        dept: user.department || 'CSE',
                        photo: defaultPhotos[index % defaultPhotos.length],
                        github: `https://github.com/${user.username}`,
                        instagram: `https://instagram.com/${user.username}`
                    };
                });

                setTeamMembers(mappedMembers);
            } catch (err) {
                console.error("Error loading dynamic team directory:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [API_URL]);

    if (loading) {
        return (
            <div className="bg-slate-950 min-h-screen text-slate-100 flex items-center justify-center font-mono">
                <div className="text-center">
                    <div className="text-indigo-400 font-bold mb-2">LOADING_DIRECTORY...</div>
                    <div className="text-slate-500 text-xs">Securing database connection link</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 font-mono">
                <span className="text-indigo-400 font-bold tracking-widest text-xs uppercase">[CORE_TEAM]</span>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                    Syntax Administrators
                </div>
                <div className="mt-4 text-sm text-slate-400">
                    Active student directory of verified club council members and administrators.
                </div>
            </div>

            {teamMembers.length === 0 ? (
                <div className="text-center font-mono py-12 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto">
                    <span className="text-rose-500 font-bold">[NO_ACTIVE_LEADERS]</span>
                    <p className="text-slate-500 text-xs mt-2">No council members or presidents have registered on the platform yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto font-mono">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 -translate-y-0 hover:-translate-y-2 transition-all duration-300">
                            {/* Hover glow effect background decoration */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="relative w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500 transition-colors duration-300 bg-slate-800">
                                <img
                                    src={member.photo}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="name text-xl font-bold text-white mt-5 tracking-tight group-hover:text-indigo-300 transition-colors">
                                {member.name}
                            </div>
                            <div className="role text-indigo-400 font-semibold text-sm mt-1">
                                {member.role}
                            </div>
                            <div className="dept text-slate-400 text-xs mt-1 uppercase tracking-wider">
                                {member.dept}
                            </div>

                            <div className="social flex justify-center gap-4 mt-6 relative z-10">
                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-900/80">
                                    GitHub
                                </a>
                                <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-900/80">
                                    Instagram
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

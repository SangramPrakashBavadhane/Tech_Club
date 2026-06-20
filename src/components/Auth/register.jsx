import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function Register() {
    // 1. Local component state for all inputs
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [academicYear, setAcademicYear] = useState(1);
    const [tagsInput, setTagsInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Auth context and navigation
    const { registerUser } = useAuth();
    const navigate = useNavigate();

    // 3. Register submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        // Convert comma-separated string to an array of trimmed interest tags
        const interestTags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const result = await registerUser(username, email, password, academicYear, interestTags);
        setIsSubmitting(false);

        if (result.success) {
            navigate('/'); // Redirect to homepage on success
        } else {
            setErrorMsg(result.message || 'Registration failed');
        }
    };

    // 4. UI form markup
    return (
        <div className="flex items-center justify-center py-8 font-mono">
            <div className="w-full max-w-md border border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm p-8 rounded shadow-xl shadow-terminal-cyan/5">
                <h2 className="text-terminal-cyan font-bold text-xl mb-6 tracking-widest uppercase flex items-center gap-2">
                    <span className="animate-pulse">&gt;_</span> REGISTER_AGENT
                </h2>

                {/* Display error if registration fails */}
                {errorMsg && (
                    <div className="mb-6 text-xs border border-red-500/40 bg-red-500/10 text-red-400 p-3 rounded">
                        [SYS_ERR: {errorMsg}]
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g., hacker_01"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./email_address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./access_passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Academic Year select dropdown */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./academic_year</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-terminal-cyan transition-colors cursor-pointer"
                        >
                            <option value={1}>1st Year (FE)</option>
                            <option value={2}>2nd Year (SE)</option>
                            <option value={3}>3rd Year (TE)</option>
                            <option value={4}>4th Year (BE)</option>
                        </select>
                    </div>

                    {/* Interest Tags text input */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./interests (comma separated)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="web, dsa, ml, security"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 mt-4 bg-terminal-cyan/10 border border-terminal-cyan/40 hover:bg-terminal-cyan/20 text-terminal-cyan rounded font-bold text-sm tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? 'Registering Agent...' : './execute_registration'}
                    </button>
                </form>

                <p className="mt-5 text-center text-xs text-zinc-500">
                    Already authenticated?{' '}
                    <Link to="/login" replace className="text-terminal-cyan hover:underline transition-colors">
                        ./login
                    </Link>
                </p>
            </div>
        </div>
    );
}

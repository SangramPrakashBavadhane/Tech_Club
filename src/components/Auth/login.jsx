import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function Login() {
    // 1. Local component state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Context & Navigation Hooks
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    // 3. Form submit handler function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        // Call the login function from context
        const result = await loginUser(email, password);
        setIsSubmitting(false);

        if (result.success) {
            navigate('/');
        } else {
            setErrorMsg(result.message || 'Authentication failed');
        }
    };

    // 4. User Interface Markup
    return (
        <div className="flex items-center justify-center py-12 font-mono">
            <div className="w-full max-w-md border border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm p-8 rounded shadow-xl shadow-terminal-cyan/5">
                <h2 className="text-terminal-cyan font-bold text-xl mb-6 tracking-widest uppercase flex items-center gap-2">
                    <span className="animate-pulse">&gt;_</span> SECURE_ACCESS
                </h2>

                {/* Display backend error message if login fails */}
                {errorMsg && (
                    <div className="mb-6 text-xs border border-red-500/40 bg-red-500/10 text-red-400 p-3 rounded">
                        [SYS_ERR: {errorMsg}]
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email field */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./email_address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="agent@syntax.club"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Password field */}
                    <div>
                        <label className="block text-zinc-500 text-xs uppercase mb-1.5 tracking-wider">./security_key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-terminal-cyan transition-colors"
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 mt-2 bg-terminal-cyan/10 border border-terminal-cyan/40 hover:bg-terminal-cyan/20 text-terminal-cyan rounded font-bold text-sm tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? 'Authenticating...' : './execute_handshake'}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-zinc-500">
                    Authorization key missing?{' '}
                    <Link to="/register" replace className="text-terminal-cyan hover:underline transition-colors">
                        ./request_clearance
                    </Link>
                </p>
            </div>
        </div>
    );
}

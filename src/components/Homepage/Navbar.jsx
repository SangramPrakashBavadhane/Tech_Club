import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';

export default function Navbar() {
  const { currentUser, currentRole, logoutUser } = useAuth();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to terminate session?");
    if (confirmLogout) {
      logoutUser();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">

      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-terminal-cyan font-bold text-lg tracking-wider font-mono hover:opacity-80 transition-opacity">
          &gt;_ SYNTAX
        </Link>
        <span className="hidden sm:inline text-[9px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
          {currentRole}_MODE
        </span>
      </div>

      {/* Right Side: Navigation Links */}
      <nav className="flex gap-6 text-xs items-center font-mono">
        <a href="/#notifications" className="text-zinc-400 hover:text-terminal-cyan transition-colors">
          ./notifications
        </a>

        {currentUser && (currentRole === 'council' || currentRole === 'president') && (
          <Link to="/dashboard" className="text-zinc-400 hover:text-terminal-cyan transition-colors">
            ./dashboard
          </Link>
        )}

        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">
              [user: <span className="text-zinc-300 font-bold">{currentUser.username}</span>]
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 transition-all cursor-pointer"
            >
              ./logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-zinc-400 hover:text-terminal-cyan transition-colors">
              ./login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 border border-terminal-cyan/40 text-terminal-cyan rounded hover:bg-terminal-cyan/10 transition-all shadow-sm shadow-terminal-cyan/5"
            >
              ./register
            </Link>
          </div>
        )}
      </nav>

    </header>
  );
}

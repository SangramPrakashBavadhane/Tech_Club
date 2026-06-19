import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';

export default function Navbar() {
  const { currentUser, currentRole, logoutUser } = useAuth();

  // 1. Declare an empty container variable
  let authButton;

  // 2. Use a standard if/else statement to fill the variable
  if (currentUser) {
    authButton = (
      <button
        onClick={logoutUser}
        className="px-3 py-1.5 border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 cursor-pointer transition-all font-mono"
      >
        ./logout
      </button>
    );
  } else {
    authButton = (
      <Link
        to="/register"
        className="px-3 py-1.5 border border-terminal-cyan/40 text-terminal-cyan rounded hover:bg-terminal-cyan/10 transition-all shadow-sm shadow-terminal-cyan/5"
      >
        ./register
      </Link>
    );
  }

  // 3. Return the layout
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">

      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-terminal-cyan font-bold text-lg tracking-wider font-mono hover:opacity-80 transition-opacity">
          &gt;_ SYNTAX
        </Link>
        <span className="hidden sm:inline text-[9px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase">
          {currentRole}_MODE
        </span>
      </div>

      {/* Right Side: Navigation Links */}
      <nav className="flex gap-6 text-xs items-center">
        <a href="/#workspaces" className="text-zinc-400 hover:text-terminal-cyan transition-colors">
          ./workspaces
        </a>
        <a href="/#notifications" className="text-zinc-400 hover:text-terminal-cyan transition-colors">
          ./notifications
        </a>

        {/* 4. Display the auth button we calculated above */}
        {authButton}
      </nav>

    </header>
  );
}

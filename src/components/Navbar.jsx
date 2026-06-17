import React from 'react';

const LayoutGridIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const BellIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      
      {/* 1. Left Side: Logo & Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-terminal-cyan font-bold text-lg tracking-wider font-mono">
          &gt;_ SYNTAX
        </span>
        <span className="hidden sm:inline text-[9px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded font-sans uppercase">
          GUEST_MODE
        </span>
      </div>

      {/* 2. Right Side: Monospace Links & Action Buttons */}
      <nav className="flex gap-4 text-xs items-center">
        <a 
          href="#workspaces" 
          className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900/40 text-zinc-400 rounded hover:text-terminal-cyan hover:border-terminal-cyan/40 hover:bg-terminal-cyan/5 transition-all font-mono"
        >
          <LayoutGridIcon className="w-3.5 h-3.5" />
          <span>./workspaces</span>
        </a>
        <a 
          href="#notifications" 
          className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900/40 text-zinc-400 rounded hover:text-terminal-cyan hover:border-terminal-cyan/40 hover:bg-terminal-cyan/5 transition-all font-mono"
        >
          <BellIcon className="w-3.5 h-3.5" />
          <span>./notifications</span>
        </a>
        <a 
          href="#register" 
          className="px-3 py-1.5 border border-terminal-cyan/40 text-terminal-cyan rounded hover:bg-terminal-cyan/10 transition-all shadow-sm shadow-terminal-cyan/5"
        >
          ./register
        </a>
      </nav>

    </header>
  );
}
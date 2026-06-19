import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation();

  const shouldReplace = location.pathname !== '/';

  return (
    <footer className="border-t border-zinc-800 p-6 max-w-4xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
      <div>
        <p>© {new Date().getFullYear()} Syntax Coding Club.</p>
      </div>

      <div className="flex gap-4">
        <Link to="/team" replace={shouldReplace} className="hover:text-terminal-cyan transition-colors">./team</Link>
        <Link to="/resources" replace={shouldReplace} className="hover:text-terminal-cyan transition-colors">./resources</Link>
        <Link to="/about" replace={shouldReplace} className="hover:text-terminal-cyan transition-colors">./about</Link>
      </div>
    </footer>
  );
}
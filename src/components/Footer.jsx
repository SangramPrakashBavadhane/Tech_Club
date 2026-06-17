import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 p-6 max-w-4xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
      <div>
        <p>© {new Date().getFullYear()} Syntax Coding Club.</p>
      </div>

      <div className="flex gap-4">
        <a href="#team" className="hover:text-terminal-cyan transition-colors">./team</a>
        <a href="#resources" className="hover:text-terminal-cyan transition-colors">./resources</a>
        <a href="#about" className="hover:text-terminal-cyan transition-colors">./about</a>
      </div>
    </footer>
  );
}
import React from 'react';

export default function Main() {
  return (
    <main className="py-12 space-y-8">
      
      {/* Slogan with highlighted terminal command */}
      <div>
        <span className="text-terminal-cyan text-xs font-mono">&gt; initialize slogan</span>
        <h1 className="text-3xl font-bold mt-1 text-white">
          Compile your future with <span className="text-terminal-cyan">Syntax.</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-xl">
          Syntax is the official coding club. We build systems, solve algorithm sprints, and run collaborative meetups.
        </p>
      </div>


    </main>
  );
}
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

      {/* Notifications Panel with subtle borders and status colors */}
      <div id="notifications" className="border border-zinc-800/80 p-5 rounded bg-zinc-950/40 shadow-md">
        <div className="text-xs font-bold text-terminal-cyan border-b border-zinc-800/60 pb-2 mb-4 flex justify-between items-center">
          <span>[SYSTEM NOTIFICATIONS]</span>
          <span className="text-terminal-emerald text-[9px] animate-pulse">● LIVE_FEED</span>
        </div>

        <div className="space-y-3">
          {/* Notification 1: Jitsi Meet (Green theme) */}
          <div className="text-xs flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <div className="flex gap-2 items-center">
              <span className="text-[9px] bg-terminal-emerald/10 text-terminal-emerald border border-terminal-emerald/20 px-1.5 py-0.5 rounded font-sans font-bold">MEET</span>
              <span className="text-zinc-300 font-mono">Weekly Algorithms Sprint - Thu 6:00 PM (Jitsi Meet)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans shrink-0">Today</span>
          </div>

          {/* Notification 2: Registration (Cyan theme) */}
          <div className="text-xs flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <div className="flex gap-2 items-center">
              <span className="text-[9px] bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20 px-1.5 py-0.5 rounded font-sans font-bold">INFO</span>
              <span className="text-zinc-300 font-mono">Registrations are open for students.</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans shrink-0">1 day ago</span>
          </div>
        </div>
      </div>

    </main>
  );
}
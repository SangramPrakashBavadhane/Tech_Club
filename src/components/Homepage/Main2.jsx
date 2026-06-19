import React from "react";
import { Link } from 'react-router-dom'

export default function Main2() {
  return (
    <section id="workspaces" className="py-8 border-t border-zinc-800 space-y-6">

      <div>
        <h2 className="text-xs font-bold text-terminal-cyan tracking-wider">// GUARDED_WORKSPACES</h2>
        <p className="text-xs text-zinc-500 mt-1">These modules are only accessible to approved Syntax club members.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">

        {/* Solve (DSA) Card */}
        <Link to="/dsa" className=" DSA-card border border-zinc-800 p-5 rounded bg-zinc-950/20 relative overflow-hidden group hover:border-terminal-cyan/40 transition-all">
          <div className="absolute top-3 right-3 text-sm">🔒</div>
          <div className="text-terminal-cyan text-[10px] font-bold tracking-wider">[SOLVE]</div>
          <h3 className="text-white text-sm font-semibold mt-1">DSA Tracker & Analytics</h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Aggregates rating trends from LeetCode, Codeforces, and CodeChef. Includes target spreadsheet trackers.
          </p>
          <div className="mt-4 text-[10px] text-yellow-500/80 bg-yellow-500/10 inline-block px-2 py-0.5 rounded border border-yellow-500/20">
            Restricted to Members
          </div>
        </Link>

        {/* Collaborate (Meet) Card */}
        <div className="border border-zinc-800 p-5 rounded bg-zinc-950/20 relative overflow-hidden group hover:border-terminal-cyan/40 transition-all">
          <div className="absolute top-3 right-3 text-sm">🔒</div>
          <div className="text-terminal-accent text-[10px] font-bold tracking-wider">[COLLABORATE]</div>
          <h3 className="text-white text-sm font-semibold mt-1">Video Meet & Collab</h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Integrated browser-based video workspace for sprints and project planning.
          </p>
          <div className="mt-4 text-[10px] text-yellow-500/80 bg-yellow-500/10 inline-block px-2 py-0.5 rounded border border-yellow-500/20">
            Restricted to Members
          </div>
        </div>

      </div>

    </section >
  );
}
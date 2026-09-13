"use client";

import React from "react";
import { Terminal, ShieldCheck, Zap, AlertTriangle } from "lucide-react";

interface ExecutionLogProps {
  logs: Array<{
    timestamp: string;
    type: string;
    message: string;
    symbol?: string;
  }>;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs }) => {
  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col h-full font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm truncate">
            REALTIME AUDIT LOG • ENGINE EVENTS
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold shrink-0 hidden xs:inline">
          LIVE FEED
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[220px] sm:max-h-[260px] space-y-2 pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-8 text-xs">
            Listening for engine execution events...
          </div>
        ) : (
          logs.map((log, idx) => {
            const isWinWin = log.type.includes("WIN_WIN");
            const isEntry = log.type === "ENTRY";
            const isKill = log.type === "KILL_SWITCH";

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                  isWinWin
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : isKill
                    ? "bg-red-950/30 border-red-500/30 text-red-300"
                    : isEntry
                    ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-300"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isWinWin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isKill ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5 gap-2">
                    <span className="font-bold tracking-wider truncate">{log.type}</span>
                    <span className="shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="leading-snug break-words">{log.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

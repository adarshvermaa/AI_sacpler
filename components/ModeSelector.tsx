"use client";

import React from "react";
import { Cpu, Sliders, Sparkles, Settings2 } from "lucide-react";

interface ModeSelectorProps {
  currentMode: "DEFAULT" | "CUSTOM";
  onSelectMode: (mode: "DEFAULT" | "CUSTOM") => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode
}) => {
  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div>
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-cyan-400" />
          EXECUTION & ANALYSIS MODE
        </h2>
        <p className="text-xs text-slate-400">
          Select between institutional autonomous autopilot or interactive custom quant parameters
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Mode 1: Default Autonomous AI */}
        <button
          onClick={() => onSelectMode("DEFAULT")}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            currentMode === "DEFAULT"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/20"
              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          DEFAULT ANALYZE MARKET
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-mono">
            AUTO AI
          </span>
        </button>

        {/* Mode 2: Custom Quant Studio */}
        <button
          onClick={() => onSelectMode("CUSTOM")}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            currentMode === "CUSTOM"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/20"
              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          CUSTOM ANALYZE STUDIO
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-200 font-mono">
            INPUTS
          </span>
        </button>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Cpu, Sliders, Settings2, Play, Square, ShieldAlert, Zap } from "lucide-react";

interface ModeSelectorProps {
  currentMode: "DEFAULT" | "CUSTOM";
  onSelectMode: (mode: "DEFAULT" | "CUSTOM") => void;
  isRunning?: boolean;
  onToggleEngine?: () => void;
  leverage?: number;
  onOpenLeverageModal?: () => void;
  killSwitchActive?: boolean;
  onKillSwitch?: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  isRunning = false,
  onToggleEngine,
  leverage = 15,
  onOpenLeverageModal,
  killSwitchActive = false,
  onKillSwitch
}) => {
  return (
    <div
      className={`bg-[#0c101d] border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all shadow-xl ${
        isRunning ? "border-emerald-500/30 shadow-emerald-950/20" : "border-slate-800"
      }`}
    >
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left Section: Header Title + Mode Toggles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full xl:w-auto">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Settings2 className="w-4 h-4" />
              </span>
              <span>AUTONOMOUS AI &amp; EXECUTION CONTROL</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
                  isRunning
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 animate-pulse"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                {isRunning ? "AUTOPILOT LIVE" : "STANDBY"}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Select execution profile and manage autonomous scalper life-cycle on CoinDCX
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onSelectMode("DEFAULT")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                currentMode === "DEFAULT"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>AUTONOMOUS AI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-mono hidden xs:inline">
                AUTO
              </span>
            </button>

            <button
              onClick={() => onSelectMode("CUSTOM")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                currentMode === "CUSTOM"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/40"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>CUSTOM STUDIO</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-200 font-mono hidden xs:inline">
                INPUTS
              </span>
            </button>
          </div>
        </div>

        {/* Right Section: The Execution Command Suite (Leverage, Start/Pause, Kill Switch) */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full xl:w-auto justify-end flex-wrap pt-2.5 xl:pt-0 border-t xl:border-t-0 border-slate-800/80">
          {/* 1. Manual Leverage Selector Button */}
          <button
            onClick={onOpenLeverageModal}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400/70 hover:bg-cyan-950/20 text-cyan-300 font-mono text-xs font-bold transition-all shadow-sm group cursor-pointer"
            title="Configure CoinDCX Futures Leverage (Default 15x, auto-capped per contract limit)"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            <span>{leverage}x LEV</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
              MANUAL
            </span>
          </button>

          {/* 2. Start / Pause Scalper Button */}
          <button
            onClick={onToggleEngine}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition-all shadow-lg cursor-pointer whitespace-nowrap ${
              isRunning
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/50 hover:bg-amber-500/25 shadow-amber-500/10 active:scale-95"
                : "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black hover:opacity-95 active:scale-95 shadow-emerald-500/25 ring-1 ring-emerald-400/50"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>PAUSE AUTOPILOT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>START AUTOPILOT</span>
              </>
            )}
          </button>

          {/* 3. Emergency Kill Switch */}
          <button
            onClick={onKillSwitch}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
              killSwitchActive
                ? "bg-red-600 text-white animate-pulse border-red-400 shadow-lg shadow-red-600/40"
                : "bg-red-950/30 text-red-400 border-red-900/60 hover:bg-red-600 hover:text-white hover:border-red-500"
            }`}
            title="Emergency HFT Kill-Switch: Cancel all orders, flatten positions, and stop engine immediately"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>KILL SWITCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};

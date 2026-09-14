"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  ShieldCheck,
  Info,
  Sliders
} from "lucide-react";

interface LeverageStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (leverage: number) => void;
  currentLeverage?: number;
  isRunning?: boolean;
  usableBalanceUsdt?: number;
}

const PRESET_LEVERAGES = [
  { value: 5, label: "5x", desc: "Conservative" },
  { value: 10, label: "10x", desc: "Moderate" },
  { value: 15, label: "15x", desc: "Default AI", isDefault: true },
  { value: 20, label: "20x", desc: "Aggressive" },
  { value: 25, label: "25x", desc: "High Alpha" },
  { value: 50, label: "50x", desc: "Max BTC/ETH" }
];

export const LeverageStartModal: React.FC<LeverageStartModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentLeverage = 15,
  isRunning = false,
  usableBalanceUsdt = 7.5
}) => {
  const [selectedLev, setSelectedLev] = useState<number>(currentLeverage || 15);
  const [customInput, setCustomInput] = useState<string>(String(currentLeverage || 15));

  useEffect(() => {
    if (isOpen) {
      const lev = currentLeverage || 15;
      setSelectedLev(lev);
      setCustomInput(String(lev));
    }
  }, [isOpen, currentLeverage]);

  if (!isOpen) return null;

  const handleSelectPreset = (val: number) => {
    setSelectedLev(val);
    setCustomInput(String(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomInput(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      setSelectedLev(Math.round(num));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSelectedLev(val);
    setCustomInput(String(val));
  };

  const handleConfirm = () => {
    const finalLev = Math.max(1, Math.min(50, selectedLev));
    onConfirm(finalLev);
  };

  // Math Calculations for live preview
  const minNotional = 6.0;
  const reqMarginUsdt = minNotional / Math.max(1, selectedLev);
  const reqMarginInr = reqMarginUsdt * 87.5;
  const rawLiquidationDist = 100.0 / Math.max(1, selectedLev);
  const maxPossibleTrades = usableBalanceUsdt > 0 ? Math.floor((usableBalanceUsdt * 0.85) / reqMarginUsdt) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0c101c] border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[90vh] font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {isRunning ? "ADJUST LEVERAGE" : "MANUAL LEVERAGE SETTING"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  ISOLATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set manual leverage for CoinDCX futures order execution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 overflow-y-auto">
          {/* Quick Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>QUICK PRESETS</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Default: <strong className="text-cyan-300 font-bold">15x</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_LEVERAGES.map((preset) => {
                const isSelected = selectedLev === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPreset(preset.value)}
                    className={`py-2 px-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-b from-cyan-500/25 to-teal-500/15 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50"
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {preset.isDefault && (
                      <span className="absolute -top-1.5 px-1 rounded bg-cyan-500 text-[8px] font-bold text-black uppercase">
                        Default
                      </span>
                    )}
                    <span className="text-xs sm:text-sm">{preset.label}</span>
                    <span className="text-[8px] font-normal text-slate-400 truncate max-w-full">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Slider & Manual Numeric Input */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">CUSTOM LEVERAGE (1x – 50x)</label>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customInput}
                  onChange={handleCustomChange}
                  className="w-12 bg-transparent text-right font-bold text-cyan-300 text-sm focus:outline-none"
                />
                <span className="text-xs font-bold text-cyan-400">x</span>
              </div>
            </div>

            {/* Range Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold">1x</span>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={selectedLev}
                onChange={handleSliderChange}
                className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-bold">50x</span>
            </div>
          </div>

          {/* Live Risk & Margin Preview Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gradient-to-br from-slate-950 to-[#0c1220] p-3 rounded-2xl border border-slate-800/90 text-[11px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[9px] uppercase">Margin per $6 Order</span>
              <span className="font-bold text-cyan-300">
                ${reqMarginUsdt.toFixed(2)} USDT
              </span>
              <span className="text-[9px] text-slate-400">
                (~₹{reqMarginInr.toFixed(0)} INR)
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[9px] uppercase">Raw Liq Distance</span>
              <span className="font-bold text-amber-300">
                ~{rawLiquidationDist.toFixed(1)}%
              </span>
              <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>0.5% SL Active</span>
              </span>
            </div>

            <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
              <span className="text-slate-500 text-[9px] uppercase">Est. Max Trades</span>
              <span className="font-bold text-white">
                {Math.min(10, maxPossibleTrades)} / 10 Max
              </span>
              <span className="text-[9px] text-slate-400">
                15% Wallet Reserve
              </span>
            </div>
          </div>

          {/* CoinDCX Multi-Contract Rule Explanation Box */}
          <div className="p-3 rounded-xl bg-cyan-950/25 border border-cyan-800/40 flex items-start gap-2.5 text-[11px] text-cyan-200">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <strong className="text-cyan-300 font-bold text-xs">
                CoinDCX Contract-Specific Rule Handling
              </strong>
              <p className="text-slate-300 text-[10px]">
                Different crypto perpetuals have different exchange leverage limits (e.g. BTC/ETH allow 50x, while certain altcoins allow max 10x or 15x).
              </p>
              <p className="text-emerald-300 text-[10px] font-semibold">
                🛡️ The AI Engine will automatically safe-cap any altcoin whose maximum limit is lower than your chosen {selectedLev}x, ensuring your orders are never rejected by CoinDCX!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {isRunning
                ? `APPLY ${selectedLev}x LEVERAGE`
                : `START ENGINE AT ${selectedLev}x LEVERAGE`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

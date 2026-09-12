"use client";

import React, { useState } from "react";
import { Sliders, Filter, BarChart2, Layers, CheckCircle2, ArrowRight } from "lucide-react";

interface CustomStudioPanelProps {
  onApplyConfig: (config: any) => void;
}

export const CustomStudioPanel: React.FC<CustomStudioPanelProps> = ({ onApplyConfig }) => {
  const [universeSize, setUniverseSize] = useState<number>(500);
  const [filterCount, setFilterCount] = useState<number>(100);
  const [executionCount, setExecutionCount] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(10);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1.0);

  // Indicators selection
  const [indicators, setIndicators] = useState<{ [key: string]: boolean }>({
    "RSI": true,
    "VWAP": true,
    "Bollinger": true,
    "SuperTrend": true,
    "OBI": true,
    "MACD": true,
    "Ichimoku": false,
    "ATR": true,
    "Keltner": false,
    "StochRSI": true,
    "Chaikin": false
  });

  // Price action rules
  const [priceAction, setPriceAction] = useState<{ [key: string]: boolean }>({
    "OrderBlocks": true,
    "FVG": true,
    "LiquiditySweeps": true,
    "BOS": true,
    "PinBars": false
  });

  const toggleIndicator = (ind: string) => {
    setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
  };

  const togglePriceAction = (pa: string) => {
    setPriceAction(prev => ({ ...prev, [pa]: !prev[pa] }));
  };

  const handleApply = () => {
    const selectedInds = Object.keys(indicators).filter(k => indicators[k]);
    const selectedPA = Object.keys(priceAction).filter(k => priceAction[k]);

    onApplyConfig({
      mode: "CUSTOM",
      universe_size: universeSize,
      filter_count: filterCount,
      execution_count: executionCount,
      leverage: leverage,
      risk_per_trade_pct: riskPerTrade,
      selected_indicators: selectedInds,
      price_action_rules: selectedPA
    });
  };

  return (
    <div className="bg-[#0e1320] border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            CUSTOM SCALPER STUDIO: INTERACTIVE INPUT CONTROLS
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure universe screening, filter ratios, execution quotas, indicators, and price action triggers
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
          STUDIO ACTIVE
        </span>
      </div>

      {/* Row 1: Pipeline Sizing Controls (Total Assets -> Filter -> Order Execution) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Assets Scanned */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. TOTAL ASSETS SCANNED
            </label>
            <span className="text-sm font-mono font-bold text-cyan-400">{universeSize} Pairs</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={universeSize}
            onChange={(e) => setUniverseSize(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>50 min</span>
            <span>500 Universe</span>
          </div>
        </div>

        {/* Filter Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-purple-400" />
              2. FILTER TOP LIQUID CRYPTO
            </label>
            <span className="text-sm font-mono font-bold text-purple-400">{filterCount} Assets</span>
          </div>
          <input
            type="range"
            min="20"
            max="150"
            step="10"
            value={filterCount}
            onChange={(e) => setFilterCount(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>20 liquid</span>
            <span>100 Candidates</span>
          </div>
        </div>

        {/* Auto Order Execution Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              3. AUTO ORDER PLACEMENTS
            </label>
            <span className="text-sm font-mono font-bold text-emerald-400">{executionCount} Orders</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={executionCount}
            onChange={(e) => setExecutionCount(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>5 orders</span>
            <span>50 Top Alpha</span>
          </div>
        </div>
      </div>

      {/* Row 2: Leverage & Risk Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-300">LEVERAGE (ISOLATED FUTURES)</label>
            <p className="text-[10px] text-slate-500">Tiered CoinDCX position margin safety</p>
          </div>
          <div className="flex items-center gap-2">
            {[5, 10, 15, 20].map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  leverage === lev
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-300">MAX RISK PER SCALP</label>
            <p className="text-[10px] text-slate-500">Fractional Kelly capital sizing cap</p>
          </div>
          <div className="flex items-center gap-2">
            {[0.5, 1.0, 1.5, 2.0].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskPerTrade(risk)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  riskPerTrade === risk
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {risk}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: 100+ Indicators Matrix Selection */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
          SELECT INDICATOR ENGINE CONFLUENCE (100+ MATRIX)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(indicators).map(([name, enabled]) => (
            <button
              key={name}
              onClick={() => toggleIndicator(name)}
              className={`px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                enabled
                  ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              <span>{name}</span>
              <CheckCircle2 className={`w-3.5 h-3.5 ${enabled ? "text-cyan-400" : "text-slate-600"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: Price Action & Smart Money Concepts */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
          PRICE ACTION & SMART MONEY (SMC) TRIGGERS
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(priceAction).map(([name, enabled]) => (
            <button
              key={name}
              onClick={() => togglePriceAction(name)}
              className={`px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                enabled
                  ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              <span>{name}</span>
              <CheckCircle2 className={`w-3.5 h-3.5 ${enabled ? "text-purple-400" : "text-slate-600"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Apply & Trigger Button */}
      <button
        onClick={handleApply}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 shadow-xl shadow-purple-600/20 transition-all cursor-pointer"
      >
        <span>APPLY CUSTOM STUDIO SETTINGS & EXECUTE {executionCount} AI ORDERS</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Zap, Target, CheckCircle2 } from "lucide-react";

export interface ScreenerAsset {
  symbol: string;
  price: number;
  confidence: number;
  signal: string;
  volume_24h: number;
  spread_pct: number;
  obi_10: number;
  regime: string;
  change_24h?: number;
  entry_type?: string;
  entry_price?: number;
  tp1_price?: number;
  tp2_price?: number;
  sl_price?: number;
  rr_ratio?: number;
  candlestick_pattern?: number;
  atr_pct?: number;
}

interface MarketScreenerTableProps {
  candidates: ScreenerAsset[];
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
  onExecuteTrade: (asset: ScreenerAsset) => void;
}

export const MarketScreenerTable: React.FC<MarketScreenerTableProps> = ({
  candidates,
  selectedSymbol,
  onSelectSymbol,
  onExecuteTrade
}) => {
  const [search, setSearch] = useState("");
  const [filterSignal, setFilterSignal] = useState<string>("ALL");

  const filteredList = candidates.filter((item) => {
    const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesSignal =
      filterSignal === "ALL" ||
      (filterSignal === "BUY" && item.signal.includes("BUY")) ||
      (filterSignal === "SELL" && item.signal.includes("SELL"));
    return matchesSearch && matchesSignal;
  });

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}k`;
    return `$${vol.toFixed(0)}`;
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              500+ MARKET SCREENER • TOP 100 FILTERED CRYPTO
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              {filteredList.length} ASSETS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Realtime CoinDCX live market prices, 24h volume, spread, and AI-ranked scalp conviction
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {[
              { id: "ALL", label: "ALL" },
              { id: "BUY", label: "LONG / BUY" },
              { id: "SELL", label: "SHORT / SELL" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterSignal(s.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  filterSignal === s.id
                    ? s.id === "BUY"
                      ? "bg-emerald-500 text-black shadow-sm"
                      : s.id === "SELL"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 max-h-[420px]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] uppercase text-slate-400 bg-slate-900/60 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">24h Change</th>
              <th className="py-2.5 px-3">24h Vol</th>
              <th className="py-2.5 px-3">Spread</th>
              <th className="py-2.5 px-3">OBI Depth</th>
              <th className="py-2.5 px-3">AI Confidence</th>
              <th className="py-2.5 px-3">Signal</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredList.map((asset) => {
              const isBuy = asset.signal.includes("BUY");
              const isSell = asset.signal.includes("SELL");
              const obiPositive = asset.obi_10 >= 0;
              const isSelected = selectedSymbol === asset.symbol;
              const chg = asset.change_24h ?? 0;

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(asset.symbol)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors group ${
                    isSelected ? "bg-cyan-950/30 border-l-2 border-cyan-400" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-cyan-400 ring-2 ring-cyan-400/50" : "bg-slate-500"}`} />
                    {asset.symbol.replace("B-", "").replace("_", "/")}
                  </td>

                  <td className="py-2.5 px-3 text-slate-100 font-semibold">
                    <div>
                      ${asset.price >= 1 
                        ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) 
                        : (asset.price >= 0.01 ? asset.price.toFixed(4) : asset.price.toFixed(6))}
                    </div>
                    {asset.entry_price !== undefined && (
                      <div className="text-[9px] font-normal flex items-center gap-1 mt-0.5">
                        <span className={asset.entry_type === "LIMIT_PULLBACK" ? "text-cyan-400 font-bold" : "text-slate-400"}>
                          {asset.entry_type === "LIMIT_PULLBACK" ? "PULLBACK" : "MKT"}: ${asset.entry_price}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className={`py-2.5 px-3 font-bold ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                  </td>

                  <td className="py-2.5 px-3 text-slate-300">
                    {formatVolume(asset.volume_24h)}
                  </td>

                  <td className="py-2.5 px-3 text-slate-400">
                    {asset.spread_pct.toFixed(2)}%
                  </td>

                  {/* Orderbook Imbalance Gauge */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${obiPositive ? "bg-emerald-400 ml-auto" : "bg-red-400 mr-auto"}`}
                          style={{ width: `${Math.abs(asset.obi_10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] ${obiPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {obiPositive ? "+" : ""}{asset.obi_10.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* AI Confidence Bar */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        isBuy ? "text-emerald-400" : isSell ? "text-rose-400" : "text-slate-300"
                      }`}>
                        {asset.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Signal & Dynamic Target Brackets */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-center ${
                        isBuy
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isSell
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {asset.signal}
                      </span>
                      {asset.tp1_price !== undefined && asset.sl_price !== undefined && (
                        <div className="text-[9px] text-slate-400 flex items-center gap-1 justify-between font-mono">
                          <span className="text-rose-400">SL: {asset.sl_price}</span>
                          <span className="text-emerald-400">TP: {asset.tp1_price}</span>
                          {asset.rr_ratio && (
                            <span className="text-cyan-300 font-bold ml-0.5">{asset.rr_ratio}R</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Execution Trigger */}
                  <td className="py-2.5 px-3 text-right">
                    {isSell ? (
                      <button
                        onClick={() => onExecuteTrade(asset)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        title="Execute Bearish Short Scalp"
                      >
                        <ArrowDownRight className="w-3 h-3 text-rose-400" />
                        SHORT
                      </button>
                    ) : isBuy ? (
                      <button
                        onClick={() => onExecuteTrade(asset)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-black border border-emerald-500/40 font-bold text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        title="Execute Bullish Long Scalp"
                      >
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        LONG
                      </button>
                    ) : (
                      <button
                        onClick={() => onExecuteTrade(asset)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        SCALP
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

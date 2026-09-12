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
            {["ALL", "BUY", "SELL"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSignal(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  filterSignal === s
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}
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
                    ${asset.price >= 1 
                      ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) 
                      : (asset.price >= 0.01 ? asset.price.toFixed(4) : asset.price.toFixed(6))}
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
                        asset.confidence >= 70 ? "text-emerald-400" : asset.confidence <= 30 ? "text-red-400" : "text-slate-300"
                      }`}>
                        {asset.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Signal Badge */}
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isBuy
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : isSell
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {asset.signal}
                    </span>
                  </td>

                  {/* Execution Trigger */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onExecuteTrade(asset)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-black border border-cyan-500/40 font-bold text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      SCALP
                    </button>
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

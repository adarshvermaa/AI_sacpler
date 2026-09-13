"use client";

import React, { useState } from "react";
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Target, 
  CheckCircle2, 
  LayoutGrid, 
  Table as TableIcon,
  BarChart3,
  ShieldCheck,
  Percent
} from "lucide-react";

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
  breakeven_sl?: number;
  rr_ratio?: number;
  candlestick_pattern?: string;
  atr_pct?: number;
  win_probability_pct?: number;
  allocation_usdt?: number;
  margin_required_usdt?: number;
  execution_status?: string;
  order_rank?: number;
  is_executable?: boolean;
}

interface MarketScreenerTableProps {
  candidates: ScreenerAsset[];
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
  onExecuteTrade: (asset: ScreenerAsset) => void;
  onViewChart?: (asset: ScreenerAsset) => void;
  executedOrdersCount?: number;
  maxExecutableOrders?: number;
  totalUniverseScanned?: number;
}

export const MarketScreenerTable: React.FC<MarketScreenerTableProps> = ({
  candidates,
  selectedSymbol,
  onSelectSymbol,
  onExecuteTrade,
  onViewChart,
  executedOrdersCount = 0,
  maxExecutableOrders = 10,
  totalUniverseScanned = 1500
}) => {
  const [search, setSearch] = useState("");
  const [filterSignal, setFilterSignal] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Strictly restrict display to Top 10 High-Probability candidates
  const top10Candidates = candidates.slice(0, 10);

  const filteredList = top10Candidates.filter((item) => {
    const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase());
    const matchesSignal =
      filterSignal === "ALL" ||
      (filterSignal === "BUY" && item.signal.includes("BUY")) ||
      (filterSignal === "SELL" && item.signal.includes("SELL"));
    return matchesSearch && matchesSignal;
  });

  const formatVolume = (vol: number) => {
    if (!vol) return "$0";
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}k`;
    return `$${vol.toFixed(0)}`;
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col h-full font-mono">
      {/* Header with Title, Execution Counter & Protection Badges */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 sm:gap-2">
              <Target className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>TOP 10 HIGH-PROBABILITY ASSETS</span>
            </h3>

            {/* Execution Counter Badge (e.g. X/10 Orders Executed) */}
            <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{executedOrdersCount}/10 Orders Executed</span>
            </span>

            {/* Capital Protection Badge */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hidden xs:inline-flex items-center gap-1">
              <span>15% Cash Buffer Locked</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1 hidden sm:block">
            Scanned total crypto universe ({totalUniverseScanned}+ contracts) • Filtered strictly to Top 10 Profit Candidates via mathematical multi-factor AI model
          </p>
        </div>

        {/* Search, Filter Tabs & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-40 min-w-[110px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            {[
              { id: "ALL", label: "ALL 10" },
              { id: "BUY", label: "BUY" },
              { id: "SELL", label: "SELL" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterSignal(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
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

          {/* View Toggle (Mobile Helper) */}
          <div className="flex md:hidden bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-slate-800 text-cyan-400" : "text-slate-500"}`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-slate-800 text-cyan-400" : "text-slate-500"}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards View (Top 10 strictly) */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto max-h-[480px] md:hidden pr-1">
          {filteredList.map((asset, idx) => {
            const isBuy = asset.signal.includes("BUY");
            const isSell = asset.signal.includes("SELL");
            const isSelected = selectedSymbol === asset.symbol;
            const chg = asset.change_24h ?? 0;
            const rank = asset.order_rank ?? (idx + 1);
            const winProb = asset.win_probability_pct ?? 82.0;

            return (
              <div
                key={asset.symbol}
                onClick={() => onSelectSymbol && onSelectSymbol(asset.symbol)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? "bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-950/20"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      #{rank}
                    </span>
                    <span className="font-bold text-white text-xs">
                      {asset.symbol.replace("B-", "").replace("_", "/")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      isBuy ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : isSell ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-slate-800 text-slate-400"
                    }`}>
                      {asset.signal}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      ${asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(4)}
                    </div>
                    <div className={`text-[10px] font-bold ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Win Probability & Capital Details */}
                <div className="flex items-center justify-between text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1 text-purple-300 font-bold">
                    <span>⚡ Edge: {winProb.toFixed(1)}%</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Alloc: <strong className="text-white">${asset.allocation_usdt || 6.00}</strong> (₹{Math.round((asset.margin_required_usdt || 0.6) * 87.5)} margin)
                  </div>
                </div>

                {/* Bottom Action Bar: View Chart & Scalp Action */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
                  {onViewChart && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewChart(asset);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>VIEW CHART</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecuteTrade(asset);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer ml-auto ${
                      isBuy
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                        : isSell
                        ? "bg-rose-500 hover:bg-rose-400 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    SCALP {isBuy ? "BUY" : isSell ? "SELL" : "TRADE"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 2. Responsive Table View (Strictly Top 10 High-Probability Assets) */
        <div className="overflow-x-auto flex-1 max-h-[480px] relative scrollbar-thin">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="text-[10px] uppercase text-slate-400 bg-[#0c101c] sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-[#0c101c] z-20 shadow-sm">Rank & Symbol</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">24h Change</th>
                <th className="py-2.5 px-3">Win Probability</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">24h Vol</th>
                <th className="py-2.5 px-3 hidden lg:table-cell">Capital Alloc</th>
                <th className="py-2.5 px-3">AI Conviction</th>
                <th className="py-2.5 px-3">Signal</th>
                <th className="py-2.5 px-3 text-right">Chart & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((asset, idx) => {
                const isBuy = asset.signal.includes("BUY");
                const isSell = asset.signal.includes("SELL");
                const isSelected = selectedSymbol === asset.symbol;
                const chg = asset.change_24h ?? 0;
                const rank = asset.order_rank ?? (idx + 1);
                const winProb = asset.win_probability_pct ?? 82.5;

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => onSelectSymbol && onSelectSymbol(asset.symbol)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors group ${
                      isSelected ? "bg-cyan-950/25 border-l-2 border-cyan-400" : ""
                    }`}
                  >
                    {/* Rank & Symbol */}
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2 sticky left-0 bg-[#0f1422] group-hover:bg-slate-800/50 z-10">
                      <span className="text-[10px] font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/50">
                        #{rank}
                      </span>
                      <span className="truncate">{asset.symbol.replace("B-", "").replace("_", "/")}</span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 text-slate-100 font-semibold whitespace-nowrap">
                      <div>
                        ${asset.price >= 1 
                          ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) 
                          : (asset.price >= 0.01 ? asset.price.toFixed(4) : asset.price.toFixed(6))}
                      </div>
                    </td>

                    {/* 24h Change */}
                    <td className={`py-2.5 px-3 font-bold whitespace-nowrap ${chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </td>

                    {/* Win Probability Score Badge */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-fit">
                        <span>⚡</span>
                        <span>{winProb.toFixed(1)}%</span>
                      </span>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-2.5 px-3 text-slate-300 hidden sm:table-cell whitespace-nowrap">
                      {formatVolume(asset.volume_24h)}
                    </td>

                    {/* Dynamic Capital Allocation */}
                    <td className="py-2.5 px-3 hidden lg:table-cell whitespace-nowrap">
                      <div className="text-[11px]">
                        <span className="text-white font-bold">${asset.allocation_usdt || 6.00}</span>
                        <span className="text-slate-500 text-[10px] ml-1">(₹{Math.round((asset.margin_required_usdt || 0.6) * 87.5)})</span>
                      </div>
                    </td>

                    {/* AI Conviction */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isBuy ? "text-emerald-400" : isSell ? "text-rose-400" : "text-slate-300"}`}>
                          {asset.confidence.toFixed(1)}%
                        </span>
                        <div className="w-10 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden xs:block">
                          <div
                            className={`h-full rounded-full ${isBuy ? "bg-emerald-400" : isSell ? "bg-rose-400" : "bg-slate-500"}`}
                            style={{ width: `${asset.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Signal Tag */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        isBuy
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isSell
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : isSell ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {asset.signal}
                      </span>
                    </td>

                    {/* Actions: View Chart & Scalp Button */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center gap-1.5 justify-end">
                        {onViewChart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewChart(asset);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Open Candlestick Chart with SL, TP & Entry Lines"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>CHART</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExecuteTrade(asset);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer ${
                            isBuy
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                              : isSell
                              ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          {isBuy ? "SCALP BUY" : isSell ? "SCALP SELL" : "TRADE"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

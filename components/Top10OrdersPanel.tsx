"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  XCircle, 
  Clock, 
  DollarSign,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ScreenerAsset } from "./MarketScreenerTable";
import { ActiveTrade, ActiveOrder } from "./WinWinPositionManager";
import { getAssetMetadata } from "../lib/symbolMapping";

interface Top10OrdersPanelProps {
  candidates: ScreenerAsset[];
  activeTrades: ActiveTrade[];
  activeOrders?: ActiveOrder[];
  currency?: "INR" | "USDT";
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onExecuteTrade: (asset: any) => void;
  onExitTrade: (tradeId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  totalUniverseScanned?: number;
}

export const Top10OrdersPanel: React.FC<Top10OrdersPanelProps> = ({
  candidates,
  activeTrades,
  activeOrders = [],
  currency = "INR",
  selectedSymbol,
  onSelectSymbol,
  onExecuteTrade,
  onExitTrade,
  onCancelOrder,
  totalUniverseScanned = 1500
}) => {
  const [filter, setFilter] = useState<"ALL" | "EXECUTED" | "NON_EXECUTED">("ALL");

  // 1. Gather all active executed trades & orders first so they are NEVER dropped when rankings shift
  const executedItems: any[] = [];
  const processedSymbols = new Set<string>();

  activeTrades.forEach((trade, idx) => {
    processedSymbols.add(trade.symbol);
    const matchedCandidate = candidates.find((c) => c.symbol === trade.symbol);
    executedItems.push({
      rank: matchedCandidate?.order_rank ?? (idx + 1),
      candidate: matchedCandidate || {
        symbol: trade.symbol,
        price: trade.mark_price || trade.entry_price,
        entry_price: trade.entry_price,
        sl_price: trade.sl_price,
        tp1_price: trade.tp1_price,
        signal: trade.side,
        confidence: 90.0,
        win_probability_pct: 85.0
      },
      trade,
      order: activeOrders.find((o) => o.pair === trade.symbol || o.market === trade.symbol),
      isExecuted: true,
      symbol: trade.symbol
    });
  });

  // Active untriggered orders not yet in trades
  activeOrders.forEach((order) => {
    const sym = order.pair || order.market || "";
    if (sym && !processedSymbols.has(sym)) {
      processedSymbols.add(sym);
      const matchedCandidate = candidates.find((c) => c.symbol === sym);
      executedItems.push({
        rank: matchedCandidate?.order_rank ?? (executedItems.length + 1),
        candidate: matchedCandidate || {
          symbol: sym,
          price: order.price || 0,
          entry_price: order.price || 0,
          sl_price: order.stop_price,
          tp1_price: undefined,
          signal: order.side,
          confidence: 85.0,
          win_probability_pct: 80.0
        },
        trade: undefined,
        order,
        isExecuted: true,
        symbol: sym
      });
    }
  });

  // 2. Fill the remaining slots with non-executed Top candidates up to 10 total slots
  const remainingSlots = Math.max(0, 10 - executedItems.length);
  const nonExecutedCandidates = candidates.filter((c) => !processedSymbols.has(c.symbol)).slice(0, remainingSlots);

  const nonExecutedItems = nonExecutedCandidates.map((c, idx) => ({
    rank: c.order_rank ?? (executedItems.length + idx + 1),
    candidate: c,
    trade: undefined,
    order: undefined,
    isExecuted: false,
    symbol: c.symbol
  }));

  const orderItems = [...executedItems, ...nonExecutedItems];

  const executedCount = orderItems.filter((i) => i.isExecuted).length;
  const nonExecutedCount = orderItems.length - executedCount;

  const filteredItems = orderItems.filter((item) => {
    if (filter === "EXECUTED") return item.isExecuted;
    if (filter === "NON_EXECUTED") return !item.isExecuted;
    return true;
  });

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(3);
    return p.toFixed(5);
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col h-full font-mono overflow-hidden">
      {/* Header with Title & Execution Counter */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>10/10 ORDER PIPELINE</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 hidden xs:inline">
              15% Protected
            </span>
          </div>

          {/* 10/10 Counter Badges */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {executedCount}/10 Executed
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {nonExecutedCount}/10 Pending
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {[
            { id: "ALL", label: `ALL 10 (${orderItems.length})` },
            { id: "EXECUTED", label: `EXECUTED (${executedCount})` },
            { id: "NON_EXECUTED", label: `NON-EXECUTED (${nonExecutedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all text-center cursor-pointer ${
                filter === tab.id
                  ? tab.id === "EXECUTED"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : tab.id === "NON_EXECUTED"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of 10 Orders (Executed + Non-Executed) */}
      <div className="flex-1 overflow-y-auto max-h-[560px] lg:max-h-[590px] pr-1 mt-3 space-y-2.5 scrollbar-thin">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl mt-2">
            No orders match the selected filter.
          </div>
        ) : (
          filteredItems.map(({ rank, candidate, trade, order, isExecuted, symbol }) => {
            const isSelected = selectedSymbol === symbol;
            const isBuy = ((trade?.side || candidate.signal || "BUY").toUpperCase().includes("BUY"));
            const markPrice = trade?.mark_price || candidate.price;
            const entryPrice = trade?.entry_price || candidate.entry_price || candidate.price;
            const slPrice = trade?.sl_price || candidate.sl_price || (isBuy ? entryPrice * 0.9955 : entryPrice * 1.0045);
            const tp1Price = trade?.tp1_price || candidate.tp1_price || (isBuy ? entryPrice * 1.0085 : entryPrice * 0.9915);
            const pnl = trade?.unrealized_pnl ?? 0;
            const isProfit = pnl >= 0;
            const aiConfidence = candidate.confidence ?? (candidate.win_probability_pct ? candidate.win_probability_pct + 4.0 : 88.5);
            const winProb = candidate.win_probability_pct ?? (aiConfidence * 0.9);
            const meta = getAssetMetadata(symbol);

            return (
              <div
                key={symbol}
                onClick={() => onSelectSymbol(symbol)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "bg-cyan-950/25 border-cyan-500/60 shadow-lg shadow-cyan-950/25 ring-1 ring-cyan-500/40"
                    : isExecuted
                    ? "bg-emerald-950/15 border-emerald-800/40 hover:border-emerald-500/40"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header row: Rank, Symbol, Badges */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 shrink-0">
                      #{rank}
                    </span>

                    <span className="font-bold text-white text-xs truncate">
                      {symbol.replace("B-", "").replace("_", "/")}
                    </span>

                    {meta.isCommodity && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        COMMODITY
                      </span>
                    )}

                    {/* Executed vs Candidate Badge */}
                    {isExecuted ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-black shrink-0 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>EXECUTED</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                        PENDING
                      </span>
                    )}

                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {trade ? `${trade.side} ${trade.leverage || 15}x` : `${isBuy ? "BUY" : "SELL"} ${(candidate.effective_leverage || candidate.target_leverage || 15)}x`}
                    </span>

                    {candidate.max_leverage && candidate.max_leverage < 15 && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0" title={`CoinDCX Contract Max Leverage: ${candidate.max_leverage}x`}>
                        {candidate.max_leverage}x MAX
                      </span>
                    )}

                    {/* MTF Alignment & Delta Volume Badges */}
                    {candidate.mtf_confirmed && (
                      <span className="hidden sm:inline-flex text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        3-TF
                      </span>
                    )}
                    {candidate.delta_volume_ratio !== undefined && candidate.delta_volume_ratio !== 0 && (
                      <span className={`hidden sm:inline-flex text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                        candidate.delta_volume_ratio > 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                      }`}>
                        Δ{candidate.delta_volume_ratio > 0 ? "+" : ""}{(candidate.delta_volume_ratio * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Right side: PnL or AI Conviction & Win Probability */}
                  <div className="text-right shrink-0">
                    {isExecuted && trade ? (
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                          {currency === "INR" 
                            ? `${isProfit ? "+" : ""}₹${Math.round(Number(pnl) * 87.5)}` 
                            : `${isProfit ? "+" : ""}$${Number(pnl).toFixed(2)}`}
                        </span>
                        <span className={`text-[9px] font-semibold ${isProfit ? "text-emerald-300" : "text-red-300"}`}>
                          {currency === "INR" 
                            ? `(${isProfit ? "+" : ""}$${Number(pnl).toFixed(2)})` 
                            : `(${isProfit ? "+" : ""}₹${Math.round(Number(pnl) * 87.5)})`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          ⚡ {aiConfidence.toFixed(1)}%
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5">
                          Win: {winProb.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Target Ladder (Entry, Mark, SL, TP1) */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-slate-950/70 p-2 rounded-lg text-[9px] sm:text-[10px] border border-slate-800/80">
                  <div className="min-w-0 truncate">
                    <span className="text-slate-500 text-[8px] block uppercase truncate">Entry</span>
                    <span className="text-slate-200 font-bold truncate block">${formatPrice(entryPrice)}</span>
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-slate-500 text-[8px] block uppercase truncate">Mark</span>
                    <span className="text-cyan-300 font-bold truncate block">${formatPrice(markPrice)}</span>
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-slate-500 text-[8px] block uppercase truncate">SL (-0.45%)</span>
                    <span className="text-red-400 font-bold truncate block">${formatPrice(slPrice)}</span>
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-slate-500 text-[8px] block uppercase truncate">TP1 (+0.85%)</span>
                    <span className="text-emerald-400 font-bold truncate block">${formatPrice(tp1Price)}</span>
                  </div>
                </div>

                {/* Footer with Chart Active indicator & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1.5 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/50 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>CHART ACTIVE</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSymbol(symbol);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-white bg-slate-800/80 hover:bg-cyan-600 px-2 py-0.5 rounded border border-slate-700 hover:border-cyan-500 flex items-center gap-1 font-bold cursor-pointer transition-all"
                      >
                        <BarChart3 className="w-3 h-3 text-cyan-400 group-hover:text-white" />
                        <span>VIEW CHART</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isExecuted && trade ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExitTrade(trade.position_id || trade.trade_id || trade.symbol);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>EXIT</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecuteTrade(candidate);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer ${
                          isBuy
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                            : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                        }`}
                      >
                        {isBuy ? "SCALP BUY" : "SCALP SELL"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

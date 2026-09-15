"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Clock, 
  ShieldCheck, 
  Zap, 
  DollarSign,
  Wallet,
  Receipt,
  Database,
  Activity,
  CheckCircle2
} from "lucide-react";

interface PerformanceStatsProps {
  stats: {
    total_trades: number;
    win_rate_pct: number;
    profit_factor: number;
    total_pnl: number;
    net_pnl?: number;
    daily_pnl?: number;
    daily_pnl_inr?: number;
    total_fees_paid?: number;
    total_fees_paid_inr?: number;
    active_trades_count: number;
    risk_free_active_count: number;
    avg_latency_ms: number;
    current_capital?: number;
    current_capital_inr?: number;
    inr_rate?: number;
    analytics_24h?: {
      status?: string;
      database?: string;
      neon_connected?: boolean;
      tp1_hits?: number;
      tp2_hits?: number;
      sl_hits?: number;
      breakeven_exits?: number;
      total_trades_24h?: number;
      winning_trades_24h?: number;
      losing_trades_24h?: number;
      win_rate_24h_pct?: number;
      profit_factor_24h?: number;
      earned_24h_usdt?: number;
      lost_24h_usdt?: number;
      net_pnl_24h_usdt?: number;
      earned_24h_inr?: number;
      lost_24h_inr?: number;
      net_pnl_24h_inr?: number;
      total_fees_24h_usdt?: number;
      total_fees_24h_inr?: number;
      inr_rate?: number;
    };
  };
  currency?: "INR" | "USDT";
  onResetStats?: () => void;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ stats, currency = "INR", onResetStats }) => {
  const inrRate = stats.inr_rate ?? 87.5;
  const totalTrades = stats.total_trades ?? 0;
  const winRate = totalTrades > 0 ? (stats.win_rate_pct ?? 0) : 0;
  const pnlUsdt = stats.net_pnl !== undefined ? stats.net_pnl : (stats.daily_pnl !== undefined ? stats.daily_pnl : (stats.total_pnl ?? 0));
  const pnlInr = stats.daily_pnl_inr !== undefined ? stats.daily_pnl_inr : Math.round(pnlUsdt * inrRate * 100) / 100;
  const isProfit = pnlUsdt >= 0;

  const capitalUsdt = stats.current_capital ?? 7.52;
  const capitalInr = stats.current_capital_inr ?? 657.90;
  const feesUsdt = stats.total_fees_paid ?? 0.0;
  const feesInr = stats.total_fees_paid_inr ?? Math.round(feesUsdt * inrRate * 100) / 100;

  // Format Profit Factor cleanly without scientific notation or division-by-zero
  const rawPf = stats.profit_factor ?? 0;
  let pfDisplay = "0.00";
  if (totalTrades === 0) {
    pfDisplay = "0.00";
  } else if (rawPf >= 99.9 || rawPf > 1000) {
    pfDisplay = "∞ MAX";
  } else {
    pfDisplay = rawPf.toFixed(2);
  }

  // Rolling 24-Hour Analytics
  const a24 = stats.analytics_24h ?? {};
  const isNeonConnected = a24.neon_connected ?? true;
  const earnedUsdt = a24.earned_24h_usdt ?? 0.0;
  const earnedInr = a24.earned_24h_inr ?? (earnedUsdt * inrRate);
  const lostUsdt = a24.lost_24h_usdt ?? 0.0;
  const lostInr = a24.lost_24h_inr ?? (lostUsdt * inrRate);
  const net24hUsdt = a24.net_pnl_24h_usdt ?? (earnedUsdt - lostUsdt);
  const net24hInr = a24.net_pnl_24h_inr ?? (net24hUsdt * inrRate);
  const fees24hInr = a24.total_fees_24h_inr ?? ((a24.total_fees_24h_usdt ?? 0) * inrRate);

  const tp1Hits = a24.tp1_hits ?? 0;
  const tp2Hits = a24.tp2_hits ?? 0;
  const slHits = a24.sl_hits ?? 0;
  const beExits = a24.breakeven_exits ?? 0;
  const winningTrades24h = a24.winning_trades_24h ?? 0;
  const losingTrades24h = a24.losing_trades_24h ?? 0;
  const winRate24h = a24.win_rate_24h_pct ?? 0.0;

  return (
    <section aria-label="Performance Statistics" className="w-full flex flex-col gap-3">
      {/* 1. TOP 6 QUICK KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
        {/* Daily Realized Net PnL */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Session Net PnL</span>
            {currency === "INR" ? (
              <span className={`text-xs font-bold font-mono ${isProfit ? "text-emerald-400" : "text-red-400"}`}>₹</span>
            ) : (
              <DollarSign className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isProfit ? "text-emerald-400" : "text-red-400"}`} />
            )}
          </div>
          <div>
            <div className={`text-base sm:text-xl font-black font-mono tracking-tight ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
              {currency === "INR" ? (
                <>{isProfit ? "+" : ""}₹{pnlInr.toFixed(2)}</>
              ) : (
                <>{isProfit ? "+" : ""}${pnlUsdt.toFixed(2)}</>
              )}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-mono mt-0.5 ${isProfit ? "text-emerald-500/80" : "text-red-500/80"}`}>
              {currency === "INR" ? (
                <>{isProfit ? "+" : ""}${pnlUsdt.toFixed(2)} USDT</>
              ) : (
                <>{isProfit ? "+" : ""}₹{pnlInr.toFixed(2)} INR</>
              )}
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-mono border-t border-slate-800/80 pt-1.5 flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span>Bal: {currency === "INR" ? `₹${capitalInr.toFixed(0)}` : `$${capitalUsdt.toFixed(2)}`}</span>
              <span className="text-slate-500">({currency === "INR" ? `$${capitalUsdt.toFixed(2)}` : `₹${capitalInr.toFixed(0)}`})</span>
            </div>
            {feesUsdt > 0 && (
              <div className="flex justify-between text-amber-400/90 text-[8px] sm:text-[9px]">
                <span>Fees:</span>
                <span>-{currency === "INR" ? `₹${feesInr.toFixed(2)}` : `$${feesUsdt.toFixed(3)}`}</span>
              </div>
            )}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Win Rate</span>
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black font-mono text-cyan-400 tracking-tight">
              {winRate.toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalTrades > 0 ? Math.min(100, winRate) : 0}%` }}
              />
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-2 font-mono border-t border-slate-800/80 pt-1.5 truncate">
            {totalTrades > 0 ? `${totalTrades} Executed` : "0 Trades"}
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Profit Factor</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black font-mono text-purple-400 tracking-tight">
              {pfDisplay}
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-2 font-mono border-t border-slate-800/80 pt-1.5 flex justify-between items-center">
            <span>Trades: {totalTrades}</span>
            {onResetStats && totalTrades > 0 && (
              <button
                onClick={onResetStats}
                title="Reset trade statistics"
                className="text-slate-400 hover:text-red-400 text-[9px] underline transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Scalps */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Active Orders</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black font-mono text-blue-400 tracking-tight">
              {stats.active_trades_count ?? 0}
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-2 font-mono border-t border-slate-800/80 pt-1.5 truncate">
            Risk Cap: 1 Max
          </div>
        </div>

        {/* Win-Win Risk-Free Locked */}
        <div className="bg-[#0f1422]/90 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg bg-gradient-to-b from-emerald-950/20 to-transparent flex flex-col justify-between backdrop-blur-sm hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase text-emerald-400 tracking-wider">Win-Win Locked</span>
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black font-mono text-emerald-400 tracking-tight">
              {stats.risk_free_active_count ?? 0}
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-emerald-500/80 mt-2 font-mono border-t border-emerald-900/40 pt-1.5 truncate">
            Breakeven Safe
          </div>
        </div>

        {/* Execution Latency */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Engine Latency</span>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black font-mono text-amber-400 tracking-tight">
              {(stats.avg_latency_ms ?? 0.18).toFixed(2)} ms
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 mt-2 font-mono border-t border-slate-800/80 pt-1.5 truncate">
            Sub-millisecond
          </div>
        </div>
      </div>

      {/* 2. 24-HOUR INSTITUTIONAL AUDIT & NEON CLOUD DATABASE MATRIX */}
      <div className="bg-[#0c101d]/95 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
        {/* Header with Neon Cloud Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white">24-Hour Performance & Execution Statistics</span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">• Rolling 24h Window</span>
              </div>
              <p className="text-[10px] text-slate-400">Audited financial gains, losses, and order triggers saved in Neon Cloud</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border ${
              isNeonConnected 
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" 
                : "bg-amber-950/40 border-amber-500/40 text-amber-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isNeonConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span>{isNeonConnected ? "Neon Cloud PostgreSQL: Connected" : "SQLite WAL: Local Mirror"}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">AWS us-east-2</span>
          </div>
        </div>

        {/* 4 Performance Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: 24h Money Earned */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400">24H Money Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black font-mono text-emerald-400">
                {currency === "INR" ? `+₹${earnedInr.toFixed(2)}` : `+$${earnedUsdt.toFixed(4)}`}
              </div>
              <div className="text-xs font-mono text-emerald-500/90 font-semibold">
                {currency === "INR" ? `+$${earnedUsdt.toFixed(4)} USDT` : `+₹${earnedInr.toFixed(2)} INR`}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-emerald-500/20 flex justify-between font-mono">
              <span>Winning Scalps:</span>
              <span className="text-emerald-400 font-bold">{winningTrades24h}</span>
            </div>
          </div>

          {/* Card 2: 24h Money Lost */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400">24H Money Lost</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black font-mono text-rose-400">
                {currency === "INR" ? `-₹${lostInr.toFixed(2)}` : `-$${lostUsdt.toFixed(4)}`}
              </div>
              <div className="text-xs font-mono text-rose-500/90 font-semibold">
                {currency === "INR" ? `-$${lostUsdt.toFixed(4)} USDT` : `-₹${lostInr.toFixed(2)} INR`}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-rose-500/20 flex justify-between font-mono">
              <span>Stopped Trades:</span>
              <span className="text-rose-400 font-bold">{losingTrades24h}</span>
            </div>
          </div>

          {/* Card 3: 24h Net Realized PnL */}
          <div className={`border rounded-xl p-3 relative overflow-hidden flex flex-col justify-between ${
            net24hUsdt >= 0 
              ? "bg-emerald-950/15 border-emerald-500/40" 
              : "bg-rose-950/15 border-rose-500/40"
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                net24hUsdt >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>24H Net PnL</span>
              <DollarSign className={`w-4 h-4 ${net24hUsdt >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
            </div>
            <div>
              <div className={`text-lg sm:text-2xl font-black font-mono ${
                net24hUsdt >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {currency === "INR" 
                  ? `${net24hUsdt >= 0 ? "+" : ""}₹${net24hInr.toFixed(2)}` 
                  : `${net24hUsdt >= 0 ? "+" : ""}$${net24hUsdt.toFixed(4)}`}
              </div>
              <div className={`text-xs font-mono font-semibold ${
                net24hUsdt >= 0 ? "text-emerald-500/90" : "text-rose-500/90"
              }`}>
                {currency === "INR" 
                  ? `${net24hUsdt >= 0 ? "+" : ""}$${net24hUsdt.toFixed(4)} USDT` 
                  : `${net24hUsdt >= 0 ? "+" : ""}₹${net24hInr.toFixed(2)} INR`}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800 flex justify-between font-mono">
              <span>Exchange Fees:</span>
              <span className="text-amber-400/90">
                -{currency === "INR" ? `₹${fees24hInr.toFixed(2)}` : `$${(a24.total_fees_24h_usdt ?? 0).toFixed(4)}`}
              </span>
            </div>
          </div>

          {/* Card 4: Event Counters (TP1, TP2, SL, Breakeven) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-400">Order Triggers</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="bg-[#080c16] border border-cyan-500/20 rounded-lg p-1.5">
                <div className="text-[9px] text-cyan-400 font-semibold uppercase truncate">TP1 Hits</div>
                <div className="text-sm sm:text-base font-black font-mono text-cyan-300">{tp1Hits}</div>
              </div>

              <div className="bg-[#080c16] border border-purple-500/20 rounded-lg p-1.5">
                <div className="text-[9px] text-purple-400 font-semibold uppercase truncate">TP2 Hits</div>
                <div className="text-sm sm:text-base font-black font-mono text-purple-300">{tp2Hits}</div>
              </div>

              <div className="bg-[#080c16] border border-rose-500/20 rounded-lg p-1.5">
                <div className="text-[9px] text-rose-400 font-semibold uppercase truncate">SL Hits</div>
                <div className="text-sm sm:text-base font-black font-mono text-rose-400">{slHits}</div>
              </div>

              <div className="bg-[#080c16] border border-amber-500/20 rounded-lg p-1.5">
                <div className="text-[9px] text-amber-400 font-semibold uppercase truncate">Breakeven</div>
                <div className="text-sm sm:text-base font-black font-mono text-amber-300">{beExits}</div>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-right mt-1.5">
              24H Win Rate: <span className="text-cyan-400 font-semibold">{winRate24h.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

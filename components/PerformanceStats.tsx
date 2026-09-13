"use client";

import React from "react";
import { 
  TrendingUp, 
  Award, 
  Clock, 
  ShieldCheck, 
  Zap, 
  DollarSign,
  Wallet,
  Receipt
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
  };
  onResetStats?: () => void;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ stats, onResetStats }) => {
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

  return (
    <section aria-label="Performance Statistics" className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
        {/* 1. Daily Realized Net PnL */}
        <div className="bg-[#0f1422]/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col justify-between backdrop-blur-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Daily Net PnL</span>
            <DollarSign className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isProfit ? "text-emerald-400" : "text-red-400"}`} />
          </div>
          <div>
            <div className={`text-base sm:text-xl font-black font-mono tracking-tight ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
              {isProfit ? "+" : ""}${pnlUsdt.toFixed(2)}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-mono mt-0.5 ${isProfit ? "text-emerald-500/80" : "text-red-500/80"}`}>
              {isProfit ? "+" : ""}₹{pnlInr.toFixed(2)} INR
            </div>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-mono border-t border-slate-800/80 pt-1.5 flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span>Bal: ₹{capitalInr.toFixed(0)}</span>
              <span className="text-slate-500">(${capitalUsdt.toFixed(2)})</span>
            </div>
            {feesUsdt > 0 && (
              <div className="flex justify-between text-amber-400/90 text-[8px] sm:text-[9px]">
                <span>Fees:</span>
                <span>-₹{feesInr.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Win Rate */}
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

        {/* 3. Profit Factor */}
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

        {/* 4. Active Scalps */}
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

        {/* 5. Win-Win Risk-Free Locked */}
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

        {/* 6. Execution Latency */}
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
    </section>
  );
};

"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, XCircle, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface ActiveTrade {
  trade_id: string;
  symbol: string;
  side: string;
  entry_price: number;
  tp1_price: number;
  tp2_price: number;
  sl_price: number;
  breakeven_sl: number;
  is_risk_free: boolean;
  remaining_qty: number;
  unrealized_pnl: number;
  realized_pnl: number;
  state: string;
  elapsed_seconds: number;
}

interface WinWinPositionManagerProps {
  activeTrades: ActiveTrade[];
  onExitTrade: (tradeId: string) => void;
  onExitAll: () => void;
}

export const WinWinPositionManager: React.FC<WinWinPositionManagerProps> = ({
  activeTrades,
  onExitTrade,
  onExitAll
}) => {
  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase">
              ACTIVE "WIN-WIN" SCALP POSITIONS
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              {activeTrades.length} LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tri-Bracket Positions with Automatic Breakeven Ratchet and 30s Invalidation Time-Out
          </p>
        </div>

        {activeTrades.length > 0 && (
          <button
            onClick={onExitAll}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            FLATTEN ALL POSITIONS
          </button>
        )}
      </div>

      {activeTrades.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl">
          <ShieldCheck className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-semibold">NO ACTIVE SCALPS OPEN</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Engine is monitoring 500+ pairs. Trades will auto-open when high-conviction AI signals fire.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto max-h-[420px]">
          {activeTrades.map((trade) => {
            const isBuy = trade.side === "BUY";
            const isProfit = trade.unrealized_pnl >= 0;

            return (
              <div
                key={trade.trade_id}
                className={`border rounded-xl p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                  trade.is_risk_free
                    ? "bg-gradient-to-b from-emerald-950/30 to-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : "bg-slate-900/80 border-slate-800"
                }`}
              >
                {/* Top: Pair, Side, Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {trade.symbol.replace("B-", "").replace("_", "/")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {trade.side} 10x
                    </span>
                  </div>

                  {trade.is_risk_free ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-black shadow-sm animate-pulse">
                      <ShieldCheck className="w-3 h-3" />
                      WIN-WIN LOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      {trade.elapsed_seconds}s / 30s
                    </span>
                  )}
                </div>

                {/* Price Ladder (Entry, TP1, SL) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg text-[11px] mb-3 border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 text-[10px] block">ENTRY</span>
                    <span className="text-slate-200 font-bold">${trade.entry_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">TP1 (+0.35%)</span>
                    <span className="text-emerald-400 font-bold">${trade.tp1_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      {trade.is_risk_free ? "BREAKEVEN SL" : "HARD SL"}
                    </span>
                    <span className={`font-bold ${trade.is_risk_free ? "text-cyan-300" : "text-red-400"}`}>
                      ${(trade.is_risk_free ? trade.breakeven_sl : trade.sl_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom: PnL & Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">UNREALIZED PNL</span>
                    <span className={`text-base font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                      {isProfit ? "+" : ""}${trade.unrealized_pnl.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onExitTrade(trade.trade_id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-red-500 cursor-pointer"
                  >
                    EXIT MARKET
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

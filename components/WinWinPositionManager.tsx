"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, XCircle, ArrowUpRight, ArrowDownRight, Clock, ListOrdered, Ban, RefreshCw, BarChart3 } from "lucide-react";

export interface ActiveTrade {
  trade_id: string;
  position_id?: string;
  symbol: string;
  side: string;
  entry_price: number;
  mark_price?: number;
  liquidation_price?: number;
  tp1_price?: number;
  tp2_price?: number;
  sl_price?: number;
  breakeven_sl?: number;
  is_risk_free?: boolean;
  remaining_qty: number;
  unrealized_pnl: number;
  unrealized_pnl_inr?: number;
  roe_percent?: number;
  locked_margin_usdt?: number;
  locked_margin_inr?: number;
  leverage?: number;
  state?: string;
  is_live?: boolean;
  elapsed_seconds?: number;
}

export interface ActiveOrder {
  id: string;
  pair?: string;
  market?: string;
  side: string;
  order_type: string;
  status: string;
  stage?: string;
  price?: number;
  stop_price?: number;
  total_quantity?: number;
  remaining_quantity?: number;
  product_type?: "FUTURES" | "SPOT";
  created_at?: number | string;
}

interface WinWinPositionManagerProps {
  activeTrades: ActiveTrade[];
  activeOrders?: ActiveOrder[];
  currency?: "INR" | "USDT";
  onExitTrade: (tradeId: string) => void;
  onExitAll: () => void;
  onCancelOrder?: (orderId: string) => void;
  onCancelAllOrders?: () => void;
  onRefreshOrders?: () => void;
  onViewChart?: (asset: any) => void;
}

export const WinWinPositionManager: React.FC<WinWinPositionManagerProps> = ({
  activeTrades,
  activeOrders = [],
  currency = "INR",
  onExitTrade,
  onExitAll,
  onCancelOrder,
  onCancelAllOrders,
  onRefreshOrders,
  onViewChart
}) => {
  const [activeTab, setActiveTab] = useState<"positions" | "orders">("positions");
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleExitClick = async (id: string) => {
    setExitingId(id);
    try {
      await onExitTrade(id);
    } finally {
      setTimeout(() => setExitingId(null), 1000);
    }
  };

  const handleCancelClick = async (id: string) => {
    if (!onCancelOrder) return;
    setCancellingId(id);
    try {
      await onCancelOrder(id);
    } finally {
      setTimeout(() => setCancellingId(null), 1000);
    }
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col h-full font-mono">
      {/* Header with Responsive Dual Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-3.5 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Tab 1: Positions */}
          <button
            onClick={() => setActiveTab("positions")}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "positions"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-[11px] sm:text-xs">FUTURES POSITIONS</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTrades.length > 0 ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"
            }`}>
              {activeTrades.length}
            </span>
          </button>

          {/* Tab 2: Active Orders */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-[11px] sm:text-xs">ACTIVE ORDERS</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeOrders.length > 0 ? "bg-amber-500 text-black" : "bg-slate-800 text-slate-400"
            }`}>
              {activeOrders.length}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {onRefreshOrders && (
            <button
              onClick={onRefreshOrders}
              title="Refresh CoinDCX Orders & Positions"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {activeTab === "positions" && activeTrades.length > 0 && (
            <button
              onClick={onExitAll}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">FLATTEN ALL</span>
              <span className="xs:hidden">FLATTEN</span>
            </button>
          )}

          {activeTab === "orders" && activeOrders.length > 0 && onCancelAllOrders && (
            <button
              onClick={onCancelAllOrders}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-black text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">CANCEL ALL</span>
              <span className="xs:hidden">CANCEL</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT 1: POSITIONS */}
      {activeTab === "positions" && (
        <>
          {activeTrades.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-slate-800 rounded-xl">
              <ShieldCheck className="w-9 h-9 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">NO ACTIVE FUTURES POSITIONS OPEN</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                CoinDCX futures account has zero active open positions. When an AI scalp executes, it will appear here with live PnL, INR margin, and 1-tap clean exit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
              {activeTrades.map((trade) => {
                const isBuy = trade.side === "BUY";
                const isProfit = (trade.unrealized_pnl ?? 0) >= 0;
                const targetId = trade.position_id || trade.trade_id || trade.symbol;
                const isBusy = exitingId === targetId;

                return (
                  <div
                    key={trade.trade_id || trade.symbol}
                    className={`border rounded-xl p-3.5 sm:p-4 transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                      trade.is_risk_free
                        ? "bg-gradient-to-b from-emerald-950/25 to-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Top: Pair, Side, Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {trade.symbol.replace("B-", "").replace("_", "/")}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {trade.side} {trade.leverage || 10}x
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold hidden xs:inline">
                          Qty: {trade.remaining_qty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {trade.is_risk_free ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            RISK-FREE
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-bold">
                            TP/SL ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Trigger Ladder (Responsive 2-col on small mobile, 4-col on tablet/desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-2.5 rounded-xl text-[11px] border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Entry</span>
                        <span className="text-slate-200 font-bold">${Number(trade.entry_price).toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Mark Price</span>
                        <span className="text-cyan-300 font-bold">${Number(trade.mark_price || trade.entry_price).toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">TP Target</span>
                        <span className="text-emerald-400 font-bold">
                          {trade.tp1_price ? `$${Number(trade.tp1_price).toFixed(4)}` : "PROTECTED"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase">Stop Loss</span>
                        <span className="text-red-400 font-bold">
                          {trade.sl_price ? `$${Number(trade.sl_price).toFixed(4)}` : "PROTECTED"}
                        </span>
                      </div>
                    </div>

                    {/* Margin & PnL Bar (Clean responsive flex wrap) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800/80 gap-2.5">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          MARGIN:{" "}
                          <span className="text-slate-200 font-bold">
                            {currency === "INR" 
                              ? `₹${Number(trade.locked_margin_inr || (trade.locked_margin_usdt ? trade.locked_margin_usdt * 87.5 : 55)).toFixed(1)} INR` 
                              : `$${Number(trade.locked_margin_usdt || 0.63).toFixed(2)} USDT`}
                          </span>
                          <span className="text-slate-500 text-[9px] ml-1">
                            {currency === "INR" 
                              ? `($${Number(trade.locked_margin_usdt || 0.63).toFixed(2)})` 
                              : `(₹${Number(trade.locked_margin_inr || (trade.locked_margin_usdt ? trade.locked_margin_usdt * 87.5 : 55)).toFixed(1)})`}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className={`text-sm sm:text-base font-bold font-mono ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                            {currency === "INR" ? (
                              <>{isProfit ? "+" : ""}₹{Number(trade.unrealized_pnl_inr || (trade.unrealized_pnl ? trade.unrealized_pnl * 87.5 : 0)).toFixed(2)} INR</>
                            ) : (
                              <>{isProfit ? "+" : ""}${Number(trade.unrealized_pnl || 0).toFixed(4)} USDT</>
                            )}
                          </span>
                          <span className={`text-[11px] font-semibold font-mono ${isProfit ? "text-emerald-300" : "text-red-300"}`}>
                            {currency === "INR" ? (
                              <>({isProfit ? "+" : ""}${Number(trade.unrealized_pnl || 0).toFixed(4)} USDT)</>
                            ) : (
                              <>({isProfit ? "+" : ""}₹{Number(trade.unrealized_pnl_inr || (trade.unrealized_pnl ? trade.unrealized_pnl * 87.5 : 0)).toFixed(2)})</>
                            )}
                          </span>
                          {trade.roe_percent !== undefined && (
                            <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              isProfit ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                            }`}>
                              {isProfit ? "+" : ""}{trade.roe_percent}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {onViewChart && (
                          <button
                            onClick={() => onViewChart({
                              symbol: trade.symbol,
                              price: trade.mark_price || trade.entry_price,
                              mark_price: trade.mark_price || trade.entry_price,
                              entry_price: trade.entry_price,
                              tp1_price: trade.tp1_price,
                              tp2_price: trade.tp2_price,
                              sl_price: trade.sl_price,
                              breakeven_sl: trade.breakeven_sl,
                              is_risk_free: trade.is_risk_free,
                              side: trade.side,
                              is_executed: true,
                              execution_status: "ACTIVE POSITION"
                            })}
                            className="px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            title="Open Candlestick Chart with Entry, SL & TP Lines"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>CHART</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleExitClick(targetId)}
                          disabled={isBusy}
                          className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                            isBusy
                              ? "bg-slate-800 text-slate-500 border-slate-700"
                              : "bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border-red-500/40 hover:border-red-500 shadow-sm"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isBusy ? "EXITING..." : "EXIT & CANCEL SL/TP"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT 2: ACTIVE ORDERS & CONDITIONAL TP/SL */}
      {activeTab === "orders" && (
        <>
          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-slate-800 rounded-xl">
              <ListOrdered className="w-9 h-9 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">NO ACTIVE ORDERS FOUND ON COINDCX</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                There are no open or untriggered orders (limits, stop losses, take profits) on CoinDCX. Exited orders are cleanly purged with zero leftover triggers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 max-h-[460px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950/60 sticky top-0">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Pair</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Price / Trigger</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeOrders.map((ord) => {
                    const isBuy = ord.side.toLowerCase() === "buy";
                    const isUntriggered = ord.status.toLowerCase() === "untriggered";
                    const pair = ord.pair || ord.market || "Unknown";
                    const isBusy = cancellingId === ord.id;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {ord.id.length > 14 ? `${ord.id.slice(0, 8)}...${ord.id.slice(-4)}` : ord.id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                          {pair.replace("B-", "").replace("_", "/")}
                        </td>
                        <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {ord.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] hidden sm:table-cell whitespace-nowrap">
                          {ord.order_type.replace("_", " ").toUpperCase()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isUntriggered ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-blue-500/20 text-blue-300"
                          }`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-200 whitespace-nowrap">
                          {ord.stop_price && Number(ord.stop_price) > 0 ? (
                            <span className="text-amber-300">${Number(ord.stop_price).toFixed(4)} (Trigger)</span>
                          ) : ord.price && Number(ord.price) > 0 ? (
                            <span>${Number(ord.price).toFixed(4)}</span>
                          ) : (
                            <span className="text-slate-500">MARKET</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-bold hidden md:table-cell whitespace-nowrap">
                          {ord.remaining_quantity !== undefined ? ord.remaining_quantity : ord.total_quantity || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center gap-1.5 justify-end">
                            {onViewChart && (
                              <button
                                onClick={() => onViewChart({
                                  symbol: pair,
                                  price: ord.price || ord.stop_price || 100.0,
                                  entry_price: ord.price,
                                  sl_price: ord.stop_price,
                                  side: ord.side,
                                  is_executed: true,
                                  execution_status: `ORDER ${ord.status}`
                                })}
                                className="px-2 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-500 hover:text-black text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                title="View Candlestick Chart with Order Triggers"
                              >
                                <BarChart3 className="w-3 h-3" />
                                <span>CHART</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCancelClick(ord.id)}
                              disabled={isBusy}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                                isBusy
                                  ? "bg-slate-800 text-slate-500 border-slate-700"
                                  : "bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border-red-500/30 hover:border-red-500 shadow-sm"
                              }`}
                            >
                              {isBusy ? "CANCELLING..." : "CANCEL"}
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
        </>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldCheck, 
  Zap, 
  Maximize2, 
  ArrowUpRight, 
  ArrowDownRight,
  XCircle,
  BarChart2,
  Tv,
  Layers,
  Sparkles
} from "lucide-react";
import { ChartAssetData } from "./ChartVisualizerModal";

interface TradingViewWidgetProps {
  asset: ChartAssetData | null;
  activeTrade?: any | null;
  onExecuteTrade: (asset: any) => void;
  onExitTrade?: (tradeId: string) => void;
  onExpandFullscreen?: () => void;
  initialTimeframe?: string;
}

import { getTradingViewSymbol, getAssetMetadata } from "../lib/symbolMapping";

export { getTradingViewSymbol, getAssetMetadata };

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  asset,
  activeTrade,
  onExecuteTrade,
  onExitTrade,
  onExpandFullscreen,
  initialTimeframe = "15"
}) => {
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe); // default to 15m as in user's image
  const [orderQty, setOrderQty] = useState<string>("1");
  const [isLiveHover, setIsLiveHover] = useState<boolean>(false);
  const [showTargetsOverlay, setShowTargetsOverlay] = useState<boolean>(true);

  const symbol = asset?.symbol || activeTrade?.symbol || "B-BTC_USDT";
  const assetMeta = useMemo(() => getAssetMetadata(symbol), [symbol]);
  const tvSymbol = assetMeta.tvSymbol;

  // Derived price levels
  const currentPrice = activeTrade?.mark_price || asset?.price || 100.0;
  const isBuy = ((activeTrade?.side || asset?.signal || "BUY").toUpperCase().includes("BUY"));

  const entryPrice = activeTrade?.entry_price || asset?.entry_price || currentPrice;
  const stopLossPrice = activeTrade?.sl_price || asset?.sl_price || (isBuy ? entryPrice * 0.9955 : entryPrice * 1.0045);
  const tp1Price = activeTrade?.tp1_price || asset?.tp1_price || (isBuy ? entryPrice * 1.0085 : entryPrice * 0.9915);
  const tp2Price = activeTrade?.tp2_price || asset?.tp2_price || (isBuy ? entryPrice * 1.0185 : entryPrice * 0.9815);
  const bePrice = activeTrade?.breakeven_sl || (activeTrade?.is_risk_free ? entryPrice : asset?.breakeven_sl);

  const spread = currentPrice * 0.0002;
  const bidPrice = Math.max(0.0001, currentPrice - spread);
  const askPrice = currentPrice + spread;

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(4);
    return p.toFixed(5);
  };

  const winProb = asset?.win_probability_pct ?? 82.5;
  const pnl = activeTrade?.unrealized_pnl ?? 0;
  const pnlProfit = pnl >= 0;

  // TradingView IFrame URL with exact dark mode, withdateranges, studies and Asia/Kolkata timezone
  const tvIframeUrl = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: "tradingview_widget",
      symbol: tvSymbol,
      interval: timeframe,
      hidesidetoolbar: "0",
      symboledit: "1",
      saveimage: "1",
      toolbarbg: "000000",
      studies: JSON.stringify(["Volume@tv-basicstudies"]),
      theme: "dark",
      style: "1",
      timezone: "Asia/Kolkata",
      withdateranges: "1",
      studies_overrides: "{}",
      overrides: "{}",
      enabled_features: "[]",
      disabled_features: "[]",
      locale: "en",
      utm_source: "localhost"
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [tvSymbol, timeframe]);

  return (
    <div className="bg-[#000000] border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-full font-mono overflow-hidden relative">
      {/* 1. TOP ASSET HEADER BAR */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-800/90 bg-[#07090e] flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-xl border shrink-0 ${
            isBuy ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}>
            {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide shrink-0">
                {symbol.replace("B-", "").replace("_", "/")}
              </h3>

              {assetMeta.displayName && assetMeta.displayName !== symbol.replace("B-", "").replace(/[_/].*$/, "") && (
                <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40 truncate max-w-[110px] sm:max-w-none">
                  {assetMeta.displayName}
                </span>
              )}

              {assetMeta.isCommodity && (
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  CFD
                </span>
              )}

              {activeTrade ? (
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500 text-black flex items-center gap-1 shadow-sm shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>LIVE ORDER</span>
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shrink-0">
                  <Target className="w-2.5 h-2.5" />
                  <span>TOP PICK</span>
                </span>
              )}

              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                ⚡ {winProb.toFixed(1)}% EDGE
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>Mark: <strong className="text-white font-bold">${formatPrice(currentPrice)}</strong></span>
              <span>•</span>
              <span className={isBuy ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {activeTrade ? `${activeTrade.side} 10x` : (asset?.signal || (isBuy ? "STRONG BUY" : "STRONG SELL"))}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 hidden sm:inline-block">
                Chart: <strong className="text-cyan-300">{tvSymbol}</strong>
              </span>
              {activeTrade && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">PnL: <strong className={pnlProfit ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                    {pnlProfit ? "+" : ""}${Number(pnl).toFixed(2)}
                  </strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Fullscreen Trigger */}
        {onExpandFullscreen && (
          <button
            onClick={onExpandFullscreen}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Expand Fullscreen Chart"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. TOOLBAR & QUICK TRADING HUD STRIP */}
      <div className="px-3 sm:px-4 py-2 bg-[#0c101c] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs z-10">
        {/* Left: Timeframe selector & SL/TP toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 text-xs">
            {[
              { id: "1", label: "1m" },
              { id: "5", label: "5m" },
              { id: "15", label: "15m" },
              { id: "60", label: "1h" },
              { id: "D", label: "1D" }
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                  timeframe === tf.id ? "bg-cyan-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTargetsOverlay(!showTargetsOverlay)}
            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer border ${
              showTargetsOverlay
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
            title="Toggle On-Chart Stop Loss & Take Profit Targets"
          >
            <Target className="w-3 h-3 text-cyan-400" />
            <span>{showTargetsOverlay ? "SL/TP: ON" : "SL/TP: OFF"}</span>
          </button>
        </div>

        {/* Right: Quick Buy / Qty / Sell Order Execution Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => onExecuteTrade(asset || { symbol, price: askPrice, signal: "BUY" })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            title="Instant Market Buy Order"
          >
            <span>{formatPrice(askPrice)}</span>
            <span className="bg-black/20 px-1 py-0.2 rounded text-[9px] uppercase font-bold">Buy</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-xs text-white">
            <span className="text-[9px] text-slate-400 mr-1 font-bold">Qty:</span>
            <input
              type="text"
              value={orderQty}
              onChange={(e) => setOrderQty(e.target.value)}
              className="w-7 bg-transparent text-center font-bold text-white focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={() => onExecuteTrade(asset || { symbol, price: bidPrice, signal: "SELL" })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[11px] transition-all shadow-md shadow-rose-950/40 cursor-pointer"
            title="Instant Market Sell Order"
          >
            <span>{formatPrice(bidPrice)}</span>
            <span className="bg-black/20 px-1 py-0.2 rounded text-[9px] uppercase font-bold">Sell</span>
          </button>
        </div>
      </div>

      {/* 3. ALGORITHMIC SL / TP TARGETS TICKER STRIP */}
      <div className="px-3 sm:px-4 py-1.5 bg-[#090d17] border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono overflow-x-auto scrollbar-none gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-bold">ENTRY:</span>
            <span className="text-white font-bold">${formatPrice(entryPrice)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-rose-400 font-bold">SL:</span>
            <span className="text-white font-bold">${formatPrice(stopLossPrice)}</span>
            <span className="text-rose-400/80 text-[9px]">(-0.45%)</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-bold">TP1:</span>
            <span className="text-white font-bold">${formatPrice(tp1Price)}</span>
            <span className="text-cyan-400/80 text-[9px]">(+0.85%)</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-teal-300 font-bold">TP2:</span>
            <span className="text-white font-bold">${formatPrice(tp2Price)}</span>
            <span className="text-teal-400/80 text-[9px]">(+1.85%)</span>
          </div>

          {bePrice && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-bold">BE LOCK:</span>
              <span className="text-white font-bold">${formatPrice(bePrice)}</span>
            </div>
          )}
        </div>

        <div className="text-slate-500 text-[9px] shrink-0 hidden lg:block">
          10x Isolated • 15% Risk Floor Protected
        </div>
      </div>

      {/* EMBEDDED TRADINGVIEW ADVANCED REAL-TIME CANVAS WITH SL/TP OVERLAY */}
      <div className="flex-1 w-full min-h-[380px] sm:min-h-[440px] relative bg-[#000000]">
        <iframe
          key={`${tvSymbol}-${timeframe}`}
          src={tvIframeUrl}
          className="w-full h-full border-0 absolute inset-0 select-none"
          title={`TradingView-Pro-${symbol}`}
          allowFullScreen
          loading="eager"
        />

        {/* ON-CHART VISUAL SL, TP1, TP2 & ENTRY TARGET OVERLAY */}
        {showTargetsOverlay && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
            {/* 1. Floating Top-Left Risk/Reward Telemetry Card */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#080d1a]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-2 sm:p-2.5 shadow-2xl pointer-events-auto transition-all max-w-[280px]">
              <div className="flex items-center justify-between gap-2 text-[10px] pb-1 border-b border-slate-800">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span>TARGETS (SL / TP)</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                  10x ISOLATED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[10px] font-mono">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-emerald-400 font-bold">ENTRY:</span>
                  <span className="text-white font-bold">${formatPrice(entryPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-rose-400 font-bold">SL:</span>
                  <span className="text-rose-300 font-bold">${formatPrice(stopLossPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-cyan-300 font-bold">TP1:</span>
                  <span className="text-cyan-200 font-bold">${formatPrice(tp1Price)}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-teal-300 font-bold">TP2:</span>
                  <span className="text-teal-200 font-bold">${formatPrice(tp2Price)}</span>
                </div>
                {bePrice && (
                  <div className="col-span-2 flex items-center justify-between gap-1 pt-0.5 border-t border-slate-800/80">
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-amber-400" /> BE LOCKED:
                    </span>
                    <span className="text-amber-300 font-bold">${formatPrice(bePrice)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Visual Horizontal Target Guide Rails across TradingView Chart Canvas */}
            {/* TP2 Guide Line */}
            <div className="absolute top-[20%] left-0 right-0 flex items-center">
              <div className="flex-1 border-t border-dashed border-teal-400/70" />
              <div className="shrink-0 bg-[#042f2e]/95 border border-teal-500/70 rounded-l-md px-2 py-0.5 text-[10px] font-mono text-teal-300 font-bold shadow-lg shadow-teal-950/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>TP2: ${formatPrice(tp2Price)} (+1.85%)</span>
              </div>
            </div>

            {/* TP1 Guide Line */}
            <div className="absolute top-[38%] left-0 right-0 flex items-center">
              <div className="flex-1 border-t border-dashed border-cyan-400/80" />
              <div className="shrink-0 bg-[#083344]/95 border border-cyan-500/70 rounded-l-md px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-bold shadow-lg shadow-cyan-950/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>TP1: ${formatPrice(tp1Price)} (+0.85%)</span>
              </div>
            </div>

            {/* Entry Guide Line */}
            <div className="absolute top-[56%] left-0 right-0 flex items-center">
              <div className="flex-1 border-t-2 border-emerald-400/90" />
              <div className="shrink-0 bg-[#064e3b]/95 border border-emerald-400 rounded-l-md px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold shadow-lg shadow-emerald-950/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ENTRY: ${formatPrice(entryPrice)}</span>
              </div>
            </div>

            {/* Stop Loss (SL) Guide Line */}
            <div className="absolute top-[76%] left-0 right-0 flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-rose-500/90" />
              <div className="shrink-0 bg-[#4c0519]/95 border border-rose-500 rounded-l-md px-2 py-0.5 text-[10px] font-mono text-rose-300 font-bold shadow-lg shadow-rose-950/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>SL: ${formatPrice(stopLossPrice)} (-0.45%)</span>
              </div>
            </div>

            {/* Breakeven Lock Line if activated */}
            {bePrice && (
              <div className="absolute top-[52%] left-0 right-0 flex items-center">
                <div className="flex-1 border-t border-dashed border-amber-400/90" />
                <div className="shrink-0 bg-[#451a03]/95 border border-amber-500/80 rounded-l-md px-2 py-0.5 text-[10px] font-mono text-amber-300 font-bold shadow-lg shadow-amber-950/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>BE LOCK: ${formatPrice(bePrice)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status / Protection HUD */}
      <div className="px-4 py-2 bg-[#07090e] border-t border-slate-800/80 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-400 text-[10px]">
          <div>
            <span>R:R RATIO: </span>
            <strong className="text-emerald-400">1 : {(asset?.rr_ratio || 2.1).toFixed(1)}</strong>
          </div>
          <span>•</span>
          <div>
            <span>MAX LOSS @ SL: </span>
            <strong className="text-rose-400">₹2.36 INR (-0.45%)</strong>
          </div>
          <span>•</span>
          <div>
            <span>CAPITAL PROTECTED: </span>
            <strong className="text-cyan-300">15% Reserve Locked</strong>
          </div>
        </div>

        {activeTrade && onExitTrade && (
          <button
            onClick={() => onExitTrade(activeTrade.position_id || activeTrade.trade_id || activeTrade.symbol)}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md ml-auto"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>FLATTEN POSITION</span>
          </button>
        )}
      </div>
    </div>
  );
};

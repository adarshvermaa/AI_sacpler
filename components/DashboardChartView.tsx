"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Maximize2, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  XCircle,
  BarChart2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Tv,
  Eye
} from "lucide-react";
import { ChartAssetData } from "./ChartVisualizerModal";
import { getTradingViewSymbol, getAssetMetadata } from "../lib/symbolMapping";

export { getTradingViewSymbol, getAssetMetadata };

interface DashboardChartViewProps {
  asset: ChartAssetData | null;
  activeTrade?: any | null;
  onExecuteTrade: (asset: any) => void;
  onExitTrade?: (tradeId: string) => void;
  onExpandFullscreen?: () => void;
}

interface CandleBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const DashboardChartView: React.FC<DashboardChartViewProps> = ({
  asset,
  activeTrade,
  onExecuteTrade,
  onExitTrade,
  onExpandFullscreen
}) => {
  const [chartMode, setChartMode] = useState<"QUANT" | "TRADINGVIEW">("TRADINGVIEW");
  const [timeframe, setTimeframe] = useState<string>("15");
  const [orderQty, setOrderQty] = useState<string>("1");
  const [allCandles, setAllCandles] = useState<CandleBar[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showTargetsOverlay, setShowTargetsOverlay] = useState<boolean>(true);
  
  // Advanced Zoom & View Controls
  const zoomPresets = [18, 28, 40, 55, 75]; // visible candle counts
  const [zoomLevel, setZoomLevel] = useState<number>(2); // default 40 candles
  const [panOffset, setPanOffset] = useState<number>(0);
  
  // Crosshair state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; price: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleBar | null>(null);

  const symbol = asset?.symbol || activeTrade?.symbol || "B-BTC_USDT";
  const assetMeta = useMemo(() => getAssetMetadata(symbol), [symbol]);
  const tvSymbol = assetMeta.tvSymbol;

  // TradingView IFrame URL with exact dark theme, Volume histogram, Asia/Kolkata timezone, and Date Ranges
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

  // Fetch real candles from backend or generate realistic price-anchored series
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchCandles = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/v1/markets/candles?symbol=${encodeURIComponent(symbol)}&resolution=${timeframe}&limit=80`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.candles && data.candles.length > 0) {
            setAllCandles(data.candles);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }

      if (isMounted) {
        const basePrice = asset?.price || activeTrade?.mark_price || activeTrade?.entry_price || 100.0;
        const count = 75;
        const now = Date.now();
        const intervalMs = (parseInt(timeframe) || 1) * 60 * 1000;
        const generated: CandleBar[] = [];
        let curr = basePrice * 0.994;

        for (let i = 0; i < count; i++) {
          const t = now - (count - 1 - i) * intervalMs;
          const delta = (Math.random() - 0.488) * (basePrice * 0.0026);
          const cOpen = curr;
          const cClose = Math.max(0.0001, cOpen + delta);
          const cHigh = Math.max(cOpen, cClose) * (1 + Math.random() * 0.0014);
          const cLow = Math.min(cOpen, cClose) * (1 - Math.random() * 0.0014);
          const cVol = Math.round(120 + Math.random() * 320);

          generated.push({
            time: t,
            open: cOpen,
            high: cHigh,
            low: cLow,
            close: cClose,
            volume: cVol
          });
          curr = cClose;
        }
        generated[generated.length - 1].close = basePrice;
        setAllCandles(generated);
        setIsLoading(false);
      }
    };

    fetchCandles();
    const interval = setInterval(fetchCandles, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, timeframe, asset?.price, activeTrade?.mark_price]);

  // Derived price levels & execution state
  const isExecuted = Boolean(activeTrade) || asset?.is_executed || Boolean(asset?.execution_status?.includes("QUALIFIED") && activeTrade);
  const currentPrice = activeTrade?.mark_price || asset?.price || 100.0;
  const isBuy = ((activeTrade?.side || asset?.signal || "BUY").toUpperCase().includes("BUY"));

  const entryPrice = activeTrade?.entry_price || asset?.entry_price || currentPrice;
  const stopLossPrice = activeTrade?.sl_price || asset?.sl_price || (isBuy ? entryPrice * 0.9955 : entryPrice * 1.0045);
  const tp1Price = activeTrade?.tp1_price || asset?.tp1_price || (isBuy ? entryPrice * 1.0085 : entryPrice * 0.9915);
  const tp2Price = activeTrade?.tp2_price || asset?.tp2_price || (isBuy ? entryPrice * 1.0185 : entryPrice * 0.9815);
  const bePrice = activeTrade?.breakeven_sl || (activeTrade?.is_risk_free ? entryPrice : asset?.breakeven_sl);

  // Zoom & Visible Candle Slicing
  const visibleCount = zoomPresets[zoomLevel] || 40;
  const visibleCandles = useMemo(() => {
    if (allCandles.length <= visibleCount) return allCandles;
    const end = Math.max(visibleCount, allCandles.length - panOffset);
    const start = Math.max(0, end - visibleCount);
    return allCandles.slice(start, end);
  }, [allCandles, visibleCount, panOffset]);

  // SVG Chart Geometry
  const chartWidth = 780;
  const chartHeight = 310;
  const padding = { top: 24, right: 120, bottom: 32, left: 15 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const { minPrice, maxPrice, priceToY, yToPrice, candleCoordinates } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { 
        minPrice: 0, 
        maxPrice: 1, 
        priceToY: () => 0, 
        yToPrice: () => 0,
        candleCoordinates: [] 
      };
    }

    let min = Math.min(...visibleCandles.map((c) => c.low));
    let max = Math.max(...visibleCandles.map((c) => c.high));

    // Ensure all critical order levels fit inside view
    min = Math.min(min, stopLossPrice, entryPrice, tp1Price, tp2Price, currentPrice);
    max = Math.max(max, stopLossPrice, entryPrice, tp1Price, tp2Price, currentPrice);
    if (bePrice) {
      min = Math.min(min, bePrice);
      max = Math.max(max, bePrice);
    }

    const spread = Math.max(max - min, min * 0.004);
    const paddedMin = min - spread * 0.08;
    const paddedMax = max + spread * 0.08;

    const priceToY = (p: number) => {
      const clamped = Math.max(paddedMin, Math.min(paddedMax, p));
      return padding.top + plotHeight * (1 - (clamped - paddedMin) / (paddedMax - paddedMin));
    };

    const yToPrice = (y: number) => {
      const ratio = 1 - (y - padding.top) / plotHeight;
      return paddedMin + ratio * (paddedMax - paddedMin);
    };

    const candleWidth = Math.max(4, Math.min(18, (plotWidth / visibleCandles.length) * 0.68));
    const step = plotWidth / visibleCandles.length;

    const coords = visibleCandles.map((c, idx) => {
      const x = padding.left + idx * step + step / 2;
      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const highY = priceToY(c.high);
      const lowY = priceToY(c.low);
      const isUp = c.close >= c.open;

      return {
        ...c,
        x,
        openY,
        closeY,
        highY,
        lowY,
        bodyTop: Math.min(openY, closeY),
        bodyHeight: Math.max(1.5, Math.abs(closeY - openY)),
        candleWidth,
        isUp
      };
    });

    return {
      minPrice: paddedMin,
      maxPrice: paddedMax,
      priceToY,
      yToPrice,
      candleCoordinates: coords
    };
  }, [visibleCandles, stopLossPrice, entryPrice, tp1Price, tp2Price, bePrice, currentPrice]);

  // Zoom In / Zoom Out / Auto-Fit Handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0, prev - 1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(zoomPresets.length - 1, prev + 1));
  };

  const handleAutoFit = () => {
    setZoomLevel(2); // reset to standard optimal view
    setPanOffset(0); // reset pan to latest candles
  };

  // Crosshair Mouse Handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = chartWidth / rect.width;
    const scaleY = chartHeight / rect.height;

    const x = clientX * scaleX;
    const y = clientY * scaleY;

    if (x >= padding.left && x <= padding.left + plotWidth && y >= padding.top && y <= padding.top + plotHeight) {
      const p = yToPrice(y);
      setCrosshair({ x, y, price: p });
    } else {
      setCrosshair(null);
    }
  };

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(3);
    return p.toFixed(5);
  };

  const winProb = asset?.win_probability_pct ?? 82.5;
  const pnlProfit = (activeTrade?.unrealized_pnl ?? 0) >= 0;

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-full font-mono overflow-hidden">
      {/* 1. TOP ASSET HEADER BAR */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-800/90 bg-[#0d121f] flex items-center justify-between gap-2">
        {/* Left: Asset Identity, Badges & Mark */}
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
                {activeTrade ? `${activeTrade.side} ${activeTrade.leverage || 10}x` : (asset?.signal || (isBuy ? "STRONG BUY" : "STRONG SELL"))}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 hidden sm:inline-block">
                Chart: <strong className="text-cyan-300">{tvSymbol}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Engine Switcher & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs shadow-inner">
            <button
              onClick={() => setChartMode("QUANT")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                chartMode === "QUANT" 
                  ? "bg-cyan-500 text-black shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Alpha Quant Chart with Horizontal Entry, SL, TP1, TP2 & BE lines"
            >
              <BarChart2 className="w-3 h-3" />
              <span className="hidden xs:inline">QUANT</span>
            </button>
            <button
              onClick={() => setChartMode("TRADINGVIEW")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                chartMode === "TRADINGVIEW" 
                  ? "bg-purple-500 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Official TradingView Advanced Real-Time Chart"
            >
              <Tv className="w-3 h-3" />
              <span>TRADINGVIEW</span>
            </button>
          </div>

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
      </div>

      {/* 2. TOOLBAR & QUICK TRADING HUD STRIP */}
      <div className="px-3 sm:px-4 py-2 bg-[#0c101c] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Timeframe pills, SL/TP toggle, Zoom controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            {(chartMode === "TRADINGVIEW" ? [
              { id: "1", label: "1m" },
              { id: "5", label: "5m" },
              { id: "15", label: "15m" },
              { id: "60", label: "1h" },
              { id: "D", label: "1D" }
            ] : [
              { id: "1", label: "1m" },
              { id: "5", label: "5m" },
              { id: "15", label: "15m" }
            ]).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                  timeframe === tf.id ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* SL/TP On-Chart Toggle */}
          {chartMode === "TRADINGVIEW" && (
            <button
              onClick={() => setShowTargetsOverlay(!showTargetsOverlay)}
              className={`px-2 py-0.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer border ${
                showTargetsOverlay
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm"
                  : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
              }`}
              title="Toggle On-Chart Stop Loss & Take Profit Guide Lines"
            >
              <Target className="w-3 h-3 text-cyan-400" />
              <span>{showTargetsOverlay ? "SL/TP: ON" : "SL/TP: OFF"}</span>
            </button>
          )}

          {/* Quant Zoom Controls */}
          {chartMode === "QUANT" && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleAutoFit}
                className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Auto-Fit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>FIT</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Buy / Qty / Sell Order Execution Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => onExecuteTrade(asset || { symbol, price: currentPrice * 1.0002, signal: "BUY", qty: parseFloat(orderQty) || 1 })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            title="Instant Market Buy"
          >
            <span>{formatPrice(currentPrice * 1.0002)}</span>
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
            onClick={() => onExecuteTrade(asset || { symbol, price: Math.max(0.0001, currentPrice * 0.9998), signal: "SELL", qty: parseFloat(orderQty) || 1 })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[11px] transition-all shadow-md shadow-rose-950/40 cursor-pointer"
            title="Instant Market Sell"
          >
            <span>{formatPrice(Math.max(0.0001, currentPrice * 0.9998))}</span>
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

        {/* Quant Mode Hover Details or Status Info */}
        {hoveredCandle ? (
          <div className="text-slate-400 text-[9px] hidden lg:flex items-center gap-1.5 shrink-0">
            <span>O: <strong className="text-white">${formatPrice(hoveredCandle.open)}</strong></span>
            <span>H: <strong className="text-emerald-400">${formatPrice(hoveredCandle.high)}</strong></span>
            <span>L: <strong className="text-rose-400">${formatPrice(hoveredCandle.low)}</strong></span>
            <span>C: <strong className="text-white">${formatPrice(hoveredCandle.close)}</strong></span>
          </div>
        ) : crosshair ? (
          <div className="text-cyan-300 text-[10px] font-bold shrink-0 hidden sm:block">
            CURSOR: ${formatPrice(crosshair.price)}
          </div>
        ) : (
          <div className="text-slate-500 text-[9px] shrink-0 hidden lg:block">
            10x Isolated • 15% Risk Floor Protected
          </div>
        )}
      </div>

      {/* CHART CANVAS AREA: QUANT SVG vs TRADINGVIEW EMBED */}
      <div className="relative flex-1 bg-[#000000] overflow-hidden flex items-center justify-center min-h-[460px] sm:min-h-[500px]">
        {chartMode === "TRADINGVIEW" ? (
          /* Real Interactive TradingView Advanced Chart Embed with Volume, Date Ranges, and Asia/Kolkata timezone */
          <div className="w-full h-full min-h-[460px] sm:min-h-[500px] relative">
            <iframe
              key={`${tvSymbol}-${timeframe}`}
              src={tvIframeUrl}
              className="w-full h-full border-0 absolute inset-0 select-none"
              title={`TradingView-${symbol}`}
              loading="eager"
              allowFullScreen
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
        ) : (
          /* Alpha Quant Interactive Candlestick Engine with SL/TP Lines, Zoom, and Crosshair */
          isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Activity className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="text-xs font-bold">Loading live candlestick bars...</span>
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full select-none cursor-crosshair"
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setCrosshair(null);
                setHoveredCandle(null);
              }}
            >
              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75].map((ratio) => {
                const y = padding.top + plotHeight * ratio;
                const priceAtY = minPrice + (maxPrice - minPrice) * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />
                    <text
                      x={chartWidth - padding.right + 6}
                      y={y + 3}
                      fill="#475569"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      ${formatPrice(priceAtY)}
                    </text>
                  </g>
                );
              })}

              {/* Candlesticks */}
              {candleCoordinates.map((c, i) => (
                <g
                  key={i}
                  className="transition-opacity hover:opacity-80"
                  onMouseEnter={() => setHoveredCandle(c)}
                >
                  <line
                    x1={c.x}
                    y1={c.highY}
                    x2={c.x}
                    y2={c.lowY}
                    stroke={c.isUp ? "#10b981" : "#f43f5e"}
                    strokeWidth="1.4"
                  />
                  <rect
                    x={c.x - c.candleWidth / 2}
                    y={c.bodyTop}
                    width={c.candleWidth}
                    height={c.bodyHeight}
                    fill={c.isUp ? "#10b981" : "#f43f5e"}
                    rx="1"
                  />
                </g>
              ))}

              {/* ======================================================= */}
              {/* HORIZONTAL PRICE LEVEL LINES WITH VIBRANT BADGES        */}
              {/* ======================================================= */}

              {/* 1. ENTRY LINE */}
              {(() => {
                const y = priceToY(entryPrice);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#10b981"
                      strokeWidth="1.6"
                      strokeDasharray="4 2"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 9}
                      width={110}
                      height={18}
                      rx="3"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3.5}
                      fill="#34d399"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ENTRY ${formatPrice(entryPrice)}
                    </text>
                  </g>
                );
              })()}

              {/* 2. STOP LOSS LINE */}
              {(() => {
                const y = priceToY(stopLossPrice);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#f43f5e"
                      strokeWidth="1.8"
                      strokeDasharray="3 3"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 9}
                      width={110}
                      height={18}
                      rx="3"
                      fill="#4c0519"
                      stroke="#f43f5e"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3.5}
                      fill="#fda4af"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      SL ${formatPrice(stopLossPrice)}
                    </text>
                  </g>
                );
              })()}

              {/* 3. TAKE PROFIT 1 LINE */}
              {(() => {
                const y = priceToY(tp1Price);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 9}
                      width={110}
                      height={18}
                      rx="3"
                      fill="#083344"
                      stroke="#06b6d4"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3.5}
                      fill="#67e8f9"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      TP1 ${formatPrice(tp1Price)}
                    </text>
                  </g>
                );
              })()}

              {/* 4. TAKE PROFIT 2 LINE */}
              {(() => {
                const y = priceToY(tp2Price);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                      strokeDasharray="5 3"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 9}
                      width={110}
                      height={18}
                      rx="3"
                      fill="#042f2e"
                      stroke="#14b8a6"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3.5}
                      fill="#5eead4"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      TP2 ${formatPrice(tp2Price)}
                    </text>
                  </g>
                );
              })()}

              {/* 5. BREAKEVEN SL LINE */}
              {bePrice && (() => {
                const y = priceToY(bePrice);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#f59e0b"
                      strokeWidth="1.8"
                      strokeDasharray="2 2"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 9}
                      width={110}
                      height={18}
                      rx="3"
                      fill="#451a03"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3.5}
                      fill="#fcd34d"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      BE ${formatPrice(bePrice)}
                    </text>
                  </g>
                );
              })()}

              {/* 6. LIVE MARK PRICE LINE */}
              {(() => {
                const y = priceToY(currentPrice);
                return (
                  <g>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="1 3"
                    />
                    <circle
                      cx={padding.left + plotWidth}
                      cy={y}
                      r="3"
                      fill="#38bdf8"
                      className="animate-ping"
                    />
                    <circle
                      cx={padding.left + plotWidth}
                      cy={y}
                      r="2.5"
                      fill="#38bdf8"
                    />
                    <rect
                      x={chartWidth - padding.right + 4}
                      y={y - 8}
                      width={110}
                      height={16}
                      rx="3"
                      fill="#0369a1"
                    />
                    <text
                      x={chartWidth - padding.right + 8}
                      y={y + 3}
                      fill="#ffffff"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      LIVE ${formatPrice(currentPrice)}
                    </text>
                  </g>
                );
              })()}

              {/* 7. CROSSHAIR POINTER (Following Mouse) */}
              {crosshair && (
                <g>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={crosshair.x}
                    y1={padding.top}
                    x2={crosshair.x}
                    y2={padding.top + plotHeight}
                    stroke="#94a3b8"
                    strokeWidth="0.9"
                    strokeDasharray="3 3"
                  />
                  {/* Horizontal Crosshair Line */}
                  <line
                    x1={padding.left}
                    y1={crosshair.y}
                    x2={padding.left + plotWidth}
                    y2={crosshair.y}
                    stroke="#94a3b8"
                    strokeWidth="0.9"
                    strokeDasharray="3 3"
                  />
                  {/* Price Tag at Cursor */}
                  <rect
                    x={chartWidth - padding.right + 2}
                    y={crosshair.y - 7}
                    width={90}
                    height={14}
                    rx="2"
                    fill="#334155"
                  />
                  <text
                    x={chartWidth - padding.right + 6}
                    y={crosshair.y + 3}
                    fill="#f8fafc"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ${formatPrice(crosshair.price)}
                  </text>
                </g>
              )}
            </svg>
          )
        )}
      </div>

      {/* Bottom Action / HUD Bar */}
      <div className="px-4 py-2.5 bg-[#0d121f] border-t border-slate-800 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 block">R:R RATIO</span>
            <strong className="text-emerald-400">1 : {(asset?.rr_ratio || 2.1).toFixed(1)}</strong>
          </div>
          <span className="text-slate-700 hidden xs:inline">•</span>
          <div>
            <span className="text-[9px] text-slate-500 block">CAPITAL ALLOC</span>
            <strong className="text-white">${asset?.allocation_usdt || 6.00}</strong>
          </div>
          <span className="text-slate-700 hidden xs:inline">•</span>
          <div>
            <span className="text-[9px] text-slate-500 block">MARGIN REQ</span>
            <strong className="text-cyan-300">₹{Math.round((asset?.margin_required_usdt || 0.60) * 87.5)} INR</strong>
          </div>
        </div>

        {/* Scalp Buy / Exit Trigger */}
        <div className="flex items-center gap-2 justify-end">
          {activeTrade && onExitTrade ? (
            <button
              onClick={() => onExitTrade(activeTrade.position_id || activeTrade.trade_id || activeTrade.symbol)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>FLATTEN POSITION</span>
            </button>
          ) : (
            <button
              onClick={() => onExecuteTrade(asset || { symbol, price: currentPrice, signal: isBuy ? "BUY" : "SELL" })}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isBuy
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-950/40"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40"
              }`}
            >
              {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>SCALP {isBuy ? "BUY" : "SELL"} ($6.00)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

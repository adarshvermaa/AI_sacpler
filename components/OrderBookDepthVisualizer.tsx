"use client";

import React, { useState, useEffect } from "react";
import { Layers } from "lucide-react";

interface OrderBookDepthVisualizerProps {
  symbol?: string;
  midPrice?: number;
  obi?: number;
}

export const OrderBookDepthVisualizer: React.FC<OrderBookDepthVisualizerProps> = ({
  symbol = "B-BTC_USDT",
  midPrice = 77395.00,
  obi = 0.42
}) => {
  const [liveOrderBook, setLiveOrderBook] = useState<{ bids: Record<string, string>; asks: Record<string, string> } | null>(null);

  // Fetch live orderbook depth from CoinDCX API via backend
  useEffect(() => {
    let isMounted = true;
    const fetchOB = async () => {
      try {
        const cleanSymbol = symbol.startsWith("B-") ? symbol : `B-${symbol.replace("/", "_")}`;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/v1/markets/orderbook?symbol=${cleanSymbol}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.bids && Object.keys(data.bids).length > 0) {
            setLiveOrderBook(data);
          }
        }
      } catch (e) {
        // Fallback to anchored spread
      }
    };

    fetchOB();
    const interval = setInterval(fetchOB, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  // Construct asks and bids from live CoinDCX data or anchor tightly around real midPrice
  let asks: { price: number; qty: number; total: number }[] = [];
  let bids: { price: number; qty: number; total: number }[] = [];
  let displayMidPrice = midPrice;
  let spreadVal = midPrice * 0.0002;

  if (liveOrderBook && Object.keys(liveOrderBook.asks || {}).length > 0 && Object.keys(liveOrderBook.bids || {}).length > 0) {
    const rawAsks = Object.entries(liveOrderBook.asks).map(([p, q]) => ({
      price: parseFloat(p),
      qty: parseFloat(q),
      total: parseFloat(p) * parseFloat(q)
    }));
    rawAsks.sort((a, b) => b.price - a.price);
    asks = rawAsks.slice(-6); // lowest 6 asks for clean mobile height

    const rawBids = Object.entries(liveOrderBook.bids).map(([p, q]) => ({
      price: parseFloat(p),
      qty: parseFloat(q),
      total: parseFloat(p) * parseFloat(q)
    }));
    rawBids.sort((a, b) => b.price - a.price);
    bids = rawBids.slice(0, 6); // highest 6 bids

    if (asks.length > 0 && bids.length > 0) {
      const bestAsk = asks[asks.length - 1].price;
      const bestBid = bids[0].price;
      displayMidPrice = (bestAsk + bestBid) / 2.0;
      spreadVal = Math.max(0.0001, bestAsk - bestBid);
    }
  } else {
    // Fallback strictly anchored to real midPrice
    const halfSpread = midPrice * 0.0001;
    asks = Array.from({ length: 6 }).map((_, i) => {
      const p = midPrice + halfSpread + (i * midPrice * 0.0001);
      const q = 0.5 + (i * 0.8) + (Math.sin(i) * 0.3);
      return { price: p, qty: Math.max(0.01, q), total: q * p };
    }).reverse();

    bids = Array.from({ length: 6 }).map((_, i) => {
      const p = midPrice - halfSpread - (i * midPrice * 0.0001);
      const q = 0.8 + (i * 1.1) + (Math.cos(i) * 0.4);
      return { price: p, qty: Math.max(0.01, q), total: q * p };
    });
  }

  const maxAskQty = Math.max(...asks.map(a => a.qty), 0.1);
  const maxBidQty = Math.max(...bids.map(b => b.qty), 0.1);
  const maxQty = Math.max(maxAskQty, maxBidQty);
  const microPrice = displayMidPrice + (obi * spreadVal * 1.2);
  const spreadPct = (spreadVal / Math.max(displayMidPrice, 1e-6)) * 100;

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col h-full font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm truncate">
            L2 DEPTH • {symbol.replace("B-", "").replace("_", "/")}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] shrink-0">
          <span className="text-slate-400">OBI:</span>
          <span className={`font-bold ${obi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {obi >= 0 ? "+" : ""}{(obi * 100).toFixed(0)}% {obi >= 0 ? "BUY" : "SELL"}
          </span>
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 text-[10px] uppercase text-slate-500 pb-1 px-2 font-bold">
        <span>Price (USDT)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total ($)</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex flex-col gap-0.5 mb-1.5">
        {asks.map((ask, idx) => {
          const depthPct = (ask.qty / maxQty) * 100;
          return (
            <div
              key={`ask-${idx}`}
              className="grid grid-cols-3 py-0.5 px-2 text-[11px] relative overflow-hidden group"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-red-500/10 pointer-events-none transition-all"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-red-400 relative z-10 font-medium">
                {ask.price >= 1 ? ask.price.toFixed(2) : ask.price.toFixed(4)}
              </span>
              <span className="text-right text-slate-300 relative z-10">{ask.qty.toFixed(3)}</span>
              <span className="text-right text-slate-500 relative z-10">
                ${ask.total >= 1000 ? `${(ask.total / 1000).toFixed(1)}k` : ask.total.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Spread & Micro-Price Indicator (Responsive Wrap) */}
      <div className="py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col xs:flex-row xs:items-center justify-between gap-1 my-1">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-white">
            ${displayMidPrice >= 1 ? displayMidPrice.toFixed(2) : displayMidPrice.toFixed(4)}
          </span>
          <span className="text-[10px] text-slate-400">
            SPREAD: ${spreadVal >= 1 ? spreadVal.toFixed(2) : spreadVal.toFixed(4)} ({spreadPct.toFixed(3)}%)
          </span>
        </div>
        <div className="text-[10px] text-cyan-300 flex items-center gap-1 font-bold">
          <span>MICRO:</span>
          <span>${microPrice >= 1 ? microPrice.toFixed(2) : microPrice.toFixed(4)}</span>
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="flex flex-col gap-0.5 mt-1.5">
        {bids.map((bid, idx) => {
          const depthPct = (bid.qty / maxQty) * 100;
          return (
            <div
              key={`bid-${idx}`}
              className="grid grid-cols-3 py-0.5 px-2 text-[11px] relative overflow-hidden group"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none transition-all"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-emerald-400 relative z-10 font-medium">
                {bid.price >= 1 ? bid.price.toFixed(2) : bid.price.toFixed(4)}
              </span>
              <span className="text-right text-slate-300 relative z-10">{bid.qty.toFixed(3)}</span>
              <span className="text-right text-slate-500 relative z-10">
                ${bid.total >= 1000 ? `${(bid.total / 1000).toFixed(1)}k` : bid.total.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

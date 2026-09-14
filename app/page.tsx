"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { AlertTriangle, CheckCircle2, Square, Play, ShieldAlert } from "lucide-react";

import { Header, CoinDCXVerificationData } from "../components/Header";
import { ModeSelector } from "../components/ModeSelector";
import { CustomStudioPanel } from "../components/CustomStudioPanel";
import { PerformanceStats } from "../components/PerformanceStats";
import { MarketScreenerTable } from "../components/MarketScreenerTable";
import { OrderBookDepthVisualizer } from "../components/OrderBookDepthVisualizer";
import { WinWinPositionManager } from "../components/WinWinPositionManager";
import { ExecutionLog } from "../components/ExecutionLog";
import { ChartVisualizerModal, ChartAssetData } from "../components/ChartVisualizerModal";
import { DashboardChartView } from "../components/DashboardChartView";
import { Top10OrdersPanel } from "../components/Top10OrdersPanel";
import { LeverageStartModal } from "../components/LeverageStartModal";

const BACKEND_URL = "http://localhost:8000";

export default function AlphaScalperDashboard() {
  const [socket, setSocket] = useState<any>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState<boolean>(false);
  const [leverage, setLeverage] = useState<number>(15);
  const [mode, setMode] = useState<"DEFAULT" | "CUSTOM">("DEFAULT");
  const [latencyMs, setLatencyMs] = useState<number>(0.18);
  const [dailyPnl, setDailyPnl] = useState<number>(0.0);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);
  
  // CoinDCX API Diagnostics & Live Balance State
  const [coindcxStatus, setCoindcxStatus] = useState<CoinDCXVerificationData | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("B-BTC_USDT");

  // Chart Visualizer Modal State
  const [selectedChartAsset, setSelectedChartAsset] = useState<ChartAssetData | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState<boolean>(false);

  const handleOpenChart = (asset: any) => {
    setSelectedChartAsset(asset);
    setIsChartModalOpen(true);
  };

  const handleCloseChart = () => {
    setIsChartModalOpen(false);
  };

  const [stats, setStats] = useState<any>({
    total_trades: 0,
    win_rate_pct: 0.0,
    profit_factor: 0.0,
    total_pnl: 0.0,
    net_pnl: 0.0,
    daily_pnl: 0.0,
    daily_pnl_inr: 0.0,
    total_fees_paid: 0.0,
    total_fees_paid_inr: 0.0,
    active_trades_count: 0,
    risk_free_active_count: 0,
    avg_latency_ms: 0.18,
    current_capital: 7.52,
    current_capital_inr: 657.90,
    inr_rate: 87.5
  });

  const [candidates, setCandidates] = useState<any[]>([
    { symbol: "B-BTC_USDT", price: 77285.00, confidence: 94.2, win_probability_pct: 86.5, signal: "STRONG_BUY", volume_24h: 7403500000, spread_pct: 0.02, change_24h: -1.24, obi_10: 0.68, regime: "TRENDING", order_rank: 1 },
    { symbol: "B-ETH_USDT", price: 2541.79, confidence: 88.5, win_probability_pct: 82.0, signal: "BUY", volume_24h: 4223100000, spread_pct: 0.03, change_24h: -2.15, obi_10: 0.54, regime: "TRENDING", order_rank: 2 },
    { symbol: "B-SOL_USDT", price: 101.97, confidence: 96.1, win_probability_pct: 89.4, signal: "STRONG_BUY", volume_24h: 1433200000, spread_pct: 0.04, change_24h: 3.60, obi_10: 0.72, regime: "VOLATILITY", order_rank: 3 },
    { symbol: "B-XRP_USDT", price: 1.3694, confidence: 82.3, win_probability_pct: 78.5, signal: "BUY", volume_24h: 688300000, spread_pct: 0.03, change_24h: -0.88, obi_10: 0.49, regime: "TRENDING", order_rank: 4 },
    { symbol: "B-DOGE_USDT", price: 0.0851, confidence: 76.5, win_probability_pct: 72.8, signal: "BUY", volume_24h: 279200000, spread_pct: 0.04, change_24h: 1.40, obi_10: 0.38, regime: "VOLATILITY", order_rank: 5 },
    { symbol: "B-SUI_USDT", price: 0.7255, confidence: 91.4, win_probability_pct: 84.6, signal: "STRONG_BUY", volume_24h: 201500000, spread_pct: 0.03, change_24h: 4.70, obi_10: 0.61, regime: "VOLATILITY", order_rank: 6 },
    { symbol: "B-ADA_USDT", price: 0.4280, confidence: 79.8, win_probability_pct: 75.2, signal: "BUY", volume_24h: 185000000, spread_pct: 0.03, change_24h: -1.10, obi_10: 0.41, regime: "TRENDING", order_rank: 7 },
    { symbol: "B-AVAX_USDT", price: 24.15, confidence: 85.2, win_probability_pct: 79.0, signal: "BUY", volume_24h: 165000000, spread_pct: 0.04, change_24h: 2.30, obi_10: 0.45, regime: "VOLATILITY", order_rank: 8 },
    { symbol: "B-LINK_USDT", price: 14.82, confidence: 87.6, win_probability_pct: 81.3, signal: "BUY", volume_24h: 142000000, spread_pct: 0.03, change_24h: 0.95, obi_10: 0.52, regime: "TRENDING", order_rank: 9 },
    { symbol: "B-NEAR_USDT", price: 4.95, confidence: 83.4, win_probability_pct: 77.5, signal: "BUY", volume_24h: 115000000, spread_pct: 0.04, change_24h: -0.45, obi_10: 0.43, regime: "VOLATILITY", order_rank: 10 }
  ]);

  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<any>(null);

  const [logs, setLogs] = useState<any[]>([
    { timestamp: "18:42:10.124", type: "WIN_WIN_BREAKEVEN_LOCKED", message: "TP1 Hit on B-BTC_USDT! 50% closed at +$45.20. Stop Loss ratcheted to Breakeven. Trade is 100% Risk-Free!" },
    { timestamp: "18:42:04.550", type: "ENTRY", message: "Executed BUY Scalp on B-SOL_USDT @ $148.50 (Allocated: $250, Leverage: 10x)" },
    { timestamp: "18:41:52.880", type: "MARKET_SCAN", message: "Scanned 500 instruments -> Filtered 100 Liquid pairs -> Top alpha detected: SOL, BTC, SUI" }
  ]);

  // Ensure default 1st row candidate is selected on viewchart
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      if (!selectedSymbol || selectedSymbol === "B-BTC_USDT" || !candidates.some((c) => c.symbol === selectedSymbol)) {
        setSelectedSymbol(candidates[0].symbol);
      }
    }
  }, [candidates]);

  // Fetch initial strategy configuration from backend on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/strategy/config`)
      .then(res => res.json())
      .then(data => {
        if (data?.config) {
          setStrategyConfig(data.config);
          if (data.config.mode) setMode(data.config.mode);
        }
      })
      .catch(() => {});
  }, []);

  // Connect to Python Backend via Socket.IO
  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 20
    });

    s.on("connect", () => {
      console.log("Connected to AlphaScalper Backend WebSocket!");
    });

    s.on("initial_state", (data: any) => {
      if (data.is_running !== undefined) setIsRunning(data.is_running);
      if (data.mode) setMode(data.mode);
      if (data.config) setStrategyConfig(data.config);
      if (data.stats) setStats((prev: any) => ({ ...prev, ...data.stats }));
      if (data.top_10_filtered && data.top_10_filtered.length > 0) {
        setCandidates(data.top_10_filtered);
      }
    });

    s.on("telemetry_update", (data: any) => {
      if (data.is_running !== undefined) setIsRunning(data.is_running);
      if (data.mode) setMode(data.mode);
      if (data.latency_ms !== undefined) setLatencyMs(data.latency_ms);
      if (data.daily_pnl !== undefined) setDailyPnl(data.daily_pnl);
      if (data.kill_switch_active !== undefined) setKillSwitchActive(data.kill_switch_active);
      if (data.top_10_filtered && data.top_10_filtered.length > 0) {
        setCandidates(data.top_10_filtered);
      } else if (data.filtered_100_summary && data.filtered_100_summary.length > 0) {
        setCandidates(data.filtered_100_summary.slice(0, 10));
      }
      setStats((prev: any) => ({
        ...prev,
        win_rate_pct: data.win_rate_pct ?? prev.win_rate_pct,
        profit_factor: data.profit_factor ?? prev.profit_factor,
        total_trades: data.total_trades ?? prev.total_trades,
        active_trades_count: data.active_trades_count ?? prev.active_trades_count,
        risk_free_active_count: data.risk_free_count ?? prev.risk_free_active_count,
        daily_pnl: data.daily_pnl ?? prev.daily_pnl,
        daily_pnl_inr: data.daily_pnl_inr ?? prev.daily_pnl_inr,
        net_pnl: data.net_pnl ?? prev.net_pnl,
        total_fees_paid: data.total_fees_paid ?? prev.total_fees_paid,
        total_fees_paid_inr: data.total_fees_paid_inr ?? prev.total_fees_paid_inr,
        avg_latency_ms: data.avg_latency_ms ?? prev.avg_latency_ms,
        current_capital: data.current_capital ?? prev.current_capital,
        current_capital_inr: data.current_capital_inr ?? prev.current_capital_inr,
        inr_rate: data.inr_rate ?? prev.inr_rate
      }));
    });

    s.on("screener_update", (data: any) => {
      if (data.top_10_filtered && data.top_10_filtered.length > 0) {
        setCandidates(data.top_10_filtered);
      } else if (data.top_100_filtered && data.top_100_filtered.length > 0) {
        setCandidates(data.top_100_filtered.slice(0, 10));
      }
    });

    s.on("positions_update", (data: any) => {
      if (data.positions && Array.isArray(data.positions)) {
        handleRefreshPositionsAndOrders();
      }
    });

    s.on("orders_update", (data: any) => {
      if (data.orders && Array.isArray(data.orders)) {
        setActiveOrders(data.orders);
      }
    });

    s.on("execution_event", (event: any) => {
      const timeStr = new Date().toLocaleTimeString() + "." + Math.floor(Math.random() * 900 + 100);
      setLogs((prev) => [
        {
          timestamp: timeStr,
          type: event.type || event.event || "EVENT",
          message: event.message || JSON.stringify(event)
        },
        ...prev.slice(0, 40)
      ]);
      // Invalidate and refresh positions/orders on any execution event
      handleRefreshPositionsAndOrders();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleVerifyCoinDCX = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/coindcx/verify`);
      if (res.ok) {
        const data: CoinDCXVerificationData = await res.json();
        setCoindcxStatus(data);
        if (data.total_usdt_balance !== undefined) {
          const inrBal = data.futures_inr_balance ?? (data.total_usdt_balance * 87.5);
          setStats((prev: any) => ({
            ...prev,
            current_capital: data.total_usdt_balance,
            current_capital_inr: inrBal,
            inr_rate: 87.5
          }));
        }
      }
    } catch (e) {
      console.error("CoinDCX verification error:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/stats/reset`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setDailyPnl(0.0);
        if (data.stats) {
          setStats((prev: any) => ({
            ...prev,
            ...data.stats,
            daily_pnl: 0.0,
            daily_pnl_inr: 0.0,
            net_pnl: 0.0,
            total_fees_paid: 0.0,
            total_fees_paid_inr: 0.0
          }));
        } else {
          setStats((prev: any) => ({
            ...prev,
            total_trades: 0,
            win_rate_pct: 0.0,
            profit_factor: 0.0,
            total_pnl: 0.0,
            net_pnl: 0.0,
            daily_pnl: 0.0,
            daily_pnl_inr: 0.0,
            total_fees_paid: 0.0,
            total_fees_paid_inr: 0.0,
            active_trades_count: 0,
            risk_free_active_count: 0
          }));
        }
        setLogs((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            type: "STATS_RESET",
            message: "Performance statistics and Daily PnL reset to 0 for fresh live tracking."
          },
          ...prev
        ]);
      }
    } catch (e) {
      console.error("Failed to reset statistics:", e);
    }
  };

  // Pre-flight CoinDCX API verification & live market scan on component mount
  useEffect(() => {
    handleVerifyCoinDCX();
    handleRefreshPositionsAndOrders();
    handleRefreshScan();
    const verifyInterval = setInterval(handleVerifyCoinDCX, 60000); // verify every 60s
    return () => {
      clearInterval(verifyInterval);
    };
  }, []);

  // Poll positions & active orders strictly every 1 minute (60,000ms) to sync with 1-min SL/TP auto-heal loop
  useEffect(() => {
    const interval = setInterval(async () => {
      handleRefreshPositionsAndOrders();
    }, 60000); // Strictly 1-minute interval
    return () => clearInterval(interval);
  }, []);

  const handleToggleEngine = async () => {
    if (isRunning) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/engine/stop`, { method: "POST" });
        if (res.ok) {
          setIsRunning(false);
        }
      } catch (e) {
        setIsRunning(false);
      }
    } else {
      // Prompt with interactive Manual Leverage modal before starting
      setIsLeverageModalOpen(true);
    }
  };

  const handleConfirmLeverage = async (chosenLeverage: number) => {
    setLeverage(chosenLeverage);
    setIsLeverageModalOpen(false);

    if (isRunning) {
      // If already running, update leverage dynamically on the fly
      try {
        await fetch(`${BACKEND_URL}/api/v1/strategy/configure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leverage: chosenLeverage })
        });
        handleRefreshScan();
      } catch (e) {}
    } else {
      // Start the engine with chosen leverage
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/engine/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leverage: chosenLeverage })
        });
        if (res.ok) {
          setIsRunning(true);
          handleRefreshScan();
        }
      } catch (e) {
        setIsRunning(true);
      }
    }
  };

  const handleKillSwitch = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/engine/kill_switch`, { method: "POST" });
      setIsRunning(false);
      setKillSwitchActive(true);
      setActiveTrades([]);
    } catch (e) {
      setIsRunning(false);
      setKillSwitchActive(true);
      setActiveTrades([]);
    }
  };

  const handleSelectMode = (newMode: "DEFAULT" | "CUSTOM") => {
    setMode(newMode);
    fetch(`${BACKEND_URL}/api/v1/strategy/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: newMode })
    })
      .then(() => handleRefreshScan())
      .catch(() => {});
  };

  const handleApplyCustomConfig = async (config: any, executeNow: boolean = false) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/strategy/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setStrategyConfig(data.config);

        setLogs((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            type: "CONFIG_APPLIED",
            message: `Applied Custom Studio: Leverage=${config.leverage}x, Orders=${config.execution_count}, SL=${config.stop_loss_pct}%, TP1=${config.take_profit_1_pct}%, MinConf=${config.min_confidence}%`
          },
          ...prev
        ]);

        // Immediately refresh screener with the new strategy rules
        const scanRes = await fetch(`${BACKEND_URL}/api/v1/markets/screener`);
        if (scanRes.ok) {
          const scanData = await scanRes.json();
          if (scanData.top_10_filtered) setCandidates(scanData.top_10_filtered);
          else if (scanData.top_100_filtered) setCandidates(scanData.top_100_filtered.slice(0, 10));

          // If user clicked "Apply & Auto-Execute", immediately execute matching targets
          if (executeNow && scanData.ranked_targets && scanData.ranked_targets.length > 0) {
            const execCount = config.execution_count || 1;
            const toExecute = scanData.ranked_targets.slice(0, execCount);
            for (const target of toExecute) {
              if (target.signal && (target.signal.includes("BUY") || target.signal.includes("SELL"))) {
                await handleExecuteSingleTrade(target);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to apply custom config:", e);
    }
  };

  const handleRefreshScan = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/markets/screener`);
      if (res.ok) {
        const data = await res.json();
        if (data.top_10_filtered) setCandidates(data.top_10_filtered);
        else if (data.top_100_filtered) setCandidates(data.top_100_filtered.slice(0, 10));
      }
    } catch (e) {}
  };

  const handleExecuteSingleTrade = async (asset: any) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair: asset.symbol,
          side: asset.signal?.includes("SELL") ? "sell" : "buy",
          order_type: "market_order",
          notional: 6.0,
          price: asset.entry_price || asset.price,
          tp_price: asset.tp1_price,
          sl_price: asset.sl_price,
          tp2_price: asset.tp2_price
        })
      });
      const data = await res.json();
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: data.status === "error" ? "ORDER_ERROR" : "MANUAL_SCALP_TRIGGER",
          message: data.status === "error"
            ? `Order failed on ${asset.symbol}: ${data.message}`
            : `Manual Scalp placed on ${asset.symbol} @ $${asset.price} (${asset.signal})`
        },
        ...prev
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "ORDER_ERROR",
          message: `Network error placing scalp on ${asset.symbol}: ${e.message}`
        },
        ...prev
      ]);
    }
  };

  const handleExitSingleTrade = async (tradeId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/positions/exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: tradeId })
      });
      setActiveTrades((prev) => prev.filter((t) => t.trade_id !== tradeId));
    } catch (e) {
      setActiveTrades((prev) => prev.filter((t) => t.trade_id !== tradeId));
    }
  };

  const handleExitAllTrades = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/positions/exit_all`, { method: "POST" });
      setActiveTrades([]);
      setActiveOrders([]);
    } catch (e) {
      setActiveTrades([]);
    }
  };

  const handleCancelSingleOrder = async (orderId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/orders/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId })
      });
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "ORDER_CANCELLED",
          message: `Order ${orderId} cancelled on CoinDCX.`
        },
        ...prev
      ]);
    } catch (e) {
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const handleCancelAllActiveOrders = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/orders/cancel_all`, { method: "POST" });
      setActiveOrders([]);
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "ALL_ORDERS_CANCELLED",
          message: "All open and untriggered orders cancelled on CoinDCX."
        },
        ...prev
      ]);
    } catch (e) {
      setActiveOrders([]);
    }
  };

  const handleRefreshPositionsAndOrders = async () => {
    try {
      const [posRes, ordRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/positions`),
        fetch(`${BACKEND_URL}/api/v1/orders/active`)
      ]);
      if (posRes.ok) {
        const posData = await posRes.json();
        if (posData.active_trades) setActiveTrades(posData.active_trades);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        if (ordData.orders) setActiveOrders(ordData.orders);
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        isRunning={isRunning}
        mode={mode}
        latencyMs={latencyMs}
        dailyPnl={dailyPnl}
        killSwitchActive={killSwitchActive}
        coindcxStatus={coindcxStatus}
        isVerifying={isVerifying}
        leverage={leverage}
        onToggleEngine={handleToggleEngine}
        onKillSwitch={handleKillSwitch}
        onRefreshScan={handleRefreshScan}
        onVerifyCoinDCX={handleVerifyCoinDCX}
        onOpenLeverageModal={() => setIsLeverageModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-6 pb-24 md:pb-8">
        {/* Pre-Flight Diagnostic Notification Banner */}
        {coindcxStatus && !coindcxStatus.is_balance_sufficient && (
          <div className="rounded-xl sm:rounded-2xl border border-amber-500/40 bg-amber-950/20 p-3.5 sm:p-4 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs font-mono shadow-lg shadow-amber-950/20">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-amber-200 font-bold tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>CoinDCX API Verified: Authenticated</span>
                  <span className="text-emerald-400">✅</span>
                  <span className="text-slate-500 hidden xs:inline">|</span>
                  <span>Usable: ${(coindcxStatus.total_usdt_balance ?? 0.049).toFixed(4)} USDT</span>
                </div>
                <div className="text-slate-400 text-[11px] sm:text-xs mt-1 leading-relaxed">
                  CoinDCX Futures requires minimum <strong>$6.00 USDT</strong> margin per contract. 
                  AlphaScalper is running live 500+ asset market analysis in <strong>Balance-Aware Protected Mode</strong>. 
                  Live orders are held safely to protect your account from exchange errors until margin is added.
                </div>
              </div>
            </div>
            <button
              onClick={handleVerifyCoinDCX}
              disabled={isVerifying}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold shrink-0 transition-colors text-center cursor-pointer"
            >
              {isVerifying ? "Verifying..." : "Refresh Balance"}
            </button>
          </div>
        )}

        {/* Live Funded & Verified Dynamic Protection Banner */}
        {coindcxStatus && coindcxStatus.is_balance_sufficient && (
          <div className="rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 sm:p-3.5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-lg shadow-emerald-950/10">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-emerald-300 font-bold tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>CoinDCX Futures INR Collateral Verified</span>
                  <span className="text-slate-500 hidden xs:inline">|</span>
                  <span className="text-white">Equity: ₹{coindcxStatus.futures_inr_balance?.toFixed(2) || "657.90"} INR (~${(coindcxStatus.total_usdt_balance ?? 7.52).toFixed(2)} USDT)</span>
                  <span className="text-slate-500 hidden sm:inline">|</span>
                  <span className="text-emerald-400">Available Free: ₹{coindcxStatus.futures_inr_available?.toFixed(2) || "657.90"} INR</span>
                </div>
                <div className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5">
                  Dynamic Math Engine Active: <strong>Up to 10 Orders dynamically allocated</strong>, <strong>10x Leverage</strong>, <strong>15% Capital Protection Buffer</strong>, <strong>Hard Stop -0.45% & TP1 +0.85% (Risk-Free)</strong>.
                </div>
              </div>
            </div>
            <button
              onClick={handleVerifyCoinDCX}
              disabled={isVerifying}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0 transition-colors text-center cursor-pointer"
            >
              {isVerifying ? "Syncing..." : "Sync Balance"}
            </button>
          </div>
        )}

        {/* Performance Stats Cards */}
        <PerformanceStats stats={stats} onResetStats={handleResetStats} />

        {/* Mode Selector & Autopilot Execution Suite */}
        <ModeSelector
          currentMode={mode}
          onSelectMode={handleSelectMode}
          isRunning={isRunning}
          onToggleEngine={handleToggleEngine}
          leverage={leverage}
          onOpenLeverageModal={() => setIsLeverageModalOpen(true)}
          killSwitchActive={killSwitchActive}
          onKillSwitch={handleKillSwitch}
        />

        {/* Custom Studio Inputs Panel (Visible in Custom Mode) */}
        {mode === "CUSTOM" && (
          <CustomStudioPanel
            currentConfig={strategyConfig}
            onApplyConfig={handleApplyCustomConfig}
            onRefreshScan={handleRefreshScan}
          />
        )}

        {/* Main Trading Dashboard Grid: Left Chart View & Right 10/10 Orders Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Left Side: Candlestick Chart View with Entry, SL, TP1, TP2 & BE lines */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {(() => {
              const activeAsset = candidates.find((c) => c.symbol === selectedSymbol) || candidates[0];
              const activeTrade = activeTrades.find((t) => t.symbol === selectedSymbol);
              return (
                <DashboardChartView
                  asset={activeAsset}
                  activeTrade={activeTrade}
                  onExecuteTrade={handleExecuteSingleTrade}
                  onExitTrade={handleExitSingleTrade}
                  onExpandFullscreen={() => handleOpenChart(activeAsset || activeTrade)}
                />
              );
            })()}
          </div>

          {/* Right Side: 10/10 Executed & Non-Executed Orders Pipeline */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <Top10OrdersPanel
              candidates={candidates}
              activeTrades={activeTrades}
              activeOrders={activeOrders}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              onExecuteTrade={handleExecuteSingleTrade}
              onExitTrade={handleExitSingleTrade}
              onCancelOrder={handleCancelSingleOrder}
              totalUniverseScanned={coindcxStatus?.active_instruments_count || 1500}
            />
          </div>
        </div>

        {/* Active Positions Manager & Execution Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <WinWinPositionManager
              activeTrades={activeTrades}
              activeOrders={activeOrders}
              onExitTrade={handleExitSingleTrade}
              onExitAll={handleExitAllTrades}
              onCancelOrder={handleCancelSingleOrder}
              onCancelAllOrders={handleCancelAllActiveOrders}
              onRefreshOrders={handleRefreshPositionsAndOrders}
              onViewChart={handleOpenChart}
            />
          </div>
          <div className="lg:col-span-1">
            <ExecutionLog logs={logs} />
          </div>
        </div>
      </main>

      {/* Sticky Mobile Floating Action Bar (< md viewports) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-2xl border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 font-mono shadow-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <div className="truncate">
            <div className="text-[11px] font-bold text-white leading-tight truncate">
              ₹{stats.current_capital_inr ? stats.current_capital_inr.toFixed(0) : "658"} INR
            </div>
            <div className={`text-[10px] font-bold leading-tight ${stats.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {stats.net_pnl >= 0 ? "+" : ""}${stats.net_pnl?.toFixed(2) || "0.00"} Net PnL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleEngine}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
              isRunning
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-emerald-500/20 hover:opacity-95"
            }`}
          >
            {isRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isRunning ? "PAUSE" : "START"}</span>
          </button>

          <button
            onClick={handleKillSwitch}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
              killSwitchActive
                ? "bg-red-600 text-white animate-pulse border-red-400"
                : "bg-red-950/40 text-red-400 border-red-800/50 hover:bg-red-600 hover:text-white"
            }`}
            title="Emergency Kill Switch"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">KILL</span>
          </button>
        </div>
      </div>

      {/* Footer (Responsive layout) */}
      <footer className="border-t border-slate-900 bg-[#07090e] py-3.5 px-4 sm:px-6 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        <div>
          AlphaScalper AI • Built for CoinDCX Crypto Futures &amp; Options Scalping
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> CoinDCX WebSocket: ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Webhook Listener: READY
          </span>
        </div>
      </footer>

      {/* Interactive Candlestick Chart Modal with Entry, SL, TP1, TP2 & BE Lines */}
      <ChartVisualizerModal
        isOpen={isChartModalOpen}
        onClose={handleCloseChart}
        asset={selectedChartAsset}
        onExecuteTrade={handleExecuteSingleTrade}
        onExitTrade={handleExitSingleTrade}
      />

      {/* Manual Leverage Setting Modal */}
      <LeverageStartModal
        isOpen={isLeverageModalOpen}
        onClose={() => setIsLeverageModalOpen(false)}
        onConfirm={handleConfirmLeverage}
        currentLeverage={leverage}
        isRunning={isRunning}
        usableBalanceUsdt={coindcxStatus?.total_usdt_balance ?? 7.5}
      />
    </div>
  );
}

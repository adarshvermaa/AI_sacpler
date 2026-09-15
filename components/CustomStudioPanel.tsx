"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Filter,
  BarChart2,
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  Activity
} from "lucide-react";

interface CustomStudioPanelProps {
  currentConfig?: any;
  onApplyConfig: (config: any, executeNow?: boolean) => void;
  onRefreshScan?: () => void;
}

export const CustomStudioPanel: React.FC<CustomStudioPanelProps> = ({
  currentConfig,
  onApplyConfig,
  onRefreshScan
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"PRESETS" | "RISK" | "INDICATORS" | "TARGETS">("PRESETS");

  // Core Risk & Execution
  const [universeSize, setUniverseSize] = useState<number>(500);
  const [filterCount, setFilterCount] = useState<number>(100);
  const [executionCount, setExecutionCount] = useState<number>(1);
  const [leverage, setLeverage] = useState<number>(10);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1.0);
  const [directionBias, setDirectionBias] = useState<string>("AUTO");

  // Brackets & Targets
  const [stopLossPct, setStopLossPct] = useState<number>(0.50);
  const [takeProfit1Pct, setTakeProfit1Pct] = useState<number>(1.00);
  const [takeProfit2Pct, setTakeProfit2Pct] = useState<number>(2.00);
  const [enableBreakeven, setEnableBreakeven] = useState<boolean>(true);
  const [minConfidence, setMinConfidence] = useState<number>(75.0);

  // Filters & Timeframes
  const [minVolume24h, setMinVolume24h] = useState<number>(10000.0);
  const [maxSpreadPct, setMaxSpreadPct] = useState<number>(0.20);
  const [strictVeto, setStrictVeto] = useState<boolean>(true);
  const [timeframes, setTimeframes] = useState<{ [key: string]: boolean }>({
    "1m": true,
    "5m": true,
    "15m": true
  });

  // Indicators selection
  const [indicators, setIndicators] = useState<{ [key: string]: boolean }>({
    "RSI": true,
    "VWAP": true,
    "Bollinger": true,
    "SuperTrend": true,
    "OBI": true,
    "MACD": true,
    "Ichimoku": false,
    "ATR": true,
    "Keltner": false,
    "StochRSI": true,
    "Chaikin": false
  });

  // Price action rules
  const [priceAction, setPriceAction] = useState<{ [key: string]: boolean }>({
    "OrderBlocks": true,
    "FVG": true,
    "LiquiditySweeps": true,
    "BOS": true,
    "PinBars": false
  });

  // Active preset tracking
  const [activePreset, setActivePreset] = useState<string | null>("CONFLUENCE_SURFER");

  // Dry-run testing state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Sync initial config from backend props if available
  useEffect(() => {
    if (currentConfig) {
      if (currentConfig.universe_size) setUniverseSize(currentConfig.universe_size);
      if (currentConfig.filter_count) setFilterCount(currentConfig.filter_count);
      if (currentConfig.execution_count) setExecutionCount(currentConfig.execution_count);
      if (currentConfig.leverage) setLeverage(currentConfig.leverage);
      if (currentConfig.risk_per_trade_pct) setRiskPerTrade(currentConfig.risk_per_trade_pct);
      if (currentConfig.direction_bias) setDirectionBias(currentConfig.direction_bias);
      if (currentConfig.stop_loss_pct) setStopLossPct(currentConfig.stop_loss_pct);
      if (currentConfig.take_profit_1_pct) setTakeProfit1Pct(currentConfig.take_profit_1_pct);
      if (currentConfig.take_profit_2_pct) setTakeProfit2Pct(currentConfig.take_profit_2_pct);
      if (currentConfig.min_confidence) setMinConfidence(currentConfig.min_confidence);
      if (currentConfig.min_volume_24h) setMinVolume24h(currentConfig.min_volume_24h);
      if (currentConfig.max_spread_pct) setMaxSpreadPct(currentConfig.max_spread_pct);
      if (currentConfig.enable_breakeven !== undefined) setEnableBreakeven(currentConfig.enable_breakeven);
      if (currentConfig.strict_counter_trend_veto !== undefined) setStrictVeto(currentConfig.strict_counter_trend_veto);
    }
  }, [currentConfig]);

  // Indicator & SMC helpers
  const toggleIndicator = (ind: string) => {
    setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
    setActivePreset(null);
  };

  const togglePriceAction = (pa: string) => {
    setPriceAction(prev => ({ ...prev, [pa]: !prev[pa] }));
    setActivePreset(null);
  };

  const toggleTimeframe = (tf: string) => {
    setTimeframes(prev => ({ ...prev, [tf]: !prev[tf] }));
    setActivePreset(null);
  };

  // 1-Click Institutional Presets
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === "MICRO_SCALPER") {
      setLeverage(15);
      setExecutionCount(2);
      setRiskPerTrade(0.5);
      setDirectionBias("AUTO");
      setStopLossPct(0.35);
      setTakeProfit1Pct(0.70);
      setTakeProfit2Pct(1.40);
      setMinConfidence(70.0);
      setStrictVeto(false);
      setTimeframes({ "1m": true, "5m": true, "15m": false });
      setIndicators({
        "RSI": true, "VWAP": true, "Bollinger": true, "SuperTrend": false,
        "OBI": true, "MACD": false, "Ichimoku": false, "ATR": true,
        "Keltner": false, "StochRSI": true, "Chaikin": false
      });
      setPriceAction({
        "OrderBlocks": false, "FVG": false, "LiquiditySweeps": true,
        "BOS": true, "PinBars": true
      });
    } else if (presetKey === "CONFLUENCE_SURFER") {
      setLeverage(10);
      setExecutionCount(1);
      setRiskPerTrade(1.0);
      setDirectionBias("AUTO");
      setStopLossPct(0.60);
      setTakeProfit1Pct(1.20);
      setTakeProfit2Pct(2.40);
      setMinConfidence(78.0);
      setStrictVeto(true);
      setTimeframes({ "1m": true, "5m": true, "15m": true });
      setIndicators({
        "RSI": true, "VWAP": true, "Bollinger": false, "SuperTrend": true,
        "OBI": true, "MACD": true, "Ichimoku": false, "ATR": true,
        "Keltner": false, "StochRSI": true, "Chaikin": false
      });
      setPriceAction({
        "OrderBlocks": true, "FVG": true, "LiquiditySweeps": false,
        "BOS": true, "PinBars": false
      });
    } else if (presetKey === "SMC_REVERSAL") {
      setLeverage(7);
      setExecutionCount(1);
      setRiskPerTrade(1.5);
      setDirectionBias("AUTO");
      setStopLossPct(0.80);
      setTakeProfit1Pct(1.60);
      setTakeProfit2Pct(3.20);
      setMinConfidence(80.0);
      setStrictVeto(true);
      setTimeframes({ "1m": true, "5m": true, "15m": true });
      setIndicators({
        "RSI": true, "VWAP": true, "Bollinger": false, "SuperTrend": false,
        "OBI": true, "MACD": false, "Ichimoku": false, "ATR": true,
        "Keltner": false, "StochRSI": true, "Chaikin": false
      });
      setPriceAction({
        "OrderBlocks": true, "FVG": true, "LiquiditySweeps": true,
        "BOS": true, "PinBars": true
      });
    } else if (presetKey === "CAPITAL_SHIELD") {
      setLeverage(3);
      setExecutionCount(1);
      setRiskPerTrade(0.5);
      setDirectionBias("AUTO");
      setStopLossPct(0.35);
      setTakeProfit1Pct(1.00);
      setTakeProfit2Pct(2.00);
      setMinConfidence(85.0);
      setStrictVeto(true);
      setTimeframes({ "1m": true, "5m": true, "15m": true });
      setIndicators({
        "RSI": true, "VWAP": true, "Bollinger": true, "SuperTrend": true,
        "OBI": true, "MACD": true, "Ichimoku": false, "ATR": true,
        "Keltner": false, "StochRSI": false, "Chaikin": false
      });
      setPriceAction({
        "OrderBlocks": true, "FVG": true, "LiquiditySweeps": false,
        "BOS": false, "PinBars": false
      });
    }
  };

  const buildPayload = () => {
    const selectedInds = Object.keys(indicators).filter(k => indicators[k]);
    const selectedPA = Object.keys(priceAction).filter(k => priceAction[k]);
    const selectedTFs = Object.keys(timeframes).filter(k => timeframes[k]);

    return {
      mode: "CUSTOM",
      universe_size: universeSize,
      filter_count: filterCount,
      execution_count: executionCount,
      leverage: leverage,
      risk_per_trade_pct: riskPerTrade,
      direction_bias: directionBias,
      stop_loss_pct: stopLossPct,
      take_profit_1_pct: takeProfit1Pct,
      take_profit_2_pct: takeProfit2Pct,
      enable_breakeven: enableBreakeven,
      min_confidence: minConfidence,
      min_volume_24h: minVolume24h,
      max_spread_pct: maxSpreadPct,
      strict_counter_trend_veto: strictVeto,
      timeframes: selectedTFs,
      selected_indicators: selectedInds,
      price_action_rules: selectedPA
    };
  };

  const handleApply = (executeNow: boolean = false) => {
    const payload = buildPayload();
    onApplyConfig(payload, executeNow);
    setAppliedFeedback(executeNow ? "EXECUTING CUSTOM ORDERS..." : "CONFIG SAVED & APPLIED!");
    setTimeout(() => setAppliedFeedback(null), 4000);
  };

  const handleTestStrategy = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const payload = buildPayload();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/strategy/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
      }
    } catch (e) {
      console.error("Failed to test strategy:", e);
    } finally {
      setIsTesting(false);
    }
  };

  // Derived calculation metrics
  const activeIndCount = Object.values(indicators).filter(Boolean).length;
  const activePACount = Object.values(priceAction).filter(Boolean).length;
  const rrRatio = (takeProfit1Pct / Math.max(0.01, stopLossPct)).toFixed(2);
  const breakevenWinRate = ((stopLossPct / (stopLossPct + takeProfit1Pct)) * 100).toFixed(1);

  return (
    <div className="bg-[#0b101d] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-slate-200">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                CUSTOM QUANT STUDIO &amp; STRATEGY BUILDER
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full programmatic control over indicators, smart money rules, exit brackets &amp; execution filters
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {appliedFeedback && (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              {appliedFeedback}
            </span>
          )}
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            STUDIO MODE ACTIVE
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-6 overflow-x-auto">
        {[
          { id: "PRESETS", label: "1-Click Presets", icon: Sparkles },
          { id: "RISK", label: "Risk & Leverage", icon: Shield },
          { id: "INDICATORS", label: `Indicators (${activeIndCount + activePACount})`, icon: BarChart2 },
          { id: "TARGETS", label: "Brackets & Filters", icon: Target }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRESETS */}
      {activeTab === "PRESETS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              id: "MICRO_SCALPER",
              title: "HFT Micro-Scalper",
              icon: Zap,
              color: "cyan",
              desc: "1m fast tick-scalp, 15x leverage, tight 0.35% SL, OBI + VWAP triggers",
              badge: "High Frequency"
            },
            {
              id: "CONFLUENCE_SURFER",
              title: "Trend Confluence Surfer",
              icon: TrendingUp,
              color: "emerald",
              desc: "5m/15m alignment, 10x leverage, 1.2% TP1, Supertrend + MACD momentum",
              badge: "Institutional Balanced"
            },
            {
              id: "SMC_REVERSAL",
              title: "Smart Money (SMC)",
              icon: Target,
              color: "purple",
              desc: "Liquidity Sweeps, Order Blocks & FVG rejections with asymmetric 1:2 R:R",
              badge: "High Payoff"
            },
            {
              id: "CAPITAL_SHIELD",
              title: "Capital Shield",
              icon: Shield,
              color: "blue",
              desc: "Conservative 3x leverage, 85%+ AI confidence, strict 15m trend veto",
              badge: "Maximum Safety"
            }
          ].map((p) => {
            const Icon = p.icon;
            const isSelected = activePreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-purple-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-purple-300">Click to Load</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RISK & LEVERAGE */}
      {activeTab === "RISK" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Leverage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="mb-3">
              <label className="text-xs font-bold text-slate-200 block">LEVERAGE (ISOLATED FUTURES)</label>
              <p className="text-[11px] text-slate-400">CoinDCX isolated position margin multiplier</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[3, 5, 7, 10, 15, 20].map((lev) => (
                <button
                  key={lev}
                  onClick={() => { setLeverage(lev); setActivePreset(null); }}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    leverage === lev
                      ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Concurrent Orders */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="mb-3">
              <label className="text-xs font-bold text-slate-200 block">MAX CONCURRENT ORDERS</label>
              <p className="text-[11px] text-slate-400">Parallel scalps allowed (1 is recommended for ₹650 INR)</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => { setExecutionCount(count); setActivePreset(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    executionCount === count
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {count} {count === 1 ? "Order" : "Orders"}
                </button>
              ))}
            </div>
          </div>

          {/* Direction Bias */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="mb-3">
              <label className="text-xs font-bold text-slate-200 block">DIRECTION BIAS</label>
              <p className="text-[11px] text-slate-400">Trade direction permission</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { id: "AUTO", label: "AUTO (BOTH)", color: "bg-cyan-500 text-black" },
                { id: "LONG", label: "LONG ONLY", color: "bg-emerald-500 text-black" },
                { id: "SHORT", label: "SHORT ONLY", color: "bg-rose-500 text-white" }
              ].map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => { setDirectionBias(dir.id); setActivePreset(null); }}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    directionBias === dir.id
                      ? `${dir.color} shadow-md`
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing & Capital Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300">TOTAL UNIVERSE SCAN SIZE</label>
                <span className="text-xs font-mono font-bold text-cyan-400">{universeSize} Instruments</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={universeSize}
                onChange={(e) => { setUniverseSize(Number(e.target.value)); setActivePreset(null); }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>50 minimum</span>
                <span>500 maximum universe</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300">TOP LIQUID CANDIDATES FILTER</label>
                <span className="text-xs font-mono font-bold text-purple-400">{filterCount} Assets</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="10"
                value={filterCount}
                onChange={(e) => { setFilterCount(Number(e.target.value)); setActivePreset(null); }}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>20 liquid</span>
                <span>150 max pool</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INDICATORS & SMC MATRIX */}
      {activeTab === "INDICATORS" && (
        <div className="space-y-6 mb-6">
          {/* Technical Indicators */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                TECHNICAL INDICATORS CONFLUENCE ({activeIndCount}/11 ACTIVE)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allTrue = Object.keys(indicators).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                    setIndicators(allTrue);
                    setActivePreset(null);
                  }}
                  className="text-[11px] font-mono text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => {
                    const balanced = {
                      "RSI": true, "VWAP": true, "Bollinger": true, "SuperTrend": true,
                      "OBI": true, "MACD": true, "Ichimoku": false, "ATR": true,
                      "Keltner": false, "StochRSI": true, "Chaikin": false
                    };
                    setIndicators(balanced);
                    setActivePreset(null);
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Reset Balanced
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(indicators).map(([name, enabled]) => (
                <button
                  key={name}
                  onClick={() => toggleIndicator(name)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all border cursor-pointer ${
                    enabled
                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                      : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                  }`}
                >
                  <span className="font-semibold">{name}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${enabled ? "text-cyan-400" : "text-slate-700"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Price Action & Smart Money */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                PRICE ACTION &amp; SMART MONEY (SMC) TRIGGERS ({activePACount}/5 ACTIVE)
              </label>
              <button
                onClick={() => {
                  const allPA = Object.keys(priceAction).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                  setPriceAction(allPA);
                  setActivePreset(null);
                }}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                Enable All SMC
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(priceAction).map(([name, enabled]) => (
                <button
                  key={name}
                  onClick={() => togglePriceAction(name)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all border cursor-pointer ${
                    enabled
                      ? "bg-purple-950/40 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20"
                      : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
                  }`}
                >
                  <span className="font-semibold">{name}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${enabled ? "text-purple-400" : "text-slate-700"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TARGETS & FILTERS */}
      {activeTab === "TARGETS" && (
        <div className="space-y-6 mb-6">
          {/* SL / TP Exit Brackets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stop Loss % */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-rose-400">STOP LOSS (SL %)</label>
                <span className="text-xs font-mono font-bold text-rose-300">{stopLossPct}%</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {[0.25, 0.35, 0.50, 0.80, 1.20].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setStopLossPct(val); setActivePreset(null); }}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      stopLossPct === val
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">0.35% covers CoinDCX taker fee (~0.12%)</p>
            </div>

            {/* Take Profit 1 % */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-emerald-400">TAKE PROFIT 1 (TP1 %)</label>
                <span className="text-xs font-mono font-bold text-emerald-300">{takeProfit1Pct}%</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {[0.60, 0.80, 1.00, 1.50, 2.00].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setTakeProfit1Pct(val); setActivePreset(null); }}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      takeProfit1Pct === val
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">First scaling target &amp; breakeven trigger</p>
            </div>

            {/* Take Profit 2 % */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-cyan-400">RUNNER PROFIT 2 (TP2 %)</label>
                <span className="text-xs font-mono font-bold text-cyan-300">{takeProfit2Pct}%</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {[1.20, 1.60, 2.00, 3.00, 4.00].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setTakeProfit2Pct(val); setActivePreset(null); }}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      takeProfit2Pct === val
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">Asymmetric runner profit expansion</p>
            </div>
          </div>

          {/* AI Confidence & Market Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Min AI Confidence Slider */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300">MIN AI CONVICTION</label>
                <span className="text-xs font-mono font-bold text-purple-400">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="1"
                value={minConfidence}
                onChange={(e) => { setMinConfidence(Number(e.target.value)); setActivePreset(null); }}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>60% (Aggressive)</span>
                <span>78% (Balanced)</span>
                <span>90% (Strict)</span>
              </div>
            </div>

            {/* Timeframe Confluence */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <label className="text-xs font-bold text-slate-300 mb-1">TIMEFRAME CONFLUENCE</label>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "1m", label: "1m Micro" },
                  { id: "5m", label: "5m Swing" },
                  { id: "15m", label: "15m Trend" }
                ].map((tf) => {
                  const enabled = timeframes[tf.id];
                  return (
                    <button
                      key={tf.id}
                      onClick={() => toggleTimeframe(tf.id)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer border ${
                        enabled
                          ? "bg-purple-900/60 border-purple-500 text-purple-300"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Tri-timeframe alignment prevents noise</p>
            </div>

            {/* Breakeven & Veto Toggles */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <label className="text-xs font-bold text-slate-300 mb-1">SAFETY TOGGLES</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBreakeven}
                    onChange={(e) => { setEnableBreakeven(e.target.checked); setActivePreset(null); }}
                    className="accent-purple-500 rounded"
                  />
                  <span className="text-slate-300">Move SL to Breakeven at TP1</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={strictVeto}
                    onChange={(e) => { setStrictVeto(e.target.checked); setActivePreset(null); }}
                    className="accent-purple-500 rounded"
                  />
                  <span className="text-slate-300">Strict 15m Trend Veto</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY METRICS & LIVE DRY-RUN TEST RESULTS */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Risk:Reward (R:R)</span>
              <span className="text-sm font-mono font-bold text-emerald-400">1 : {rrRatio}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Breakeven Win Rate</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{breakevenWinRate}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Fee Coverage Buffer</span>
              <span className="text-sm font-mono font-bold text-purple-400">+0.12% Taker Net</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Active Triggers</span>
              <span className="text-sm font-mono font-bold text-white">{activeIndCount + activePACount} Modules</span>
            </div>
          </div>

          <button
            onClick={handleTestStrategy}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-md shadow-purple-500/10 active:scale-95"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-purple-400" : ""}`} />
            <span>{isTesting ? "Testing Market..." : "Test Strategy on Market"}</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResults && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-bold ${testResults.matching_count > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                {testResults.matching_count} Matching Coins Found
              </span>
              <span className="text-slate-400">
                ({testResults.matching_count}/{testResults.total_ranked} screened in {testResults.scan_latency_ms}ms)
              </span>
            </div>
            {testResults.matching_targets && testResults.matching_targets.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {testResults.matching_targets.slice(0, 4).map((t: any) => (
                  <span key={t.symbol} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] border border-slate-700">
                    {t.symbol.replace("B-", "").replace("_USDT", "")} ({t.signal} {t.confidence}%)
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DUAL ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleApply(false)}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-purple-500/30 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Save &amp; Apply Custom Strategy</span>
        </button>

        <button
          onClick={() => handleApply(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 shadow-xl shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Apply &amp; Auto-Execute {executionCount} Scalps Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomStudioPanel;

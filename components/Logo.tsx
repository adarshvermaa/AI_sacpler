"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "full" | "icon" | "badge";
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showText = true,
  variant = "full",
  className = "",
  onClick
}) => {
  // Dimensions map
  const iconSizeMap = {
    sm: "w-7 h-7",
    md: "w-9 h-9 sm:w-10 sm:h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textHeadingMap = {
    sm: "text-base tracking-wider",
    md: "text-lg sm:text-xl tracking-wider",
    lg: "text-2xl tracking-widest",
    xl: "text-3xl tracking-widest"
  };

  const badgeTextMap = {
    sm: "text-[8px]",
    md: "text-[9px] sm:text-[10px]",
    lg: "text-[11px]",
    xl: "text-xs"
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
      aria-label="AlphaScalper Logo"
    >
      {/* High-End Vector Icon Emblem */}
      <div
        className={`relative ${iconSizeMap[size]} shrink-0 rounded-xl p-[1.5px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 group`}
      >
        <div className="w-full h-full rounded-[10px] bg-[#07090e] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-transparent to-blue-500/20 pointer-events-none" />

          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[82%] h-[82%] drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]"
          >
            <defs>
              {/* Main Alpha Loop Gradient */}
              <linearGradient id="alphaLoopGrad" x1="15%" y1="85%" x2="85%" y2="15%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>

              {/* Scalp Breakout Arrow Gradient */}
              <linearGradient id="breakoutArrowGrad" x1="30%" y1="100%" x2="90%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Geometric Grid / Circuit Lines (Quant Touch) */}
            <line x1="22" y1="50" x2="78" y2="50" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="50" y1="22" x2="50" y2="78" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />

            {/* Stylized Greek Alpha (α) Body Loop */}
            <path
              d="M 68 76 C 58 76 46 64 36 50 C 26 36 22 28 32 24 C 42 20 48 32 58 50 C 66 64 74 76 84 76"
              stroke="url(#alphaLoopGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 group-hover:stroke-[8]"
            />

            {/* High-Velocity Upward Scalp Breakthrough Arrow */}
            <path
              d="M 28 76 L 56 36 L 78 22"
              stroke="url(#breakoutArrowGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dynamic Arrowhead */}
            <path
              d="M 64 20 L 80 20 L 80 36"
              stroke="url(#breakoutArrowGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Quant Center Node (Sub-millisecond trigger point) */}
            <circle cx="50" cy="50" r="4.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="50" cy="50" r="7.5" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Brand Typography (Hidden if variant is 'icon' or showText is false) */}
      {showText && variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`font-black ${textHeadingMap[size]} leading-none`}>
              <span className="text-white">ALPHA</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent ml-1">
                SCALPER
              </span>
            </span>

            {/* Institutional Version / Status Badge */}
            <span
              className={`font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ${badgeTextMap[size]} tracking-wider shrink-0 hidden xs:inline-flex`}
            >
              AI HFT
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:block">
            Sub-Millisecond Autonomous Crypto Scalping • CoinDCX
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;

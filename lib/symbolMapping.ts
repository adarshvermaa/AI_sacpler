/**
 * Comprehensive Symbol Mapping Utility for AlphaScalper
 * 
 * Accurately maps CoinDCX perpetual contracts (e.g. B-BZ_USDT, B-CL_USDT, B-HYPE_USDT, B-UNI_USDT)
 * to their verified TradingView charting tickers across TVC, Binance, Bybit, and MEXC.
 */

export interface SymbolMetadata {
  tvSymbol: string;
  displayName: string;
  exchange: string;
  isCommodity: boolean;
  category: "CRYPTO" | "COMMODITY" | "INDEX";
}

// Special dictionary for commodities, synthetics, and multi-exchange tokens
const SPECIAL_SYMBOL_MAP: Record<string, SymbolMetadata> = {
  // --- Commodities & Energy Futures ---
  BZ: {
    tvSymbol: "TVC:UKOIL",
    displayName: "Brent Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  BRENT: {
    tvSymbol: "TVC:UKOIL",
    displayName: "Brent Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  UKOIL: {
    tvSymbol: "TVC:UKOIL",
    displayName: "Brent Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  CL: {
    tvSymbol: "TVC:USOIL",
    displayName: "WTI Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  CRUDE: {
    tvSymbol: "TVC:USOIL",
    displayName: "WTI Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  OIL: {
    tvSymbol: "TVC:USOIL",
    displayName: "Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  USOIL: {
    tvSymbol: "TVC:USOIL",
    displayName: "WTI Crude Oil",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  NG: {
    tvSymbol: "TVC:NATGAS",
    displayName: "Natural Gas",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  NATGAS: {
    tvSymbol: "TVC:NATGAS",
    displayName: "Natural Gas",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  HG: {
    tvSymbol: "TVC:COPPER",
    displayName: "Copper Futures",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  COPPER: {
    tvSymbol: "TVC:COPPER",
    displayName: "Copper Futures",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },

  // --- Precious Metals ---
  XAU: {
    tvSymbol: "TVC:GOLD",
    displayName: "Spot Gold",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  GOLD: {
    tvSymbol: "TVC:GOLD",
    displayName: "Spot Gold",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  XAG: {
    tvSymbol: "TVC:SILVER",
    displayName: "Spot Silver",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },
  SILVER: {
    tvSymbol: "TVC:SILVER",
    displayName: "Spot Silver",
    exchange: "TVC",
    isCommodity: true,
    category: "COMMODITY"
  },

  // --- Macro Indices ---
  DXY: {
    tvSymbol: "TVC:DXY",
    displayName: "US Dollar Index",
    exchange: "TVC",
    isCommodity: true,
    category: "INDEX"
  },
  SPX: {
    tvSymbol: "SP:SPX",
    displayName: "S&P 500 Index",
    exchange: "SP",
    isCommodity: true,
    category: "INDEX"
  },
  NDX: {
    tvSymbol: "NASDAQ:NDX",
    displayName: "Nasdaq 100",
    exchange: "NASDAQ",
    isCommodity: true,
    category: "INDEX"
  },

  // --- Multi-Exchange / Ecosystem Tokens ---
  HYPE: {
    tvSymbol: "BYBIT:HYPEUSDT",
    displayName: "Hyperliquid",
    exchange: "BYBIT",
    isCommodity: false,
    category: "CRYPTO"
  },
  PONS: {
    tvSymbol: "MEXC:PONSUSDT",
    displayName: "Pons",
    exchange: "MEXC",
    isCommodity: false,
    category: "CRYPTO"
  },
  POWS: {
    tvSymbol: "MEXC:POWSUSDT",
    displayName: "Pows",
    exchange: "MEXC",
    isCommodity: false,
    category: "CRYPTO"
  },
  PUMP: {
    tvSymbol: "MEXC:PUMPUSDT",
    displayName: "Pump.fun",
    exchange: "MEXC",
    isCommodity: false,
    category: "CRYPTO"
  },
  UAI: {
    tvSymbol: "MEXC:UAIUSDT",
    displayName: "Universal AI",
    exchange: "MEXC",
    isCommodity: false,
    category: "CRYPTO"
  },
  KAS: {
    tvSymbol: "BYBIT:KASUSDT",
    displayName: "Kaspa",
    exchange: "BYBIT",
    isCommodity: false,
    category: "CRYPTO"
  },
  DEGEN: {
    tvSymbol: "BYBIT:DEGENUSDT",
    displayName: "Degen",
    exchange: "BYBIT",
    isCommodity: false,
    category: "CRYPTO"
  },
  RAYSOL: {
    tvSymbol: "BINANCE:RAYUSDT",
    displayName: "Raydium",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  LAB: {
    tvSymbol: "MEXC:LABUSDT",
    displayName: "Lab",
    exchange: "MEXC",
    isCommodity: false,
    category: "CRYPTO"
  },
  VTHO: {
    tvSymbol: "BINANCE:VTHOUSDT",
    displayName: "VeThor",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  POND: {
    tvSymbol: "BINANCE:PONDUSDT",
    displayName: "Marlin",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },

  // --- Memecoins using 1000x multiplier contracts on Binance Futures ---
  PEPE: {
    tvSymbol: "BINANCE:1000PEPEUSDT",
    displayName: "Pepe (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000PEPE": {
    tvSymbol: "BINANCE:1000PEPEUSDT",
    displayName: "Pepe (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  SHIB: {
    tvSymbol: "BINANCE:1000SHIBUSDT",
    displayName: "Shiba Inu (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000SHIB": {
    tvSymbol: "BINANCE:1000SHIBUSDT",
    displayName: "Shiba Inu (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  BONK: {
    tvSymbol: "BINANCE:1000BONKUSDT",
    displayName: "Bonk (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000BONK": {
    tvSymbol: "BINANCE:1000BONKUSDT",
    displayName: "Bonk (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  FLOKI: {
    tvSymbol: "BINANCE:1000FLOKIUSDT",
    displayName: "Floki (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000FLOKI": {
    tvSymbol: "BINANCE:1000FLOKIUSDT",
    displayName: "Floki (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  LUNC: {
    tvSymbol: "BINANCE:1000LUNCUSDT",
    displayName: "Terra Classic (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000LUNC": {
    tvSymbol: "BINANCE:1000LUNCUSDT",
    displayName: "Terra Classic (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  SATS: {
    tvSymbol: "BINANCE:1000SATSUSDT",
    displayName: "Sats (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000SATS": {
    tvSymbol: "BINANCE:1000SATSUSDT",
    displayName: "Sats (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  RATS: {
    tvSymbol: "BINANCE:1000RATSUSDT",
    displayName: "Rats (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000RATS": {
    tvSymbol: "BINANCE:1000RATSUSDT",
    displayName: "Rats (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  CAT: {
    tvSymbol: "BINANCE:1000CATUSDT",
    displayName: "Simon's Cat (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000CAT": {
    tvSymbol: "BINANCE:1000CATUSDT",
    displayName: "Simon's Cat (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  CHEEMS: {
    tvSymbol: "BINANCE:1000CHEEMSUSDT",
    displayName: "Cheems (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000CHEEMS": {
    tvSymbol: "BINANCE:1000CHEEMSUSDT",
    displayName: "Cheems (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  WHY: {
    tvSymbol: "BINANCE:1000WHYUSDT",
    displayName: "Why (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  },
  "1000WHY": {
    tvSymbol: "BINANCE:1000WHYUSDT",
    displayName: "Why (1000x)",
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  }
};

/**
 * Extracts base token name from CoinDCX ticker format (e.g. B-BZ_USDT -> BZ, B-BTC_USDT -> BTC)
 */
export function extractBaseSymbol(rawSymbol: string): string {
  if (!rawSymbol) return "BTC";
  let s = rawSymbol.replace(/^B-/, "");
  s = s.replace(/_USDT$/, "").replace(/_INR$/, "").replace(/\/USDT$/, "").replace(/\/INR$/, "");
  s = s.replace(/[_/]/g, "").toUpperCase();
  if (s.endsWith("USDT")) s = s.slice(0, -4);
  if (s.endsWith("USD")) s = s.slice(0, -3);
  return s;
}

/**
 * Returns full metadata for a symbol including category, human readable name, and TradingView ticker
 */
export function getAssetMetadata(rawSymbol: string): SymbolMetadata {
  const base = extractBaseSymbol(rawSymbol);

  // Check explicit mapping table
  if (SPECIAL_SYMBOL_MAP[base]) {
    return SPECIAL_SYMBOL_MAP[base];
  }

  // Standard Crypto on Binance
  let cleanSym = rawSymbol.replace(/^B-/, "").replace(/[_/]/g, "").toUpperCase();
  if (!cleanSym.endsWith("USDT") && !cleanSym.endsWith("USD")) {
    cleanSym += "USDT";
  }

  return {
    tvSymbol: `BINANCE:${cleanSym}`,
    displayName: base,
    exchange: "BINANCE",
    isCommodity: false,
    category: "CRYPTO"
  };
}

/**
 * Returns TradingView widget symbol string (e.g. "TVC:UKOIL" for B-BZ_USDT, "BINANCE:BTCUSDT" for B-BTC_USDT)
 */
export function getTradingViewSymbol(rawSymbol: string): string {
  return getAssetMetadata(rawSymbol).tvSymbol;
}

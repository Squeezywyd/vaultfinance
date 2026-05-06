// Returns historical OHLC data for constructing a portfolio value chart
const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// Map our range keys to Yahoo Finance range params
const RANGE_MAP = {
  '1W': { range: '5d',  interval: '1d' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1wk' },
  '1Y': { range: '1y',  interval: '1wk' },
};

async function fetchSymbolHistory(symbol, range, interval) {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const res  = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json   = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result)  throw new Error('No data');

  const timestamps = result.timestamp ?? [];
  const closes     = result.indicators?.quote?.[0]?.close ?? [];

  // Filter out null closes (market closed / missing data)
  const pairs = timestamps
    .map((ts, i) => ({ ts, close: closes[i] }))
    .filter(p => p.close != null);

  return {
    symbol,
    timestamps: pairs.map(p => p.ts),
    closes:     pairs.map(p => p.close),
    currency:   result.meta?.currency ?? 'USD',
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { symbols, range = '1M' } = req.body ?? {};
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return res.status(400).json({ error: 'symbols array required' });
  }

  const { range: yfRange, interval } = RANGE_MAP[range] ?? RANGE_MAP['1M'];

  const results = await Promise.allSettled(
    symbols.map(s => fetchSymbolHistory(s.trim().toUpperCase(), yfRange, interval))
  );

  const out = {};
  results.forEach((r, i) => {
    const sym = symbols[i].trim().toUpperCase();
    if (r.status === 'fulfilled') {
      out[sym] = r.value;
    } else {
      out[sym] = { symbol: sym, timestamps: [], closes: [], error: r.reason?.message };
    }
  });

  return res.status(200).json(out);
}

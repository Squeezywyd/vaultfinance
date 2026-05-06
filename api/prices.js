// Yahoo Finance proxy — supports stocks, ETFs, crypto (BTC-USD), futures (MNQ=F), indices (^GSPC)
const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchSymbol(symbol) {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=2d&includePrePost=false`;
  const res  = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);

  const json  = await res.json();
  const meta  = json?.chart?.result?.[0]?.meta;
  if (!meta)  throw new Error(`No data for ${symbol}`);

  const price     = meta.regularMarketPrice ?? 0;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change    = price - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  // Derive asset type from Yahoo instrument type
  const yfType = (meta.instrumentType ?? meta.quoteType ?? '').toUpperCase();
  let type = 'stock';
  if (yfType === 'CRYPTOCURRENCY') type = 'crypto';
  else if (yfType === 'ETF' || yfType === 'MUTUALFUND') type = 'etf';
  else if (yfType === 'FUTURE' || symbol.endsWith('=F')) type = 'futures';
  else if (yfType === 'INDEX' || symbol.startsWith('^')) type = 'index';

  return {
    symbol,
    price,
    prevClose,
    change,
    changePct,
    name:     meta.longName || meta.shortName || symbol,
    currency: meta.currency || 'USD',
    exchange: meta.exchangeName || '',
    type,
    valid:    true,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET ?symbol=AAPL  — single symbol lookup (for search)
  if (req.method === 'GET') {
    const symbol = (req.query?.symbol || '').trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    try {
      const data = await fetchSymbol(symbol);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(404).json({ error: err.message, valid: false });
    }
  }

  // POST { symbols: string[] }  — batch fetch for portfolio refresh
  if (req.method === 'POST') {
    const symbols = req.body?.symbols;
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'symbols array required' });
    }

    const results = await Promise.allSettled(
      symbols.map(s => fetchSymbol(s.trim().toUpperCase()))
    );

    const out = {};
    results.forEach((r, i) => {
      const sym = symbols[i].trim().toUpperCase();
      if (r.status === 'fulfilled') {
        out[sym] = r.value;
      } else {
        out[sym] = { symbol: sym, valid: false, error: r.reason?.message };
      }
    });

    return res.status(200).json(out);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' });

  const { transactions, month } = req.body ?? {};
  if (!Array.isArray(transactions)) return res.status(400).json({ error: 'Invalid request body' });

  // Aggregate by category for privacy
  const summary = {};
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      summary[t.category] = (summary[t.category] ?? 0) + t.amount;
      totalExpenses += t.amount;
    } else if (t.type === 'income') {
      totalIncome += t.amount;
    }
  }

  const categoryLines = Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)} (${totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0}% of expenses)`)
    .join('\n');

  const prompt = `You are a friendly personal finance advisor. Analyze this user's spending data for ${month ?? 'this month'} and provide helpful, personalized insights.

Financial Summary:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%
- Number of transactions: ${transactions.length}

Spending by Category:
${categoryLines || '  No expense data available'}

Please provide:
1. A brief spending summary (2-3 sentences)
2. Top 3 observations about their spending patterns
3. 3 actionable tips to improve their financial health

Format your response with clear sections using headers (##). Be encouraging and specific. Use dollar amounts from the data. Keep each section concise — 2-4 bullet points max per section.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errBody);
      return res.status(502).json({ error: `Gemini API error: ${geminiRes.status}` });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

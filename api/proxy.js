// Vercel Serverless Functions - AI API 代理
// 浏览器 -> Vercel 代理 -> AI API（OpenAI/兼容接口）

export default async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { apiKey, endpoint, model, messages, systemPrompt } = req.body;
  if (!apiKey || !endpoint) return res.status(400).json({ error: 'Missing apiKey or endpoint' });

  try {
    const body = {
      model: model || 'gpt-4o-mini',
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...(messages || [])]
        : (messages || []),
      temperature: 0.7,
      max_tokens: 4096,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    // 尝试提取 JSON
    try {
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return res.json(JSON.parse(jsonMatch[0]));
      return res.json({ error: 'No JSON in response', raw: content });
    } catch (e) {
      return res.status(500).json({ error: 'Parse failed', detail: e.message });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

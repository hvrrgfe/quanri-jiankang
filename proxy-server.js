/**
 * 三餐指南 - 本地 API 代理服务器
 * 解决浏览器不能直接调 AI API 的问题
 *
 * 使用方法：
 *   node proxy-server.js
 *   然后网页设置里填 API Key 就能用了
 */
const http = require('http');
const https = require('https');

const PORT = 3111;

const server = http.createServer((req, res) => {
  // CORS 头 - 允许本地网页调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    return res.end(JSON.stringify({ error: 'POST only' }));
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { apiKey, endpoint, model, messages, systemPrompt } = JSON.parse(body);
      if (!apiKey || !endpoint) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Missing apiKey or endpoint' }));
      }

      const payload = JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: systemPrompt
          ? [{ role: 'system', content: systemPrompt }, ...(messages || [])]
          : (messages || []),
        temperature: 0.7,
        max_tokens: 4096,
      });

      const url = new URL(endpoint);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${apiKey}`,
        },
      };

      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', c => data += c);
        proxyRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.message?.content || '';
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(JSON.parse(match[0])));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No JSON', raw: content }));
            }
          } catch {
            res.writeHead(502);
            res.end(JSON.stringify({ error: 'Parse failed', raw: data.slice(0, 500) }));
          }
        });
      });

      proxyReq.on('error', e => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: e.message }));
      });

      proxyReq.write(payload);
      proxyReq.end();
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n  🥢 三餐指南 API 代理`);
  console.log(`  ─────────────────────`);
  console.log(`  服务器已启动：http://localhost:${PORT}`);
  console.log(`  在网页「设置」中填入：`);
  console.log(`  API 端点：http://localhost:${PORT}`);
  console.log(`  （然后正常填 API Key）`);
  console.log(`  ─────────────────────`);
  console.log(`  按 Ctrl+C 停止\n`);
});

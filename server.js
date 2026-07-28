/**
 * 三餐指南 - 一站式服务器
 * 网页服务 + API 代理 二合一
 *
 * 启动：node server.js
 * 打开：http://localhost:3111
 * 设置里选「本地代理」，填 API Key，即可使用
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3111;
const ROOT = __dirname;

// 静态文件 MIME 类型
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function serveStatic(req, res) {
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 404 时返回 index.html（支持 SPA 路由）
      fs.readFile(path.join(ROOT, 'index.html'), (_, html) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// API 代理处理
function handleProxy(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405); return res.end('POST only'); }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const { apiKey, endpoint, model, messages, systemPrompt } = JSON.parse(body);
      if (!apiKey || !endpoint) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Missing apiKey or endpoint' })); }

      const payload = JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: systemPrompt ? [{ role: 'system', content: systemPrompt }, ...(messages || [])] : (messages || []),
        temperature: 0.7,
        max_tokens: 4096,
      });

      const url = new URL(endpoint);
      const proxyReq = https.request({
        hostname: url.hostname, port: 443, path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${apiKey}`,
        },
      }, proxyRes => {
        let data = '';
        proxyRes.on('data', c => data += c);
        proxyRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.message?.content || '';
            const match = content.match(/\{[\s\S]*\}/);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(match ? JSON.parse(match[0]) : { error: 'No JSON', raw: content.slice(0, 300) }));
          } catch { res.writeHead(502); res.end(JSON.stringify({ error: 'Parse failed' })); }
        });
      });
      proxyReq.on('error', e => { res.writeHead(502); res.end(JSON.stringify({ error: e.message })); });
      proxyReq.write(payload);
      proxyReq.end();
    } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/proxy' || req.url === '/proxy') {
    handleProxy(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`
  🥢 三餐指南 · 一站式服务
  ─────────────────────────
  打开浏览器访问：
  http://localhost:${PORT}

  在「设置」中：
  1. 开启「本地代理」
  2. 填入你的 API Key
  3. 生成菜单即可调用 AI

  按 Ctrl+C 停止服务
  ─────────────────────────
  `);
});

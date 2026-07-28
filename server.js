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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-Endpoint');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405); return res.end('POST only'); }

  // 透明代理：从 Authorization 头提取 Key，从 X-Target-Endpoint 头获取目标地址
  const authHeader = req.headers['authorization'] || '';
  const apiKey = authHeader.replace(/^Bearer\s+/i, '');
  const targetEndpoint = req.headers['x-target-endpoint'] || process.env.AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Missing API Key (Authorization: Bearer ...)' }));
  }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const url = new URL(targetEndpoint);
      const proxyReq = https.request({
        hostname: url.hostname, port: 443, path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Authorization': `Bearer ${apiKey}`,
        },
      }, proxyRes => {
        let data = '';
        proxyRes.on('data', c => data += c);
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      proxyReq.on('error', e => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
      proxyReq.write(body);
      proxyReq.end();
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
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

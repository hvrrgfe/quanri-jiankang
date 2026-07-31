/**
 * 全日健康 · 一站式服务器(手机端优先增强版)
 * 网页服务 + API 代理 二合一
 *
 * 启动：node server.js            # 默认端口 3111
 *       node server.js --port 8080
 * 打开：http://localhost:3111 (本机)
 *       http://192.168.x.x:3111 (同一 Wi-Fi 下的手机/平板)
 *
 * 局域网访问：手机浏览器直接输入上面打印的局域网地址即可
 * 公网访问  ：见「部署指南.md」(cpolar / ngrok / cloudflared / frp)
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---- 命令行参数 ----
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = (portArg > -1 && args[portArg + 1]) ? parseInt(args[portArg + 1], 10) : 3111;
const ROOT = __dirname;

// 静态文件 MIME 类型
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function getLanIPs() {
  const ips = [];
  try {
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach((name) => {
      (ifaces[name] || []).forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address);
      });
    });
  } catch (e) {
    // 某些受限环境(如容器/模拟器)不支持枚举网卡,忽略即可
  }
  return ips;
}

function serveStatic(req, res) {
  // 路径穿越防护
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 404 时返回 index.html(支持 SPA 路由)
      fs.readFile(path.join(ROOT, 'index.html'), (_, html) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }
    // 所有资源都允许跨域(方便局域网内其它设备/调试工具引用)
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

// API 代理处理(解决浏览器直连被 CORS 拦截的问题)
function handleProxy(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-Endpoint');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // 健康检查(内网穿透 / 公网部署后用于验证服务在线)
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'quanri-jiankang', time: new Date().toISOString() }));
  }

  if (req.method !== 'POST') { res.writeHead(405); return res.end('POST only'); }

  // 透明代理：Authorization 头带 Key，X-Target-Endpoint 头带目标地址
  const authHeader = req.headers['authorization'] || '';
  const apiKey = authHeader.replace(/^Bearer\s+/i, '');
  const targetEndpoint = req.headers['x-target-endpoint'] ||
    process.env.AI_ENDPOINT ||
    'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Missing API Key (Authorization: Bearer ...)' }));
  }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const url = new URL(targetEndpoint);
      // 支持 http/https 两种目标(本地 Ollama = http://192.168.x.x:11434)
      const mod = url.protocol === 'http:' ? http : https;
      const proxyReq = mod.request({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'http:' ? 80 : 443),
        path: url.pathname + url.search,
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
  const urlPath = req.url.split('?')[0];
  if (urlPath === '/api/proxy' || urlPath === '/proxy' || urlPath === '/api/health' || urlPath === '/health') {
    handleProxy(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLanIPs();
  const lines = [];
  lines.push('');
  lines.push('  🌿 全日健康 · 一站式服务');
  lines.push('  ─────────────────────────────');
  lines.push(`  本机访问   http://localhost:${PORT}`);
  if (ips.length) {
    lines.push('  手机/平板(同一 Wi-Fi):');
    ips.forEach(ip => lines.push(`             http://${ip}:${PORT}`));
  }
  lines.push('');
  lines.push('  公网访问(任选其一):');
  lines.push(`    cpolar      cpolar http ${PORT}`);
  lines.push(`    ngrok       ngrok http ${PORT}`);
  lines.push(`    cloudflared cloudflared tunnel --url http://localhost:${PORT}`);
  lines.push(`    frp         见 部署指南.md`);
  lines.push('');
  lines.push('  健康检查(验证服务在线):');
  lines.push(`    curl http://localhost:${PORT}/api/health`);
  lines.push('');
  lines.push('  「更多」→ API 端点:');
  lines.push('    1. 开启「本地代理」(推荐,避免 CORS 拦截)');
  lines.push('    2. 填入 API Key 与端点(支持 OpenAI 兼容接口 / Ollama 本地)');
  lines.push('    3. 生成计划即可调用 AI');
  lines.push('');
  lines.push(`  按 Ctrl+C 停止服务  ·  端口 ${PORT} 已监听 0.0.0.0`);
  lines.push('  ─────────────────────────────');
  lines.push('');
  console.log(lines.join('\n'));
});

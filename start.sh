#!/bin/sh
# ============================================
# 全日健康 · 一键启动(Linux / macOS)
# 用法:
#   ./start.sh          默认端口 3111
#   ./start.sh 8080     指定端口
# ============================================
cd "$(dirname "$0")"

PORT="${1:-3111}"

if command -v node >/dev/null 2>&1; then
  echo "🌿 使用 Node.js 启动(端口 $PORT,支持 API 本地代理)..."
  node server.js --port "$PORT"
elif command -v python3 >/dev/null 2>&1; then
  echo "🌿 使用 Python 静态服务(端口 $PORT,无 API 代理功能)..."
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  echo "🌿 使用 Python 静态服务(端口 $PORT,无 API 代理功能)..."
  python -m http.server "$PORT"
else
  echo "❌ 未找到 node / python,请先安装 Node.js: https://nodejs.org"
  exit 1
fi

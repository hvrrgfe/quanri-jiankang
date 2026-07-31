@echo off
rem ============================================
rem 全日健康 - 一键启动(Windows)
rem 用法: start.bat [端口]
rem ============================================
cd /d %~dp0

set PORT=%1
if "%PORT%"=="" set PORT=3111

where node >nul 2>nul
if %errorlevel%==0 (
  echo [OK] 使用 Node.js 启动(端口 %PORT%,支持 API 本地代理)...
  node server.js --port %PORT%
  goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo [OK] 使用 Python 静态服务(端口 %PORT%,无 API 代理功能)...
  python -m http.server %PORT%
  goto :end
)

echo [X] 未找到 node / python,请先安装 Node.js: https://nodejs.org
:end
pause

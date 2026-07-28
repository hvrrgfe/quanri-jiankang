// ===== 通用工具函数 =====
const Helpers = {
  // 安全数字显示（防 NaN）
  num(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  },

  disp(v, fallback = '—') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  },

  // 生成唯一 ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  // 日期格式化
  formatDate(date, fmt = 'MM月DD日') {
    const d = new Date(date);
    const map = { 'YYYY': d.getFullYear(), 'MM': String(d.getMonth() + 1).padStart(2, '0'), 'DD': String(d.getDate()).padStart(2, '0') };
    let r = fmt;
    Object.entries(map).forEach(([k, v]) => { r = r.replace(k, v); });
    return r;
  },

  // 星期几
  weekDay(date) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date(date).getDay()];
  },

  // 菜单起始日：今天
  getWeekStart(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // 将 YYYY-MM-DD 转为本地日期（避免 ISO 解析为 UTC 的时区问题）
  parseDate(str) {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return new Date(str);
  },

  // 获取一周的日期数组
  getWeekDays(startDate) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  },

  // 深拷贝
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // 随机取一个
  randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // 随机取N个（不重复）
  randomPickN(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
  },

  // 加载页面的小贴士列表
  loadingTips: [
    '🥬 膳食指南建议每天吃够12种食物，御坂正在努力凑',
    '🧂 每天食盐不超过5g，大约一个啤酒瓶盖的量',
    '🥩 红肉每周不超过500g，御坂会帮你看好',
    '🐟 每周至少吃2次鱼虾，富含Omega-3脂肪酸',
    '🥛 每天奶制品300ml以上，补钙很重要',
    '🌰 每天一小把坚果，约10g就够',
    '🥚 鸡蛋每天一个，蛋白质刚刚好',
    '🍚 全谷物和杂豆占主食的1/3以上更健康',
    '🥦 深色蔬菜要占每天蔬菜的一半以上',
    '💧 每天喝够1.5-1.7L水，少量多次',
    '🚶 每周至少150分钟中等强度运动',
    '😴 每晚7-9小时睡眠有助于控制体重',
    '🥗 彩虹饮食法：每天吃5种颜色的蔬果',
    '🍳 多用蒸煮炖，少用煎炸更健康',
    '📦 备菜党：周末切好菜，工作日10分钟开饭',
    '御坂正在翻阅膳食指南第38页……',
    '御坂在计算你的基础代谢率……',
    '御坂在搭配荤素比例……',
    '御坂正在排除你不喜欢吃的菜……',
    '御坂在考虑你今天吃什么不会腻……',
  ],

  // 生成加载动画HTML
  loadingHTML() {
    const tipIdx = Math.floor(Math.random() * this.loadingTips.length);
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px;animation:pulse 1s ease-in-out infinite">🥢</div>
        <div style="font-size:18px;font-weight:600;color:var(--text);margin-bottom:8px">正在搭配菜单...</div>
        <div style="font-size:13px;color:var(--text-soft);margin-bottom:24px">基于《中国居民膳食指南》<br>结合你的饮食档案定制</div>
        <div style="width:200px;height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px">
          <div style="width:30%;height:100%;background:var(--accent);border-radius:2px;animation:loadingBar 1.5s ease-in-out infinite"></div>
        </div>
        <div id="loading-tip" style="font-size:13px;color:var(--text-soft);max-width:280px;line-height:1.6;min-height:42px">${this.loadingTips[tipIdx]}</div>
      </div>
      <style>
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes loadingBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
      </style>
    `;
  },

  // 启动小贴士轮播
  startTipTimer() {
    if (this._tipTimer) clearInterval(this._tipTimer);
    let idx = Math.floor(Math.random() * this.loadingTips.length);
    this._tipTimer = setInterval(() => {
      idx = (idx + 1) % this.loadingTips.length;
      const el = document.getElementById('loading-tip');
      if (!el) { clearInterval(this._tipTimer); this._tipTimer = null; return; }
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = Helpers.loadingTips[idx]; el.style.opacity = '1'; }, 150);
    }, 3500);
    return this._tipTimer;
  },

  // 停止小贴士轮播
  stopTipTimer() {
    if (this._tipTimer) { clearInterval(this._tipTimer); this._tipTimer = null; }
  },

  // 节流
  throttle(fn, delay = 300) {
    let timer = null;
    return function (...args) {
      if (timer) return;
      timer = setTimeout(() => { fn.apply(this, args); timer = null; }, delay);
    };
  },

  // 显示 Toast
  toast(msg, duration = 2000) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), duration);
  },

  // 打开模态框
  openModal(html) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.addEventListener('click', function handler(e) {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        overlay.removeEventListener('click', handler);
      }
    });
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  // 调用 LLM API - 只获取菜名列表，不解析完整 JSON
  async callLLM(systemPrompt, userPrompt, apiKey) {
    if (!apiKey) throw new Error('未设置 API Key');

    const directEndpoint = Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions');
    const model = Store.get('apiModel', 'gpt-4o-mini');

    const body = JSON.stringify({
      model, temperature: 0.7, max_tokens: 32000,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    });
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

    const res = await fetch(directEndpoint, { method: 'POST', headers, body });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403) throw new Error('API Key 无效');
      if (res.status === 429) throw new Error('API 调用过于频繁');
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || '';
    content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    // 全面清洗 JSON：去多余逗号、去注释、去代码块
    const m = content.match(/\{[\s\S]*\}/);
    if (m) {
      let json = m[0]
        .replace(/,\s*([}\]])/g, '$1')    // 去掉尾逗号
        .replace(/\/\/.*/g, '')            // 去掉//注释
        .replace(/\/\*[\s\S]*?\*\//g, ''); // 去掉/*注释*/
      try { return JSON.parse(json); } catch (e) {
        console.warn('JSON仍失败:', e.message);
      }
    }

    // 按行拆分返回
    return content.split('\n').filter(s => s.trim()).slice(0, 21);
  },
};

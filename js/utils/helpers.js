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

  // 本周一的日期
  getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
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
      model, temperature: 0.7, max_tokens: 2000,
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

    // 尝试解析 JSON（清洗多余逗号）
    const m = content.match(/\{[\s\S]*\}/);
    if (m) {
      let json = m[0].replace(/,\s*([}\]])/g, '$1');
      try { return JSON.parse(json); } catch {}
    }

    // 按行拆分返回
    return content.split('\n').filter(s => s.trim()).slice(0, 21);
  },
};

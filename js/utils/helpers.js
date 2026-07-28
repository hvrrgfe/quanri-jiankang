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

  // 调用 LLM API
  async callLLM(systemPrompt, userPrompt, apiKey) {
    if (!apiKey) {
      throw new Error('未设置 API Key');
    }

    const model = Store.get('apiModel', 'gpt-4o-mini');
    const useProxy = Store.get('useProxy', false);
    let directEndpoint = Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions');
    // 自动补全路径：如果 endpoint 只是域名没有路径，加上 /v1/chat/completions
    try {
      const u = new URL(directEndpoint);
      if (u.pathname === '/' || u.pathname === '') {
        directEndpoint = directEndpoint.replace(/\/?$/, '') + '/v1/chat/completions';
      }
    } catch (e) { /* ignore invalid URLs */ }

    // 直接构造请求参数
    const body = JSON.stringify({
      model, temperature: 0.7, max_tokens: 4096,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    });
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(useProxy ? { 'X-Target-Endpoint': directEndpoint } : {}),
    };

    // 对非 2xx 响应附加 .status 字段，供降级逻辑区分错误类型
    const doFetch = async (url, label) => {
      let res;
      try {
        res = await fetch(url, { method: 'POST', headers, body });
      } catch (e) {
        throw new Error('网络不通 [' + label + '] ' + e.message);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        const short = txt.slice(0, 150);
        if (res.status === 401 || res.status === 403) {
          const err = new Error('API Key 无效或权限不足(访问' + label + ')');
          err.status = res.status;
          throw err;
        }
        if (res.status === 429) {
          const err = new Error('API 调用过于频繁');
          err.status = res.status;
          throw err;
        }
        const err = new Error('请求失败 [' + label + '] HTTP ' + res.status);
        err.status = res.status;
        throw err;
      }
      return res.json();
    };

    // 开启代理时优先走本地 server.js
    // 代理不存在（404）或网络不通时自动降级到直连
    // 其他 HTTP 错误（401/403/429/500 等）不降级，直接抛出
    const fetchWithFallback = async () => {
      if (!useProxy) return doFetch(directEndpoint, '直连');
      try {
        return await doFetch('/api/proxy', '本地代理');
      } catch (e) {
        if (e.status !== undefined && e.status !== 404) throw e;
        console.warn('代理不可用，切直连:', e.message);
        return doFetch(directEndpoint, '直连');
      }
    };
    const data = await fetchWithFallback();

    const content = data.choices?.[0]?.message?.content || '';

    // 先尝试直接解析，不行再用正则提取
    try { return JSON.parse(content); } catch {}
    const m = content.match(/\{.*\}/s);
    if (m) try { return JSON.parse(m[0]); } catch {}
    throw new Error('API 返回格式异常，无法解析 JSON');
  },
};

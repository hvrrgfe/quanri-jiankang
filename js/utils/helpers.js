// ===== 通用工具函数 =====
const Helpers = {
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

  // 生成系统提示词（膳食指南上下文）
  buildSystemPrompt(profile) {
    return `你是一位专业的中国营养师，基于《中国居民膳食指南（2022）》为用户规划饮食。

## 你的任务
根据用户的个人画像，生成一份完整的一周（7天）每日三餐菜单。
每餐必须符合膳食指南的推荐量。

## 膳食指南核心规则
1. 食物多样：每天 ≥12种食材，每周 ≥25种
2. 吃动平衡：根据用户能量需求分配
3. 蔬果奶豆：蔬菜300-500g/天（深色占一半），水果200-350g/天，奶制品300ml/天
4. 适量吃鱼禽蛋瘦：肉蛋类120-200g/天，鱼虾≥2次/周，红肉≤500g/周
5. 少盐少油：盐≤5g/天，油≤25-30g/天
6. 三餐分配：早餐30%、午餐40%、晚餐30%

## 用户画像
${JSON.stringify(profile, null, 2)}

## 输出格式要求
以严格的JSON格式输出，不要有任何其他文字：
{
  "days": [
    {
      "date": "2026-07-28",
      "dayOfWeek": "周一",
      "meals": {
        "breakfast": {
          "name": "菜名",
          "ingredients": ["食材1", "食材2", ...],
          "cookTime": 15,
          "steps": ["步骤1", "步骤2", ...]
        },
        "lunch": { ... },
        "dinner": { ... }
      },
      "ingredientCount": 12,
      "totalCookTime": 45
    }
  ],
  "weeklyStats": {
    "totalIngredientTypes": 30,
    "darkVegetablePercent": "60%",
    "redMeatTotalGrams": 400,
    "fishCount": 2,
    "notes": "本周营养建议"
  }
}

确保：
- 菜名是中餐家常菜名
- 每道菜不超过6个步骤
- 每个步骤包含时间预估
- 食材要求常见易买
- 每天食材种类≥12种
- 一周内菜品尽量不重复
- 符合用户的口味偏好和禁忌`;
  },

  // 调用 LLM API
  async callLLM(systemPrompt, userPrompt, apiKey) {
    if (!apiKey) {
      throw new Error('未设置 API Key');
    }

    // 检测本地代理是否可用，优先使用
    const localProxy = 'http://localhost:3111';
    const useProxy = Store.get('useProxy', false);
    const endpoint = useProxy
      ? localProxy
      : Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions');
    const model = Store.get('apiModel', 'gpt-4o-mini');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API 错误 (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试提取 JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
    } catch {
      throw new Error('API 返回格式异常，无法解析 JSON');
    }
  },
};

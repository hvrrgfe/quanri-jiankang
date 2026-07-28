// ===== 本地安全存储模块 =====
// 所有用户数据仅存储在浏览器 localStorage
// API Key 可以额外用 Base64 简单混淆（非加密，防意外泄露）
const Store = {
  _prefix: 'tcan_',

  _key(name) { return this._prefix + name; },

  get(name, def = null) {
    try {
      const raw = localStorage.getItem(this._key(name));
      return raw ? JSON.parse(raw) : def;
    } catch { return def; }
  },

  set(name, value) {
    localStorage.setItem(this._key(name), JSON.stringify(value));
    return value;
  },

  remove(name) {
    localStorage.removeItem(this._key(name));
  },

  // API Key —— 简单混淆存储
  getApiKey() {
    const raw = localStorage.getItem(this._key('apikey'));
    if (!raw) return '';
    try {
      return atob(raw);
    } catch { return ''; }
  },

  setApiKey(key) {
    const encoded = btoa(key);
    localStorage.setItem(this._key('apikey'), encoded);
  },

  removeApiKey() {
    localStorage.removeItem(this._key('apikey'));
  },

  hasApiKey() {
    return !!this.getApiKey();
  },

  // 用户画像
  getProfile() { return this.get('profile'); },
  setProfile(p) { return this.set('profile', p); },
  hasProfile() { return !!this.getProfile(); },

  // 周计划
  getWeeklyPlan() { return this.get('weeklyPlan'); },
  setWeeklyPlan(p) { return this.set('weeklyPlan', p); },
  hasWeeklyPlan() { return !!this.getWeeklyPlan(); },

  // 反馈记录
  getFeedback() { return this.get('feedback', []); },
  addFeedback(fb) {
    const list = this.getFeedback();
    list.push({ ...fb, timestamp: Date.now() });
    return this.set('feedback', list);
  },

  // 购物清单
  getShoppingList() { return this.get('shoppingList'); },
  setShoppingList(s) { return this.set('shoppingList', s); },

  // 全部重置
  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(this._prefix)) localStorage.removeItem(k);
    });
  },
};

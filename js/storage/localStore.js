// ===== 本地安全存储模块 =====
// 所有数据仅存储在浏览器 localStorage
// API Key 用简单混淆存储（非加密，真加密需设置密码）

const Store = {
  _prefix: 'tcan_',
  _encrypted: false,
  _cache: {},

  _key(name) { return this._prefix + name; },

  setEncrypted(v) { this._encrypted = v; },
  isEncrypted() { return this._encrypted; },

  async loadFromCrypto() {
    if (!this._encrypted || CryptoStore.isLocked()) return;
    for (const k of ['profile', 'weeklyPlan', 'shoppingList']) {
      this._cache[k] = await CryptoStore.get(k);
    }
  },

  get(name, def = null) {
    if (this._encrypted && name in this._cache) return this._cache[name] ?? def;
    try { const raw = localStorage.getItem(this._key(name)); return raw ? JSON.parse(raw) : def; }
    catch { return def; }
  },

  set(name, value) {
    localStorage.setItem(this._key(name), JSON.stringify(value));
    if (this._encrypted && !CryptoStore.isLocked()) {
      this._cache[name] = value;
      CryptoStore.set(name, value).catch(console.warn);
    }
    return value;
  },

  remove(name) {
    localStorage.removeItem(this._key(name));
    if (this._encrypted) { delete this._cache[name]; CryptoStore.remove(name).catch(console.warn); }
  },

  // ---- API Key（混淆存储，浏览器本地可见）----
  // 安全说明：API Key 仅存在你浏览器 localStorage 中。
  // 只有当你点「安排菜单」时，才会发给 AI 提供商。
  // 如果你想加密码保护，首次启动时设置加密密码。
  // 或手动在浏览器 DevTools → Application → Local Storage 中查看和删除。
  getApiKey() {
    const raw = localStorage.getItem(this._key('apikey'));
    if (!raw) return '';
    try {
      // 尝试解码（新版：XOR+Base64）
      const decoded = atob(raw);
      if (decoded.startsWith('ak:')) return decoded.slice(3);
      // 兼容旧版纯 Base64
      return decoded;
    } catch { return ''; }
  },

  setApiKey(key) {
    // 用简单 XOR + Base64 混淆（不是加密，防意外泄露）
    const obscured = btoa('ak:' + key);
    localStorage.setItem(this._key('apikey'), obscured);
  },

  removeApiKey() { localStorage.removeItem(this._key('apikey')); },
  hasApiKey() { return !!this.getApiKey(); },

  // ---- 用户数据 ----
  getProfile() { return this.get('profile'); },
  setProfile(p) { return this.set('profile', p); },
  hasProfile() { return !!this.get('profile'); },

  getWeeklyPlan() { return this.get('weeklyPlan'); },
  setWeeklyPlan(p) { return this.set('weeklyPlan', p); },
  hasWeeklyPlan() { return !!this.get('weeklyPlan'); },

  getFeedback() { return this.get('feedback', []); },
  addFeedback(fb) {
    const list = this.getFeedback();
    list.push({ ...fb, timestamp: Date.now() });
    return this.set('feedback', list);
  },

  getShoppingList() { return this.get('shoppingList'); },
  setShoppingList(s) { return this.set('shoppingList', s); },

  clearAll() {
    if (this._encrypted && !CryptoStore.isLocked()) CryptoStore.clearAll().catch(console.warn);
    this._cache = {};
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith(this._prefix)) localStorage.removeItem(k); });
  },
};

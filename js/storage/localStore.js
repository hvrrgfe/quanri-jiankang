// ===== 本地安全存储模块 =====
// 加密可用时自动使用 AES-GCM 加密敏感数据
// 通过缓存层实现透明加解密，组件无需感知

const Store = {
  _prefix: 'tcan_',
  _encrypted: false,
  _cache: {},  // 解密后的数据缓存

  _key(name) { return this._prefix + name; },

  // 开启/关闭加密模式
  setEncrypted(v) { this._encrypted = v; },
  isEncrypted() { return this._encrypted; },

  // 从 CryptoStore 预加载所有数据到缓存
  async loadFromCrypto() {
    if (!this._encrypted || CryptoStore.isLocked()) return;
    const keys = ['profile', 'weeklyPlan', 'shoppingList'];
    for (const k of keys) {
      this._cache[k] = await CryptoStore.get(k);
    }
  },

  // ---- 同步读写（通过缓存，组件无需 await）----

  get(name, def = null) {
    // 加密模式下优先从缓存读
    if (this._encrypted && name in this._cache) {
      return this._cache[name] ?? def;
    }
    try {
      const raw = localStorage.getItem(this._key(name));
      return raw ? JSON.parse(raw) : def;
    } catch { return def; }
  },

  set(name, value) {
    localStorage.setItem(this._key(name), JSON.stringify(value));
    // 加密模式下同时写入缓存和 CryptoStore
    if (this._encrypted && !CryptoStore.isLocked()) {
      this._cache[name] = value;
      CryptoStore.set(name, value).catch(console.warn);
    }
    return value;
  },

  remove(name) {
    localStorage.removeItem(this._key(name));
    if (this._encrypted) {
      delete this._cache[name];
      CryptoStore.remove(name).catch(console.warn);
    }
  },

  // ---- API Key (Base64 混淆) ----
  getApiKey() {
    const raw = localStorage.getItem(this._key('apikey'));
    if (!raw) return '';
    try { return atob(raw); } catch { return ''; }
  },
  setApiKey(key) { localStorage.setItem(this._key('apikey'), btoa(key)); },
  removeApiKey() { localStorage.removeItem(this._key('apikey')); },
  hasApiKey() { return !!this.getApiKey(); },

  // ---- 用户数据 ----
  getProfile() { return this.get('profile'); },
  setProfile(p) { return this.set('profile', p); },
  hasProfile() { return !!this.get('profile'); },

  // ---- 周计划 ----
  getWeeklyPlan() { return this.get('weeklyPlan'); },
  setWeeklyPlan(p) { return this.set('weeklyPlan', p); },
  hasWeeklyPlan() { return !!this.get('weeklyPlan'); },

  // ---- 反馈 ----
  getFeedback() { return this.get('feedback', []); },
  addFeedback(fb) {
    const list = this.getFeedback();
    list.push({ ...fb, timestamp: Date.now() });
    return this.set('feedback', list);
  },

  // ---- 购物清单 ----
  getShoppingList() { return this.get('shoppingList'); },
  setShoppingList(s) { return this.set('shoppingList', s); },

  // ---- 全清 ----
  clearAll() {
    if (this._encrypted && !CryptoStore.isLocked()) {
      CryptoStore.clearAll().catch(console.warn);
    }
    this._cache = {};
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(this._prefix)) localStorage.removeItem(k);
    });
  },
};

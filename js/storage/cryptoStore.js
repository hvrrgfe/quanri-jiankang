// ===== 本地加密存储 =====
// 使用 Web Crypto API (AES-GCM) 加密所有敏感数据
// 密码由用户设定，不存储在本地

const CryptoStore = {
  _salt: null,
  _key: null,
  _locked: true,

  // 初始化：检查是否已有加密数据
  init() {
    const salt = localStorage.getItem('tcan_salt');
    const iv = localStorage.getItem('tcan_iv');
    if (salt && iv) {
      this._salt = this._base64ToBytes(salt);
      return true; // 已有加密，需要密码
    }
    return false; // 首次使用，需要设置密码
  },

  // 设置密码（首次使用）
  async setupPassword(password) {
    // 生成随机 salt 和 iv
    this._salt = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 派生密钥
    this._key = await this._deriveKey(password, this._salt);

    // 保存 salt 和 iv（未加密）
    localStorage.setItem('tcan_salt', this._bytesToBase64(this._salt));
    localStorage.setItem('tcan_iv', this._bytesToBase64(iv));

    // 加密并保存一个验证标记
    const marker = await this._encrypt('__VALID__', iv);
    localStorage.setItem('tcan_vfy', marker);

    this._locked = false;
    return true;
  },

  // 验证密码是否正确
  async verifyPassword(password) {
    try {
      const salt = this._base64ToBytes(localStorage.getItem('tcan_salt'));
      this._key = await this._deriveKey(password, salt);

      const encryptedVfy = localStorage.getItem('tcan_vfy');
      if (!encryptedVfy) return false;

      const decrypted = await this._decrypt(encryptedVfy);
      return decrypted === '__VALID__';
    } catch {
      return false;
    }
  },

  // 解锁存储
  async unlock(password) {
    if (await this.verifyPassword(password)) {
      this._locked = false;
      return true;
    }
    return false;
  },

  lock() {
    this._locked = true;
    this._key = null;
  },

  isLocked() { return this._locked; },

  // 加密存储
  async set(key, value) {
    if (this._locked) throw new Error('Storage is locked');

    // 每次加密用新的 IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await this._encrypt(JSON.stringify(value), iv);

    // 存储时附上 IV
    localStorage.setItem(
      'tcan_enc_' + key,
      this._bytesToBase64(iv) + ':' + encrypted
    );
  },

  // 解密读取
  async get(key, def = null) {
    if (this._locked) return def;

    const raw = localStorage.getItem('tcan_enc_' + key);
    if (!raw) return def;

    try {
      const [ivB64, encrypted] = raw.split(':');
      const iv = this._base64ToBytes(ivB64);
      const decrypted = await this._decrypt(encrypted, iv);
      return JSON.parse(decrypted);
    } catch {
      return def;
    }
  },

  async remove(key) {
    localStorage.removeItem('tcan_enc_' + key);
  },

  async clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('tcan_enc_')) localStorage.removeItem(k);
    });
  },

  // ---- 加密原语 ----

  async _deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password),
      'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  },

  async _encrypt(data, iv) {
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this._key,
      enc.encode(data)
    );
    return this._bytesToBase64(new Uint8Array(encrypted));
  },

  async _decrypt(encryptedB64, iv) {
    const encrypted = this._base64ToBytes(encryptedB64);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this._key,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  },

  _bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  },

  _base64ToBytes(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  },
};

// ===== 国际化（i18n）=====
// 支持中文和英文

const I18n = {
  _current: 'zh',

  init() {
    this._current = Store.get('language', 'zh');
  },

  t(path) {
    const lang = this._current === 'en' ? LangEN : LangCN;
    const parts = path.split('.');
    let val = lang;
    for (const p of parts) {
      // 支持 greeting[0] 形式的数组索引
      const m = p.match(/^(\w+)\[(\d+)\]$/);
      const key = m ? m[1] : p;
      const idx = m ? parseInt(m[2]) : -1;
      if (val && val[key] !== undefined) {
        val = val[key];
        if (idx >= 0 && Array.isArray(val) && val[idx] !== undefined) val = val[idx];
      } else return path;
    }
    if (typeof val === 'string') return val;
    return path;
  },

  // 翻译带参数——用 %s 占位，如 __('home.greeting', name)
  tf(path, ...args) {
    let s = this.t(path);
    args.forEach(a => { s = s.replace('%s', a); });
    return s;
  },

  getLang() { return this._current; },

  setLang(lang) {
    this._current = lang;
    Store.set('language', lang);
  },
};

// 全局快捷翻译函数
function __(path) { return I18n.t(path); }
function _f(path, ...args) { return I18n.tf(path, ...args); }

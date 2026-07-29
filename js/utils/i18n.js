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
      if (val && val[p] !== undefined) val = val[p];
      else return path;
    }
    if (typeof val === 'string') return val;
    return path;
  },

  getLang() { return this._current; },

  setLang(lang) {
    this._current = lang;
    Store.set('language', lang);
  },
};

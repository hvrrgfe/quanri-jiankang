// ===== SVG 图标库（替换所有 emoji）=====
const Icons = {
  // 品牌
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0-7 18-7 18 0s-18 7-18 0z"/><path d="M12 5v14"/><path d="M8 9l4 3 4-3"/><path d="M9 16l3-2 3 2"/></svg>',

  // 导航
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 12l2 2 4-4"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>',

  // 餐次
  breakfast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>',
  lunch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c-4.97 0-9-3.58-9-8 0-3.31 2.69-6 6-6h6c3.31 0 6 2.69 6 6 0 4.42-4.03 8-9 8z"/><path d="M9 2l1 4M15 2l-1 4"/></svg>',
  dinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2l2 4-2 4M18 2l-2 4 2 4"/><path d="M3 16c0-1.1 2-2 4-2s4 .9 4 2M13 16c0-1.1 2-2 4-2s4 .9 4 2"/><path d="M2 18c0-2.2 3.33-3 7-3s7 .8 7 3M11 18c0-2.2 3.33-3 7-3s7 .8 7 3"/></svg>',

  // 食物类别
  vegetable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a8 8 0 00-8 8c0 3.31 2 6 4 8s4 4 4 4 2-2 4-4 4-4.69 4-8a8 8 0 00-8-8z"/><path d="M12 10v4"/><path d="M10 12h4"/></svg>',
  fruit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 4c0 0 2-3 6-2-1 2-2 4-6 3"/><path d="M8 12h8M12 8v8"/></svg>',
  meat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8c.7-.7 1.7-1 2.8-1 2.2 0 4 1.8 4 4 0 .7-.2 1.4-.5 2M3 17c-1.1-1.1-1.8-2.6-1.8-4.2 0-3.3 2.7-6 6-6 1.6 0 3.1.7 4.2 1.8"/><path d="M3 17L17 3"/></svg>',
  seafood: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12c0-3.3 4.5-6 10-6s10 2.7 10 6-4.5 6-10 6-10-2.7-10-6z"/><path d="M12 10v4"/><path d="M10 12h4"/></svg>',
  egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C8 2 4 6 4 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-6-4-10-8-10z"/><path d="M12 7v5"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg>',
  dairy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l2 5v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7l2-5z"/><path d="M6 7h12"/></svg>',
  grain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C9 2 6 4 6 7c0 2 1.5 3.7 3.5 4.5L8 22h8l-1.5-10.5C16.5 10.7 18 9 18 7c0-3-3-5-6-5z"/></svg>',
  tofu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M3 14h18"/></svg>',

  // 操作
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',

  // 状态
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',

  // 杂项
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2c-3 4-5 7-5 10a5 5 0 0010 0c0-3-2-6-5-10z"/><path d="M12 14a2 2 0 100-4 2 2 0 000 4z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 017.5-4M11 16v3"/></svg>',
};

// 获取SVG图标HTML
Icons.get = function(name, className = '') {
  const svg = this[name];
  if (!svg) return '';
  return `<i class="svg-icon ${className}">${svg}</i>`;
};

// 快速替换常用emoji为SVG（跳过onclick和onchange等属性内的内容）
Icons.replace = function(html) {
  if (!html) return html;
  const map = {
    '🥢': this.get('logo'),
    '🍳': this.get('breakfast'),
    '🥗': this.get('lunch'),
    '🍲': this.get('dinner'),
    '🥬': this.get('vegetable'),
    '🍎': this.get('fruit'),
    '🥩': this.get('meat'),
    '🐟': this.get('seafood'),
    '🥚': this.get('egg'),
    '🥛': this.get('dairy'),
    '🍚': this.get('grain'),
    '🧈': this.get('tofu'),
    '✅': this.get('success'),
    '⚠️': this.get('warning'),
    '❌': this.get('error'),
    '🔒': this.get('lock'),
    '🔓': this.get('unlock'),
    '👤': this.get('user'),
    '🌙': this.get('moon'),
    '☀️': this.get('sun'),
    '⭐': this.get('star'),
    '❤️': this.get('heart'),
    '🔄': this.get('refresh'),
    '📋': this.get('menu'),
    '🛒': this.get('cart'),
    '⚙️': this.get('settings'),
    '🔍': this.get('search'),
    '📤': this.get('share'),
    '📥': this.get('download'),
    '📝': this.get('edit'),
    '🗑️': this.get('delete'),
    '⏱': this.get('clock'),
    '🔥': this.get('fire'),
    '💡': this.get('info'),
  };
  // 先保护 onclick/onchange 等属性里的内容
  const protected = [];
  let r = html.replace(/on\w+\s*=\s*'[^']*'/g, function(m) {
    protected.push(m);
    return '###PROTECTED' + (protected.length - 1) + '###';
  });
  // 替换 emoji
  Object.keys(map).forEach(k => {
    r = r.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), map[k]);
  });
  // 恢复保护的内容
  protected.forEach((orig, i) => {
    r = r.replace('###PROTECTED' + i + '###', orig);
  });
  return r;
};


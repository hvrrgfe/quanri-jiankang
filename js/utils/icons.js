// ===== SVG 图标库（极简几何风格，不像 emoji）=====
const Icons = {
  // 品牌 - 交叉筷子抽象
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11 2v20M13 2v20"/><path d="M6 10l3-3M18 10l-3-3"/></svg>',

  // 导航
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h4v-6h6v6h4a1 1 0 001-1V10"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v2M16 2v2"/><path d="M9 12l2 2 4-4"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',

  // 餐次 - 用抽象几何而非具象食物
  breakfast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M6 10V6a6 6 0 0112 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>',
  lunch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2C7 2 3 5 3 9c0 3 2 6 4 8l5 5 5-5c2-2 4-5 4-8 0-4-4-7-9-7z"/><path d="M12 6v6"/><path d="M9 9h6"/></svg>',
  dinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2v4a6 6 0 0012 0V2"/><path d="M2 16h20"/><path d="M8 16v4a2 2 0 002 2h4a2 2 0 002-2v-4"/></svg>',

  // 食物类别 - 抽象符号
  vegetable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2C9 2 6 5 6 9c0 4 3 7 6 7s6-3 6-7c0-4-3-7-6-7z"/><path d="M12 16v5"/><path d="M9 21h6"/></svg>',
  fruit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 4c0 0 2-2 5-1"/><path d="M9 12.5l2 2 4-4"/></svg>',
  meat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 6c2 2 4 5 4 8 0 3-2 6-6 8"/><path d="M3 17c-1-1-2-3-2-5 0-3 2-6 5-8"/><path d="M17 6L7 16"/></svg>',
  seafood: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12c0-3 5-6 10-6s10 3 10 6-5 6-10 6-10-3-10-6z"/><path d="M12 10v4"/></svg>',
  egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><ellipse cx="12" cy="13" rx="6" ry="8"/><path d="M12 8v5"/></svg>',
  dairy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="2" width="8" height="20" rx="3"/><path d="M6 8h12"/></svg>',
  grain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h16"/><path d="M6 20l2-16h8l2 16"/><path d="M8 12h8"/></svg>',
  tofu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16"/><path d="M4 14h16"/></svg>',

  // 操作
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 12 9 17 20 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 2v6h-6"/><path d="M3 22v-6h6"/><path d="M21 8a9 9 0 00-15.5-4"/><path d="M3 16a9 9 0 0015.5 4"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>',

  // 状态 - 几何符号
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r=".5" fill="currentColor"/></svg>',

  // 工具
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2c-2 4-4 6-4 9a4 4 0 008 0c0-3-2-5-4-9z"/><path d="M8 14a4 4 0 008 0"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0"/></svg>',

  // 补充图标（覆盖所有在用的emoji）
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.6 13.4l-7.1 7.1a2 2 0 01-2.8 0L4 13.7V4h9.7l6.9 6.9a2 2 0 010 2.5z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2C8 2 4 5 4 9c0 4 4 7 8 11 4-4 8-7 8-11 0-4-4-7-8-7z"/><circle cx="12" cy="9" r="2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M4 4h16v16H6.5A2.5 2.5 0 014 17.5V4z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 007.5.1L21 10a5 5 0 00-7-7l-2 2"/><path d="M14 11a5 5 0 00-7.5-.1L3 14a5 5 0 007 7l2-2"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 4a1 1 0 10-2 0 1 1 0 002 0z"/><path d="M7 21l3-6"/><path d="M17 21l-3-6-3-4"/><path d="M11 11l3 2"/></svg>',
  heartRate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 000 20 15 15 0 000-20z"/></svg>',
  creditCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>',
  frown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01M15 9h.01"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/><path d="M17 8h-1M14 9h.5"/></svg>',
  thumbsUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.8-3.8a1 1 0 000-1.4L19.5 2.5a1 1 0 00-1.4 0L14.3 6.3z"/><path d="M12 16l-2.5-2.5L4 19l-1 1 1 1 1-1 5.5-5.5"/></svg>',
  printer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9V4h12v5"/><rect x="6" y="13" width="12" height="8" rx="1"/><path d="M18 13V9H6v4"/></svg>',
  api: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 3 21 3 21 8"/><path d="M4 20L21 3"/><polyline points="21 16 21 21 16 21"/><path d="M15 15l3 3"/><path d="M4 4l3 3"/></svg>',
  pepper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2C9 2 6 5 6 9c0 3 2 6 5 8l1 5 1-5c3-2 5-5 5-8 0-4-3-7-6-7z"/></svg>',
  lemon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2l-7 7M22 2l-3 10c-1 3-4 5-7 5s-6-2-7-5c-1-3 0-6 3-8l3-2 7-7z"/></svg>',
  candy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l-3 3c-1 1-1 2 0 3l4 4c1 1 2 1 3 0l3-3"/><path d="M17 17l3-3c1-1 1-2 0-3l-4-4c-1-1-2-1-3 0l-3 3"/></svg>',
  popcorn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 22l-2-12h14l-2 12H7z"/><path d="M12 2c2 0 4 2 3 5"/><path d="M8 4c-1 1-2 3-1 5"/><path d="M16 4c1 1 2 3 1 5"/></svg>',
  cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 18v3h20v-3"/><path d="M4 14l1-10h14l1 10"/><path d="M8 4l1 10"/><path d="M16 4l-1 10"/><path d="M12 4v10"/></svg>',
  nut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L3 7v5c0 5 4 8 9 10 5-2 9-5 9-10V7l-9-5z"/><circle cx="12" cy="12" r="3"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12.9 2.1l9 3.6v12.6l-9 3.6-9-3.6V5.7l9-3.6z"/><path d="M3 6l9 4 9-4"/><path d="M12 22V10"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15 14c1.5-1 3-2.5 3-5a6 6 0 00-12 0c0 2.5 1.5 4 3 5"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 2l-2 2m-7 7a3 3 0 11-4 4l-4-4"/><path d="M15 5l3 3"/><circle cx="7.5" cy="15.5" r="2.5"/></svg>',
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>',
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
    '🌅': this.get('sun'),
    '🌰': this.get('nut'),
    '🌶': this.get('pepper'),
    '🍋': this.get('lemon'),
    '🍬': this.get('candy'),
    '🍿': this.get('popcorn'),
    '🏃': this.get('walk'),
    '🏷': this.get('tag'),
    '💬': this.get('chat'),
    '💰': this.get('creditCard'),
    '📄': this.get('file'),
    '📈': this.get('chart'),
    '📅': this.get('calendar'),
    '📌': this.get('pin'),
    '📖': this.get('book'),
    '📦': this.get('package'),
    '🔌': this.get('api'),
    '🔑': this.get('key'),
    '🔗': this.get('link'),
    '🖥': this.get('monitor'),
    '😋': this.get('smile'),
    '😐': this.get('frown'),
    '😴': this.get('sleep'),
    '🚶': this.get('walk'),
    '🥜': this.get('nut'),
    '🥦': this.get('vegetable'),

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


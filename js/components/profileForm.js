// ===== 饮食档案设置向导 =====
const ProfileForm = {
  _step: 0, _data: null, _done: null,

  start(existing, onComplete) {
    this._step = 0;
    this._done = onComplete;
    this._data = existing || {
      id: Helpers.uid(), age: 28, gender: 'female', height: 165, weight: 55,
      activityLevel: 2, healthGoals: [], dietaryRestrictions: [],
      mealsToPlan: ['breakfast', 'dinner'], cookTimeBudget: 30,
      availableTools: ['炒锅', '电饭煲'], perMealBudget: 20,
      tasteProfile: { spicy: 2, sour: 2, sweet: 2, salty: 2, oily: 2 },
      mode: 'personal',
    };
    this._show();
  },

  _show() {
    const steps = [this._s1.bind(this), this._s2.bind(this), this._s3.bind(this), this._s4.bind(this), this._s5.bind(this)];
    steps[this._step]();
  },

  _frame(title, sub, body) {
    const dots = Array.from({ length: 5 }, (_, i) =>
      `<div class="wizard-dot ${i < this._step ? 'done' : i === this._step ? 'active' : ''}"></div>`
    ).join('');
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="wizard">
        <div class="wizard-dots">${dots}</div>
        <h2>${title}</h2>
        <div class="sub">${sub}</div>
        ${body}
      </div>
    `;
  },

  _field(name, label, type = 'text', opts = {}) {
    const v = this._data[name];
    if (type === 'select') {
      return `<div class="form-group"><label class="form-label">${label}</label>
        <select class="form-select" id="f-${name}">${opts.options.map(o => `<option value="${o.v}" ${v === o.v ? 'selected' : ''}>${o.l}</option>`).join('')}</select></div>`;
    }
    if (type === 'number') {
      return `<div class="form-group"><label class="form-label">${label}</label>
        <input type="number" class="form-input" id="f-${name}" value="${v || opts.default || ''}" ${opts.min ? `min="${opts.min}"` : ''} ${opts.max ? `max="${opts.max}"` : ''}></div>`;
    }
    return `<div class="form-group"><label class="form-label">${label}</label>
      <input type="${type}" class="form-input" id="f-${name}" value="${v || ''}"></div>`;
  },

  _chips(name, label, items, key) {
    const selected = this._data[name] || [];
    return `<div class="form-group"><label class="form-label">${label}</label>
      <div class="chip-grid">${items.map(item => {
        const val = typeof item === 'string' ? item : item.v;
        const lbl = typeof item === 'string' ? item : item.l;
        const isSel = selected.includes(val);
        return `<div class="chip ${isSel ? 'selected' : ''}" onclick="ProfileForm._toggle('${name}','${val}')">
          <div class="ck"></div><span class="chip-label">${lbl}</span></div>`;
      }).join('')}</div></div>`;
  },

  _toggle(name, val) {
    if (!this._data[name]) this._data[name] = [];
    const arr = this._data[name];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    // 刷新高亮
    document.querySelectorAll('#main-content .chip').forEach(el => {
      // re-render not needed, but we update visual
      const onclick = el.getAttribute('onclick') || '';
      if (onclick.includes("'" + val + "'")) {
        el.classList.toggle('selected');
      }
    });
  },

  _range(name, label, val) {
    return `<div class="form-group"><label class="form-label">${label}</label>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text-hint)">0</span>
        <input type="range" id="f-${name}" min="0" max="5" value="${val}" style="flex:1;accent-color:var(--accent);height:4px" oninput="document.getElementById('rv-${name}').textContent=this.value">
        <span id="rv-${name}" style="font-size:14px;font-weight:600;color:var(--accent);min-width:16px;text-align:center">${val}</span>
        <span style="font-size:12px;color:var(--text-hint)">5</span>
      </div></div>`;
  },

  _nav(prev) {
    return `<div class="wizard-nav">
      ${prev ? `<button class="btn btn-outline" onclick="ProfileForm._go(${prev})">← 上一步</button>` : ''}
      <button class="btn btn-primary flex-1" onclick="ProfileForm._next()">${this._step === 4 ? '✅ 搞定' : '下一步 →'}</button>
    </div>`;
  },

  _s1() {
    const d = this._data;
    this._frame('先认识一下你', '', `
      ${this._field('age', '年龄', 'number', { default: 28, min: 10, max: 100 })}
      <div class="form-group"><label class="form-label">性别</label>
        <div class="chip-grid" style="grid-template-columns:1fr 1fr">
          <div class="chip ${d.gender === 'male' ? 'selected' : ''}" onclick="ProfileForm._gender('male')"><div class="ck"></div><span>男</span></div>
          <div class="chip ${d.gender === 'female' ? 'selected' : ''}" onclick="ProfileForm._gender('female')"><div class="ck"></div><span>女</span></div>
        </div></div>
      ${this._field('height', '身高(cm)', 'number', { default: 165, min: 100, max: 220 })}
      ${this._field('weight', '体重(kg)', 'number', { default: 55, min: 30, max: 200 })}
      ${this._field('activityLevel', '活动量', 'select', {
        options: [
          { v: 1, l: '久坐（办公室，很少运动）' },
          { v: 2, l: '轻度（每周运动1-2次）' },
          { v: 3, l: '中度（每周运动3-5次）' },
          { v: 4, l: '高度（体力工作/每天运动）' },
        ]
      })}
      ${this._nav()}
    `);
  },

  _gender(v) {
    this._data.gender = v;
    document.querySelectorAll('#main-content .chip-grid .chip').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      el.classList.toggle('selected', onclick.includes("'" + v + "'"));
    });
  },

  _s2() {
    const goals = [
      { v: 'balanced', l: '吃得均衡' }, { v: 'weight_loss', l: '减减肥' },
      { v: 'muscle', l: '增肌' }, { v: 'blood_sugar', l: '控糖' },
      { v: 'blood_pressure', l: '控盐/降血压' }, { v: 'save_money', l: '省点钱' },
      { v: 'save_time', l: '省时间' },
    ];
    const rests = [
      { v: 'spicy', l: '不吃辣' }, { v: 'lamb', l: '不吃羊肉' },
      { v: 'seafood', l: '海鲜过敏' }, { v: 'lactose', l: '乳糖不耐' },
      { v: 'pork', l: '不吃猪肉' },
    ];
    const customRests = (this._data.dietaryRestrictions || []).filter(
      r => !['spicy','lamb','seafood','lactose','pork'].includes(r)
    );

    const customGoals = (this._data.healthGoals || []).filter(
      r => !['balanced','weight_loss','muscle','blood_sugar','blood_pressure','save_money','save_time'].includes(r)
    );

    this._frame('饮食目标与忌口', '有什么特别要求吗？', `
      <div style="margin-bottom:8px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">你的饮食目标</div>
        <div class="chip-grid" style="display:flex;flex-wrap:wrap;gap:4px">
          ${goals.map(g => {
            const isSel = (this._data.healthGoals||[]).includes(g.v);
            return `<span class="chip ${isSel?'selected':''}" style="padding:5px 12px;font-size:13px;border-radius:20px" onclick="ProfileForm._toggle('healthGoals','${g.v}')">${g.l}</span>`;
          }).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
          ${customGoals.map(r => `<span class="tag tag-accent" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:12px;border-radius:20px">🎯 ${r}<span onclick="ProfileForm._removeArr('healthGoals','${r}')" style="cursor:pointer;opacity:0.6;margin-left:2px">×</span></span>`).join('')}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <input type="text" class="form-input" id="cg-in" placeholder="自定义目标" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addArr('healthGoals','cg-in')">
          <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addArr('healthGoals','cg-in')">+</button>
        </div>
      </div>

      <div style="margin-bottom:8px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">有什么不吃的吗？</div>
        <div class="chip-grid" style="display:flex;flex-wrap:wrap;gap:4px">
          ${rests.map(r => {
            const isSel = (this._data.dietaryRestrictions||[]).includes(r.v);
            return `<span class="chip ${isSel?'selected':''}" style="padding:5px 12px;font-size:13px;border-radius:20px" onclick="ProfileForm._toggle('dietaryRestrictions','${r.v}')">${r.l}</span>`;
          }).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
          ${customRests.map(r => `<span class="tag tag-accent" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:12px;border-radius:20px">✗ ${r}<span onclick="ProfileForm._removeArr('dietaryRestrictions','${r}')" style="cursor:pointer;opacity:0.6;margin-left:2px">×</span></span>`).join('')}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <input type="text" class="form-input" id="cr-in" placeholder="自定义忌口，如：不吃芹菜" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addArr('dietaryRestrictions','cr-in')">
          <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addArr('dietaryRestrictions','cr-in')">+</button>
        </div>
      </div>

      ${this._nav(0)}
    `);
  },

  _s3() {
    const d = this._data;
    const meals = [{ v:'breakfast',l:'早餐' }, { v:'lunch',l:'午餐' }, { v:'dinner',l:'晚餐' }];
    const toolOpts = ['炒锅','电饭煲','微波炉','蒸锅','烤箱','空气炸锅','高压锅','汤锅','煎锅','煮锅','砂锅','烤盘','料理机','空气炸锅'];
    const customTools = (d.availableTools||[]).filter(t => !toolOpts.includes(t));

    this._frame('做饭条件', '你平时做饭的环境', `
      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">一般做哪几餐？</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${meals.map(m => {
            const isSel = (d.mealsToPlan||[]).includes(m.v);
            return `<span class="chip ${isSel?'selected':''}" style="padding:5px 14px;font-size:13px;border-radius:20px" onclick="ProfileForm._toggle('mealsToPlan','${m.v}')">${m.l}</span>`;
          }).join('')}
        </div>
      </div>
      ${this._field('cookTimeBudget', '晚餐一般有多少时间？', 'select', { options: [{v:15,l:'15分钟以内'},{v:30,l:'15-30分钟'},{v:45,l:'30-45分钟'},{v:60,l:'45分钟以上'}]})}

      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">有哪些厨具？</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${toolOpts.map(t => {
            const isSel = (d.availableTools||[]).includes(t);
            return `<span class="chip ${isSel?'selected':''}" style="padding:5px 12px;font-size:13px;border-radius:20px" onclick="ProfileForm._toggle('availableTools','${t}')">${t}</span>`;
          }).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
          ${customTools.map(t => `<span class="tag tag-accent" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:12px;border-radius:20px">🫕 ${t}<span onclick="ProfileForm._removeArr('availableTools','${t}')" style="cursor:pointer;opacity:0.6;margin-left:2px">×</span></span>`).join('')}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <input type="text" class="form-input" id="ct-in" placeholder="自定义厨具，如：电饼铛" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addArr('availableTools','ct-in')">
          <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addArr('availableTools','ct-in')">+</button>
        </div>
      </div>
      ${this._field('perMealBudget', '每顿饭预算多少？', 'select', { options: [{v:10,l:'10元以内'},{v:20,l:'10-20元'},{v:30,l:'20-30元'},{v:50,l:'30元以上'}]})}
      ${this._nav(1)}
    `);
  },

  _s4() {
    const d = this._data;
    const tp = d.tasteProfile || {};
    this._frame('口味偏好', '你喜欢的口味', `
      ${this._range('spicy', '辣度', tp.spicy || 2)}
      ${this._range('sour', '酸度', tp.sour || 2)}
      ${this._range('sweet', '甜度', tp.sweet || 2)}
      ${this._range('salty', '咸度', tp.salty || 2)}
      ${this._range('oily', '油腻度', tp.oily || 2)}
      ${this._nav(2)}
    `);
  },

  _s5() {
    const modes = [
      { v: 'personal', l: '一个人吃', d: '一人份量，不浪费' },
      { v: 'family', l: '一家人吃', d: '照顾全家口味' },
      { v: 'mealprep', l: '备菜模式', d: '一次备好一周的菜' },
    ];
    this._frame('选择模式', '你想要哪种方式？', `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${modes.map(m => `
          <div class="chip ${this._data.mode === m.v ? 'selected' : ''}"
               onclick="ProfileForm._mode('${m.v}')"
               style="padding:14px 16px;border-radius:8px">
            <div class="ck"></div>
            <div style="flex:1">
              <div style="font-weight:600">${m.l}</div>
              <div style="font-size:13px;color:var(--text-soft)">${m.d}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ${this._nav(3)}
    `);
  },

  _mode(v) {
    this._data.mode = v;
    document.querySelectorAll('#main-content .chip').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      el.classList.toggle('selected', onclick.includes("'" + v + "'"));
    });
  },

  _toggle(name, val) {
    if (!this._data[name]) this._data[name] = [];
    const arr = this._data[name];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    this._show();
  },

  _addArr(name, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    const val = input.value.trim();
    if (!this._data[name]) this._data[name] = [];
    if (!this._data[name].includes(val)) this._data[name].push(val);
    input.value = '';
    this._show();
  },

  _removeArr(name, val) {
    if (!this._data[name]) return;
    this._data[name] = this._data[name].filter(r => r !== val);
    this._show();
  },

  _go(s) { this._step = s; this._show(); },

  _next() {
    const d = this._data;
    if (this._step === 0) {
      d.age = parseInt(document.getElementById('f-age')?.value) || 28;
      d.height = parseInt(document.getElementById('f-height')?.value) || 165;
      d.weight = parseInt(document.getElementById('f-weight')?.value) || 55;
      d.activityLevel = parseInt(document.getElementById('f-activityLevel')?.value) || 2;
    } else if (this._step === 3) {
      d.cookTimeBudget = parseInt(document.getElementById('f-cookTimeBudget')?.value) || 30;
      d.perMealBudget = parseInt(document.getElementById('f-perMealBudget')?.value) || 20;
      const tp = d.tasteProfile || {};
      ['spicy', 'sour', 'sweet', 'salty', 'oily'].forEach(k => {
        const el = document.getElementById('f-' + k);
        if (el) tp[k] = parseInt(el.value);
      });
      d.tasteProfile = tp;
    }

    if (this._step === 4) {
      d.updatedAt = new Date().toISOString();
      Store.setProfile(d);
      if (this._done) this._done(d);
      Helpers.toast('档案已保存 ✓');
      App.navigate('home');
      return;
    }
    this._step++;
    this._show();
  },
};

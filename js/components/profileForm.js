// ===== 饮食档案设置向导（科学版）=====
const ProfileForm = {
  _step: 0, _data: null, _done: null,

  start(existing, onComplete) {
    this._step = 0;
    this._done = onComplete;
    // 兼容旧数据：字符串转数组
    if (existing && typeof existing.cuisinePreference === 'string') {
      existing.cuisinePreference = [existing.cuisinePreference];
    }
    if (existing && !Array.isArray(existing.cuisinePreference)) {
      existing.cuisinePreference = ['家常'];
    }
    this._data = existing || {
      id: Helpers.uid(),
      age: 28, gender: 'female', height: 165, weight: 55, activityLevel: 2,
      sleepHours: 7, sleepQuality: 'good', stressLevel: 2,
      exerciseDays: 2, exerciseType: 'walking',
      eatOutFreq: 2, cookingSkill: 2,
      healthConditions: [], digestiveIssues: [],
      useSupplements: false, supplements: [],
      healthGoals: [], dietaryRestrictions: [],
      mealsToPlan: ['breakfast', 'dinner'], cookTimeBudget: 30,
      availableTools: ['炒锅', '电饭煲'], perMealBudget: 20,
      tasteProfile: { spicy: 2, sour: 2, sweet: 2, salty: 2, oily: 2 },
      cuisinePreference: ['家常'],
      cookDays: ['周一','周二','周三','周四','周五'],
      mode: 'personal',
      aiRequirements: '',
    };
    this._show();
  },

  _show() {
    const steps = [
      this._s1.bind(this), this._s2.bind(this), this._s3.bind(this),
      this._s4.bind(this), this._s5.bind(this), this._s6.bind(this),
      this._s7.bind(this),
    ];
    steps[this._step]();
  },

  _frame(title, sub, body) {
    const dots = Array.from({ length: 7 }, (_, i) =>
      `<div class="wizard-dot ${i < this._step ? 'done' : i === this._step ? 'active' : ''}"></div>`
    ).join('');
    const el = document.getElementById('main-content');
    el.innerHTML = `<div class="wizard"><div class="wizard-dots">${dots}</div><h2>${title}</h2><div class="sub">${sub}</div>${body}</div>`;
  },

  _field(name, label, type = 'text', opts = {}) {
    const v = this._data[name];
    if (type === 'select') {
      return `<div class="form-group"><label class="form-label">${label}</label><select class="form-select" id="f-${name}">${opts.options.map(o => `<option value="${o.v}" ${v === o.v ? 'selected' : ''}>${o.l}</option>`).join('')}</select></div>`;
    }
    if (type === 'number') {
      return `<div class="form-group"><label class="form-label" for="f-${name}">${label}</label><input type="number" class="form-input" id="f-${name}" value="${v || opts.default || ''}" ${opts.min ? `min="${opts.min}"` : ''} ${opts.max ? `max="${opts.max}"` : ''}></div>`;
    }
    return `<div class="form-group"><label class="form-label" for="f-${name}">${label}</label><input type="${type}" class="form-input" id="f-${name}" value="${v || ''}"></div>`;
  },

  _range(name, label, val, max = 5) {
    return `<div class="form-group"><label class="form-label">${label}</label><div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;color:var(--text-hint)">0</span>
      <input type="range" id="f-${name}" min="0" max="${max}" value="${val}" style="flex:1;accent-color:var(--accent);height:4px"
        oninput="document.getElementById('rv-${name}').textContent=this.value">
      <span id="rv-${name}" style="font-size:14px;font-weight:600;color:var(--accent);min-width:16px;text-align:center">${val}</span>
      <span style="font-size:12px;color:var(--text-hint)">${max}</span>
    </div></div>`;
  },

  _toggleArr(name, val) {
    if (!Array.isArray(this._data[name])) this._data[name] = [];
    const arr = this._data[name];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    this._show();
  },

  _toggleChip(name, val) {
    const raw = this._data[name];
    if (!Array.isArray(raw)) {
      // 字符串字段（如 cuisinePreference）直接替换
      this._data[name] = val;
    } else {
      const idx = raw.indexOf(val);
      if (idx >= 0) raw.splice(idx, 1); else raw.push(val);
    }
    this._show();
  },

  _addCustom(name, inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim()) return;
    const val = input.value.trim();
    if (!this._data[name]) this._data[name] = [];
    if (!this._data[name].includes(val)) this._data[name].push(val);
    input.value = '';
    this._show();
  },

  _delCustom(name, val) {
    if (!this._data[name]) return;
    this._data[name] = this._data[name].filter(r => r !== val);
    this._show();
  },

  _chipGroup(name, items, label) {
    const raw = this._data[name];
    const isArray = Array.isArray(raw);
    const selected = isArray ? raw : (raw ? [raw] : []);
    return `<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">${label}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${items.map(v => {
          const val = v.v || v;
          const isSel = selected.includes(val);
          const lbl = v.l || v;
          return `<span class="chip ${isSel?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleChip('${name}','${val}')">${lbl}</span>`;
        }).join('')}
      </div>
      ${isArray ? this._customTags(name) : ''}
    </div>`;
  },

  _customTags(name) {
    const predefined = ['balanced','weight_loss','muscle','blood_sugar','blood_pressure','save_money','save_time',
      'spicy','lamb','seafood','lactose','pork','家常','川菜','粤菜','湘菜','鲁菜','江浙','日式','西餐','东南亚'];
    const customs = (this._data[name]||[]).filter(r => !predefined.includes(r));
    if (!customs.length) return '';
    return `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
      ${customs.map(r => `<span class="tag tag-accent" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;font-size:11px;border-radius:12px">${r}<span onclick="ProfileForm._delCustom('${name}','${r}')" style="cursor:pointer;opacity:0.6;margin-left:2px">×</span></span>`).join('')}
    </div>`;
  },

  _nav(prev) {
    return `<div class="wizard-nav">${prev !== undefined ? `<button class="btn btn-outline" onclick="ProfileForm._go(${prev})">← 上一步</button>` : ''}<button class="btn btn-primary flex-1" onclick="ProfileForm._next()">${this._step === 6 ? '✅ 搞定' : '下一步 →'}</button></div>`;
  },

  _go(s) { this._step = s; this._show(); },

  _next() {
    const d = this._data;
    if (this._step === 0) {
      d.age = parseInt(document.getElementById('f-age')?.value) || 28;
      d.height = parseInt(document.getElementById('f-height')?.value) || 165;
      d.weight = parseInt(document.getElementById('f-weight')?.value) || 55;
      d.activityLevel = parseInt(document.getElementById('f-activityLevel')?.value) || 2;
    } else if (this._step === 1) {
      d.sleepHours = parseInt(document.getElementById('f-sleepHours')?.value) || 7;
      d.stressLevel = parseInt(document.getElementById('f-stressLevel')?.value) || 2;
      d.exerciseDays = parseInt(document.getElementById('f-exerciseDays')?.value) || 2;
      d.eatOutFreq = parseInt(document.getElementById('f-eatOutFreq')?.value) || 2;
      d.cookingSkill = parseInt(document.getElementById('f-cookingSkill')?.value) || 2;
    } else if (this._step === 2) {
      // 健康状况联动
      if ((d.healthConditions||[]).includes('gout')) {
        if (!d.dietaryRestrictions) d.dietaryRestrictions = [];
        ['不吃内脏','不吃海鲜','不喝浓汤'].forEach(r => { if (!d.dietaryRestrictions.includes(r)) d.dietaryRestrictions.push(r); });
      }
      if ((d.healthConditions||[]).includes('pregnancy')) {
        if (!d.dietaryRestrictions) d.dietaryRestrictions = [];
        ['不吃生食','少咖啡因'].forEach(r => { if (!d.dietaryRestrictions.includes(r)) d.dietaryRestrictions.push(r); });
      }
    } else if (this._step === 3) {
      const el = document.getElementById('f-aiReqs');
      if (el) d.aiRequirements = el.value.trim();
    } else if (this._step === 5) {
      d.cookTimeBudget = parseInt(document.getElementById('f-cookTimeBudget')?.value) || 30;
      d.perMealBudget = parseInt(document.getElementById('f-perMealBudget')?.value) || 20;
      const tp = d.tasteProfile || {};
      ['spicy','sour','sweet','salty','oily'].forEach(k => {
        const el = document.getElementById('f-' + k);
        if (el) tp[k] = parseInt(el.value);
      });
      d.tasteProfile = tp;
    }

    if (this._step === 6) {
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

  // ===== Step 1: 基础信息 =====
  _s1() {
    this._frame('基础信息', '让系统了解你的基本情况', `
      ${this._field('age','年龄','number',{default:28,min:10,max:120})}
      <div class="form-group"><label class="form-label">性别</label>
        <div style="display:flex;gap:8px">
          <span class="chip ${this._data.gender==='male'?'selected':''}" style="padding:6px 20px;border-radius:20px" onclick="ProfileForm._gender('male')">男</span>
          <span class="chip ${this._data.gender==='female'?'selected':''}" style="padding:6px 20px;border-radius:20px" onclick="ProfileForm._gender('female')">女</span>
        </div></div>
      ${this._field('height','身高(cm)','number',{default:165,min:100,max:220})}
      ${this._field('weight','体重(kg)','number',{default:55,min:20,max:300})}
      ${this._field('activityLevel','日常活动量','select',{options:[{v:1,l:'久坐（办公室，很少运动）'},{v:2,l:'轻度（每周运动1-2次）'},{v:3,l:'中度（每周运动3-5次）'},{v:4,l:'高度（体力工作/每天运动）'}]})}
      <div style="background:var(--accent-bg);border-radius:6px;padding:10px 14px;font-size:13px;color:var(--text-soft);margin-bottom:12px">
        根据以上信息，预估您每日能量需求约为 <strong style="color:var(--accent-dark)">${Math.round(Nutrition.calculateTDEE(Nutrition.calculateBMR(this._data.weight,this._data.height,this._data.age,this._data.gender),this._data.activityLevel))}</strong> kcal
      </div>
      ${this._nav()}
    `);
  },

  _gender(v) {
    this._data.gender = v;
    document.querySelectorAll('#main-content .chip').forEach(el => {
      el.classList.toggle('selected', el.textContent.trim() === (v==='male'?'男':'女'));
    });
  },

  // ===== Step 2: 生活方式（基于前沿研究） =====
  _s2() {
    this._frame('生活方式', '这些因素影响你的营养需求和饮食选择', `
      <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">研究表明，睡眠、压力、运动等生活方式因素显著影响营养代谢和饮食需求。</div>
      ${this._field('sleepHours','平均睡眠时间（小时/晚）','select',{options:[{v:5,l:'<5小时（严重不足）'},{v:6,l:'6小时（偏少）'},{v:7,l:'7小时（正常）'},{v:8,l:'8小时（充足）'},{v:9,l:'>9小时（偏多）'}]})}
      ${this._field('stressLevel','压力水平','select',{options:[{v:1,l:'很低'},{v:2,l:'一般'},{v:3,l:'中等'},{v:4,l:'较大'},{v:5,l:'很大'}]})}
      ${this._field('exerciseDays','每周运动天数','select',{options:[{v:0,l:'基本不运动'},{v:1,l:'1天'},{v:2,l:'2天'},{v:3,l:'3天'},{v:4,l:'4天'},{v:5,l:'5天+'}]})}
      ${this._field('eatOutFreq','每周在外就餐/外卖次数','select',{options:[{v:0,l:'基本在家做'},{v:1,l:'1-2次'},{v:3,l:'3-4次'},{v:5,l:'5-7次（每天）'},{v:8,l:'8次+（基本外食）'}]})}
      ${this._field('cookingSkill','你的烹饪水平','select',{options:[{v:1,l:'新手（只会煮面煎蛋）'},{v:2,l:'入门（会做简单家常菜）'},{v:3,l:'中等（能做一桌菜）'},{v:4,l:'熟练（复杂菜系）'},{v:5,l:'高手（专业水平）'}]})}
      ${this._nav(0)}
    `);
  },

  // ===== Step 3: 健康状况 =====
  _s3() {
    const healthOpts = [
      {v:'hypertension',l:'高血压'},{v:'diabetes',l:'糖尿病'},{v:'hyperlipidemia',l:'高血脂'},{v:'fatty_liver',l:'脂肪肝'},
      {v:'gastritis',l:'胃炎'},{v:'anemia',l:'贫血'},{v:'thyroid',l:'甲状腺问题'},{v:'kidney',l:'肾脏问题'},
    ];
    const digestOpts = [
      {v:'none',l:'无'},{v:'bloating',l:'容易胀气'},{v:'acid_reflux',l:'胃酸反流'},{v:'constipation',l:'便秘'},
      {v:'diarrhea',l:'容易腹泻'},{v:'ibs',l:'肠易激综合征(IBS)'},
    ];

    const hc = this._data.healthConditions || [];
    const di = this._data.digestiveIssues || [];
    const sup = this._data.supplements || [];

    this._frame('健康状况', '这些信息帮助系统推荐更适合你的饮食', `
      <div style="font-size:12px;color:var(--text-hint);margin-bottom:10px">2025-2026年研究表明，个性化营养方案需综合考虑健康状况、消化功能和营养素补充。</div>
      <div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">是否有以下健康问题？（可多选）</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${healthOpts.map(o =>
          `<span class="chip ${hc.includes(o.v)?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleArr('healthConditions','${o.v}')">${o.l}</span>`
        ).join('')}</div></div>
      <div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">消化系统情况（可多选）</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${digestOpts.map(o =>
          `<span class="chip ${di.includes(o.v)?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleArr('digestiveIssues','${o.v}')">${o.l}</span>`
        ).join('')}</div></div>
      <div style="margin-bottom:8px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">是否服用营养补充剂？</div>
        <div style="display:flex;gap:8px">
          <span class="chip ${this._data.useSupplements?'selected':''}" style="padding:4px 16px;border-radius:16px;font-size:13px" onclick="ProfileForm._toggleBoolean('useSupplements')">${this._data.useSupplements?'✅ 是':'否'}</span>
        </div>
      </div>
      ${this._data.useSupplements ? `
      <div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">服用哪些补充剂？</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${[
          {v:'multivitamin',l:'复合维生素'},{v:'vitaminD',l:'维生素D'},{v:'b12',l:'维生素B12'},
          {v:'iron',l:'铁剂'},{v:'calcium',l:'钙片'},{v:'omega3',l:'鱼油/Omega-3'},
          {v:'protein',l:'蛋白粉'},{v:'probiotic',l:'益生菌'},
        ].map(o =>
          `<span class="chip ${sup.includes(o.v)?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleArr('supplements','${o.v}')">${o.l}</span>`
        ).join('')}</div></div>` : ''}
      ${this._nav(1)}
    `);
  },

  _toggleBoolean(name) {
    this._data[name] = !this._data[name];
    this._show();
  },

  // ===== Step 4: 饮食目标与偏好 =====
  _s4() {
    const goals = [{v:'balanced',l:'吃得均衡'},{v:'weight_loss',l:'减减肥'},{v:'muscle',l:'增肌'},{v:'blood_sugar',l:'控糖'},{v:'blood_pressure',l:'控盐降血压'},{v:'save_money',l:'省点钱'},{v:'save_time',l:'省时间'}];
    const rests = [{v:'spicy',l:'不吃辣'},{v:'lamb',l:'不吃羊肉'},{v:'seafood',l:'海鲜过敏'},{v:'lactose',l:'乳糖不耐'},{v:'pork',l:'不吃猪肉'}];
    const cuisines = [{v:'家常',l:'家常菜'},{v:'川菜',l:'川菜'},{v:'粤菜',l:'粤菜'},{v:'湘菜',l:'湘菜'},{v:'鲁菜',l:'鲁菜'},{v:'江浙',l:'江浙菜'},{v:'日式',l:'日式'},{v:'西餐',l:'西餐'},{v:'东南亚',l:'东南亚'}];

    this._frame('饮食目标与偏好', '', `
      ${this._chipGroup('healthGoals', goals, '你的饮食目标（可多选）')}
      <div style="display:flex;gap:4px;margin-bottom:12px">
        <input type="text" class="form-input" id="cg-in" placeholder="自定义目标，如：养胃" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addCustom('healthGoals','cg-in')">
        <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addCustom('healthGoals','cg-in')">+</button>
      </div>
      ${this._chipGroup('dietaryRestrictions', rests, '有什么不吃的吗？（可多选）')}
      <div style="display:flex;gap:4px;margin-bottom:12px">
        <input type="text" class="form-input" id="cr-in" placeholder="自定义忌口，如：不吃芹菜" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addCustom('dietaryRestrictions','cr-in')">
        <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addCustom('dietaryRestrictions','cr-in')">+</button>
      </div>
      ${this._chipGroup('cuisinePreference', cuisines, '你喜欢的菜系风格（可多选）')}

      <div style="margin-bottom:10px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">💬 给AI的额外需求（可选）</div>
        <textarea class="form-input" id="f-aiReqs" rows="2" style="resize:vertical;font-size:13px;padding:8px 10px" placeholder="例：最近在增肌，希望高蛋白低脂。胃不太好，不要辛辣刺激的。">${this._data.aiRequirements || ''}</textarea>
      </div>

      <div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">过敏源（可多选）</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${['花生','海鲜','牛奶','鸡蛋','大豆','小麦/麸质'].map(a => {
            const isSel = (this._data.allergies||[]).includes(a);
            return `<span class="chip ${isSel?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleArr('allergies','${a}')">${a}</span>`;
          }).join('')}
        </div>
      </div>
      ${this._nav(2)}
    `);
  },

  // ===== Step 5: 做饭条件 =====
  _s5() {
    const meals = [{v:'breakfast',l:'早餐'},{v:'lunch',l:'午餐'},{v:'dinner',l:'晚餐'}];
    const toolOpts = ['炒锅','电饭煲','微波炉','蒸锅','烤箱','空气炸锅','高压锅','汤锅','煎锅','煮锅','砂锅','烤盘','料理机'];

    this._frame('做饭条件', '你平时做饭的环境', `
      ${this._chipGroup('mealsToPlan', meals, '一般做哪几餐？')}
      ${this._field('cookTimeBudget','晚餐一般有多长时间？','select',{options:[{v:15,l:'15分钟以内'},{v:30,l:'15-30分钟'},{v:45,l:'30-45分钟'},{v:60,l:'45分钟以上'}]})}
      <div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">有哪些厨具？</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${toolOpts.map(t => {
            const isSel = (this._data.availableTools||[]).includes(t);
            return `<span class="chip ${isSel?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleChip('availableTools','${t}')">${t}</span>`;
          }).join('')}
        </div>
        ${this._customTags('availableTools')}
        <div style="display:flex;gap:4px;margin-top:4px">
          <input type="text" class="form-input" id="ct-in" placeholder="自定义厨具" style="flex:1;font-size:13px;padding:6px 10px" onkeydown="if(event.key==='Enter')ProfileForm._addCustom('availableTools','ct-in')">
          <button class="btn btn-soft btn-sm" style="padding:4px 10px" onclick="ProfileForm._addCustom('availableTools','ct-in')">+</button>
        </div>
      </div>
      ${this._field('perMealBudget','每顿饭预算','select',{options:[{v:10,l:'10元以内'},{v:20,l:'10-20元'},{v:30,l:'20-30元'},{v:50,l:'30元以上'}]})}
      <div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">每周哪几天做饭？</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${['周一','周二','周三','周四','周五','周六','周日'].map(d => {
            const isSel = (this._data.cookDays||[]).includes(d);
            return `<span class="chip ${isSel?'selected':''}" style="padding:4px 12px;font-size:12px;border-radius:16px" onclick="ProfileForm._toggleArr('cookDays','${d}')">${d}</span>`;
          }).join('')}
        </div>
      </div>
      ${this._nav(3)}
    `);
  },

  // ===== Step 6: 口味偏好 =====
  _s6() {
    const tp = this._data.tasteProfile || {};
    this._frame('口味偏好', '你喜欢的口味强度', `
      <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">0=完全不喜欢，5=非常喜欢</div>
      ${this._range('spicy','🌶️ 辣度', tp.spicy||2)}
      ${this._range('sour','🍋 酸度', tp.sour||2)}
      ${this._range('sweet','🍬 甜度', tp.sweet||2)}
      ${this._range('salty','🧂 咸度', tp.salty||2)}
      ${this._range('oily','🫕 油腻度', tp.oily||2)}
      ${this._nav(4)}
    `);
  },

  // ===== Step 7: 模式选择 =====
  _s7() {
    const modes = [{v:'personal',l:'一个人吃',d:'一人份量，不浪费'},{v:'family',l:'一家人吃',d:'照顾全家口味'},{v:'mealprep',l:'备菜模式',d:'一次备好一周的菜'}];
    this._frame('选择模式', '你想要哪种方式？', `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${modes.map(m => `
          <div class="chip ${this._data.mode===m.v?'selected':''}"
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
      ${this._nav(5)}
    `);
  },

  _mode(v) {
    this._data.mode = v;
    document.querySelectorAll('#main-content .chip').forEach(el => {
      el.classList.toggle('selected', el.getAttribute('onclick')?.includes("'"+v+"'"));
    });
  },

  // ===== 完成 =====
};

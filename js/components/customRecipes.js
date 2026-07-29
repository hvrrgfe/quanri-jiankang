// ===== 自定义菜谱管理 =====
const CustomRecipes = {
  _editing: null,

  show() {
    const list = this._getAll();
    const el = document.getElementById('main-content');
    el.innerHTML = Icons.replace(`
      <div class="flex-between" style="margin-bottom:12px">
        <div class="page-hdr" style="margin-bottom:0">
          <h2>📝 自定义菜谱</h2>
          <p>录入你家常做的菜</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="CustomRecipes._add()">+ 新增</button>
      </div>

      ${list.length ? `
        <div style="display:flex;flex-direction:column;gap:6px">
          ${list.map((r, i) => `
            <div class="meal-card" style="margin-bottom:0">
              <div class="flex-between">
                <div>
                  <div style="font-weight:600;font-size:14px">${r.name}</div>
                  <div style="font-size:12px;color:var(--text-soft)">
                    ⏱${r.cookTime}min · ${r.mealType === 'breakfast' ? '早餐' : r.mealType === 'lunch' ? '午餐' : '晚餐'} · ${(r.ingredients||[]).length}种食材
                  </div>
                </div>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-soft btn-sm" onclick="CustomRecipes._edit(${i})">编辑</button>
                  <button class="btn btn-outline btn-sm" onclick="CustomRecipes._del(${i})">×</button>
                </div>
              </div>
              <div style="font-size:12px;color:var(--text-hint);margin-top:4px">${(r.ingredients||[]).map(i=>i.name).join('、')}</div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty" style="padding:32px 20px">
          <span>📝</span>
          <h3>还没有自定义菜谱</h3>
          <p>把你拿手菜录进去，以后生成菜单会用到</p>
          <button class="btn btn-primary" onclick="CustomRecipes._add()">+ 新增菜谱</button>
        </div>
      `}
    `);
  },

  _getAll() {
    return Store.get('customRecipes', []);
  },

  _saveAll(list) {
    Store.set('customRecipes', list);
  },

  _add() {
    this._editing = { name: '', mealType: 'dinner', cookTime: 20, ingredients: [], steps: ['', '', ''], tags: [] };
    this._form('新增菜谱');
  },

  _edit(idx) {
    const list = this._getAll();
    this._editing = { ...list[idx], _idx: idx };
    this._form('编辑菜谱');
  },

  _del(idx) {
    if (!confirm('确定删除？')) return;
    const list = this._getAll();
    list.splice(idx, 1);
    this._saveAll(list);
    this.show();
  },

  _form(title) {
    const d = this._editing || { name:'', mealType:'dinner', cookTime:20, ingredients:[], steps:['','',''], tags:[] };
    const ingsText = (d.ingredients||[]).map(i => `${i.name}:${i.amount||100}g`).join('\n');
    const stepsText = (d.steps||[]).filter(s=>s).join('\n');

    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:600;margin-bottom:16px">${title}</h3>
      <div class="form-group">
        <label class="form-label">菜名</label>
        <input type="text" class="form-input" id="cr-name" value="${d.name}">
      </div>
      <div class="form-group">
        <label class="form-label">类型</label>
        <select class="form-select" id="cr-type">
          <option value="breakfast" ${d.mealType==='breakfast'?'selected':''}>早餐</option>
          <option value="lunch" ${d.mealType==='lunch'?'selected':''}>午餐</option>
          <option value="dinner" ${d.mealType==='dinner'?'selected':''}>晚餐</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">时间（分钟）</label>
        <input type="number" class="form-input" id="cr-time" value="${d.cookTime||20}">
      </div>
      <div class="form-group">
        <label class="form-label">食材（每行一个，格式：名称:克数）</label>
        <textarea class="form-input" id="cr-ingredients" rows="4" style="resize:vertical">${ingsText}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">步骤（每行一步）</label>
        <textarea class="form-input" id="cr-steps" rows="4" style="resize:vertical">${stepsText}</textarea>
      </div>
      <button class="btn btn-primary btn-block" onclick="CustomRecipes._save()">保存</button>
      <div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">取消</button></div>
    `);
  },

  _save() {
    const name = document.getElementById('cr-name')?.value.trim();
    if (!name) return Helpers.toast('请输入菜名');

    const recipe = {
      id: 'custom_' + Date.now(),
      name,
      mealType: document.getElementById('cr-type')?.value || 'dinner',
      cookTime: parseInt(document.getElementById('cr-time')?.value) || 20,
      ingredients: (document.getElementById('cr-ingredients')?.value || '')
        .split('\n').filter(s => s.trim())
        .map(line => {
          const parts = line.split(':');
          const n = parts[0].trim();
          const amt = parseInt(parts[1]) || 100;
          const cat = n.includes('蛋') ? 'egg' : n.includes('奶') ? 'dairy' : n.includes('豆腐') ? 'tofu' : ['猪肉','牛肉','羊肉','肉','鸡'].some(x=>n.includes(x)) ? 'meat' : ['鱼','虾','蟹'].some(x=>n.includes(x)) ? 'seafood' : ['米','面','包','饺','馄饨','麦','豆'].some(x=>n.includes(x)) ? 'grain' : ['菜','瓜','萝卜','椒','葱','蒜','姜'].some(x=>n.includes(x)) ? 'vegetable' : 'condiment';
          return { name: n, category: cat, amount: amt, unit: 'g' };
        }),
      steps: (document.getElementById('cr-steps')?.value || '')
        .split('\n').filter(s => s.trim()),
      tags: [],
      nutrition: { calories: 0, protein: 0, fat: 0, carb: 0 },
      taste: { spicy:0, sour:0, sweet:0, salty:0, oily:0 },
      costPerServing: 0,
      tools: [],
    };

    const list = this._getAll();
    if (this._editing?._idx != null) {
      list[this._editing._idx] = recipe;
    } else {
      list.push(recipe);
    }
    this._saveAll(list);
    Helpers.closeModal();
    Helpers.toast('已保存 ✓');
    this.show();
  },
};

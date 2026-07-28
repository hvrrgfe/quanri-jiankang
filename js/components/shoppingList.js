// ===== 采购清单 =====
const ShoppingList = {
  _list: null,

  show() {
    const plan = Store.getWeeklyPlan();
    this._list = Store.getShoppingList();
    if (!this._list?.categories?.length && plan) {
      const profile = Store.getProfile();
      if (profile) {
        this._list = MealPlanner.generateShoppingList(plan, profile);
        Store.setShoppingList(this._list);
      }
    }
    // 实时重新计算价格（基于最新单价）
    if (this._list?.categories?.length) {
      this._recalcPrices();
    }
    this._render();
  },

  _recalcPrices() {
    const uprice = { vegetable:0.004, fruit:0.007, meat:0.03, seafood:0.06, egg:0.01, tofu:0.006, dairy:0.014, grain:0.01, condiment:0.03 };
    let total = 0;
    this._list.categories.forEach(c => {
      c.items.forEach(item => {
        if (item.category && uprice[item.category]) {
          item.estimatedPrice = Math.ceil((item.quantity || 100) * uprice[item.category]);
        }
        total += item.estimatedPrice || 0;
      });
    });
    this._list.totalEstimatedCost = total;
  },

  _render() {
    const el = document.getElementById('main-content');
    if (!this._list?.categories?.length) {
      el.innerHTML = `
        <div class="empty">
          <span>🛒</span>
          <h3>还没有采购清单</h3>
          <p>先安排一周的菜单，自动生成清单</p>
          <button class="btn btn-primary" onclick="App.navigate('plan')">去安排菜单 →</button>
        </div>
      `;
      return;
    }

    const total = this._list.categories.reduce((s, c) => s + c.items.length, 0);
    const done = this._list.categories.reduce((s, c) => s + c.items.filter(i => i.isPurchased).length, 0);

    el.innerHTML = `
      <div class="shop-hdr">
        <div>
          <h2>🛒 采购清单</h2>
          <div class="shop-total">${total}项 · 已买${done}项 · <strong>一共约 ¥${this._list.totalEstimatedCost}</strong></div>
        </div>
        <button class="btn btn-soft btn-sm" onclick="ShoppingList._checkAll()">☑ 全勾</button>
      </div>

      ${this._list.categories.map(c => `
        <div class="shop-ctg">
          <div class="shop-ctg-title">
            ${c.name}
            <span class="count">${c.items.filter(i => i.isPurchased).length}/${c.items.length}</span>
          </div>
          ${c.items.map(item => `
            <div class="shop-item ${item.isPurchased ? 'done' : ''}"
                 onclick="ShoppingList._toggle('${c.name}','${item.name}')">
              <div class="shop-check"></div>
              <span class="shop-name">${item.name}</span>
              <span class="shop-qty">${item.displayQty || item.quantity + (item.unit || 'g')}</span>
              <span class="shop-price">¥${item.estimatedPrice || '?'}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    `;
  },

  _toggle(catName, itemName) {
    const cat = this._list.categories.find(c => c.name === catName);
    if (!cat) return;
    const item = cat.items.find(i => i.name === itemName);
    if (!item) return;
    item.isPurchased = !item.isPurchased;
    Store.setShoppingList(this._list);
    this._render();
  },

  _checkAll() {
    this._list.categories.forEach(c => c.items.forEach(i => { i.isPurchased = true; }));
    Store.setShoppingList(this._list);
    this._render();
    Helpers.toast('全部已勾 ✓');
  },
};

// ===== 采购清单 =====
const ShoppingList = {
  _list: null,

  show() {
    const isEn = I18n.getLang() === 'en';
    const plan = Store.getWeeklyPlan();
    this._list = Store.getShoppingList();
    if (!this._list?.categories?.length && plan) {
      const profile = Store.getProfile();
      if (profile) {
        this._list = MealPlanner.generateShoppingList(plan, profile);
        Store.setShoppingList(this._list);
      }
    }
    if (this._list?.categories?.length) {
      this._recalcPrices();
    }
    this._render();
  },

  _recalcPrices() {
    let total = 0;
    this._list.categories.forEach(c => {
      c.items.forEach(item => {
        item.estimatedPrice = Math.ceil((item.quantity || 100) * PriceDB.getPrice(item.name, item.category));
        total += item.estimatedPrice || 0;
      });
    });
    this._list.totalEstimatedCost = total;
  },

  _render() {
    const isEn = I18n.getLang() === 'en';
    this._recalcPrices();
    const el = document.getElementById('main-content');
    if (!this._list?.categories?.length) {
      el.innerHTML = `
        <div class="empty">
          <h3>${isEn ? 'No shopping list yet' : '还没有采购清单'}</h3>
          <p>${isEn ? 'Generate a weekly meal plan first' : '先安排一周的菜单，自动生成清单'}</p>
          <button class="btn btn-primary" onclick="App.navigate('plan')">${isEn ? 'Go to Meal Plan →' : '去安排菜单 →'}</button>
        </div>
      `;
      return;
    }

    const total = this._list.categories.reduce((s, c) => s + c.items.length, 0);
    const done = this._list.categories.reduce((s, c) => s + c.items.filter(i => i.isPurchased).length, 0);
    const remaining = this._list.categories.reduce((s, c) => s + c.items.filter(i => !i.isPurchased).reduce((ss, i) => ss + (i.estimatedPrice || 0), 0), 0);

    el.innerHTML = `
      <div class="shop-hdr">
        <div>
          <h2>${__('diet.shopping')}</h2>
          <div class="shop-total">${total}${isEn ? ' items' : '项'} · ${isEn ? 'bought ' : '已买'}${done}${isEn ? '' : '项'} · ${isEn ? 'total ~¥' : '总共约 '}<strong>¥${this._list.totalEstimatedCost}</strong>${done < total ? ` · ${isEn ? 'remaining ~¥' : '还需约 '}<strong>¥${remaining}</strong>` : (isEn ? ' · All bought!' : '  买齐了')}</div>
        </div>
        <button class="btn btn-soft btn-sm" onclick="ShoppingList._toggleCheckAll()">${done === total ? (isEn ? '☐ Uncheck all' : '☐ 取消全勾') : (isEn ? '☑ Check all' : '☑ 全勾')}</button>
      </div>

      ${this._list.categories.map(c => `
        <div class="shop-ctg">
          <div class="shop-ctg-title">
            ${this._catName(c.name, isEn)}
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

  _catName(key, isEn) {
    if (!isEn) return key;
    const map = { '🥬 蔬菜类':'Vegetables', '🍎 水果类':'Fruits', '🥩 肉禽蛋类':'Meat & Poultry',
      '🐟 水产类':'Seafood', '🥚 蛋类':'Eggs', '🧈 豆制品类':'Tofu & Soy',
      '🥛 乳制品类':'Dairy', '🍚 主食类':'Grains', '🧂 调料类':'Seasonings', '📦 其他':'Other' };
    return map[key] || key;
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

  _toggleCheckAll() {
    const isEn = I18n.getLang() === 'en';
    const total = this._list.categories.reduce((s, c) => s + c.items.length, 0);
    const done = this._list.categories.reduce((s, c) => s + c.items.filter(i => i.isPurchased).length, 0);
    const allChecked = done === total;
    this._list.categories.forEach(c => c.items.forEach(i => { i.isPurchased = !allChecked; }));
    Store.setShoppingList(this._list);
    this._render();
    Helpers.toast(allChecked ? (isEn ? 'All unchecked' : '已取消全勾') : (isEn ? 'All checked ✓' : '全部已勾 ✓'));
  },
};

// ===== 烹饪卡片（弹窗）=====
const RecipeCard = {
  show(dayIdx, mealType) {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.[dayIdx]) return;
    const meal = plan.days[dayIdx].meals[mealType];
    if (!meal) return;

    const icons = { breakfast: '🍳', lunch: '🥗', dinner: '🍲', snack: '🍿' };
    const labels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
    const ingredients = meal.ingredients || [];
    const steps = meal.steps || [];

    const html = `
      <div class="recipe-body">
        <div style="font-size:13px;color:var(--text-hint);margin-bottom:2px">${icons[mealType] || '🍽️'} ${labels[mealType] || mealType}</div>
        <div class="recipe-name">${meal.name}</div>

        <div class="recipe-meta">
          <span>⏱ ${meal.cookTime || '?'}分钟</span>
          ${meal.costPerServing ? `<span>💰 ¥${meal.costPerServing}</span>` : ''}
          ${meal.nutrition?.calories ? `<span>🔥 ${meal.nutrition.calories}kcal</span>` : ''}
          ${(meal.tags || []).length ? `<span>🏷️ ${meal.tags.slice(0,2).join('·')}</span>` : ''}
        </div>

        <div class="recipe-section">
          <h4>🥩 食材</h4>
          ${ingredients.map(ing => `
            <div class="recipe-ingr">
              <span>${ing.name || ing}</span>
              <span style="color:var(--text-hint)">${ing.amount || ''}${ing.unit || 'g'}</span>
            </div>
          `).join('')}
        </div>

        <div class="recipe-section">
          <h4>📝 做法</h4>
          ${steps.map((step, i) => `
            <div class="recipe-step">
              <span class="n">${i + 1}</span>
              <span>${step}</span>
            </div>
          `).join('')}
        </div>

        ${meal.tip ? `<div class="recipe-tip">💡 ${meal.tip}</div>` : ''}

        <div class="recipe-feedback">
          <p>这顿饭怎么样？</p>
          <div class="fb-btns">
            <button class="fb-btn" onclick="RecipeCard._fb('good')">😋 好吃</button>
            <button class="fb-btn" onclick="RecipeCard._fb('ok')">😐 还行</button>
            <button class="fb-btn" onclick="RecipeCard._fb('bad')">😣 翻车了</button>
          </div>
        </div>

        <div style="text-align:center;margin-top:12px">
          <button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button>
        </div>
      </div>
    `;

    Helpers.openModal(html);
  },

  _fb(rating) {
    const map = { good: '好吃', ok: '还行', bad: '翻车了' };
    Store.addFeedback({ rating, timestamp: Date.now() });
    Helpers.toast('已记录，谢谢反馈 🙏');
    document.querySelectorAll('.fb-btn').forEach((btn, i) => {
      btn.className = 'fb-btn';
      const r = ['good', 'ok', 'bad'][i];
      if (r === rating) btn.classList.add('selected-' + r);
    });
  },
};

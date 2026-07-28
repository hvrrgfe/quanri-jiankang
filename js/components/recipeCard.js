// ===== 烹饪卡片 + 反馈系统 =====
const RecipeCard = {
  show(dayIdx, mealType) {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.[dayIdx]) return;
    const meal = plan.days[dayIdx].meals[mealType];
    if (!meal) return;
    this._meal = meal;
    this._dayIdx = dayIdx;
    this._mealType = mealType;

    const icons = { breakfast:'🍳', lunch:'🥗', dinner:'🍲', snack:'🍿' };
    const labels = { breakfast:'早餐', lunch:'午餐', dinner:'晚餐', snack:'加餐' };
    const ingredients = meal.ingredients || [];
    const steps = meal.steps || [];
    const pastFB = Store.getFeedback().filter(f => f.recipeName === meal.name);
    const lastRating = pastFB.length ? pastFB[pastFB.length - 1].rating : null;

    Helpers.openModal(`
      <div class="recipe-body">
        <div style="font-size:13px;color:var(--text-hint)">${icons[mealType]||'🍽️'} ${labels[mealType]||mealType}</div>
        <div class="recipe-name">${meal.name}</div>

        <div class="recipe-meta">
          <span>⏱ ${meal.cookTime||'?'}分钟</span>
          ${meal.costPerServing ? `<span>💰 ¥${meal.costPerServing}</span>` : ''}
          ${meal.nutrition?.calories ? `<span>🔥 ${meal.nutrition.calories}kcal</span>` : ''}
        </div>

        <div class="recipe-section">
          <h4>🥩 食材</h4>
          ${ingredients.map(ing =>
            `<div class="recipe-ingr"><span>${ing.name||ing}</span><span style="color:var(--text-hint)">${ing.amount||''}${ing.unit||'g'}</span></div>`
          ).join('')}
        </div>

        <div class="recipe-section">
          <h4>📝 做法</h4>
          ${steps.map((s,i) =>
            `<div class="recipe-step"><span class="n">${i+1}</span><span>${s}</span></div>`
          ).join('')}
        </div>

        <!-- 反馈区域 -->
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line-light)">
          <div style="font-size:14px;font-weight:600;margin-bottom:8px">这顿饭怎么样？</div>

          <!-- 主评价 -->
          <div class="fb-btns" style="display:flex;gap:6px;margin-bottom:10px">
            ${['good','ok','bad'].map(r => {
              const labels = { good:'😋 好吃', ok:'😐 还行', bad:'😣 不好吃' };
              const selClass = lastRating === r ? 'selected-' + r : '';
              return `<button class="fb-btn ${selClass}" onclick="RecipeCard._rate('${r}')">${labels[r]}</button>`;
            }).join('')}
          </div>

          <!-- 具体原因（展开） -->
          <div id="fb-detail" style="${lastRating ? '' : 'display:none'};margin-bottom:8px">
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:6px">具体原因（可多选）：</div>
            <div id="fb-reasons" style="display:flex;flex-wrap:wrap;gap:4px">
              ${['太辣了','太咸了','太油了','太淡了','步骤太多','时间太久','食材难买','不好吃','份量太少','份量太多'].map(r =>
                `<span class="chip" style="padding:4px 10px;font-size:12px" onclick="RecipeCard._toggleReason(this)">${r}</span>`
              ).join('')}
            </div>
          </div>

          <!-- 如果已评过分 -->
          ${lastRating ? `<div style="font-size:12px;color:var(--text-hint)">✅ 你之前评过：${lastRating === 'good' ? '好吃' : lastRating === 'ok' ? '还行' : '不好吃'}</div>` : ''}

          <div style="font-size:11px;color:var(--text-hint);margin-top:6px">
            💡 反馈越多，推荐越准
          </div>
        </div>

        <div style="text-align:center;margin-top:12px">
          <button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button>
        </div>
      </div>
    `);
  },

  _rate(rating) {
    const reasons = [];
    document.querySelectorAll('#fb-reasons .chip.selected').forEach(el => reasons.push(el.textContent));

    Store.addFeedback({
      recipeName: this._meal?.name || '',
      rating,
      reasons,
      dayIdx: this._dayIdx,
      mealType: this._mealType,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    });

    // 高亮
    document.querySelectorAll('.fb-btn').forEach((btn, i) => {
      btn.className = 'fb-btn';
      const r = ['good','ok','bad'][i];
      if (r === rating) btn.classList.add('selected-' + r);
    });

    // 展开详细原因
    const detail = document.getElementById('fb-detail');
    if (detail) detail.style.display = 'block';

    Helpers.toast('已记录你的反馈，谢谢！');
  },

  _toggleReason(el) {
    el.classList.toggle('selected');
  },
};

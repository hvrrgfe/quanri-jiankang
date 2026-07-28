// ===== 周计划生成器 =====
// 有 API Key 时用大模型生成，否则用本地引擎
const MealPlanner = {
  async generateWeeklyPlan(profile) {
    const apiKey = Store.getApiKey();
    if (apiKey) {
      try {
        return await this._generateWithLLM(profile, apiKey);
      } catch (err) {
        console.warn('LLM fail, fallback to local:', err.message);
        return this._generateLocally(profile);
      }
    }
    return this._generateLocally(profile);
  },

  // ---- LLM ----
  async _generateWithLLM(profile, apiKey) {
    const systemPrompt = DietEngine.buildDietSystemPrompt(profile);
    const weekStart = Helpers.getWeekStart();
    const prompt = `请为用户生成${Helpers.formatDate(weekStart, 'YYYY年MM月DD日')}到${Helpers.formatDate(new Date(weekStart.getTime()+6*86400000),'MM月DD日')}的每日三餐菜单，严格JSON格式。`;
    return await Helpers.callLLM(systemPrompt, prompt, apiKey);
  },

  // ---- 本地引擎 ----
  _generateLocally(profile) {
    const weekStart = Helpers.getWeekStart();
    const weekDays = Helpers.getWeekDays(weekStart);
    const days = weekDays.map((date, idx) => {
      const meals = {};
      (profile.mealsToPlan || ['breakfast', 'dinner']).forEach(mt => {
        meals[mt] = this._pickMeal(mt, idx);
      });
      return {
        date: Helpers.formatDate(date, 'YYYY-MM-DD'),
        dayOfWeek: Helpers.weekDay(date),
        meals,
        ingredientCount: 0,
        totalCookTime: Object.values(meals).reduce((s, m) => s + (m.cookTime || 0), 0),
      };
    });
    return { days, weeklyStats: { totalIngredientTypes: 0, notes: '' } };
  },

  _pickMeal(type, dayIdx) {
    const pools = {
      breakfast: [
        { n: '小米粥+煮鸡蛋+拌黄瓜', t: 15, g: ['小米','鸡蛋','黄瓜'] },
        { n: '燕麦牛奶+香蕉', t: 5, g: ['燕麦','牛奶','香蕉'] },
        { n: '番茄鸡蛋面', t: 12, g: ['番茄','鸡蛋','挂面'] },
        { n: '全麦三明治+牛奶', t: 8, g: ['全麦面包','鸡蛋','生菜','牛奶'] },
        { n: '杂粮粥+煎蛋', t: 20, g: ['杂粮','鸡蛋'] },
      ],
      lunch: [
        { n: '青椒肉丝+米饭', t: 20, g: ['青椒','猪里脊','大米'] },
        { n: '番茄炒蛋+米饭', t: 15, g: ['番茄','鸡蛋','大米'] },
        { n: '宫保鸡丁+米饭', t: 25, g: ['鸡胸肉','花生','黄瓜','大米'] },
        { n: '土豆炖鸡块+米饭', t: 30, g: ['鸡腿','土豆','青椒','大米'] },
        { n: '麻婆豆腐+米饭', t: 15, g: ['豆腐','猪肉末','大米'] },
      ],
      dinner: [
        { n: '番茄牛腩+蒜蓉西兰花+米饭', t: 50, g: ['牛腩','番茄','西兰花','大米'] },
        { n: '清蒸鲈鱼+蒜蓉油麦菜+米饭', t: 25, g: ['鲈鱼','油麦菜','大米'] },
        { n: '黄焖鸡+清炒时蔬+米饭', t: 35, g: ['鸡腿','香菇','青椒','大米'] },
        { n: '可乐鸡翅+凉拌黄瓜+米饭', t: 25, g: ['鸡翅','可乐','黄瓜','大米'] },
        { n: '红烧排骨+清炒时蔬+米饭', t: 45, g: ['排骨','土豆','青菜','大米'] },
      ],
    };
    const pool = pools[type] || pools.dinner;
    const m = pool[(dayIdx + (type==='breakfast'?0:type==='lunch'?50:100)) % pool.length];

    const cat = n => {
      if (['青椒','番茄','黄瓜','土豆','西兰花','油麦菜','青菜','胡萝卜','洋葱','香菇','木耳','生菜','白菜','菠菜','豆芽'].some(x=>n.includes(x))) return 'vegetable';
      if (['猪里脊','五花肉','牛腩','排骨','肉末','鸡腿','鸡胸肉','鸡翅'].some(x=>n.includes(x))) return 'meat';
      if (['鲈鱼','虾','带鱼','鲫鱼'].some(x=>n.includes(x))) return 'seafood';
      if (n.includes('鸡蛋')) return 'egg';
      if (['大米','小米','挂面','燕麦','全麦面包','面条','杂粮','馄饨','包子','豆浆','米饭'].includes(n)) return 'grain';
      if (['牛奶','酸奶'].includes(n)) return 'dairy';
      if (n==='豆腐') return 'tofu';
      return 'condiment';
    };

    return {
      name: m.n, cookTime: m.t,
      ingredients: m.g.map(n => ({ name: n, category: cat(n), amount: 100 })),
      steps: ['准备食材洗净切好', '按照菜谱步骤烹饪', '装盘上桌'],
    };
  },

  // ---- 替换菜品 ----
  async replaceMeal(plan, dayIdx, mealType, profile) {
    const apiKey = Store.getApiKey();
    if (apiKey) {
      try {
        const prompt = `替换第${dayIdx+1}天${mealType}。当前: ${plan.days[dayIdx].meals[mealType].name}。推荐3道替代菜JSON。`;
        const result = await Helpers.callLLM(DietEngine.buildDietSystemPrompt(profile), prompt, apiKey);
        if (result?.alternatives?.[0]) {
          plan.days[dayIdx].meals[mealType].name = result.alternatives[0].name;
          return plan;
        }
      } catch (e) { console.warn('AI替换失败:', e); }
    }
    // 本地替换
    const fallbacks = { breakfast: ['燕麦牛奶+香蕉','番茄鸡蛋面','小米粥'], lunch: ['番茄炒蛋+米饭','蛋炒饭'], dinner: ['番茄牛腩+米饭','清蒸鲈鱼+米饭','麻婆豆腐+米饭'] };
    const opts = fallbacks[mealType] || ['鸡蛋面','炒饭'];
    plan.days[dayIdx].meals[mealType].name = opts[Math.floor(Math.random()*opts.length)] + '(替换)';
    return plan;
  },

  // ---- 购物清单 ----
  generateShoppingList(plan, profile) {
    if (!plan?.days) return { categories: [], totalEstimatedCost: 0 };
    const map = {};
    const cats = { vegetable:'🥬 蔬菜类', fruit:'🍎 水果类', meat:'🥩 肉禽蛋类', seafood:'🐟 水产类', egg:'🥚 蛋类', tofu:'🧈 豆制品类', dairy:'🥛 乳制品类', grain:'🍚 主食类', condiment:'🧂 调料类' };
    const uprice = { vegetable:0.03, fruit:0.05, meat:0.06, seafood:0.08, egg:0.02, tofu:0.03, dairy:0.015, grain:0.01, condiment:0.03 };

    plan.days.forEach(day => {
      ['breakfast','lunch','dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (!m) return;
        (m.ingredients || []).forEach(ing => {
          const k = ing.name;
          if (!map[k]) map[k] = { name:k, category:ing.category||'other', quantity:0, unit:'g', estimatedPrice:0, isPurchased:false, displayQty:'' };
          map[k].quantity += ing.amount || 100;
        });
      });
    });

    const groups = {};
    let total = 0;
    Object.values(map).forEach(item => {
      const cn = cats[item.category] || '📦 其他';
      if (!groups[cn]) groups[cn] = [];
      const up = uprice[item.category] || 0.03;
      item.estimatedPrice = Math.ceil(item.quantity * up);
      item.displayQty = item.quantity >= 1000 ? (item.quantity/1000).toFixed(1)+'kg' : item.quantity+'g';
      total += item.estimatedPrice;
      groups[cn].push(item);
    });

    return {
      categories: Object.entries(groups).map(([name, items]) => ({ name, items, count: items.length })),
      totalEstimatedCost: total,
    };
  },
};

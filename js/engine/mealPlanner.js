// ===== 周计划生成器 =====
// 策略：优先用 LLM（如果有 API Key），
// 降级到确定性规则引擎生成基础版
const MealPlanner = {
  // 生成一周菜单
  async generateWeeklyPlan(profile) {
    const apiKey = Store.getApiKey();

    if (apiKey) {
      try {
        return await this._generateWithLLM(profile, apiKey);
      } catch (err) {
        console.warn('LLM 生成失败，降级到本地引擎:', err.message);
        Helpers.toast('AI 生成失败，使用本地引擎');
        return this._generateLocally(profile);
      }
    }

    // 无 API Key，使用本地确定性引擎
    return this._generateLocally(profile);
  },

  // ---- LLM 方案 ----
  async _generateWithLLM(profile, apiKey) {
    const systemPrompt = DietEngine.buildDietSystemPrompt(profile);

    const userPrompt = `请为${profile.gender === 'male' ? '我' : '我'}生成下周（周一到周日）的完整每日三餐菜单。
${(profile.healthGoals || []).length ? '我的饮食目标是：' + (profile.healthGoals || []).join('、') : ''}
${(profile.dietaryRestrictions || []).length ? '我需要避免：' + (profile.dietaryRestrictions || []).join('、') : ''}

请严格按照JSON格式输出。`;

    // 获取本周一的日期
    const weekStart = Helpers.getWeekStart();
    // 将日期替换为用户实际的日期
    const promptWithDate = userPrompt.replace(
      /下周（周一到周日）/,
      `${Helpers.formatDate(weekStart, 'YYYY年MM月DD日')}（周一）到${Helpers.formatDate(new Date(weekStart.getTime() + 6 * 86400000), 'MM月DD日')}（周日）`
    );

    const plan = await Helpers.callLLM(systemPrompt, promptWithDate, apiKey);

    // 校验 LLM 返回的结果
    const validation = DietEngine.validatePlan(plan);
    if (!validation.passed) {
      console.warn('校验告警:', validation.errors, validation.warnings);
    }

    plan._meta = { source: 'llm', validated: validation, profileId: profile.id };
    return plan;
  },

  // ---- 本地确定性方案 ----
  _generateLocally(profile) {
    // 基于模板生成周计划
    const weekStart = Helpers.getWeekStart();
    const weekDays = Helpers.getWeekDays(weekStart);
    const mealConfig = this._getMealTemplate(profile);

    const days = weekDays.map((date, idx) => {
      const meals = {};
      (profile.mealsToPlan || ['breakfast', 'dinner']).forEach(mt => {
        meals[mt] = this._selectMeal(mealConfig, mt, idx);
      });
      return {
        date: Helpers.formatDate(date, 'YYYY-MM-DD'),
        dayOfWeek: Helpers.weekDay(date),
        meals,
        ingredientCount: 0,
        totalCookTime: Object.values(meals).reduce((s, m) => s + (m.cookTime || 0), 0),
      };
    });

    const plan = { days, weeklyStats: { totalIngredientTypes: 0, notes: '本地生成的基础菜单' } };
    plan._meta = { source: 'local', profileId: profile.id };
    return plan;
  },

  _getMealTemplate(profile) {
    // 基于用户条件适配
    const timeBudget = profile.cookTimeBudget || 30;
    const isQuick = timeBudget <= 15;
    const tools = profile.availableTools || [];

    return { isQuick, timeBudget, tools };
  },

  _selectMeal(template, mealType, dayIndex) {
    const breakfasts = [
      { name: '小米粥+煮鸡蛋+拌黄瓜', cookTime: 15, ingredients: ['小米', '鸡蛋', '黄瓜'], steps: ['小米淘洗下锅煮20分钟', '鸡蛋冷水下锅煮8分钟', '黄瓜拍碎加醋拌匀'] },
      { name: '燕麦牛奶+香蕉', cookTime: 5, ingredients: ['燕麦', '牛奶', '香蕉'], steps: ['燕麦用热牛奶冲泡', '香蕉切片加入'] },
      { name: '全麦三明治+牛奶', cookTime: 8, ingredients: ['全麦面包', '鸡蛋', '生菜', '火腿', '牛奶'], steps: ['鸡蛋煎熟', '面包夹入生菜鸡蛋火腿', '配一杯牛奶'] },
      { name: '番茄鸡蛋面', cookTime: 12, ingredients: ['番茄', '鸡蛋', '挂面', '青菜'], steps: ['番茄切块炒出汁', '加水煮开下面条', '打入蛋花加青菜'] },
      { name: '馄饨+紫菜虾皮汤', cookTime: 8, ingredients: ['速冻馄饨', '紫菜', '虾皮'], steps: ['水开下馄饨', '碗中放紫菜虾皮', '馄饨连汤倒入'] },
      { name: '杂粮粥+煎蛋', cookTime: 20, ingredients: ['杂粮', '鸡蛋'], steps: ['杂粮提前泡好煮粥', '煎一个荷包蛋'] },
      { name: '豆浆+包子', cookTime: 5, ingredients: ['豆浆', '包子'], steps: ['热豆浆', '包子蒸热'] },
    ];

    const lunches = [
      { name: '青椒肉丝+杂粮饭', cookTime: 20, ingredients: ['青椒', '猪里脊', '杂粮', '蒜'], steps: ['青椒切丝肉切丝', '肉丝用料酒生抽腌制', '热锅炒肉丝变色', '加青椒翻炒出锅'] },
      { name: '番茄炒蛋+白米饭', cookTime: 15, ingredients: ['番茄', '鸡蛋', '大米', '葱'], steps: ['番茄切块鸡蛋打散', '先炒鸡蛋盛出', '炒番茄出汁后加鸡蛋', '调味出锅配米饭'] },
      { name: '宫保鸡丁+白米饭', cookTime: 25, ingredients: ['鸡胸肉', '花生', '黄瓜', '胡萝卜', '大米'], steps: ['鸡丁用料酒淀粉腌制', '调宫保汁（醋糖生抽）', '炒鸡丁变色盛出', '炒蔬菜加鸡丁和酱汁'] },
      { name: '土豆炖鸡块+米饭', cookTime: 30, ingredients: ['鸡腿', '土豆', '青椒', '大米', '姜'], steps: ['鸡腿剁块焯水', '土豆切块', '炒鸡块加酱油', '加土豆炖20分钟收汁'] },
      { name: '红烧肉+米饭', cookTime: 45, ingredients: ['五花肉', '土豆', '葱姜', '大米'], steps: ['五花肉切块焯水', '炒糖色加肉翻炒', '加生抽老抽料酒', '加水炖40分钟收汁'] },
      { name: '鱼香肉丝+米饭', cookTime: 25, ingredients: ['猪里脊', '木耳', '胡萝卜', '青椒', '大米'], steps: ['肉丝腌制备用', '调鱼香汁', '炒肉丝盛出', '炒蔬菜加肉和酱汁'] },
      { name: '回锅肉+米饭', cookTime: 25, ingredients: ['五花肉', '蒜苗', '豆瓣酱', '大米'], steps: ['整块五花肉煮至八分熟切片', '下锅煸出油', '加豆瓣酱炒香', '加蒜苗翻炒出锅'] },
    ];

    const dinners = [
      { name: '番茄牛腩+蒜蓉西兰花+杂粮饭', cookTime: 50, ingredients: ['牛腩', '番茄', '西兰花', '洋葱', '杂粮'], steps: ['牛腩切块焯水', '番茄炒出汁加牛腩炖', '另起锅焯西兰花', '蒜蓉爆香淋在西兰花上'] },
      { name: '清蒸鲈鱼+蒜蓉油麦菜+米饭', cookTime: 25, ingredients: ['鲈鱼', '油麦菜', '大米', '姜', '葱'], steps: ['鲈鱼处理干净加姜葱蒸12分钟', '油麦菜蒜蓉爆炒', '鱼上淋蒸鱼豉油'] },
      { name: '黄焖鸡+清炒时蔬+米饭', cookTime: 35, ingredients: ['鸡腿', '香菇', '青椒', '土豆', '青菜', '大米'], steps: ['鸡腿切块焯水', '炒糖色加鸡块', '加香菇土豆炖20分钟', '加青椒收汁'] },
      { name: '可乐鸡翅+凉拌黄瓜+米饭', cookTime: 25, ingredients: ['鸡翅', '可乐', '黄瓜', '大米', '姜'], steps: ['鸡翅划刀焯水', '煎至两面金黄', '加可乐生抽炖15分钟', '拍黄瓜做凉菜'] },
      { name: '酸辣土豆丝+青椒肉丝+米饭', cookTime: 25, ingredients: ['土豆', '青椒', '猪里脊', '大米'], steps: ['土豆切丝泡水去淀粉', '肉丝腌制滑炒', '爆炒土豆丝加醋', '装盘上桌'] },
      { name: '蒜蓉粉丝蒸虾+清炒西兰花+米饭', cookTime: 20, ingredients: ['虾', '粉丝', '西兰花', '蒜', '大米'], steps: ['粉丝泡软铺盘底', '虾开背码在粉丝上', '蒜蓉酱淋在虾上蒸8分钟', '西兰花焯水摆盘'] },
      { name: '麻婆豆腐+小炒肉+米饭', cookTime: 25, ingredients: ['豆腐', '猪肉末', '青椒', '大米', '豆瓣酱'], steps: ['豆腐切块焯水', '炒肉末加豆瓣酱', '加豆腐煮5分钟', '勾芡撒花椒粉'] },
    ];

    // 周末改善型晚餐
    const weekendDinners = [
      { name: '自制小火锅', cookTime: 35, ingredients: ['火锅底料', '肥牛', '各种蔬菜', '豆腐', '粉丝'], steps: ['准备各种食材洗净切好', '烧开水加火锅底料', '边煮边吃'] },
      { name: '红烧排骨+清炒时蔬+米饭', cookTime: 45, ingredients: ['排骨', '土豆', '青菜', '大米', '姜'], steps: ['排骨焯水', '炒糖色加排骨', '加开水炖40分钟收汁', '炒一个青菜'] },
      { name: '咖喱鸡肉饭', cookTime: 25, ingredients: ['鸡腿', '土豆', '胡萝卜', '洋葱', '咖喱块', '大米'], steps: ['所有材料切块', '炒洋葱鸡块', '加蔬菜和水煮15分钟', '加咖喱块融化拌匀'] },
    ];

    let pool;
    const isWeekend = dayIndex >= 5;

    if (mealType === 'breakfast') {
      pool = breakfasts;
    } else if (mealType === 'lunch') {
      pool = lunches;
    } else {
      pool = isWeekend ? [...dinners, ...weekendDinners] : dinners;
    }

    // 基于 dayIndex 选择，确保一周不重样
    const meal = pool[dayIndex % pool.length];

    // 构建标准化的食材列表
    const ingredients = (meal.ingredients || []).map(name => {
      const cat = this._guessCategory(name);
      return { name, category: cat, amount: this._guessAmount(name, cat) };
    });

    return {
      name: meal.name,
      ingredients,
      cookTime: meal.cookTime,
      steps: meal.steps || [],
    };
  },

  _guessCategory(name) {
    const veg = ['青椒', '番茄', '黄瓜', '土豆', '西兰花', '油麦菜', '青菜', '胡萝卜',
      '洋葱', '蒜苗', '木耳', '香菇', '生菜', '冬瓜', '白菜', '菠菜', '豆芽', '藕', '茄子', '玉米'];
    const meat = ['猪里脊', '五花肉', '牛腩', '排骨', '肉末', '肥牛', '火腿', '培根', '猪蹄'];
    const chicken = ['鸡胸肉', '鸡腿', '鸡翅', '鸡块'];
    const seafood = ['鲈鱼', '虾', '带鱼', '鲫鱼'];
    const egg = ['鸡蛋'];
    const grain = ['大米', '杂粮', '小米', '挂面', '全麦面包', '燕麦', '面条', '米饭', '面粉', '包子', '馄饨'];
    const dairy = ['牛奶', '酸奶', '豆浆'];
    const tofu = ['豆腐', '豆制品'];
    const fruit = ['香蕉', '苹果'];

    if (veg.some(v => name.includes(v))) return 'vegetable';
    if (meat.some(m => name.includes(m))) return 'meat';
    if (chicken.some(c => name.includes(c))) return 'meat';
    if (seafood.some(s => name.includes(s))) return 'seafood';
    if (egg.some(e => name.includes(e))) return 'egg';
    if (grain.some(g => name.includes(g))) return 'grain';
    if (dairy.some(d => name.includes(d))) return 'dairy';
    if (tofu.some(t => name.includes(t))) return 'tofu';
    if (fruit.some(f => name.includes(f))) return 'fruit';
    return 'condiment';
  },

  _guessAmount(name, category) {
    const amounts = {
      grain: 100, vegetable: 150, meat: 100, seafood: 100,
      egg: 50, dairy: 200, tofu: 100, fruit: 100, condiment: 10,
    };
    return amounts[category] || 100;
  },

  // 生成购物清单
  generateShoppingList(plan, profile) {
    if (!plan?.days) return { categories: [], totalEstimatedCost: 0 };

    const ingredientMap = {};
    const categoryNames = {
      vegetable: '🥬 蔬菜类', fruit: '🍎 水果类', meat: '🥩 肉禽蛋类',
      seafood: '🐟 水产类', egg: '🥚 蛋类', tofu: '🧈 豆制品类',
      dairy: '🥛 乳制品类', condiment: '🧂 调料干货类', grain: '🍚 主食类',
    };

    plan.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner'].forEach(mt => {
        const meal = day.meals?.[mt];
        if (!meal) return;
        (meal.ingredients || []).forEach(ing => {
          const key = ing.name;
          if (!ingredientMap[key]) {
            ingredientMap[key] = {
              name: key,
              category: ing.category || 'other',
              quantity: 0,
              unit: this._getUnit(key, ing.category),
              estimatedPrice: 0,
              isPurchased: false,
              isOwned: false,
            };
          }
          ingredientMap[key].quantity += ing.amount || 100;
        });
      });
    });

    // 按分类聚合
    const categoryGroups = {};
    Object.entries(ingredientMap).forEach(([key, item]) => {
      const catName = categoryNames[item.category] || '📦 其他';
      if (!categoryGroups[catName]) categoryGroups[catName] = [];
      categoryGroups[catName].push(item);
    });

    // 粗略估价
    let totalCost = 0;
    Object.values(categoryGroups).forEach(items => {
      items.forEach(item => {
        const priceMap = {
          vegetable: 0.03, fruit: 0.05, meat: 0.06, seafood: 0.08,
          egg: 0.02, tofu: 0.03, dairy: 0.015, grain: 0.01, condiment: 0.03,
        };
        const unitPrice = priceMap[item.category] || 0.03;
        item.estimatedPrice = Math.ceil(item.quantity * unitPrice);
        totalCost += item.estimatedPrice;
        // 友好显示数量
        if (item.quantity >= 1000) {
          item.displayQty = `${(item.quantity / 1000).toFixed(1)}kg`;
        } else {
          item.displayQty = `${item.quantity}g`;
        }
      });
    });

    return {
      categories: Object.entries(categoryGroups).map(([name, items]) => ({
        name,
        items,
        count: items.length,
      })),
      totalEstimatedCost: totalCost,
    };
  },

  _getUnit(name, category) {
    if (category === 'egg') return '个';
    if (category === 'dairy') return 'ml';
    if (['grain', 'condiment', 'tofu'].includes(category)) return 'g';
    return 'g';
  },

  // 替换一道菜
  async replaceMeal(plan, dayIndex, mealType, profile) {
    const apiKey = Store.getApiKey();

    if (apiKey) {
      const prompt = `在以下菜单中，替换第${dayIndex + 1}天（${plan.days[dayIndex].date}）的${mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'}。
当前菜单：${JSON.stringify(plan.days[dayIndex].meals[mealType])}
请推荐3道替代菜，要求：
1. 食材不与其他餐冲突
2. 符合用户口味
3. 保持当日营养达标
以JSON格式返回：{"alternatives": [{"name": "菜名", "cookTime": 分钟, "ingredients": [...], "steps": [...]}]}`;

      try {
        const result = await Helpers.callLLM(
          DietEngine.buildDietSystemPrompt(profile),
          prompt,
          apiKey
        );
        if (result?.alternatives?.length) {
          const chosen = result.alternatives[0];
          plan.days[dayIndex].meals[mealType] = {
            name: chosen.name,
            ingredients: (chosen.ingredients || []).map(i =>
              typeof i === 'string' ? { name: i, category: 'vegetable', amount: 100 } : i
            ),
            cookTime: chosen.cookTime || 20,
            steps: chosen.steps || [],
          };
          return plan;
        }
      } catch (e) {
        console.warn('AI替换失败，使用本地替换');
      }
    }

    // 本地替换
    const fallbacks = {
      breakfast: ['燕麦牛奶+香蕉', '番茄鸡蛋面', '小米粥+煮鸡蛋'],
      lunch: ['番茄炒蛋+米饭', '青椒肉丝+米饭', '蛋炒饭'],
      dinner: ['番茄牛腩+米饭', '清蒸鲈鱼+青菜+米饭', '麻婆豆腐+米饭'],
    };
    const options = fallbacks[mealType] || ['鸡蛋面', '炒饭', '粥'];
    const newName = options[Math.floor(Math.random() * options.length)];
    plan.days[dayIndex].meals[mealType].name = newName + '（替换）';
    return plan;
  },
};

// ===== 周计划生成器 =====
// 本地引擎：基于膳食指南 + 用户画像 + 营养计算
// 有 API Key 时尝试大模型，否则用本地引擎
const MealPlanner = {
  async generateWeeklyPlan(profile) {
    const apiKey = Store.getApiKey();
    if (apiKey) {
      try {
        return await this._generateWithLLM(profile, apiKey);
      } catch (err) {
        const msg = err.message || '';
        // 生成本地引擎，但把错误原因写在notes里让用户看到
        const local = this._generateLocally(profile);
        local._llmError = msg;
        if (local.weeklyStats) {
          local.weeklyStats.notes = '⚠️ ' + msg + ' | ' + (local.weeklyStats.notes || '');
        }
        console.warn('LLM fail, using local engine:', msg);
        return local;
      }
    }
    return this._generateLocally(profile);
  },

  // ---- LLM（需要代理解决 CORS）----
  async _generateWithLLM(profile, apiKey) {
    const systemPrompt = DietEngine.buildDietSystemPrompt(profile);
    const weekStart = Helpers.getWeekStart();
    const prompt = `请为用户生成${Helpers.formatDate(weekStart, 'YYYY年MM月DD日')}到${Helpers.formatDate(new Date(weekStart.getTime()+6*86400000),'MM月DD日')}的每日三餐菜单，严格JSON格式。`;
    try {
      return await Helpers.callLLM(systemPrompt, prompt, apiKey);
    } catch (e) {
      const msg = e.message || '';
      // 区分错误类型
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('TypeError')) {
        throw new Error('浏览器无法直接调用 AI API，请开启「本地代理」或在服务器端使用。');
      }
      if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Authentication')) {
        throw new Error('API Key 无效或已过期，请在设置中重新填写。');
      }
      if (msg.includes('429') || msg.includes('Rate limit')) {
        throw new Error('API 调用过于频繁，请稍后再试。');
      }
      throw e;
    }
  },

  // ---- 本地引擎：基于膳食指南 + 用户画像 ----
  _generateLocally(profile) {
    // 1. 计算用户每日营养需求
    const bmr = Nutrition.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = Nutrition.calculateTDEE(bmr, profile.activityLevel);
    const dailyEnergy = Nutrition.adjustEnergyByGoal(tdee, profile.healthGoals || []);
    const foodTargets = Nutrition.getFoodGroupTargets(dailyEnergy);
    const mealDist = Nutrition.getMealDistribution();

    // 2. 获取用户约束
    const restrictions = new Set(profile.dietaryRestrictions || []);
    const goals = new Set(profile.healthGoals || []);
    const taste = profile.tasteProfile || {};
    const maxCookTime = profile.cookTimeBudget || 30;
    const tools = profile.availableTools || [];
    const budget = profile.perMealBudget || 20;
    const mealsToPlan = profile.mealsToPlan || ['dinner'];
    const mode = profile.mode || 'personal';

    // 3. 准备菜谱数据
    const allRecipes = RECIPES.getAll();

    // 4. 过滤可用菜谱（按用户条件）
    const userMealTypes = { breakfast: mealsToPlan.includes('breakfast'), lunch: mealsToPlan.includes('lunch'), dinner: mealsToPlan.includes('dinner') };

    // 5. 逐天生成
    const weekStart = Helpers.getWeekStart();
    const weekDays = Helpers.getWeekDays(weekStart);
    const usedRecipes = new Set();
    const weekIngredients = new Set();
    const days = [];
    let redMeatTotal = 0;
    let fishCount = 0;

    weekDays.forEach((date, dayIdx) => {
      const dayMeals = {};
      const dayIngredients = new Set();
      // 每日累计各类食物实际摄入量（克）
      const dayIntake = { grain:0, vegetable:0, fruit:0, meat:0, seafood:0, egg:0, dairy:0, tofu:0 };

      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        if (!userMealTypes[mealType]) return;

        // 计算这一餐的各类食物目标
        const mealTargets = Nutrition.getMealTargets(foodTargets, mealType);
        const targetRatio = mealDist[mealType] || 0.33;

        // 根据已选食材调整候选菜谱评分——优先补充不足的食物类别
        const gaps = {};
        Object.entries(foodTargets).forEach(([k, v]) => {
          if (['oil','salt'].includes(k)) return;
          const sofar = dayIntake[k] || 0;
          gaps[k] = Math.max(0, v - sofar);
        });

        // 候选菜谱过滤（所有维度参与）
        const customRests = Array.from(restrictions).filter(
          r => !['spicy','pork','seafood','lamb','lactose'].includes(r)
        );

        let candidates = allRecipes.filter(r => {
          if (r.mealType !== mealType) return false;
          if (usedRecipes.has(r.id)) return false;
          if ((r.cookTime || 0) > maxCookTime * 1.5) return false;
          if ((r.costPerServing || 0) > budget * 2) return false;
          if (r.tools && tools.length > 0 && !r.tools.some(t => tools.includes(t))) return false;
          // 预设忌口
          if (restrictions.has('spicy') && (r.taste?.spicy || 0) > 2) return false;
          if (restrictions.has('pork') && this._hasPork(r)) return false;
          if (restrictions.has('seafood') && this._hasSeafood(r)) return false;
          if (restrictions.has('lamb') && this._hasLamb(r)) return false;
          if (restrictions.has('lactose') && this._hasDairy(r)) return false;
          // 自定义忌口（匹配菜名和食材名）
          if (customRests.length) {
            const nameText = (r.name + ' ' + (r.ingredients||[]).map(i=>i.name).join(' ')).toLowerCase();
            if (customRests.some(cr => nameText.includes(cr.replace(/[不吃_]/g,'').toLowerCase()))) return false;
          }
          return true;
        });

        if (!candidates.length) {
          // 没有匹配的菜谱，用默认值
          candidates = [this._fallbackMeal(mealType)];
        }

        // 评分排序（差异化评分，偏好必须真正影响结果）
        const cuisines = (profile.cuisinePreference || '家常').split('、').map(c => c.replace('菜',''));
        const prevFeedback = Store.getFeedback();
        const disliked = new Set(prevFeedback.filter(f => f.rating === 'bad').map(f => f.recipeName));

        candidates.forEach(r => {
          let score = 100; // 基础分

          // ① 口味惩罚（±30分）- 不匹配就狠狠扣分
          if (r.taste) {
            const match = DietEngine.scoreTasteMatch(r.taste, taste);
            score += (match - 0.5) * 40; // 0.5=中等, <0.5扣分, >0.5加分
          }

          // ② 食材多样性（+15分）
          const newIngs = (r.ingredients || []).filter(i => !weekIngredients.has(i.name));
          score += (newIngs.length / Math.max(1, (r.ingredients || []).length)) * 15;

          // ③ 热量强制匹配（±15分）
          if (r.nutrition?.calories) {
            const targetCals = dailyEnergy * targetRatio;
            const calDiff = Math.abs(r.nutrition.calories - targetCals) / targetCals;
            if (calDiff > 0.5) score -= 15; // 差太多狠扣
            else score += Math.max(0, (1 - calDiff) * 10);
          }

          // ④ 健康目标专项（±25分）- 匹配加分/不匹配扣分
          if (goals.has('weight_loss')) {
            if (r.nutrition?.calories < 350) score += 15;
            else if (r.nutrition?.calories > 600) score -= 10;
            if (r.nutrition?.protein > 15) score += 5;
          }
          if (goals.has('muscle')) {
            if (r.nutrition?.protein > 20) score += 15;
            if (r.nutrition?.calories < 300) score -= 8;
          }
          if (goals.has('blood_pressure')) {
            if ((r.nutrition?.sodium || 999) < 400) score += 12;
            else if ((r.nutrition?.sodium || 0) > 700) score -= 10;
          }
          if (goals.has('blood_sugar')) {
            if (r.taste?.sweet < 2) score += 10;
            else if (r.taste?.sweet > 3) score -= 10;
          }
          if (goals.has('balanced')) {
            if (r.nutrition?.fiber > 2) score += 5;
            if ((r.ingredients||[]).filter(i=>i.category==='vegetable').length >= 2) score += 5;
          }

          // ⑤ 菜系偏好匹配（+10分单独加分）
          if (cuisines.length) {
            const rCuisine = (r.category || '').toLowerCase();
            if (cuisines.some(c => rCuisine.includes(c))) score += 10;
          }

          // ⑥ 烹饪时间匹配（±8分）
          const timeDiff = Math.abs((r.cookTime || 20) - maxCookTime) / maxCookTime;
          if (timeDiff > 0.8) score -= 8;
          else score += Math.max(0, (1 - timeDiff) * 5);

          // ⑦ 预算匹配（±5分）
          if (r.costPerServing) {
            if (r.costPerServing <= budget) score += 5;
            else if (r.costPerServing > budget * 1.5) score -= 5;
          }

          // ⑧ 厨具就绪（+3分）
          if (!r.tools || !r.tools.length || (r.tools||[]).every(t => tools.includes(t))) score += 3;

          // ⑨ 当季食材（+5分）
          const seasonal = DietEngine.getSeasonalIngredients();
          const hasSeasonal = (r.ingredients||[]).some(i =>
            [...seasonal.vegetables, ...seasonal.fruits].some(s => i.name.includes(s))
          );
          if (hasSeasonal) score += 5;

          // ⑩ 历史反馈惩罚（之前给过差评的菜-30分）
          if (disliked.has(r.name)) score -= 30;

          // ⑪ 鸡胸肉/鱼肉适合减脂期单独加分
          if (goals.has('weight_loss')) {
            if (r.name.includes('鸡胸') || r.name.includes('鲈鱼') || r.name.includes('虾')) score += 8;
          }

          // ⑫ 营养缺口补充——优先选能填补当前不足的菜
          (r.ingredients||[]).forEach(ing => {
            const cat = ing.category;
            const amt = ing.amount || 100;
            if (gaps[cat] && gaps[cat] > 0) {
              score += Math.min(8, amt / gaps[cat] * 6);
            }
          });

          r._score = Math.max(0, score);
        });

        candidates.sort((a, b) => (b._score || 0) - (a._score || 0));
        const chosen = candidates[0];
        usedRecipes.add(chosen.id);

        // 计算营养
        const ingList = (chosen.ingredients || []).map(i => ({
          name: i.name,
          category: i.category || 'condiment',
          amount: i.amount || 100,
          unit: i.unit || 'g',
        }));
        ingList.forEach(i => {
          if (i.category !== 'condiment') {
            dayIngredients.add(i.name);
            weekIngredients.add(i.name);
          }
        });

        // 统计红肉和鱼虾
        if (chosen.tags?.includes('下饭') || chosen.name.includes('牛') || chosen.name.includes('猪') || chosen.name.includes('排骨')) {
          redMeatTotal += 100;
        }
        if (chosen.ingredients?.some(i => ['seafood'].includes(i.category))) {
          fishCount++;
        }

        const mealObj = {
          name: chosen.name,
          cookTime: chosen.cookTime || 20,
          ingredients: ingList,
          steps: chosen.steps || ['准备食材', '按照步骤烹饪', '装盘上桌'],
          nutrition: chosen.nutrition || {},
          tags: chosen.tags || [],
          costPerServing: chosen.costPerServing || 0,
        };
        // 更新每日累计摄入
        (ingList||[]).forEach(i => {
          if (dayIntake[i.category] !== undefined) dayIntake[i.category] += i.amount || 0;
        });

        // 膳食质量评分
        const qScore = Nutrition.scoreMealQuality(mealObj, mealType, foodTargets);
        mealObj._score = qScore.total;
        mealObj._scoreDetail = qScore.details;

        dayMeals[mealType] = mealObj;
      });

      days.push({
        date: Helpers.formatDate(date, 'YYYY-MM-DD'),
        dayOfWeek: Helpers.weekDay(date),
        meals: dayMeals,
        ingredientCount: dayIngredients.size,
        totalCookTime: Object.values(dayMeals).reduce((s, m) => s + (m.cookTime || 0), 0),
      });
    });

    // 6. 膳食指南合规验证
    const planForValidation = {
      days: days.map(d => ({
        date: d.date,
        meals: d.meals,
        ingredientCount: d.ingredientCount,
      })),
      weeklyStats: { totalIngredientTypes: weekIngredients.size },
    };
    const validation = DietEngine.validatePlan(planForValidation);

    // 如果不达标且不是最后一次尝试，放宽约束重新生成
    const plan = {
      days,
      weeklyStats: {
        totalIngredientTypes: weekIngredients.size,
        darkVegetablePercent: validation.stats?.darkVegetable?.ratioText || '—',
        redMeatTotal: redMeatTotal,
        fishCount,
        notes: `基于《中国居民膳食指南》· 每日${dailyEnergy}kcal · ${mealsToPlan.join('/')}`,
      },
      validation: {
        passed: validation.passed,
        errors: validation.errors,
        warnings: validation.warnings,
        stats: validation.stats,
      },
    };

    // 如果关键指标不达标，记录警告但依然返回（用户可以看到哪里没达标）
    if (!validation.passed) {
      console.warn('膳食指南合规检查未通过:', validation.errors);
    }
    return plan;
  },

  _hasPork(r) {
    return (r.ingredients || []).some(i => ['五花肉', '猪里脊', '排骨', '猪肉末'].includes(i.name));
  },
  _hasSeafood(r) {
    return (r.ingredients || []).some(i => i.category === 'seafood');
  },
  _hasLamb(r) {
    return (r.ingredients || []).some(i => i.name.includes('羊肉'));
  },
  _hasDairy(r) {
    return (r.ingredients || []).some(i => i.category === 'dairy');
  },

  _fallbackMeal(type) {
    const fb = {
      breakfast: { id:'fb_b', name:'全麦面包+鸡蛋+牛奶', mealType:'breakfast', cookTime:8, ingredients:[{name:'全麦面包',category:'grain',amount:100},{name:'鸡蛋',category:'egg',amount:50},{name:'牛奶',category:'dairy',amount:250}], nutrition:{calories:350,protein:20,fat:10,carb:40,fiber:2,sodium:300}, tags:['快手','营养'], taste:{spicy:0,sour:0,sweet:1,salty:1,oily:1}, costPerServing:6, steps:['面包烤一下','鸡蛋煮熟','配一杯牛奶'] },
      lunch: { id:'fb_l', name:'番茄鸡蛋面', mealType:'lunch', cookTime:15, ingredients:[{name:'番茄',category:'vegetable',amount:150},{name:'鸡蛋',category:'egg',amount:50},{name:'挂面',category:'grain',amount:100}], nutrition:{calories:400,protein:16,fat:8,carb:60,fiber:2,sodium:500}, tags:['快手','清淡'], taste:{spicy:0,sour:2,sweet:1,salty:2,oily:1}, costPerServing:6, steps:['番茄切块炒出汁','加水煮开下面条','倒入蛋花'] },
      dinner: { id:'fb_d', name:'番茄牛腩+米饭', mealType:'dinner', cookTime:60, ingredients:[{name:'牛腩',category:'meat',amount:300},{name:'番茄',category:'vegetable',amount:200},{name:'大米',category:'grain',amount:100}], nutrition:{calories:550,protein:35,fat:22,carb:45,fiber:3,sodium:680}, tags:['高蛋白','补铁'], taste:{spicy:0,sour:3,sweet:2,salty:2,oily:2}, costPerServing:11, steps:['牛腩焯水','番茄炒出汁加牛腩炖','配米饭'] },
    };
    return [fb[type] || fb.dinner];
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
      } catch(e){}
    }
    // 本地替换：换一个未使用过的菜谱
    const used = new Set();
    plan.days.forEach(d => { ['breakfast','lunch','dinner'].forEach(mt => { if(d.meals?.[mt]) used.add(d.meals[mt].name); }); });
    const candidates = RECIPES.filter({mealType, maxTime: profile.cookTimeBudget || 30}).filter(r => !used.has(r.name));
    if (candidates.length) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      plan.days[dayIdx].meals[mealType].name = pick.name;
      plan.days[dayIdx].meals[mealType].cookTime = pick.cookTime;
    } else {
      plan.days[dayIdx].meals[mealType].name += '(替换)';
    }
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
          if (!map[k]) map[k] = { name:k, category:ing.category||'other', quantity:0, unit:ing.unit||'g', estimatedPrice:0, isPurchased:false, displayQty:'' };
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
      item.displayQty = item.quantity >= 1000 ? (item.quantity/1000).toFixed(1)+'kg' : item.quantity+item.unit;
      total += item.estimatedPrice;
      groups[cn].push(item);
    });

    return { categories: Object.entries(groups).map(([name,items])=>({name,items,count:items.length})), totalEstimatedCost: total };
  },
};

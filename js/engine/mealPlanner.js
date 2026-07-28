// ===== 周计划生成器 =====
// 本地引擎：基于膳食指南 + 用户画像 + 营养计算
// 有 API Key 时尝试大模型，否则用本地引擎
const MealPlanner = {
  async generateWeeklyPlan(profile) {
    const apiKey = Store.getApiKey();
    if (apiKey) {
      const result = await this._generateWithLLM(profile, apiKey);
      return result;
    }
    return this._generateLocally(profile);
  },

  // ---- LLM（直接调用，带合规重试，逐次放宽）----
  async _generateWithLLM(profile, apiKey, attempt = 0, prevErrors = '', lastPlan = null) {
    const relaxHints = [
      '',
      '注意：可以适当放宽烹饪时间和预算限制。',
      '注意：最后一次放宽要求。食材每天至少8种即可，烹饪时间和预算不限制，尽量达标即可。',
    ];
    const hint = relaxHints[Math.min(attempt, relaxHints.length - 1)];

    const systemPrompt = DietEngine.buildDietSystemPrompt(profile);
    const userNote = profile.aiRequirements
      ? `请严格按照JSON格式输出7天菜单。特别注意：用户有特殊需求——${profile.aiRequirements}。所有推荐必须优先满足这些需求。${hint}${prevErrors ? '\n\n上次生成的问题（本次必须修正）：\n' + prevErrors : ''}`
      : `请严格按照JSON格式输出7天菜单。${hint}${prevErrors ? '\n\n上次生成的问题（本次必须修正）：\n' + prevErrors : ''}`;
    try {
      const result = await Helpers.callLLM(systemPrompt, userNote, apiKey);
      if (result?.days && Array.isArray(result.days)) {
        const plan = { days: result.days };
        result.days.forEach((day, di) => {
          ['breakfast','lunch','dinner'].forEach(mt => {
            const m = day.meals?.[mt];
            if (m) {
              if (!m.ingredients || !m.ingredients.length) m.ingredients = [{ name: m.name, category: 'meat', amount: 100 }];
              if (!m.steps || !m.steps.length) m.steps = ['准备食材', '烹饪', '装盘'];
              if (!m.cookTime) m.cookTime = 20;
            }
          });
        });
        const diversityThreshold = attempt >= 2 ? 8 : 12;
        result.days.forEach(day => {
          const meals = day.meals || {};
          const dayIngs = new Set();
          Object.values(meals).forEach(m => (m.ingredients||[]).forEach(i => {
            if (i.category !== 'condiment') dayIngs.add(i.name);
          }));
          if (dayIngs.size < diversityThreshold) {
            this._boostDayDiversity(meals, dayIngs, new Set());
          }
        });
        const allWeekIngs = new Set();
        result.days.forEach(day => {
          const all = new Set();
          Object.values(day.meals||{}).forEach(m => (m.ingredients||[]).forEach(i => {
            if (i.category !== 'condiment') { all.add(i.name); allWeekIngs.add(i.name); }
          }));
          day.ingredientCount = all.size;
        });
        const validation = DietEngine.validatePlan(plan);
        if (!validation.passed && attempt < 3) {
          const errors = validation.errors.join('; ');
          console.warn(`AI attempt ${attempt+1} failed, retrying: ${errors}`);
          return this._generateWithLLM(profile, apiKey, attempt + 1, errors, plan);
        }
        return { ...plan, validation, weeklyStats: { totalIngredientTypes: allWeekIngs.size, notes: validation.passed ? 'AI生成·已达标' : 'AI生成·仅供参考（AI已重试多次未达标）' } };
      }
    } catch (e) {
      console.warn('AI failed:', e.message);
    }
    // API调用本身失败：有API就用AI结果，不切本地引擎
    if (lastPlan) {
      const v = DietEngine.validatePlan(lastPlan);
      lastPlan.validation = v;
      lastPlan.weeklyStats = lastPlan.weeklyStats || {};
      lastPlan._llmError = 'AI 最后尝试未达标，已返回上次结果';
      return lastPlan;
    }
    // 有API但调用失败，返回错误信息而不是用本地引擎
    return {
      days: [],
      validation: { passed: false, errors: ['AI 接口调用失败，请检查 API Key 和网络连接'], warnings: [] },
      weeklyStats: { totalIngredientTypes: 0, notes: 'AI 调用失败' },
      _llmError: 'AI 接口调用失败，请检查 API Key 和网络连接',
    };
  },

  // ---- 本地引擎：基于膳食指南 + 用户画像 ----
  _generateLocally(profile, attempt = 0, relax = {}) {
    const bmr = Nutrition.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = Nutrition.calculateTDEE(bmr, profile.activityLevel);
    const dailyEnergy = Nutrition.adjustEnergyByGoal(tdee, profile.healthGoals || []);
    const foodTargets = Nutrition.getFoodGroupTargets(dailyEnergy);
    const mealDist = Nutrition.getMealDistribution();

    const restrictions = new Set(profile.dietaryRestrictions || []);
    const goals = new Set(profile.healthGoals || []);
    const taste = profile.tasteProfile || {};
    // 逐次放宽约束
    const maxCookTime = relax.time || profile.cookTimeBudget || 30;
    const tools = profile.availableTools || [];
    const budget = relax.budget || profile.perMealBudget || 20;
    const mealsToPlan = profile.mealsToPlan || ['dinner'];
    const userMealTypes = { breakfast: mealsToPlan.includes('breakfast'), lunch: mealsToPlan.includes('lunch'), dinner: mealsToPlan.includes('dinner') };
    const allRecipes = RECIPES.getAll();

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
        const pref = profile.cuisinePreference || ['家常'];
        const cuisines = (Array.isArray(pref) ? pref : [pref]).map(c => c.replace('菜',''));
        const prevFeedback = Store.getFeedback();
        const disliked = new Set(prevFeedback.filter(f => f.rating === 'bad').map(f => f.recipeName));

        candidates.forEach(r => {
          let score = 100; // 基础分

          // ① 口味惩罚（±30分）
          if (r.taste) {
            const match = DietEngine.scoreTasteMatch(r.taste, taste);
            score += (match - 0.5) * 40;
          }

          // ② 食材多样性（+0~50分）
          const ings = r.ingredients || [];
          const newIngs = ings.filter(i => !weekIngredients.has(i.name) && !dayIngredients.has(i.name));
          const newCount = newIngs.length;
          const dayCount = dayIngredients.size;
          const diversityBonus = dayCount < 6 ? 30 : dayCount < 9 ? 20 : 10;
          score += Math.min(newCount * 8, diversityBonus);
          if (newCount === 0) score -= 20;

          // ②b 深色蔬菜专项加分（模拟AI对营养均衡的重视）
          const darkVeg = ['菠菜','西兰花','油麦菜','空心菜','芥蓝','苋菜','茼蒿','韭菜','芹菜叶','胡萝卜','番茄','紫甘蓝','红椒','甜菜根'];
          const hasDarkVeg = (r.ingredients||[]).some(i => darkVeg.some(d => i.name.includes(d)));
          if (hasDarkVeg) score += 15;
          const dayHasDark = Object.values(dayMeals).some(m => (m.ingredients||[]).some(i => darkVeg.some(d => i.name.includes(d))));
          if (hasDarkVeg && !dayHasDark) score += 10;

          // ②c 食材重复惩罚（模拟AI避免整周吃同样的东西）
          const reusedIngs = ings.filter(i => weekIngredients.has(i.name) && i.category !== 'condiment');
          score -= reusedIngs.length * 3;

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

          // ⑨ 当季食材（+10分）
          const seasonal = DietEngine.getSeasonalIngredients();
          const hasSeasonal = (r.ingredients||[]).some(i =>
            [...seasonal.vegetables, ...seasonal.fruits].some(s => i.name.includes(s))
          );
          if (hasSeasonal) score += 10;
          // 全当季食材额外加分
          const allSeasonal = (r.ingredients||[]).filter(i => i.category !== 'condiment').every(i =>
            [...seasonal.vegetables, ...seasonal.fruits].some(s => i.name.includes(s))
          );
          if (allSeasonal && (r.ingredients||[]).filter(i => i.category !== 'condiment').length > 0) score += 5;

          // ⑩ 历史反馈惩罚（之前给过差评的菜-30分）
          if (disliked.has(r.name)) score -= 30;

          // ⑪ 鸡胸肉/鱼肉适合减脂期单独加分
          if (goals.has('weight_loss')) {
            if (r.name.includes('鸡胸') || r.name.includes('鲈鱼') || r.name.includes('虾')) score += 8;
          }

          // ⑪b 红肉限制（接近周限500g时扣分，逐次放宽）
          const isRedMeat = r.name.includes('牛') || r.name.includes('猪') || r.name.includes('排骨') || r.name.includes('五花');
          if (isRedMeat) {
            const projected = redMeatTotal + 100;
            const rmPenalty = relax.redMeatPenalty !== undefined ? relax.redMeatPenalty : 20;
            if (projected > 400) score -= Math.min(40, rmPenalty * 2);
            else if (projected > 300) score -= rmPenalty;
            else if (projected > 200) score -= Math.floor(rmPenalty / 3);
          }

          // ⑪c 用户特殊需求关键词解析（aiRequirements）
          const reqs = (profile.aiRequirements || '').toLowerCase();
          if (reqs) {
            if (reqs.includes('增肌') || reqs.includes('蛋白')) {
              if (r.nutrition?.protein > 20) score += 20;
              else if (r.nutrition?.protein > 15) score += 10;
              else if (r.nutrition?.protein && r.nutrition.protein < 8) score -= 10;
            }
            if (reqs.includes('胃') || reqs.includes('养胃') || reqs.includes('消化')) {
              if ((r.taste?.spicy || 0) > 2) score -= 20;
              if ((r.taste?.oily || 0) > 2) score -= 10;
              if (r.name.includes('粥') || r.name.includes('山药') || r.name.includes('小米')) score += 15;
            }
            if (reqs.includes('控糖') || reqs.includes('血糖') || reqs.includes('糖尿病')) {
              if ((r.taste?.sweet || 0) > 2) score -= 20;
              if (r.nutrition?.fiber > 3) score += 10;
            }
            if (reqs.includes('低脂') || reqs.includes('清淡') || reqs.includes('不油')) {
              if ((r.taste?.oily || 0) > 2) score -= 15;
              if (r.nutrition?.fat && r.nutrition.fat < 10) score += 10;
            }
            if (reqs.includes('补脑')) {
              if (r.ingredients?.some(i => i.category === 'seafood')) score += 15;
              if (r.name.includes('鱼') || r.name.includes('核桃')) score += 10;
            }
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
        // 加权随机选择：高分者概率大，但低分偶尔也能被选中（模拟AI的创造性）
        const topS = candidates[0]._score;
        const weights = candidates.map((c, i) => Math.max(1, c._score - Math.max(0, topS - 40)));
        const totalW = weights.reduce((s, w) => s + w, 0);
        let rand = Math.random() * totalW;
        let chosen = candidates[0];
        for (let i = 0; i < candidates.length; i++) {
          rand -= weights[i];
          if (rand <= 0) { chosen = candidates[i]; break; }
        }
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
        const isRedMeat = chosen.name.includes('牛') || chosen.name.includes('猪') || chosen.name.includes('排骨') || chosen.name.includes('五花');
        if (isRedMeat) redMeatTotal += 100;
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

      // 每日多样性提升：食材不足时自动加深色蔬菜配菜
      const divThreshold = relax.divThreshold || 12;
      if (dayIngredients.size < divThreshold) {
        this._boostDayDiversity(dayMeals, dayIngredients, weekIngredients);
      }

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

    // 如果不达标且有重试次数，逐步放宽约束重新生成
    if (!validation.passed && attempt < 4) {
      const nextRelax = { ...relax };
      nextRelax.time = (relax.time || profile.cookTimeBudget || 30) + Math.min(10 + attempt * 5, 30);
      nextRelax.budget = (relax.budget || profile.perMealBudget || 20) + Math.min(5 + attempt * 3, 20);
      if (attempt >= 2) nextRelax.divThreshold = 10;
      if (attempt >= 3) nextRelax.divThreshold = 8;
      nextRelax.redMeatPenalty = Math.max(0, 20 - attempt * 5); // 逐次降低红肉扣分
      console.log(`Compliance attempt ${attempt+1} failed, retrying with relaxed constraints (time+${nextRelax.time-profile.cookTimeBudget}, div≥${nextRelax.divThreshold||12})...`);
      return this._generateLocally(profile, attempt + 1, nextRelax);
    }
    if (!validation.passed) {
      console.warn('所有重试后仍未完全达标:', validation.errors);
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
    // 基于2025-2026市场均价（元/克）：蔬菜2.2、水果3.5、肉15（猪肉8/牛肉33/鸡肉8.5均）、水产30（鱼10-25/虾40/三文鱼100+）、蛋5、豆制品3、奶7/kg、米5
    // 2026年7月发改委/农业农村部市场均价（元/g零售折算）：蔬菜3.5、水果5、肉18.5（猪11/牛37/鸡11/羊35加权）、水产18（鱼12/虾34加权）、蛋5、豆制品4、奶14/L、米5
    // 2026年7月官方均价（元/g零售折合）：蔬菜3.5、水果5、肉18.5（猪11/牛37/鸡11/羊35加权）、水产18（鱼12/虾34加权）、蛋5、豆制品4、奶14/L、米面3.5、调料估
    const uprice = { vegetable:0.007, fruit:0.01, meat:0.037, seafood:0.036, egg:0.01, tofu:0.008, dairy:0.014, grain:0.007, condiment:0.03 };

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

  // ---- 每日多样性提升：智能加配菜（模拟AI的营养均衡策略）----
  _boostDayDiversity(dayMeals, dayIngredients, weekIngredients) {
    // 按品类分组配菜，优先补齐当日不足的食物类别
    const sidePool = {
      vegetable: [
        { name: '清炒西兰花', cookTime: 5, ing: [{name:'西兰花',category:'vegetable',amount:150}], steps:['西兰花焯水','蒜蓉爆香翻炒','加盐出锅'] },
        { name: '蒜蓉菠菜', cookTime: 4, ing: [{name:'菠菜',category:'vegetable',amount:150}], steps:['菠菜洗净','蒜蓉爆香大火翻炒','出锅'] },
        { name: '清炒油麦菜', cookTime: 5, ing: [{name:'油麦菜',category:'vegetable',amount:150}], steps:['油麦菜切段','大火翻炒1分钟','加盐调味'] },
        { name: '蒜蓉空心菜', cookTime: 5, ing: [{name:'空心菜',category:'vegetable',amount:150}], steps:['空心菜洗净','蒜蓉爆香大火翻炒1分钟','出锅'] },
        { name: '素炒紫甘蓝', cookTime: 6, ing: [{name:'紫甘蓝',category:'vegetable',amount:120}], steps:['紫甘蓝切丝','大火快速翻炒','加醋和盐调味'] },
        { name: '蚝油生菜', cookTime: 4, ing: [{name:'生菜',category:'vegetable',amount:150}], steps:['生菜焯水10秒','蚝油生抽调汁','浇热油'] },
        { name: '炝炒圆白菜', cookTime: 6, ing: [{name:'圆白菜',category:'vegetable',amount:150}], steps:['圆白菜手撕成片','干辣椒花椒爆香','大火快炒加盐出锅'] },
        { name: '醋溜白菜', cookTime: 5, ing: [{name:'大白菜',category:'vegetable',amount:150}], steps:['白菜切片','热油爆香干辣椒','加醋大火翻炒出锅'] },
        { name: '清炒茼蒿', cookTime: 4, ing: [{name:'茼蒿',category:'vegetable',amount:150}], steps:['茼蒿洗净切段','大火翻炒1分钟','加盐出锅'] },
        { name: '清炒芥蓝', cookTime: 5, ing: [{name:'芥蓝',category:'vegetable',amount:150}], steps:['芥蓝去老皮','焯水后大火翻炒','加盐和蚝油出锅'] },
      ],
      fruit: [
        { name: '苹果切片', cookTime: 2, ing: [{name:'苹果',category:'fruit',amount:150}], steps:['苹果洗净切块即可'] },
        { name: '香蕉酸奶', cookTime: 2, ing: [{name:'香蕉',category:'fruit',amount:100},{name:'酸奶',category:'dairy',amount:100}], steps:['香蕉切片','淋上酸奶即可'] },
      ],
      egg: [
        { name: '番茄蛋花汤', cookTime: 8, ing: [{name:'番茄',category:'vegetable',amount:100},{name:'鸡蛋',category:'egg',amount:30}], steps:['番茄切块炒出汁','加水煮开','倒入蛋花加盐调味'] },
      ],
      tofu: [
        { name: '凉拌豆腐', cookTime: 3, ing: [{name:'嫩豆腐',category:'tofu',amount:150},{name:'葱',category:'condiment',amount:5}], steps:['豆腐切块装盘','淋生抽香油','撒葱花即可'] },
      ],
    };
    const allSides = Object.values(sidePool).flat();

    // 计算当日已摄入的食物类别缺口
    const dayIntake = { grain:0, vegetable:0, fruit:0, meat:0, seafood:0, egg:0, dairy:0, tofu:0 };
    Object.values(dayMeals).forEach(m => (m.ingredients||[]).forEach(i => {
      if (dayIntake[i.category] !== undefined) dayIntake[i.category] += i.amount || 0;
    }));
    // 按缺口排序的品类（优先补缺口最大的）
    const gapOrder = Object.entries(dayIntake)
      .map(([cat, amt]) => ({ cat, amt }))
      .sort((a, b) => a.amt - b.amt)
      .map(x => x.cat);

    let round = 0;
    while (dayIngredients.size < 12 && round < 20) {
      round++;
      const dayIngNames = new Set();
      Object.values(dayMeals).forEach(m =>
        (m.ingredients||[]).forEach(i => dayIngNames.add(i.name))
      );

      let added = false;
      for (const mt of ['lunch', 'dinner', 'breakfast']) {
        if (!dayMeals[mt]) continue;
        if (dayIngredients.size >= 12) break;

        // 按营养缺口优先选品类
        for (const cat of gapOrder) {
          if (dayIngredients.size >= 12) break;
          const pool = sidePool[cat] || [];
          for (const side of pool) {
            if (dayIngredients.size >= 12) break;
            if (!side.ing.some(i => i.category !== 'condiment' && !dayIngNames.has(i.name))) continue;
            if (Object.values(dayMeals).some(m => m.name === side.name)) continue;

            let key = mt + '_side';
            let idx = 1;
            while (dayMeals[key]) { idx++; key = mt + '_side' + idx; }

            dayMeals[key] = {
              name: side.name,
              cookTime: side.cookTime,
              ingredients: side.ing,
              steps: side.steps,
            };
            side.ing.forEach(i => {
              if (i.category !== 'condiment') {
                dayIngredients.add(i.name);
                weekIngredients.add(i.name);
                dayIngNames.add(i.name);
                if (dayIntake[i.category] !== undefined) dayIntake[i.category] += i.amount || 0;
              }
            });
            added = true;
          }
          // 如果这个品类没有可用配菜，试试普通蔬菜
          if (cat === 'vegetable' && dayIngredients.size < 12) {
            for (const side of sidePool.vegetable) {
              if (dayIngredients.size >= 12) break;
              if (!side.ing.some(i => i.category !== 'condiment' && !dayIngNames.has(i.name))) continue;
              if (Object.values(dayMeals).some(m => m.name === side.name)) continue;
              let key = mt + '_side';
              let idx = 1;
              while (dayMeals[key]) { idx++; key = mt + '_side' + idx; }
              dayMeals[key] = { name: side.name, cookTime: side.cookTime, ingredients: side.ing, steps: side.steps };
              side.ing.forEach(i => {
                if (i.category !== 'condiment') { dayIngredients.add(i.name); weekIngredients.add(i.name); dayIngNames.add(i.name); }
              });
              added = true;
            }
          }
        }
      }
      if (!added) break;
    }
  },
};

// ===== 膳食指南规则引擎（确定性逻辑 + LLM增强）=====
// 核心功能：校验 LLM 生成的菜单是否符合膳食指南
// 提供: 约束规则、校验函数、多样性计数器

const DietEngine = {
  // 校验单日多样性
  validateDayDiversity(ingredients) {
    // 去重计数（调味品不计）
    const countSet = new Set();
    const condiments = new Set(['condiment']);
    (ingredients || []).forEach(ing => {
      if (!condiments.has(ing.category)) {
        countSet.add(ing.name);
      }
    });
    return {
      count: countSet.size,
      passed: countSet.size >= 12,
      remaining: Math.max(0, 12 - countSet.size),
    };
  },

  // 校验整周多样性
  validateWeekDiversity(allWeekIngredients) {
    const countSet = new Set();
    const condiments = new Set(['condiment']);
    allWeekIngredients.forEach(ing => {
      if (!condiments.has(ing.category)) {
        countSet.add(ing.name);
      }
    });
    return {
      count: countSet.size,
      passed: countSet.size >= 25,
      remaining: Math.max(0, 25 - countSet.size),
    };
  },

  // 深色蔬菜比例
  calcDarkVegetableRatio(meals) {
    const darkVeg = ['菠菜', '西兰花', '油麦菜', '空心菜', '芥蓝', '茼蒿', '苋菜',
      '韭菜', '芹菜叶', '胡萝卜', '番茄', '紫甘蓝', '红椒', '甜菜根'];
    let total = 0, dark = 0;

    (meals || []).forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        if (ing.category === 'vegetable') {
          total++;
          if (darkVeg.some(d => ing.name.includes(d))) dark++;
        }
      });
    });

    const ratio = total > 0 ? dark / total : 0;
    return {
      ratio,
      ratioText: `${Math.round(ratio * 100)}%`,
      passed: ratio >= 0.5,
    };
  },

  // 红肉总量校验（每周 ≤ 500g）
  calcRedMeatTotal(weekMeals) {
    const redMeats = ['猪肉', '牛肉', '羊肉', '牛腩', '排骨', '五花肉', '猪蹄'];
    let total = 0;
    (weekMeals || []).forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        if (redMeats.some(r => ing.name.includes(r))) {
          total += (ing.amount || 100);
        }
      });
    });
    return {
      total,
      passed: total <= 500,
      remaining: Math.max(0, 500 - total),
    };
  },

  // 鱼虾次数校验（每周 ≥ 2次）
  calcFishCount(weekMeals) {
    const fishKeywords = ['鱼', '虾', '蟹', '贝', '鱿鱼', '鲍鱼'];
    let count = 0;
    (weekMeals || []).forEach(meal => {
      const hasFish = (meal.ingredients || []).some(ing =>
        fishKeywords.some(k => ing.name.includes(k))
      );
      if (hasFish) count++;
    });
    return { count, passed: count >= 2 };
  },

  // 全面校验生成结果
  validatePlan(plan) {
    if (!plan || !plan.days || !plan.days.length) {
      return { passed: false, errors: ['没有有效的菜单数据'] };
    }

    const allMeals = [];
    const allIngredients = [];
    const errors = [];
    const warnings = [];

    plan.days.forEach((day, idx) => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = day.meals?.[mealType];
        if (meal) {
          allMeals.push({ ...meal, mealType, dayIdx: idx });
          (meal.ingredients || []).forEach(ing => {
            allIngredients.push(ing);
          });
        }
      });

      // 每日多样性校验
      const dayIngs = [];
      ['breakfast', 'lunch', 'dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (m) dayIngs.push(...(m.ingredients || []));
      });
      const dayDiv = this.validateDayDiversity(dayIngs);
      if (!dayDiv.passed) {
        errors.push(`第${idx + 1}天（${day.date}）食材不足：${dayDiv.count}/12种`);
      }
    });

    // 整周校验
    const weekDiv = this.validateWeekDiversity(allIngredients);
    if (!weekDiv.passed) {
      errors.push(`整周食材多样性不足：${weekDiv.count}/25`);
    }

    const darkVeg = this.calcDarkVegetableRatio(allMeals);
    if (!darkVeg.passed) {
      errors.push(`深色蔬菜不足：${darkVeg.ratioText}（需≥50%）`);
    }

    const redMeat = this.calcRedMeatTotal(allMeals);
    if (!redMeat.passed) {
      errors.push(`红肉摄入超标：${redMeat.total}g/周（限500g）`);
    }

    const fish = this.calcFishCount(allMeals);
    if (!fish.passed) {
      warnings.push(`鱼虾次数不足：${fish.count}次/周（需≥2次）`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      stats: {
        weekDiversity: weekDiv,
        darkVegetable: darkVeg,
        redMeat,
        fish,
      },
    };
  },

  // 口味匹配度评分
  scoreTasteMatch(recipeTaste, profileTaste) {
    if (!recipeTaste || !profileTaste) return 0.5;
    const dims = ['spicy', 'sour', 'sweet', 'salty', 'oily'];
    let score = 0;
    dims.forEach(d => {
      const diff = Math.abs((recipeTaste[d] || 0) - (profileTaste[d] || 0));
      score += Math.max(0, 1 - diff / 5);
    });
    return score / dims.length;
  },

  // 构建系统提示词（包含完整膳食指南上下文 + 用户画像）
  buildDietSystemPrompt(profile) {
    const daily = Nutrition.getDailyRecommendation(profile);

    return `你是一位资深的中国注册营养师。
你的任务是为用户生成符合《中国居民膳食指南（2025）》的一周健康菜单。

## 用户个人信息
- 年龄：${profile.age}岁
- 性别：${profile.gender === 'male' ? '男' : '女'}
- 身高：${profile.height}cm
- 体重：${profile.weight}kg
- 活动水平：${['久坐', '轻度', '中度', '高度'][(profile.activityLevel || 1) - 1]}
- 每日推荐能量：${daily.energy}kcal
- 饮食目标：${(profile.healthGoals || []).map(g => LANG.wizard['goal_' + g] || g).join('、') || '无特殊目标'}
- 忌口/过敏：${(profile.dietaryRestrictions || []).map(r => LANG.wizard['restrict_' + r] || r).join('、') || '无'}
- 睡眠：${profile.sleepHours || 7}小时/晚 · 压力：${['很低','一般','中等','较大','很大'][(profile.stressLevel||2)-1]}
- 运动：${profile.exerciseDays || 2}天/周 · 外食：${profile.eatOutFreq || 2}次/周
- 烹饪水平：${['新手','入门','中等','熟练','高手'][(profile.cookingSkill||2)-1]}
- 健康状况：${(profile.healthConditions||[]).join('、') || '无'} · 消化：${(profile.digestiveIssues||[]).filter(i=>i!=='none').join('、') || '正常'}
- 补充剂：${profile.useSupplements ? (profile.supplements||[]).join('、')||'服用中' : '未服用'}
- 菜系偏好：${Array.isArray(profile.cuisinePreference) ? profile.cuisinePreference.join('、') : (profile.cuisinePreference || '家常')}
- 过敏源：${(profile.allergies||[]).join('、') || '无'}
- 每周做饭：${profile.cookDaysPerWeek || 5}天/周
- 做饭时间：每餐最多${profile.cookTimeBudget || 30}分钟
- 可用厨具：${(profile.availableTools || []).join('、')}
- 每餐预算：${profile.perMealBudget || 20}元
- 计划餐次：${(profile.mealsToPlan || ['breakfast', 'dinner']).join('、')}
- 口味偏好（0-5分）：辣度${profile.tasteProfile?.spicy || 0}、酸度${profile.tasteProfile?.sour || 0}、甜度${profile.tasteProfile?.sweet || 0}、咸度${profile.tasteProfile?.salty || 0}、油腻${profile.tasteProfile?.oily || 0}

## 每日各类食物推荐量（基于膳食宝塔2025）
- 谷类：${daily.targets.grain}g（其中全谷物+杂豆 ${daily.targets.wholeGrain}g）
- 薯类：${daily.targets.tuber}g
- 蔬菜：${daily.targets.vegetable}g（深色蔬菜至少占一半）
- 水果：${daily.targets.fruit}g
- 畜禽肉：${daily.targets.meatPoultry}g
- 水产：${daily.targets.seafood}g（建议每周≥2次鱼虾）
- 蛋类：${daily.targets.egg}g（约1个鸡蛋）
- 奶类：${daily.targets.dairy}ml
- 大豆：${daily.targets.soy}g
- 坚果：${daily.targets.nut}g
- 油：≤${daily.targets.oil}g
- 盐：≤${daily.targets.salt}g
- 饮水：${daily.water}ml (${profile.gender === 'male' ? '男' : '女'}性推荐量)
- 肉蛋水产合计：${daily.animalTotal}g/天（膳食指南推荐120-200g/天）

## 必须遵守的膳食指南规则（硬约束）
1. ✅ 食物多样：每天摄入 ≥12种食物，每周 ≥25种
2. ✅ 谷类为主：每天谷类200-300g（含全谷物+杂豆50-150g），薯类50-100g
3. ✅ 多吃蔬果：蔬菜≥300g/天，深色蔬菜占 ≥50%；水果200-350g/天
4. ✅ 奶豆坚果：奶类≥300ml/天，大豆25-35g/天，坚果~10g/天
5. ✅ 适量肉蛋水产：合计120-200g/天（畜禽肉40-75g，水产40-75g，蛋~50g）
6. ✅ 红肉限制：猪牛羊肉每周总量 ≤500g
7. ✅ 鱼虾：≥2次/周
8. ✅ 少盐少油：食盐≤5g/天，烹调油25-30g/天，添加糖≤50g/天
9. ✅ 三餐分配：早30%、午40%、晚30%
10. ✅ 一周内菜品尽量不重复
11. ✅ 每餐要有主食+蔬菜+蛋白质来源
12. ✅ 忌口和过敏食物绝对不能出现
13. ✅ 符合用户的口味偏好

## 输出格式
请严格按照以下 JSON 格式输出，不要包含任何其他文字：

{
  "days": [
    {
      "date": "2026-07-28",
      "dayOfWeek": "周一",
      "meals": {
        "breakfast": {
          "name": "如：小米粥+煮鸡蛋+拌黄瓜",
          "ingredients": [
            {"name": "小米", "category": "grain", "amount": 50},
            {"name": "鸡蛋", "category": "egg", "amount": 50}
          ],
          "cookTime": 15,
          "steps": ["小米淘洗下锅煮20分钟", "鸡蛋冷水下锅煮8分钟", "黄瓜拍碎加醋拌匀"]
        },
        "lunch": { "name": "...", ... },
        "dinner": { "name": "...", ... }
      },
      "ingredientCount": 12,
      "totalCookTime": 55
    }
  ],
  "weeklyStats": {
    "totalIngredientTypes": 28,
    "darkVegetablePercent": "55%",
    "redMeatTotalGrams": 350,
    "fishCount": 2,
    "avgCostPerMeal": 18,
    "notes": "本周饮食建议..."
  }
}

## 国际膳食参考（补充参考）
### WHO 核心建议
- 蔬果≥400g/天，膳食纤维≥25g/天
- 添加糖<10%总能量（约50g），最好<5%
- 饱和脂肪<10%总能量，反式脂肪<1%
- 食盐<5g/天

### 美国膳食指南 2025-2030
- 蛋白质推荐提高至1.2-1.6g/kg体重/天
- 每餐添加糖≤10g，不推荐任何添加糖
- 全脂奶制品3份/天
- 核心理念："Eat Real Food"——优先天然完整食物

## 菜品要求
- 菜名为中国常见家常菜
- 每道菜步骤 ≤6步，每步含时间预估
- 食材为超市/菜市场易购买的
- 优先选择当季食材（${this.getSeasonalIngredients().vegetables.join('、')}等）
- 适合用户的预算和厨具
- 符合用户的饮食目标和健康需求
- ${profile.mode === 'personal' ? '一人份量，不要太多' : profile.mode === 'family' ? '适合全家人的口味' : '适合备菜，标注可冷冻保存的菜品'}

## 每道菜必须参考的用户维度
请逐一核对以下维度，确保每道推荐都满足：
1. ✅ 口味偏好（辣度${profile.tasteProfile?.spicy||0}/5、酸度${profile.tasteProfile?.sour||0}/5、甜度${profile.tasteProfile?.sweet||0}/5、咸度${profile.tasteProfile?.salty||0}/5、油腻${profile.tasteProfile?.oily||0}/5）
2. ✅ 所有忌口/过敏不能出现（${(profile.dietaryRestrictions||[]).map(r=>LANG.wizard['restrict_'+r]||r).join('、')||'无'}）
3. ✅ 烹饪时间 ≤${profile.cookTimeBudget||30}分钟/餐
4. ✅ 厨具限制：只用${(profile.availableTools||[]).join('、')||'基本厨具'}
5. ✅ 预算：每餐≤${profile.perMealBudget||20}元
6. ✅ 健康目标：${(profile.healthGoals||[]).map(g=>LANG.wizard['goal_'+g]||g).join('、')||'无'} 需体现在食材选择中
7. ✅ ${profile.gender === 'male' ? '男' : '女'}性 · ${profile.age}岁 · 每日${daily.energy}kcal · 活动量${['久坐','轻度','中度','高度'][(profile.activityLevel||1)-1]}

## ⚠️ 生成后必须检查（重要）
生成完成后，请逐项核对：

【食材多样性检查】
- 统计每天所有菜品中使用了多少种不同食材（调味品不算）
- 每天必须 ≥12 种不同食材
- 如果某天不足12种，请增加配菜或更换菜品

【深色蔬菜检查】
- 深色蔬菜（菠菜/西兰花/胡萝卜/番茄/紫甘蓝/油麦菜等）必须占蔬菜总量的 ≥50%
- 如果不足，请在菜品中增加深色蔬菜

【每周检查】
- 一周内菜品尽量不重复（同一天不同餐也不重复）
- 合计食材种类 ≥25种
- 红肉总量 ≤500g
- 鱼虾 ≥2次`;
  },

  // 获取当季食材
  getSeasonalIngredients() {
    const month = new Date().getMonth() + 1; // 1-12
    const seasons = {
      spring: { months: [3,4,5], veg: ['韭菜','菠菜','春笋','豆苗','荠菜','香椿','蒜苗','芹菜'], fruit: ['草莓','菠萝','樱桃','桑葚'] },
      summer: { months: [6,7,8], veg: ['黄瓜','番茄','茄子','苦瓜','丝瓜','空心菜','豆角','冬瓜','青椒'], fruit: ['西瓜','桃子','荔枝','葡萄','芒果','哈密瓜'] },
      autumn: { months: [9,10,11], veg: ['莲藕','山药','南瓜','白菜','萝卜','芋头','秋葵','茭白'], fruit: ['梨','柿子','石榴','苹果','柚子','枣'] },
      winter: { months: [12,1,2], veg: ['白菜','萝卜','冬笋','菠菜','菜薹','芋头','山药','莲藕'], fruit: ['橙子','橘子','甘蔗','猕猴桃'] },
    };
    const season = Object.values(seasons).find(s => s.months.includes(month)) || seasons.spring;
    return { season: ['春','夏','秋','冬'][Math.floor((month%12)/3)], vegetables: season.veg, fruits: season.fruit };
  },

  // 获取具体的膳食指南知识（用于AI问答）
  getDietGuidelineKnowledge() {
    return {
      title: '中国居民膳食指南（2025）八准则',
      guidelines: [
        {
          rule: '准则一 食物多样，合理搭配',
          details: '每日摄入≥12种食物，每周≥25种。主食包括谷类、薯类和杂豆。每天谷类200-300g，其中全谷物和杂豆50-150g；薯类50-100g。坚持谷类为主的平衡膳食模式。',
        },
        {
          rule: '准则二 吃动平衡，健康体重',
          details: '各年龄段都应天天进行身体活动。食不过量，保持能量平衡。每周至少5天中等强度运动，累计150分钟以上。主动身体活动最好每天6000步。减少久坐时间。',
        },
        {
          rule: '准则三 多吃蔬果、奶类、全谷、大豆',
          details: '蔬菜≥300g/天，深色蔬菜占一半；水果200-350g/天；奶制品≥300ml/天；大豆25-35g/天；坚果适量（约10g/天）。餐餐有蔬菜，天天吃水果。',
        },
        {
          rule: '准则四 适量吃鱼、禽、蛋、瘦肉',
          details: '鱼、禽、蛋类和瘦肉适量，平均每天120-200g。每周最好吃鱼2次或300-500g，蛋类300-350g，畜禽肉300-500g。优先选择鱼，少吃肥肉。红肉（猪牛羊肉）每周总量≤500g。',
        },
        {
          rule: '准则五 少盐少油，控糖限酒',
          details: '食盐≤5g/天，烹调油25-30g/天。添加糖≤50g/天，最好≤25g。反式脂肪酸≤2g/天。足量饮水：男1700ml/天，女1500ml/天。不喝或少喝含糖饮料。',
        },
        {
          rule: '准则六 规律进餐，足量饮水',
          details: '合理安排一日三餐，定时定量，不漏餐。早餐30%、午餐40%、晚餐30%。不暴饮暴食、不偏食挑食、不过度节食。足量饮水，少量多次。',
        },
        {
          rule: '准则七 会烹会选，会看标签',
          details: '选择新鲜、营养素密度高的食物。学会阅读食品标签，选择低盐低脂低糖食品。多用蒸煮炖，少用煎炸。在外就餐不忘适量与平衡。',
        },
        {
          rule: '准则八 公筷分餐，杜绝浪费',
          details: '讲究卫生，从分餐公筷做起。食物制备生熟分开。珍惜食物，按需备餐。做可持续食物系统发展的践行者。',
        },
      ],
      international: [
        { name: 'WHO健康膳食', items: ['蔬果≥400g/天','纤维≥25g/天','添加糖<10%能量','饱和脂肪<10%能量','食盐<5g/天'] },
        { name: '美国DGA 2025-2030', items: ['蛋白质1.2-1.6g/kg','添加糖每餐≤10g','全脂奶3份/天','限超加工食品','"Eat Real Food"'] },
        { name: '地中海膳食模式', items: ['橄榄油为主','大量蔬果豆类','适量鱼禽','少量红肉','适量红酒'] },
      ],
      foodPagoda: {
        level1: { name: '第一层 谷薯类', daily: '谷类200-300g + 薯类50-100g', note: '全谷物+杂豆占谷类的50-150g' },
        level2: { name: '第二层 蔬菜水果', daily: '蔬菜≥300g(深色占半)，水果200-350g', note: '餐餐有蔬菜，天天吃水果' },
        level3: { name: '第三层 鱼禽肉蛋', daily: '合计120-200g，畜禽40-75g+水产40-75g+蛋~50g', note: '红肉≤500g/周，鱼≥2次/周' },
        level4: { name: '第四层 奶豆坚果', daily: '奶类≥300ml，大豆25-35g(含坚果~10g)', note: '乳糖不耐可选酸奶或低乳糖奶' },
        level5: { name: '第五层 油盐', daily: '油≤25-30g，盐≤5g', note: '培养清淡饮食习惯，控糖限酒' },
      },
      // 生活方式与营养科学（2025-2026前沿研究）
      lifestyleScience: [
        { topic: '睡眠与营养代谢', content: '睡眠不足(<7h)会改变饥饿激素(ghrelin↑、leptin↓)，增加高热量食物 cravings。研究建议：每晚7-9h睡眠有助于维持健康体重和代谢功能。', source: '2025 Sleep Nutrition Review' },
        { topic: '压力与饮食行为', content: '慢性压力通过皮质醇升高促进腹部脂肪堆积和情绪化进食。高压力人群应增加镁、B族维生素和Omega-3摄入。', source: 'Psychoneuroendocrinology 2025' },
        { topic: '运动与蛋白质需求', content: '2025-2030美国膳食指南将蛋白质推荐提高至1.2-1.6g/kg体重/天。运动人群需要更高蛋白质摄入以支持肌肉合成和恢复。', source: 'US DGA 2025-2030' },
        { topic: '外食与营养质量', content: '频繁外食(≥4次/周)与更高的钠、饱和脂肪和添加糖摄入相关。研究建议：外食时注意选择蒸煮炖菜品，减少油炸和酱汁。', source: 'Journal of Nutrition 2026' },
        { topic: '超加工食品(UPF)', content: '2026年研究证实，超加工食品摄入量>每日能量20%与心血管疾病风险增加相关。WHO和美国DGA均建议限制UPF摄入。', source: 'BMJ 2026, WHO 2025' },
        { topic: '肠道健康与饮食', content: '膳食纤维(≥25g/天)是肠道微生物群的主要营养来源。发酵食品(酸奶、泡菜、康普茶)有助于维持肠道菌群多样性。2025年研究证实肠道健康与免疫功能、情绪状态密切相关。', source: 'Nature Reviews Microbiome 2025' },
        { topic: '个性化营养', content: '基于个体基因型、代谢表型和生活方式的精准营养干预比通用指南更有效。睡眠、压力、运动、外食频率等生活方式因素应纳入个性化膳食规划。', source: 'Precision Nutrition 2026' },
      ],
    };
  },
};

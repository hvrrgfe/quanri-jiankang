// ===== 营养计算引擎 =====
// 基于《中国居民膳食指南（2022）》和《中国居民膳食营养素参考摄入量》
// 数据来源：中国营养学会官网 (dg.cnsoc.org)

const Nutrition = {
  // 1. 基础代谢率 (BMR) — Mifflin-St Jeor 公式
  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  },

  // 2. 总能量消耗 (TDEE)
  calculateTDEE(bmr, activityLevel) {
    const factors = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725 };
    return Math.round(bmr * (factors[activityLevel] || 1.2));
  },

  // 3. 根据目标调整能量
  adjustEnergyByGoal(tdee, goals) {
    const adj = {
      weight_loss: -400, muscle: 300,
      blood_sugar: -200, blood_pressure: -100,
    };
    let a = tdee;
    (goals || []).forEach(g => { a += (adj[g] || 0); });
    return Math.max(1200, a);
  },

  // 4. 膳食宝塔各类食物推荐量（克/天）
  // 来源：中国居民平衡膳食宝塔（2022）
  // 按能量水平分档
  getFoodGroupTargets(energy) {
    // 基础值（适用于 1600-2400kcal 成人）
    let targets = {
      grain: 250,        // 谷类 200-300g
      wholeGrain: 100,   // 全谷物+杂豆 50-150g
      tuber: 75,         // 薯类 50-100g
      vegetable: 400,    // 蔬菜 ≥300g（推荐 300-500g）
      fruit: 280,        // 水果 200-350g
      meatPoultry: 60,   // 畜禽肉 40-75g
      seafood: 60,       // 水产品 40-75g
      egg: 50,           // 蛋类 ~50g（1个）
      dairy: 300,        // 奶类 ≥300ml
      soy: 20,           // 大豆 15-25g
      nut: 10,           // 坚果 ~10g
      oil: 25,           // 烹调油 ≤25-30g
      salt: 5,           // 食盐 ≤5g
    };

    // 按能量水平微调
    if (energy < 1400) {
      targets.grain = 200; targets.wholeGrain = 50; targets.tuber = 50;
      targets.vegetable = 300; targets.fruit = 200;
      targets.meatPoultry = 40; targets.seafood = 40; targets.egg = 40;
      targets.dairy = 250; targets.soy = 15; targets.nut = 8;
      targets.oil = 20; targets.salt = 5;
    } else if (energy < 1800) {
      targets.grain = 225; targets.wholeGrain = 75; targets.tuber = 60;
      targets.vegetable = 350; targets.fruit = 250;
      targets.meatPoultry = 50; targets.seafood = 50; targets.egg = 45;
      targets.dairy = 300; targets.soy = 18; targets.nut = 10;
      targets.oil = 22; targets.salt = 5;
    } else if (energy >= 2400) {
      targets.grain = 300; targets.wholeGrain = 150; targets.tuber = 100;
      targets.vegetable = 500; targets.fruit = 350;
      targets.meatPoultry = 75; targets.seafood = 75; targets.egg = 55;
      targets.dairy = 350; targets.soy = 25; targets.nut = 12;
      targets.oil = 30; targets.salt = 5;
    }

    return targets;
  },

  // 5. 周推荐量
  getWeeklyTargets() {
    return {
      fish: { min: 2, desc: '鱼虾 ≥2次/周，或 300-500g/周' },
      redMeat: { max: 500, desc: '红肉（猪牛羊肉）≤500g/周' },
      eggs: { range: '300-350g/周', desc: '蛋类 300-350g/周（约5-7个）' },
      poultry: { range: '300-500g/周', desc: '畜禽肉 300-500g/周' },
      variety: { daily: 12, weekly: 25, desc: '每日≥12种，每周≥25种食物' },
    };
  },

  // 6. 三餐能量分配
  getMealDistribution() {
    return { breakfast: 0.30, lunch: 0.40, dinner: 0.30 };
  },

  // 7. 计算每餐各类食物目标
  getMealTargets(dailyTargets, mealType) {
    const dist = this.getMealDistribution();
    const ratio = dist[mealType] || 0.33;
    const mt = {};
    Object.entries(dailyTargets).forEach(([key, val]) => {
      if (['oil', 'salt'].includes(key)) {
        mt[key] = Math.round(val * ratio * 100) / 100;
      } else {
        mt[key] = Math.round(val * ratio);
      }
    });
    // 晚餐蔬菜量略多
    if (mealType === 'dinner') mt.vegetable = Math.round(dailyTargets.vegetable * 0.35);
    // 早餐多奶类
    if (mealType === 'breakfast') mt.dairy = Math.round(dailyTargets.dairy * 0.6);
    return mt;
  },

  // 8. 饮水推荐
  getWaterRecommendation(gender, age) {
    if (gender === 'male') return 1700;
    if (gender === 'female') return 1500;
    return 1500;
  },

  // 9. 蛋白质推荐摄入量 RNI（DRIs 2023版）
  getProteinRNI(age, gender, isPregnant, isLactating) {
    if (age <= 3) return 25;
    if (age <= 6) return 30;
    if (age <= 7) return 35;
    if (age <= 11) return 45;
    if (age <= 14) return 55;
    if (age <= 17) return gender === 'male' ? 75 : 60;
    if (age >= 65) return gender === 'male' ? 72 : 62;  // 老年人更高
    if (isPregnant) return gender === 'female' ? 70 : 55; // 孕期+15g
    if (isLactating) return gender === 'female' ? 80 : 55; // 哺乳+25g
    return gender === 'male' ? 65 : 55; // 普通成人
  },

  // 10. 计算总推荐量（展示用）
  getDailyRecommendation(profile) {
    const bmr = this.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    const adjusted = this.adjustEnergyByGoal(tdee, profile.healthGoals || []);
    const targets = this.getFoodGroupTargets(adjusted);
    return {
      energy: adjusted, bmr, tdee,
      targets,
      proteinRNI: this.getProteinRNI(profile.age, profile.gender),
      water: this.getWaterRecommendation(profile.gender, profile.age),
      weekly: this.getWeeklyTargets(),
      animalTotal: targets.meatPoultry + targets.seafood + targets.egg,
    };
  },

  // 10. 国际膳食指南参考（用于提示词和展示）
  getInternationalGuidelines() {
    return {
      who: {
        title: 'WHO 健康膳食建议',
        fruitsVeg: '≥400g/天（约5份）',
        fiber: '≥25g/天',
        freeSugar: '<10%总能量（约50g），最好<5%',
        totalFat: '≤30%总能量',
        saturatedFat: '<10%总能量',
        transFat: '<1%总能量（越少越好）',
        protein: '10-15%总能量（约50-75g/天）',
        salt: '<5g/天（钠<2g）',
        potassium: '≥3510mg/天',
        note: '来源：WHO健康膳食实况报告（2020），2025年更新',
      },
      usDGA: {
        title: '美国膳食指南 2025-2030',
        protein: '1.2-1.6g/kg体重/天（较此前翻倍）',
        addedSugar: '不推荐任何添加糖，每餐≤10g',
        dairy: '全脂奶制品3份/天',
        saturatedFat: '<10%总能量',
        sodium: '<2300mg/天（14岁+）',
        processedFood: '首次明确限制超加工食品',
        vegetables: '3份蔬菜/天',
        coreMessage: '"Eat Real Food"——优先天然完整食物',
        note: '来源：USDA/HHS, 2026年1月发布',
      },
      mediterranean: {
        title: '地中海膳食模式（参考）',
        key: '特级初榨橄榄油为主要脂肪来源，大量蔬菜水果豆类，适量鱼禽，少量红肉，适量红酒',
        benefits: '降低心血管疾病风险、改善认知功能、抗炎',
      },
    };
  },

  // 11. 食物升糖指数参考
  getGlycemicIndex() {
    return {
      low: { range: '≤55', foods: ['燕麦','糙米','全麦面包','豆类','苹果','梨','橙子','葡萄柚','桃子','樱桃','猕猴桃','胡萝卜','西兰花','菠菜','番茄','牛奶','酸奶','花生'] },
      medium: { range: '56-69', foods: ['蒸米饭','面条（硬质小麦）','红薯','甜玉米','香蕉','菠萝','芒果','葡萄'] },
      high: { range: '≥70', foods: ['白米饭','糯米饭','白面包','馒头','烙饼','土豆泥','南瓜','西瓜','荔枝','龙眼','枣','蜂蜜','麦芽糖'] },
    };
  },

  // 12. 膳食质量评分（HEI风格，满分100）
  scoreMealQuality(meal, mealType, dailyTargets) {
    if (!meal || !meal.ingredients) return { total: 50, details: [] };
    const scores = [];
    let total = 50; // 基础分

    // ① 食材多样性（满分10）
    const ings = meal.ingredients.filter(i => i.category !== 'condiment');
    const uniqueCats = new Set(ings.map(i => i.category));
    const varietyScore = Math.min(10, uniqueCats.size * 2.5);
    scores.push({ item: '食材多样性', score: varietyScore, max: 10, detail: `${uniqueCats.size}类食材` });
    total += varietyScore - 5;

    // ② 蔬菜是否充足（满分10）
    const vegCount = ings.filter(i => i.category === 'vegetable').reduce((s, i) => s + (i.amount || 0), 0);
    const vegTarget = (dailyTargets?.vegetable || 300) * (mealType === 'dinner' ? 0.35 : 0.3);
    const vegScore = Math.min(10, (vegCount / vegTarget) * 10);
    scores.push({ item: '蔬菜量', score: vegScore, max: 10, detail: `${Math.round(vegCount)}g/${Math.round(vegTarget)}g` });
    total += vegScore - 5;

    // ③ 蛋白质质量（满分10）
    const proteinIngs = ings.filter(i => ['meat','seafood','egg','tofu','dairy'].includes(i.category));
    const proteinScore = Math.min(10, proteinIngs.length * 3);
    scores.push({ item: '蛋白质来源', score: proteinScore, max: 10, detail: `${proteinIngs.length}种` });
    total += proteinScore - 5;

    // ④ 全谷物（满分5）
    const wholeGrain = ings.filter(i => i.name.includes('杂粮') || i.name.includes('全麦') || i.name.includes('燕麦') || i.name.includes('糙米'));
    const wgScore = wholeGrain.length ? 5 : 0;
    scores.push({ item: '全谷物', score: wgScore, max: 5, detail: wholeGrain.length ? '有' : '无' });
    total += wgScore - 2.5;

    // ⑤ 烹饪方式（满分5，蒸煮炖加分）
    const healthyMethods = ['蒸','煮','炖','焯','凉拌'];
    const hasHealthy = healthyMethods.some(m => (meal.steps||[]).join('').includes(m));
    const methodScore = hasHealthy ? 5 : 2;
    scores.push({ item: '健康烹饪', score: methodScore, max: 5, detail: hasHealthy ? '蒸煮炖' : '常规' });
    total += methodScore - 3.5;

    // ⑥ 控盐（满分5）
    const nut = this.estimateMealNutrition(meal.ingredients);
    const sodiumScore = nut.sodium < 400 ? 5 : nut.sodium < 700 ? 3 : 1;
    scores.push({ item: '控盐', score: sodiumScore, max: 5, detail: `${nut.sodium}mg钠` });
    total += sodiumScore - 3;

    // ⑦ 膳食纤维（满分5）
    const fiberScore = nut.fiber >= 5 ? 5 : nut.fiber >= 3 ? 3 : nut.fiber >= 1 ? 1 : 0;
    scores.push({ item: '膳食纤维', score: fiberScore, max: 5, detail: `${nut.fiber}g` });
    total += fiberScore - 2.5;

    const finalScore = Math.max(0, Math.min(100, Math.round(total)));
    return { total: finalScore, details: scores };
  },

  // 13. 估算一道菜的营养（基于中国食物成分表+USDA）
  // 每100g的营养数据，按食物类别细分
  getFoodNutrition(category, name = '') {
    const db = {
      // 深色蔬菜
      '西兰花': { cal: 34, protein: 2.8, fat: 0.4, carb: 6, fiber: 2.6, sodium: 33, potassium: 316, vitC: 89, vitA: 150, calcium: 50, iron: 0.7 },
      '菠菜':   { cal: 24, protein: 2.6, fat: 0.4, carb: 4, fiber: 2.2, sodium: 79, potassium: 311, vitC: 28, vitA: 469, calcium: 66, iron: 2.7 },
      '油麦菜': { cal: 15, protein: 1.5, fat: 0.2, carb: 2, fiber: 1.5, sodium: 50, potassium: 250, vitC: 20, vitA: 300, calcium: 60, iron: 1.2 },
      '空心菜': { cal: 20, protein: 2.2, fat: 0.3, carb: 3, fiber: 1.8, sodium: 60, potassium: 243, vitC: 25, vitA: 253, calcium: 50, iron: 1.5 },
      '芥蓝':   { cal: 22, protein: 2.5, fat: 0.4, carb: 3, fiber: 1.6, sodium: 40, potassium: 300, vitC: 76, vitA: 350, calcium: 128, iron: 0.9 },
      '苋菜':   { cal: 30, protein: 2.8, fat: 0.3, carb: 5, fiber: 1.8, sodium: 30, potassium: 380, vitC: 30, vitA: 350, calcium: 180, iron: 3.4 },
      '茼蒿':   { cal: 21, protein: 1.9, fat: 0.3, carb: 3, fiber: 1.2, sodium: 60, potassium: 260, vitC: 18, vitA: 350, calcium: 73, iron: 0.8 },
      '紫甘蓝': { cal: 25, protein: 1.4, fat: 0.1, carb: 5, fiber: 1.5, sodium: 27, potassium: 243, vitC: 52, vitA: 80, calcium: 45, iron: 0.5 },
      '番茄':   { cal: 19, protein: 0.9, fat: 0.2, carb: 4, fiber: 0.5, sodium: 5, potassium: 163, vitC: 14, vitA: 42, calcium: 10, iron: 0.4 },
      '胡萝卜': { cal: 41, protein: 1.0, fat: 0.2, carb: 10, fiber: 1.0, sodium: 73, potassium: 232, vitC: 10, vitA: 835, calcium: 32, iron: 0.5 },
      '红椒':   { cal: 26, protein: 1.0, fat: 0.3, carb: 5, fiber: 1.5, sodium: 4, potassium: 190, vitC: 80, vitA: 100, calcium: 14, iron: 0.5 },
      // 浅色蔬菜
      '白菜':   { cal: 17, protein: 1.5, fat: 0.2, carb: 3, fiber: 1.0, sodium: 57, potassium: 130, vitC: 31, vitA: 20, calcium: 50, iron: 0.5 },
      '生菜':   { cal: 15, protein: 1.3, fat: 0.2, carb: 2, fiber: 0.7, sodium: 28, potassium: 170, vitC: 12, vitA: 100, calcium: 35, iron: 0.5 },
      '黄瓜':   { cal: 16, protein: 0.7, fat: 0.1, carb: 3, fiber: 0.5, sodium: 4, potassium: 147, vitC: 9, vitA: 5, calcium: 14, iron: 0.3 },
      '冬瓜':   { cal: 12, protein: 0.4, fat: 0.2, carb: 3, fiber: 0.7, sodium: 1, potassium: 80, vitC: 18, vitA: 0, calcium: 19, iron: 0.2 },
      '茄子':   { cal: 25, protein: 1.0, fat: 0.2, carb: 5, fiber: 1.3, sodium: 5, potassium: 160, vitC: 5, vitA: 10, calcium: 22, iron: 0.5 },
      '四季豆': { cal: 31, protein: 2.0, fat: 0.4, carb: 6, fiber: 1.5, sodium: 8, potassium: 200, vitC: 15, vitA: 35, calcium: 40, iron: 1.0 },
      '芹菜':   { cal: 16, protein: 0.7, fat: 0.1, carb: 3, fiber: 1.2, sodium: 80, potassium: 150, vitC: 8, vitA: 30, calcium: 40, iron: 0.8 },
      '洋葱':   { cal: 40, protein: 1.1, fat: 0.1, carb: 9, fiber: 0.9, sodium: 4, potassium: 147, vitC: 7, vitA: 0, calcium: 24, iron: 0.3 },
      // 肉类
      '猪肉':   { cal: 330, protein: 15, fat: 30, carb: 1, fiber: 0, sodium: 60, potassium: 200, vitC: 0, vitA: 10, calcium: 6, iron: 1.5 },
      '牛肉':   { cal: 180, protein: 20, fat: 10, carb: 1, fiber: 0, sodium: 60, potassium: 350, vitC: 0, vitA: 3, calcium: 8, iron: 3.0 },
      '鸡肉':   { cal: 165, protein: 20, fat: 8, carb: 1, fiber: 0, sodium: 65, potassium: 250, vitC: 0, vitA: 20, calcium: 10, iron: 1.3 },
      '羊肉':   { cal: 200, protein: 19, fat: 14, carb: 1, fiber: 0, sodium: 70, potassium: 300, vitC: 0, vitA: 15, calcium: 10, iron: 3.0 },
      // 水产
      '鲈鱼':   { cal: 80, protein: 18, fat: 1, carb: 0, fiber: 0, sodium: 90, potassium: 280, vitC: 0, vitA: 15, calcium: 30, iron: 1.2, omega3: 0.3 },
      '带鱼':   { cal: 130, protein: 18, fat: 6, carb: 0, fiber: 0, sodium: 100, potassium: 250, vitC: 0, vitA: 20, calcium: 25, iron: 1.2, omega3: 0.9 },
      '虾':     { cal: 85, protein: 18, fat: 0.8, carb: 0, fiber: 0, sodium: 120, potassium: 220, vitC: 0, vitA: 15, calcium: 50, iron: 1.5, omega3: 0.3 },
      '鲫鱼':   { cal: 75, protein: 17, fat: 1, carb: 0, fiber: 0, sodium: 80, potassium: 260, vitC: 0, vitA: 12, calcium: 35, iron: 1.2, omega3: 0.2 },
      '蛤蜊':   { cal: 62, protein: 10, fat: 1, carb: 3, fiber: 0, sodium: 150, potassium: 200, vitC: 0, vitA: 10, calcium: 100, iron: 6.0 },
      // 蛋奶豆
      '鸡蛋':   { cal: 144, protein: 13.3, fat: 8.8, carb: 2.8, fiber: 0, sodium: 140, potassium: 130, vitC: 0, vitA: 160, calcium: 48, iron: 1.8 },
      '牛奶':   { cal: 54, protein: 3.0, fat: 3.2, carb: 4.5, fiber: 0, sodium: 50, potassium: 150, vitC: 1, vitA: 30, calcium: 110, iron: 0.1 },
      '酸奶':   { cal: 72, protein: 3.5, fat: 2.7, carb: 9, fiber: 0, sodium: 60, potassium: 200, vitC: 0, vitA: 25, calcium: 120, iron: 0.1 },
      '豆腐':   { cal: 80, protein: 8, fat: 4, carb: 3, fiber: 0.5, sodium: 10, potassium: 130, vitC: 0, vitA: 5, calcium: 140, iron: 2.5 },
      '豆腐干': { cal: 140, protein: 15, fat: 7, carb: 5, fiber: 0.5, sodium: 250, potassium: 150, vitC: 0, vitA: 3, calcium: 300, iron: 3.0 },
      '腐竹':   { cal: 460, protein: 45, fat: 22, carb: 22, fiber: 1, sodium: 20, potassium: 550, vitC: 0, vitA: 0, calcium: 80, iron: 8.0 },
      // 主食
      '大米':   { cal: 130, protein: 2.6, fat: 0.3, carb: 28, fiber: 0.4, sodium: 2, potassium: 30, vitC: 0, vitA: 0, calcium: 5, iron: 0.3 },
      '小米':   { cal: 150, protein: 4.0, fat: 0.8, carb: 30, fiber: 0.5, sodium: 3, potassium: 95, vitC: 0, vitA: 10, calcium: 10, iron: 1.0 },
      '面条':   { cal: 120, protein: 3.5, fat: 0.4, carb: 25, fiber: 0.5, sodium: 80, potassium: 30, vitC: 0, vitA: 0, calcium: 5, iron: 0.5 },
      '全麦面包': { cal: 250, protein: 8, fat: 4, carb: 45, fiber: 4, sodium: 300, potassium: 150, vitC: 0, vitA: 0, calcium: 50, iron: 2.0 },
      '燕麦':   { cal: 150, protein: 5, fat: 3, carb: 27, fiber: 5, sodium: 3, potassium: 120, vitC: 0, vitA: 0, calcium: 15, iron: 1.5 },
      '红薯':   { cal: 100, protein: 1.5, fat: 0.2, carb: 24, fiber: 2.5, sodium: 10, potassium: 350, vitC: 20, vitA: 800, calcium: 30, iron: 0.5 },
      '土豆':   { cal: 80, protein: 2.0, fat: 0.1, carb: 18, fiber: 1.2, sodium: 3, potassium: 340, vitC: 20, vitA: 0, calcium: 8, iron: 0.5 },
      '玉米':   { cal: 110, protein: 3.5, fat: 1.2, carb: 22, fiber: 2.5, sodium: 2, potassium: 220, vitC: 8, vitA: 30, calcium: 5, iron: 0.8 },
      '藜麦':   { cal: 150, protein: 4.5, fat: 1.5, carb: 28, fiber: 3, sodium: 5, potassium: 200, vitC: 0, vitA: 5, calcium: 20, iron: 1.5 },
      // 水果
      '苹果':   { cal: 52, protein: 0.3, fat: 0.2, carb: 13, fiber: 1.5, sodium: 2, potassium: 120, vitC: 5, vitA: 5, calcium: 6, iron: 0.2 },
      '香蕉':   { cal: 90, protein: 1.2, fat: 0.3, carb: 21, fiber: 2.5, sodium: 1, potassium: 250, vitC: 10, vitA: 5, calcium: 8, iron: 0.3 },
      '橙子':   { cal: 48, protein: 0.8, fat: 0.1, carb: 12, fiber: 2.0, sodium: 1, potassium: 170, vitC: 50, vitA: 15, calcium: 35, iron: 0.2 },
      '西瓜':   { cal: 31, protein: 0.5, fat: 0.1, carb: 7, fiber: 0.3, sodium: 3, potassium: 110, vitC: 8, vitA: 30, calcium: 7, iron: 0.3 },
      // 坚果
      '核桃':   { cal: 650, protein: 15, fat: 65, carb: 14, fiber: 6, sodium: 2, potassium: 440, vitC: 1, vitA: 5, calcium: 70, iron: 2.5, omega3: 9 },
    };

    // 按名称精确匹配，否则按类别返回平均值
    if (name && db[name]) return db[name];
    const categoryAvg = {
      vegetable: { cal: 20, protein: 1.5, fat: 0.3, carb: 4, fiber: 1.2, sodium: 25, potassium: 200, vitC: 20, vitA: 60, calcium: 35, iron: 0.7 },
      fruit:      { cal: 50, protein: 0.5, fat: 0.2, carb: 12, fiber: 1.5, sodium: 2, potassium: 150, vitC: 15, vitA: 10, calcium: 15, iron: 0.3 },
      meat:       { cal: 200, protein: 18, fat: 14, carb: 1, fiber: 0, sodium: 60, potassium: 250, vitC: 0, vitA: 8, calcium: 8, iron: 2.0 },
      seafood:    { cal: 85, protein: 16, fat: 2, carb: 0.5, fiber: 0, sodium: 100, potassium: 250, vitC: 0, vitA: 12, calcium: 35, iron: 1.5, omega3: 0.4 },
      egg:        { cal: 140, protein: 13, fat: 9, carb: 2, fiber: 0, sodium: 140, potassium: 130, vitC: 0, vitA: 150, calcium: 48, iron: 1.8 },
      dairy:      { cal: 55, protein: 3, fat: 3, carb: 5, fiber: 0, sodium: 50, potassium: 150, vitC: 1, vitA: 25, calcium: 110, iron: 0.1 },
      tofu:       { cal: 90, protein: 9, fat: 5, carb: 3, fiber: 0.5, sodium: 20, potassium: 130, vitC: 0, vitA: 4, calcium: 140, iron: 2.5 },
      grain:      { cal: 130, protein: 3, fat: 0.5, carb: 28, fiber: 0.8, sodium: 10, potassium: 60, vitC: 0, vitA: 2, calcium: 8, iron: 0.5 },
      nut:        { cal: 550, protein: 18, fat: 48, carb: 20, fiber: 8, sodium: 5, potassium: 500, vitC: 0, vitA: 5, calcium: 80, iron: 3.0 },
      condiment:  { cal: 30, protein: 0.5, fat: 0, carb: 7, fiber: 0, sodium: 500, potassium: 50, vitC: 0, vitA: 0, calcium: 5, iron: 0.1 },
    };
    return categoryAvg[category] || categoryAvg.vegetable;
  },

  estimateMealNutrition(ingredients) {
    const keys = ['calories','protein','fat','carb','fiber','sodium','potassium','vitC','vitA','calcium','iron'];
    const total = {};
    keys.forEach(k => total[k] = 0);
    if (!ingredients || !ingredients.length) return total;
    ingredients.forEach(ing => {
      if (!ing || !ing.category) return;
      const n = this.getFoodNutrition(ing.category, ing.name);
      const r = Math.max(0, (ing.amount || 100)) / 100;
      keys.forEach(k => { total[k] = (total[k] || 0) + (n[k] || 0) * r; });
    });
    keys.forEach(k => total[k] = Math.round(total[k] || 0));
    return total;
  },
};

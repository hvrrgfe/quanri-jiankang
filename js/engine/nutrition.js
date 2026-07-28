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

  // 9. 计算总推荐量（展示用）
  getDailyRecommendation(profile) {
    const bmr = this.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    const adjusted = this.adjustEnergyByGoal(tdee, profile.healthGoals || []);
    const targets = this.getFoodGroupTargets(adjusted);
    return {
      energy: adjusted, bmr, tdee,
      targets,
      water: this.getWaterRecommendation(profile.gender, profile.age),
      weekly: this.getWeeklyTargets(),
      // 肉蛋水产合计
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

  // 12. 估算一道菜的营养（增强版）
  // 基于《中国食物成分表》标准版+USDA标准参考
  estimateMealNutrition(ingredients) {
    const nut100g = {
      vegetable: { cal: 25, protein: 1.5, fat: 0.3, carb: 4, fiber: 1.2, sodium: 10, potassium: 200, vitC: 15, vitA: 50, calcium: 40, iron: 0.8 },
      fruit:      { cal: 50, protein: 0.5, fat: 0.2, carb: 12, fiber: 2, sodium: 2, potassium: 150, vitC: 20, vitA: 10, calcium: 15, iron: 0.3 },
      meat:       { cal: 200, protein: 20, fat: 13, carb: 1, fiber: 0, sodium: 60, potassium: 300, vitC: 0, vitA: 5, calcium: 10, iron: 2.5 },
      seafood:    { cal: 90, protein: 17, fat: 2, carb: 1, fiber: 0, sodium: 100, potassium: 280, vitC: 0, vitA: 15, calcium: 30, iron: 1.2 },
      egg:        { cal: 140, protein: 13, fat: 9, carb: 1.5, fiber: 0, sodium: 140, potassium: 130, vitC: 0, vitA: 160, calcium: 50, iron: 1.8 },
      dairy:      { cal: 55, protein: 3, fat: 3, carb: 5, fiber: 0, sodium: 50, potassium: 150, vitC: 1, vitA: 30, calcium: 120, iron: 0.1 },
      tofu:       { cal: 80, protein: 8, fat: 4, carb: 3, fiber: 0.5, sodium: 10, potassium: 130, vitC: 0, vitA: 5, calcium: 140, iron: 2.5 },
      grain:      { cal: 130, protein: 3, fat: 0.5, carb: 28, fiber: 1, sodium: 2, potassium: 90, vitC: 0, vitA: 0, calcium: 10, iron: 0.5 },
      nut:        { cal: 550, protein: 18, fat: 48, carb: 20, fiber: 8, sodium: 5, potassium: 500, vitC: 0, vitA: 5, calcium: 80, iron: 3.0 },
      condiment:  { cal: 30, protein: 0.5, fat: 0, carb: 7, fiber: 0, sodium: 500, potassium: 50, vitC: 0, vitA: 0, calcium: 5, iron: 0.1 },
    };
    const keys = ['calories','protein','fat','carb','fiber','sodium','potassium','vitC','vitA','calcium','iron'];
    const total = {};
    keys.forEach(k => total[k] = 0);
    if (!ingredients || !ingredients.length) return total;
    ingredients.forEach(ing => {
      if (!ing || !ing.category) return;
      const n = nut100g[ing.category] || nut100g.vegetable;
      const r = Math.max(0, (ing.amount || 100)) / 100;
      keys.forEach(k => { total[k] = (total[k] || 0) + (n[k] || 0) * r; });
    });
    keys.forEach(k => total[k] = Math.round(total[k] || 0));
    return total;
  },
};

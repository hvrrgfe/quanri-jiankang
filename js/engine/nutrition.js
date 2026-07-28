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

  // 10. 估算一道菜的营养
  estimateMealNutrition(ingredients) {
    const nut100g = {
      vegetable: { cal: 25, protein: 1.5, fat: 0.3, carb: 4, fiber: 1.2, sodium: 10 },
      fruit: { cal: 50, protein: 0.5, fat: 0.2, carb: 12, fiber: 2, sodium: 2 },
      meat: { cal: 200, protein: 20, fat: 13, carb: 1, fiber: 0, sodium: 60 },
      seafood: { cal: 90, protein: 17, fat: 2, carb: 1, fiber: 0, sodium: 100 },
      egg: { cal: 140, protein: 13, fat: 9, carb: 1.5, fiber: 0, sodium: 140 },
      dairy: { cal: 55, protein: 3, fat: 3, carb: 5, fiber: 0, sodium: 50 },
      tofu: { cal: 80, protein: 8, fat: 4, carb: 3, fiber: 0.5, sodium: 10 },
      grain: { cal: 130, protein: 3, fat: 0.5, carb: 28, fiber: 1, sodium: 2 },
      condiment: { cal: 30, protein: 0.5, fat: 0, carb: 7, fiber: 0, sodium: 500 },
    };
    const total = { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0, sodium: 0 };
    if (!ingredients || !ingredients.length) return total;
    (ingredients || []).forEach(ing => {
      if (!ing || !ing.category) return;
      const n = nut100g[ing.category] || nut100g.vegetable;
      const r = Math.max(0, (ing.amount || 100)) / 100;
      Object.keys(total).forEach(k => { total[k] = (total[k] || 0) + (n[k] || 0) * r; });
    });
    Object.keys(total).forEach(k => { total[k] = Math.round(total[k] || 0); });
    return total;
  },
};

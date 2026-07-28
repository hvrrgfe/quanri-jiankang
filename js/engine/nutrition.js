// ===== 营养计算引擎 =====
// 基于《中国居民膳食指南（2022）》和《中国居民膳食营养素参考摄入量》
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
    const goalAdjustments = {
      weight_loss: -400,
      muscle: 300,
      blood_sugar: -200,
      blood_pressure: -100,
    };
    let adjusted = tdee;
    (goals || []).forEach(g => {
      adjusted += (goalAdjustments[g] || 0);
    });
    return Math.max(1200, adjusted); // 最低不低于 1200 kcal
  },

  // 4. 膳食宝塔各类食物推荐量（克/天）
  getFoodGroupTargets(energy) {
    // 基于能量水平的膳食宝塔分配
    if (energy < 1400) {
      return {
        grain: 200,        // 谷薯类
        vegetable: 300,    // 蔬菜
        fruit: 200,        // 水果
        meatEgg: 120,      // 肉蛋
        seafood: 40,       // 水产
        dairy: 300,        // 奶类 ml
        soy: 15,           // 大豆
        nut: 10,           // 坚果
        oil: 20,           // 油
        salt: 5,           // 盐
      };
    } else if (energy < 1800) {
      return {
        grain: 250, vegetable: 400, fruit: 250,
        meatEgg: 150, seafood: 50, dairy: 300,
        soy: 20, nut: 15, oil: 25, salt: 5,
      };
    } else if (energy < 2200) {
      return {
        grain: 300, vegetable: 450, fruit: 300,
        meatEgg: 175, seafood: 60, dairy: 300,
        soy: 25, nut: 15, oil: 25, salt: 5,
      };
    } else {
      return {
        grain: 350, vegetable: 500, fruit: 350,
        meatEgg: 200, seafood: 75, dairy: 300,
        soy: 30, nut: 15, oil: 30, salt: 5,
      };
    }
  },

  // 5. 三餐能量分配
  getMealDistribution() {
    return { breakfast: 0.30, lunch: 0.40, dinner: 0.30 };
  },

  // 6. 计算每餐各类食物目标
  getMealTargets(dailyTargets, mealType) {
    const dist = this.getMealDistribution();
    const ratio = dist[mealType] || 0.33;
    const mealTargets = {};
    Object.entries(dailyTargets).forEach(([key, val]) => {
      if (['oil', 'salt'].includes(key)) {
        mealTargets[key] = Math.round(val * ratio * 100) / 100;
      } else {
        mealTargets[key] = Math.round(val * ratio);
      }
    });
    // 晚餐蔬菜量可略多
    if (mealType === 'dinner') {
      mealTargets.vegetable = Math.round(dailyTargets.vegetable * 0.35);
    }
    return mealTargets;
  },

  // 7. 计算一日总推荐量（对用户友好的展示）
  getDailyRecommendation(profile) {
    const bmr = this.calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    const adjusted = this.adjustEnergyByGoal(tdee, profile.healthGoals || []);
    const targets = this.getFoodGroupTargets(adjusted);
    return { energy: adjusted, targets, bmr, tdee };
  },

  // 8. 估算一道菜的营养（基于食材类别）
  estimateMealNutrition(ingredients) {
    // 粗略估算值（每100g）
    const nutritionPer100g = {
      vegetable: { cal: 25, protein: 1.5, fat: 0.3, carb: 4 },
      fruit: { cal: 50, protein: 0.5, fat: 0.2, carb: 12 },
      meat: { cal: 200, protein: 20, fat: 13, carb: 1 },
      seafood: { cal: 90, protein: 17, fat: 2, carb: 1 },
      egg: { cal: 140, protein: 13, fat: 9, carb: 1.5 },
      dairy: { cal: 55, protein: 3, fat: 3, carb: 5 },
      tofu: { cal: 80, protein: 8, fat: 4, carb: 3 },
      grain: { cal: 130, protein: 3, fat: 0.5, carb: 28 },
      condiment: { cal: 30, protein: 0.5, fat: 0, carb: 7 },
    };

    let total = { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0, sodium: 0 };
    (ingredients || []).forEach(ing => {
      const nut = nutritionPer100g[ing.category] || nutritionPer100g.vegetable;
      const amount = ing.amount || 100;
      const ratio = amount / 100;
      total.calories += (nut.cal * ratio);
      total.protein += (nut.protein * ratio);
      total.fat += (nut.fat * ratio);
      total.carb += (nut.carb * ratio);
    });
    // 四舍五入
    Object.keys(total).forEach(k => { total[k] = Math.round(total[k]); });
    return total;
  },
};

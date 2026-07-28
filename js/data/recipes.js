// ===== 菜谱数据库 =====
// 结构化菜谱数据，用于本地生成+搜索+AI参考
const RECIPES = {
  version: '1.0',
  lastUpdated: '2026-07-28',

  // 按分类索引
  byCategory: {},

  // 全部菜谱
  _recipes: [],

  // 初始化
  init() {
    this._recipes = this._buildRecipes();
    this._index();
    return this;
  },

  _index() {
    this.byCategory = {};
    this._recipes.forEach(r => {
      const cat = r.category || '家常';
      if (!this.byCategory[cat]) this.byCategory[cat] = [];
      this.byCategory[cat].push(r);
    });
  },

  getAll() { return this._recipes; },

  getByCategory(cat) { return this.byCategory[cat] || []; },

  getCategories() { return Object.keys(this.byCategory); },

  getById(id) { return this._recipes.find(r => r.id === id); },

  // 搜索
  search(query) {
    if (!query || !query.trim()) return this._recipes;
    const q = query.trim().toLowerCase();
    return this._recipes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (r.ingredients || []).some(i => i.name.toLowerCase().includes(q))
    );
  },

  // 按条件过滤
  filter(opts = {}) {
    let results = [...this._recipes];
    if (opts.mealType) results = results.filter(r => r.mealType === opts.mealType);
    if (opts.maxTime) results = results.filter(r => (r.cookTime || 999) <= opts.maxTime);
    if (opts.difficulty) results = results.filter(r => (r.difficulty || 1) <= opts.difficulty);
    if (opts.tags?.length) {
      results = results.filter(r =>
        opts.tags.some(t => (r.tags || []).includes(t))
      );
    }
    if (opts.tools?.length) {
      results = results.filter(r =>
        opts.tools.some(t => (r.tools || []).includes(t))
      );
    }
    return results;
  },

  // 随机推荐
  recommend(count = 3, excludeIds = []) {
    const pool = this._recipes.filter(r => !excludeIds.includes(r.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, pool.length));
  },

  // ===== 构建菜谱数据 =====
  _buildRecipes() {
    return [
      // ===== 早餐类 =====
      { id: 'B01', name: '白煮蛋+全麦面包+牛奶', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 5, prepTime: 2,
        ingredients: [{ name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '全麦面包', category: 'grain', amount: 100, unit: 'g' }, { name: '牛奶', category: 'dairy', amount: 250, unit: 'ml' }],
        nutrition: { calories: 350, protein: 20, fat: 12, carb: 40, fiber: 4, sodium: 300 },
        tags: ['快手', '早餐', '营养均衡'], tools: ['煮锅'],
        taste: { spicy: 0, sour: 0, sweet: 1, salty: 1, oily: 1 },
        costPerServing: 5, season: ['全年'], suitableFor: ['普通', '儿童', '减脂'],
        steps: ['鸡蛋冷水下锅煮8分钟', '全麦面包烤1分钟或直接吃', '牛奶加热或不加热直接饮用'],
        mealPrep: { canPrep: false, storage: '常温', shelfLife: 1 } },

      { id: 'B02', name: '小米粥+煮鸡蛋+拌黄瓜', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 20, prepTime: 2,
        ingredients: [{ name: '小米', category: 'grain', amount: 50, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '黄瓜', category: 'vegetable', amount: 100, unit: 'g' }],
        nutrition: { calories: 280, protein: 14, fat: 8, carb: 40, fiber: 2, sodium: 200 },
        tags: ['早餐', '养胃', '清淡'], tools: ['煮锅'],
        taste: { spicy: 0, sour: 1, sweet: 0, salty: 1, oily: 0 },
        costPerServing: 4, season: ['全年'], suitableFor: ['普通', '老人', '孕妇'],
        steps: ['小米淘洗后下锅，加水大火煮开转小火煮20分钟', '鸡蛋冷水下锅煮8分钟', '黄瓜拍碎加蒜末醋盐拌匀'],
        mealPrep: { canPrep: false, storage: '常温', shelfLife: 1 } },

      { id: 'B03', name: '豆浆+油条（少油版）', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 10, prepTime: 1,
        ingredients: [{ name: '豆浆', category: 'dairy', amount: 300, unit: 'ml' }, { name: '油条', category: 'grain', amount: 80, unit: 'g' }],
        nutrition: { calories: 320, protein: 12, fat: 15, carb: 35, fiber: 1, sodium: 400 },
        tags: ['早餐', '传统'], tools: [], costPerServing: 5, season: ['全年'], suitableFor: ['普通'],
        steps: ['豆浆加热至冒泡', '油条复炸1分钟或直接吃'], mealPrep: { canPrep: false, storage: '常温', shelfLife: 1 } },

      { id: 'B04', name: '燕麦牛奶+香蕉', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 3, prepTime: 1,
        ingredients: [{ name: '燕麦', category: 'grain', amount: 40, unit: 'g' }, { name: '牛奶', category: 'dairy', amount: 250, unit: 'ml' }, { name: '香蕉', category: 'fruit', amount: 100, unit: 'g' }],
        nutrition: { calories: 320, protein: 14, fat: 8, carb: 50, fiber: 6, sodium: 150 },
        tags: ['快手', '减脂', '早餐'], tools: ['微波炉'], costPerServing: 6, season: ['全年'], suitableFor: ['普通', '减脂', '健身'],
        steps: ['燕麦放入碗中', '牛奶加热倒入燕麦', '香蕉切片放入拌匀'], mealPrep: { canPrep: false, storage: '常温', shelfLife: 1 } },

      { id: 'B05', name: '番茄鸡蛋面', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 12, prepTime: 3,
        ingredients: [{ name: '番茄', category: 'vegetable', amount: 150, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '挂面', category: 'grain', amount: 100, unit: 'g' }],
        nutrition: { calories: 380, protein: 16, fat: 8, carb: 60, fiber: 2, sodium: 500 },
        tags: ['快手', '早餐', '暖胃'], tools: ['煮锅', '炒锅'], costPerServing: 6, season: ['全年'], suitableFor: ['普通'],
        steps: ['番茄切块', '锅中少许油炒番茄出汁', '加水煮开下面条', '打入蛋花加盐调味'] },

      { id: 'B06', name: '馄饨+紫菜虾皮汤', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 8, prepTime: 1,
        ingredients: [{ name: '馄饨', category: 'grain', amount: 150, unit: 'g' }, { name: '紫菜', category: 'vegetable', amount: 5, unit: 'g' }, { name: '虾皮', category: 'seafood', amount: 5, unit: 'g' }],
        nutrition: { calories: 300, protein: 15, fat: 8, carb: 45, fiber: 1, sodium: 600 },
        tags: ['快手', '早餐'], tools: ['煮锅'], costPerServing: 7, season: ['全年'], suitableFor: ['普通'],
        steps: ['水开下馄饨煮至浮起', '碗中放紫菜虾皮', '馄饨连汤倒入碗中'] },

      { id: 'B07', name: '杂粮粥+煎蛋', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 25, prepTime: 5,
        ingredients: [{ name: '杂粮', category: 'grain', amount: 60, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }],
        nutrition: { calories: 300, protein: 15, fat: 10, carb: 40, fiber: 5, sodium: 200 },
        tags: ['早餐', '控糖', '养胃'], tools: ['煮锅', '煎锅'], costPerServing: 4, season: ['全年'], suitableFor: ['普通', '老人', '控糖'],
        steps: ['杂粮提前泡水30分钟', '煮至软烂浓稠', '平底锅煎荷包蛋'] },

      { id: 'B08', name: '三明治+牛奶', category: '早餐', mealType: 'breakfast', difficulty: 1, cookTime: 8, prepTime: 3,
        ingredients: [{ name: '全麦面包', category: 'grain', amount: 100, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '生菜', category: 'vegetable', amount: 30, unit: 'g' }, { name: '火腿', category: 'meat', amount: 30, unit: 'g' }, { name: '牛奶', category: 'dairy', amount: 250, unit: 'ml' }],
        nutrition: { calories: 400, protein: 22, fat: 14, carb: 45, fiber: 4, sodium: 600 },
        tags: ['快手', '早餐', '上班族'], tools: ['煎锅'], costPerServing: 8, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡蛋煎熟', '面包烤一下', '依次夹入生菜鸡蛋火腿', '对半切开配牛奶'] },

      // ===== 猪肉类 =====
      { id: 'P01', name: '红烧肉', category: '午餐/晚餐·猪肉', mealType: 'dinner', difficulty: 2, cookTime: 60, prepTime: 10,
        ingredients: [{ name: '五花肉', category: 'meat', amount: 300, unit: 'g' }, { name: '葱', category: 'condiment', amount: 10, unit: 'g' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['下饭', '经典', '宴客'], tools: ['炒锅', '汤锅'],
        taste: { spicy: 0, sour: 0, sweet: 3, salty: 3, oily: 4 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通'],
        steps: ['五花肉切3cm方块冷水下锅焯水捞出', '锅中放少许油炒糖色至焦糖色', '下五花肉翻炒上色', '加葱姜料酒生抽老抽', '加热水没过肉大火烧开转小火炖50分钟', '大火收汁浓稠即可'],
        mealPrep: { canPrep: true, prepSteps: ['五花肉切块焯水→冷冻'], storage: '冷冻', shelfLife: 30 } },

      { id: 'P02', name: '青椒肉丝', category: '午餐/晚餐·猪肉', mealType: 'lunch', difficulty: 1, cookTime: 20, prepTime: 10,
        ingredients: [{ name: '猪里脊', category: 'meat', amount: 150, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 150, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '下饭', '日常'], tools: ['炒锅'],
        taste: { spicy: 2, sour: 0, sweet: 1, salty: 2, oily: 2 },
        costPerServing: 8, season: ['全年'], suitableFor: ['普通'],
        steps: ['里脊切丝加料酒生抽淀粉腌制10分钟', '青椒切丝蒜切末', '热锅凉油滑炒肉丝至变色盛出', '爆香蒜末加青椒翻炒', '倒回肉丝加盐生抽调味快速翻炒出锅'] },

      { id: 'P03', name: '鱼香肉丝', category: '午餐/晚餐·猪肉', mealType: 'lunch', difficulty: 2, cookTime: 25, prepTime: 10,
        ingredients: [{ name: '猪里脊', category: 'meat', amount: 150, unit: 'g' }, { name: '木耳', category: 'vegetable', amount: 50, unit: 'g' }, { name: '胡萝卜', category: 'vegetable', amount: 50, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['下饭', '经典', '酸甜'], tools: ['炒锅'],
        taste: { spicy: 2, sour: 3, sweet: 3, salty: 2, oily: 3 },
        costPerServing: 9, season: ['全年'], suitableFor: ['普通'],
        steps: ['肉切丝腌制', '木耳泡发胡萝卜青椒切丝', '调鱼香汁（醋3生抽2糖1.5淀粉1水2）', '滑炒肉丝盛出', '爆香蒜末豆瓣酱加蔬菜炒', '加肉丝和酱汁翻炒出锅'] },

      { id: 'P04', name: '糖醋排骨', category: '午餐/晚餐·猪肉', mealType: 'dinner', difficulty: 2, cookTime: 40, prepTime: 10,
        ingredients: [{ name: '排骨', category: 'meat', amount: 400, unit: 'g' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['下饭', '宴客', '孩子爱'], tools: ['炒锅', '汤锅'],
        taste: { spicy: 0, sour: 3, sweet: 4, salty: 2, oily: 3 },
        costPerServing: 15, season: ['全年'], suitableFor: ['普通', '儿童'],
        steps: ['排骨冷水下锅加姜片焯水', '调糖醋汁（料酒1生抽2糖3醋4水5）', '排骨煎至两面金黄', '倒入糖醋汁和没过排骨的热水', '大火烧开转小火炖30分钟', '大火收汁撒芝麻'] },

      { id: 'P05', name: '回锅肉', category: '午餐/晚餐·猪肉', mealType: 'lunch', difficulty: 2, cookTime: 25, prepTime: 15,
        ingredients: [{ name: '五花肉', category: 'meat', amount: 200, unit: 'g' }, { name: '蒜苗', category: 'vegetable', amount: 100, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 50, unit: 'g' }, { name: '豆瓣酱', category: 'condiment', amount: 15, unit: 'g' }],
        tags: ['下饭', '经典', '香辣'], tools: ['炒锅', '煮锅'],
        taste: { spicy: 3, sour: 0, sweet: 1, salty: 3, oily: 4 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通'],
        steps: ['五花肉整块冷水下锅煮至八分熟', '捞出切薄片', '蒜苗切段', '锅中不放油直接煸肉片出油', '加豆瓣酱炒出红油', '加蒜苗青椒翻炒出锅'] },

      { id: 'P06', name: '小炒肉（湖南）', category: '午餐/晚餐·猪肉', mealType: 'lunch', difficulty: 1, cookTime: 18, prepTime: 8,
        ingredients: [{ name: '五花肉', category: 'meat', amount: 200, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 100, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['下饭', '香辣', '快手'], tools: ['炒锅'],
        taste: { spicy: 4, sour: 0, sweet: 0, salty: 3, oily: 3 },
        costPerServing: 9, season: ['全年'], suitableFor: ['普通'],
        steps: ['五花肉切薄片', '青椒斜切圈蒜拍碎', '中火煸肉片出油至微焦', '加蒜和豆豉炒香', '加青椒大火翻炒加盐生抽', '炒至青椒表皮微焦出锅'] },

      // ===== 鸡肉类 =====
      { id: 'C01', name: '宫保鸡丁', category: '午餐/晚餐·鸡肉', mealType: 'lunch', difficulty: 2, cookTime: 25, prepTime: 10,
        ingredients: [{ name: '鸡胸肉', category: 'meat', amount: 200, unit: 'g' }, { name: '花生', category: 'vegetable', amount: 30, unit: 'g' }, { name: '黄瓜', category: 'vegetable', amount: 80, unit: 'g' }, { name: '胡萝卜', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['下饭', '经典', '酸甜辣'], tools: ['炒锅'],
        taste: { spicy: 3, sour: 2, sweet: 3, salty: 2, oily: 3 },
        costPerServing: 9, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡胸肉切丁加料酒盐淀粉腌制15分钟', '黄瓜胡萝卜切丁', '调宫保汁（醋2生抽1糖1.5淀粉1水2）', '炒花生米盛出', '滑炒鸡丁变色盛出', '爆香干辣椒花椒加蔬菜鸡丁和酱汁收汁加花生'] },

      { id: 'C02', name: '可乐鸡翅', category: '午餐/晚餐·鸡肉', mealType: 'dinner', difficulty: 1, cookTime: 25, prepTime: 5,
        ingredients: [{ name: '鸡翅', category: 'meat', amount: 300, unit: 'g' }, { name: '可乐', category: 'condiment', amount: 300, unit: 'ml' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '孩子爱', '咸甜'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 4, salty: 2, oily: 2 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通', '儿童'],
        steps: ['鸡翅两面划刀冷水焯水', '平底锅少许油煎至两面金黄', '倒入可乐没过鸡翅', '加姜片生抽大火烧开转中小火', '炖15分钟至汤汁浓稠', '大火收汁即可'] },

      { id: 'C03', name: '黄焖鸡', category: '午餐/晚餐·鸡肉', mealType: 'dinner', difficulty: 2, cookTime: 35, prepTime: 10,
        ingredients: [{ name: '鸡腿', category: 'meat', amount: 300, unit: 'g' }, { name: '香菇', category: 'vegetable', amount: 50, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 50, unit: 'g' }, { name: '土豆', category: 'vegetable', amount: 100, unit: 'g' }],
        tags: ['下饭', '家常', '一锅出'], tools: ['炒锅'],
        taste: { spicy: 1, sour: 0, sweet: 1, salty: 3, oily: 2 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡腿剁块焯水', '土豆切块香菇泡发', '炒糖色加鸡块', '加香菇水生抽蚝油', '加土豆炖20分钟', '加青椒收汁'] },

      { id: 'C04', name: '土豆炖鸡块', category: '午餐/晚餐·鸡肉', mealType: 'lunch', difficulty: 1, cookTime: 30, prepTime: 8,
        ingredients: [{ name: '鸡腿', category: 'meat', amount: 250, unit: 'g' }, { name: '土豆', category: 'vegetable', amount: 200, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['下饭', '家常', '一锅出'], tools: ['炒锅'],
        taste: { spicy: 1, sour: 0, sweet: 0, salty: 3, oily: 2 },
        costPerServing: 8, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡腿剁块焯水', '土豆切块青椒切片', '爆香姜片炒鸡块', '加生抽老抽炒匀', '加土豆和水炖20分钟', '加青椒收汁出锅'] },

      // ===== 牛肉类 =====
      { id: 'N01', name: '番茄牛腩', category: '午餐/晚餐·牛肉', mealType: 'dinner', difficulty: 2, cookTime: 60, prepTime: 10,
        ingredients: [{ name: '牛腩', category: 'meat', amount: 300, unit: 'g' }, { name: '番茄', category: 'vegetable', amount: 200, unit: 'g' }, { name: '洋葱', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['高蛋白', '补铁', '下饭', '适合带饭'], tools: ['炒锅', '汤锅'],
        taste: { spicy: 0, sour: 3, sweet: 3, salty: 2, oily: 2 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通', '儿童', '老人'],
        steps: ['牛腩切块冷水焯水', '番茄切块洋葱切丝', '炒香洋葱加番茄炒出汁', '加牛腩和热水没过食材', '加番茄酱盐糖生抽小火炖50分钟', '大火收汁可留汤拌饭'],
        mealPrep: { canPrep: true, prepSteps: ['牛腩切块焯水冷冻', '番茄切块冷冻'], storage: '冷冻', shelfLife: 30 } },

      { id: 'N02', name: '土豆炖牛肉', category: '午餐/晚餐·牛肉', mealType: 'dinner', difficulty: 2, cookTime: 50, prepTime: 10,
        ingredients: [{ name: '牛腩', category: 'meat', amount: 300, unit: 'g' }, { name: '土豆', category: 'vegetable', amount: 200, unit: 'g' }, { name: '胡萝卜', category: 'vegetable', amount: 100, unit: 'g' }],
        tags: ['下饭', '家常', '适合带饭'], tools: ['炒锅', '汤锅'],
        taste: { spicy: 0, sour: 0, sweet: 1, salty: 3, oily: 2 },
        costPerServing: 11, season: ['全年'], suitableFor: ['普通'],
        steps: ['牛腩切块焯水', '土豆胡萝卜切块', '爆香姜片炒牛腩', '加生抽老抽翻炒', '加水和土豆胡萝卜炖40分钟', '收汁调味出锅'] },

      { id: 'N03', name: '黑椒牛柳', category: '午餐/晚餐·牛肉', mealType: 'lunch', difficulty: 2, cookTime: 18, prepTime: 10,
        ingredients: [{ name: '牛里脊', category: 'meat', amount: 200, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 100, unit: 'g' }, { name: '洋葱', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['快手', '西餐風', '高蛋白'], tools: ['炒锅'],
        taste: { spicy: 2, sour: 0, sweet: 0, salty: 3, oily: 2 },
        costPerServing: 14, season: ['全年'], suitableFor: ['普通', '减脂'],
        steps: ['牛里脊切条加料酒黑胡椒淀粉腌制', '青椒洋葱切丝', '热锅热油滑炒牛柳变色盛出', '炒洋葱青椒', '倒回牛柳加蚝油黑胡椒快速翻炒'] },

      { id: 'N04', name: '洋葱炒牛肉', category: '午餐/晚餐·牛肉', mealType: 'lunch', difficulty: 1, cookTime: 15, prepTime: 8,
        ingredients: [{ name: '牛里脊', category: 'meat', amount: 200, unit: 'g' }, { name: '洋葱', category: 'vegetable', amount: 150, unit: 'g' }],
        tags: ['快手', '下饭', '日常'], tools: ['炒锅'],
        taste: { spicy: 1, sour: 0, sweet: 2, salty: 2, oily: 2 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通'],
        steps: ['牛肉切薄片加料酒生抽淀粉腌制', '洋葱切丝', '热锅热油快速滑炒牛肉至变色盛出', '炒洋葱至透明', '倒回牛肉加蚝油翻炒均匀出锅'] },

      // ===== 鱼虾海鲜 =====
      { id: 'F01', name: '清蒸鲈鱼', category: '午餐/晚餐·鱼虾', mealType: 'dinner', difficulty: 2, cookTime: 15, prepTime: 5,
        ingredients: [{ name: '鲈鱼', category: 'seafood', amount: 300, unit: 'g' }, { name: '姜', category: 'condiment', amount: 15, unit: 'g' }, { name: '葱', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['清淡', '高蛋白', '宴客', '减脂'], tools: ['蒸锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 2, oily: 1 },
        costPerServing: 15, season: ['全年'], suitableFor: ['普通', '老人', '儿童', '减脂'],
        steps: ['鲈鱼处理干净两面划刀', '盘底铺姜片鱼身也放姜', '水开后放入蒸8-10分钟', '倒掉盘中蒸出的水', '铺葱丝淋蒸鱼豉油', '浇一勺热油激香'] },

      { id: 'F02', name: '红烧带鱼', category: '午餐/晚餐·鱼虾', mealType: 'dinner', difficulty: 2, cookTime: 25, prepTime: 10,
        ingredients: [{ name: '带鱼', category: 'seafood', amount: 300, unit: 'g' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['下饭', '经典'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 2, salty: 3, oily: 3 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通'],
        steps: ['带鱼处理干净切段', '加料酒姜片腌制15分钟', '裹薄薄一层面粉', '煎至两面金黄', '加生抽老抽糖和水', '炖8分钟收汁'] },

      { id: 'F03', name: '油焖大虾', category: '午餐/晚餐·鱼虾', mealType: 'dinner', difficulty: 1, cookTime: 15, prepTime: 5,
        ingredients: [{ name: '虾', category: 'seafood', amount: 250, unit: 'g' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '高蛋白', '宴客'], tools: ['炒锅'],
        taste: { spicy: 1, sour: 0, sweet: 1, salty: 2, oily: 2 },
        costPerServing: 16, season: ['全年'], suitableFor: ['普通'],
        steps: ['虾开背去虾线', '热油爆香姜片', '下虾煎至变色', '加料酒生抽糖', '加少量水焖3分钟', '大火收汁出锅'] },

      { id: 'F04', name: '蒜蓉粉丝蒸虾', category: '午餐/晚餐·鱼虾', mealType: 'dinner', difficulty: 2, cookTime: 15, prepTime: 10,
        ingredients: [{ name: '虾', category: 'seafood', amount: 200, unit: 'g' }, { name: '粉丝', category: 'grain', amount: 50, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 20, unit: 'g' }],
        tags: ['宴客', '鲜美', '快手'], tools: ['蒸锅'],
        taste: { spicy: 1, sour: 0, sweet: 0, salty: 2, oily: 2 },
        costPerServing: 14, season: ['全年'], suitableFor: ['普通'],
        steps: ['粉丝温水泡软铺盘底', '虾开背去虾线码在粉丝上', '蒜末用热油泼香加生抽蚝油', '蒜蓉酱淋在虾上', '水开蒸8分钟', '撒葱花浇热油'] },

      { id: 'F05', name: '虾仁炒蛋', category: '午餐/晚餐·鱼虾', mealType: 'lunch', difficulty: 1, cookTime: 10, prepTime: 5,
        ingredients: [{ name: '虾仁', category: 'seafood', amount: 100, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 100, unit: 'g' }],
        tags: ['快手', '清淡', '孩子爱'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 1, oily: 2 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通', '儿童', '老人'],
        steps: ['虾仁加料酒盐腌5分钟', '鸡蛋打散加少许盐', '滑炒虾仁至变色盛出', '倒入蛋液快凝固时加虾仁', '翻炒均匀出锅'] },

      { id: 'F06', name: '鲫鱼豆腐汤', category: '午餐/晚餐·鱼虾', mealType: 'dinner', difficulty: 2, cookTime: 25, prepTime: 5,
        ingredients: [{ name: '鲫鱼', category: 'seafood', amount: 250, unit: 'g' }, { name: '豆腐', category: 'tofu', amount: 150, unit: 'g' }, { name: '姜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['清淡', '补钙', '汤'], tools: ['汤锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 1, oily: 1 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通', '老人', '孕妇'],
        steps: ['鲫鱼处理干净擦干水分', '两面煎至金黄', '加姜片和开水大火煮', '煮至汤色奶白约15分钟', '加豆腐再煮5分钟', '加盐调味撒葱花'] },

      // ===== 蔬菜素菜 =====
      { id: 'V01', name: '蒜蓉炒青菜', category: '蔬菜素菜', mealType: 'dinner', difficulty: 1, cookTime: 8, prepTime: 3,
        ingredients: [{ name: '青菜', category: 'vegetable', amount: 300, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '清淡', '日常'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 1, oily: 1 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通', '减脂'],
        steps: ['青菜洗净切段', '蒜切末', '热油爆香蒜末', '下青菜大火翻炒', '加盐调味快速出锅'] },

      { id: 'V02', name: '清炒西兰花', category: '蔬菜素菜', mealType: 'dinner', difficulty: 1, cookTime: 8, prepTime: 5,
        ingredients: [{ name: '西兰花', category: 'vegetable', amount: 250, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '减脂', '清淡'], tools: ['炒锅', '煮锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 1, oily: 1 },
        costPerServing: 4, season: ['全年'], suitableFor: ['普通', '减脂'],
        steps: ['西兰花掰小朵盐水浸泡', '焯水1分钟捞出', '爆香蒜末', '下西兰花翻炒', '加盐和少许蚝油出锅'] },

      { id: 'V03', name: '蚝油生菜', category: '蔬菜素菜', mealType: 'dinner', difficulty: 1, cookTime: 5, prepTime: 3,
        ingredients: [{ name: '生菜', category: 'vegetable', amount: 250, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '清淡', '低卡'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 1, salty: 2, oily: 1 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通', '减脂'],
        steps: ['生菜洗净', '锅中水开加少许油盐焯生菜20秒捞出', '爆香蒜末加蚝油生抽糖调汁', '淋在生菜上'] },

      { id: 'V04', name: '西红柿炒鸡蛋', category: '蔬菜素菜', mealType: 'lunch', difficulty: 1, cookTime: 10, prepTime: 3,
        ingredients: [{ name: '番茄', category: 'vegetable', amount: 200, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 100, unit: 'g' }],
        tags: ['快手', '经典', '下饭', '孩子爱'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 2, sweet: 2, salty: 1, oily: 2 },
        costPerServing: 5, season: ['全年'], suitableFor: ['普通', '儿童', '老人'],
        steps: ['番茄切块', '鸡蛋打散加少许盐', '炒鸡蛋至凝固盛出', '炒番茄出汁', '倒回鸡蛋加糖盐调味', '翻炒均匀撒葱花出锅'] },

      { id: 'V05', name: '酸辣土豆丝', category: '蔬菜素菜', mealType: 'lunch', difficulty: 1, cookTime: 12, prepTime: 5,
        ingredients: [{ name: '土豆', category: 'vegetable', amount: 300, unit: 'g' }, { name: '干辣椒', category: 'condiment', amount: 5, unit: 'g' }],
        tags: ['快手', '下饭', '开胃'], tools: ['炒锅'],
        taste: { spicy: 3, sour: 3, sweet: 0, salty: 2, oily: 2 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通'],
        steps: ['土豆切细丝泡水去淀粉换两次水', '热油爆香干辣椒花椒', '大火爆炒土豆丝', '加醋盐快速翻炒', '出锅前再淋一次醋'] },

      { id: 'V06', name: '麻婆豆腐', category: '蔬菜素菜', mealType: 'lunch', difficulty: 1, cookTime: 12, prepTime: 5,
        ingredients: [{ name: '豆腐', category: 'tofu', amount: 300, unit: 'g' }, { name: '猪肉末', category: 'meat', amount: 50, unit: 'g' }, { name: '豆瓣酱', category: 'condiment', amount: 15, unit: 'g' }],
        tags: ['下饭', '麻辣', '经典'], tools: ['炒锅'],
        taste: { spicy: 4, sour: 0, sweet: 0, salty: 3, oily: 3 },
        costPerServing: 5, season: ['全年'], suitableFor: ['普通'],
        steps: ['豆腐切方块盐水焯1分钟', '炒肉末至变色', '加豆瓣酱炒出红油', '加少量水煮开放豆腐', '煮3分钟勾芡', '撒花椒粉葱花出锅'] },

      { id: 'V07', name: '地三鲜', category: '蔬菜素菜', mealType: 'lunch', difficulty: 2, cookTime: 20, prepTime: 8,
        ingredients: [{ name: '土豆', category: 'vegetable', amount: 150, unit: 'g' }, { name: '茄子', category: 'vegetable', amount: 150, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 100, unit: 'g' }],
        tags: ['下饭', '经典', '家常'], tools: ['炒锅'],
        taste: { spicy: 1, sour: 0, sweet: 0, salty: 2, oily: 4 },
        costPerServing: 5, season: ['全年'], suitableFor: ['普通'],
        steps: ['土豆去皮切片茄子切块青椒切片', '土豆煎至两面金黄盛出', '茄子煎软盛出', '爆香蒜末加青椒', '倒回土豆茄子加生抽蚝油', '翻炒均匀出锅'] },

      { id: 'V08', name: '醋溜白菜', category: '蔬菜素菜', mealType: 'lunch', difficulty: 1, cookTime: 8, prepTime: 3,
        ingredients: [{ name: '白菜', category: 'vegetable', amount: 300, unit: 'g' }, { name: '干辣椒', category: 'condiment', amount: 5, unit: 'g' }],
        tags: ['快手', '开胃', '清淡'], tools: ['炒锅'],
        taste: { spicy: 2, sour: 3, sweet: 0, salty: 2, oily: 1 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通'],
        steps: ['白菜帮切片叶撕小', '爆香干辣椒', '先炒白菜帮至稍软', '加白菜叶大火翻炒', '沿锅边淋醋加盐', '快速翻炒出锅'] },

      // ===== 汤羹类 =====
      { id: 'S01', name: '紫菜蛋花汤', category: '汤羹', mealType: 'dinner', difficulty: 1, cookTime: 5, prepTime: 1,
        ingredients: [{ name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '紫菜', category: 'vegetable', amount: 5, unit: 'g' }, { name: '虾皮', category: 'seafood', amount: 5, unit: 'g' }],
        tags: ['快手', '清淡', '汤'], tools: ['汤锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 1, oily: 0 },
        costPerServing: 2, season: ['全年'], suitableFor: ['普通'],
        steps: ['水烧开', '鸡蛋打散慢慢倒入锅中搅成蛋花', '碗中放紫菜虾皮', '蛋花汤倒入碗中加盐香油'] },

      { id: 'S02', name: '番茄蛋汤', category: '汤羹', mealType: 'dinner', difficulty: 1, cookTime: 8, prepTime: 3,
        ingredients: [{ name: '番茄', category: 'vegetable', amount: 150, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }],
        tags: ['快手', '开胃', '汤'], tools: ['汤锅'],
        taste: { spicy: 0, sour: 2, sweet: 1, salty: 1, oily: 1 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通'],
        steps: ['番茄切块', '少许油炒番茄出汁', '加水煮开', '淋入蛋花加盐调味'] },

      { id: 'S03', name: '玉米排骨汤', category: '汤羹', mealType: 'dinner', difficulty: 2, cookTime: 45, prepTime: 10,
        ingredients: [{ name: '排骨', category: 'meat', amount: 300, unit: 'g' }, { name: '玉米', category: 'grain', amount: 200, unit: 'g' }, { name: '胡萝卜', category: 'vegetable', amount: 100, unit: 'g' }],
        tags: ['汤', '滋补', '适合带饭'], tools: ['汤锅'],
        taste: { spicy: 0, sour: 0, sweet: 2, salty: 1, oily: 1 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通', '老人', '儿童'],
        steps: ['排骨焯水洗净', '玉米切段胡萝卜切块', '排骨加姜片加水大火烧开', '转小火炖30分钟', '加玉米胡萝卜再炖15分钟', '加盐调味'] },

      // ===== 主食类 =====
      { id: 'R01', name: '蛋炒饭', category: '主食', mealType: 'lunch', difficulty: 1, cookTime: 10, prepTime: 5,
        ingredients: [{ name: '米饭', category: 'grain', amount: 200, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '葱', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '经典', '清冰箱'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 2, oily: 3 },
        costPerServing: 4, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡蛋打散', '热油炒鸡蛋捣碎', '加入米饭大火翻炒', '加盐葱花炒匀出锅'] },

      { id: 'R02', name: '杂粮饭', category: '主食', mealType: 'lunch', difficulty: 1, cookTime: 35, prepTime: 5,
        ingredients: [{ name: '杂粮', category: 'grain', amount: 150, unit: 'g' }],
        tags: ['健康', '控糖', '日常'], tools: ['电饭煲'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 0, oily: 0 },
        costPerServing: 2, season: ['全年'], suitableFor: ['普通', '控糖', '减脂'],
        steps: ['杂粮米淘洗', '加水浸泡30分钟', '电饭煲正常煮饭'], mealPrep: { canPrep: true, prepSteps: ['煮好分份冷冻'], storage: '冷冻', shelfLife: 30 } },

      { id: 'R03', name: '葱油拌面', category: '主食', mealType: 'lunch', difficulty: 1, cookTime: 8, prepTime: 3,
        ingredients: [{ name: '面条', category: 'grain', amount: 150, unit: 'g' }, { name: '葱', category: 'condiment', amount: 20, unit: 'g' }],
        tags: ['快手', '经典', '一人食'], tools: ['煮锅'],
        taste: { spicy: 0, sour: 0, sweet: 1, salty: 2, oily: 3 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通'],
        steps: ['面条煮熟过凉水', '葱切段用油炸至焦黄', '碗中放生抽老抽糖', '面条捞出加葱油和酱汁拌匀'] },

      { id: 'R04', name: '阳春面', category: '主食', mealType: 'breakfast', difficulty: 1, cookTime: 8, prepTime: 2,
        ingredients: [{ name: '挂面', category: 'grain', amount: 100, unit: 'g' }, { name: '葱', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '清淡', '暖胃'], tools: ['煮锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 2, oily: 1 },
        costPerServing: 2, season: ['全年'], suitableFor: ['普通'],
        steps: ['碗中放生抽猪油葱花', '开水冲入碗中做汤底', '面条煮熟捞入碗中'] },

      // ===== 周末改善 =====
      { id: 'W01', name: '自制小火锅', category: '周末改善', mealType: 'dinner', difficulty: 1, cookTime: 30, prepTime: 20,
        ingredients: [{ name: '火锅底料', category: 'condiment', amount: 50, unit: 'g' }, { name: '肥牛', category: 'meat', amount: 200, unit: 'g' }, { name: '各种蔬菜', category: 'vegetable', amount: 300, unit: 'g' }, { name: '豆腐', category: 'tofu', amount: 100, unit: 'g' }],
        tags: ['改善', '聚会', '冬日'], tools: ['电火锅'],
        taste: { spicy: 4, sour: 0, sweet: 0, salty: 3, oily: 4 },
        costPerServing: 20, season: ['秋冬'], suitableFor: ['普通'],
        steps: ['准备所有食材洗净切好装盘', '锅中加水加火锅底料烧开', '先煮耐煮的食材', '边涮边吃'] },

      { id: 'W02', name: '咖喱鸡肉饭', category: '周末改善', mealType: 'dinner', difficulty: 1, cookTime: 25, prepTime: 10,
        ingredients: [{ name: '鸡腿', category: 'meat', amount: 200, unit: 'g' }, { name: '土豆', category: 'vegetable', amount: 100, unit: 'g' }, { name: '胡萝卜', category: 'vegetable', amount: 80, unit: 'g' }, { name: '洋葱', category: 'vegetable', amount: 50, unit: 'g' }, { name: '咖喱块', category: 'condiment', amount: 30, unit: 'g' }, { name: '大米', category: 'grain', amount: 100, unit: 'g' }],
        tags: ['改善', '孩子爱', '一锅出'], tools: ['炒锅', '电饭煲'],
        taste: { spicy: 1, sour: 0, sweet: 2, salty: 2, oily: 2 },
        costPerServing: 10, season: ['全年'], suitableFor: ['普通', '儿童'],
        steps: ['鸡腿去骨切块', '土豆胡萝卜洋葱切块', '炒香洋葱加鸡块', '加蔬菜和水煮15分钟', '关火加咖喱块搅拌融化', '再煮5分钟收汁配米饭'] },

      { id: 'W03', name: '大盘鸡', category: '周末改善', mealType: 'dinner', difficulty: 2, cookTime: 45, prepTime: 15,
        ingredients: [{ name: '鸡腿', category: 'meat', amount: 300, unit: 'g' }, { name: '土豆', category: 'vegetable', amount: 200, unit: 'g' }, { name: '青椒', category: 'vegetable', amount: 100, unit: 'g' }, { name: '面条', category: 'grain', amount: 150, unit: 'g' }],
        tags: ['改善', '西北', '聚会'], tools: ['炒锅', '煮锅'],
        taste: { spicy: 3, sour: 0, sweet: 0, salty: 3, oily: 3 },
        costPerServing: 12, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡腿剁块焯水', '土豆切块青椒切片', '炒糖色加鸡块', '加豆瓣酱生抽炒香', '加土豆和水炖20分钟', '加青椒收汁配煮好的面条'] },

      // ===== 凉菜 =====
      { id: 'L01', name: '凉拌黄瓜', category: '凉菜', mealType: 'dinner', difficulty: 1, cookTime: 5, prepTime: 3,
        ingredients: [{ name: '黄瓜', category: 'vegetable', amount: 200, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '开胃', '低卡'], tools: [],
        taste: { spicy: 1, sour: 2, sweet: 0, salty: 1, oily: 1 },
        costPerServing: 2, season: ['全年'], suitableFor: ['普通', '减脂'],
        steps: ['黄瓜拍碎切段', '蒜末醋生抽香油调汁', '浇在黄瓜上拌匀'] },

      { id: 'L02', name: '凉拌木耳', category: '凉菜', mealType: 'dinner', difficulty: 1, cookTime: 10, prepTime: 5,
        ingredients: [{ name: '木耳', category: 'vegetable', amount: 100, unit: 'g' }, { name: '蒜', category: 'condiment', amount: 10, unit: 'g' }],
        tags: ['快手', '开胃', '爽脆'], tools: ['煮锅'],
        taste: { spicy: 2, sour: 2, sweet: 0, salty: 2, oily: 2 },
        costPerServing: 4, season: ['全年'], suitableFor: ['普通'],
        steps: ['木耳泡发洗净焯水1分钟过凉', '蒜末辣椒生抽醋调汁', '浇在木耳上拌匀'] },

      // ===== 凑合一顿 =====
      { id: 'Q01', name: '酱油炒饭', category: '凑合一顿', mealType: 'lunch', difficulty: 1, cookTime: 8, prepTime: 2,
        ingredients: [{ name: '米饭', category: 'grain', amount: 200, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }],
        tags: ['快手', '清冰箱', '一人食'], tools: ['炒锅'],
        taste: { spicy: 0, sour: 0, sweet: 0, salty: 3, oily: 3 },
        costPerServing: 3, season: ['全年'], suitableFor: ['普通'],
        steps: ['鸡蛋打散炒碎', '加入米饭大火翻炒', '淋入生抽老抽', '翻炒均匀撒葱花'] },

      { id: 'Q02', name: '泡面+蛋+青菜', category: '凑合一顿', mealType: 'dinner', difficulty: 1, cookTime: 10, prepTime: 2,
        ingredients: [{ name: '泡面', category: 'grain', amount: 100, unit: 'g' }, { name: '鸡蛋', category: 'egg', amount: 50, unit: 'g' }, { name: '青菜', category: 'vegetable', amount: 50, unit: 'g' }],
        tags: ['快手', '一人食', '应急'], tools: ['煮锅'],
        taste: { spicy: 2, sour: 0, sweet: 0, salty: 3, oily: 3 },
        costPerServing: 5, season: ['全年'], suitableFor: ['普通'],
        steps: ['水开下面饼和调料', '打入鸡蛋不要搅散', '放青菜煮至变软', '连汤带面倒入碗中'] },
    ];
  },
};

// 自动初始化
RECIPES.init();

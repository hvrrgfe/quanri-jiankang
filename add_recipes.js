var fs = require("fs");
var s = fs.readFileSync("./js/data/recipes.js","utf8");

var newRecipes = `

      { id: "M01", name: "杏鲍菇炒肉片", category: "午餐/晚餐·猪肉", mealType: "lunch", difficulty: 1, cookTime: 12, prepTime: 5,
        ingredients: [{ name: "杏鲍菇", category: "vegetable", amount: 150, unit:"g" }, { name: "瘦肉", category: "meat", amount: 80, unit:"g" }, { name: "青椒", category: "vegetable", amount: 30, unit:"g" }],
        nutrition: { calories: 160, protein: 16, fat: 6, carb: 10, fiber: 2.5, sodium: 300, potassium: 400 },
        tags: ["快手","下饭","菌菇"], tools: ["炒锅"], taste: { spicy:0, sour:0, sweet:0, salty:2, oily:2 },
        costPerServing: 5, season: ["全年"], suitableFor: ["普通"],
        steps: ["杏鲍菇切片", "瘦肉切片加料酒淀粉腌制", "热油滑炒肉片至变色盛出", "爆香蒜末炒杏鲍菇", "倒回肉片加生抽调味"] },

      { id: "M02", name: "茶树菇炖鸡", category: "午餐/晚餐·鸡肉", mealType: "dinner", difficulty: 2, cookTime: 35, prepTime: 10,
        ingredients: [{ name: "鸡腿", category: "meat", amount: 250, unit:"g" }, { name: "茶树菇", category: "vegetable", amount: 30, unit:"g" }, { name: "姜", category: "condiment", amount: 5, unit:"g" }],
        nutrition: { calories: 280, protein: 30, fat: 12, carb: 8, fiber: 2, sodium: 350 },
        tags: ["汤","菌菇","滋补"], tools: ["汤锅"], taste: { spicy:0, sour:0, sweet:0, salty:2, oily:2 },
        costPerServing: 8, season: ["秋","冬"], suitableFor: ["普通"],
        steps: ["茶树菇泡发", "鸡腿斩块焯水", "所有材料加姜片入锅", "加水大火烧开转小火炖30分钟", "加盐调味"] },

      { id: "M03", name: "蟹味菇炒蛋", category: "蔬菜素菜", mealType: "lunch", difficulty: 1, cookTime: 6, prepTime: 3,
        ingredients: [{ name: "蟹味菇", category: "vegetable", amount: 100, unit:"g" }, { name: "鸡蛋", category: "egg", amount: 100, unit:"g" }, { name: "葱", category: "condiment", amount: 5, unit:"g" }],
        nutrition: { calories: 150, protein: 14, fat: 9, carb: 4, fiber: 1, sodium: 200 },
        tags: ["快手","素菜","菌菇"], tools: ["炒锅"], taste: { spicy:0, sour:0, sweet:0, salty:1, oily:2 },
        costPerServing: 4, season: ["全年"], suitableFor: ["普通"],
        steps: ["蟹味菇去根洗净", "鸡蛋打散", "热油炒蛋至凝固盛出", "炒蟹味菇至出水", "倒回鸡蛋加盐翻炒均匀"] },

      { id: "M04", name: "麻油拌毛豆", category: "蔬菜素菜", mealType: "lunch", difficulty: 1, cookTime: 10, prepTime: 5,
        ingredients: [{ name: "毛豆", category: "vegetable", amount: 200, unit:"g" }, { name: "八角", category: "condiment", amount: 1, unit:"g" }],
        nutrition: { calories: 130, protein: 10, fat: 5, carb: 10, fiber: 3, sodium: 150, potassium: 350 },
        tags: ["快手","素菜","下酒"], tools: ["煮锅"], taste: { spicy:0, sour:0, sweet:0, salty:2, oily:1 },
        costPerServing: 3, season: ["夏","秋"], suitableFor: ["普通","素食"],
        steps: ["毛豆洗净剪去两端", "水中加八角盐煮开", "下毛豆煮8分钟", "捞出沥干淋香油拌匀"] },

      { id: "F11", name: "清蒸黄花鱼", category: "午餐/晚餐·鱼虾", mealType: "dinner", difficulty: 1, cookTime: 12, prepTime: 5,
        ingredients: [{ name: "黄花鱼", category: "seafood", amount: 300, unit:"g" }, { name: "姜", category: "condiment", amount: 10, unit:"g" }, { name: "葱", category: "condiment", amount: 10, unit:"g" }],
        nutrition: { calories: 200, protein: 30, fat: 8, carb: 1, fiber: 0, sodium: 300 },
        tags: ["清淡","高蛋白","宴客"], tools: ["蒸锅"], taste: { spicy:0, sour:0, sweet:0, salty:2, oily:1 },
        costPerServing: 12, season: ["全年"], suitableFor: ["普通","减脂"],
        steps: ["黄花鱼处理干净两面划刀", "抹料酒塞姜片", "水开后蒸8分钟", "倒掉蒸汁铺葱丝", "淋蒸鱼豉油浇热油"] },

      { id: "F12", name: "茄汁沙丁鱼", category: "午餐/晚餐·鱼虾", mealType: "lunch", difficulty: 1, cookTime: 15, prepTime: 5,
        ingredients: [{ name: "沙丁鱼", category: "seafood", amount: 200, unit:"g" }, { name: "番茄", category: "vegetable", amount: 150, unit:"g" }, { name: "番茄酱", category: "condiment", amount: 15, unit:"g" }],
        nutrition: { calories: 220, protein: 24, fat: 10, carb: 8, fiber: 1, sodium: 350 },
        tags: ["高蛋白","下饭","酸甜"], tools: ["炒锅"], taste: { spicy:0, sour:2, sweet:2, salty:2, oily:2 },
        costPerServing: 8, season: ["全年"], suitableFor: ["普通"],
        steps: ["沙丁鱼处理干净", "番茄去皮切块", "煎鱼至两面金黄盛出", "炒番茄加番茄酱", "放回鱼加少量水煮5分钟"] },

      { id: "C06", name: "啤酒鸭", category: "午餐/晚餐·鸡肉", mealType: "dinner", difficulty: 2, cookTime: 40, prepTime: 10,
        ingredients: [{ name: "鸭腿", category: "meat", amount: 300, unit:"g" }, { name: "啤酒", category: "condiment", amount: 200, unit:"ml" }, { name: "姜", category: "condiment", amount: 10, unit:"g" }, { name: "八角", category: "condiment", amount: 2, unit:"g" }],
        nutrition: { calories: 380, protein: 28, fat: 22, carb: 8, fiber: 0, sodium: 350, iron: 3 },
        tags: ["下饭","宴客","经典"], tools: ["炒锅","汤锅"], taste: { spicy:1, sour:0, sweet:1, salty:3, oily:3 },
        costPerServing: 10, season: ["全年"], suitableFor: ["普通"],
        steps: ["鸭腿斩块焯水", "炒至微黄出油", "加姜八角生抽老抽", "倒入啤酒大火烧开", "转小火炖30分钟", "大火收汁"] },

      { id: "C07", name: "鸭血粉丝汤", category: "汤羹", mealType: "dinner", difficulty: 1, cookTime: 15, prepTime: 5,
        ingredients: [{ name: "鸭血", category: "meat", amount: 150, unit:"g" }, { name: "粉丝", category: "grain", amount: 30, unit:"g" }, { name: "豆腐", category: "tofu", amount: 50, unit:"g" }],
        nutrition: { calories: 180, protein: 14, fat: 6, carb: 18, fiber: 0.5, sodium: 400, iron: 5 },
        tags: ["汤","南京","快手"], tools: ["煮锅"], taste: { spicy:1, sour:0, sweet:0, salty:3, oily:2 },
        costPerServing: 5, season: ["全年"], suitableFor: ["普通"],
        steps: ["鸭血切块焯水", "粉丝泡软", "豆腐切丁", "水开下鸭血豆腐煮5分钟", "下粉丝煮2分钟", "加盐胡椒撒香菜"] },

      { id: "L06", name: "牛肉米粉", category: "凑合一顿", mealType: "lunch", difficulty: 1, cookTime: 20, prepTime: 5,
        ingredients: [{ name: "牛腩", category: "meat", amount: 150, unit:"g" }, { name: "米粉", category: "grain", amount: 120, unit:"g" }, { name: "青菜", category: "vegetable", amount: 50, unit:"g" }],
        nutrition: { calories: 400, protein: 24, fat: 12, carb: 50, fiber: 1.5, sodium: 450 },
        tags: ["粉面","经典","午餐"], tools: ["煮锅","汤锅"], taste: { spicy:0, sour:0, sweet:0, salty:3, oily:2 },
        costPerServing: 10, season: ["全年"], suitableFor: ["普通"],
        steps: ["牛腩切块焯水后炖20分钟", "米粉泡软煮熟", "青菜焯水", "碗中放米粉牛腩和汤", "加葱花辣油"] },

      { id: "L07", name: "上海葱油拌面", category: "凑合一顿", mealType: "lunch", difficulty: 1, cookTime: 10, prepTime: 3,
        ingredients: [{ name: "面条", category: "grain", amount: 150, unit:"g" }, { name: "葱", category: "condiment", amount: 30, unit:"g" }],
        nutrition: { calories: 380, protein: 10, fat: 14, carb: 55, fiber: 1, sodium: 450 },
        tags: ["快手","上海","经典"], tools: ["煮锅","炒锅"], taste: { spicy:0, sour:0, sweet:0, salty:3, oily:3 },
        costPerServing: 3, season: ["全年"], suitableFor: ["普通"],
        steps: ["面条煮熟过冷水", "葱切段用油炸至焦黄", "碗中加生抽老抽糖", "拌入面条和葱油"] },

      { id: "L08", name: "番茄肉酱意面", category: "凑合一顿", mealType: "lunch", difficulty: 1, cookTime: 18, prepTime: 5,
        ingredients: [{ name: "意大利面", category: "grain", amount: 120, unit:"g" }, { name: "猪肉末", category: "meat", amount: 80, unit:"g" }, { name: "番茄", category: "vegetable", amount: 150, unit:"g" }, { name: "洋葱", category: "vegetable", amount: 30, unit:"g" }],
        nutrition: { calories: 420, protein: 20, fat: 12, carb: 58, fiber: 3, sodium: 400 },
        tags: ["西式","午餐","经典"], tools: ["煮锅","炒锅"], taste: { spicy:0, sour:2, sweet:1, salty:2, oily:2 },
        costPerServing: 6, season: ["全年"], suitableFor: ["普通"],
        steps: ["意面加盐煮至弹牙", "洋葱切末炒香", "加肉末炒至变色", "加番茄炒出汁", "加番茄酱和少量水煮稠", "拌入煮好的意面"] },

      { id: "B21", name: "紫薯牛奶燕麦粥", category: "早餐", mealType: "breakfast", difficulty: 1, cookTime: 10, prepTime: 2,
        ingredients: [{ name: "紫薯", category: "grain", amount: 80, unit:"g" }, { name: "燕麦", category: "grain", amount: 30, unit:"g" }, { name: "牛奶", category: "dairy", amount: 200, unit:"ml" }],
        nutrition: { calories: 250, protein: 10, fat: 4, carb: 45, fiber: 4, sodium: 60, calcium: 200 },
        tags: ["早餐","养生","快手"], tools: ["煮锅","微波炉"], taste: { spicy:0, sour:0, sweet:2, salty:0, oily:0 },
        costPerServing: 4, season: ["全年"], suitableFor: ["普通","减脂"],
        steps: ["紫薯蒸熟或微波炉烤熟", "燕麦加牛奶煮3分钟", "紫薯切块加入燕麦中"] },

      { id: "B22", name: "鸡蛋灌饼", category: "早餐", mealType: "breakfast", difficulty: 2, cookTime: 10, prepTime: 3,
        ingredients: [{ name: "面粉", category: "grain", amount: 80, unit:"g" }, { name: "鸡蛋", category: "egg", amount: 50, unit:"g" }, { name: "生菜", category: "vegetable", amount: 20, unit:"g" }],
        nutrition: { calories: 280, protein: 12, fat: 8, carb: 40, fiber: 1, sodium: 300 },
        tags: ["早餐","经典","北方"], tools: ["煎锅"], taste: { spicy:0, sour:0, sweet:0, salty:2, oily:3 },
        costPerServing: 3, season: ["全年"], suitableFor: ["普通"],
        steps: ["面粉加水和成面团擀成饼", "饼中间刷油包起", "煎至两面微黄", "戳破灌入蛋液", "煎至金黄夹生菜"] },

      { id: "B23", name: "酒酿圆子", category: "早餐", mealType: "breakfast", difficulty: 1, cookTime: 8, prepTime: 2,
        ingredients: [{ name: "糯米小圆子", category: "grain", amount: 80, unit:"g" }, { name: "酒酿", category: "condiment", amount: 50, unit:"g" }, { name: "鸡蛋", category: "egg", amount: 30, unit:"g" }, { name: "桂花", category: "condiment", amount: 2, unit:"g" }],
        nutrition: { calories: 200, protein: 6, fat: 2, carb: 40, fiber: 0.5, sodium: 20 },
        tags: ["早餐","甜品","江南"], tools: ["煮锅"], taste: { spicy:0, sour:0, sweet:4, salty:0, oily:0 },
        costPerServing: 3, season: ["冬","春"], suitableFor: ["普通"],
        steps: ["水开下小圆子煮至浮起", "加入酒酿搅散", "淋入蛋花", "撒桂花即可"] },

      { id: "V22", name: "凉拌黄瓜木耳", category: "凉菜", mealType: "dinner", difficulty: 1, cookTime: 8, prepTime: 5,
        ingredients: [{ name: "黄瓜", category: "vegetable", amount: 150, unit:"g" }, { name: "木耳", category: "vegetable", amount: 30, unit:"g" }, { name: "蒜", category: "condiment", amount: 8, unit:"g" }],
        nutrition: { calories: 40, protein: 1.5, fat: 0.5, carb: 6, fiber: 2, sodium: 200, vitC: 10 },
        tags: ["凉菜","快手","减脂"], tools: ["煮锅"], taste: { spicy:0, sour:2, sweet:0, salty:2, oily:1 },
        costPerServing: 3, season: ["夏","秋"], suitableFor: ["普通","减脂"],
        steps: ["木耳泡发焯水", "黄瓜拍碎切段", "蒜末醋生抽香油调汁", "拌匀即可"] },

      { id: "V23", name: "凉拌西芹", category: "凉菜", mealType: "lunch", difficulty: 1, cookTime: 5, prepTime: 3,
        ingredients: [{ name: "芹菜", category: "vegetable", amount: 200, unit:"g" }, { name: "花生", category: "fruit", amount: 15, unit:"g" }],
        nutrition: { calories: 60, protein: 3, fat: 3, carb: 6, fiber: 2.5, sodium: 180 },
        tags: ["凉菜","快手","素菜"], tools: ["煮锅"], taste: { spicy:0, sour:1, sweet:0, salty:2, oily:1 },
        costPerServing: 3, season: ["全年"], suitableFor: ["普通","减脂"],
        steps: ["芹菜去筋切段焯水", "花生炒熟碾碎", "加盐香油拌匀"] },

      { id: "DS07", name: "桂花糖藕", category: "甜品", mealType: "snack", difficulty: 2, cookTime: 50, prepTime: 10,
        ingredients: [{ name: "莲藕", category: "vegetable", amount: 200, unit:"g" }, { name: "糯米", category: "grain", amount: 50, unit:"g" }, { name: "红糖", category: "condiment", amount: 20, unit:"g" }, { name: "桂花", category: "condiment", amount: 3, unit:"g" }],
        nutrition: { calories: 220, protein: 3, fat: 0.5, carb: 50, fiber: 2, sodium: 10, iron: 1.5 },
        tags: ["甜品","江南","宴客"], tools: ["煮锅"], taste: { spicy:0, sour:0, sweet:5, salty:0, oily:0 },
        costPerServing: 4, season: ["秋"], suitableFor: ["普通"],
        steps: ["莲藕去皮切开一头", "糯米灌入莲藕孔中", "用牙签固定切下的那头", "加红糖水煮40分钟", "切片淋桂花糖汁"] },

      { id: "DS08", name: "木瓜椰奶冻", category: "甜品", mealType: "snack", difficulty: 1, cookTime: 180, prepTime: 10,
        ingredients: [{ name: "木瓜", category: "fruit", amount: 200, unit:"g" }, { name: "椰奶", category: "dairy", amount: 100, unit:"ml" }],
        nutrition: { calories: 120, protein: 2, fat: 5, carb: 18, fiber: 1.5, sodium: 20, vitC: 30, vitA: 300 },
        tags: ["甜品","夏日","西式"], tools: ["冰箱"], taste: { spicy:0, sour:0, sweet:3, salty:0, oily:0 },
        costPerServing: 5, season: ["夏","秋"], suitableFor: ["普通"],
        steps: ["木瓜切半去籽", "椰奶加热加泡软的吉利丁", "倒入木瓜中", "冷藏3小时至凝固", "切片食用"] },

      { id: "S13", name: "酸辣汤", category: "汤羹", mealType: "dinner", difficulty: 1, cookTime: 12, prepTime: 5,
        ingredients: [{ name: "豆腐", category: "tofu", amount: 80, unit:"g" }, { name: "鸡蛋", category: "egg", amount: 50, unit:"g" }, { name: "木耳", category: "vegetable", amount: 15, unit:"g" }, { name: "火腿", category: "meat", amount: 20, unit:"g" }],
        nutrition: { calories: 120, protein: 10, fat: 5, carb: 8, fiber: 1, sodium: 500, iron: 1.5 },
        tags: ["汤","酸辣","开胃"], tools: ["煮锅"], taste: { spicy:3, sour:3, sweet:0, salty:3, oily:1 },
        costPerServing: 4, season: ["全年"], suitableFor: ["普通"],
        steps: ["所有食材切丝", "水开下豆腐木耳火腿", "煮3分钟加调味料", "淋入蛋花", "勾芡出锅"] },
    `;

// Insert before the last ];
s = s.replace("    ];", newRecipes + "\n    ];");
fs.writeFileSync("./js/data/recipes.js", s, "utf8");
console.log("Done");

# 三餐指南 API 接口文档

- [AI 代理接口](#AI代理)
- [数据存储接口](#数据存储)

---

## AI代理

### 调用 AI 生成菜单

>- 接口地址：`/api/proxy`（本地 `node server.js` 时可用）
>- 请求方式：`POST`
>- 说明：浏览器通过本地代理调用 AI API，避免 CORS 限制

>请求参数（Headers）

| 参数 | 类型 | 必填 | 备注 |
|------|------|:----:|------|
| Authorization | String | 是 | Bearer {API Key}，用户的 API 密钥 |
| X-Target-Endpoint | String | 是 | AI 提供商的实际 endpoint 地址 |
| Content-Type | String | 是 | application/json |

>请求参数（Body）

| 参数 | 类型 | 必填 | 备注 |
|------|------|:----:|------|
| model | String | 是 | 模型名称，如 gpt-4o-mini / deepseek-chat |
| messages | Array | 是 | 消息列表，含 system 和 user 消息 |
| temperature | Number | 否 | 温度参数，默认 0.7 |
| max_tokens | Number | 否 | 最大 token 数，默认 4096 |

>请求示例

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "你是一位资深的中国注册营养师..."},
    {"role": "user", "content": "请为用户生成一周菜单..."}
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}
```

>返回示例（成功）

```json
{
  "days": [
    {
      "date": "2026-07-28",
      "dayOfWeek": "周一",
      "meals": {
        "breakfast": {"name": "小米粥+煮鸡蛋+拌黄瓜", "cookTime": 15},
        "lunch": {"name": "青椒肉丝+米饭", "cookTime": 20},
        "dinner": {"name": "番茄牛腩+蒜蓉西兰花+米饭", "cookTime": 50}
      },
      "ingredientCount": 12,
      "totalCookTime": 85
    }
  ],
  "weeklyStats": {
    "totalIngredientTypes": 28,
    "darkVegetablePercent": "55%",
    "redMeatTotalGrams": 350,
    "fishCount": 2
  }
}
```

>返回示例（失败）

```json
{
  "error": "错误信息描述"
}
```

---

### 直连 AI API

>- 说明：由前端直接向 AI 提供商发起请求（需提供商支持 CORS）
>- 请求方式：`POST`
>- 地址：`https://api.openai.com/v1/chat/completions`（可配置）

>请求参数与返回格式同 AI 代理接口。

---

## 数据存储

三餐指南采用纯前端本地存储架构，**所有数据存储在浏览器 localStorage 中，不上传任何服务器**。

### 存储结构

| Key | 类型 | 说明 |
|-----|------|------|
| tcan_profile | JSON | 用户饮食画像 |
| tcan_weeklyPlan | JSON | 本周菜单 |
| tcan_shoppingList | JSON | 采购清单 |
| tcan_feedback | JSON[] | 菜品反馈历史 |
| tcan_familyMembers | JSON[] | 家庭成员数据 |
| tcan_customRecipes | JSON[] | 自定义菜谱 |
| tcan_eatenMeals | JSON | 已吃标记 |
| tcan_apikey | String (Base64) | API 密钥 |
| tcan_apiEndpoint | String | API 端点地址 |
| tcan_apiModel | String | 模型名称 |
| tcan_useProxy | Boolean | 是否使用本地代理 |
| tcan_salt / tcan_vfy | String | 加密相关（启用 AES 加密时） |

### 用户画像数据结构

```json
{
  "id": "唯一ID",
  "age": 28,
  "gender": "male|female",
  "height": 165,
  "weight": 55,
  "activityLevel": 1-4,
  "sleepHours": 7,
  "stressLevel": 1-5,
  "exerciseDays": 2,
  "eatOutFreq": 2,
  "cookingSkill": 1-5,
  "healthConditions": ["hypertension", "diabetes"],
  "digestiveIssues": ["bloating"],
  "useSupplements": false,
  "supplements": ["vitaminD"],
  "healthGoals": ["balanced", "weight_loss"],
  "dietaryRestrictions": ["spicy", "不吃芹菜"],
  "allergies": ["花生", "海鲜"],
  "cookDaysPerWeek": 5,
  "mealsToPlan": ["breakfast", "dinner"],
  "cookTimeBudget": 30,
  "availableTools": ["炒锅", "电饭煲"],
  "perMealBudget": 20,
  "cuisinePreference": ["家常", "川菜"],
  "tasteProfile": {"spicy": 2, "sour": 2, "sweet": 2, "salty": 2, "oily": 2},
  "mode": "personal|family|mealprep"
}
```

---

## 数据流程

```
用户填写档案
    ↓
点击「安排菜单」
    ↓
┌─ 有 API Key? ─────────┐
│ 是 → 调用 AI API       │
│      ├─ 启用代理 → /api/proxy
│      └─ 直连 → AI 提供商
│      ↓
│  AI 返回 JSON 菜单
│      ↓
│  解析 & 校验 (膳食指南合规检查)
└─ 否 → 本地引擎生成菜单
    ↓
显示菜单 → 用户可替换/反馈
    ↓
生成采购清单
    ↓
标记已吃 → 记录反馈 → 优化后续推荐
```

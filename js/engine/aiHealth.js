// ===== AI 健康引擎 =====
// 为各模块提供AI生成内容，无API Key时用本地数据库

const AIHealth = {
  // 获取AI建议（带本地兜底）
  async get(type, profile) {
    const apiKey = Store.getApiKey();
    if (!apiKey) return null;

    const prompters = {
      exercise: this._exercisePrompt,
      sleep: this._sleepPrompt,
      mental: this._mentalPrompt,
      plan: this._planPrompt,
    };
    const builder = prompters[type];
    if (!builder) return null;

    try {
      const { system, user } = builder(profile);
      const result = await Helpers.callLLM(system, user, apiKey);
      return result;
    } catch (e) {
      console.warn('AI health failed:', e.message);
      return null;
    }
  },

  // ---- 运动建议 ----
  _exercisePrompt(profile) {
    return {
      system: '你是一位专业运动教练。根据用户档案，给出具体的今日运动建议。用简短中文回复，3-5条。',
      user: `用户：${profile.age}岁${profile.gender === 'male' ? '男' : '女'}，运动意愿：${profile.exerciseWillingness || '一般'}。给出今天的运动建议。`,
    };
  },

  // ---- 睡眠建议 ----
  _sleepPrompt(profile) {
    return {
      system: '你是一位睡眠专家。根据用户档案给出具体睡眠改善建议。简短中文，3-5条。',
      user: `用户：${profile.age}岁，睡眠时型：${profile.chronotype || '中间型'}，问题：${(profile.sleepIssues || []).join('、') || '无'}`,
    };
  },

  // ---- 心理建议 ----
  _mentalPrompt(profile) {
    return {
      system: '你是一位心理教练。给出日常心理微练习建议。简短中文，2-3条。简洁，不啰嗦。',
      user: `用户状态：${(profile.mentalState || []).join('、') || '一般'}。推荐适合的心理练习。`,
    };
  },

  // ---- 计划建议 ----
  _planPrompt(profile) {
    return {
      system: '你是一位效率教练。根据用户情况建议今天最重要的3件事的方向。简洁，每条不超过10个字。',
      user: `给出今天3个任务方向的建议。`,
    };
  },
};

// ===== AI 健康规划引擎 =====
// 像饮食AI一样，为各模块生成完整方案，失败时降级本地引擎

const AIHealth = {
  async generate(module, profile) {
    const apiKey = Store.getApiKey();
    if (!apiKey) return null;

    const generators = {
      exercise: this._genExercise,
      sleep: this._genSleep,
      mental: this._genMental,
      plan: this._genPlan,
    };
    const gen = generators[module];
    if (!gen) return null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const prompt = gen(profile, attempt);
        const result = await Helpers.callLLM(prompt.system, prompt.user, apiKey);
        if (result && this._isValid(result, module)) return result;
      } catch (e) {
        console.warn('AI ' + module + ' attempt ' + attempt + ' failed:', e.message);
      }
    }
    return null;
  },

  _isValid(result, module) {
    if (!result || typeof result !== 'object') return false;
    if (module === 'exercise' && Array.isArray(result.weekPlan)) return true;
    if (module === 'sleep' && result.schedule) return true;
    if (module === 'mental' && Array.isArray(result.practices)) return true;
    if (module === 'plan' && Array.isArray(result.tasks)) return true;
    return false;
  },

  // ---- AI 生成一周运动计划 ----
  _genExercise(profile, attempt) {
    const relax = attempt > 0 ? '要求可以放宽，简单可行即可。' : '';
    return {
      system: '你是运动教练。生成一周运动计划JSON，包含：weekPlan（一周7天，每天有运动项目和时长）。返回纯JSON。' + relax,
      user: `用户：${profile.age}岁${profile.gender === 'male' ? '男' : '女'}，运动意愿：${profile.exerciseWillingness || 'minimal'}，装备：${(profile.exerciseEquip || []).join('、') || '无'}
返回JSON格式：{"weekPlan":[{"day":"周一","items":[{"name":"运动名","duration":30,"type":" cardio/strength/stretch"}]}]}`,
    };
  },

  // ---- AI 生成睡眠优化方案 ----
  _genSleep(profile, attempt) {
    return {
      system: '你是睡眠专家。生成个性化睡眠优化方案JSON。返回纯JSON。',
      user: `用户：${profile.age}岁，时型：${profile.chronotype || '中间型'}，问题：${(profile.sleepIssues || []).join('、') || '无'}
返回JSON格式：{"schedule":{"bedTime":"23:00","wakeTime":"07:00"},"tips":["建议1","建议2","建议3"]}`,
    };
  },

  // ---- AI 生成心理练习方案 ----
  _genMental(profile, attempt) {
    return {
      system: '你是心理教练。生成今日心理微练习方案JSON。返回纯JSON。',
      user: `用户状态：${(profile.mentalState || []).join('、') || '一般'}，时间投入：${profile.mentalTime || 'minimal'}
返回JSON格式：{"practices":[{"name":"练习名","duration":"3分钟","type":"呼吸/感恩/反思"}]}`,
    };
  },

  // ---- AI 生成每日三件事 ----
  _genPlan(profile, attempt) {
    return {
      system: '你是效率教练。根据用户画像生成今日最重要的3件事。简洁，每件事不超过10字。返回JSON。',
      user: `用户：${profile.age}岁，工作：${profile.jobType || 'desk'}
返回JSON格式：{"tasks":["任务1","任务2","任务3"],"note":"一句鼓励的话"}`,
    };
  },
};

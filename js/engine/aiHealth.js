// ===== AI 健康规划引擎（完整版）=====
// 参考膳食AI的详细提示词模式，每个模块都带上完整数据库知识+用户画像

const AIHealth = {
  async generate(module, profile) {
    const apiKey = Store.getApiKey();
    if (!apiKey) return null;

    const gens = { exercise: this._genExercise, sleep: this._genSleep, mental: this._genMental, plan: this._genPlan };
    const gen = gens[module];
    if (!gen) return null;

    for (let a = 0; a < 3; a++) {
      try {
        const p = gen(profile, a);
        const r = await Helpers.callLLM(p.system, p.user, apiKey);
        if (r && this._valid(r, module)) return r;
      } catch (e) { console.warn('AI ' + module + ' failed:', e.message); }
    }
    return null;
  },

  _valid(r, m) {
    if (!r || typeof r !== 'object') return false;
    if (m === 'exercise' && r.weekPlan) return true;
    if (m === 'sleep' && r.schedule) return true;
    if (m === 'mental' && r.practices) return true;
    if (m === 'plan' && r.tasks) return true;
    return false;
  },

  // ===== 运动 =====
  _genExercise(profile, attempt) {
    const pool = ExerciseDB;
    const upper = pool.upperBody.slice(0,5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + ')').join('、');
    const lower = pool.lowerBody.slice(0,5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + ')').join('、');
    const cardio = pool.cardio.map(e => e.name + e.duration + e.unit).join('、');
    const stretch = pool.stretch.map(e => e.name + e.duration + e.unit).join('、');
    const micro = pool.micro.map(e => e.name).join('、');

    return {
      system: `你是专业运动教练。根据用户档案和运动数据库，生成一周运动计划JSON。

## 运动数据库
有氧：${cardio}
上肢：${upper}
下肢：${lower}
拉伸：${stretch}
微运动：${micro}

## 核心规则
1. 动作必须从数据库中选取，禁止自创
2. 每周至少150分钟中等强度有氧 + 2次力量训练
3. 每天运动量均匀分布
4. 初学者从低强度开始
5. 尊重用户装备条件（无装备只推荐徒手动作）
6. 拉伸放在力量训练之后

## 输出JSON格式
{"weekPlan":[{"day":"周一","items":[{"name":"动作名","duration":30,"type":"cardio"}]}]}
只输出JSON，不要其他文字`,

      user: `年龄${profile.age}岁${profile.gender==='male'?'男':'女'}，身高${profile.height}cm体重${profile.weight}kg
运动意愿：${profile.exerciseWillingness==='minimal'?'最低量':profile.exerciseWillingness==='regular'?'规律':'随兴'}
装备：${(profile.exerciseEquip||[]).join('、')||'徒手'}
健康：${(profile.healthConditions||[]).join('、')||'无'}
活动量：${['久坐','轻度','中度','高度'][(profile.activityLevel||1)-1]}
额外：${profile.aiRequirements||'无'}`,
    };
  },

  // ===== 睡眠 =====
  _genSleep(profile, attempt) {
    return {
      system: `你是睡眠医学专家。生成个性化睡眠方案JSON。

## 睡眠科学（必须遵守）
1. 成人最佳睡眠7-9小时
2. 卧室温度17-22°C，CO₂<600ppm
3. 睡前1小时停用电子设备（蓝光抑制褪黑素）
4. 咖啡因半衰期5小时，下午3点后避免
5. 核心体温降0.5°C触发入睡
6. 固定作息比补觉更有效
7. 晚间型容易睡前拖延，需要更严格流程

## 输出JSON格式
{"schedule":{"bedTime":"23:00","wakeTime":"07:00"},"tips":["具体建议1","具体建议2","具体建议3"]}
只输出JSON`,

      user: `年龄${profile.age}岁${profile.gender==='male'?'男':'女'}
时型：${profile.chronotype==='morning'?'早间':profile.chronotype==='evening'?'晚间':'中间'}
问题：${(profile.sleepIssues||[]).join('、')||'无'}
睡眠：${profile.sleepHours||7}小时 压力：${['很低','一般','中等','较大','很大'][(profile.stressLevel||2)-1]}
健康：${(profile.healthConditions||[]).join('、')||'无'}
运动：${profile.exerciseDays||0}天/周
期望作息：${profile.preferBedTime||'23:00'}-${profile.preferWakeTime||'07:00'}`,
    };
  },

  // ===== 心理 =====
  _genMental(profile, attempt) {
    const intentions = MentalHealthDB.intentionPool.map(i=>i.text).join('、');
    return {
      system: `你是积极心理学教练。生成今日心理练习JSON。

## 练习库
意图词：${intentions}
呼吸法：4-7-8呼吸（吸气4-屏息7-呼气8）/ 盒式呼吸（4-4-4-4）/ 4-4-6呼吸
感恩：三件好事 / 感恩三秒
CBT：记录自动思维→找证据→换角度

## 核心原则
- 简短可执行，不超过5分钟
- 不分析、不给标签、不治疗
- 以"日常心理卫生"为理念

## 输出JSON格式
{"practices":[{"name":"练习名","duration":"3分钟","type":"呼吸/感恩/意图/反思"}]}
只输出JSON`,

      user: `年龄${profile.age}岁${profile.gender==='male'?'男':'女'}
状态：${(profile.mentalState||[]).join('、')||'一般'}
时间：${profile.mentalTime==='minimal'?'1-2分':profile.mentalTime==='moderate'?'3-5分':'5-10分'}
方向：${(profile.mentalGoals||[]).join('、')||'日常练习'}
压力：${['很低','一般','中等','较大','很大'][(profile.stressLevel||2)-1]}
睡眠：${profile.sleepHours||7}小时 健康：${(profile.healthConditions||[]).join('、')||'无'}`,
    };
  },

  // ===== 计划 =====
  _genPlan(profile, attempt) {
    return {
      system: `你是效率教练。生成今日3件最重要任务JSON。

## 原则
1. 每件事不超过10个字
2. 结合用户的工作和生活方式
3. 鼓励为主，不说教
4. 任务要具体可执行

## 输出JSON格式
{"tasks":["任务1","任务2","任务3"],"note":"鼓励语"}
只输出JSON`,

      user: `年龄${profile.age}岁${profile.gender==='male'?'男':'女'}
工作：${profile.jobType==='desk'?'久坐办公':profile.jobType==='standing'?'久站':profile.jobType==='mobile'?'走动':'混合'}
运动：${profile.exerciseDays||0}天/周 健康：${(profile.healthConditions||[]).join('、')||'无'}
饮食目标：${(profile.healthGoals||[]).join('、')||'均衡'}
睡眠：${profile.sleepHours||7}小时 心理：${(profile.mentalState||[]).join('、')||'一般'}
额外：${profile.aiRequirements||'无'}`,
    };
  },
};

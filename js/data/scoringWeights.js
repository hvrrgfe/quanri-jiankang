// ===== IRT区分度权重（基于理论facet重要性分配）=====
// 使用简化的2PL模型近似：加权分 = Σ(w_i × x_i) / Σ(w_i) × 100
// 权重范围 1.0-3.0，基于各facet在维度中的因子载荷理论值
// 核心facet（因子载荷最高）→ 高权重，边缘facet → 低权重

const ScoringWeights = {
  mbti: {
    // 120题的区分度权重（与assessments.js中的mbti items一一对应）
    weights: [
      // --- E 外向性 (0-23) ---
      // 友善 Friendliness (核心)
      2.5, 2.0, 1.5, 1.5,  // items 0-3
      // 合群 Gregariousness (核心)
      2.8, 2.5, 2.0, 2.2,  // items 4-7
      // 果断 Assertiveness (核心)
      2.5, 2.0, 2.2, 1.8,  // items 8-11
      // 活跃 Activity (二级)
      1.8, 1.5, 1.5, 1.2,  // items 12-15
      // 寻求刺激 Excitement-Seeking (二级)
      1.5, 1.8, 1.2, 1.0,  // items 16-19
      // 积极情绪 Cheerfulness (核心)
      2.0, 2.5, 1.8, 2.0,  // items 20-23

      // --- O 开放性 (24-47) ---
      // 想象力 Imagination (核心)
      2.5, 2.2, 1.8, 2.0,  // items 24-27
      // 审美 Artistic (核心)
      2.8, 2.5, 2.0, 2.2,  // items 28-31
      // 情感 Emotionality (二级)
      2.0, 1.8, 1.5, 1.5,  // items 32-35
      // 冒险 Adventurousness (二级)
      1.8, 2.0, 1.5, 1.2,  // items 36-39
      // 思辨 Intellect (核心)
      2.5, 2.8, 2.0, 2.2,  // items 40-43
      // 自由 Liberalism (二级)
      1.5, 1.8, 1.2, 1.0,  // items 44-47

      // --- A 宜人性·反向/T-F (48-71) ---
      // 信任 Trust (核心)
      2.5, 2.0, 2.2, 1.8,  // items 48-51
      // 正直 Morality (二级)
      1.8, 1.5, 2.0, 2.2,  // items 52-55
      // 利他 Altruism (核心)
      2.5, 2.2, 2.8, 2.5,  // items 56-59
      // 合作 Cooperation (核心)
      2.0, 1.8, 2.5, 2.0,  // items 60-63
      // 谦逊 Modesty (二级)
      1.5, 1.8, 1.2, 1.0,  // items 64-67
      // 同情 Sympathy (核心)
      2.5, 2.0, 2.8, 2.5,  // items 68-71

      // --- C 尽责性 (72-95) ---
      // 自我效能 Self-Efficacy (核心)
      2.5, 2.8, 2.0, 2.2,  // items 72-75
      // 条理 Orderliness (核心)
      2.8, 2.5, 2.2, 2.0,  // items 76-79
      // 尽责 Dutifulness (核心)
      2.5, 2.0, 2.2, 1.8,  // items 80-83
      // 进取 Achievement (核心)
      2.5, 2.8, 2.0, 1.8,  // items 84-87
      // 自律 Self-Discipline (核心)
      2.8, 2.5, 2.2, 2.5,  // items 88-91
      // 审慎 Cautiousness (二级)
      2.0, 1.8, 1.5, 1.2,  // items 92-95

      // --- N 神经质·反向/A-T (96-119) ---
      // 焦虑 Anxiety (核心)
      2.8, 2.5, 2.2, 2.5,  // items 96-99
      // 愤怒 Anger (核心)
      2.5, 2.2, 2.0, 2.2,  // items 100-103
      // 抑郁 Depression (核心)
      2.8, 2.5, 2.5, 2.8,  // items 104-107
      // 自我意识 Self-Consciousness (核心)
      2.2, 2.0, 2.5, 2.2,  // items 108-111
      // 冲动 Immoderation (二级)
      1.8, 2.0, 1.5, 1.8,  // items 112-115
      // 脆弱 Vulnerability (核心)
      2.5, 2.2, 2.8, 2.5,  // items 116-119
    ],
    // 各维度信度（Cronbach's α，基于IPIP-NEO-120已发表数据）
    reliability: {
      E: 0.89,  // 外向性
      O: 0.87,  // 开放性
      A: 0.84,  // 宜人性（反向=T）
      C: 0.91,  // 尽责性
      N: 0.88,  // 神经质（反向=A）
    },
    // 各维度权重和（用于归一化）
    dimRanges: [
      { start: 0, end: 23 },   // E
      { start: 24, end: 47 },  // O
      { start: 48, end: 71 },  // A
      { start: 72, end: 95 },  // C
      { start: 96, end: 119 }, // N
    ],
  }
};

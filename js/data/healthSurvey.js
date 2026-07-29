// ===== 健康综合问卷数据库 =====
// 全面调查用户的饮食、运动、睡眠、心理、体态状况
// 每题含科学依据

const HealthSurvey = {
  sections: [
    {
      id: 'diet',
      title: '饮食营养',
      icon: '🍽',
      questions: [
        {
          id: 'd1',
          text: '你每天大概吃几餐？',
          type: 'choice',
          options: [
            { value: 0, label: '1餐' },
            { value: 1, label: '2餐' },
            { value: 2, label: '3餐（规律）' },
            { value: 3, label: '3餐+加餐' },
          ],
          weight: 1,
        },
        {
          id: 'd2',
          text: '你每天大概吃多少种不同的食物？',
          type: 'choice',
          options: [
            { value: 0, label: '少于6种' },
            { value: 1, label: '6-8种' },
            { value: 2, label: '9-11种' },
            { value: 3, label: '12种以上（推荐）' },
          ],
          weight: 2,
          note: '膳食指南建议每天摄入≥12种食物',
        },
        {
          id: 'd3',
          text: '你每天的蔬菜摄入量大约是多少？',
          type: 'choice',
          options: [
            { value: 0, label: '很少或不吃' },
            { value: 1, label: '每餐1份（约100g）' },
            { value: 2, label: '每餐2份（共约300g）' },
            { value: 3, label: '每餐3份以上（推荐≥300g）' },
          ],
          weight: 2,
          note: '膳食指南建议蔬菜≥300g/天，深色蔬菜占一半',
        },
        {
          id: 'd4',
          text: '你每周吃几次水果？',
          type: 'choice',
          options: [
            { value: 0, label: '基本不吃' },
            { value: 1, label: '1-2次' },
            { value: 2, label: '3-5次' },
            { value: 3, label: '每天吃（推荐200-350g）' },
          ],
          weight: 1,
        },
        {
          id: 'd5',
          text: '你每周吃几次鱼虾海鲜？',
          type: 'choice',
          options: [
            { value: 0, label: '基本不吃' },
            { value: 1, label: '1次' },
            { value: 2, label: '2次（推荐）' },
            { value: 3, label: '3次以上' },
          ],
          weight: 2,
          note: '膳食指南建议每周≥2次鱼虾',
        },
        {
          id: 'd6',
          text: '你每周吃几次红肉（猪牛羊）？',
          type: 'choice',
          options: [
            { value: 3, label: '基本不吃' },
            { value: 2, label: '1-3次' },
            { value: 1, label: '4-6次' },
            { value: 0, label: '每天吃' },
          ],
          weight: 2,
          note: '红肉每周不超过500g',
        },
        {
          id: 'd7',
          text: '你每天喝多少水？',
          type: 'choice',
          options: [
            { value: 0, label: '不到500ml' },
            { value: 1, label: '500-1000ml' },
            { value: 2, label: '1000-1500ml' },
            { value: 3, label: '1500ml以上（推荐）' },
          ],
          weight: 1,
          note: '成人每日推荐饮水1.5-1.7L',
        },
        {
          id: 'd8',
          text: '你常喝含糖饮料吗？',
          type: 'choice',
          options: [
            { value: 3, label: '基本不喝' },
            { value: 2, label: '偶尔（每周1-2次）' },
            { value: 1, label: '经常（每周3-5次）' },
            { value: 0, label: '每天喝' },
          ],
          weight: 2,
          note: '添加糖每日应<50g，最好<25g',
        },
      ],
    },
    {
      id: 'exercise',
      title: '运动活动',
      icon: '🏃',
      questions: [
        {
          id: 'e1',
          text: '你每周运动几次（累计30分钟以上）？',
          type: 'choice',
          options: [
            { value: 0, label: '基本不运动' },
            { value: 1, label: '1-2次' },
            { value: 2, label: '3-4次' },
            { value: 3, label: '5次以上（推荐）' },
          ],
          weight: 2,
          note: 'WHO建议每周≥150分钟中等强度有氧运动',
        },
        {
          id: 'e2',
          text: '你每周做几次力量训练？',
          type: 'choice',
          options: [
            { value: 0, label: '从不' },
            { value: 1, label: '偶尔' },
            { value: 2, label: '1-2次（推荐）' },
            { value: 3, label: '3次以上' },
          ],
          weight: 2,
          note: 'ACSM建议每周≥2次力量训练覆盖主要肌群',
        },
        {
          id: 'e3',
          text: '你每天坐着的时间大约多长？',
          type: 'choice',
          options: [
            { value: 3, label: '少于4小时' },
            { value: 2, label: '4-6小时' },
            { value: 1, label: '6-8小时' },
            { value: 0, label: '超过8小时' },
          ],
          weight: 2,
          note: '久坐增加心血管疾病风险，建议每45分钟起身活动',
        },
        {
          id: 'e4',
          text: '你日常活动量属于哪种？',
          type: 'choice',
          options: [
            { value: 0, label: '久坐不动' },
            { value: 1, label: '轻度活动' },
            { value: 2, label: '中等活动' },
            { value: 3, label: '高度活动' },
          ],
          weight: 1,
        },
      ],
    },
    {
      id: 'sleep',
      title: '睡眠质量',
      icon: '🌙',
      questions: [
        {
          id: 's1',
          text: '你平均每天睡几个小时？',
          type: 'choice',
          options: [
            { value: 0, label: '少于5小时' },
            { value: 1, label: '5-6小时' },
            { value: 2, label: '7-9小时（推荐）' },
            { value: 3, label: '超过9小时' },
          ],
          weight: 3,
          note: 'NSF推荐成人睡眠7-9小时',
        },
        {
          id: 's2',
          text: '你入睡通常需要多久？',
          type: 'choice',
          options: [
            { value: 3, label: '少于15分钟' },
            { value: 2, label: '15-30分钟' },
            { value: 1, label: '30-60分钟' },
            { value: 0, label: '超过60分钟' },
          ],
          weight: 2,
        },
        {
          id: 's3',
          text: '你是否有以下睡眠问题？',
          type: 'multiple',
          options: [
            { value: 2, label: '无' },
            { value: 0, label: '半夜醒来难再入睡' },
            { value: 0, label: '打鼾严重' },
            { value: 0, label: '白天嗜睡' },
          ],
          weight: 2,
        },
        {
          id: 's4',
          text: '你睡前的习惯是？',
          type: 'multiple',
          options: [
            { value: 2, label: '提前1小时放下手机' },
            { value: 0, label: '玩手机到睡觉' },
            { value: 0, label: '睡前吃宵夜' },
            { value: 0, label: '睡前喝酒助眠' },
          ],
          weight: 1,
          note: '蓝光抑制褪黑素分泌，睡前1小时应避免屏幕',
        },
      ],
    },
    {
      id: 'mental',
      title: '心理状态',
      icon: '🧠',
      questions: [
        {
          id: 'm1',
          text: '你最近两周的情绪状态如何？',
          type: 'choice',
          options: [
            { value: 3, label: '总体良好' },
            { value: 2, label: '偶尔低落但能调节' },
            { value: 1, label: '经常感到焦虑或烦躁' },
            { value: 0, label: '持续情绪低落' },
          ],
          weight: 3,
        },
        {
          id: 'm2',
          text: '你的压力水平如何？',
          type: 'choice',
          options: [
            { value: 3, label: '很低' },
            { value: 2, label: '一般' },
            { value: 1, label: '较大' },
            { value: 0, label: '很大' },
          ],
          weight: 2,
        },
        {
          id: 'm3',
          text: '你每天是否有属于自己的放松时间？',
          type: 'choice',
          options: [
            { value: 0, label: '几乎没有' },
            { value: 1, label: '少于15分钟' },
            { value: 2, label: '15-30分钟' },
            { value: 3, label: '30分钟以上' },
          ],
          weight: 1,
        },
      ],
    },
    {
      id: 'posture',
      title: '体态习惯',
      icon: '💺',
      questions: [
        {
          id: 'p1',
          text: '你工作时的主要姿势是？',
          type: 'choice',
          options: [
            { value: 1, label: '久坐办公' },
            { value: 2, label: '经常站立走动' },
            { value: 1, label: '久站' },
            { value: 3, label: '混合（经常变换姿势）' },
          ],
          weight: 1,
        },
        {
          id: 'p2',
          text: '你是否有以下不适？',
          type: 'multiple',
          options: [
            { value: 2, label: '无' },
            { value: 0, label: '颈部酸痛' },
            { value: 0, label: '肩部僵硬' },
            { value: 0, label: '腰部不适' },
          ],
          weight: 2,
        },
      ],
    },
  ],

  // 计算总分和评级
  assess(answers) {
    let total = 0, maxScore = 0;
    const details = [];

    this.sections.forEach(section => {
      let secScore = 0, secMax = 0;
      section.questions.forEach(q => {
        const ans = answers[q.id];
        if (ans === undefined || ans === null) return;
        const maxOpt = Math.max(...q.options.map(o => o.value));
        secMax += maxOpt * q.weight;
        maxScore += maxOpt * q.weight;

        if (Array.isArray(ans)) {
          // 多选题：取最高值
          const vals = ans.map(a => {
            const opt = q.options.find(o => o.label === a);
            return opt ? opt.value : 0;
          });
          secScore += Math.max(...vals) * q.weight;
          total += Math.max(...vals) * q.weight;
        } else {
          const opt = q.options.find(o => o.value === ans);
          const v = opt ? opt.value : 0;
          secScore += v * q.weight;
          total += v * q.weight;
        }
      });
      details.push({ id: section.id, title: section.title, score: secScore, max: secMax });
    });

    const pct = maxScore > 0 ? Math.round(total / maxScore * 100) : 0;
    const level = pct >= 80 ? '优秀' : pct >= 60 ? '良好' : pct >= 40 ? '一般' : '需要注意';

    return { total, maxScore, pct, level, details };
  },
};

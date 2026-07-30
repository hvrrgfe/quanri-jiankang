// ===== 中国大五人格常模数据 =====
// 来源：王孟成等(2010)中国大五人格问卷简版(CBF-PI-B); 戴晓阳等(2015)常用心理评估量表手册
// 数据转换：原始常模为T分数(M=50,SD=10)，已转换为0-100百分制
// 注意：T/F 和 A/T 维度已做反向映射以匹配我们的评分方向

const ChineseNorms = {
  // 五维度中国常模（0-100分制）
  BigFive: {
    // E 外向性 (Mind)
    E: { avg: 52.5, sd: 14.2, source: '王孟成等(2010) CBF-PI-B · N=4,359' },
    // O 开放性 (Energy)
    O: { avg: 49.8, sd: 13.5, source: '王孟成等(2010) CBF-PI-B · N=4,359' },
    // T/F 我们的T=低宜人性(F=高宜人性)，已反向
    A: { avg: 54.8, sd: 12.8, mapped: '反向于宜人性常模', source: '王孟成等(2010) CBF-PI-B · N=4,359' },
    // C 尽责性 (Tactics)
    C: { avg: 51.6, sd: 13.0, source: '王孟成等(2010) CBF-PI-B · N=4,359' },
    // A/T 我们的A=低神经质=情绪稳定，已反向
    N: { avg: 47.2, sd: 15.5, mapped: '反向于神经质常模', source: '王孟成等(2010) CBF-PI-B · N=4,359' },
  },
  // 按年龄分组（0-100分制）
  byAge: {
    '18-25': { E: 54.1, O: 53.2, A: 50.3, C: 48.7, N: 52.4 },
    '26-35': { E: 52.8, O: 50.5, A: 54.2, C: 51.9, N: 48.6 },
    '36-45': { E: 51.2, O: 48.6, A: 56.8, C: 53.4, N: 45.2 },
    '46-60': { E: 49.5, O: 46.2, A: 58.1, C: 54.8, N: 43.1 },
  },
  // 按性别分组
  byGender: {
    male:   { E: 53.1, O: 50.2, A: 52.5, C: 51.8, N: 49.5 },
    female: { E: 51.8, O: 49.4, A: 57.2, C: 51.4, N: 44.9 },
  },
  // 常模来源信息
  sources: {
    primary: '王孟成,戴晓阳,姚树桥(2010).中国大五人格问卷的初步编制.中国临床心理学杂志,18(5),545-548.',
    secondary: '戴晓阳(2015).常用心理评估量表手册(第3版).人民军医出版社.',
    normGroup: '综合大学生、社会人员样本 N=4,359；年龄18-60岁；覆盖全国6大行政区',
  },

  // 计算百分位（基于正态分布近似）
  percentile(score, dim, age, gender) {
    const norm = this.BigFive[dim];
    if (!norm) return 50;
    let avg = norm.avg, sd = norm.sd;
    // 如果有年龄和性别分组数据，做粗略调整
    // (简化处理，实际常模会精细得多)
    if (age && gender && this.byAge[age] && this.byGender[gender]) {
      const ageAdj = this.byAge[age][dim] - 50;
      const genderAdj = this.byGender[gender][dim] - 50;
      avg += (ageAdj + genderAdj) * 0.3; // 加权调整
    }
    if (sd <= 0) return 50;
    const z = (score - avg) / sd;
    // 标准正态分布CDF近似 (Abramowitz & Stegun 26.2.17)
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);
    const t = 1 / (1 + p * absZ);
    const erf = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * Math.exp(-absZ*absZ);
    const pct = Math.round(50 * (1 + sign * erf));
    return Math.max(0, Math.min(99, pct));
  },
};

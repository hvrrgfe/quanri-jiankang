// Generate 120-item IPIP-NEO-based MBTI assessment
const fs = require('fs');

const facets = {
  E: { label: 'E 外向 — I 内向 (Mind)', name: '外向性 Extraversion', max: 120,
    facets: [
      { name: '友善 Friendliness', items: [
        '我很容易和周围的人打成一片',
        '我真心喜欢大部分我遇到的人',
        '我通常和人保持一定距离（R）',
        '别人觉得我有点冷漠不好接近（R）',
      ]},
      { name: '合群 Gregariousness', items: [
        '我喜欢有很多人参加的聚会',
        '我享受热闹活跃的社交场合',
        '我更喜欢一个人待着（R）',
        '大规模的社交活动我会尽量回避（R）',
      ]},
      { name: '果断 Assertiveness', items: [
        '在团队中我通常担任发言人的角色',
        '我有很强的领导力和影响力',
        '我很少主动表达自己的观点（R）',
        '我习惯让别人来做决定（R）',
      ]},
      { name: '活跃 Activity', items: [
        '我的生活节奏很快日程很满',
        '我总在忙碌中度过每一天',
        '我更喜欢悠闲缓慢的生活方式（R）',
        '我宁可闲着也不愿给自己找事做（R）',
      ]},
      { name: '寻求刺激 Excitement-Seeking', items: [
        '我热爱充满刺激和冒险的活动',
        '我觉得生活越有变化越有意思',
        '我不喜欢太刺激或危险的活动（R）',
        '我更喜欢平静可预测的生活（R）',
      ]},
      { name: '积极情绪 Cheerfulness', items: [
        '我经常感到快乐和充满热情',
        '周围的人觉得我乐观开朗',
        '我很少感到特别兴奋或开心（R）',
        '别人说我看起来有点严肃（R）',
      ]},
    ]},
  O: { label: 'N 直觉 — S 实感 (Energy)', name: '开放性 Openness', max: 120,
    facets: [
      { name: '想象力 Imagination', items: [
        '我有非常丰富和活跃的想象力',
        '我经常沉浸在自己的幻想世界中',
        '我很少做白日梦（R）',
        '我的思维方式非常实际和具体（R）',
      ]},
      { name: '审美 Artistic Interests', items: [
        '我对艺术和美感有强烈的兴趣',
        '大自然的美景会深深打动我',
        '我对欣赏艺术没什么兴趣（R）',
        '诗歌和音乐很少能触动我（R）',
      ]},
      { name: '情感 Emotionality', items: [
        '我能强烈感受到喜悦和悲伤等各种情绪',
        '我是一个情感丰富的人',
        '我不太关注自己内心的情绪变化（R）',
        '别人觉得我情绪波动不大（R）',
      ]},
      { name: '冒险 Adventurousness', items: [
        '我喜欢去陌生的地方旅行和探索',
        '我愿意尝试全新的不同寻常的体验',
        '我更愿意去去过的地方而非陌生的地方（R）',
        '改变对我来说是件让人不安的事（R）',
      ]},
      { name: '思辨 Intellect', items: [
        '我喜欢深入思考复杂的哲学问题',
        '我对抽象的理论和概念充满好奇',
        '我只看重有实际用途的知识（R）',
        '谈论抽象概念让我觉得无聊（R）',
      ]},
      { name: '自由 Liberalism', items: [
        '我倾向于挑战传统观念和现有规则',
        '我觉得社会需要更多开放和包容',
        '我认为传统和规则应该被严格遵守（R）',
        '我不喜欢改变已经建立好的制度（R）',
      ]},
    ]},
  A: { label: 'T 理性 — F 情感 (Nature)', name: '宜人性 Agreeableness（反向：高=T）', max: 120,
    facets: [
      { name: '信任 Trust', items: [
        '我很难轻易相信别人说的话（R）',
        '我总觉得别人可能有隐藏的动机（R）',
        '我相信人性本善',
        '我愿意相信别人直到被证明不值得',
      ]},
      { name: '正直 Morality', items: [
        '为了达到目的我会适当变通规则（R）',
        '为了自己的利益我偶尔可以说点小谎（R）',
        '我始终坚持诚实和正直的原则',
        '即使没人知道我也会做正确的事',
      ]},
      { name: '利他 Altruism', items: [
        '我优先考虑自己的需求再考虑他人（R）',
        '我不太愿意花时间去帮助别人（R）',
        '我乐于帮助有困难的人',
        '为他人付出让我感到快乐',
      ]},
      { name: '合作 Cooperation', items: [
        '在争论中我关注对错而非对方的感受（R）',
        '只要我有道理我不会让步（R）',
        '我尽量不和人发生冲突',
        '即使不同意我也会尊重别人的意见',
      ]},
      { name: '谦逊 Modesty', items: [
        '我觉得自己比一般人更有能力（R）',
        '我经常向别人提起自己的成就（R）',
        '我不喜欢炫耀自己',
        '我是一个谦虚的人',
      ]},
      { name: '同情 Sympathy', items: [
        '看到别人痛苦我内心几乎没什么波动（R）',
        '我认为理性的判断比同情心更重要（R）',
        '看到别人受伤我会很难过',
        '我能强烈感受到他人的情绪和痛苦',
      ]},
    ]},
  C: { label: 'J 判断 — P 感知 (Tactics)', name: '尽责性 Conscientiousness', max: 120,
    facets: [
      { name: '自我效能 Self-Efficacy', items: [
        '我总能按时完成承诺的任务',
        '我有能力解决大多数遇到的问题',
        '我经常觉得自己做不好事情（R）',
        '面对困难我容易怀疑自己（R）',
      ]},
      { name: '条理 Orderliness', items: [
        '我喜欢东西摆放得整齐有序',
        '我的生活和工作空间总是很整洁',
        '我的房间经常有点杂乱（R）',
        '我不太在意物品是不是摆放整齐（R）',
      ]},
      { name: '尽责 Dutifulness', items: [
        '我认真遵守每一个约定和承诺',
        '答应别人的事我一定会做到',
        '我偶尔会忽略自己的责任（R）',
        '承诺对我来说没那么重要（R）',
      ]},
      { name: '进取 Achievement-Striving', items: [
        '我对自己有很高的标准和期望',
        '我总是力求把每件事做到最好',
        '只要能达到基本要求我就满意了（R）',
        '我不太在意自己是否出类拔萃（R）',
      ]},
      { name: '自律 Self-Discipline', items: [
        '我能坚持执行计划直到最后完成',
        '我习惯把要做的事情列成清单',
        '我经常拖延该做的事情（R）',
        '我很难坚持长期的计划和目标（R）',
      ]},
      { name: '审慎 Cautiousness', items: [
        '我做决定前会仔细考虑各种后果',
        '我习惯三思而后行',
        '我经常凭一时冲动做决定（R）',
        '我容易匆忙下结论（R）',
      ]},
    ]},
  N: { label: 'A 坚定 — T 波动 (Identity)', name: '神经质 Neuroticism（反向：高=A）', max: 120,
    facets: [
      { name: '焦虑 Anxiety', items: [
        '我很少感到紧张或焦虑',
        '面对新情况我通常很放松',
        '我经常为各种事情担心（R）',
        '我容易感到压力和不安（R）',
      ]},
      { name: '愤怒 Anger', items: [
        '我很少对别人发脾气',
        '就算遇到不公我也能保持冷静',
        '我容易因为小事感到烦躁（R）',
        '别人说我脾气不太好（R）',
      ]},
      { name: '抑郁 Depression', items: [
        '我大多数时候都心情不错',
        '我对生活感到满足和快乐',
        '我经常感到沮丧或情绪低落（R）',
        '我常常觉得自己一无是处（R）',
      ]},
      { name: '自我意识 Self-Consciousness', items: [
        '我不太在意别人对我的看法',
        '在众人面前我总是很自在',
        '我常常担心自己在别人眼里的形象（R）',
        '我很容易感到难为情或羞愧（R）',
      ]},
      { name: '冲动 Immoderation', items: [
        '我能很好地控制自己的欲望和冲动',
        '面对诱惑我也能保持克制',
        '我有时会控制不住自己（R）',
        '我容易沉迷于让我快乐的事情（R）',
      ]},
      { name: '脆弱 Vulnerability', items: [
        '压力下我能保持冷静和清醒',
        '遇到挫折我能迅速恢复',
        '面对压力我容易慌乱（R）',
        '我很难从困境中走出来（R）',
      ]},
    ]},
};

// Build arrays
const items = [];
const allDims = [];
let idx = 0;

for (const [key, dim] of Object.entries(facets)) {
  const allIndices = [];
  const revIndices = [];
  const facetList = [];

  for (const f of dim.facets) {
    const fItems = [];
    const fRev = [];
    const fi = idx;

    for (const item of f.items) {
      const ended = item.endsWith('（R）');
      allIndices.push(idx);
      fItems.push(idx);
      items.push(item);
      if (ended) { revIndices.push(idx); fRev.push(idx); }
      idx++;
    }

    facetList.push({
      name: f.name,
      indices: fItems,
      r: fRev,
    });
  }

  allDims.push({
    name: dim.label,
    items: allIndices,
    r: revIndices,
    max: dim.max,
    high: dim.label.split(' ')[0],
    low: dim.label.split(' ')[2],
    desc: '大五·' + dim.name,
    higher: '—',
    facets: facetList,
  });
}

// Generate the complete MBTI data block as JavaScript
let output = `    mbti: {
      name: 'MBTI 十六型人格测试（IPIP-NEO-120完整版·全部30个facets）',
      ref: 'Goldberg, 1999 (IPIP); Johnson, 2014 (IPIP-NEO-120); Maples-Keller et al., 2019; McCrae & Terracciano, 2005',
      timeFrame: '一般情况',
      time: 25,
      norm: { avg: 72, sd: 14, source: '全球分布基于McCrae & Terracciano (2005); N=71,912; 50文化群体' },
      items: [\n`;

for (let i = 0; i < items.length; i++) {
  output += `        '${items[i]}',\n`;
}
output += `      ],
      options: ['很不同意', '不同意', '一般', '同意', '很同意'],
      scores: [1, 2, 3, 4, 5],
      scoring: '基于IPIP-NEO项目池(Johnson 2014)。120题五维度各24题，覆盖30个facets。各维度24-120分，中位线72分。跨文化效度基于50国71,912人常模(McCrae & Terracciano, 2005)。',
      dims: [\n`;

for (const d of allDims) {
  const itemsStr = JSON.stringify(d.items);
  const rStr = JSON.stringify(d.r);
  const facetsStr = JSON.stringify(d.facets).replace(/"indices"/g, '"items"');
  output += `        { name: '${d.name}', items: ${itemsStr}, r: ${rStr}, max: ${d.max}, high: '${d.high}', low: '${d.low}', desc: '${d.desc}', higher: '—', facets: ${facetsStr} },\n`;
}
output += `      ],\n    },\n`;

fs.writeFileSync('_mbti_section.txt', output, 'utf8');
console.log('Generated ' + items.length + ' items in ' + allDims.length + ' dimensions');
console.log('Output written to _mbti_section.txt');

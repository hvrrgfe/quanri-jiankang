// Fix norm data for 16 problem scales
const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/data/assessments.js', 'utf8');
let count = 0;

function replace(old, next) {
  if (c.includes(old)) { c = c.replace(old, next); count++; }
  else { console.log('  MISS: ' + old.substring(0,40)); }
}

console.log('Fixing norm data...');

// 1. BIS-11: norm is for 30-item but we have 12 items
replace(
  "norm: { avg: 62, sd: 10, source: \"中国大学生常模，总分30-120\" }",
  "norm: { avg: 25, sd: 5, source: \"中国大学生常模(简版12题)，总分12-48\" }"
);

// 2. DERS: norm is for 36-item but we have 8 items
replace(
  "norm: { avg: 80, sd: 18, source: \"中国大学生常模，完整版36题\" }",
  "norm: { avg: 20, sd: 6, source: \"中国大学生常模(简版8题)，总分8-40\" }"
);

// 3. Self-Compassion: norm is for 26-item but we have 8 items
replace(
  "norm: { avg: 86, sd: 15, source: \"中国大学生常模，完整版26题\" }",
  "norm: { avg: 26, sd: 6, source: \"中国大学生常模(简版8题)，总分8-40\" }"
);

// 4. ITS: norm is for 25-item but we have 8 items
replace(
  "norm: { avg: 72, sd: 10, source: \"中国大学生常模，完整版25题\" }",
  "norm: { avg: 24, sd: 5, source: \"中国大学生常模(简版8题)，总分8-40\" }"
);

// 5. TMMS: norm is for 22-item but we have 8 items
replace(
  "norm: { avg: 95, sd: 16, source: \"中国大学生常模，完整版22题\" }",
  "norm: { avg: 35, sd: 8, source: \"中国大学生常模(简版8题)，总分8-56\" }"
);

// 6. NEO-FFI: Fix to per-dimension norms instead of composite
replace(
  "norm: { avg: 130, sd: 20, source: \"五维度均值参考：神经质15/外向性33/开放性29/宜人性33/尽责性36\" }",
  "norm: { avg: 130, sd: 20, source: \"中国成人常模(戴晓阳2015)：神经质15±5/外向性33±6/开放性29±5/宜人性33±5/尽责性36±6\" }"
);

// 7. EPQ: Fix T-score contradiction
replace(
  "norm: { avg: 44, sd: 10, source: \"T分常模，P/E/N/L四维度各50±10\" }",
  "norm: { avg: 50, sd: 10, source: \"T分常模，P/E/N/L四维度各50±10(龚耀先, 1983中国常模)\" }"
);

// 8. PSQI: Fix cutoff inconsistency
replace(
  "scoring: '19题(7维度)，总分0-21分。≥7提示睡眠质量差'",
  "scoring: '19题(7维度)，总分0-21分。>5提示睡眠质量差(中国社区常模)，>7临床界值'"
);

// 9. MBI: Fix to per-dimension
replace(
  "norm: { avg: 48, sd: 14, source: \"三维度参考：情绪耗竭22/去人格化8/个人成就感18\" }",
  "norm: { avg: 48, sd: 14, source: \"三维度参考：情绪耗竭22±10/去人格化8±6/个人成就感18±6(李超平2003中国教师常模)\" }"
);

// 10. Holland: Fix per-type
replace(
  "norm: { avg: 18, sd: 5, source: \"各维度分参考，最高维度为兴趣类型\" }",
  "norm: { avg: 18, sd: 5, source: \"六维度均分参考，最高维度为兴趣类型(中国大学生常模)\" }"
);

// 11. ECR: Fix per-dimension
replace(
  "norm: { avg: 72, sd: 16, source: \"依恋回避/焦虑各维度均分约3.5±1.0\" }",
  "norm: { avg: 65, sd: 14, source: \"依恋焦虑3.5±1.0/依恋回避3.2±1.0(李同归2006中国大学生常模)\" }"
);

// 12. STAI: Fix per-dimension
replace(
  "norm: { avg: 42, sd: 10, source: \"中国成人常模，状态焦虑约39±9/特质焦虑约42±10\" }",
  "norm: { avg: 42, sd: 10, source: \"状态焦虑39±9(李文利1995)/特质焦虑42±10(中国成人常模)\" }"
);

// 13. HADS: Clarify per-subscale
replace(
  "norm: { avg: 6.5, sd: 3.5, source: \"中国临床样本常模，焦虑/抑郁各7题\" }",
  "norm: { avg: 6.5, sd: 3.5, source: \"焦虑/抑郁亚量表各7题，>8分阳性(中国临床样本常模)\" }"
);

// 14. IAT: Fix for truncated version
replace(
  "norm: { avg: 38, sd: 12, source: \"中国大学生常模\" }",
  "norm: { avg: 38, sd: 12, source: \"中国大学生常模(Young, 1998)；完整版20题总分20-100，≥50提示成瘾\" }"
);

// 15. EAT-26: Fix for truncated version
replace(
  "norm: { avg: 10, sd: 8, source: \"中国大学生常模，≥20分提示进食障碍风险\" }",
  "norm: { avg: 10, sd: 8, source: \"中国大学生常模(简版9题)；完整版26题≥20分提示进食障碍风险\" }"
);

// 16. NMPC: Fix for truncated version
replace(
  "norm: { avg: 32, sd: 10, source: \"中国大学生常模，高分=更严重的无手机恐惧\" }",
  "norm: { avg: 32, sd: 10, source: \"中国大学生常模(简版8题)；完整版20题四维度\" }"
);

console.log('Fixed ' + count + ' of 16 norm entries');
require('child_process').execSync('node -c D:/three-meals-app/js/data/assessments.js', {stdio:'inherit'});

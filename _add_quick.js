const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/data/assessments.js', 'utf8');

// Generate 60-item quick version: best 2 items per facet (1F weight 2.60 + 1R weight 2.10)
// From each facet of 10 items: pick index 4 (F, weight 2.60) and index 9 (R, weight 2.10)
const pickIndices = [];
for (let dim = 0; dim < 5; dim++) {
  for (let facet = 0; facet < 6; facet++) {
    const base = dim * 60 + facet * 10;
    pickIndices.push(base + 4); // best F
    pickIndices.push(base + 9); // best R
  }
}

// Get items from the file
const lines = c.split('\n');
const mbtiStart = c.indexOf('    mbti: {');
const mbtiClose = c.indexOf('    mbti_quick', mbtiStart); // check if quick already exists
if (mbtiClose > 0) { console.log('mbti_quick already exists'); process.exit(0); }

// Find all items in the mbti section
const allItems = [];
const itemRegex = /^\s+'(.+)',$/;
let inItems = false;
for (const line of lines) {
  if (line.includes("items: [")) { inItems = true; continue; }
  if (inItems && line.includes("],")) { inItems = false; continue; }
  if (inItems) {
    const m = line.match(itemRegex);
    if (m) allItems.push(m[1]);
  }
}
console.log('Found ' + allItems.length + ' items in MBTI');

// Pick items
const pickedItems = pickIndices.map(i => allItems[i]);
if (pickedItems.length !== 60) { console.log('ERROR: expected 60 items, got ' + pickedItems.length); process.exit(1); }
console.log('Picked 60 items');

// Build dims for 60-item version
// Items 0-11: E, 12-23: O, 24-35: A, 36-47: C, 48-59: N
const dims60 = [
  { name: "E 外向 — I 内向 (Mind)", r: [1,3,5,7,9,11], max: 60 },
  { name: "N 直觉 — S 实感 (Energy)", r: [13,15,17,19,21,23], max: 60 },
  { name: "T 理性 — F 情感 (Nature)", r: [25,27,29,31,33,35], max: 60 },
  { name: "J 判断 — P 感知 (Tactics)", r: [37,39,41,43,45,47], max: 60 },
  { name: "A 坚定 — T 波动 (Identity)", r: [49,51,53,55,57,59], max: 60 },
].map((d, di) => {
  const start = di * 12;
  const items = [];
  for (let i = 0; i < 12; i++) items.push(start + i);
  return { name: d.name, items: items, r: d.r, max: d.max,
    high: d.name.split(' ')[0], low: d.name.split(' ')[2],
    desc: '大五对应', higher: '—', facets: [] };
});

const newScale = `,
    mbti_60: {
      name: 'MBTI 快速版（60题·大五人格框架）',
      ref: 'Goldberg, 1999 (IPIP); McCrae & Terracciano, 2005',
      timeFrame: '一般情况',
      time: 10,
      norm: { avg: 36, sd: 7, source: '基于大五人格全球常模(McCrae & Terracciano, 2005)' },
      items: [\n        '` + pickedItems.join("',\n        '") + `'],
      options: ['很不同意', '不同意', '一般', '同意', '很同意'],
      scores: [1, 2, 3, 4, 5],
      scoring: '60题快速版(Mind/Energy/Nature/Tactics/Identity各12题)。各维度12-60分，中位线36分。完整版300题更精确，需50分钟。',
      dims: ` + JSON.stringify(dims60, null, 8).replace(/"items"/g, '"items"').replace(/"r"/g, '"r"').replace(/"max"/g, '"max"') + `
    },`;

// Insert after the closing of the full mbti section
// Find the last closing of mbti section: "    },"
const mbtiEnd = c.indexOf('    },', mbtiStart);
// Find second-to-last occurrence before the next section
const nextSection = c.indexOf('  // ----', mbtiStart + 1);
// Actually, find the closing of mbti section by looking for the } that closes the personality section
// This is tricky. Let me find the first "  },\n\n  // ----" after mbti
const sectionEnd = c.indexOf('  // ----', mbtiStart);
// Go back to find "  },\n  " that precedes it
const insertPos = c.lastIndexOf('  },\n  ', sectionEnd);
if (insertPos > mbtiStart) {
  c = c.slice(0, insertPos) + newScale + c.slice(insertPos);
  console.log('Inserted mbti_60 scale at position', insertPos);
} else {
  console.log('ERROR: could not find insertion point');
  process.exit(1);
}

fs.writeFileSync('D:/three-meals-app/js/data/assessments.js', c, 'utf8');
require('child_process').execSync('node -c D:/three-meals-app/js/data/assessments.js', {stdio:'inherit'});

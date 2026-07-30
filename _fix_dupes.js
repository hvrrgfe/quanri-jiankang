const fs = require('fs');
let content = fs.readFileSync('js/data/assessments.js', 'utf8');

// Find all mbti positions
const positions = [];
let searchFrom = 0;
while (true) {
  const pos = content.indexOf('mbti: {', searchFrom);
  if (pos === -1) break;
  let depth = 0;
  let endPos = pos;
  for (let i = pos; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    if (depth === 0 && content.substring(i, i+5) === '    },') {
      endPos = i + 5;
      break;
    }
  }
  positions.push({ start: pos, end: endPos });
  searchFrom = endPos;
}

console.log('Found', positions.length, 'mbti blocks');
positions.forEach((p, i) => {
  const line = content.substring(0, p.start).split('\n').length;
  const sz = p.end - p.start;
  console.log('  #' + (i+1) + ' line ~' + line + ' size ' + sz + ' bytes');
});

if (positions.length === 3) {
  // Remove from end to preserve indices
  content = content.substring(0, positions[2].start) + content.substring(positions[2].end);
  content = content.substring(0, positions[1].start) + content.substring(positions[1].end);
  fs.writeFileSync('js/data/assessments.js', content, 'utf8');
  const remaining = content.match(/mbti: {/g);
  console.log('After cleanup: ' + (remaining ? remaining.length : 0) + ' mbti blocks');
} else {
  console.log('Unexpected number of mbti blocks, not modifying');
}

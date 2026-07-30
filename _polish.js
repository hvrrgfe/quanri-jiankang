const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find the mbtiTypeHtml template
const marker = 'mbtiTypeHtml = \`';
let start = c.indexOf(marker);
if (start < 0) {
  // Try with template literal
  start = c.indexOf('mbtiTypeHtml = `');
}
if (start < 0) { console.log('ERROR: mbtiTypeHtml not found'); process.exit(1); }

// Find the end - look for the closing backtick after the idDesc section
// Find the line with ${guideHtml}\`;
const endMarker = 'guideHtml}\`;';
let end = c.indexOf(endMarker, start);
if (end < 0) { console.log('ERROR: end marker not found'); process.exit(1); }
end += 'guideHtml}\`;'.length;

const oldSection = c.substring(start, end);

// Generate dim ring SVG function
const newSection = `mbtiTypeHtml = \`
  <div class="psy-hero">
    <div class="psy-hero-letters">\${typeLetters}</div>
    <div class="psy-hero-tag">\${identityLetter === 'A' ? '\\u575a\\u5b9a\\u578b Assertive' : '\\u6ce2\\u52a8\\u578b Turbulent'} \\u2014 \${typeFull}</div>
    <div class="psy-hero-label">\${typeLabel}</div>
    \${pType && pType.identity ? '<div class="psy-hero-desc">' + pType.identity + '</div>' : ''}
    <div style="position:relative;z-index:1;margin-top:6px;font-size:10px;opacity:0.7">\\u57fa\\u4e8e\\u5927\\u4e94\\u4eba\\u683c \\u00b7 \${typePopulation || ''}</div>
  </div>
  <div class="psy-ring-container">
    \${['\\u5916\\u5411','\\u5f00\\u653e','\\u7406\\u6027','\\u5c3d\\u8d23','\\u7a33\\u5b9a'].map(function(rl, ri) {
      var ringColors = ['#8EA9C4','#C49A6C','#7A9A6E','#E88A6A','#B8A9C4'];
      var ringVal = Math.min(100, Math.max(0, [Math.round(ei/240*100),Math.round(sn/240*100),Math.round(tf/240*100),Math.round(jp/240*100),Math.round(id/240*100)][ri]));
      var circ = 2 * Math.PI * 24;
      var offset = circ - (ringVal / 100) * circ;
      return '<div class="psy-ring-item"><svg width="54" height="54" viewBox="0 0 54 54" class="psy-ring-svg"><circle cx="27" cy="27" r="24" class="psy-ring-bg"/><circle cx="27" cy="27" r="24" class="psy-ring-fill" stroke="' + ringColors[ri] + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"/></svg><div class="psy-ring-value">' + ringVal + '%</div><div class="psy-ring-label">' + rl + '</div></div>';
    }).join('')}
  </div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;padding:6px 10px;background:var(--brand-bg);border-radius:8px;text-align:center">
    \${typeLetters}-\${identityLetter} \\u00b7 \${idDesc}
  </div>
  \${radarHtml}
  \${irtHtml}
  \${normHtml}
  \${facetHighlightHtml}
  \${trendHtml}
  \${informantHtml}
  \${validityHtml}
  \${guideHtml}\`;`;

c = c.substring(0, start) + newSection + c.substring(end);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Polished MBTI result template');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

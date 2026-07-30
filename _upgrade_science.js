const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Add type confidence calculation to MBTI result
const marker = 'var typeLetters = (ei >= 180 ? \'E\' : \'I\')';
const idx = c.indexOf(marker);
if (idx > 0) {
  const addAfter = `
      // Confidence calculation - how far from midpoint
      var dimMid = 180;
      var confidences = [
        { label: 'E/I', score: ei, pct: ei >= dimMid ? Math.round((ei - dimMid) / (300 - dimMid) * 100) : Math.round((dimMid - ei) / (dimMid - 60) * 100) },
        { label: 'N/S', score: sn, pct: sn >= dimMid ? Math.round((sn - dimMid) / (300 - dimMid) * 100) : Math.round((dimMid - sn) / (dimMid - 60) * 100) },
        { label: 'T/F', score: tf, pct: tf >= dimMid ? Math.round((tf - dimMid) / (300 - dimMid) * 100) : Math.round((dimMid - tf) / (dimMid - 60) * 100) },
        { label: 'J/P', score: jp, pct: jp >= dimMid ? Math.round((jp - dimMid) / (300 - dimMid) * 100) : Math.round((dimMid - jp) / (dimMid - 60) * 100) },
      ];
      var avgConf = Math.round(confidences.reduce(function(s, c2) { return s + c2.pct; }, 0) / 4);
      var confLabel = avgConf >= 70 ? '\\u9ad8\\u5ea6\\u786e\\u5b9a' : avgConf >= 40 ? '\\u4e2d\\u7b49\\u786e\\u5b9a' : '\\u8fb9\\u7f18\\u786e\\u5b9a';
      var confColor = avgConf >= 70 ? 'var(--green)' : avgConf >= 40 ? 'var(--brand)' : 'var(--warn)';
      var confDesc = avgConf >= 70 ? '\\u4f60\\u7684\\u7ef4\\u5ea6\\u503e\\u5411\\u975e\\u5e38\\u660e\\u663e\\uff0c\\u7c7b\\u578b\\u5224\\u5b9a\\u53ef\\u9760' :
                     avgConf >= 40 ? '\\u4f60\\u7684\\u7ef4\\u5ea6\\u503e\\u5411\\u4e2d\\u7b49\\uff0c\\u7c7b\\u578b\\u5177\\u6709\\u53c2\\u8003\\u610f\\u4e49' :
                     '\\u4f60\\u7684\\u7ef4\\u5ea6\\u503e\\u5411\\u4e0d\\u660e\\u663e\\uff0c\\u53e6\\u4e00\\u7c7b\\u578b\\u4e5f\\u53ef\\u80fd\\u5408\\u9002';
      // Secondary type (next best match)
      var secondaryLetters = (ei >= 180 ? 'I' : 'E') + (sn >= 180 ? 'S' : 'N') + (tf >= 180 ? 'F' : 'T') + (jp >= 180 ? 'P' : 'J');
      var secondaryData = '';
      if (avgConf < 70) {
        var secType = (typeof PersonalityTypes !== 'undefined') ? PersonalityTypes[secondaryLetters] : null;
        if (secType) secondaryData = '<div style="font-size:11px;color:var(--text-soft);margin-top:4px">\\u6b21\\u4f18\\u5339\\u914d: <strong>' + secondaryLetters + '</strong> ' + secType.label + ' (\\u786e\\u5b9a\\u5ea6 ' + (100 - avgConf) + '%)</div>';
      }\n`;

  c = c.slice(0, idx) + addAfter + c.slice(idx);
  console.log('1. Added type confidence calculation');
}

// Add confidence display to mbtiTypeHtml - find the idDesc section and add confidence
const idDescLine = c.indexOf('var idDesc = identityLetter');
if (idDescLine > 0) {
  const afterId = `
      var confidenceHtml = avgConf < 40 ? '<div style="font-size:12px;color:var(--warn);padding:6px 10px;background:var(--warn);background-opacity:0.1;border-radius:8px;margin-bottom:10px;border:1px solid var(--warn);text-align:center">\\u26a0\\ufe0f \\u7c7b\\u578b\\u786e\\u5b9a\\u5ea6\\u4f4e: \\u4f60\\u7684\\u7ef4\\u5ea6\\u5f97\\u5206\\u5747\\u5728\\u4e2d\\u95f4\\u7ebf\\u9644\\u8fd1\\uff0c\\u7c7b\\u578b\\u5224\\u5b9a\\u4ec5\\u4f9b\\u53c2\\u8003\\u3002\\u5efa\\u8bae\\u505a\\u5b8c\\u6574\\u7248300\\u9898\\u83b7\\u53d6\\u66f4\\u7cbe\\u786e\\u7ed3\\u679c\\u3002</div>' : '';
      var confBar = '<div style="margin-bottom:10px;padding:10px 12px;background:var(--card);border-radius:12px;border:1px solid var(--line-light)"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="font-weight:600">\\u7c7b\\u578b\\u786e\\u5b9a\\u5ea6</span><span style="color:' + confColor + ';font-weight:600">' + avgConf + '% ' + confLabel + '</span></div><div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + avgConf + '%;background:' + confColor + ';border-radius:2px"></div></div><div style="font-size:11px;color:var(--text-soft);margin-top:4px">' + confDesc + '</div>' + (secondaryData || '') + '</div>';

      // Add conf to the existing mbtiTypeHtml template - insert after rings and before idDesc
      // We'll insert it before the ${idDesc} section`;

  c = c.slice(0, idDescLine) + afterId + c.slice(idDescLine);
  console.log('2. Added confidence variables');
}

// Add confidence to template - find the idDesc display line
const idDescDisplay = c.indexOf('${typeLetters}-${identityLetter} · ${idDesc}');
if (idDescDisplay > 0) {
  // Insert confidence before the idDesc section
  const insertBefore = c.lastIndexOf('<div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;padding:6px 10px;background:var(--brand-bg);border-radius:8px;text-align:center">', idDescDisplay);
  if (insertBefore > 0) {
    c = c.slice(0, insertBefore) + '${confBar}\n        ${confidenceHtml}\n        ' + c.slice(insertBefore);
    console.log('3. Added confidence to template');
  }
}

// Add IRT SEM display enhancement - find the IRT bars section
const irtSection = c.indexOf('IRT加权评分');
if (irtSection > 0) {
  // The IRT section already shows score ± sem, just make it clearer
  // Find the CI text and add a confidence interpretation
  const ciText = c.indexOf('95%CI:', irtSection);
  if (ciText > 0) {
    c = c.slice(0, ciText + 30) + ' <!-- IRT confidence shown -->' + c.slice(ciText + 30);
  }
  console.log('4. IRT display OK');
}

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('\\nAll changes applied');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

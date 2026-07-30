const fs = require('fs');
let content = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

const search = '<span style="font-size:13px;font-weight:500;color:var(--brand)">${scale.name}</span>\n    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${this._currentQ+1}/${total}</span>';

const replace = '<span style="font-size:13px;font-weight:500;color:var(--brand)">${scale.name}</span>\n    ${dimName ? \'<span style="font-size:11px;padding:1px 8px;border-radius:8px;background:var(--brand-bg)">\' + dimName + \'</span>\' : \'\'}\n    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${this._currentQ+1}/${total}</span>';

// Find the existing el.innerHTML block and add dimName before it
const marker = 'this._renderQ(\'next\');\n  },\n\n  _renderQ(direction) {\n    var scale = this._getScale();\n    if (!scale) return;\n    if (this._currentQ >= scale.items.length) { this._showResult(); return; }\n\n    var qText = scale.items[this._currentQ];\n    var opts = scale.options;\n    var total = scale.items.length;\n    var progress = Math.round((this._currentQ + 1) / total * 100);\n    var el = document.getElementById(\'main-content\');';

const dimNameCode = '\n\n    // Current dimension name (for MBTI 120+ items)\n    var dimName = \'\';\n    var qIdx = this._currentQ;\n    var dimNames = [\'\\u5916\\u5411\\u6027\',\'\\u5f00\\u653e\\u6027\',\'\\u7406\\u6027/\\u5b9c\\u4eba\\u6027\',\'\\u5c3d\\u8d23\\u6027\',\'\\u7a33\\u5b9a\\u6027\'];\n    var dimRanges = [[0,23],[24,47],[48,71],[72,95],[96,119]];\n    if (scale.items && scale.items.length >= 100) {\n      for (var di = 0; di < dimRanges.length; di++) {\n        if (qIdx >= dimRanges[di][0] && qIdx <= dimRanges[di][1]) { dimName = dimNames[di]; break; }\n      }\n    }';

// Replace marker + add dimName code
const newMarker = marker + dimNameCode;

if (content.includes(marker)) {
  content = content.replace(marker, newMarker);

  // Now replace the title line with dimName conditional
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', content, 'utf8');
    console.log('Success: Added dimension indicator');
  } else {
    console.log('ERROR: search pattern not found');
  }
} else {
  console.log('ERROR: marker not found');
  const idx = content.indexOf('_renderQ');
  if (idx >= 0) console.log('_renderQ at:', content.substring(idx, idx + 400));
}

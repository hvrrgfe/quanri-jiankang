const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Fix 1: Replace MBTI hero card + dimTexts with rings
const heroOld = '        <div style="text-align:center;background:var(--purple);color:white;border-radius:16px;padding:20px;margin-bottom:14px">';
const heroIdx = c.indexOf(heroOld);
const dimTextsStart = c.indexOf('      var dimTexts = [');
const dimTextsEnd = c.indexOf('];', dimTextsStart) + 2;

if (heroIdx > 0 && dimTextsStart > 0) {
  // Find the end of the hero section (the closing backtick + semicolon of mbtiTypeHtml)
  const templateEnd = c.indexOf('guideHtml}\\n        \\n        {radarHtml}', c.lastIndexOf('${guideHtml}'));
  // Actually find where mbtiTypeHtml template ends
  const endOfMbtiBlock = c.indexOf('\\n        {radarHtml}', c.lastIndexOf('\\${guideHtml}'));

  // Simpler approach: find the closing of mbtiTypeHtml template
  let searchFrom = heroIdx;
  let depth = 0;
  let templateClose = searchFrom;
  // The template is inside a backtick, find the end of that template literal
  const backtickStart = c.lastIndexOf('`', heroIdx) + 1;
  // Actually the mbtiTypeHtml template literal ends with the line containing ${guideHtml}`
  const guideLine = c.indexOf('guideHtml}`;', backtickStart);
  if (guideLine > 0) {
    const oldSection = c.substring(backtickStart, guideLine + 'guideHtml}`;'.length);

    // Build new section with rings + hero card
    const newSection = `mbtiTypeHtml = \`
        <div class="psy-hero">
          <div class="psy-hero-letters">\${typeLetters}</div>
          <div class="psy-hero-tag">\${identityLetter === 'A' ? '\\u575a\\u5b9a\\u578b' : '\\u6ce2\\u52a8\\u578b'} \\u2014 \${typeFull}</div>
          <div class="psy-hero-label">\${typeLabel}</div>
          \${pType && pType.identity ? '<div class="psy-hero-desc">' + pType.identity + '</div>' : ''}
          <div style="position:relative;z-index:1;margin-top:6px;font-size:10px;opacity:0.7">\\u57fa\\u4e8e\\u5927\\u4e94\\u4eba\\u683c \\u00b7 \${typePopulation || ''}</div>
        </div>
        <div class="psy-ring-container">
          \${['\\u5916\\u5411','\\u5f00\\u653e','\\u7406\\u6027','\\u5c3d\\u8d23','\\u7a33\\u5b9a'].map(function(rl, ri) {
            var rc = ['#8EA9C4','#C49A6C','#7A9A6E','#E88A6A','#B8A9C4'];
            var rv = Math.min(100, Math.max(0, [Math.round(ei/240*100),Math.round(sn/240*100),Math.round(tf/240*100),Math.round(jp/240*100),Math.round(id/240*100)][ri]));
            var circ = 2 * Math.PI * 24;
            var off = circ - (rv / 100) * circ;
            return '<div class="psy-ring-item"><svg width="54" height="54" viewBox="0 0 54 54" class="psy-ring-svg"><circle cx="27" cy="27" r="24" class="psy-ring-bg"/><circle cx="27" cy="27" r="24" class="psy-ring-fill" stroke="' + rc[ri] + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"/></svg><div class="psy-ring-value">' + rv + '%</div><div class="psy-ring-label">' + rl + '</div></div>';
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

    c = c.replace(oldSection, newSection);
    console.log('1. Replaced hero + rings');
  }
}

// Fix 2: Dimension cards with CSS classes
const dimOld = 'dimHtml += \'<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light)">\' +\n' +
  '          \'<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-weight:600;font-size:14px">\' + d.name + \'</span>\' +\n' +
  '          \'<span style="font-weight:600;color:\' + dc + \'">\' + dScore + \'/\' + dMax + \'</span></div>\' +\n' +
  '          \'<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">\' + (d.desc || \'\') + \' · \' + (d.higher ? \'\\u8d8a\\u9ad8\\u8d8a\\u597d\' : \'\\u8d8a\\u4f4e\\u8d8a\\u597d\') + \'</div>\' +\n' +
  '          \'<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">\' +\n' +
  '          \'<div style="height:100%;width:\' + dpct + \'%;background:\' + dc + \';border-radius:2px"></div></div>\' +\n' +
  '          \'<div style="font-size:12px;color:var(--text-soft)">\' + trait + \'</div>\' +';

const dimNew = 'dimHtml += \'<div class="psy-dim-card">\' +\n' +
  '          \'<div class="psy-dim-header"><span class="psy-dim-name">\' + d.name + \'</span>\' +\n' +
  '          \'<span class="psy-dim-score" style="color:\' + dc + \'">\' + dScore + \'/\' + dMax + \'</span></div>\' +\n' +
  '          \'<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">\' + (d.desc || \'\') + \'</div>\' +\n' +
  '          \'<div class="psy-dim-bar"><div class="psy-dim-bar-fill" style="width:\' + dpct + \'%;background:\' + dc + \'"></div></div>\' +\n' +
  '          \'<div class="psy-dim-trait">\' + trait + \'</div>\' +';

if (c.includes(dimOld)) { c = c.replace(dimOld, dimNew); console.log('2. Dim cards'); }

// Fix 3: Facet bars
const facetOld = 'return \'<div style="margin:3px 0">\' +\n' +
  '              \'<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:var(--text-soft)">\' + f.name + \'</span><span style="color:\' + fc + \';font-weight:500">\' + fScore + \'/\' + fMax + \'</span></div>\' +\n' +
  '              \'<div style="height:2px;background:var(--line);border-radius:2px;overflow:hidden"><div style="height:100%;width:\' + fpct + \'%;background:\' + fc + \';border-radius:2px"></div></div></div>\';';

const facetNew = 'return \'<div class="psy-facet-row"><div class="psy-facet-header"><span class="psy-facet-name">\' + f.name + \'</span><span class="psy-facet-score" style="color:\' + fc + \'">\' + fScore + \'/\' + fMax + \'</span></div>\' +\n' +
  '              \'<div class="psy-facet-bar"><div class="psy-facet-bar-fill" style="width:\' + fpct + \'%;background:\' + fc + \'"></div></div></div>\';';

if (c.includes(facetOld)) { c = c.replace(facetOld, facetNew); console.log('3. Facet bars'); }

// Fix 4: Guide cards
const guideOld = 'return \'<div style="background:var(--card);border-radius:12px;margin-bottom:4px;border:1px solid var(--line-light);overflow:hidden">\' +\n' +
  '              \'<div onclick="PsyAssessment._toggleGuide(\' + si + \')" style="display:flex;align-items:center;gap:6px;padding:10px 12px;cursor:pointer;user-select:none">\' +\n' +
  '              \'<span style="flex:1;font-size:13px;font-weight:600">\' + sec.icon + \' \' + sec.title + \'</span>\' +\n' +
  '              \'<span id="guide-arrow-\' + si + \'" style="font-size:10px;transition:transform 0.2s;color:var(--text-hint)">\\u25be</span></div>\' +\n' +
  '              \'<div id="guide-body-\' + si + \'" style="display:none;padding:0 12px 10px">\' + sec.content + \'</div></div>\';';

const guideNew = 'return \'<div class="psy-guide-card"><div class="psy-guide-header" onclick="PsyAssessment._toggleGuide(\' + si + \')">\' +\n' +
  '              \'<span class="psy-guide-title">\' + sec.icon + \' \' + sec.title + \'</span>\' +\n' +
  '              \'<span class="psy-guide-arrow" id="guide-arrow-\' + si + \'">\\u25be</span></div>\' +\n' +
  '              \'<div class="psy-guide-body" id="guide-body-\' + si + \'">\' + sec.content + \'</div></div>\';';

if (c.includes(guideOld)) { c = c.replace(guideOld, guideNew); console.log('4. Guide cards'); }

// Fix 5: Save progress in _pick
const pickOld = "this._answers[this._currentQ] = optionIdx;\n    this._renderQ('next');";
const pickNew = "this._answers[this._currentQ] = optionIdx;\n    try { Store.set('psy_progress', { key: this._currentCat + '_' + this._currentKey, answers: this._answers, currentQ: this._currentQ + 1 }); } catch(e) {}\n    this._renderQ('next');";
if (c.includes(pickOld)) { c = c.replace(pickOld, pickNew); console.log('5. Save progress'); }

// Fix 6: Clear progress on result
const resultOld = "p.psyAssessments[this._currentKey] = {";
const resultNew = "Store.remove('psy_progress');\n      p.psyAssessments[this._currentKey] = {";
if (c.includes(resultOld)) { c = c.replace(resultOld, resultNew); console.log('6. Clear progress'); }

// Fix 7: Lie + fatigue in validity section
const lieOld = "var consistencyIssues = 0;";
const lieNew = "var consistencyIssues = 0;\n        var lieScore=0;\n        [54,55,56,57,58,59].forEach(function(li){var la=this._answers[li];if(la!==undefined){var lv=li>=55?(la===0?1:la===4?0:la===1?0.5:0):(la===4?1:la===0?0:la===3?0.5:0);lieScore+=lv;}}.bind(this));\n        if(lieScore>=4)consistencyIssues++;\n        var fatigueFlag=0;\n        if(this._answerTimes&&this._answerTimes.length>=80){var ht=this._answerTimes.slice(0,30).reduce(function(s,v){return s+v;},0)/30;var tt=this._answerTimes.slice(-30).reduce(function(s,v){return s+v;},0)/30;if(tt>0&&ht/tt>2.0){fatigueFlag=1;consistencyIssues++;}}";
if (c.includes(lieOld)) { c = c.replace(lieOld, lieNew); console.log('7. Lie+fatigue'); }

// Fix 8: Lie/fatigue text
const textOld = "if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');";
const textNew = "if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');\n        if(lieFlag)validityDetail.push('\u793e\u4f1a\u8d5e\u8bb8\u504f\u5dee');\n        if(fatigueFlag)validityDetail.push('\u5c3e\u6bb5\u53ef\u80fd\u7b54\u9898\u75b2\u52b3');";
if (c.includes(textOld)) { c = c.replace(textOld, textNew); console.log('8. Text'); }

// Fix 9: Answer timing
// In the _pick and BDI paths, add timing
const time1 = "this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'";
const time2 = "if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();\n    this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'";
if (c.includes(time1)) { c = c.replace(time1, time2); console.log('9a. Timing'); }

// Also add timing in BDI pick path
const bdiTime = "this._answers[this._currentQ] = score;";
const bdiTimeR = "this._answers[this._currentQ] = score;\n    if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();";
if (c.includes(bdiTime)) { c = c.replace(bdiTime, bdiTimeR); console.log('9b. BDI timing'); }

// Fix 10: Restore progress in _start
const startOld = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
const startNew = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    var sp = Store.get('psy_progress', {});\n    if (sp.key === cat + '_' + key && sp.answers && sp.currentQ > 0 && confirm('\u7ee7\u7eed\u4e0a\u6b21\u6d4b\u8bd5\uff1f')) {\n      this._currentQ = sp.currentQ; this._answers = sp.answers; this._renderQ('next'); return;\n    }\n    Store.remove('psy_progress');\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
if (c.includes(startOld)) { c = c.replace(startOld, startNew); console.log('10. Restore progress'); }

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('\\nAll done.');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

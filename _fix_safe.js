const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');
let count = 0;

function r(o, n) { if (c.includes(o)) { c = c.replace(o, n); count++; return true; } return false; }

// 1. Save progress in _pick
r("this._answers[this._currentQ] = optionIdx;\n    this._renderQ('next');",
  "this._answers[this._currentQ] = optionIdx;\n    try { Store.set('psy_progress', { key: this._currentCat + '_' + this._currentKey, answers: this._answers, currentQ: this._currentQ + 1 }); } catch(e) {}\n    this._renderQ('next');");

// 2. Timing in _pick
r("this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'",
  "if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();\n    this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'");

// 3. Timing in BDI
r("this._answers[this._currentQ] = score;",
  "if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();\n    this._answers[this._currentQ] = score;");

// 4. Clear progress on result
r("p.psyAssessments[this._currentKey] = {",
  "Store.remove('psy_progress');\n      p.psyAssessments[this._currentKey] = {");

// 5. Lie + fatigue
var lieTxt = "var consistencyIssues=0;var lieScore=0;[54,55,56,57,58,59].forEach(function(li){var la=this._answers[li];if(la!==undefined){var lv=li>=55?(la===0?1:la===4?0:la===1?0.5:0):(la===4?1:la===0?0:la===3?0.5:0);lieScore+=lv;}}.bind(this));if(lieScore>=4)consistencyIssues++;var fatigueFlag=0;if(this._answerTimes&&this._answerTimes.length>=80){var ht=this._answerTimes.slice(0,30).reduce(function(s,v){return s+v;},0)/30;var tt=this._answerTimes.slice(-30).reduce(function(s,v){return s+v;},0)/30;if(tt>0&&ht/tt>2.0){fatigueFlag=1;consistencyIssues++;}}";
r("var consistencyIssues = 0;", lieTxt);

// 6. Lie/fatigue text
r("if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');",
  "if(lieFlag)validityDetail.push('\u793e\u4f1a\u8d5e\u8bb8\u504f\u5dee');if(fatigueFlag)validityDetail.push('\u5c3e\u6bb5\u53ef\u80fd\u7b54\u9898\u75b2\u52b3');\n        if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');");

// 7. Restore progress in _start
var s1 = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
var s2 = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    var sp = Store.get('psy_progress', {});\n    if (sp.key === cat + '_' + key && sp.answers && sp.currentQ > 0 && confirm('\u7ee7\u7eed\u4e0a\u6b21\u6d4b\u8bd5\uff1f')) { this._currentQ = sp.currentQ; this._answers = sp.answers; this._renderQ('next'); return; }\n    Store.remove('psy_progress');\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
r(s1, s2);

// 8. Replace hardcoded dim cards with CSS classes
var dimOld = 'dimHtml += \'<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light)">\' +\n          \'<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-weight:600;font-size:14px">\' + d.name + \'</span>\' +\n          \'<span style="font-weight:600;color:\' + dc + \'">\' + dScore + \'/\' + dMax + \'</span></div>\' +\n          \'<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">\' + (d.desc || \'\') + \' · \' + (d.higher ? \'\u8d8a\u9ad8\u8d8a\u597d\' : \'\u8d8a\u4f4e\u8d8a\u597d\') + \'</div>\' +\n          \'<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">\' +\n          \'<div style="height:100%;width:\' + dpct + \'%;background:\' + dc + \';border-radius:2px"></div></div>\' +\n          \'<div style="font-size:12px;color:var(--text-soft)">\' + trait + \'</div>\' +';
var dimNew = 'dimHtml += \'<div class="psy-dim-card">\' +\n          \'<div class="psy-dim-header"><span class="psy-dim-name">\' + d.name + \'</span>\' +\n          \'<span class="psy-dim-score" style="color:\' + dc + \'">\' + dScore + \'/\' + dMax + \'</span></div>\' +\n          \'<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">\' + (d.desc || \'\') + \'</div>\' +\n          \'<div class="psy-dim-bar"><div class="psy-dim-bar-fill" style="width:\' + dpct + \'%;background:\' + dc + \'"></div></div>\' +\n          \'<div class="psy-dim-trait">\' + trait + \'</div>\' +';
r(dimOld, dimNew);

// 9. Facet bars
var fOld = 'return \'<div style="margin:3px 0">\' +\n              \'<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:var(--text-soft)">\' + f.name + \'</span><span style="color:\' + fc + \';font-weight:500">\' + fScore + \'/\' + fMax + \'</span></div>\' +\n              \'<div style="height:2px;background:var(--line);border-radius:2px;overflow:hidden"><div style="height:100%;width:\' + fpct + \'%;background:\' + fc + \';border-radius:2px"></div></div></div>\';';
var fNew = 'return \'<div class="psy-facet-row"><div class="psy-facet-header"><span class="psy-facet-name">\' + f.name + \'</span><span class="psy-facet-score" style="color:\' + fc + \'">\' + fScore + \'/\' + fMax + \'</span></div>\' +\n              \'<div class="psy-facet-bar"><div class="psy-facet-bar-fill" style="width:\' + fpct + \'%;background:\' + fc + \'"></div></div></div>\';';
r(fOld, fNew);

// 10. Guide cards
var gOld = 'return \'<div style="background:var(--card);border-radius:12px;margin-bottom:4px;border:1px solid var(--line-light);overflow:hidden">\' +\n              \'<div onclick="PsyAssessment._toggleGuide(\' + si + \')" style="display:flex;align-items:center;gap:6px;padding:10px 12px;cursor:pointer;user-select:none">\' +\n              \'<span style="flex:1;font-size:13px;font-weight:600">\' + sec.icon + \' \' + sec.title + \'</span>\' +\n              \'<span id="guide-arrow-\' + si + \'" style="font-size:10px;transition:transform 0.2s;color:var(--text-hint)">\u25be</span></div>\' +\n              \'<div id="guide-body-\' + si + \'" style="display:none;padding:0 12px 10px">\' + sec.content + \'</div></div>\';';
var gNew = 'return \'<div class="psy-guide-card"><div class="psy-guide-header" onclick="PsyAssessment._toggleGuide(\' + si + \')">\' +\n              \'<span class="psy-guide-title">\' + sec.icon + \' \' + sec.title + \'</span>\' +\n              \'<span class="psy-guide-arrow" id="guide-arrow-\' + si + \'">\u25be</span></div>\' +\n              \'<div class="psy-guide-body" id="guide-body-\' + si + \'">\' + sec.content + \'</div></div>\';';
r(gOld, gNew);

fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Applied ' + count + ' fixes');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

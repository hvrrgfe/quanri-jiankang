const fs = require('fs');
try {
  let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');
  let count = 0;

  // Fix 1: Save progress in _pick
  if (c.includes("this._answers[this._currentQ] = optionIdx;\n    this._renderQ('next');")) {
    c = c.replace("this._answers[this._currentQ] = optionIdx;\n    this._renderQ('next');",
      "this._answers[this._currentQ] = optionIdx;\n    try { Store.set('psy_progress', { key: this._currentCat + '_' + this._currentKey, answers: this._answers, currentQ: this._currentQ + 1 }); } catch(e) {}\n    this._renderQ('next');");
    count++;
  }

  // Fix 2: Restore progress in _start
  const s1 = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
  const s2 = "  _start(cat, key) {\n    this._currentCat = cat;\n    this._currentKey = key;\n    var sp = Store.get('psy_progress', {});\n    if (sp.key === cat + '_' + key && sp.answers && sp.currentQ > 0 && confirm('\u7ee7\u7eed\u4e0a\u6b21\u6d4b\u8bd5\uff1f')) {\n      this._currentQ = sp.currentQ; this._answers = sp.answers; this._renderQ('next'); return;\n    }\n    Store.remove('psy_progress');\n    this._currentQ = 0;\n    this._answers = {};\n    this._renderIntro();";
  if (c.includes(s1)) { c = c.replace(s1, s2); count++; }

  // Fix 3: Clear progress on result
  if (c.includes("p.psyAssessments[this._currentKey] = {")) {
    c = c.replace("p.psyAssessments[this._currentKey] = {", "Store.remove('psy_progress');\n      p.psyAssessments[this._currentKey] = {");
    count++;
  }

  // Fix 4: Lie scale + fatigue
  if (c.includes("var consistencyIssues = 0;")) {
    c = c.replace("var consistencyIssues = 0;",
      "var consistencyIssues = 0;\n        var lieScore = 0;\n        [54,55,56,57,58,59].forEach(function(li){var la=this._answers[li];if(la!==undefined){var lv=li>=55?(la===0?1:la===4?0:la===1?0.5:0):(la===4?1:la===0?0:la===3?0.5:0);lieScore+=lv;}}.bind(this));\n        if(lieScore>=4)consistencyIssues++;\n        var fatigueFlag=0;\n        if(this._answerTimes&&this._answerTimes.length>=80){var ht=this._answerTimes.slice(0,30).reduce(function(s,v){return s+v;},0)/30;var tt=this._answerTimes.slice(-30).reduce(function(s,v){return s+v;},0)/30;if(tt>0&&ht/tt>2.0){fatigueFlag=1;consistencyIssues++;}}");
    count++;
  }

  // Fix 5: lie/fatigue text
  const d1 = "if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');";
  const d2 = "if (tooFastFlag) validityDetail.push('\u7b54\u9898\u8fc7\u5feb\uff08' + elapsed + '\u5206\u949f\uff09');\n        if (lieFlag) validityDetail.push('\u53ef\u80fd\u5b58\u5728\u793e\u4f1a\u8d5e\u8bb8\u504f\u5dee');\n        if (fatigueFlag) validityDetail.push('\u5c3e\u6bb5\u7b54\u9898\u8fc7\u5feb\u00b7\u53ef\u80fd\u7b54\u9898\u75b2\u52b3');";
  if (c.includes(d1)) { c = c.replace(d1, d2); count++; }

  // Fix 6: _prev and _next already exist

  // Fix 7: Answer timing in _pick
  const t1 = "this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'";
  const t2 = "if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();\n    this._answers[this._currentQ] = optionIdx; try { Store.set('psy_progress'";
  if (c.includes(t1)) { c = c.replace(t1, t2); count++; }

  fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
  console.log('Applied ' + count + ' fixes');
} catch(e) { console.error(e.message); }

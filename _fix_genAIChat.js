const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find _startFromHistory and everything after it up to _startInformant_simple
const start = c.indexOf('  _startFromHistory(key) {');
const end = c.indexOf('  _startInformant_simple()');

if (start < 0 || end < 0) { console.log('ERROR: markers not found'); process.exit(1); }

const newCode = [
'  _startFromHistory(key) {',
'    for (var ck in AssessmentsDB) {',
'      if (AssessmentsDB[ck] && AssessmentsDB[ck][key]) {',
'        var p = Store.getProfile();',
'        var record = p && p.psyAssessments && p.psyAssessments[key];',
'        if (!record) { Helpers.toast(\'无记录: \' + key); return; }',
'        this._currentCat = ck;',
'        this._currentKey = key;',
"        if (key.indexOf('mbti') >= 0) { this._answers = record.rawAnswers || {}; this._showResult(); return; }",
'        this._answers = record.rawAnswers || {};',
'        this._showHistoricalResult(record); return;',
'      }',
'    }',
"    Helpers.toast('找不到该量表');",
'  },',
'',
'  _genAIChat() {',
"    var inp = document.getElementById('ai-chat-input');",
"    var msgs = document.getElementById('ai-chat-msgs');",
"    if (!inp || !msgs || !inp.value.trim()) return;",
"    var q = inp.value.trim(); inp.value = '';",
"    msgs.innerHTML += '<div style=\"text-align:right;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px\">' + q + '</span></div><div id=\"ai-chat-loading\" style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)\">...</span></div>';",
'    msgs.scrollTop = msgs.scrollHeight;',
'    var ctx = PsyAssessment._aiContext || {};',
'    var base = ctx.result ? JSON.stringify(ctx.result) : \'\';',
"    Helpers.callLLM('你是心理学专家。根据已有分析回答用户问题。', '用户问题:' + q, Store.getApiKey()).then(function(r) {",
"      var text = ''; if (typeof r === 'object' && r.text) text = r.text; else if (typeof r === 'object' && r.content) text = r.content; else if (typeof r === 'string') text = r; else text = JSON.stringify(r);",
"      var ld = document.getElementById('ai-chat-loading'); if (ld) ld.outerHTML = '<div style=\"text-align:left;margin-bottom:4px\"><span style=\"display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px\">' + text.substring(0,300) + '</span></div>';",
"      var m2 = document.getElementById('ai-chat-msgs'); if (m2) m2.scrollTop = m2.scrollHeight;",
'    }).catch(function() { var ld = document.getElementById(\'ai-chat-loading\'); if (ld) ld.outerHTML = \'<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)">失败</span></div>\'; });',
'  },',
].join('\n');

c = c.substring(0, start) + newCode + c.substring(end);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Fixed _startFromHistory and _genAIChat');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

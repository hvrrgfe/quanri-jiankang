const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find _genAIAnalysis and replace it
const start = c.indexOf('  _genAIAnalysis()');
const end = c.indexOf('  _getScale');

if (start < 0 || end < 0) { console.log('ERROR: method not found'); process.exit(1); }

const newAIAnalysis = `  _genAIAnalysis() {
    var scale = this._getScale();
    if (!scale) return;
    var isMbti = this._currentKey === 'mbti';
    var container = document.getElementById('ai-psy-analysis');
    if (!container) return;
    container.innerHTML = '<div style="font-size:13px;color:var(--text-hint)">AI \\u5206\\u6790\\u751f\\u6210\\u4e2d...</div>';
    if (isMbti) {
      var pp = Store.getProfile();
      var rec = pp && pp.psyAssessments && pp.psyAssessments['mbti'];
      var typeLabel = '', dimData = '', topFacets = '', normData = '';
      if (rec && rec.dims) {
        var dimLabels = ['\\u5916\\u5411\\u6027','\\u5f00\\u653e\\u6027','\\u7406\\u6027/\\u5b9c\\u4eba\\u6027','\\u5c3d\\u8d23\\u6027','\\u7a33\\u5b9a\\u6027'];
        dimData = rec.dims.map(function(d, i) { var pct = d.max > 0 ? Math.round(d.score / d.max * 100) : 0; return dimLabels[i] + ':' + d.score + '/' + d.max + '(' + pct + '%)'; }).join(', ');
        typeLabel = rec.level || '';
        var allF = [];
        if (scale.dims) { for (var fdi = 0; fdi < scale.dims.length; fdi++) { var fd = scale.dims[fdi]; if (fd.facets) { for (var ffi = 0; ffi < fd.facets.length; ffi++) { var ff = fd.facets[ffi]; var fs = 0, fm = ff.items.length * 5; for (var fii = 0; fii < ff.items.length; fii++) { var fans = this._answers[ff.items[fii]]; if (fans === undefined) continue; var fRev = ff.r && ff.r.indexOf(ff.items[fii]) >= 0; fs += fRev ? (5 - fans) : fans; } allF.push({ name: ff.name, score: fm > 0 ? Math.round(fs/fm*100) : 0 }); } } } }
        allF.sort(function(a,b) { return b.score - a.score; });
        topFacets = '\\u6700\\u5f3a\\u7279\\u8d28:' + allF.slice(0,3).map(function(f) { return f.name + '(' + f.score + '%)'; }).join(',') + '; \\u5f85\\u53d1\\u5c55:' + allF.slice(-3).reverse().map(function(f) { return f.name + '(' + f.score + '%)'; }).join(',');
        if (typeof ChineseNorms !== 'undefined') {
          var ageGroup = '26-35', gender = 'male';
          if (pp) { var a = pp.age || 30; ageGroup = a <= 25 ? '18-25' : a <= 35 ? '26-35' : a <= 45 ? '36-45' : '46-60'; gender = pp.gender === 'female' ? 'female' : 'male'; }
          normData = '; \\u4e2d\\u56fd\\u5e38\\u6a21\\u767e\\u5206\\u4f4d: ' + ['E','O','A','C','N'].map(function(k, i) { var d2 = rec.dims[i]; if (!d2 || !d2.max) return ''; var sc = Math.round(d2.score / d2.max * 100); return dimLabels[i] + '>' + ChineseNorms.percentile(sc, k, ageGroup, gender) + '%'; }).filter(Boolean).join(', ');
        }
      }
      var prompt = '\\u5927\\u4e94\\u4eba\\u683c(IPIP-NEO-300)\\u7c7b\\u578b:' + (typeLabel || '') + '\\n\\u7ef4\\u5ea6:' + dimData + '\\n' + topFacets + normData + '\\n\\n\\u8bf7\\u8f93\\u51fa:\\u3010\\u4eba\\u683c\\u753b\\u50cf\\u3011\\u3010\\u6838\\u5fc3\\u52a8\\u529b\\u3011\\u3010\\u6f5c\\u5728\\u76f2\\u533a\\u3011\\u3010\\u4eba\\u9645\\u6a21\\u5f0f\\u3011\\u3010\\u6210\\u957f\\u8def\\u5f84\\u3011\\u6bcf\\u6bb52-4\\u884c';
      Helpers.callLLM('\\u4f60\\u662f\\u4eba\\u683c\\u5fc3\\u7406\\u5b66\\u4e13\\u5bb6\\u3002\\u6839\\u636e\\u5927\\u4e94\\u4eba\\u683c\\u6570\\u636e\\u505a\\u4e13\\u4e1a\\u3001\\u7cbe\\u51c6\\u5206\\u6790\\u3002\\u57fa\\u4e8e\\u5177\\u4f53\\u6570\\u636e\\uff0c\\u4e0d\\u8981\\u7a7a\\u6cdb\\u3002', prompt, Store.getApiKey()).then(function(result) {
        var text = ''; if (typeof result === 'object' && Array.isArray(result)) text = result.join('\\n\\n'); else if (typeof result === 'object' && result.text) text = result.text; else if (typeof result === 'object' && result.content) text = result.content; else if (typeof result === 'string') text = result; else text = JSON.stringify(result);
        PsyAssessment._displayAI(text, container, prompt);
      }).catch(function() { var c2 = document.getElementById('ai-psy-analysis'); if (c2) c2.innerHTML = '<div style="font-size:13px;color:var(--red)">\\u5206\\u6790\\u5931\\u8d25</div>'; });
    } else {
      var scores = scale.scores || []; var revItems = scale.reverse || []; var totalScore = 0, maxScore = 0;
      for (var i = 0; i < scale.items.length; i++) { var ans = this._answers[i]; if (ans === undefined) continue; var score = revItems.indexOf(i) >= 0 ? scores[scores.length-1-ans] : scores[ans] || 0; totalScore += score; maxScore += scores[scores.length-1] || 0; }
      var answers = []; for (var i = 0; i < scale.items.length; i++) { var ans = this._answers[i]; if (ans === undefined) continue; var opt = scale.options ? scale.options[ans] : ('' + ans); answers.push('Q' + (i+1) + ':' + opt); }
      var prompt = '\\u91cf\\u8868:' + scale.name + '(' + scale.items.length + '\\u9898)\\u5f97\\u5206:' + totalScore + '/' + maxScore + '(' + Math.round(totalScore/maxScore*100) + '%) ' + '\\u56de\\u7b54:' + answers.join('|') + ' \\u8f93\\u51fa:\\u3010\\u603b\\u4f53\\u89e3\\u8bfb\\u3011\\u3010\\u7ef4\\u5ea6\\u5206\\u6790\\u3011\\u3010\\u5efa\\u8bae\\u3011';
      Helpers.callLLM('\\u4e34\\u5e8a\\u5fc3\\u7406\\u5b66\\u4e13\\u5bb6\\u3002\\u5206\\u6790\\u5fc3\\u7406\\u6d4b\\u8bc4\\u7ed3\\u679c\\uff0c\\u7528\\u3010\\u3011\\u6807\\u6ce8\\u6bb5\\u843d\\u3002', prompt, Store.getApiKey()).then(function(result) {
        var text = ''; if (typeof result === 'object' && Array.isArray(result)) text = result.join('\\n\\n'); else if (typeof result === 'object' && result.text) text = result.text; else if (typeof result === 'object' && result.content) text = result.content; else if (typeof result === 'string') text = result; else text = JSON.stringify(result);
        PsyAssessment._displayAI(text, container, prompt);
      }).catch(function() { var c2 = document.getElementById('ai-psy-analysis'); if (c2) c2.innerHTML = '<div style="font-size:13px;color:var(--red)">\\u5206\\u6790\\u5931\\u8d25</div>'; });
    }
  },

  _displayAI(text, container, contextPrompt) {
    if (!container) container = document.getElementById('ai-psy-analysis');
    if (!container) return;
    var t = text.replace(/\\u3010(.*?)\\u3011/g, '<strong>$1</strong>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>');
    container.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI \\u667a\\u80fd\\u5206\\u6790</div><div id="ai-text" style="font-size:13px;line-height:1.8">' + t + '</div><div id="ai-chat-area" style="margin-top:10px;border-top:1px solid var(--line-light);padding-top:8px"><div id="ai-chat-msgs" style="font-size:12px;line-height:1.6;margin-bottom:6px;max-height:200px;overflow-y:auto"></div><div style="display:flex;gap:4px"><input id="ai-chat-input" class="form-input" placeholder="\\u8ffd\\u95ee..." style="flex:1;font-size:12px;padding:6px 8px" onkeydown="if(event.key===\\'Enter\\')PsyAssessment._genAIChat()"><button class="btn btn-soft btn-sm" onclick="PsyAssessment._genAIChat()">\\u53d1\\u9001</button></div></div>';
    this._aiContext = { prompt: contextPrompt, result: text };
    try { var pp = Store.getProfile(); if (pp && pp.psyAssessments && pp.psyAssessments[PsyAssessment._currentKey]) { pp.psyAssessments[PsyAssessment._currentKey].aiAnalysis = text; Store.setProfile(pp); } } catch(e) {}
  },

  _genAIChat() {
    var input = document.getElementById('ai-chat-input'); var msgs = document.getElementById('ai-chat-msgs');
    if (!input || !msgs || !input.value.trim()) return;
    var q = input.value.trim(); input.value = '';
    msgs.innerHTML += '<div style="text-align:right;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px">' + q + '</span></div><div style="text-align:left;margin-bottom:4px" id="ai-chat-loading"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)">...</span></div>';
    msgs.scrollTop = msgs.scrollHeight;
    var ctx = this._aiContext || {};
    var base = '\\u57fa\\u4e8e\\u4ee5\\u4e0b\\u6570\\u636e\\u56de\\u7b54\\uff1a';
    if (ctx.prompt) base += '\\n' + ctx.prompt; if (ctx.result) base += '\\n' + ctx.result;
    Helpers.callLLM(base, '\\u95ee\\u9898:' + q, Store.getApiKey()).then(function(r) {
      var text = ''; if (typeof r === 'object' && r.text) text = r.text; else if (typeof r === 'object' && r.content) text = r.content; else if (typeof r === 'string') text = r; else text = JSON.stringify(r);
      var ld = document.getElementById('ai-chat-loading'); if (ld) ld.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px">' + text.substring(0,300) + '</span></div>';
      var m = document.getElementById('ai-chat-msgs'); if (m) m.scrollTop = m.scrollHeight;
    }).catch(function() { var ld = document.getElementById('ai-chat-loading'); if (ld) ld.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)">\\u5931\\u8d25</span></div>'; });
  },\n`;

c = c.substring(0, start) + newAIAnalysis + c.substring(end);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Replaced AI analysis + added chat');
require('child_process').execSync('node -c D:/three-meals-app/js/components/psyAssessment.js', {stdio:'inherit'});

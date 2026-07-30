const fs = require('fs');
let c = fs.readFileSync('D:/three-meals-app/js/components/psyAssessment.js', 'utf8');

// Find and replace the _genAIAnalysis and _displayAI methods
const marker1 = '  _genAIAnalysis() {';
const idx1 = c.indexOf(marker1);
const idx2 = c.indexOf('  _getScale', idx1); // Find next method

if (idx1 < 0 || idx2 < 0) { console.log('ERROR: could not find methods'); process.exit(1); }

const newCode = `  _genAIAnalysis() {
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
        dimData = rec.dims.map(function(d, i) {
          var pct = d.max > 0 ? Math.round(d.score / d.max * 100) : 0;
          return dimLabels[i] + ':' + d.score + '/' + d.max + '(' + pct + '%)';
        }).join(', ');
        typeLabel = rec.level || '';
        var allF = [];
        if (scale.dims) {
          for (var fdi = 0; fdi < scale.dims.length; fdi++) {
            var fd = scale.dims[fdi];
            if (fd.facets) {
              for (var ffi = 0; ffi < fd.facets.length; ffi++) {
                var ff = fd.facets[ffi];
                var fs = 0, fm = ff.items.length * 5;
                for (var fii = 0; fii < ff.items.length; fii++) {
                  var fans = this._answers[ff.items[fii]];
                  if (fans === undefined) continue;
                  var fRev = ff.r && ff.r.indexOf(ff.items[fii]) >= 0;
                  fs += fRev ? (5 - fans) : fans;
                }
                allF.push({ name: ff.name, score: fm > 0 ? Math.round(fs/fm*100) : 0 });
              }
            }
          }
        }
        allF.sort(function(a,b) { return b.score - a.score; });
        topFacets = '\\u6700\\u5f3a\\u7279\\u8d28:' + allF.slice(0,3).map(function(f) { return f.name + '(' + f.score + '%)'; }).join(', ') +
          '; \\u5f85\\u53d1\\u5c55:' + allF.slice(-3).reverse().map(function(f) { return f.name + '(' + f.score + '%)'; }).join(', ');
        if (typeof ChineseNorms !== 'undefined') {
          var ageGroup = '26-35', gender = 'male';
          if (pp) { var a = pp.age || 30; ageGroup = a <= 25 ? '18-25' : a <= 35 ? '26-35' : a <= 45 ? '36-45' : '46-60';
            gender = pp.gender === 'female' ? 'female' : 'male'; }
          var cnKeys = ['E','O','A','C','N'];
          normData = '; \\u4e2d\\u56fd\\u5e38\\u6a21\\u767e\\u5206\\u4f4d: ' + cnKeys.map(function(k, i) {
            var d2 = rec.dims[i];
            if (!d2 || !d2.max) return '';
            var sc = Math.round(d2.score / d2.max * 100);
            return dimLabels[i] + '>' + ChineseNorms.percentile(sc, k, ageGroup, gender) + '%';
          }).filter(Boolean).join(', ');
        }
      }
      var prompt = '\\u8fd9\\u662f\\u4e00\\u4e2a\\u5927\\u4e94\\u4eba\\u683c(IPIP-NEO-300)\\u6d4b\\u8bc4\\u7ed3\\u679c\\\\n\\u7c7b\\u578b:' + (typeLabel || '') +
        '\\\\n\\u7ef4\\u5ea6:' + dimData + '\\\\n' + topFacets + normData +
        '\\\\n\\\\n\\u8bf7\\u6309\\u4ee5\\u4e0b\\u7ed3\\u6784\\u8f93\\u51fa\\u5206\\u6790\\u62a5\\u544a\\uff08\\u7eaf\\u6587\\u672c\\uff0c\\u6bcf\\u6bb53-5\\u884c\\uff09:' +
        '\\\\n\\u3010\\u4eba\\u683c\\u753b\\u50cf\\u3011\\u57fa\\u4e8e\\u5927\\u4e94\\u7ef4\\u5ea6\\u548cfacets\\u7684\\u7efc\\u5408\\u63cf\\u8ff0' +
        '\\\\n\\u3010\\u6838\\u5fc3\\u52a8\\u529b\\u3011\\u9a71\\u52a8\\u8fd9\\u4e2a\\u4eba\\u884c\\u4e3a\\u548c\\u51b3\\u7b56\\u7684\\u6838\\u5fc3\\u5fc3\\u7406\\u9700\\u6c42' +
        '\\\\n\\u3010\\u6f5c\\u5728\\u76f2\\u533a\\u3011\\u6700\\u9700\\u8981\\u6ce8\\u610f\\u7684\\u6210\\u957f\\u70b9' +
        '\\\\n\\u3010\\u4eba\\u9645\\u6a21\\u5f0f\\u3011\\u5728\\u5173\\u7cfb\\u4e2d\\u7684\\u5178\\u578b\\u8868\\u73b0' +
        '\\\\n\\u3010\\u6210\\u957f\\u8def\\u5f84\\u3011\\u5177\\u4f53\\u7684\\u884c\\u52a8\\u5efa\\u8bae';
      Helpers.callLLM('\\u4f60\\u662f\\u4e00\\u4f4d\\u4eba\\u683c\\u5fc3\\u7406\\u5b66\\u4e13\\u5bb6\\u3002\\u6839\\u636e\\u5927\\u4e94\\u4eba\\u683c\\u6d4b\\u8bc4\\u6570\\u636e\\uff0c\\u5bf9\\u6765\\u8bbf\\u8005\\u8fdb\\u884c\\u4e13\\u4e1a\\u3001\\u7cbe\\u51c6\\u3001\\u6709\\u6e29\\u5ea6\\u7684\\u4eba\\u683c\\u5206\\u6790\\u3002\\u4e0d\\u8981\\u4f7f\\u7528\\u6a21\\u7cca\\u7a7a\\u6cdb\\u7684\\u63cf\\u8ff0\\uff0c\\u8981\\u57fa\\u4e8e\\u5177\\u4f53\\u6570\\u636e\\u3002', prompt, Store.getApiKey()).then(function(result) {
        var text = '';
        if (typeof result === 'object' && Array.isArray(result)) text = result.join('\\\\n\\\\n');
        else if (typeof result === 'object' && result.text) text = result.text;
        else if (typeof result === 'object' && result.content) text = result.content;
        else if (typeof result === 'string') text = result;
        else text = JSON.stringify(result);
        PsyAssessment._displayAI(text, container, prompt);
      }).catch(function() {
        var c2 = document.getElementById('ai-psy-analysis');
        if (c2) c2.innerHTML = '<div style="font-size:13px;color:var(--red)">\\u5206\\u6790\\u751f\\u6210\\u5931\\u8d25\\uff0c\\u8bf7\\u91cd\\u8bd5</div>';
      });
    } else {
      var scores = scale.scores || [];
      var revItems = scale.reverse || [];
      var totalScore = 0, maxScore = 0;
      for (var i = 0; i < scale.items.length; i++) {
        var ans = this._answers[i];
        if (ans === undefined) continue;
        var score = revItems.indexOf(i) >= 0 ? scores[scores.length-1-ans] : scores[ans] || 0;
        totalScore += score;
        maxScore += scores[scores.length-1] || 0;
      }
      var answers = [];
      for (var i = 0; i < scale.items.length; i++) {
        var ans = this._answers[i];
        if (ans === undefined) continue;
        var opt = scale.options ? scale.options[ans] : ('' + ans);
        answers.push('Q' + (i+1) + ':' + opt);
      }
      var prompt = '\\u91cf\\u8868:' + scale.name + '(' + scale.items.length + '\\u9898) \\u5f97\\u5206:' + totalScore + '/' + maxScore +
        '(' + Math.round(totalScore/maxScore*100) + '%) \\u6807\\u51c6:' + (scale.scoring || '') +
        ' \\u56de\\u7b54:' + answers.join('|') +
        ' \\u8bf7\\u6309\\u7ed3\\u6784\\u8f93\\u51fa:\\u3010\\u603b\\u4f53\\u89e3\\u8bfb\\u3011\\u3010\\u7ef4\\u5ea6\\u5206\\u6790\\u3011\\u3010\\u5efa\\u8bae\\u3011\\u3010\\u6ce8\\u610f\\u4e8b\\u9879\\u3011\\u7eaf\\u6587\\u672c\\u6bcf\\u6bb32-3\\u884c';
      Helpers.callLLM('\\u4f60\\u662f\\u4e00\\u4f4d\\u4e34\\u5e8a\\u5fc3\\u7406\\u5b66\\u4e13\\u5bb6\\u3002\\u5206\\u6790\\u5ba2\\u6237\\u7684\\u5fc3\\u7406\\u6d4b\\u8bc4\\u7ed3\\u679c\\uff0c\\u8f93\\u51fa\\u7b80\\u6d01\\u4e13\\u4e1a\\u7684\\u6587\\u5b57\\u62a5\\u544a\\u3002\\u4f7f\\u7528\\u3010\\u3011\\u6807\\u6ce8\\u6bb5\\u843d\\u6807\\u9898\\u3002', prompt, Store.getApiKey()).then(function(result) {
        var text = '';
        if (typeof result === 'object' && Array.isArray(result)) text = result.join('\\\\n\\\\n');
        else if (typeof result === 'object' && result.text) text = result.text;
        else if (typeof result === 'object' && result.content) text = result.content;
        else if (typeof result === 'string') text = result;
        else text = JSON.stringify(result);
        PsyAssessment._displayAI(text, container, prompt);
      }).catch(function() {
        var c2 = document.getElementById('ai-psy-analysis');
        if (c2) c2.innerHTML = '<div style="font-size:13px;color:var(--red)">\\u5206\\u6790\\u751f\\u6210\\u5931\\u8d25\\uff0c\\u8bf7\\u91cd\\u8bd5</div>';
      });
    }
  },

  _displayAI(text, container, contextPrompt) {
    if (!container) container = document.getElementById('ai-psy-analysis');
    if (!container) return;
    var displayText = text.replace(/\\u3010(.*?)\\u3011/g, '<strong>$1</strong>').replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/g, '<strong>$1</strong>').replace(/\\\\n/g, '<br>');
    container.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI \\u667a\\u80fd\\u5206\\u6790</div>' +
      '<div id="ai-text" style="font-size:13px;line-height:1.8">' + displayText + '</div>' +
      '<div id="ai-chat-area" style="margin-top:10px;border-top:1px solid var(--line-light);padding-top:8px">' +
      '<div id="ai-chat-msgs" style="font-size:12px;line-height:1.6;margin-bottom:6px;max-height:200px;overflow-y:auto"></div>' +
      '<div style="display:flex;gap:4px"><input id="ai-chat-input" class="form-input" placeholder="\\u8ffd\\u95ee\\u5173\\u4e8e\\u7ed3\\u679c\\u7684\\u95ee\\u9898..." style="flex:1;font-size:12px;padding:6px 8px" onkeydown="if(event.key===\\'Enter\\')PsyAssessment._genAIChat()">' +
      '<button class="btn btn-soft btn-sm" onclick="PsyAssessment._genAIChat()" style="padding:4px 10px">\\u53d1\\u9001</button></div></div>';
    this._aiContext = { prompt: contextPrompt, result: text };
    try {
      var pp = Store.getProfile();
      if (pp && pp.psyAssessments && pp.psyAssessments[PsyAssessment._currentKey]) {
        pp.psyAssessments[PsyAssessment._currentKey].aiAnalysis = text;
        Store.setProfile(pp);
      }
    } catch(e) {}
  },

  _genAIChat() {
    var input = document.getElementById('ai-chat-input');
    var msgs = document.getElementById('ai-chat-msgs');
    if (!input || !msgs || !input.value.trim()) return;
    var question = input.value.trim();
    input.value = '';
    msgs.innerHTML += '<div style="text-align:right;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px">' + question + '</span></div>';
    msgs.innerHTML += '<div style="text-align:left;margin-bottom:4px" id="ai-chat-loading"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)">\\u601d\\u8003\\u4e2d...</span></div>';
    msgs.scrollTop = msgs.scrollHeight;

    var ctx = this._aiContext || {};
    var base = '\\u4ee5\\u4e0b\\u662f\\u6b64\\u4eba\\u7684\\u5b8c\\u6574\\u4eba\\u683c\\u6d4b\\u8bc4\\u6570\\u636e\\u548c\\u5206\\u6790\\u62a5\\u544a\\u3002\\u8bf7\\u57fa\\u4e8e\\u8fd9\\u4e9b\\u6570\\u636e\\u56de\\u7b54\\u7528\\u6237\\u95ee\\u9898\\uff0c\\u4e0d\\u8981\\u7f16\\u9020\\u4e0d\\u5b58\\u5728\\u7684\\u6d4b\\u8bd5\\u7ed3\\u679c\\u3002';
    if (ctx.prompt) base += '\\n\\n\\u539f\\u59cb\\u6d4b\\u8bc4\\u6570\\u636e:\\n' + ctx.prompt;
    if (ctx.result) base += '\\n\\n\\u5df2\\u6709\\u5206\\u6790\\u62a5\\u544a:\\n' + ctx.result;

    Helpers.callLLM(base, '\\u7528\\u6237\\u95ee\\u9898:' + question + '\\n\\n\\u8bf7\\u9488\\u5bf9\\u95ee\\u9898\\u7ed9\\u51fa\\u7b80\\u6d01\\u6709\\u7528\\u7684\\u56de\\u7b54\\uff08100\\u5b57\\u4ee5\\u5185\\uff09\\u3002', Store.getApiKey()).then(function(result) {
      var text = '';
      if (typeof result === 'object' && result.text) text = result.text;
      else if (typeof result === 'object' && result.content) text = result.content;
      else if (typeof result === 'string') text = result;
      else if (typeof result === 'object') text = JSON.stringify(result);
      var loading = document.getElementById('ai-chat-loading');
      if (loading) loading.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px">' + text.substring(0, 300) + '</span></div>';
      var m = document.getElementById('ai-chat-msgs');
      if (m) m.scrollTop = m.scrollHeight;
    }).catch(function() {
      var loading = document.getElementById('ai-chat-loading');
      if (loading) loading.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)">\\u56de\\u590d\\u751f\\u6210\\u5931\\u8d25</span></div>';
    });
  },\n\n`;

c = c.substring(0, idx1) + newCode + c.substring(idx2);
fs.writeFileSync('D:/three-meals-app/js/components/psyAssessment.js', c, 'utf8');
console.log('Replaced AI analysis methods');

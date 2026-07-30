// ===== 心理自测（全球公认量表库 60+套）=====

const PsyAssessment = {
  _currentKey: null,
  _currentCat: null,
  _currentQ: 0,
  _answers: {},

  _filter: '',
  _filterCategory: '',

  show() {
    this._filter = '';
    this._filterCategory = '';
    this._renderList();
  },

  _renderList() {
    var el = document.getElementById('main-content');
    var history = this._getHistory();
    var showHistory = this._showHistory !== false;
    var cats = [
      { key: '', label: '全部' },
      { key: 'mood', label: '情绪与临床' },
      { key: 'clinical', label: '强迫/ADHD' },
      { key: 'personality', label: '人格' },
      { key: 'self', label: '自尊与自我' },
      { key: 'resilience', label: '心理弹性' },
      { key: 'sleep', label: '睡眠' },
      { key: 'stress', label: '压力与支持' },
      { key: 'emotion', label: '情绪调节' },
      { key: 'positive', label: '积极心理' },
      { key: 'clinical2', label: '临床专项2' },
      { key: 'addiction', label: '成瘾行为' },
      { key: 'social', label: '人际信任' },
      { key: 'child', label: '儿童青少年' },
      { key: 'work', label: '职业' },
      { key: 'mindfulness', label: '正念' },
      { key: 'relation', label: '人际关系' },
    ];
    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:4px">心理自测</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px">全球公认标准化量表 · 结果仅供参考</div>

  ${history.length ? '<div style="background:var(--card);border-radius:14px;margin-bottom:10px;border:1px solid var(--line-light);overflow:hidden">' +
    '<div onclick="PsyAssessment._toggleHistory()" style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;cursor:pointer">' +
    '<span style="font-size:12px;font-weight:600;color:var(--text-hint)">历史记录（' + history.length + '）</span>' +
    '<span style="font-size:11px;color:var(--text-hint);transition:transform 0.2s;transform:' + (showHistory ? 'rotate(0)' : 'rotate(-90deg)') + '">&#9660;</span></div>' +
    (showHistory ? '<div style="padding:0 10px 6px">' +
    history.slice(0,10).map(function(h) {
      return '<div onclick="PsyAssessment._startFromHistory(\'' + h.key + '\')" style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:4px 6px;margin-bottom:1px;border-radius:6px;cursor:pointer;background:var(--bg)">' +
        '<span>' + h.name + '</span><span><span style="color:var(--brand);font-weight:500">' + h.score + '分</span><span onclick="event.stopPropagation();PsyAssessment._deleteRecord(\'' + h.key + '\')" style="margin-left:6px;cursor:pointer;color:var(--text-hint);font-size:14px">&times;</span></span></div>';
    }).join('') +
    '</div>' : '') +
  '</div>' : ''}

  <input id="psy-search" class="form-input" type="text" placeholder="搜索量表名称..." value="${this._filter}" oninput="PsyAssessment._doFilter(this.value)" style="margin-bottom:8px;font-size:13px;padding:8px 10px;border-radius:10px">

  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
    ${cats.map(function(c) {
      var isSel = this._filterCategory === c.key;
      return '<span onclick="PsyAssessment._setFilter(\'' + c.key + '\')" style="padding:3px 10px;font-size:11px;border-radius:12px;cursor:pointer;background:' + (isSel ? 'var(--brand)' : 'var(--card)') + ';color:' + (isSel ? 'white' : 'var(--text-soft)') + ';border:1px solid ' + (isSel ? 'var(--brand)' : 'var(--line-light)') + '">' + c.label + '</span>';
    }.bind(this)).join('')}
  </div>

  <div id="psy-result">${this._allScales()}</div>
  <div style="display:flex;gap:4px;margin-top:10px;justify-content:center">
    <button class="btn btn-soft btn-sm" onclick="PsyAssessment._exportData()">📤 导出测评数据</button>
    <button class="btn btn-soft btn-sm" onclick="document.getElementById('psy-import-input').click()">📥 导入测评数据</button>
    <input type="file" id="psy-import-input" accept=".json" style="display:none" onchange="PsyAssessment._importData(event)">
  </div>
</div>`;
    // 焦点到搜索框
    setTimeout(function() { var inp = document.getElementById('psy-search'); if (inp) inp.focus(); }, 100);
  },

  _toggleHistory() {
    this._showHistory = this._showHistory === false ? true : false;
    this._renderList();
  },

  _startFromHistory(key) {
    for (var ck in AssessmentsDB) {
      if (AssessmentsDB[ck] && AssessmentsDB[ck][key]) {
        var p = Store.getProfile();
        var record = p && p.psyAssessments && p.psyAssessments[key];
        if (!record) { Helpers.toast('\u65e0\u8bb0\u5f55: ' + key); return; }
        this._currentCat = ck;
        this._currentKey = key;
        if (key.indexOf('mbti') >= 0) { this._answers = record.rawAnswers || {
  _genAIChat() {
    var inp = document.getElementById('ai-chat-input');
    var msgs = document.getElementById('ai-chat-msgs');
    if (!inp || !msgs || !inp.value.trim()) return;
    var q = inp.value.trim(); inp.value = '';
    msgs.innerHTML += '<div style="text-align:right;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--brand-bg);border-radius:10px 10px 2px 10px;font-size:12px">' + q + '</span></div><div id="ai-chat-loading" style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--text-hint)">...</span></div>';
    msgs.scrollTop = msgs.scrollHeight;
    var ctx = PsyAssessment._aiContext || {};
    var base = ctx.result ? '\u57fa\u4e8e\u4ee5\u4e0b\u5206\u6790\u56de\u7b54\uff1a' + ctx.result : '';
    Helpers.callLLM('\u4f60\u662f\u5fc3\u7406\u5b66\u4e13\u5bb6\u3002\u6839\u636e\u5df2\u6709\u5206\u6790\u56de\u7b54\u7528\u6237\u95ee\u9898\u3002', '\u7528\u6237\u95ee\u9898:' + q, Store.getApiKey()).then(function(r) {
      var text = '';
      if (typeof r === 'object' && r.text) text = r.text;
      else if (typeof r === 'object' && r.content) text = r.content;
      else if (typeof r === 'string') text = r;
      else text = JSON.stringify(r);
      var ld = document.getElementById('ai-chat-loading');
      if (ld) ld.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px">' + text.substring(0, 300) + '</span></div>';
      var m = document.getElementById('ai-chat-msgs');
      if (m) m.scrollTop = m.scrollHeight;
    }).catch(function() {
      var ld = document.getElementById('ai-chat-loading');
      if (ld) ld.outerHTML = '<div style="text-align:left;margin-bottom:4px"><span style="display:inline-block;padding:4px 10px;background:var(--card);border-radius:10px 10px 10px 2px;font-size:12px;color:var(--red)">\u5931\u8d25</span></div>';
    });
  },
};
 this._showResult(); return; }
        this._answers = record.rawAnswers || {};
        this._showHistoricalResult(record); return;
      }
    }
    Helpers.toast('\u627e\u4e0d\u5230\u91cf\u8868: ' + key);
  },

  _startInformant_simple() {
    var pp = Store.getProfile();
    var code = Math.random().toString(36).substring(2, 8).toUpperCase();
    var formHtml = '<div style="text-align:left">' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">他评表单</div>' +
      '<div style="font-size:12px;color:var(--text-soft);margin-bottom:8px">请把下面的内容发给朋友，让他们对你进行评价。</div>' +
      '<textarea style="width:100%;height:180px;font-size:12px;border:1px solid var(--line);border-radius:6px;padding:8px;font-family:monospace" readonly>' +
      '他评代码: ' + code + '\n\n请对该人的以下特质进行评价（1=非常不同意，5=非常同意）\n\n1. 容易与人交往、开朗外向\n2. 想象力丰富、喜欢新事物\n3. 做事考虑别人感受\n4. 有条理、认真负责\n5. 情绪稳定、不容易紧张</textarea>' +
      '<button class="btn btn-primary btn-sm btn-block" style="margin-top:8px" onclick="var ta=this.parentElement.querySelector(\'textarea\');ta.select();document.execCommand(\'copy\');Helpers.toast(\'Copied\')">复制他评表单</button>' +
      '<div style="margin-top:8px;padding:8px;background:var(--brand-bg);border-radius:8px;font-size:12px">提示: 让他人完成评价后，输入他们的得分进行对比。</div>' +
      '<button class="btn btn-soft btn-sm btn-block" style="margin-top:6px" onclick="PsyAssessment._receiveInformant(\'' + code + '\')">已收到他评结果</button></div>';
    Helpers.openModal(formHtml);
  },

  _receiveInformant(code) {
    Helpers.openModal('<div style="font-size:16px;font-weight:600;margin-bottom:8px">输入他评得分</div>' +
      '<div style="font-size:12px;color:var(--text-soft);margin-bottom:8px">请输入他人对你的评价得分（1-5）</div>' +
      '<div style="margin-bottom:4px;font-size:12px">外向性:</div><input type="number" id="inf-e" class="form-input" min="1" max="5" value="3" style="margin-bottom:4px">' +
      '<div style="margin-bottom:4px;font-size:12px">开放性:</div><input type="number" id="inf-o" class="form-input" min="1" max="5" value="3" style="margin-bottom:4px">' +
      '<div style="margin-bottom:4px;font-size:12px">宜人性:</div><input type="number" id="inf-a" class="form-input" min="1" max="5" value="3" style="margin-bottom:4px">' +
      '<div style="margin-bottom:4px;font-size:12px">尽责性:</div><input type="number" id="inf-c" class="form-input" min="1" max="5" value="3" style="margin-bottom:4px">' +
      '<div style="margin-bottom:4px;font-size:12px">情绪稳定性:</div><input type="number" id="inf-n" class="form-input" min="1" max="5" value="3" style="margin-bottom:8px">' +
      '<button class="btn btn-primary btn-sm btn-block" onclick="PsyAssessment._saveInformant(\'' + code + '\')">保存他评</button>');
  },

  _saveInformant(code) {
    var scores = { E: parseInt(document.getElementById('inf-e')?.value || '3') * 20, O: parseInt(document.getElementById('inf-o')?.value || '3') * 20, A: parseInt(document.getElementById('inf-a')?.value || '3') * 20, C: parseInt(document.getElementById('inf-c')?.value || '3') * 20, N: parseInt(document.getElementById('inf-n')?.value || '3') * 20 };
    var pp = Store.getProfile();
    if (!pp) return;
    if (!pp.psyAssessments) pp.psyAssessments = {};
    if (!pp.psyAssessments['mbti_informants']) pp.psyAssessments['mbti_informants'] = [];
    pp.psyAssessments['mbti_informants'].push({ code: code, label: '他评 #' + (pp.psyAssessments['mbti_informants'].length + 1), date: Helpers.formatDate(new Date(), 'YYYY-MM-DD'), scores: scores });
    Store.setProfile(pp);
    Helpers.closeModal();
    Helpers.toast('他评已保存');
  },

  _showInformantCompare() {
    var pp = Store.getProfile();
    if (!pp || !pp.psyAssessments) return;
    var informants = pp.psyAssessments['mbti_informants'] || [];
    var selfRec = pp.psyAssessments['mbti'];
    if (!informants.length || !selfRec || !selfRec.dims) { Helpers.toast('没有他评数据'); return; }
    var html = '<div style="font-size:16px;font-weight:600;margin-bottom:8px">自评 vs 他评</div>';
    var labels = ['外向性','开放性','理性','尽责性','稳定性'];
    var selfVals = selfRec.dims.map(function(d) { return d.max > 0 ? Math.round(d.score / d.max * 100) : 50; });
    var avgInf = [0,0,0,0,0];
    informants.forEach(function(inf) { ['E','O','A','C','N'].forEach(function(k, i) { if (inf.scores && inf.scores[k]) avgInf[i] += inf.scores[k]; }); });
    avgInf = avgInf.map(function(v) { return Math.round(v / (informants.length || 1)); });
    html += '<div style="margin-bottom:8px">';
    labels.forEach(function(l, i) {
      var sv = selfVals[i], iv = avgInf[i];
      html += '<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:11px"><span>' + l + '</span><span style="color:' + (Math.abs(sv-iv) > 10 ? 'var(--warn)' : 'var(--text-hint)') + '">差异 ' + (sv > iv ? '+' : '') + (sv-iv) + '</span></div>' +
        '<div style="display:flex;gap:2px;height:10px"><div style="height:100%;width:' + sv + '%;background:var(--purple);border-radius:2px 0 0 2px;opacity:0.8"></div><div style="height:100%;width:' + iv + '%;background:var(--brand);border-radius:0 2px 2px 0;opacity:0.6"></div></div>' +
        '<div style="font-size:9px;color:var(--text-hint);display:flex;justify-content:space-between"><span>自评 ' + sv + '%</span><span>他评 ' + iv + '%</span></div></div>';
    });
    html += '</div><div style="font-size:11px;color:var(--text-hint);text-align:center">基于 ' + informants.length + ' 人他评</div>' +
      '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>';
    Helpers.openModal(html);
  },

  _showHistoricalResult(record) {
    var scale = this._getScale();
    if (!scale) return;
    var totalScore = record.score;
    var maxScore = record.max || 0;
    var pct = record.pct >= 0 ? record.pct : 0;
    var levelText = record.level || '';
    var color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--brand)' : 'var(--warn)';
    var el = document.getElementById('main-content');

    // 维度分析
    var dimHtml = '';
    if (record.dims && record.dims.length) {
      dimHtml = '<div style="font-size:14px;font-weight:600;margin-bottom:8px;margin-top:12px">维度分析</div>';
      for (var di = 0; di < record.dims.length; di++) {
        var d = record.dims[di];
        var dpct = d.max > 0 ? Math.round(d.score / d.max * 100) : 0;
        var dc = dpct >= 60 ? 'var(--green)' : dpct >= 40 ? 'var(--brand)' : 'var(--warn)';
        dimHtml += '<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light)">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-weight:600;font-size:14px">' + d.name + '</span>' +
          '<span style="font-weight:600;color:' + dc + '">' + d.score + '/' + d.max + '</span></div>' +
          '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="height:100%;width:' + dpct + '%;background:' + dc + ';border-radius:2px"></div></div></div>';
      }
    }

    // 常模对比
    var normHtml = '';
    if (record.norm) {
      var n = record.norm;
      var ndiff = totalScore - n.avg;
      var nz = n.sd > 0 ? ((totalScore - n.avg) / n.sd).toFixed(2) : 0;
      var nzl = Math.abs(nz) < 0.5 ? '正常' : Math.abs(nz) < 1.0 ? '轻微' : Math.abs(nz) < 1.5 ? '明显' : '显著';
      normHtml = '<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid var(--line-light)">' +
        '<div style="font-size:14px;font-weight:600;margin-bottom:6px">常模对比 · Z=' + nz + '(' + nzl + ')</div>' +
        '<div style="font-size:12px;color:var(--text-soft)">你的得分' + totalScore + ' vs 常模' + n.avg + '±' + n.sd + '</div></div>';
    }

    // AI分析（保存的+可生成）
    var aiHtml = '';
    if (record.aiAnalysis) {
      var aiText = record.aiAnalysis.replace(/\n/g, '<br>');
      aiText = aiText.replace(/【(.*?)】/g, '<strong>$1</strong>');
      aiHtml = '<div style="background:var(--brand-bg);border-radius:14px;padding:14px;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI 智能分析</div>' +
        '<div style="font-size:13px;line-height:1.8">' + aiText + '</div></div>';
    }
    if (Store.getApiKey()) {
      aiHtml += '<div id="ai-psy-analysis" style="margin-bottom:10px"></div>' +
        '<button class="btn btn-soft btn-sm btn-block" onclick="PsyAssessment._genAIAnalysis()" style="margin-bottom:10px">AI 智能分析</button>';
    }

    el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:12px;color:var(--text-hint);margin-bottom:4px">历史测评 · ${record.date || ''}</div>
  <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
  <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:2px">${totalScore}</div>
  <div style="font-size:16px;font-weight:600;color:${color};margin-bottom:2px">${pct}%</div>
  ${levelText ? '<div style="font-size:15px;font-weight:500;color:var(--text);margin-bottom:8px">' + levelText + '</div>' : ''}
  <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
  </div>
  <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">得分 ${totalScore}/${maxScore}</div>
</div>
${normHtml}
${dimHtml}
${aiHtml}
<div style="display:flex;gap:6px;margin-top:8px">
  <button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment._start('${this._currentCat}','${this._currentKey}')">重新测评</button>
  <button class="btn btn-outline btn-sm flex-1" onclick="PsyAssessment.show()">返回列表</button>
</div>`;
  },

  _getHistory() {
    var p = Store.getProfile();
    if (!p || !p.psyAssessments) return [];
    var now = [];
    Object.keys(p.psyAssessments).forEach(function(k) {
      if (k.endsWith('_history') || k.endsWith('_informants')) return;
      var entry = p.psyAssessments[k];
      var scale = null;
      for (var catKey in AssessmentsDB) {
        if (AssessmentsDB[catKey] && AssessmentsDB[catKey][k]) { scale = AssessmentsDB[catKey][k]; break; }
      }
      if (!scale) return; // Skip entries with no matching scale
      now.push({ key: k, name: scale.name, score: entry.score, date: entry.date || '' });
    });
    now.sort(function(a, b) { return b.date.localeCompare(a.date); });
    return now;
  },

  _genAIAnalysis() {
    var scale = this._getScale();
    if (!scale) return;
    var container = document.getElementById('ai-psy-analysis');
    if (!container) return;
    container.innerHTML = '<div style="font-size:13px;color:var(--text-hint)">AI 分析生成中...</div>';

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
    var prompt = '量表:' + scale.name + '(' + scale.items.length + '题) 得分:' + totalScore + '/' + maxScore +
      '(' + Math.round(totalScore/maxScore*100) + '%) 标准:' + (scale.scoring || '') +
      ' 回答:' + answers.join('|') +
      ' 请按结构输出:【总体解读】【维度分析】【建议】【注意事项】纯文本每段2-3行';

    Helpers.callLLM('你是一位临床心理学专家。分析客户的心理测评结果，输出简洁专业的文字报告。使用【】标注段落标题。', prompt, Store.getApiKey()).then(function(result) {
      var text = '';
      if (typeof result === 'object' && Array.isArray(result)) {
        text = result.join('\n\n');
      } else if (typeof result === 'object' && result.text) text = result.text;
      else if (typeof result === 'object' && result.content) text = result.content;
      else if (typeof result === 'string') text = result;
      else text = JSON.stringify(result);
      var c = document.getElementById('ai-psy-analysis');
      if (c) {
        // 简单转换：【标题】→ <strong>，**粗体**→ <strong>，\n→ <br>
        var displayText = text.replace(/【(.*?)】/g, '<strong>$1</strong>');
        displayText = displayText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        displayText = displayText.replace(/\n/g, '<br>');
        c.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI 智能分析</div>' +
          '<div style="font-size:13px;line-height:1.8">' + displayText + '</div>';
        // 保存AI分析到档案
        try {
          var pp = Store.getProfile();
          if (pp && pp.psyAssessments && pp.psyAssessments[PsyAssessment._currentKey]) {
            pp.psyAssessments[PsyAssessment._currentKey].aiAnalysis = text;
            Store.setProfile(pp);
          }
        } catch(e) {}
      }
    }).catch(function() {
      var c = document.getElementById('ai-psy-analysis');
      if (c) c.innerHTML = '<div style="font-size:13px;color:var(--red)">分析生成失败，请重试</div>';
    });
  },

  _deleteRecord(key) {
    var p = Store.getProfile();
    if (!p || !p.psyAssessments || !p.psyAssessments[key]) return;
    if (!confirm('确定删除这条测评记录吗？')) return;
    delete p.psyAssessments[key];
    Store.setProfile(p);
    this._renderList();
    Helpers.toast('已删除');
  },

  _doFilter(val) {
    this._filter = val;
    this._renderList();
  },

  _setFilter(key) {
    this._filterCategory = key;
    this._renderList();
  },

  // ---- 搜索+分类筛选 ----
  _allScales() {
    var cats = [
      { key: 'mood', label: '情绪与临床' },
      { key: 'clinical', label: '强迫/ADHD' },
      { key: 'personality', label: '人格' },
      { key: 'self', label: '自尊与自我' },
      { key: 'resilience', label: '心理弹性' },
      { key: 'sleep', label: '睡眠' },
      { key: 'stress', label: '压力与支持' },
      { key: 'emotion', label: '情绪调节' },
      { key: 'positive', label: '积极心理' },
      { key: 'clinical2', label: '临床专项2' },
      { key: 'addiction', label: '成瘾行为' },
      { key: 'social', label: '人际信任' },
      { key: 'child', label: '儿童青少年' },
      { key: 'work', label: '职业' },
      { key: 'mindfulness', label: '正念' },
      { key: 'relation', label: '人际关系' },
    ];
    var filterLower = this._filter.toLowerCase();
    var html = '';
    var foundAny = false;

    for (var ci = 0; ci < cats.length; ci++) {
      var cat = cats[ci];
      if (this._filterCategory && this._filterCategory !== cat.key) continue;
      var scales = AssessmentsDB[cat.key];
      if (!scales) continue;
      var keys = Object.keys(scales);
      if (!keys.length) continue;

      var catHtml = '';
      for (var si = 0; si < keys.length; si++) {
        var key = keys[si];
        var s = scales[key];
        // 搜索过滤
        if (filterLower && s.name.toLowerCase().indexOf(filterLower) < 0) continue;
        foundAny = true;
        catHtml += '<div onclick="PsyAssessment._start(\'' + cat.key + '\',\'' + key + '\')" style="background:var(--card);border-radius:14px;padding:12px;margin-bottom:4px;border:1px solid var(--line-light);cursor:pointer">' +
          '<div style="font-size:14px;font-weight:500">' + s.name + '</div>' +
          '<div style="font-size:11px;color:var(--text-soft);margin-top:2px">' + (s.items ? s.items.length : '?') + '题 · ' + (s.time||'?') + '分钟 · ' + (s.ref||'') + '</div>' +
          (s.scoring ? '<div style="font-size:11px;color:var(--text-hint);margin-top:1px">' + s.scoring.split('。')[0] + '</div>' : '') +
        '</div>';
      }
      if (catHtml) {
        html += '<div style="font-size:13px;font-weight:600;color:var(--text-hint);margin:12px 0 6px 2px;letter-spacing:0.5px">' + cat.label + '</div>' + catHtml;
      }
    }
    if (!foundAny) {
      html += '<div style="text-align:center;padding:40px;color:var(--text-soft);font-size:14px">未找到匹配的量表</div>';
    }
    return html;
  },

  _start(cat, key) {
    this._currentCat = cat;
    this._currentKey = key;
    this._currentQ = 0;
    this._answers = {};
    this._renderIntro();
  },

  _renderIntro() {
    var scale = this._getScale();
    if (!scale) return;
    var el = document.getElementById('main-content');
    var total = scale.items ? scale.items.length : 0;
    el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:20px;font-weight:700;margin-bottom:4px">${scale.name}</div>
  ${scale.ref ? '<div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">' + scale.ref + '</div>' : ''}

  <div style="display:flex;justify-content:center;gap:12px;margin-bottom:16px">
    <div style="background:var(--card);border-radius:12px;padding:10px 16px;text-align:center">
      <div style="font-size:24px;font-weight:700;color:var(--brand)">${total}</div>
      <div style="font-size:11px;color:var(--text-soft)">题目数量</div>
    </div>
    <div style="background:var(--card);border-radius:12px;padding:10px 16px;text-align:center">
      <div style="font-size:24px;font-weight:700;color:var(--brand)">${scale.time || '?'}</div>
      <div style="font-size:11px;color:var(--text-soft)">分钟</div>
    </div>
    <div style="background:var(--card);border-radius:12px;padding:10px 16px;text-align:center">
      <div style="font-size:14px;font-weight:700;color:var(--brand)">${scale.timeFrame || '现在'}</div>
      <div style="font-size:11px;color:var(--text-soft)">评估周期</div>
    </div>
  </div>

  ${this._currentKey === 'mbti' || this._currentKey === 'mbti_60' ? `
  <div style="background:var(--card);border:1px solid var(--line-light);border-radius:14px;padding:14px;margin-bottom:16px;text-align:left;font-size:13px;line-height:1.7">
    <div style="font-weight:600;margin-bottom:6px">关于本测评</div>
    <div style="margin-bottom:6px">本测试基于<strong>大五人格（Big Five/OCEAN）</strong>框架，题目改编自<strong>IPIP-NEO国际人格项目池</strong>（Goldberg, 1999; Johnson, 2014），这是心理学界使用最广泛的开源人格题库。</div>
    <div style="margin-bottom:8px;font-size:12px;background:var(--brand-bg);border-radius:8px;padding:8px;line-height:1.8">
      <strong>五维度与大五人格的对应：</strong><br>
      Mind 外向/内向 ← 外向性 Extraversion<br>
      Energy 直觉/实感 ← 开放性 Openness<br>
      Nature 理性/情感 ← 宜人性 Agreeableness（反向）<br>
      Tactics 判断/感知 ← 尽责性 Conscientiousness<br>
      Identity 坚定/波动 ← 神经质 Neuroticism（反向）
    </div>
    <div style="font-size:12px">跨文化效度基于50国71,912人常模（McCrae & Terracciano, 2005）。大五人格重测信度0.75-0.90，各维度α>0.85。采用<strong>IPIP-NEO-300完整版</strong>（Johnson, 2014; Goldberg, 1999），每维度60题覆盖6个facets各10题（5正+5反共300题），各维度Cronbach's α>0.87。</div>
    <div style="font-size:12px;color:var(--text-hint);margin-top:4px">-A坚定型(低神经质/情绪稳定) / -T波动型(高神经质/敏感自省)。每个维度下方展示6个facet细分分数。</div>
  </div>` : ''}

  <div style="background:var(--brand-bg);border-radius:14px;padding:14px;margin-bottom:16px;text-align:left;font-size:13px;line-height:1.7">
    <div style="font-weight:600;margin-bottom:6px">测试说明</div>
    <div>请根据${scale.timeFrame || '实际情况'}的真实感受，选择最符合您的选项。</div>
    <div style="margin-top:4px">每题只能选择一个答案，请勿遗漏。结果仅供自我参考，不能替代专业诊断。</div>
    ${scale.scoring ? '<div style="margin-top:6px;color:var(--text-hint);font-size:12px">计分方式：' + scale.scoring.split('。')[0] + '</div>' : ''}
  </div>

  <button class="btn btn-primary btn-lg btn-block" onclick="PsyAssessment._beginTest()">开始测试</button>
  <button class="btn btn-outline btn-sm btn-block" style="margin-top:6px" onclick="PsyAssessment.show()">返回列表</button>
</div>`;
  },

  _beginTest() {
    this._currentQ = 0;
    this._answers = {};
    this._testStart = Date.now();
    this._renderQ('next');
  },

  _getScale() {
    return AssessmentsDB[this._currentCat] && AssessmentsDB[this._currentCat][this._currentKey];
  },

  _renderQ(direction) {
    var scale = this._getScale();
    if (!scale) return;
    if (this._currentQ >= scale.items.length) { this._showResult(); return; }

    var qText = scale.items[this._currentQ];
    var opts = scale.options;
    var total = scale.items.length;
    var progress = Math.round((this._currentQ + 1) / total * 100);
    var el = document.getElementById('main-content');

    // Current dimension name (for MBTI 120+)
    var dimName = '';
    var qIdx = this._currentQ;
    var dimNames = ['外向性','开放性','理性/宜人性','尽责性','稳定性'];
    var dimRanges = scale.items && scale.items.length >= 100 ? [[0,59],[60,119],[120,179],[180,239],[240,299]] : [[0,11],[12,23],[24,35],[36,47],[48,59]];
    if (scale.items && scale.items.length >= 40) {
      for (var di = 0; di < dimRanges.length; di++) {
        if (qIdx >= dimRanges[di][0] && qIdx <= dimRanges[di][1]) { dimName = dimNames[di]; break; }
      }
    }

    // Handle BDI format
    if (scale.bdi) {
      el.innerHTML = this._renderBDIQ(scale, qText, total, progress);
      this._applySlideIn(direction);
      return;
    }

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    <span style="font-size:13px;font-weight:500;color:var(--brand)">${scale.name}</span>
    ${dimName ? '<span style="font-size:11px;padding:1px 8px;border-radius:8px;background:var(--brand-bg)">' + dimName + '</span>' : ''}
    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${this._currentQ+1}/${total}</span>
  </div>
  <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px">
    <div style="height:100%;width:${progress}%;background:var(--brand);border-radius:2px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1)"></div>
  </div>

  <div class="psy-q-enter" style="font-size:17px;font-weight:600;margin-bottom:20px;line-height:1.5">${qText}</div>

  <div class="psy-opts-enter" style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
    ${opts.map(function(opt, oi) {
      var selected = this._answers[this._currentQ] === oi;
      var border = selected ? 'var(--brand)' : 'var(--line-light)';
      var bg = selected ? 'var(--brand-bg)' : 'var(--card)';
      var color = selected ? 'var(--brand-dark)' : 'var(--text)';
      return '<div onclick="PsyAssessment._pick(' + oi + ')" style="padding:12px 14px;border-radius:12px;border:1.5px solid ' + border + ';background:' + bg + ';cursor:pointer;font-size:14px;color:' + color + ';transition:all 0.2s" onmouseover="this.style.borderColor=\'var(--brand)\';this.style.background=\'var(--brand-bg)\'" onmouseout="this.style.borderColor=\'' + border + '\';this.style.background=\'' + bg + '\'">' + opt + '</div>';
    }.bind(this)).join('')}
  </div>

  <div style="display:flex;gap:8px">
    ${this._currentQ > 0 ? '<button class="btn btn-outline btn-sm flex-1" onclick="PsyAssessment._prev()">上一题</button>' : ''}
    <button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment._next()">${this._currentQ < total-1 ? '下一题' : '查看结果'}</button>
  </div>
</div>`;
    this._applySlideIn(direction);
  },

  _applySlideIn(direction) {
    direction = direction || 'next';
    var from = direction === 'prev' ? '-30px' : '30px';
    var items = document.querySelectorAll('.psy-q-enter, .psy-opts-enter > div');
    for (var i = 0; i < items.length; i++) {
      items[i].style.opacity = '0';
      items[i].style.transform = 'translateX(' + from + ')';
      items[i].style.transition = 'all 0.35s cubic-bezier(0.4,0,0.2,1)';
      (function(el, delay) {
        setTimeout(function() {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        }, delay);
      })(items[i], 30 + i * 40);
    }
  },

  _renderBDIQ(scale, qText, total, progress, direction) {
    // 解析 BDI 格式: "0=选项1/1=选项2/2=选项3/3=选项4"
    var parts = qText.split('/');
    var questionMain = parts[0].split('=')[1] || parts[0];
    var html = '<div style="padding:0 4px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '<span style="font-size:13px;font-weight:500;color:var(--brand)">' + scale.name + '</span>' +
      '<span style="font-size:12px;color:var(--text-hint);margin-left:auto">' + (this._currentQ+1) + '/' + total + '</span>' +
      '</div>' +
      '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px">' +
      '<div style="height:100%;width:' + progress + '%;background:var(--brand);border-radius:2px;transition:width 0.3s"></div></div>' +
      '<div style="font-size:17px;font-weight:600;margin-bottom:20px;line-height:1.5">' + questionMain + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">';
    for (var bi = 0; bi < parts.length; bi++) {
      var p = parts[bi].split('=');
      var score = p[0] || bi;
      var text = p[1] || parts[bi];
      var selected = this._answers[this._currentQ] === parseInt(score);
      html += '<div onclick="PsyAssessment._pickBDI(' + score + ')" style="padding:10px 14px;border-radius:12px;border:1.5px solid ' + (selected ? 'var(--brand)' : 'var(--line-light)') + ';background:' + (selected ? 'var(--brand-bg)' : 'var(--card)') + ';cursor:pointer;font-size:13px;color:' + (selected ? 'var(--brand-dark)' : 'var(--text)') + '">' +
        '<span style="font-weight:600;margin-right:6px">' + score + '</span>' + text + '</div>';
    }
    html += '</div>' +
      '<div style="display:flex;gap:8px">' +
      (this._currentQ > 0 ? '<button class="btn btn-outline btn-sm flex-1" onclick="PsyAssessment._prev()">上一题</button>' : '') +
      '<button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment._next()">' + (this._currentQ < total-1 ? '下一题' : '查看结果') + '</button>' +
      '</div></div>';
    return html;
  },

  _pickBDI(score) {
    if(!this._answerTimes)this._answerTimes=[];this._answerTimes.push(Date.now()-(this._lastQTime||Date.now()));this._lastQTime=Date.now();
    this._answers[this._currentQ] = score;
    var scale = this._getScale();
    if (scale && this._currentQ < scale.items.length - 1) {
      setTimeout(function() { PsyAssessment._next(); }, 300);
    } else {
      this._renderQ();
    }
  },

  _pick(idx) {
    this._answers[this._currentQ] = idx;
    var scale = this._getScale();
    if (scale && this._currentQ < scale.items.length - 1) {
      // 选中高亮效果
      var allOpts = document.querySelectorAll('.psy-opts-enter > div');
      for (var oi = 0; oi < allOpts.length; oi++) {
        allOpts[oi].style.transition = 'all 0.2s';
        if (oi === idx) {
          allOpts[oi].style.border = '2px solid var(--brand-dark)';
          allOpts[oi].style.background = 'var(--brand-light)';
          allOpts[oi].style.color = 'var(--brand-dark)';
          allOpts[oi].style.fontWeight = '600';
          allOpts[oi].style.transform = 'scale(0.97)';
        } else {
          allOpts[oi].style.opacity = '0.3';
          allOpts[oi].style.transform = 'scale(0.95)';
        }
      }
      var qIdx = this._currentQ;
      setTimeout(function() {
        if (PsyAssessment._currentQ !== qIdx) return;
        PsyAssessment._next();
      }, 300);
    } else {
      this._renderQ();
    }
  },

  _prev() {
    if (this._currentQ > 0) { this._currentQ--; this._renderQ('prev'); }
  },

  _next() {
    if (this._answers[this._currentQ] === undefined) {
      var scale = this._getScale();
      var answered = Object.keys(this._answers).length;
      if (scale && answered >= scale.items.length - 1) { this._currentQ++; this._renderQ('next'); return; }
      Helpers.toast('请先选择'); return;
    }
    this._currentQ++;
    this._renderQ('next');
  },

  _showResult() {
    var scale = this._getScale();
    if (!scale) return;
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

    // 保存到档案（含详细分析数据）
    var pct = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
    var levelText = '';
    if (this._currentKey === 'phq9') {
      levelText = totalScore <= 4 ? '无明显抑郁症状' : totalScore <= 9 ? '可能有轻度抑郁' : totalScore <= 14 ? '可能有中度抑郁' : totalScore <= 19 ? '可能有中重度抑郁' : '可能有重度抑郁';
    } else if (this._currentKey === 'gad7') {
      levelText = totalScore <= 4 ? '无明显焦虑症状' : totalScore <= 9 ? '可能有轻度焦虑' : totalScore <= 14 ? '可能有中度焦虑' : '可能有重度焦虑';
    } else if (this._currentKey === 'sds') {
      levelText = '标准分' + Math.round(totalScore * 1.25) + '：' + (Math.round(totalScore * 1.25) < 50 ? '正常' : Math.round(totalScore * 1.25) < 60 ? '轻度' : Math.round(totalScore * 1.25) < 70 ? '中度' : '重度');
    } else if (this._currentKey === 'rses') {
      levelText = totalScore <= 15 ? '自尊水平较低' : totalScore <= 25 ? '自尊水平中等' : '自尊水平较高';
    } else if (this._currentKey === 'cdrisc10') {
      levelText = totalScore <= 15 ? '心理弹性较低' : totalScore <= 25 ? '心理弹性中等' : '心理弹性较高';
    }
    var p = Store.getProfile();
    if (p) {
      if (!p.psyAssessments) p.psyAssessments = {};
      // Calculate dimension scores if available
      var dimScores = [];
      if (scale.dims) {
        for (var di = 0; di < scale.dims.length; di++) {
          var d = scale.dims[di];
          var dScore = 0, dMax = d.max || 0;
          for (var dli = 0; dli < d.items.length; dli++) {
            var dans = this._answers[d.items[dli]];
            if (dans === undefined) continue;
            var isRev = d.r && d.r.indexOf(d.items[dli]) >= 0;
            dScore += isRev ? (scores[scores.length-1-dans] || 0) : (scores[dans] || 0);
          }
          dimScores.push({ name: d.name, score: dScore, max: dMax });
        }
      }
      // 保存历史（纵向追踪）
      var histKey = this._currentKey + '_history';
      if (!p.psyAssessments[histKey]) p.psyAssessments[histKey] = [];
      if (p.psyAssessments[this._currentKey]) {
        p.psyAssessments[histKey].push(p.psyAssessments[this._currentKey]);
        if (p.psyAssessments[histKey].length > 10) p.psyAssessments[histKey].shift();
      }
      Store.remove('psy_progress');
      p.psyAssessments[this._currentKey] = {
        date: Helpers.formatDate(new Date(), 'YYYY-MM-DD'),
        score: totalScore, pct: pct, level: levelText, max: maxScore,
        dims: dimScores, rawAnswers: this._answers,
        scaleName: scale.name, scaleRef: scale.ref || '',
        norm: scale.norm || null,
      };
      Store.setProfile(p);
    }
    var color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--brand)' : 'var(--warn)';
    var el = document.getElementById('main-content');

    // 生成解读文字
    var levelText = '';
    if (this._currentKey === 'phq9') {
      levelText = totalScore <= 4 ? '无明显抑郁症状' : totalScore <= 9 ? '可能有轻度抑郁' : totalScore <= 14 ? '可能有中度抑郁' : totalScore <= 19 ? '可能有中重度抑郁' : '可能有重度抑郁';
    } else if (this._currentKey === 'gad7') {
      levelText = totalScore <= 4 ? '无明显焦虑症状' : totalScore <= 9 ? '可能有轻度焦虑' : totalScore <= 14 ? '可能有中度焦虑' : '可能有重度焦虑';
    } else if (this._currentKey === 'sds') {
      var stdScore = Math.round(totalScore * 1.25);
      levelText = '标准分' + stdScore + '：' + (stdScore < 50 ? '正常范围' : stdScore < 60 ? '轻度抑郁' : stdScore < 70 ? '中度抑郁' : '重度抑郁');
    } else if (this._currentKey === 'rses') {
      levelText = totalScore <= 15 ? '自尊水平较低' : totalScore <= 25 ? '自尊水平中等' : '自尊水平较高';
    } else if (this._currentKey === 'cdrisc10') {
      levelText = totalScore <= 15 ? '心理弹性较低' : totalScore <= 25 ? '心理弹性中等' : '心理弹性较高';
    }

    // PHQ-9第9题预警（仅当第9题≥2时显示）
    var showCaution = false;
    if (this._currentKey === 'phq9' && this._answers[8] >= 2) showCaution = true;

    // 维度分析（多维度量表）
    var dimHtml = '';
    if (scale.dims) {
      dimHtml = '<div style="font-size:14px;font-weight:600;margin-bottom:8px;margin-top:12px">维度分析</div>';
      for (var di = 0; di < scale.dims.length; di++) {
        var d = scale.dims[di];
        var dScore = 0, dMax = d.max || 0;
        for (var dli = 0; dli < d.items.length; dli++) {
          var dii = d.items[dli];
          var dans = this._answers[dii];
          if (dans === undefined) continue;
          var isRev = d.r && d.r.indexOf(dii) >= 0;
          var dscore = isRev ? (scores[scores.length-1-dans] || 0) : (scores[dans] || 0);
          dScore += dscore;
        }
        var dpct = dMax > 0 ? Math.round(dScore / dMax * 100) : 0;
        var dc = dpct >= 60 ? 'var(--green)' : dpct >= 40 ? 'var(--brand)' : 'var(--warn)';
        var trait = dpct >= 60 ? (d.high || '偏高') : (d.low || '偏低');
        dimHtml += '<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light)">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-weight:600;font-size:14px">' + d.name + '</span>' +
          '<span style="font-weight:600;color:' + dc + '">' + dScore + '/' + dMax + '</span></div>' +
          '<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">' + (d.desc || '') + '</div>' +
          '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="height:100%;width:' + dpct + '%;background:' + dc + ';border-radius:2px"></div></div>' +
          '<div style="font-size:12px;color:var(--text-soft);margin-bottom:4px">' + trait + '</div>' +
          // Facet-level breakdown
          (d.facets && d.facets.length ? d.facets.map(function(f) {
            var fScore = 0, fMax = f.items.length * 5;
            for (var fi = 0; fi < f.items.length; fi++) {
              var fii = f.items[fi];
              var fans = this._answers[fii];
              if (fans === undefined) continue;
              var fRev = f.r && f.r.indexOf(fii) >= 0;
              var fs = fRev ? (scores[scores.length-1-fans] || 0) : (scores[fans] || 0);
              fScore += fs;
            }
            var fpct = fMax > 0 ? Math.round(fScore / fMax * 100) : 0;
            var fc = fpct >= 60 ? 'var(--green)' : fpct >= 40 ? 'var(--brand)' : 'var(--warn)';
            return '<div style="margin:3px 0">' +
              '<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:var(--text-soft)">' + f.name + '</span><span style="color:' + fc + ';font-weight:500">' + fScore + '/' + fMax + '</span></div>' +
              '<div style="height:2px;background:var(--line);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + fpct + '%;background:' + fc + ';border-radius:2px"></div></div></div>';
          }.bind(this)).join('') : '') +
        '</div>';
      }
    }

    // 常模对比（有norm数据时显示）- 带Z分数可视化
    var normHtml = '';
    if (scale.norm) {
      var n = scale.norm;
      var diff = totalScore - n.avg;
      var zScore = n.sd > 0 ? ((totalScore - n.avg) / n.sd).toFixed(2) : 0;
      var zLevel = Math.abs(zScore) < 0.5 ? '正常范围' : Math.abs(zScore) < 1.0 ? '轻微偏离' : Math.abs(zScore) < 1.5 ? '明显偏离' : '显著偏离';
      var diffText = diff > 0 ? '高于常模' + diff.toFixed(1) + '分' : diff < 0 ? '低于常模' + Math.abs(diff).toFixed(1) + '分' : '与常模持平';

      // Z分数可视化条
      var barWidth = Math.min(Math.abs(zScore) / 2 * 100, 100);
      var barColor = Math.abs(zScore) < 0.5 ? 'var(--green)' : Math.abs(zScore) < 1.0 ? 'var(--brand)' : Math.abs(zScore) < 1.5 ? 'var(--warn)' : 'var(--red)';
      var barLabel = 'Z=' + zScore + ' (' + zLevel + ')';

      normHtml = '<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid var(--line-light)">' +
        '<div style="font-size:14px;font-weight:600;margin-bottom:8px">常模对比 · Z=' + zScore + '</div>' +
        '<div style="display:flex;gap:10px;margin-bottom:8px">' +
        '<div style="flex:1;text-align:center;padding:8px;background:var(--brand-bg);border-radius:10px">' +
        '<div style="font-size:20px;font-weight:700;color:var(--brand)">' + totalScore + '</div>' +
        '<div style="font-size:11px;color:var(--text-hint)">你的得分</div></div>' +
        '<div style="flex:1;text-align:center;padding:8px;background:var(--card);border-radius:10px;border:1px solid var(--line-light)">' +
        '<div style="font-size:20px;font-weight:700;color:var(--text)">' + n.avg + '±' + n.sd + '</div>' +
        '<div style="font-size:11px;color:var(--text-hint)">常模(均值±标准差)</div></div>' +
        '<div style="flex:1;text-align:center;padding:8px;background:var(--card);border-radius:10px;border:1px solid var(--line-light)">' +
        '<div style="font-size:20px;font-weight:700;color:' + (Math.abs(zScore) < 0.5 ? 'var(--green)' : 'var(--warn)') + '">' + zLevel.charAt(0) + '</div>' +
        '<div style="font-size:11px;color:var(--text-hint)">' + zLevel + '</div></div>' +
        '</div>' +
        '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;position:relative;margin-bottom:4px">' +
        '<div style="position:absolute;left:50%;top:0;width:2px;height:100%;background:var(--text-hint);opacity:0.5"></div>' +
        (Math.abs(zScore) > 0.1 ? '<div style="height:100%;width:' + barWidth + '%;background:' + barColor + ';border-radius:2px;' + (zScore > 0 ? 'margin-left:50%' : 'margin-left:' + (50-barWidth) + '%') + '"></div>' : '') +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-hint);text-align:center">' + n.source + ' · Z分数=' + zScore + '（' + zLevel + '）</div></div>';
    }

    // AI 智能分析（点击生成）
    var aiHtml = '';
    if (Store.getApiKey()) {
      aiHtml = '<div id="ai-psy-analysis" style="margin-bottom:10px"></div>' +
        '<button class="btn btn-soft btn-sm btn-block" onclick="PsyAssessment._genAIAnalysis()" style="margin-bottom:10px">AI 智能分析</button>';
    }

    // 数据分析（按分数段给出建议）
    var advice = '';
    if (pct < 30) {
      advice = '你的得分较低，说明在此评估中表现良好。继续保持健康的生活方式，定期关注自己的心理状态。';
    } else if (pct < 50) {
      advice = '你在此方面存在一些需要注意的地方。建议关注自己的变化规律，必要时与信任的人交流感受。';
    } else if (pct < 70) {
      advice = '你在此方面需要引起注意。建议寻求专业心理咨询师进行进一步评估，了解具体情况。';
    } else {
      advice = '你的得分较高，建议尽快联系专业心理机构进行全面评估和指导。全国心理援助热线：400-161-9995';
    }

    // MBTI 类型判定（基于Big Five五维度框架）
    var mbtiTypeHtml = '';
    if (this._currentKey === 'mbti' || this._currentKey === 'mbti_60') {
      var mbtiDims = scale.dims;
      var dimScoresMap = {};
      for (var di = 0; di < dimScores.length; di++) {
        dimScoresMap[di] = dimScores[di].score;
      }
      // IRT加权评分
      var irtScores = null;
      if (typeof ScoringWeights !== 'undefined' && ScoringWeights.mbti) {
        irtScores = {};
        var sw = ScoringWeights.mbti;
        var dimKeys = ['E','O','A','C','N'];
        var dimLabels = ['外向性','开放性','理性/宜人性','尽责性','稳定性'];
        for (var ird = 0; ird < 5; ird++) {
          var start = sw.dimRanges[ird].start, end = sw.dimRanges[ird].end;
          var wSum = 0, wsSum = 0, nItems = 0;
          for (var iri = start; iri <= end; iri++) {
            var ans = this._answers[iri];
            if (ans === undefined) continue;
            var iw = sw.weights[iri] || 1.0;
            // 检查是否反向题
            var isRev = false;
            for (var rdi = 0; rdi < scale.dims.length; rdi++) {
              if (scale.dims[rdi].r && scale.dims[rdi].r.indexOf(iri) >= 0) { isRev = true; break; }
            }
            var score = isRev ? (5 - ans) : ans;
            wSum += iw;
            wsSum += iw * score;
            nItems++;
          }
          // 归一化到0-100
          var irtRaw = nItems > 0 ? wsSum / wSum : 0;
          var irtScore = Math.round(irtRaw / 5 * 100);
          // 标准误
          var rel = sw.reliability[dimKeys[ird]] || 0.85;
          var sem = Math.round(15 * Math.sqrt(1 - rel));
          irtScores[dimKeys[ird]] = { score: irtScore, sem: sem, label: dimLabels[ird] };
        }
      }
      var ei = dimScoresMap[0] || 0;
      var sn = dimScoresMap[1] || 0;
      var tf = dimScoresMap[2] || 0;
      var jp = dimScoresMap[3] || 0;
      var id = dimScoresMap[4] || 0;

      var typeLetters = (ei >= 180 ? 'E' : 'I') + (sn >= 180 ? 'N' : 'S') + (tf >= 180 ? 'T' : 'F') + (jp >= 180 ? 'J' : 'P');
      var identityLetter = (id >= 180 ? 'A' : 'T');
      var typeFull = typeLetters + '-' + identityLetter;

      var pType = (typeof PersonalityTypes !== 'undefined') ? PersonalityTypes[typeLetters] : null;
      var typeLabel = pType ? pType.label : '未知类型';
      var typePopulation = pType ? pType.population : '';
      var idDesc = identityLetter === 'A'
        ? '坚定型(Assertive)：情绪稳定、自信从容，不易被压力影响'
        : '波动型(Turbulent)：追求完美、敏感自省，容易感受到压力和情绪波动';

      var dimTexts = [
        (ei >= 180 ? 'E 外向' : 'I 内向') + ' (' + Math.round(ei/300*100) + '%)',
        (sn >= 180 ? 'N 直觉' : 'S 实感') + ' (' + Math.round(sn/300*100) + '%)',
        (tf >= 180 ? 'T 理性' : 'F 情感') + ' (' + Math.round(tf/300*100) + '%)',
        (jp >= 180 ? 'J 判断' : 'P 感知') + ' (' + Math.round(jp/300*100) + '%)',
      ];

      // 雷达图SVG（五维度可视化）
      var radarHtml = '';
      if (dimScores && dimScores.length >= 5) {
        var radarDims = ['外向性','开放性','理性','尽责性','稳定性'];
        var radarVals = dimScores.map(function(d) { return d.max > 0 ? Math.round(d.score / d.max * 100) : 50; });
        var cx = 120, cy = 120, r = 90, angles = [0,72,144,216,288].map(function(a) { return (a - 90) * Math.PI / 180; });
        var points = angles.map(function(ang, i) { return (cx + r * Math.cos(ang)) + ',' + (cy + r * Math.sin(ang)); }).join(' ');
        var userPoints = angles.map(function(ang, i) { return (cx + radarVals[i]/100 * r * Math.cos(ang)) + ',' + (cy + radarVals[i]/100 * r * Math.sin(ang)); }).join(' ');
        var labelPos = angles.map(function(ang, i) { var lr = r + 20; return { x: cx + lr * Math.cos(ang), y: cy + lr * Math.sin(ang), label: radarDims[i], val: radarVals[i] }; });
        radarHtml = '<div style="background:var(--card);border-radius:16px;padding:10px;margin-bottom:10px;border:1px solid var(--line-light)">' +
          '<svg viewBox="0 0 240 240" style="width:100%;max-width:260px;display:block;margin:0 auto">' +
          '<polygon points="' + points + '" fill="none" stroke="var(--line)" stroke-width="1"/>' +
          '<polygon points="' + angles.map(function(a) { return (cx + r*0.5*Math.cos(a)) + ',' + (cy + r*0.5*Math.sin(a)); }).join(' ') + '" fill="none" stroke="var(--line)" stroke-width="0.5" stroke-dasharray="3,3"/>' +
          '<polygon points="' + userPoints + '" fill="var(--purple)" fill-opacity="0.15" stroke="var(--purple)" stroke-width="2"/>' +
          radarVals.map(function(v, i) {
            return '<circle cx="' + (cx + v/100 * r * Math.cos(angles[i])) + '" cy="' + (cy + v/100 * r * Math.sin(angles[i])) + '" r="3" fill="var(--purple)"/>';
          }).join('') +
          labelPos.map(function(lp) {
            var ta = lp.x < cx ? 'end' : lp.x > cx ? 'start' : 'middle';
            var ty = lp.y < cy ? 'bottom' : lp.y > cy ? 'top' : 'middle';
            return '<text x="' + lp.x + '" y="' + lp.y + '" text-anchor="' + ta + '" dominant-baseline="middle" font-size="9" fill="var(--text)">' + lp.label + '</text>' +
              '<text x="' + lp.x + '" y="' + (lp.y + 11) + '" text-anchor="' + ta + '" dominant-baseline="middle" font-size="8" fill="var(--text-hint)">' + lp.val + '%</text>';
          }).join('') +
          '</svg></div>';
      }

      // Facet 高亮排序
      var facetHighlightHtml = '';
      if ((this._currentKey === 'mbti' || this._currentKey === 'mbti_60') && scale.dims && scale.dims[0] && scale.dims[0].facets && scale.dims[0].facets.length) {
        var allFacets = [];
        for (var fdi = 0; fdi < scale.dims.length; fdi++) {
          var fd = scale.dims[fdi];
          if (fd.facets) {
            for (var ffi = 0; ffi < fd.facets.length; ffi++) {
              var ff = fd.facets[ffi];
              var ffScore = 0, ffMax = ff.items.length * 5;
              for (var fii = 0; fii < ff.items.length; fii++) {
                var fans = this._answers[ff.items[fii]];
                if (fans === undefined) continue;
                var fRev = ff.r && ff.r.indexOf(ff.items[fii]) >= 0;
                var ffs = fRev ? (scores[scores.length-1-fans] || 0) : (scores[fans] || 0);
                ffScore += ffs;
              }
              var ffPct = ffMax > 0 ? Math.round(ffScore / ffMax * 100) : 0;
              allFacets.push({ name: ff.name, score: ffPct, dim: fd.name.split(' ')[0] });
            }
          }
        }
        allFacets.sort(function(a, b) { return b.score - a.score; });
        var top3 = allFacets.slice(0, 3);
        var bot3 = allFacets.slice(-3).reverse();
        facetHighlightHtml = '<div style="display:flex;gap:8px;margin-bottom:10px">' +
          '<div style="flex:1;background:var(--card);border-radius:12px;padding:10px;border:1px solid var(--line-light)">' +
          '<div style="font-size:11px;color:var(--green);font-weight:600;margin-bottom:4px"> 最强特质</div>' +
          top3.map(function(f) { return '<div style="font-size:11px;padding:2px 0;display:flex;justify-content:space-between"><span>' + f.name + '</span><span style="color:var(--green);font-weight:500">' + f.score + '%</span></div>'; }).join('') +
          '</div>' +
          '<div style="flex:1;background:var(--card);border-radius:12px;padding:10px;border:1px solid var(--line-light)">' +
          '<div style="font-size:11px;color:var(--warn);font-weight:600;margin-bottom:4px"> 待发展</div>' +
          bot3.map(function(f) { return '<div style="font-size:11px;padding:2px 0;display:flex;justify-content:space-between"><span>' + f.name + '</span><span style="color:var(--warn);font-weight:500">' + f.score + '%</span></div>'; }).join('') +
          '</div></div>';
      }

      // IRT评分展示
      var irtHtml = '';
      if (irtScores) {
        var irtDimKeys = ['E','O','A','C','N'];
        var irtColors = ['var(--purple)','var(--brand)','var(--green)','var(--warm)','var(--red)'];
        irtHtml = '<div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid var(--line-light)">' +
          '<div style="font-size:12px;font-weight:600;margin-bottom:6px">IRT加权评分</div>';
        irtDimKeys.forEach(function(k, i) {
          var irt = irtScores[k];
          if (!irt) return;
          var lo = Math.max(0, irt.score - Math.round(1.96 * irt.sem));
          var hi = Math.min(100, irt.score + Math.round(1.96 * irt.sem));
          irtHtml += '<div style="margin-bottom:4px"><div style="display:flex;justify-content:space-between;font-size:11px">' +
            '<span>' + irt.label + '</span>' +
            '<span style="color:' + irtColors[i] + ';font-weight:600">' + irt.score + ' \u00b1' + irt.sem + '</span></div>' +
            '<div style="height:3px;background:var(--line);border-radius:2px;overflow:hidden;position:relative">' +
            '<div style="height:100%;background:' + irtColors[i] + ';border-radius:2px;width:' + irt.score + '%;opacity:0.7"></div>' +
            '<div style="position:absolute;top:0;left:' + lo + '%;width:' + (hi-lo) + '%;height:100%;background:' + irtColors[i] + ';opacity:0.2;border-left:1px solid ' + irtColors[i] + ';border-right:1px solid ' + irtColors[i] + '"></div></div>' +
            '<div style="font-size:9px;color:var(--text-hint)">95%CI: ' + lo + '-' + hi + '</div></div>';
        });
        irtHtml += '<div style="font-size:9px;color:var(--text-hint)">区分度权重评分+标准误</div></div>';
      }

      // 中国常模百分位
      var normHtml = '';
      if (typeof ChineseNorms !== 'undefined' && irtScores) {
        var cnDimKeys = ['E','O','A','C','N'];
        var cnLabels = { E: '\u5916\u5411\u6027', O: '\u5f00\u653e\u6027', A: '\u7406\u6027', C: '\u5c3d\u8d23\u6027', N: '\u7a33\u5b9a\u6027' };
        var pp = Store.getProfile();
        var ageGroup = '26-35';
        if (pp) { var a = pp.age || 30; if (a <= 25) ageGroup = '18-25'; else if (a <= 35) ageGroup = '26-35'; else if (a <= 45) ageGroup = '36-45'; else ageGroup = '46-60'; }
        var gender = (pp && pp.gender === 'female') ? 'female' : 'male';
        normHtml = '<div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid var(--line-light)">' +
          '<div style="font-size:12px;font-weight:600;margin-bottom:6px">\u4e2d\u56fd\u5e38\u6a21\u5bf9\u6bd4</div>';
        cnDimKeys.forEach(function(k) {
          var irt = irtScores[k];
          if (!irt) return;
          var pct = ChineseNorms.percentile(irt.score, k, ageGroup, gender);
          var barColor = pct >= 70 ? 'var(--green)' : pct >= 30 ? 'var(--brand)' : 'var(--warn)';
          normHtml += '<div style="margin-bottom:3px"><div style="display:flex;justify-content:space-between;font-size:11px">' +
            '<span>' + cnLabels[k] + '</span><span style="font-weight:600">\u9ad8\u4e8e ' + pct + '%</span></div>' +
            '<div style="height:2px;background:var(--line);border-radius:2px;overflow:hidden">' +
            '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:2px"></div></div></div>';
        });
        normHtml += '<div style="font-size:9px;color:var(--text-hint);margin-top:4px">\u57fa\u4e8e\u738b\u5b5f\u6210\u7b49(2010)\u4e2d\u56fd\u5927\u4e94\u4eba\u683c\u95ee\u5377\u5e38\u6a21 N=4,359</div></div>';
      }

      // 纵向趋势
      var trendHtml = '';
      if (this._currentKey === 'mbti' || this._currentKey === 'mbti_60') {
        var pp2 = Store.getProfile();
        var recordHistory = [];
        if (pp2 && pp2.psyAssessments) {
          var histKey = this._currentKey + '_history';
          var hist = pp2.psyAssessments[histKey] || [];
          hist.forEach(function(h) { if (h && h.dims) recordHistory.push(h); });
          recordHistory.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
        }
        if (recordHistory.length >= 2) {
          var trendDims = ['\u5916\u5411\u6027','\u5f00\u653e\u6027','\u7406\u6027','\u5c3d\u8d23\u6027','\u7a33\u5b9a\u6027'];
          var trendColors = ['#8EA9C4','#C49A6C','#7A9A6E','#E88A6A','#B8A9C4'];
          var tw = 320, th = 120, tpad = 28;
          var dates = recordHistory.map(function(r) { return r.date; });
          var svgLines = '';
          trendDims.forEach(function(d, di) {
            var vals = recordHistory.map(function(r) {
              var ds = r.dims && r.dims[di];
              return ds && ds.max > 0 ? Math.round(ds.score / ds.max * 100) : 0;
            });
            if (vals.length < 2) return;
            var pts = vals.map(function(v, vi) {
              var x = tpad + vi * (tw - tpad * 2) / Math.max(vals.length - 1, 1);
              var y = th - tpad - (v / 100) * (th - tpad * 2);
              return x + ',' + y;
            }).join(' L');
            svgLines += '<path d="M' + pts + '" stroke="' + trendColors[di] + '" stroke-width="1.5" fill="none" stroke-linejoin="round"/>';
            var lx = tpad + (vals.length-1) * (tw - tpad * 2) / Math.max(vals.length - 1, 1);
            var ly = th - tpad - (vals[vals.length-1] / 100) * (th - tpad * 2);
            svgLines += '<text x="' + (lx + 3) + '" y="' + (ly + 3) + '" font-size="7" fill="' + trendColors[di] + '">' + d + '</text>';
          });
          var dateLabels = dates.map(function(d, i) {
            if (i % Math.max(1, Math.floor(dates.length / 6)) !== 0 && i !== dates.length - 1) return '';
            var x = tpad + i * (tw - tpad * 2) / Math.max(dates.length - 1, 1);
            return '<text x="' + x + '" y="' + (th - 4) + '" text-anchor="middle" font-size="7" fill="var(--text-hint)">' + d.slice(5) + '</text>';
          }).join('');
          trendHtml = '<div style="background:var(--card);border-radius:12px;padding:10px;margin-bottom:10px;border:1px solid var(--line-light)">' +
            '<div style="font-size:12px;font-weight:600;margin-bottom:4px">\u5386\u53f2\u8d8b\u52bf\uff08' + recordHistory.length + '\u6b21\uff09</div>' +
            '<svg viewBox="0 0 ' + tw + ' ' + th + '" style="width:100%;height:' + th + 'px">' +
            '<line x1="' + tpad + '" y1="' + (th - tpad) + '" x2="' + (tw - tpad) + '" y2="' + (th - tpad) + '" stroke="var(--line)" stroke-width="0.5"/>' +
            dateLabels + svgLines +
            '</svg></div>';
        }
      }

      // 他评模式
      var informantHtml = '';
      if ((this._currentKey === 'mbti' || this._currentKey === 'mbti_60') && typeFull) {
        var pp3 = Store.getProfile();
        var hasInformant = pp3 && pp3.psyAssessments && pp3.psyAssessments['mbti_informants'] && pp3.psyAssessments['mbti_informants'].length;
        informantHtml = '<div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid var(--line-light)">' +
          '<div style="font-size:12px;font-weight:600;margin-bottom:4px">\u4ed6\u8bc4\u6a21\u5f0f</div>' +
          '<div style="font-size:11px;color:var(--text-soft);margin-bottom:6px">\u8ba9\u670b\u53cb\u6216\u540c\u4e8b\u5bf9\u4f60\u7684\u4eba\u683c\u8fdb\u884c\u8bc4\u4ef7\uff0c\u5bf9\u6bd4\u81ea\u8bc4\u4e0e\u4ed6\u8bc4\u7684\u5dee\u5f02\u3002</div>' +
          '<button class="btn btn-soft btn-sm" onclick="PsyAssessment._startInformant_simple()">\u751f\u6210\u4ed6\u8bc4\u8868\u5355</button>' +
          (hasInformant ? '<button class="btn btn-soft btn-sm" style="margin-left:4px" onclick="PsyAssessment._showInformantCompare()">\u67e5\u770b\u5bf9\u6bd4</button>' : '') +
          '</div>';
      }


      // 类型置信度
      var confHtml = '';
      if ((this._currentKey === 'mbti' || this._currentKey === 'mbti_60') && dimScores && dimScores.length >= 4) {
        var dimMid = 180;
        var confPcts = [
          dimScores[0] ? Math.round(Math.abs(dimScores[0].score - dimMid) / (dimScores[0].max - dimMid) * 100) : 0,
          dimScores[1] ? Math.round(Math.abs(dimScores[1].score - dimMid) / (dimScores[1].max - dimMid) * 100) : 0,
          dimScores[2] ? Math.round(Math.abs(dimScores[2].score - dimMid) / (dimScores[2].max - dimMid) * 100) : 0,
          dimScores[3] ? Math.round(Math.abs(dimScores[3].score - dimMid) / (dimScores[3].max - dimMid) * 100) : 0,
        ];
        var avgC = Math.round(confPcts.reduce(function(s, v) { return s + v; }, 0) / 4);
        var cLabel = avgC >= 70 ? '高度确定' : avgC >= 40 ? '中等确定' : '边缘确定';
        var cColor = avgC >= 70 ? 'var(--green)' : avgC >= 40 ? 'var(--brand)' : 'var(--warn)';
        var cDesc = avgC >= 70 ? '你的维度倾向非常明显，类型判定可靠' : avgC >= 40 ? '维度倾向中等，类型具有参考意义' : '维度倾向不明显，另一类型也可能适合';
        // 次优匹配
        var secEi = dimScores[0] && dimScores[0].score < dimMid ? 'E' : dimScores[0] ? 'I' : '';
        var secSn = dimScores[1] && dimScores[1].score < dimMid ? 'N' : dimScores[1] ? 'S' : '';
        var secTf = dimScores[2] && dimScores[2].score < dimMid ? 'T' : dimScores[2] ? 'F' : '';
        var secJp = dimScores[3] && dimScores[3].score < dimMid ? 'J' : dimScores[3] ? 'P' : '';
        var secType = secEi + secSn + secTf + secJp;
        confHtml = '<div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid var(--line-light)">' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="font-weight:600">类型确定度</span>' +
          '<span style="color:' + cColor + ';font-weight:600">' + avgC + '% ' + cLabel + '</span></div>' +
          '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="height:100%;width:' + avgC + '%;background:' + cColor + ';border-radius:2px"></div></div>' +
          '<div style="font-size:11px;color:var(--text-soft)">' + cDesc +
          (avgC < 70 && secType.length === 4 ? '<br>次优匹配: <strong>' + secType + '</strong> (确定度 ' + (100 - avgC) + '%)' : '') +
          '</div></div>';
        if (avgC < 40) confHtml = '<div style="font-size:12px;color:var(--warn);padding:8px 12px;border-radius:10px;border:1px solid var(--warn);margin-bottom:10px;text-align:center">⚠️ 类型确定度低。你的维度得分均在中线附近，建议做完整版300题获取更精确结果。建议参考次优匹配类型。</div>' + confHtml;
      }

      // 效度检测（仅MBTI 300题版）
      var validityHtml = '';
      if ((this._currentKey === 'mbti' || this._currentKey === 'mbti_60') && scale.items && scale.items.length >= 100) {
        var consistencyIssues=0;var lieScore=0;[54,55,56,57,58,59].forEach(function(li){var la=this._answers[li];if(la!==undefined){var lv=li>=55?(la===0?1:la===4?0:la===1?0.5:0):(la===4?1:la===0?0:la===3?0.5:0);lieScore+=lv;}}.bind(this));if(lieScore>=4)consistencyIssues++;var fatigueFlag=0;if(this._answerTimes&&this._answerTimes.length>=80){var ht=this._answerTimes.slice(0,30).reduce(function(s,v){return s+v;},0)/30;var tt=this._answerTimes.slice(-30).reduce(function(s,v){return s+v;},0)/30;if(tt>0&&ht/tt>2.0){fatigueFlag=1;consistencyIssues++;}}
        var consistencyPairs = [
          { a: 0, b: 5, desc: '社交意愿' },
          { a: 70, b: 75, desc: '艺术兴趣' },
          { a: 180, b: 185, desc: '条理偏好' },
          { a: 250, b: 255, desc: '自我评价' },
        ];
        consistencyPairs.forEach(function(pair) {
          var ansA = this._answers[pair.a];
          var ansB = this._answers[pair.b];
          if (ansA !== undefined && ansB !== undefined) {
            // B is reverse-scored, so consistency = similar scores (both high or both low)
            var isRev = [5,75,185,255].indexOf(pair.b) >= 0;
            var adjB = isRev ? (4 - ansB) : ansB;
            var diff = Math.abs(ansA - adjB);
            if (diff >= 2) consistencyIssues++;
          }
        }.bind(this));

        var elapsed = this._testStart ? Math.round((Date.now() - this._testStart) / 60000) : 0;
        var tooFast = elapsed < 5 && elapsed > 0;
        var tooFastFlag = tooFast ? 1 : 0;
        var totalIssues = consistencyIssues + tooFastFlag;

        var validityLevel = totalIssues === 0 ? '高' : totalIssues <= 1 ? '中' : '低';
        var validityColor = totalIssues === 0 ? 'var(--green)' : totalIssues <= 1 ? 'var(--brand)' : 'var(--warn)';
        var validityDetail = [];
        if (consistencyIssues > 0) validityDetail.push(consistencyIssues + '组作答不一致');
        if(lieScore>=4)validityDetail.push('社会赞许偏差');if(fatigueFlag)validityDetail.push('尾段可能答题疲劳');
        if (tooFastFlag) validityDetail.push('答题过快（' + elapsed + '分钟）');

        validityHtml = '<div style="font-size:12px;padding:8px 12px;border-radius:10px;background:' + validityColor + '15;border:1px solid ' + validityColor + '40;margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
          '<span style="color:' + validityColor + ';font-weight:600">回答可信度：' + validityLevel + '</span>' +
          (validityDetail.length ? '<span style="color:var(--text-soft)">· ' + validityDetail.join('；') + '</span>' : '') +
          (totalIssues === 0 && elapsed > 0 ? '<span style="color:var(--text-soft)">· 答题' + elapsed + '分钟 · 前后一致</span>' : '') +
          '</div>';
      }

      // 深度解读卡片
      var guideHtml = '';
      if (pType) {
        var sections = [];
        if (pType.identity) sections.push({ icon: '👤', title: '身份定位', content: '<div style="font-size:13px;line-height:1.7">' + pType.identity + '</div>' });
        if (pType.strengths && pType.strengths.length) sections.push({ icon: '⭐', title: '核心优势 (' + pType.strengths.length + ')', content: pType.strengths.map(function(s) { return '<div style="display:flex;gap:6px;padding:3px 0;font-size:12px"><span style="color:var(--green);flex-shrink:0">✓</span><span>' + s + '</span></div>'; }).join('') });
        if (pType.weaknesses && pType.weaknesses.length) sections.push({ icon: '⚡', title: '潜在短板 (' + pType.weaknesses.length + ')', content: pType.weaknesses.map(function(s) { return '<div style="display:flex;gap:6px;padding:3px 0;font-size:12px"><span style="color:var(--warn);flex-shrink:0">!</span><span>' + s + '</span></div>'; }).join('') });
        if (pType.career && pType.career.length) sections.push({ icon: '💼', title: '职业方向', content: '<div style="display:flex;flex-wrap:wrap;gap:4px">' + pType.career.map(function(c) { return '<span style="padding:3px 10px;background:var(--brand-bg);border-radius:12px;font-size:12px">' + c + '</span>'; }).join('') + '</div>' });
        if (pType.relationships) sections.push({ icon: '❤️', title: '关系模式', content: '<div style="font-size:12px;line-height:1.7">' + pType.relationships + '</div>' });
        if (pType.growth) sections.push({ icon: '🌱', title: '成长建议', content: '<div style="font-size:12px;line-height:1.7">' + pType.growth + '</div>' });
        if (pType.workplace) sections.push({ icon: '🏢', title: '职场风格', content: '<div style="font-size:12px;line-height:1.7">' + pType.workplace + '</div>' });

        guideHtml = '<div style="margin-bottom:10px">' +
          sections.map(function(sec, si) {
            return '<div style="background:var(--card);border-radius:12px;margin-bottom:4px;border:1px solid var(--line-light);overflow:hidden">' +
              '<div onclick="PsyAssessment._toggleGuide(' + si + ')" style="display:flex;align-items:center;gap:6px;padding:10px 12px;cursor:pointer;user-select:none">' +
              '<span style="flex:1;font-size:13px;font-weight:600">' + sec.icon + ' ' + sec.title + '</span>' +
              '<span id="guide-arrow-' + si + '" style="font-size:10px;transition:transform 0.2s;color:var(--text-hint)">▾</span></div>' +
              '<div id="guide-body-' + si + '" style="display:none;padding:0 12px 10px">' + sec.content + '</div></div>';
          }).join('') + '</div>';

        // Add toggle function dynamically
        if (!PsyAssessment._toggleGuide) {
          PsyAssessment._toggleGuide = function(idx) {
            var body = document.getElementById('guide-body-' + idx);
            var arrow = document.getElementById('guide-arrow-' + idx);
            if (body) {
              var show = body.style.display !== 'block';
              body.style.display = show ? 'block' : 'none';
              if (arrow) arrow.style.transform = show ? 'rotate(180deg)' : '';
            }
          };
        }
      }

      mbtiTypeHtml = `
        <div style="text-align:center;background:var(--purple);color:white;border-radius:16px;padding:20px;margin-bottom:14px">
          <div style="font-size:14px;opacity:0.8;margin-bottom:4px">基于大五人格框架 · ${typePopulation ? '约占人口' + typePopulation : ''}</div>
          <div style="font-size:40px;font-weight:800;letter-spacing:6px;margin-bottom:2px">${typeLetters}</div>
          <div style="font-size:13px;opacity:0.9;margin-bottom:8px">${identityLetter === 'A' ? '坚定型' : '波动型'} — ${typeFull}</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:2px">${typeLabel}</div>
          ${pType && pType.identity ? '<div style="font-size:12px;opacity:0.85;line-height:1.5">' + pType.identity + '</div>' : ''}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          ${dimTexts.map(function(t) {
            return '<div style="flex:1;min-width:70px;text-align:center;padding:6px 4px;background:var(--card);border-radius:10px;border:1px solid var(--line-light);font-size:12px;font-weight:500">' + t + '</div>';
          }).join('')}
        </div>
        <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;padding:6px 10px;background:var(--brand-bg);border-radius:8px;text-align:center">
          ${typeLetters}-${identityLetter} · ${idDesc}
        </div>
        ${radarHtml}
        ${irtHtml}
        ${normHtml}
        ${facetHighlightHtml}
        ${trendHtml}
        ${informantHtml}
        ${confHtml}
        ${validityHtml}
        ${guideHtml}`;
    }

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="text-align:center">
    <div style="font-size:12px;color:var(--green);margin-bottom:4px">已保存到档案</div>
    <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
    <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:2px">${totalScore}</div>
    <div style="font-size:16px;font-weight:600;color:${color};margin-bottom:2px">${pct}%</div>
    <div style="display:flex;justify-content:center;gap:4px;margin-bottom:4px">
      ${Array(5).fill(0).map(function(v, i) {
        var fill = pct >= (i+1)*20 ? color : 'var(--line)';
        return '<div style="width:28px;height:28px;border-radius:50%;background:' + fill + ';opacity:0.8"></div>';
      }).join('')}
    </div>
    ${levelText ? '<div style="font-size:15px;font-weight:500;color:var(--text);margin-bottom:8px">' + levelText + '</div>' : ''}

    <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s"></div>
    </div>
    <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">得分 ${totalScore}/${maxScore}</div>
  </div>

  ${mbtiTypeHtml}

  <!-- 解读 -->
  <div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:6px">结果解读</div>
    <div style="font-size:13px;color:var(--text-soft);line-height:1.7">${levelText || scale.scoring ? (scale.scoring ? scale.scoring.split('。')[0] : '') : ''}</div>
  </div>

  <!-- 建议 -->
  <div style="background:var(--brand-bg);border-radius:14px;padding:14px;margin-bottom:10px">
    <div style="font-size:14px;font-weight:600;margin-bottom:6px">建议</div>
    <div style="font-size:13px;line-height:1.7">${advice}</div>
  </div>

  ${normHtml}

  ${dimHtml}

  ${showCaution ? '<div style="font-size:12px;color:var(--red);margin-bottom:10px;padding:10px;background:var(--red-bg);border-radius:10px;line-height:1.6;font-weight:500">你第9题选择了有自伤念头。请立即拨打全国心理援助热线：400-161-9995</div>' : ''}

  ${aiHtml}

  <div style="display:flex;gap:6px">
    <button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment.show()">返回列表</button>
    <button class="btn btn-outline btn-sm flex-1" onclick="App.navigate('mental')">心理页面</button>
  </div>
</div>`;
  },

  _exportData() {
    var p = Store.getProfile();
    if (!p || !p.psyAssessments) { Helpers.toast('没有测评数据'); return; }
    var data = { type: 'psy_assessments_export', date: new Date().toISOString(), assessments: p.psyAssessments };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
    a.download = 'psy_data_' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
    Helpers.toast('导出成功 ✓');
  },

  _importData(event) {
    var file = event.target && event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data || data.type !== 'psy_assessments_export') { Helpers.toast('文件格式错误'); return; }
        var p = Store.getProfile();
        if (!p) { Helpers.toast('请先设置档案'); return; }
        if (!p.psyAssessments) p.psyAssessments = {};
        var cnt = 0, keys = [];
        for (var key in data.assessments) { p.psyAssessments[key] = data.assessments[key]; cnt++; if (key.endsWith("_history") && Array.isArray(data.assessments[key]) && data.assessments[key].length) { var mk = key.slice(0, -8); if (!p.psyAssessments[mk]) { p.psyAssessments[mk] = data.assessments[key][data.assessments[key].length - 1]; cnt++; } } }
        Store.setProfile(p);
        Helpers.toast('导入 ' + cnt + ' 条: ' + keys.join(', '));
        this._renderList();
      } catch(e) { Helpers.toast('导入失败: ' + e.message); }
    }.bind(this);
    reader.readAsText(file);
  },
};

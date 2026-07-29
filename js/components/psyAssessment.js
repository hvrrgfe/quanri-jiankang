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

  ${history.length ? '<div style="background:var(--card);border-radius:14px;padding:10px;margin-bottom:10px;border:1px solid var(--line-light)">' +
    '<div style="font-size:12px;font-weight:600;color:var(--text-hint);margin-bottom:6px">历史记录</div>' +
    history.slice(0,10).map(function(h) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:3px 0;border-bottom:1px solid var(--line-light)"><span>' + h.name + '</span><span><span style="color:var(--brand);font-weight:500">' + h.score + '分</span><span onclick="PsyAssessment._deleteRecord(\'' + h.key + '\')" style="margin-left:6px;cursor:pointer;color:var(--text-hint);font-size:14px">&times;</span></span></div>';
    }).join('') +
    (history.length > 10 ? '<div style="font-size:11px;color:var(--text-hint);text-align:center;margin-top:4px">共' + history.length + '次记录</div>' : '') +
  '</div>' : ''}

  <input id="psy-search" class="form-input" type="text" placeholder="搜索量表名称..." value="${this._filter}" oninput="PsyAssessment._doFilter(this.value)" style="margin-bottom:8px;font-size:13px;padding:8px 10px;border-radius:10px">

  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
    ${cats.map(function(c) {
      var isSel = this._filterCategory === c.key;
      return '<span onclick="PsyAssessment._setFilter(\'' + c.key + '\')" style="padding:3px 10px;font-size:11px;border-radius:12px;cursor:pointer;background:' + (isSel ? 'var(--brand)' : 'var(--card)') + ';color:' + (isSel ? 'white' : 'var(--text-soft)') + ';border:1px solid ' + (isSel ? 'var(--brand)' : 'var(--line-light)') + '">' + c.label + '</span>';
    }.bind(this)).join('')}
  </div>

  <div id="psy-result">${this._allScales()}</div>
</div>`;
    // 焦点到搜索框
    setTimeout(function() { var inp = document.getElementById('psy-search'); if (inp) inp.focus(); }, 100);
  },

  _getHistory() {
    var p = Store.getProfile();
    if (!p || !p.psyAssessments) return [];
    var now = Object.keys(p.psyAssessments).map(function(key) {
      var entry = p.psyAssessments[key];
      var scale = null;
      // Search all categories for this key
      for (var catKey in AssessmentsDB) {
        if (AssessmentsDB[catKey] && AssessmentsDB[catKey][key]) {
          scale = AssessmentsDB[catKey][key];
          break;
        }
      }
      return {
        key: key,
        name: scale ? scale.name : key,
        score: entry.score,
        date: entry.date || '',
      };
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
        text = text.replace(/【(.*?)】/g, '<strong>$1</strong>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n/g, '<br>');
        c.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:6px">AI 智能分析</div>' +
          '<div style="font-size:13px;line-height:1.8">' + text + '</div>';
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
    this._renderQ();
  },

  _getScale() {
    return AssessmentsDB[this._currentCat] && AssessmentsDB[this._currentCat][this._currentKey];
  },

  _renderQ() {
    var scale = this._getScale();
    if (!scale) return;
    if (this._currentQ >= scale.items.length) { this._showResult(); return; }

    var qText = scale.items[this._currentQ];
    var opts = scale.options;
    var total = scale.items.length;
    var progress = Math.round(this._currentQ / total * 100);
    var el = document.getElementById('main-content');

    // 处理BDI等内置选项的量表（选项嵌入在题目文本中）
    if (scale.bdi) {
      el.innerHTML = this._renderBDIQ(scale, qText, total, progress);
      return;
    }

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    <span style="font-size:13px;font-weight:500;color:var(--brand)">${scale.name}</span>
    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${this._currentQ+1}/${total}</span>
  </div>
  <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px">
    <div style="height:100%;width:${progress}%;background:var(--brand);border-radius:2px;transition:width 0.3s"></div>
  </div>

  <div style="font-size:17px;font-weight:600;margin-bottom:20px;line-height:1.5">${qText}</div>

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
    ${opts.map(function(opt, oi) {
      var selected = this._answers[this._currentQ] === oi;
      var border = selected ? 'var(--brand)' : 'var(--line-light)';
      var bg = selected ? 'var(--brand-bg)' : 'var(--card)';
      var color = selected ? 'var(--brand-dark)' : 'var(--text)';
      return '<div onclick="PsyAssessment._pick(' + oi + ')" style="padding:12px 14px;border-radius:12px;border:1.5px solid ' + border + ';background:' + bg + ';cursor:pointer;font-size:14px;color:' + color + '">' + opt + '</div>';
    }.bind(this)).join('')}
  </div>

  <div style="display:flex;gap:8px">
    ${this._currentQ > 0 ? '<button class="btn btn-outline btn-sm flex-1" onclick="PsyAssessment._prev()">上一题</button>' : ''}
    <button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment._next()">${this._currentQ < total-1 ? '下一题' : '查看结果'}</button>
  </div>
</div>`;
  },

  _renderBDIQ(scale, qText, total, progress) {
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
    this._answers[this._currentQ] = score;
    this._renderQ();
  },

  _pick(idx) {
    this._answers[this._currentQ] = idx;
    this._renderQ();
  },

  _prev() {
    if (this._currentQ > 0) { this._currentQ--; this._renderQ(); }
  },

  _next() {
    if (this._answers[this._currentQ] === undefined) { Helpers.toast('请先选择'); return; }
    this._currentQ++;
    this._renderQ();
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

    // 保存到档案
    var p = Store.getProfile();
    if (p) {
      if (!p.psyAssessments) p.psyAssessments = {};
      p.psyAssessments[this._currentKey] = { date: Helpers.formatDate(new Date(), 'YYYY-MM-DD'), score: totalScore };
      Store.setProfile(p);
    }

    var pct = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
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
          '<div style="font-size:11px;color:var(--text-hint);margin-bottom:4px">' + (d.desc || '') + ' · ' + (d.higher ? '越高越好' : '越低越好') + '</div>' +
          '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="height:100%;width:' + dpct + '%;background:' + dc + ';border-radius:2px"></div></div>' +
          '<div style="font-size:12px;color:var(--text-soft)">' + trait + '</div></div>';
      }
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

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="text-align:center">
    <div style="font-size:12px;color:var(--green);margin-bottom:4px">已保存到档案</div>
    <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
    <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:2px">${totalScore}</div>
    <div style="font-size:16px;font-weight:600;color:${color};margin-bottom:2px">${pct}%</div>
    ${levelText ? '<div style="font-size:15px;font-weight:500;color:var(--text);margin-bottom:8px">' + levelText + '</div>' : ''}

    <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s"></div>
    </div>
    <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px">得分 ${totalScore}/${maxScore}</div>
  </div>

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

  ${dimHtml}

  ${showCaution ? '<div style="font-size:12px;color:var(--red);margin-bottom:10px;padding:10px;background:var(--red-bg);border-radius:10px;line-height:1.6;font-weight:500">你第9题选择了有自伤念头。请立即拨打全国心理援助热线：400-161-9995</div>' : ''}

  ${aiHtml}

  <div style="display:flex;gap:6px">
    <button class="btn btn-primary btn-sm flex-1" onclick="PsyAssessment.show()">返回列表</button>
    <button class="btn btn-outline btn-sm flex-1" onclick="App.navigate('mental')">心理页面</button>
  </div>
</div>`;
  },
};

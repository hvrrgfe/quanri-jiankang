// ===== 心理自测（全球公认量表库 60+套）=====

const PsyAssessment = {
  _currentKey: null,
  _currentCat: null,
  _currentQ: 0,
  _answers: {},

  _filter: '',
  _filterCat: '',

  show() {
    this._filter = '';
    this._filterCat = '';
    this._renderList();
  },

  _renderList() {
    var el = document.getElementById('main-content');
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
      { key: 'child', label: '儿童青少年' },
      { key: 'work', label: '职业' },
      { key: 'mindfulness', label: '正念' },
      { key: 'relation', label: '人际关系' },
    ];
    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:4px">心理自测</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px">全球公认标准化量表 · 结果仅供参考</div>

  <input id="psy-search" class="form-input" type="text" placeholder="搜索量表名称..." value="${this._filter}" oninput="PsyAssessment._doFilter(this.value)" style="margin-bottom:8px;font-size:13px;padding:8px 10px;border-radius:10px">

  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
    ${cats.map(function(c) {
      var isSel = this._filterCat === c.key;
      return '<span onclick="PsyAssessment._filterCat(\'' + c.key + '\')" style="padding:3px 10px;font-size:11px;border-radius:12px;cursor:pointer;background:' + (isSel ? 'var(--brand)' : 'var(--card)') + ';color:' + (isSel ? 'white' : 'var(--text-soft)') + ';border:1px solid ' + (isSel ? 'var(--brand)' : 'var(--line-light)') + '">' + c.label + '</span>';
    }.bind(this)).join('')}
  </div>

  <div id="psy-result">${this._allScales()}</div>
</div>`;
    // 焦点到搜索框
    setTimeout(function() { var inp = document.getElementById('psy-search'); if (inp) inp.focus(); }, 100);
  },

  _doFilter(val) {
    this._filter = val;
    this._renderList();
  },

  _filterCat(key) {
    this._filterCat = key;
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
      if (this._filterCat && this._filterCat !== cat.key) continue;
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

    // 处理BDI等内置选项的量表
    if (!opts || opts[0] === '选项见每题') {
      el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
  <div style="font-size:22px;font-weight:700;margin-bottom:16px">该量表为特殊格式</div>
  <div style="font-size:13px;color:var(--text-soft);margin-bottom:16px;padding:14px;background:var(--card);border-radius:14px;line-height:1.7">${scale.scoring || ''}</div>
  <div style="font-size:12px;color:var(--text-hint);margin-bottom:16px">请参考专业手册进行施测</div>
  <button class="btn btn-primary btn-sm btn-block" onclick="PsyAssessment.show()">返回列表</button>
</div>`;
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

    el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:12px;color:var(--green);margin-bottom:4px">已保存到档案</div>
  <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
  <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:4px">${totalScore}</div>
  <div style="font-size:16px;font-weight:600;color:${color};margin-bottom:8px">${pct}%</div>

  <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:12px">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s"></div>
  </div>
  <div style="font-size:12px;color:var(--text-hint);margin-bottom:16px">得分 ${totalScore}/${maxScore}</div>

  ${scale.scoring ? '<div style="font-size:12px;color:var(--text-soft);margin-bottom:12px;padding:10px;background:var(--brand-bg);border-radius:10px;line-height:1.6">' + scale.scoring + '</div>' : ''}
  ${scale.caution ? '<div style="font-size:12px;color:var(--red);margin-bottom:12px;padding:10px;background:var(--red-bg);border-radius:10px;line-height:1.6;font-weight:500">' + scale.caution + '<br><br>全国心理援助热线：400-161-9995</div>' : ''}

  <button class="btn btn-primary btn-sm btn-block" onclick="PsyAssessment.show()">返回量表列表</button>
  <button class="btn btn-outline btn-sm btn-block" style="margin-top:6px" onclick="App.navigate('mental')">去心理页面</button>
</div>`;
  },
};

// ===== 健康综合问卷 =====

const HealthSurveyView = {
  _current: 0,
  _answers: {},

  show() {
    this._current = 0;
    this._answers = {};
    this._render();
  },

  _render() {
    const sections = HealthSurvey.sections;
    const el = document.getElementById('main-content');
    if (this._current >= this._totalQuestions()) {
      this._showResult();
      return;
    }

    const q = this._currentQuestion();
    const sec = this._currentSection();
    const total = this._totalQuestions();
    const idx = this._current;
    const progress = Math.round((idx) / total * 100);

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
    <span style="font-size:13px;color:var(--text-soft)">${sec.icon} ${sec.title}</span>
    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${idx+1}/${total}</span>
  </div>
  <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:24px">
    <div style="height:100%;width:${progress}%;background:var(--brand);border-radius:2px;transition:width 0.3s"></div>
  </div>

  <div style="font-size:18px;font-weight:600;margin-bottom:20px">${q.text}</div>
  ${q.note ? '<div style="font-size:12px;color:var(--brand);margin-bottom:12px">' + q.note + '</div>' : ''}

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
    ${q.options.map(o => {
      const selected = Array.isArray(this._answers[q.id])
        ? this._answers[q.id].includes(o.label)
        : this._answers[q.id] === o.value;
      const color = selected ? 'var(--brand)' : 'var(--text-soft)';
      const bg = selected ? 'var(--brand-bg)' : 'var(--card)';
      const border = selected ? 'var(--brand)' : 'var(--line-light)';
      const safeLabel = o.label.replace(/'/g, "\\'");
      return '<div onclick="HealthSurveyView._pick(\'' + q.id + '\',\'' + safeLabel + '\',' + o.value + ')" style="padding:14px;border-radius:14px;border:1.5px solid ' + border + ';background:' + bg + ';cursor:pointer;font-size:15px;color:' + color + '">' + o.label + '</div>';
    }).join('')}
  </div>

  <div style="display:flex;gap:8px">
    ${idx > 0 ? '<button class="btn btn-outline btn-sm flex-1" onclick="HealthSurveyView._prev()">上一步</button>' : ''}
    <button class="btn btn-primary btn-sm flex-1" onclick="HealthSurveyView._next()">${idx < total-1 ? '下一步' : '查看结果'}</button>
  </div>
</div>`;
  },

  _totalQuestions() {
    return HealthSurvey.sections.reduce((s, sec) => s + sec.questions.length, 0);
  },

  _currentQuestion() {
    let count = 0;
    for (const sec of HealthSurvey.sections) {
      for (const q of sec.questions) {
        if (count === this._current) return q;
        count++;
      }
    }
    return null;
  },

  _currentSection() {
    let count = 0;
    for (const sec of HealthSurvey.sections) {
      for (const q of sec.questions) {
        if (count === this._current) return sec;
        count++;
      }
    }
    return null;
  },

  _pick(qid, label, value) {
    const q = this._allQuestions().find(q => q.id === qid);
    if (!q) return;
    if (q.type === 'multiple') {
      if (!this._answers[qid]) this._answers[qid] = [];
      const idx = this._answers[qid].indexOf(label);
      if (idx >= 0) this._answers[qid].splice(idx, 1);
      else this._answers[qid].push(label);
    } else {
      this._answers[qid] = value;
    }
    this._render();
  },

  _allQuestions() {
    return HealthSurvey.sections.flatMap(s => s.questions);
  },

  _prev() {
    if (this._current > 0) this._current--;
    this._render();
  },

  _next() {
    const q = this._currentQuestion();
    if (!q) return;
    const ans = this._answers[q.id];
    if (ans === undefined || ans === null || (Array.isArray(ans) && ans.length === 0)) {
      Helpers.toast('请先选择');
      return;
    }
    this._current++;
    this._render();
  },

  _showResult() {
    const result = HealthSurvey.assess(this._answers);
    const el = document.getElementById('main-content');

    // 保存到用户档案
    const p = Store.getProfile();
    if (p) {
      p.healthSurvey = {
        date: Helpers.formatDate(new Date(), 'YYYY-MM-DD'),
        score: result.pct,
        level: result.level,
        details: result.details,
        rawAnswers: this._answers,
      };
      Store.setProfile(p);
    }

    const color = result.level === '优秀' ? 'var(--green)' : result.level === '良好' ? 'var(--brand)' : result.level === '一般' ? 'var(--warn)' : 'var(--red)';

    el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:12px;color:var(--green);margin-bottom:4px">已保存到档案</div>
  <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:4px">${result.pct}</div>
  <div style="font-size:22px;font-weight:600;color:${color};margin-bottom:20px">${result.level}</div>

  <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:24px">
    <div style="height:100%;width:${result.pct}%;background:${color};border-radius:3px;transition:width 1s"></div>
  </div>

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px">
    ${result.details.map(d => {
      const pct = d.max > 0 ? Math.round(d.score/d.max*100) : 0;
      const c = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--brand)' : 'var(--warn)';
      return '<div style="background:var(--card);border-radius:14px;padding:12px;border:1px solid var(--line-light)">' +
        '<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px">' +
        '<span>' + d.title + '</span><span style="color:' + c + '">' + pct + '%</span></div>' +
        '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + c + ';border-radius:2px"></div></div></div>';
    }).join('')}
  </div>

  <button class="btn btn-primary btn-sm btn-block" onclick="App.navigate('home')">返回首页</button>
  <button class="btn btn-outline btn-sm btn-block" onclick="HealthSurveyView.show()" style="margin-top:6px">重新测评</button>
</div>`;
  },
};

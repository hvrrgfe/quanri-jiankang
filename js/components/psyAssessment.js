// ===== 心理自测（全球公认量表）=====

const PsyAssessment = {
  _currentScale: null,
  _currentQ: 0,
  _answers: {},

  show() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:4px">心理自测</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:16px">全球公认标准化量表 · 匿名 · 结果仅供你自己参考</div>
  ${this._scaleList()}
</div>`;
  },

  _scaleList() {
    const scales = MentalHealthDB.assessments;
    return Object.entries(scales).map(([key, s]) => `
    <div onclick="PsyAssessment._start('${key}')" style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light);cursor:pointer">
      <div style="font-size:15px;font-weight:600;margin-bottom:2px">${s.name}</div>
      <div style="font-size:12px;color:var(--text-soft)">${s.items.length}题 · ${s.timeFrame} · ${s.ref}</div>
      <div style="font-size:11px;color:var(--text-hint);margin-top:4px">${s.scoring}</div>
    </div>
    `).join('');
  },

  _start(key) {
    this._currentScale = key;
    this._currentQ = 0;
    this._answers = {};
    this._renderQ();
  },

  _renderQ() {
    const scale = MentalHealthDB.assessments[this._currentScale];
    if (!scale || this._currentQ >= scale.items.length) {
      this._showResult();
      return;
    }

    const q = scale.items[this._currentQ];
    const total = scale.items.length;
    const progress = Math.round(this._currentQ / total * 100);
    const el = document.getElementById('main-content');

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
    <span style="font-size:13px;font-weight:500;color:var(--brand)">${scale.name}</span>
    <span style="font-size:12px;color:var(--text-hint);margin-left:auto">${this._currentQ+1}/${total}</span>
  </div>
  <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px">
    <div style="height:100%;width:${progress}%;background:var(--brand);border-radius:2px;transition:width 0.3s"></div>
  </div>

  <div style="font-size:17px;font-weight:600;margin-bottom:20px;line-height:1.5">${q.text}</div>
  ${q.caution ? '<div style="font-size:12px;color:var(--red);margin-bottom:10px;padding:8px 10px;background:var(--red-bg);border-radius:8px">此题涉及自伤念头。如果选了右侧两项，建议寻求专业帮助。全国心理援助热线：400-161-9995</div>' : ''}

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
    ${q.options.map((opt, oi) => {
      const selected = this._answers[this._currentQ] === oi;
      return '<div onclick="PsyAssessment._pick(' + oi + ')" style="padding:12px 14px;border-radius:12px;border:1.5px solid ' + (selected ? 'var(--brand)' : 'var(--line-light)') + ';background:' + (selected ? 'var(--brand-bg)' : 'var(--card)') + ';cursor:pointer;font-size:14px;color:' + (selected ? 'var(--brand-dark)' : 'var(--text)') + '">' + opt + '</div>';
    }).join('')}
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
    const scale = MentalHealthDB.assessments[this._currentScale];
    if (!scale) return;

    let totalScore = 0;
    const optionCount = scale.items[0].options.length;

    scale.items.forEach((q, i) => {
      const ans = this._answers[i];
      if (ans === undefined) return;
      if (q.reverse) {
        totalScore += (optionCount - ans); // Reverse scoring
      } else {
        if (this._currentScale === 'cdrisc10') {
          totalScore += ans; // CD-RISC-10 uses 0-4
        } else {
          totalScore += ans; // PHQ-9 and GAD-7 use 0-3
        }
      }
    });

    // Save to profile
    const p = Store.getProfile();
    if (p) {
      if (!p.psyAssessments) p.psyAssessments = {};
      p.psyAssessments[this._currentScale] = {
        date: Helpers.formatDate(new Date(), 'YYYY-MM-DD'),
        score: totalScore,
        maxScore: (optionCount - 1) * scale.items.length,
      };
      Store.setProfile(p);
    }

    const maxPossible = (optionCount - 1) * scale.items.length;
    const pct = Math.round(totalScore / maxPossible * 100);

    let level = '';
    if (this._currentScale === 'phq9') {
      level = totalScore <= 4 ? '无明显抑郁' : totalScore <= 9 ? '可能有轻微抑郁' : totalScore <= 14 ? '可能有中度抑郁' : totalScore <= 19 ? '可能有中重度抑郁' : '可能有重度抑郁';
    } else if (this._currentScale === 'gad7') {
      level = totalScore <= 4 ? '无明显焦虑' : totalScore <= 9 ? '可能有轻度焦虑' : totalScore <= 14 ? '可能有中度焦虑' : '可能有重度焦虑';
    } else if (this._currentScale === 'rses') {
      level = totalScore <= 15 ? '自尊水平较低' : totalScore <= 25 ? '自尊水平中等' : '自尊水平较高';
    } else if (this._currentScale === 'cdrisc10') {
      level = totalScore <= 15 ? '心理弹性较低' : totalScore <= 25 ? '心理弹性中等' : '心理弹性较高';
    }

    const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--brand)' : 'var(--warn)';

    const el = document.getElementById('main-content');
    el.innerHTML = `
<div style="padding:0 4px;text-align:center">
  <div style="font-size:12px;color:var(--green);margin-bottom:4px">已保存到档案</div>
  <div style="font-size:14px;font-weight:500;color:var(--text-soft);margin-bottom:4px">${scale.name}</div>
  <div style="font-size:48px;font-weight:700;color:${color};margin-bottom:4px">${totalScore}</div>
  <div style="font-size:16px;font-weight:600;color:${color};margin-bottom:16px">${level}</div>

  <div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 1s"></div>
  </div>
  <div style="font-size:12px;color:var(--text-hint);margin-bottom:20px">得分 ${totalScore}/${maxPossible} · ${pct}%</div>

  <div style="font-size:12px;color:var(--text-soft);margin-bottom:20px;padding:10px;background:var(--brand-bg);border-radius:10px;line-height:1.6">${scale.note || ''}${this._currentScale === 'phq9' && this._answers[8] >= 2 ? '<br><br><strong style="color:var(--red)">你在这份问卷中表达了关于自伤的想法。请拨打全国心理援助热线：400-161-9995</strong>' : ''}</div>

  <button class="btn btn-primary btn-sm btn-block" onclick="PsyAssessment.show()">返回量表列表</button>
  <button class="btn btn-outline btn-sm btn-block" style="margin-top:6px" onclick="App.navigate('mental')">去心理页面</button>
</div>`;
  },
};

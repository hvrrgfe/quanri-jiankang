// ===== 呼吸引导 =====
// 交互式呼吸动画，无emoji

const BreathingGuide = {
  _timer: null,
  _step: 0,
  _totalSteps: 0,

  show(id) {
    const isEn = I18n.getLang() === 'en';
    const ex = MentalHealthDB.breathingExercises.find(e => e.id === id) || MentalHealthDB.breathingExercises[0];
    this._ex = ex;
    this._running = false;

    Helpers.openModal(`
<div style="width:280px;text-align:center">
  <div style="font-size:18px;font-weight:600;margin-bottom:2px">${ex.name}</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:16px">${ex.desc}</div>

  <div id="breath-circle" style="width:160px;height:160px;border-radius:50%;margin:0 auto 16px;background:var(--brand-bg);display:flex;align-items:center;justify-content:center;transition:all 0.3s">
    <span id="breath-label" style="font-size:20px;font-weight:700;color:var(--brand)">${isEn ? 'Ready' : '准备'}</span>
  </div>

  <div id="breath-counter" style="font-size:13px;color:var(--text-soft);margin-bottom:12px">${ex.rounds} ${isEn ? 'rounds' : '轮'}</div>

  <button id="breath-btn" class="btn btn-primary" onclick="BreathingGuide._toggle()" style="width:100%">${isEn ? 'Start' : '开始'}</button>
  <button class="btn btn-outline btn-sm" onclick="BreathingGuide._stop();Helpers.closeModal()" style="margin-top:6px;width:100%">${__('common.close')}</button>
</div>
    `);
  },

  _toggle() {
    const isEn = I18n.getLang() === 'en';
    const btn = document.getElementById('breath-btn');
    if (this._running) {
      this._stop();
      btn.textContent = isEn ? 'Resume' : '继续';
      return;
    }
    this._running = true;
    btn.textContent = isEn ? 'Pause' : '暂停';
    this._doRound(0);
  },

  _doRound(round) {
    const isEn = I18n.getLang() === 'en';
    const ex = this._ex;
    if (!this._running) return;
    if (round >= (ex.rounds || 2)) {
      this._stop();
      document.getElementById('breath-label').textContent = isEn ? 'Done' : '完成';
      document.getElementById('breath-btn').textContent = isEn ? 'Done' : '完成';
      document.getElementById('breath-circle').style.background = 'var(--green-light)';
      document.getElementById('breath-counter').textContent = isEn ? 'Great' : '很好';
      return;
    }

    const phases = [
      { label: isEn ? 'Inhale' : '吸气', time: 4, color: '#8EA9C4', scale: 1.3 },
      { label: isEn ? 'Hold' : '屏息', time: 7, color: '#B8A9C4', scale: 1.3 },
      { label: isEn ? 'Exhale' : '呼气', time: 8, color: '#C49A6C', scale: 0.8 },
    ];

    let phaseIdx = 0;
    const runPhase = () => {
      if (!this._running) return;
      if (phaseIdx >= phases.length) {
        const nextRound = round + 1;
        document.getElementById('breath-counter').textContent = (isEn ? 'Round ' : '第 ') + (nextRound + 1) + '/' + ex.rounds + (isEn ? '' : ' 轮');
        setTimeout(() => this._doRound(nextRound), 300);
        return;
      }
      const p = phases[phaseIdx];
      const circle = document.getElementById('breath-circle');
      const label = document.getElementById('breath-label');
      if (circle) circle.style.background = p.color;
      if (circle) circle.style.transform = 'scale(' + p.scale + ')';
      if (label) label.textContent = p.label;
      phaseIdx++;
      setTimeout(runPhase, p.time * 1000);
    };
    runPhase();
  },

  _stop() {
    this._running = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  },
};

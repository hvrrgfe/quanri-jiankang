// ===== 运动体态（完整版）=====

const FitnessView = {
  show() {
    const isEn = I18n.getLang() === 'en';
    const p = Store.getProfile();
    if (!p) { Helpers.toast(__('common.setProfile')); return; }
    this._generating = false;

    const hr = ExerciseRx.heartRateZones(p.age);
    const el = document.getElementById('main-content');

    let aiHtml = '';
    if (Store.getApiKey()) {
      const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
      const cached = Store.get('aiExercisePlan', {});
      if (cached.date === today && cached.weekPlan) {
        aiHtml = this._renderAIPlan(cached.weekPlan, cached.planName, cached.planReason, isEn) +
          '<div style="margin-top:6px;text-align:right"><button class="btn btn-soft btn-sm" onclick="FitnessView._regenAI()" style="font-size:11px">' + __('fitness.regen') + '</button></div>';
      } else {
        aiHtml = '<div style="text-align:center;padding:20px"><button class="btn btn-primary btn-sm" onclick="FitnessView._generatePlan()">' + __('fitness.generate') + '</button></div>';
      }
    }

    el.innerHTML = `
<div style="padding:0 4px">

  <!-- HR Zones -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">${__('fitness.heartRate')}</div>
    <div style="font-size:12px;color:var(--text-soft);margin-bottom:6px">${__('fitness.maxHR')} ${hr.maxHR} · ${__('fitness.resting')} ${hr.restingHR}</div>
    ${['warmup','fatBurn','aerobic','anaerobic','vo2max'].map(k => {
      const z = hr.zones[k];
      return '<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;color:var(--text-soft)">' +
        '<span>' + z.label + '</span><span>' + z.low + '-' + z.high + '</span></div>';
    }).join('')}
  </div>

  <!-- AI Weekly Plan -->
  ${Store.getApiKey() ? '<div id="ai-plan-container">' + aiHtml + '</div>' : ''}

  <!-- Check-in -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:14px;font-weight:600">${__('fitness.checkin')}</span>
      <button class="btn btn-soft btn-sm" onclick="FitnessView._checkin()" style="font-size:11px">${isEn ? 'Today' : '今日打卡'}</button>
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">
      ${this._renderCheckinDays(isEn)}
    </div>
  </div>

  <!-- Weight -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:14px;font-weight:600">${__('fitness.weight')}</span>
      <button class="btn btn-soft btn-sm" onclick="FitnessView._addWeight()" style="font-size:11px">${__('fitness.record')}</button>
    </div>
    ${this._renderWeightChart(isEn)}
  </div>

  <!-- Exercise Library -->
  <div style="font-size:15px;font-weight:600;margin-bottom:8px">${__('fitness.library')}</div>
  ${this._renderLibrary(isEn)}

  <!-- Sitting Alert -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);margin-top:12px">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">${__('fitness.sittingAlert')}</div>
    ${PostureDB.sedentaryAlerts.slice(0,5).map(a =>
      '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;color:var(--text-soft)">' +
      '<span style="color:var(--brand);font-weight:500">' + a.afterMin + 'min</span>' + a.action + '</div>'
    ).join('')}
  </div>

  <!-- Posture -->
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">${__('fitness.posture')}</div>
    ${PostureDB.sittingChecklist.map(c =>
      '<div style="padding:3px 0;font-size:13px;color:var(--text-soft)">' + c.item + '</div>'
    ).join('')}
  </div>

  <!-- Quick Start -->
  <div style="margin-top:16px">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">${__('fitness.quickStart')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${[
        { label: isEn ? 'Stretch' : '拉伸', action: 'stretch' },
        { label: isEn ? 'Micro' : '微运动', action: 'micro' },
        { label: isEn ? 'Cardio' : '有氧', action: 'cardio' },
        { label: isEn ? 'Strength' : '力量', action: 'strength' },
      ].map(b => `
      <div onclick="FitnessView._quick('${b.action}')" style="background:var(--card);border-radius:12px;padding:14px;text-align:center;border:1px solid var(--line-light);cursor:pointer;font-size:13px;font-weight:500">${b.label}</div>`).join('')}
    </div>
  </div>
</div>`;
  },

  _renderAIPlan(weekPlan, planName, planReason, isEn) {
    const nameHtml = (planName || planReason) ? '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">' +
      (planName ? '<span style="font-size:15px;font-weight:700">' + planName + '</span>' : '') +
      (planReason ? '<span style="font-size:12px;color:var(--text-soft)"> · ' + planReason + '</span>' : '') +
    '</div>' : '';
    return nameHtml +
      '<div style="font-size:14px;font-weight:600;margin-bottom:8px">' + __('fitness.aiPlan') + '</div>' +
      weekPlan.map(d => '<div style="background:var(--card);border-radius:12px;padding:10px;margin-bottom:4px;border:1px solid var(--line-light)">' +
        '<div style="font-size:13px;font-weight:600;color:var(--brand);margin-bottom:4px">' + d.day +
        (d.focus ? ' <span style="font-size:11px;color:var(--text-soft);font-weight:400">' + d.focus + '</span>' : '') +
        '</div>' +
        (d.items || []).map(i => '<div style="font-size:12px;color:var(--text-soft);padding:2px 0">' +
          '<span style="font-weight:500;color:var(--text)">' + i.name + '</span>' +
          (i.sets ? ' ' + i.sets + '×' + (i.reps || '') : '') +
          (i.duration ? ' ' + i.duration + 'min' : '') +
          (i.rpe ? ' RPE' + i.rpe : '') +
          (i.rest ? (isEn ? ' rest' : ' 休') + i.rest + 's' : '') +
          (i.note ? ' · ' + i.note : '') +
          '</div>'
        ).join('') +
        '</div>'
      ).join('');
  },

  _generatePlan() {
    const isEn = I18n.getLang() === 'en';
    if (this._generating) return;
    this._generating = true;
    const p = Store.getProfile();
    if (!p) { this._generating = false; Helpers.toast(__('common.setProfile')); return; }
    if (!Store.getApiKey()) { this._generating = false; Helpers.toast(__('common.setApiKey')); return; }
    const container = document.getElementById('ai-plan-container');
    if (container) {
      Helpers.showLoading(container, __('fitness.loading'), __('fitness.loadingSub'), 'exercise');
    }
    Helpers.setProgress(isEn ? 'Analyzing profile...' : '分析用户档案...');
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    setTimeout(() => Helpers.setProgress(isEn ? 'Matching training system...' : '匹配训练体系...'), 500);
    AIHealth.generate('exercise', p).then(result => {
      this._generating = false;
      const c = document.getElementById('ai-plan-container');
      if (c && result && result.weekPlan) {
        Store.set('aiExercisePlan', { date: today, weekPlan: result.weekPlan, planName: result.planName, planReason: result.planReason });
        c.innerHTML = this._renderAIPlan(result.weekPlan, result.planName, result.planReason, isEn) +
          '<div style="margin-top:6px;text-align:right"><button class="btn btn-soft btn-sm" onclick="FitnessView._regenAI()" style="font-size:11px">' + __('fitness.regen') + '</button></div>';
      } else if (c) {
        c.innerHTML = '<div style="text-align:center;padding:20px"><button class="btn btn-primary btn-sm" onclick="FitnessView._generatePlan()">' + __('fitness.generate') + '</button></div>';
      }
    }).catch(() => {
      this._generating = false;
      const c = document.getElementById('ai-plan-container');
      if (c) c.innerHTML = '<div style="text-align:center;padding:20px"><button class="btn btn-primary btn-sm" onclick="FitnessView._generatePlan()">' + __('fitness.generate') + '</button></div>';
      Helpers.toast(isEn ? 'API call failed' : 'API调用失败，检查密钥或网络');
    });
  },

  _regenAI() {
    Store.remove('aiExercisePlan');
    this._generatePlan();
  },

  _renderCheckinDays(isEn) {
    var checkins = Store.get('fitnessCheckins', {});
    var html = '';
    var now = new Date();
    var dayNames = isEn ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : ['日','一','二','三','四','五','六'];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var key = Helpers.formatDate(d, 'YYYY-MM-DD');
      var checked = checkins[key];
      html += '<div style="text-align:center;min-width:36px;padding:4px 0;border-radius:8px;background:' + (checked ? 'var(--green-light)' : 'transparent') + '">' +
        '<div style="font-size:10px;color:var(--text-hint)">' + dayNames[d.getDay()] + '</div>' +
        '<div style="font-size:13px;font-weight:' + (checked ? '700' : '400') + ';color:' + (checked ? 'var(--green)' : 'var(--text-soft)') + '">' + (checked ? '✓' : d.getDate()) + '</div></div>';
    }
    return html;
  },

  _renderWeightChart(isEn) {
    var weights = Store.get('weightLog', {});
    var bodyFat = Store.get('bodyFatLog', {});
    var days = Object.keys(weights).sort();
    var last30 = days.slice(-30);
    if (!last30.length) return '<div style="font-size:12px;color:var(--text-soft);text-align:center;padding:8px">' + (isEn ? 'No weight records yet' : '还没有体重记录，点击上方添加') + '</div>';

    var values = last30.map(function(d) { return weights[d]; });
    var min = Math.min.apply(null, values) - 2;
    var max = Math.max.apply(null, values) + 2;
    var range = max - min || 1;
    var w = 300, h = 90, pad = 25;

    var points = last30.map(function(d, i) {
      var x = pad + i * (w - pad * 2) / Math.max(last30.length - 1, 1);
      var y = h - pad - (values[i] - min) / range * (h - pad * 2);
      return x + ',' + y;
    });

    var lastVal = values[values.length - 1];
    var firstVal = values[0];
    var change = (lastVal - firstVal).toFixed(1);
    var changeColor = change > 0 ? 'var(--warn)' : change < 0 ? 'var(--green)' : 'var(--text-hint)';

    var fatHtml = '';
    var fatDays = Object.keys(bodyFat).sort().slice(-7);
    if (fatDays.length) {
      fatHtml = '<div style="font-size:11px;color:var(--text-soft);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">' +
        fatDays.map(function(d) {
          return '<span>' + d.slice(5) + ' <strong style="color:var(--purple)">' + bodyFat[d] + '%</strong></span>';
        }).join('') +
      '</div>';
    }

    return '<div style="font-size:12px;color:var(--text-soft);margin-bottom:4px;display:flex;justify-content:space-between">' +
      '<span>' + (isEn ? 'Last ' : '近') + last30.length + (isEn ? ' days' : '天趋势') + '</span>' +
      '<span><span style="color:var(--brand);font-weight:600">' + lastVal + 'kg</span> ' +
      '<span style="color:' + changeColor + ';font-size:11px">(' + (change > 0 ? '+' : '') + change + ')</span></span></div>' +
      '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:90px">' +
      '<path d="M' + points.join(' L') + '" stroke="var(--brand)" stroke-width="2" fill="none" stroke-linejoin="round"/>' +
      last30.map(function(d, i) {
        if (i % Math.max(1, Math.floor(last30.length / 5)) !== 0 && i !== last30.length - 1) return '';
        var x = pad + i * (w - pad * 2) / Math.max(last30.length - 1, 1);
        var y = h - pad - (values[i] - min) / range * (h - pad * 2);
        return '<text x="' + x + '" y="' + (h - 3) + '" text-anchor="middle" font-size="7" fill="var(--text-hint)">' + d.slice(5) + '</text>' +
          '<circle cx="' + x + '" cy="' + y + '" r="2" fill="var(--brand-light)"/>';
      }).join('') +
      '</svg>' + fatHtml;
  },

  _addWeight() {
    const isEn = I18n.getLang() === 'en';
    var p = Store.getProfile();
    var currentWeight = p ? p.weight : 60;
    var todayFat = Store.get('bodyFatLog', {});
    var lastFat = Object.values(todayFat).pop() || '';
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:10px">' + (isEn ? 'Record Body Data' : '记录身体数据') + '</div>' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:8px">' + (isEn ? 'Weight' : '体重') + '</div>' +
      '<input type="number" id="weight-input" class="form-input" step="0.1" placeholder="' + (isEn ? 'Weight (kg)' : '体重(kg)') + '" value="' + currentWeight + '" style="margin-bottom:10px;font-size:16px" onkeydown="if(event.key===\'Enter\')FitnessView._saveWeight()">' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:8px">' + (isEn ? 'Body Fat % (optional)' : '体脂率（可选）') + '</div>' +
      '<input type="number" id="bodyfat-input" class="form-input" step="0.1" placeholder="' + (isEn ? 'Body Fat %' : '体脂率(%)') + '" value="' + lastFat + '" style="margin-bottom:10px;font-size:16px" onkeydown="if(event.key===\'Enter\')FitnessView._saveWeight()">' +
      '<button class="btn btn-primary btn-sm btn-block" onclick="FitnessView._saveWeight()">' + __('common.save') + '</button>' +
      '<button class="btn btn-outline btn-sm btn-block" style="margin-top:6px" onclick="Helpers.closeModal()">' + __('common.cancel') + '</button>'
    );
    setTimeout(function() { var inp = document.getElementById('weight-input'); if (inp) inp.focus(); }, 100);
  },

  _saveWeight() {
    const isEn = I18n.getLang() === 'en';
    var val = parseFloat(document.getElementById('weight-input')?.value);
    if (!val || val < 20 || val > 300) { Helpers.toast(isEn ? 'Invalid weight' : '请输入有效体重'); return; }
    var fat = parseFloat(document.getElementById('bodyfat-input')?.value);
    var today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    var weights = Store.get('weightLog', {});
    weights[today] = val;
    Store.set('weightLog', weights);
    if (fat && fat > 0 && fat < 60) {
      var bf = Store.get('bodyFatLog', {});
      bf[today] = fat;
      Store.set('bodyFatLog', bf);
    }
    Helpers.closeModal();
    Helpers.toast(isEn ? 'Saved' : '已记录 ✓');
    this.show();
  },

  _checkin() {
    const isEn = I18n.getLang() === 'en';
    var today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    var checkins = Store.get('fitnessCheckins', {});
    if (checkins[today]) {
      delete checkins[today];
      Helpers.toast(isEn ? 'Cancelled' : '已取消打卡');
    } else {
      checkins[today] = true;
      Helpers.toast(isEn ? 'Checked in!' : '打卡成功 ✓');
    }
    Store.set('fitnessCheckins', checkins);
    this.show();
  },

  _quick(type) {
    const isEn = I18n.getLang() === 'en';
    const pools = {
      stretch: ExerciseDB.stretch.slice(0, 3),
      micro: ExerciseDB.micro.slice(0, 3),
      cardio: ExerciseDB.cardio.filter(c => c.duration <= 15).slice(0, 3),
      strength: [...ExerciseDB.upperBody.slice(0,2), ...ExerciseDB.lowerBody.slice(0,2)],
    };
    const items = pools[type] || [];
    if (!items.length) { Helpers.toast(isEn ? 'No recommendations' : '暂无推荐'); return; }
    const labels = { stretch:isEn ? 'Stretch' : '拉伸', micro:isEn ? 'Micro' : '微运动', cardio:isEn ? 'Cardio' : '有氧', strength:isEn ? 'Strength' : '力量' };
    const html = items.map(i =>
      '<div style="display:flex;justify-content:space-between;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px">' +
      '<span>' + i.name + '</span>' +
      '<span style="color:var(--text-soft)">' + ((i.duration||'') ? i.duration+(i.unit||'') : (i.sets||'')+(isEn?' sets x ':'组x')+(i.reps||'')+(i.unit||'')) + '</span></div>'
    ).join('');
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:8px">' + (labels[type]||type) + '</div>' +
      html +
      '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + (isEn ? 'Done' : '完成') + '</button></div>'
    );
  },

  _renderLibrary(isEn) {
    const cats = [
      { label: isEn ? 'Cardio' : '有氧', items: ExerciseDB.cardio, color: '#E88A6A' },
      { label: isEn ? 'Upper' : '上肢', items: ExerciseDB.upperBody, color: '#C49A6C' },
      { label: isEn ? 'Lower' : '下肢', items: ExerciseDB.lowerBody, color: '#7A9A6E' },
      { label: isEn ? 'Core' : '核心', items: ExerciseDB.core, color: '#B8A9C4' },
      { label: isEn ? 'Stretch' : '拉伸', items: ExerciseDB.stretch, color: '#8EA9C4' },
      { label: isEn ? 'Micro' : '微运动', items: ExerciseDB.micro, color: '#F0D67A' },
    ];

    return cats.map(c => `
<div style="margin-bottom:8px">
  <div onclick="FitnessView._toggleCat('${c.label}')" style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:${c.color};cursor:pointer;padding:4px 0">
    <span id="arrow-${c.label}" style="transition:transform 0.2s">&#9654;</span>
    ${c.label}（${c.items.length}${isEn ? ' items' : '种'}）
  </div>
  <div id="cat-${c.label}" style="display:none;margin-top:4px">
    ${c.items.slice(0,8).map(i =>
      '<div onclick="FitnessView._showDetail(\'' + c.label + '\',' + c.items.indexOf(i) + ')" style="padding:6px 10px;margin-bottom:2px;background:var(--card);border-radius:8px;border:1px solid var(--line-light);cursor:pointer;font-size:13px;display:flex;justify-content:space-between">' +
      '<span>' + i.name + '</span>' +
      '<span style="color:var(--text-soft)">' + ((i.duration||'') ? i.duration+(i.unit||'') : (i.sets||'')+(isEn?' sets x ':'组x')+(i.reps||'')+(i.unit||'')) + '</span></div>'
    ).join('')}
  </div>
</div>`).join('');
  },

  _toggleCat(label) {
    const el = document.getElementById('cat-' + label);
    const arrow = document.getElementById('arrow-' + label);
    if (!el) return;
    const show = el.style.display !== 'block';
    el.style.display = show ? 'block' : 'none';
    if (arrow) arrow.style.transform = show ? 'rotate(90deg)' : '';
  },

  _showDetail(cat, idx) {
    const isEn = I18n.getLang() === 'en';
    const pools = { 'Cardio': ExerciseDB.cardio, 'Upper': ExerciseDB.upperBody, 'Lower': ExerciseDB.lowerBody,
      'Core': ExerciseDB.core, 'Stretch': ExerciseDB.stretch, 'Micro': ExerciseDB.micro,
      '有氧': ExerciseDB.cardio, '上肢': ExerciseDB.upperBody, '下肢': ExerciseDB.lowerBody,
      '核心': ExerciseDB.core, '拉伸': ExerciseDB.stretch, '微运动': ExerciseDB.micro };
    const items = pools[cat];
    const item = items && items[idx];
    if (!item) return;
    const steps = item.howTo || [];
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">' + item.name + '</div>' +
      '<div style="font-size:12px;color:var(--text-soft);margin-bottom:8px">' + (item.desc || '') + (item.difficulty ? ' · ' + (isEn ? 'Difficulty ' : '难度') + item.difficulty : '') + '</div>' +
      '<div style="font-size:12px;line-height:1.7;margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap">' +
      (item.duration ? '<span style="background:var(--brand-bg);padding:2px 8px;border-radius:6px">⏱ ' + item.duration + item.unit + '</span>' : '') +
      (item.sets ? '<span style="background:var(--brand-bg);padding:2px 8px;border-radius:6px">' + item.sets + (isEn ? ' sets x ' : '组 x ') + item.reps + item.unit + '</span>' : '') +
      (item.target ? '<span style="background:var(--brand-bg);padding:2px 8px;border-radius:6px">' + item.target.join('/') + '</span>' : '') +
      (item.met ? '<span style="background:var(--brand-bg);padding:2px 8px;border-radius:6px">MET ' + item.met + '</span>' : '') +
      '</div>' +
      (steps.length ? '<div style="border-top:1px solid var(--line-light);padding-top:8px;margin-bottom:8px">' +
        steps.map((s, i) => '<div style="display:flex;gap:6px;padding:3px 0;font-size:13px"><span style="width:18px;height:18px;border-radius:50%;background:var(--brand-bg);color:var(--brand);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;margin-top:2px">' + (i+1) + '</span><span style="flex:1">' + s + '</span></div>').join('') +
        '</div>' : '') +
      (item.modifier ? '<div style="font-size:12px;color:var(--green);margin-bottom:4px">' + (isEn ? 'Easier: ' : '降阶：') + item.modifier + '</div>' : '') +
      (item.caution ? '<div style="font-size:12px;color:var(--red)">' + (isEn ? 'Caution: ' : '注意：') + item.caution + '</div>' : '') +
      '<div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('common.close') + '</button></div>'
    );
  },
};

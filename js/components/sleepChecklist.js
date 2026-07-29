// ===== 睡眠健康（完整版）=====

const SleepChecklist = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const el = document.getElementById('main-content');
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');

    // 加载今日睡眠记录
    const sleepLog = Store.get('sleepLog', {});
    const todayLog = sleepLog[today] || {};

    // 加载清单完成情况
    const saved = Store.get('sleepChecklist', {});
    const doneSet = new Set(saved[today] || []);

    // 计算本周睡眠统计
    const weekStats = this._weekStats(sleepLog);

    // 检查清单
    const items = SleepDB.hygieneChecklist;
    const allItems = [...items.evening, ...items.environment];
    const doneCount = doneSet.size;
    const total = allItems.length;
    const pct = Math.round(doneCount / total * 100);

    // 时型建议
    const ctMap = { morning: '早间型（百灵鸟）', intermediate: '中间型', evening: '晚间型（猫头鹰）' };
    const ct = SleepDB.chronotypes.find(c => c.type === (p.chronotype || 'intermediate'));
    const ctLabel = ctMap[p.chronotype] || '中间型';

    el.innerHTML = Icons.replace(`
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:2px">睡眠</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:12px">${ctLabel} · 自然入睡 ${ct?.naturalBed || '22:00-23:30'} · 自然醒 ${ct?.naturalWake || '6:30-8:00'}</div>

  <!-- 昨晚记录 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">昨晚睡眠</div>
    <div style="display:flex;gap:12px">
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-hint)">入睡</div>
        <input type="time" id="sl-bed" class="form-input" style="text-align:center;font-size:16px;font-weight:600;padding:6px" value="${todayLog.bedTime || p.preferBedTime || '23:00'}" onchange="SleepChecklist._saveLog()">
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-hint)">起床</div>
        <input type="time" id="sl-wake" class="form-input" style="text-align:center;font-size:16px;font-weight:600;padding:6px" value="${todayLog.wakeTime || p.preferWakeTime || '07:00'}" onchange="SleepChecklist._saveLog()">
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:11px;color:var(--text-hint)">质量</div>
        <div style="display:flex;gap:2px;justify-content:center;margin-top:4px">
          ${[1,2,3,4,5].map(i =>
            `<span onclick="SleepChecklist._setQuality(${i})" style="cursor:pointer;font-size:20px;opacity:${(todayLog.quality||0) >= i ? '1' : '0.2'}">${'★'}</span>`
          ).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- 本周统计 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">本周睡眠</div>
    <div style="display:flex;gap:8px">
      <div style="flex:1;text-align:center">
        <div style="font-size:20px;font-weight:700;color:var(--brand)">${weekStats.avgBed || '—'}</div>
        <div style="font-size:10px;color:var(--text-hint)">平均入睡</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:20px;font-weight:700;color:var(--brand)">${weekStats.avgWake || '—'}</div>
        <div style="font-size:10px;color:var(--text-hint)">平均起床</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:20px;font-weight:700;color:${weekStats.avgHours >= 7 ? 'var(--green)' : 'var(--warn)'}">${weekStats.avgHours || '—'}</div>
        <div style="font-size:10px;color:var(--text-hint)">平均时长(h)</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:20px;font-weight:700;color:var(--brand)">${weekStats.avgQuality || '—'}</div>
        <div style="font-size:10px;color:var(--text-hint)">平均质量</div>
      </div>
    </div>
  </div>

  <!-- 睡前清单 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:14px;font-weight:600">睡前准备</span>
      <span style="font-size:12px;color:var(--text-soft)">${doneCount}/${total} · ${pct}%</span>
    </div>
    <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:10px">
      <div style="height:100%;width:${pct}%;background:var(--purple);border-radius:2px;transition:width 0.5s"></div>
    </div>
    ${allItems.map(item => {
      const checked = doneSet.has(item.item);
      return `
    <div onclick="SleepChecklist._toggle('${item.item.replace(/'/g, "\\'")}')" style="display:flex;align-items:center;gap:10px;padding:6px 8px;margin-bottom:2px;border-radius:10px;cursor:pointer">
      <div style="width:18px;height:18px;border-radius:50%;border:2px solid ${checked ? 'var(--green)' : 'var(--line)'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;color:white">${checked ? '✓' : ''}</div>
      <div style="flex:1;font-size:13px;color:${checked ? 'var(--text-hint)' : 'var(--text)'}">${item.item}</div>
    </div>`;
    }).join('')}
  </div>

  <!-- 科学依据 -->
  <div style="font-size:11px;color:var(--text-hint);padding:8px;text-align:center">
    基于 National Sleep Foundation 2025 推荐 · 睡前1小时停用电子设备
  </div>
</div>`);
  },

  _weekStats(log) {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = Helpers.formatDate(d, 'YYYY-MM-DD');
      const entry = log[key];
      if (entry && entry.bedTime && entry.wakeTime) {
        days.push(entry);
      }
    }
    if (!days.length) return { avgBed: '—', avgWake: '—', avgHours: '—', avgQuality: '—' };

    // 平均入睡时间（转换为分钟）
    const beds = days.filter(d => d.bedTime).map(d => {
      const [h, m] = d.bedTime.split(':').map(Number);
      return h * 60 + m;
    });
    const avgBedMin = Math.round(beds.reduce((s, v) => s + v, 0) / beds.length);
    const avgBedH = Math.floor(avgBedMin / 60);
    const avgBedM = avgBedMin % 60;
    const avgBed = avgBedH.toString().padStart(2, '0') + ':' + avgBedM.toString().padStart(2, '0');

    // 平均起床时间
    const wakes = days.filter(d => d.wakeTime).map(d => {
      const [h, m] = d.wakeTime.split(':').map(Number);
      return h * 60 + m;
    });
    const avgWakeMin = Math.round(wakes.reduce((s, v) => s + v, 0) / wakes.length);
    const avgWakeH = Math.floor(avgWakeMin / 60);
    const avgWakeM = avgWakeMin % 60;
    const avgWake = avgWakeH.toString().padStart(2, '0') + ':' + avgWakeM.toString().padStart(2, '0');

    // 平均时长
    const hours = days.map(d => {
      const [bh, bm] = d.bedTime.split(':').map(Number);
      const [wh, wm] = d.wakeTime.split(':').map(Number);
      let diff = (wh * 60 + wm) - (bh * 60 + bm);
      if (diff < 0) diff += 24 * 60;
      return diff / 60;
    });
    const avgHours = (hours.reduce((s, v) => s + v, 0) / hours.length).toFixed(1);

    // 平均质量
    const qual = days.filter(d => d.quality).map(d => d.quality);
    const avgQuality = qual.length ? (qual.reduce((s, v) => s + v, 0) / qual.length).toFixed(1) : '—';

    return { avgBed, avgWake, avgHours, avgQuality };
  },

  _saveLog() {
    const bedTime = document.getElementById('sl-bed')?.value || '';
    const wakeTime = document.getElementById('sl-wake')?.value || '';
    if (!bedTime && !wakeTime) return;
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const log = Store.get('sleepLog', {});
    if (!log[today]) log[today] = {};
    if (bedTime) log[today].bedTime = bedTime;
    if (wakeTime) log[today].wakeTime = wakeTime;
    Store.set('sleepLog', log);
  },

  _setQuality(v) {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const log = Store.get('sleepLog', {});
    if (!log[today]) log[today] = {};
    log[today].quality = v;
    Store.set('sleepLog', log);
    this.show();
  },

  _toggle(item) {
    const saved = Store.get('sleepChecklist', {});
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    if (!saved[today]) saved[today] = [];
    const idx = saved[today].indexOf(item);
    if (idx >= 0) saved[today].splice(idx, 1);
    else saved[today].push(item);
    Store.set('sleepChecklist', saved);
    this.show();
  },
};

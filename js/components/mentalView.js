// ===== 心理健康视图（完整版）=====

const MentalView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const el = document.getElementById('main-content');
    el.innerHTML = Icons.replace(`
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:16px">心理</div>

  <!-- 呼吸引导 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">呼吸练习</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${MentalHealthDB.breathingExercises.slice(0,3).map(b =>
        '<div onclick="BreathingGuide.show(\'' + b.id + '\')" style="flex:1;min-width:80px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">' +
        '<div style="font-size:13px;font-weight:500">' + b.name + '</div>' +
        '<div style="font-size:11px;color:var(--text-soft);margin-top:2px">' + b.desc + '</div></div>'
      ).join('')}
    </div>
  </div>

  <!-- 今日意图 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)" onclick="MentalView._pickIntention()">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">今日意图</div>
    <div style="font-size:12px;color:var(--text-soft)">选一个词作为今天的指引</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
      ${MentalHealthDB.intentionPool.slice(0,6).map(i =>
        '<span style="padding:4px 12px;border-radius:16px;background:var(--brand-bg);font-size:12px;cursor:pointer" onclick="event.stopPropagation();MentalView._setIntention(\'' + i.text + '\')">' + i.text + '</span>'
      ).join('')}
    </div>
  </div>

  <!-- 感恩练习 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)" onclick="MentalView._gratitude()">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">感恩三秒</div>
    <div style="font-size:12px;color:var(--text-soft)">想一件值得感恩的事</div>
    <div style="font-size:11px;color:var(--text-hint);margin-top:4px">持续10周后正向情绪显著提升</div>
  </div>

  <!-- 认知工具 -->
  <div style="font-size:14px;font-weight:600;margin-bottom:8px">认知小工具</div>
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    ${MentalHealthDB.cbtBasics.cognitiveDistortions.slice(0, 4).map(d => `
    <div style="padding:6px 0;border-bottom:1px solid var(--line-light);font-size:13px">
      <div style="font-weight:500">${d.name}</div>
      <div style="color:var(--text-soft);font-size:12px;margin-top:1px">${d.antidote}</div>
    </div>`).join('')}
  </div>

  <!-- 底部提示 -->
  <div style="margin-top:16px;font-size:12px;color:var(--text-hint);padding:8px;text-align:center">
    日常心理卫生 = 像刷牙一样每天几分钟
  </div>
</div>`);
  },

  _pickIntention() {
    const pool = MentalHealthDB.intentionPool;
    const chips = pool.map(i => '<span class="chip" style="padding:6px 16px;border-radius:20px;margin:3px;font-size:14px;cursor:pointer" onclick="MentalView._setIntention(\'' + i.text + '\')">' + i.text + '</span>').join('');
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">今日意图</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:16px">想成为一个怎样的人？</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chips + '</div>' +
      '<div style="margin-top:16px;text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">算了</button></div>'
    );
  },

  _setIntention(text) {
    Helpers.closeModal();
    Helpers.toast('今日意图：' + text);
    // 保存到今日记录
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('mentalDaily', {});
    if (!saved[today]) saved[today] = {};
    saved[today].intention = text;
    Store.set('mentalDaily', saved);
  },

  _gratitude() {
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:8px">感恩三秒</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:12px">在心里想一件今天值得感恩的事</div>' +
      '<div style="background:var(--brand-bg);border-radius:14px;padding:16px;font-size:14px;line-height:1.7;margin-bottom:8px">' +
      '1. 停下来<br>2. 想一件好事（可以很小）<br>3. 感受一下这个感觉<br>4. 想想为什么这件事会发生</div>' +
      '<div style="font-size:11px;color:var(--text-hint);text-align:center">Emmons & McCullough 2003 · 持续10周效果显著</div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">好了</button></div>'
    );
  },
};

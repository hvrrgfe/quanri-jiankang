// ===== 心理健康视图（循证工具箱版）=====
// 升级：情绪追踪 / 接地练习 / 正念 / 行为激活 / 自我慈悲 / 交互式认知重构
// 每项功能均标注实证研究来源

const MentalView = {
  show() {
    const isEn = I18n.getLang() === 'en';
    const p = Store.getProfile();
    if (!p) { Helpers.toast(__('common.setProfile')); return; }

    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const daily = Store.get('mentalDaily', {});
    const savedMood = daily[today]?.mood || null;
    const db = MentalHealthDB;

    // 近 7 日心情记录
    const moodSeq = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const ds = Helpers.formatDate(d, 'YYYY-MM-DD');
      moodSeq.push({ date: ds.slice(5), mood: daily[ds]?.mood || null });
    }

    const el = document.getElementById('main-content');
    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:4px">${__('mental.title')}</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:16px">${isEn ? 'Evidence-based daily mental hygiene tools' : '循证心理工具箱 · 像刷牙一样每天几分钟'}</div>

  <!-- 今日心情打卡 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">${isEn ? 'Today\'s Mood Check-in' : '今日心情打卡'}</div>
    <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px">${isEn ? 'Noticing emotions is the first step of regulation (emotion labeling research)' : '觉察情绪是调节的第一步(情绪标注研究:说出情绪可降低杏仁核激活)'}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${db.emotions.map(e => `
        <div onclick="MentalView._setMood('${e.label}')" style="flex:1;min-width:56px;text-align:center;padding:8px 4px;border-radius:12px;cursor:pointer;border:1.5px solid ${savedMood === e.label ? 'var(--brand)' : 'var(--line-light)'};background:${savedMood === e.label ? 'var(--brand-bg)' : 'transparent'}">
          <div style="font-size:20px">${e.icon}</div>
          <div style="font-size:11px;color:var(--text-soft);margin-top:2px">${e.label}</div>
        </div>`).join('')}
    </div>
    <div id="mood-msg" style="font-size:12px;color:var(--brand-dark);margin-top:8px;min-height:16px">
      ${savedMood ? (isEn ? 'Recorded: ' : '今日已记录: ') + savedMood : ''}
    </div>
  </div>

  <!-- 近7日心情 -->
  <div style="display:flex;gap:6px;margin-bottom:12px;background:var(--card);border-radius:16px;padding:12px 14px;border:1px solid var(--line-light)">
    ${moodSeq.map(m => `
      <div style="flex:1;text-align:center">
        <div style="font-size:16px">${m.mood ? (db.emotions.find(e => e.label === m.mood)?.icon || '·') : '·'}</div>
        <div style="font-size:9px;color:var(--text-hint);margin-top:2px">${m.date}</div>
      </div>`).join('')}
  </div>

  <!-- 呼吸引导 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">${__('mental.breathing')} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(SFU 2023 · 8周降焦虑10分)</span></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${db.breathingExercises.slice(0,3).map(b =>
        '<div onclick="BreathingGuide.show(\'' + b.id + '\')" style="flex:1;min-width:80px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">' +
        '<div style="font-size:13px;font-weight:500">' + b.name + '</div>' +
        '<div style="font-size:11px;color:var(--text-soft);margin-top:2px">' + b.desc + '</div></div>'
      ).join('')}
    </div>
  </div>

  <!-- 接地练习 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);cursor:pointer" onclick="MentalView._showGrounding()">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">5-4-3-2-1 感官接地 <span style="font-size:10px;color:var(--text-hint);font-weight:400">急性焦虑 · 紧急刹车</span></div>
    <div style="font-size:12px;color:var(--text-soft)">${isEn ? 'Anxiety first aid: 5 see · 4 touch · 3 hear · 2 smell · 1 taste' : '焦虑急救:5看·4触·3听·2闻·1尝,把感官拉回当下'}</div>
  </div>

  <!-- 正念 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">${isEn ? 'Mindfulness' : '正念练习'} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(MBCT:复发率降约50%)</span></div>
    <div style="display:flex;gap:6px">
      ${db.mindfulnessPractices.map(m =>
        '<div onclick="MentalView._showSteps(\'' + m.id + '\',\'mindfulness\')" style="flex:1;min-width:90px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">' +
        '<div style="font-size:13px;font-weight:500">' + m.name + '</div>' +
        '<div style="font-size:11px;color:var(--text-soft);margin-top:2px">' + m.duration + '秒</div></div>'
      ).join('')}
    </div>
  </div>

  <!-- 今日意图 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)" onclick="MentalView._pickIntention()">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">${__('mental.intention')}</div>
    <div style="font-size:12px;color:var(--text-soft)">${isEn ? 'Pick a word to guide your day' : '选一个词作为今天的指引'}</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
      ${db.intentionPool.slice(0,6).map(i =>
        '<span style="padding:4px 12px;border-radius:16px;background:var(--brand-bg);font-size:12px;cursor:pointer" onclick="event.stopPropagation();MentalView._setIntention(\'' + i.text + '\')">' + i.text + '</span>'
      ).join('')}
    </div>
  </div>

  <!-- 感恩 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">${__('mental.gratitude')} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(Emmons 2003 · Seligman 2005)</span></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <div onclick="MentalView._gratitude()" style="flex:1;min-width:80px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">
        <div style="font-size:13px;font-weight:500">三件好事</div>
        <div style="font-size:11px;color:var(--text-soft);margin-top:2px">2周效果持续3-6月</div>
      </div>
      <div onclick="MentalView._gratitudeFast()" style="flex:1;min-width:80px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">
        <div style="font-size:13px;font-weight:500">感恩三秒</div>
        <div style="font-size:11px;color:var(--text-soft);margin-top:2px">高频低阻版</div>
      </div>
      <div onclick="MentalView._gratitudeVisit()" style="flex:1;min-width:80px;background:var(--brand-bg);border-radius:12px;padding:10px;text-align:center;cursor:pointer">
        <div style="font-size:13px;font-weight:500">感恩拜访</div>
        <div style="font-size:11px;color:var(--text-soft);margin-top:2px">一次幸福一个月</div>
      </div>
    </div>
  </div>

  <!-- 行为激活 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);cursor:pointer" onclick="MentalView._showSteps('ba','behavioralActivation')">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">${isEn ? 'Behavioral Activation' : '行为激活:先行动,再感受'} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(Richards 2016 Lancet 荟萃分析)</span></div>
    <div style="font-size:12px;color:var(--text-soft)">${isEn ? 'Low mood? Act first, feelings follow' : '情绪低落时:不靠"有感觉"才行动,行动会带来感觉'}</div>
  </div>

  <!-- 自我慈悲 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);cursor:pointer" onclick="MentalView._showSteps('sc','selfCompassion')">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">${isEn ? 'Self-Compassion' : '自我慈悲三句话'} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(Neff 2003 · 对抗自我批评)</span></div>
    <div style="font-size:12px;color:var(--text-soft)">${isEn ? 'Treat yourself like a good friend' : '像对待好朋友一样对待自己'}</div>
  </div>

  <!-- 认知重构 -->
  <div style="font-size:14px;font-weight:600;margin-bottom:8px">${__('mental.cbt')} <span style="font-size:10px;color:var(--text-hint);font-weight:400">(2周可降低自动思维强度)</span></div>
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    <div onclick="MentalView._thoughtRecord()" style="background:var(--brand-bg);border-radius:12px;padding:12px;margin-bottom:10px;cursor:pointer">
      <div style="font-size:13px;font-weight:600;margin-bottom:2px">${isEn ? 'Thought Record' : '思维记录表(交互版)'}</div>
      <div style="font-size:11.5px;color:var(--text-soft)">${isEn ? 'Situation → Automatic thought → Evidence → Alternative' : '情境 → 自动思维 → 证据检验 → 替代思维'}</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px" id="distortion-list"></div>
    <div style="font-size:11px;color:var(--text-hint);text-align:center;padding-top:6px;border-top:1px solid var(--line-light)">
      ${isEn ? 'Tap a distortion to see its antidote' : '点认知扭曲看对应的"解药"(共10种)'}
    </div>
  </div>

  <!-- 心理测评 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);cursor:pointer;margin-top:12px" onclick="App.navigate('assess')">
    <div style="font-size:14px;font-weight:600;margin-bottom:2px">${__('mental.assessment')}</div>
    <div style="font-size:12px;color:var(--text-soft)">PHQ-9 · GAD-7 · ${isEn ? 'Self-esteem · Resilience' : '自尊 · 心理弹性'} · 80+ 量表</div>
  </div>

  <!-- Footer -->
  <div style="margin-top:16px;font-size:12px;color:var(--text-hint);padding:8px;text-align:center;line-height:1.8">
    ${isEn ? 'Daily mental hygiene = a few minutes a day, like brushing your teeth' : '日常心理卫生 = 像刷牙一样每天几分钟'}
    <br>${isEn ? 'Evidence sources: SFU 2023 · Emmons 2003 · Seligman 2005 · Neff 2003 · Richards 2016 · MBCT 2000' : '研究来源:SFU 2023 · Emmons 2003 · Seligman 2005 · Neff 2003 · Richards 2016(Lancet) · Teasdale 2000(MBCT)'}
  </div>
</div>`;
    // 认知扭曲 chips(点击展示解药)
    const list = document.getElementById('distortion-list');
    if (list) {
      list.innerHTML = db.cbtBasics.cognitiveDistortions.map(d =>
        '<span onclick="MentalView._distortion(\'' + d.name + '\')" style="padding:5px 11px;border-radius:14px;background:var(--brand-bg);font-size:12px;cursor:pointer;border:1px solid var(--line-light)">' + d.name + '</span>'
      ).join('');
    }
  },

  // ---- 今日心情 ----
  _setMood(label) {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('mentalDaily', {});
    if (!saved[today]) saved[today] = {};
    saved[today].mood = label;
    Store.set('mentalDaily', saved);
    const msg = document.getElementById('mood-msg');
    if (msg) msg.textContent = '已记录: ' + label + ' · 觉察即是调节的开始 ✓';
    Helpers.toast('心情已记录: ' + label);
    setTimeout(() => MentalView.show(), 400);
  },

  // ---- 步骤模态框(正念/行为激活/自我慈悲/接地) ----
  _showSteps(id, type) {
    const db = MentalHealthDB;
    let item = null;
    if (type === 'mindfulness') item = db.mindfulnessPractices.find(x => x.id === id);
    if (type === 'behavioralActivation') item = db.behavioralActivation;
    if (type === 'selfCompassion') item = db.selfCompassion;
    if (type === 'grounding') item = db.groundingExercises.find(x => x.id === id);
    if (!item) return;
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">' + item.name + '</div>' +
      (item.desc ? '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">' + item.desc + '</div>' : '<div style="margin-bottom:8px"></div>') +
      '<div style="background:var(--brand-bg);border-radius:14px;padding:14px;font-size:13.5px;line-height:2;margin-bottom:10px">' +
      item.steps.map((s, i) => (i + 1) + '. ' + s).join('<br>') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-soft);line-height:1.7;margin-bottom:8px">' + (isEn ? 'Evidence: ' : '循证依据: ') + item.science + '</div>' +
      (item.caution ? '<div style="font-size:11px;color:var(--warn);margin-bottom:8px">⚠ ' + item.caution + '</div>' : '') +
      '<div style="text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + (isEn ? 'Done' : '完成') + '</button></div>'
    );
  },

  _showGrounding() {
    this._showSteps('G01', 'grounding');
  },

  // ---- 感恩 ----
  _gratitude() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:8px">' + __('home.gratitudeModal.title') + '</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:12px">' + __('home.gratitudeModal.desc') + '</div>' +
      '<div style="background:var(--brand-bg);border-radius:14px;padding:16px;font-size:14px;line-height:1.7;margin-bottom:8px">' +
      (isEn ? '1. Pause<br>2. Think of something good (even small)<br>3. Feel it<br>4. Why did this happen?' : '1. 停下来<br>2. 想一件好事(可以很小)<br>3. 感受一下这个感觉<br>4. 想想为什么这件事会发生') + '</div>' +
      '<div style="font-size:11px;color:var(--text-hint);text-align:center">Seligman 2005 · 持续2周效果可持续3-6个月</div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('home.gratitudeModal.done') + '</button></div>'
    );
  },

  _gratitudeFast() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:8px">感恩三秒</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:12px">' + (isEn ? 'The simplest version — 3 seconds' : '最简单版——只花3秒') + '</div>' +
      '<div style="background:var(--brand-bg);border-radius:14px;padding:16px;font-size:14px;line-height:2;margin-bottom:8px">1. 停下手上的事<br>2. 想一件今天的好事(可以非常小)<br>3. 在心里过一遍"谢谢"</div>' +
      '<div style="font-size:11px;color:var(--text-hint);text-align:center">' + (isEn ? 'High frequency, low friction — easier to sustain' : '高频低阻,更容易坚持') + '</div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('home.gratitudeModal.done') + '</button></div>'
    );
  },

  _gratitudeVisit() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:8px">感恩拜访</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:12px">' + (isEn ? 'Write a letter or visit someone you appreciate' : '给一个想感谢的人写封信,或当面表达') + '</div>' +
      '<div style="background:var(--brand-bg);border-radius:14px;padding:16px;font-size:14px;line-height:2;margin-bottom:8px">1. 选一个人:ta帮过你什么?<br>2. 写下具体的事(越具体越好)<br>3. 如果可能,当面读给ta听</div>' +
      '<div style="font-size:11px;color:var(--text-hint);text-align:center">Seligman 2005 · 即使只做一次,幸福感可维持一个月</div>' +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('home.gratitudeModal.done') + '</button></div>'
    );
  },

  // ---- 认知扭曲 ----
  _distortion(name) {
    const d = MentalHealthDB.cbtBasics.cognitiveDistortions.find(x => x.name === name);
    if (!d) return;
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">' + d.name + '</div>' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">' + d.desc + '</div>' +
      '<div style="background:var(--green-light);border-radius:14px;padding:14px;font-size:13.5px;line-height:1.8;margin-bottom:8px"><b>' + (isEn ? 'Antidote: ' : '解药: ') + '</b>' + d.antidote + '</div>' +
      '<div style="text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + (isEn ? 'Got it' : '明白了') + '</button></div>'
    );
  },

  // ---- 思维记录表(交互版,CBT核心工具) ----
  _thoughtRecord() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">' + (isEn ? 'Thought Record' : '思维记录表') + '</div>' +
      '<div style="font-size:12px;color:var(--text-soft);margin-bottom:14px">' + (isEn ? 'Situation → Thought → Evidence → Alternative (CBT core tool)' : '情境 → 自动思维 → 证据检验 → 替代思维(CBT核心工具)') + '</div>' +
      '<div class="form-group"><label class="form-label">1. ' + (isEn ? 'Situation (objective)' : '情境(客观描述发生了什么)') + '</label>' +
      '<input class="form-input" id="tr-situation" placeholder="' + (isEn ? 'What happened?' : '发生了什么?') + '"></div>' +
      '<div class="form-group"><label class="form-label">2. ' + (isEn ? 'Automatic thought' : '自动思维(心里第一时间冒出的想法)') + '</label>' +
      '<input class="form-input" id="tr-thought" placeholder="' + (isEn ? 'What went through your mind?' : '我当时在想什么?') + '"></div>' +
      '<div class="form-group"><label class="form-label">3. ' + (isEn ? 'Evidence for & against' : '证据(支持这个想法的证据?反对的证据?)') + '</label>' +
      '<input class="form-input" id="tr-evidence" placeholder="' + (isEn ? 'Facts only...' : '只写事实...') + '"></div>' +
      '<div class="form-group"><label class="form-label">4. ' + (isEn ? 'Alternative thought' : '替代思维(更客观平衡的想法)') + '</label>' +
      '<input class="form-input" id="tr-alternative" placeholder="' + (isEn ? 'What else could be true?' : '还有别的可能吗?') + '"></div>' +
      '<button class="btn btn-primary btn-block" onclick="MentalView._recordSubmit()">' + (isEn ? 'Complete' : '完成记录') + '</button>'
    );
  },

  _recordSubmit() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const record = {
      situation: g('tr-situation'),
      thought: g('tr-thought'),
      evidence: g('tr-evidence'),
      alternative: g('tr-alternative'),
      ts: Date.now(),
    };
    if (!record.situation && !record.thought) {
      Helpers.toast('请至少填写情境或自动思维');
      return;
    }
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('mentalDaily', {});
    if (!saved[today]) saved[today] = {};
    if (!saved[today].thoughtRecords) saved[today].thoughtRecords = [];
    saved[today].thoughtRecords.push(record);
    Store.set('mentalDaily', saved);
    Helpers.closeModal();
    Helpers.toast('记录完成 ✓ 替代思维就是新的神经通路');
  },

  // ---- 意图 ----
  _pickIntention() {
    const isEn = I18n.getLang() === 'en';
    const pool = MentalHealthDB.intentionPool;
    const chips = pool.map(i => '<span class="chip" style="padding:6px 16px;border-radius:20px;margin:3px;font-size:14px;cursor:pointer" onclick="MentalView._setIntention(\'' + i.text + '\')">' + i.text + '</span>').join('');
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">' + __('home.intention.title') + '</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:16px">' + __('home.intention.desc') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chips + '</div>' +
      '<div style="margin-top:16px;text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('home.intention.cancel') + '</button></div>'
    );
  },

  _setIntention(text) {
    const isEn = I18n.getLang() === 'en';
    Helpers.closeModal();
    Helpers.toast((isEn ? 'Intention: ' : '今日意图：') + text);
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('mentalDaily', {});
    if (!saved[today]) saved[today] = {};
    saved[today].intention = text;
    Store.set('mentalDaily', saved);
  },
};

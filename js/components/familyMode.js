// ===== 家庭模式 + 备菜模式 =====
const FamilyMode = {
  show() {
    const members = Store.get('familyMembers', []);
    const mode = Store.getProfile()?.mode || 'personal';
    const el = document.getElementById('main-content');

    if (mode === 'mealprep') { this._mealPrep(); return; }

    el.innerHTML = `
      <div class="page-hdr"><h2>👨‍👩‍👧‍👧 家庭成员</h2><p>为每位成员设置饮食档案</p></div>
      ${members.map((m, i) => `
        <div class="meal-card" style="margin-bottom:6px">
          <div class="flex-between">
            <div><strong>${m.name}</strong> ${m.age}岁 · ${m.gender==='male'?'男':'女'} · ${m.restrictions?.join('、')||'无忌口'}</div>
            <button class="btn btn-soft btn-sm" onclick="FamilyMode._edit(${i})">编辑</button>
          </div>
        </div>`).join('') || '<div style="font-size:13px;color:var(--text-hint);margin-bottom:8px">还没有添加家庭成员</div>'}
      <button class="btn btn-outline btn-block btn-sm" onclick="FamilyMode._add()">+ 添加成员</button>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-soft btn-sm" onclick="App.navigate('home')">← 返回</button></div>
    `;
  },

  _familyForm(idx) {
    const members = Store.get('familyMembers', []);
    const m = idx != null ? members[idx] : {};
    const r = (m.restrictions||[]).join('、');
    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:600;margin-bottom:12px">${idx!=null?'编辑':'添加'}成员</h3>
      <div class="form-group"><label class="form-label">称呼</label><input class="form-input" id="fm-name" value="${m.name||''}"></div>
      <div style="display:flex;gap:8px">
        <div class="form-group" style="flex:1"><label class="form-label">年龄</label><input type="number" class="form-input" id="fm-age" value="${m.age||18}"></div>
        <div class="form-group" style="flex:1"><label class="form-label">性别</label>
          <select class="form-select" id="fm-gender"><option value="male" ${m.gender==='male'?'selected':''}>男</option><option value="female" ${m.gender==='female'?'selected':''}>女</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">忌口/偏好（逗号分隔）</label><input class="form-input" id="fm-rest" value="${r}" placeholder="如：不吃辣, 不吃羊肉"></div>
      <button class="btn btn-primary btn-block" onclick="FamilyMode._save(${idx})">保存</button>
    `);
  },

  _add() { this._familyForm(); },
  _edit(i) { this._familyForm(i); },

  _save(idx) {
    const name = document.getElementById('fm-name')?.value.trim();
    if (!name) return Helpers.toast('请输入称呼');
    const member = {
      name, age: parseInt(document.getElementById('fm-age')?.value)||18,
      gender: document.getElementById('fm-gender')?.value||'female',
      restrictions: (document.getElementById('fm-rest')?.value||'').split(/[,，、]/).map(s=>s.trim()).filter(Boolean),
    };
    const members = Store.get('familyMembers', []);
    if (idx != null) members[idx] = member; else members.push(member);
    Store.set('familyMembers', members);
    Helpers.closeModal();
    Helpers.toast('已保存 ✓');
    this.show();
  },

  // ---- 备菜模式 ----
  _mealPrep() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr"><h2>📦 备菜模式</h2><p>一次备好一周的菜，工作日省时间</p></div>
      <div class="note-card">
        <strong>🗓️ 推荐备菜流程</strong><br>
        <div style="font-size:13px;line-height:2;margin-top:6px">
          □ ① 煮一锅米饭分装冷冻（保存1个月）<br>
          □ ② 肉类切好腌制分装冷藏/冷冻<br>
          □ ③ 蔬菜洗净切好冷藏（绿叶菜现吃现做）<br>
          □ ④ 调好酱汁分装冷藏<br>
          □ ⑤ 备好汤底/高汤冷冻<br>
          □ ⑥ 分装食材贴上标签（菜名+日期）
        </div>
      </div>
      <div class="note-card" style="background:var(--warm-bg)">
        <strong>💡 适合备菜的菜品</strong><br>
        <span style="font-size:13px">红烧肉、咖喱鸡肉、番茄牛腩、卤味、炖汤、饺子馄饨、肉丸、酱料</span>
      </div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-soft btn-sm" onclick="App.navigate('home')">← 返回</button></div>
    `;
  },
};

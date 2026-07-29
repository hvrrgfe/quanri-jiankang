// ===== 设置页面 =====
const SettingsPage = {
  show() {
    const profile = Store.getProfile();
    const apiKey = Store.getApiKey();
    const hasKey = !!apiKey;

    const el = document.getElementById('main-content');
    el.innerHTML = Icons.replace(`
      <div class="page-hdr"><h2>更多</h2></div>

      <!-- 快捷入口 -->
      <div class="setting-group">
        <h3>健康工具</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.navigate('survey')">
            <div class="setting-row-left">
              <span class="setting-row-icon">📊</span>
              <div><div class="setting-row-label">健康问卷</div><div style="font-size:12px;color:var(--text-hint)">5维度全面评估</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SleepChecklist.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">🌙</span>
              <div><div class="setting-row-label">睡前检查</div><div style="font-size:12px;color:var(--text-hint)">科学入睡流程</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="BreathingGuide.show('B01')">
            <div class="setting-row-left">
              <span class="setting-row-icon">💨</span>
              <div><div class="setting-row-label">呼吸练习</div><div style="font-size:12px;color:var(--text-hint)">4-7-8 · 盒式 · 快速平静</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="App.navigate('career')">
            <div class="setting-row-left">
              <span class="setting-row-icon">🎯</span>
              <div><div class="setting-row-label">生涯规划</div><div style="font-size:12px;color:var(--text-hint)">目标管理 · 职业发展</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 饮食档案 -->
      <div class="setting-group">
        <h3>👤 饮食档案</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.startWizard()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📝</span>
              <div>
                <div class="setting-row-label">编辑档案</div>
                ${profile ? `<div style="font-size:12px;color:var(--text-hint)">${profile.age}岁 · ${(profile.mealsToPlan || []).join('/')}</div>` : ''}
              </div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          ${profile ? `
          <div class="setting-row" onclick="SettingsPage._profileSummary()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📋</span>
              <div><div class="setting-row-label">档案总览</div><div style="font-size:12px;color:var(--text-hint)">查看你的完整画像</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._editARequirements()">
            <div class="setting-row-left">
              <span class="setting-row-icon">💬</span>
              <div><div class="setting-row-label">我的饮食需求</div><div style="font-size:12px;color:var(--text-hint)">告诉AI你的特殊需求</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>` : ''}
        </div>
      </div>

      <!-- API密钥 -->
      <div class="setting-group">
        <h3>🔑 接口密钥</h3>
        <div class="setting-card">
          <div class="setting-row" style="flex-direction:column;align-items:stretch;gap:10px">
            <div>
              <div class="setting-row-label">API Key</div>
              <div style="font-size:12px;color:var(--text-hint)">可选填，填了可以让菜单搭配更合你口味（密钥只存在你本地）</div>
            </div>
            <div class="api-wrap">
              <input type="password" class="form-input" id="api-input"
                     placeholder="输入你的 API Key"
                     value="${hasKey ? '••••••••••••••••' : ''}">
              <button class="api-toggle" onclick="SettingsPage._toggleVis()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div id="api-status" class="api-status ${hasKey ? 'valid' : ''}">
              ${hasKey ? '✅ 密钥已设置' : '密钥只存在你浏览器本地，不会上传'}
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm flex-1" onclick="SettingsPage._saveKey()">保存</button>
              ${hasKey ? '<button class="btn btn-outline btn-sm" onclick="SettingsPage._removeKey()">移除</button>' : ''}
            </div>
          </div>

          <div class="setting-row" onclick="SettingsPage._toggleEndpoint()">
            <div class="setting-row-left">
              <span class="setting-row-icon">🔌</span>
              <div>
                <div class="setting-row-label">API 端点</div>
                <div style="font-size:12px;color:var(--text-hint)" id="ep-display">${Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions')}</div>
              </div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div id="ep-config" class="hidden" style="padding:0 14px 12px">
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">快速选择</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
              ${[
                ['OpenAI','https://api.openai.com/v1/chat/completions','gpt-4o-mini'],
                ['DeepSeek V4','https://api.deepseek.com/chat/completions','deepseek-v4-flash'],
                ['DeepSeek(旧)','https://api.deepseek.com/chat/completions','deepseek-chat'],
                ['通义千问','https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions','qwen3.7-plus'],
                ['月之暗面','https://api.moonshot.cn/v1/chat/completions','moonshot-v1-8k'],
                ['智谱清言','https://open.bigmodel.cn/api/paas/v4/chat/completions','glm-4-plus'],
                ['腾讯混元','https://api.hunyuan.cloud.tencent.com/v1/chat/completions','hunyuan-lite'],
                ['字节豆包','https://ark.cn-beijing.volces.com/api/v3/chat/completions','ep-20250213000000-xxxxx'],
                ['零一万物','https://api.lingyiwanwu.com/v1/chat/completions','yi-large'],
                ['百川智能','https://api.baichuan-ai.com/v1/chat/completions','Baichuan4'],
                ['硅基流动','https://api.siliconflow.cn/v1/chat/completions','Pro/deepseek-llm-67b-chat'],
                ['Groq','https://api.groq.com/openai/v1/chat/completions','llama-3.3-70b-versatile'],
                ['Together','https://api.together.xyz/v1/chat/completions','mistralai/Mixtral-8x22B'],
                ['Ollama(本地)','http://localhost:11434/v1/chat/completions','llama3'],
              ].map(p => `<span class="chip" style="padding:3px 10px;font-size:11px;border-radius:12px;cursor:pointer" data-ep="${p[1]}" data-model="${p[2]}" onclick="SettingsPage._setProvider(this.dataset.ep,this.dataset.model)">${p[0]}</span>`).join('')}
            </div>
            <div class="form-group">
              <label class="form-label">端点 URL</label>
              <input type="text" class="form-input" id="ep-url" value="${Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions')}">
            </div>
            <div class="form-group">
              <label class="form-label">模型</label>
              <input type="text" class="form-input" id="ep-model" value="${Store.get('apiModel', 'gpt-4o-mini')}">
            </div>
            <button class="btn btn-soft btn-sm btn-block" onclick="SettingsPage._saveEp()">保存端点</button>
          </div>
          <div class="setting-row" onclick="SettingsPage._toggleProxy()">
            <div class="setting-row-left">
              <span class="setting-row-icon">🖥️</span>
              <div>
                <div class="setting-row-label">本地代理</div>
                <div style="font-size:12px;color:var(--text-hint)">${Store.get('useProxy', false) ? '已启用 (server.js)' : '未启用 (直连)'}</div>
              </div>
            </div>
            <span class="setting-row-arrow">${Store.get('useProxy', false) ? '✓' : '○'}</span>
          </div>
        </div>
      </div>

      <!-- 搜索菜谱 -->
      <div class="setting-group">
        <h3>🔍 搜索菜谱</h3>
        <div class="setting-card">
          <div class="setting-row" style="flex-direction:column;align-items:stretch;gap:8px">
            <input type="text" class="form-input" placeholder="输入菜名或食材..." oninput="SettingsPage._search(this.value)">
            <div id="search-results"></div>
          </div>
        </div>
      </div>

      <!-- 功能 -->
      <div class="setting-group">
        <h3>📦 功能</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.navigate('plan')">
            <div class="setting-row-left">
              <span class="setting-row-icon">📋</span>
              <div><div class="setting-row-label">本周菜单</div><div style="font-size:12px;color:var(--text-hint)">查看完整一周安排</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="NutritionDashboard.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📊</span>
              <div><div class="setting-row-label">营养报告</div><div style="font-size:12px;color:var(--text-hint)">膳食指南达标检查</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="CustomRecipes.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📝</span>
              <div><div class="setting-row-label">自定义菜谱</div><div style="font-size:12px;color:var(--text-hint)">录入你的拿手菜</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="ExportShare.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📤</span>
              <div><div class="setting-row-label">导出分享</div><div style="font-size:12px;color:var(--text-hint)">复制菜单/清单文本</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._searchToggle()">
            <div class="setting-row-left">
              <span class="setting-row-icon">🔍</span>
              <div><div class="setting-row-label">搜索菜谱</div><div style="font-size:12px;color:var(--text-hint)">从菜谱库中查找</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="FamilyMode.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">👨‍👩‍👧‍👧</span>
              <div><div class="setting-row-label">家庭成员</div><div style="font-size:12px;color:var(--text-hint)">管理多成员档案</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="HistoryView.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📜</span>
              <div><div class="setting-row-label">饮食历史</div><div style="font-size:12px;color:var(--text-hint)">查看反馈记录</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._toggleDark()">
            <div class="setting-row-left">
              <span class="setting-row-icon">🌙</span>
              <div><div class="setting-row-label">夜间模式</div><div style="font-size:12px;color:var(--text-hint)">${document.body.classList.contains('dark-mode') ? '已开启' : '未开启'}</div></div>
            </div>
            <span class="setting-row-arrow">${document.body.classList.contains('dark-mode') ? '✓' : '○'}</span>
          </div>
        </div>
      </div>

      <!-- 隐私 -->
      <div class="setting-group">
        <h3>🔒 隐私说明</h3>
        <div class="setting-card">
          <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;cursor:default">
            <div style="font-size:13px;color:var(--text-soft);line-height:1.6">
              所有数据都存在你本地，不上传任何东西到服务器。
              ${hasKey ? '<br><br>密钥只存在浏览器本地，所有请求从你的浏览器直接发出。' : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="setting-group">
        <h3>ℹ️ 关于</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="SettingsPage._dietKnowledge()">
            <div class="setting-row-left">
              <span class="setting-row-icon">📖</span>
              <span class="setting-row-label">膳食指南知识库</span>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row">
            <div class="setting-row-left">
              <span class="setting-row-icon">📌</span>
              <span class="setting-row-label">版本 1.0.0</span>
            </div>
          </div>
          <div class="setting-row" onclick="SettingsPage._reset()" style="color:var(--red)">
            <div class="setting-row-left">
              <span class="setting-row-icon">🗑️</span>
              <span class="setting-row-label">重置所有数据</span>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
        </div>
      </div>
    `);
  },

  _toggleVis() {
    const inp = document.getElementById('api-input');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  },

  _saveKey() {
    const inp = document.getElementById('api-input');
    if (!inp || !inp.value.trim()) return;
    const k = inp.value.trim();
    if (k.includes('••••')) return;
    Store.setApiKey(k);
    document.getElementById('api-status').className = 'api-status valid';
    document.getElementById('api-status').textContent = '✅ 密钥已设置';
    Helpers.toast('已保存');
  },

  _removeKey() {
    Store.removeApiKey();
    document.getElementById('api-input').value = '';
    document.getElementById('api-status').className = 'api-status';
    document.getElementById('api-status').textContent = '密钥已移除';
    Helpers.toast('密钥已移除');
  },

  _toggleProxy() {
    const current = Store.get('useProxy', false);
    Store.set('useProxy', !current);
    this.show();
    Helpers.toast(!current ? '本地代理已启用' : '已切换到直连');
  },

  _toggleEndpoint() {
    const el = document.getElementById('ep-config');
    if (el) el.classList.toggle('hidden');
  },

  _saveEp() {
    const url = document.getElementById('ep-url')?.value;
    const model = document.getElementById('ep-model')?.value;
    if (url) Store.set('apiEndpoint', url);
    if (model) Store.set('apiModel', model);
    document.getElementById('ep-display').textContent = url;
    Helpers.toast('已保存');
  },

  _search(q) {
    const div = document.getElementById('search-results');
    if (!div) return;
    if (!q || q.trim().length < 1) { div.innerHTML = ''; return; }
    const results = RECIPES.search(q);
    div.innerHTML = results.length
      ? results.slice(0, 8).map(r =>
        `<div style="padding:6px 4px;border-bottom:1px solid var(--line-light);font-size:13px;display:flex;justify-content:space-between">
          <span>${r.name}</span>
          <span style="color:var(--text-hint)">⏱${r.cookTime}min</span>
        </div>`
      ).join('')
      : '<div style="font-size:13px;color:var(--text-hint);padding:4px">没找到</div>';
  },

  _searchToggle() {
    App.navigate('home');
    // 直接在首页加个搜索条
    setTimeout(() => {
      const el = document.getElementById('main-content');
      el.innerHTML = `
        <div class="page-hdr"><h2>🔍 搜索菜谱</h2></div>
        <input type="text" class="form-input" id="search-q" placeholder="输入菜名或食材..." style="margin-bottom:12px" oninput="SettingsPage._doSearch(this.value)">
        <div id="search-结果"></div>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="App.navigate('home')">← 返回</button></div>`;
      document.getElementById('search-q')?.focus();
    }, 100);
  },

  _setProvider(ep, model) {
    Store.set('apiEndpoint', ep);
    Store.set('apiModel', model);
    document.getElementById('ep-url').value = ep;
    document.getElementById('ep-model').value = model;
    document.getElementById('ep-display').textContent = ep;
    Helpers.toast('已切换到 ' + ep.split('/')[2]);
  },

  _doSearch(q) {
    const div = document.getElementById('search-结果');
    if (!div) return;
    if (!q||q.trim().length<1) { div.innerHTML=''; return; }
    const res = RECIPES.search(q);
    if (!res.length) { div.innerHTML='<div style="font-size:13px;color:var(--text-hint);padding:8px">没找到</div>'; return; }
    div.innerHTML = res.slice(0,20).map(r =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px solid var(--line-light);font-size:13px;cursor:pointer" onclick="SettingsPage._viewRecipe('${r.id}')">
        <span>${r.name}</span>
        <span style="color:var(--text-hint);display:flex;align-items:center;gap:6px">
          ⏱${r.cookTime}min · ${r.mealType==='breakfast'?'早餐':r.mealType==='lunch'?'午餐':'晚餐'}
          <span style="color:var(--accent)">›</span>
        </span>
      </div>`
    ).join('');
  },

  _viewRecipe(id) {
    const r = RECIPES.getById(id);
    if (!r) return Helpers.toast('找不到该菜谱');
    const lbl = { breakfast:'早餐', lunch:'午餐', dinner:'晚餐', snack:'加餐' };
    Helpers.openModal(`
      <div class="recipe-body">
        <div style="font-size:13px;color:var(--text-hint)">${lbl[r.mealType]||r.mealType||'菜品'}</div>
        <div class="recipe-name" style="font-size:20px;font-weight:700;margin:4px 0 8px">${r.name}</div>
        <div class="recipe-meta" style="display:flex;gap:12px;font-size:13px;color:var(--text-soft);flex-wrap:wrap;margin-bottom:12px">
          <span>⏱ ${r.cookTime||'?'}分钟</span>
          <span>💰 ¥${r.costPerServing||'?'}</span>
          ${r.nutrition?.calories ? `<span>🔥 ${r.nutrition.calories}kcal</span>` : ''}
          ${(r.tags||[]).length ? `<span>🏷️ ${r.tags.slice(0,3).join('·')}</span>` : ''}
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:600;color:var(--text-hint);margin-bottom:4px">🥩 食材</div>
          ${(r.ingredients||[]).map(i => `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;border-bottom:1px dashed var(--line-light)"><span>${i.name}</span><span style="color:var(--text-hint)">${i.amount||''}${i.unit||'g'}</span></div>`).join('')}
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--text-hint);margin-bottom:4px">📝 做法</div>
          ${(r.steps||[]).map((s,i) => `<div style="display:flex;gap:6px;padding:4px 0;font-size:13px"><span style="width:18px;height:18px;border-radius:50%;background:var(--accent-bg);color:var(--accent-dark);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;margin-top:2px">${i+1}</span><span>${s}</span></div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>
      </div>
    `);
  },

  _editARequirements() {
    const p = Store.getProfile();
    if (!p) return Helpers.toast('请先设置档案');

    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:600;margin-bottom:8px">💬 我的饮食需求</h3>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">
        告诉AI你还有什么特殊需求，会保存在你的档案里，每次生成菜单时自动参考。
      </div>
      <textarea class="form-input" id="ai-req-input" rows="4" style="resize:vertical;font-size:13px" placeholder="例：最近在增肌，希望高蛋白低脂。胃不太好，不要辛辣刺激的。">${p.aiRequirements || ''}</textarea>
      <div style="margin-top:8px;font-size:12px;color:var(--text-hint)">这些需求会随着你的档案一起发给 AI</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-primary btn-sm flex-1" onclick="SettingsPage._saveARequirements()">保存</button>
        <button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">取消</button>
      </div>
    `);
  },

  _saveARequirements() {
    const input = document.getElementById('ai-req-input');
    if (!input) return;
    const p = Store.getProfile();
    if (!p) return;
    p.aiRequirements = input.value.trim();
    Store.setProfile(p);
    Helpers.closeModal();
    Helpers.toast('已保存');
  },

  _profileSummary() {
    const p = Store.getProfile();
    if (!p) return Helpers.toast('请先设置档案');
    const rec = Nutrition.getDailyRecommendation(p);
    const sections = [
      { title: '👤 基本信息', items: [`${p.age}岁 · ${p.gender==='male'?'男':'女'} · ${p.height}cm · ${p.weight}kg · 活动${['久坐','轻度','中度','高度'][(p.activityLevel||1)-1]}`] },
      { title: '😴 生活方式', items: [`睡眠${p.sleepHours||7}h · 压力${['很低','一般','中等','较大','很大'][(p.stressLevel||2)-1]} · 运动${p.exerciseDays||2}天/周 · 外食${p.eatOutFreq||2}次/周 · 烹饪${['新手','入门','中等','熟练','高手'][(p.cookingSkill||2)-1]}`] },
      { title: '🏥 健康', items: [`${(p.healthConditions||[]).join('、')||'无特殊'} · 消化${(p.digestiveIssues||[]).filter(i=>i!=='none').join('、')||'正常'}${p.useSupplements?' · 补充剂：'+(p.supplements||[]).join('、'):''}`] },
      { title: '🎯 目标与忌口', items: [
        `目标：${(p.healthGoals||[]).join('、')||'无'} · 忌口：${(p.dietaryRestrictions||[]).join('、')||'无'} · 菜系偏好：${Array.isArray(p.cuisinePreference) ? p.cuisinePreference.join('、') : (p.cuisinePreference||'家常')}`,
        p.aiRequirements ? `💬 额外需求：${p.aiRequirements}` : ''
      ].filter(Boolean)},
      { title: '🍳 做饭条件', items: [`餐次：${(p.mealsToPlan||[]).join('、')} · 时间：${p.cookTimeBudget||30}min/餐 · 预算：¥${p.perMealBudget||20} · 厨具：${(p.availableTools||[]).join('、')}`] },
      { title: '👅 口味', items: [`辣${p.tasteProfile?.spicy||0} 酸${p.tasteProfile?.sour||0} 甜${p.tasteProfile?.sweet||0} 咸${p.tasteProfile?.salty||0} 油${p.tasteProfile?.oily||0}`] },
      { title: '📊 每日营养目标', items: [`${rec.energy}kcal · 谷${rec.targets.grain}g · 蔬${rec.targets.vegetable}g · 肉${rec.targets.meatPoultry}g · 水产${rec.targets.seafood}g · 蛋${rec.targets.egg}g · 奶${rec.targets.dairy}ml · 油≤${rec.targets.oil}g · 盐≤${rec.targets.salt}g`] },
    ];

    let html = '<h3 style="font-size:18px;font-weight:700;margin-bottom:12px">📋 你的饮食档案总览</h3>';
    sections.forEach(s => {
      html += `<div style="margin-bottom:8px;padding:8px 12px;background:var(--accent-bg);border-radius:6px">
        <div style="font-weight:600;font-size:14px;color:var(--accent-dark);margin-bottom:2px">${s.title}</div>
        ${s.items.map(t => `<div style="font-size:13px;color:var(--text-soft);line-height:1.6">${t}</div>`).join('')}
      </div>`;
    });
    Helpers.openModal(html + '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>');
  },

  _toggleDark() {
    document.body.classList.toggle('dark-mode');
    Store.set('darkMode', document.body.classList.contains('dark-mode'));
    this.show();
  },

  _dietKnowledge() {
    const k = DietEngine.getDietGuidelineKnowledge();
    let html = `<h3 style="font-size:18px;font-weight:700;margin-bottom:12px">📖 ${k.title}</h3>`;
    k.guidelines.forEach(g => {
      html += `<div style="margin-bottom:10px;padding:10px 12px;background:var(--accent-bg);border-radius:6px">
        <div style="font-weight:600;font-size:14px;color:var(--accent-dark);margin-bottom:4px">${g.rule}</div>
        <div style="font-size:13px;color:var(--text-soft)">${g.details}</div>
      </div>`;
    });
    html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px">🥗 膳食宝塔</h4>`;
    Object.entries(k.foodPagoda).forEach(([, info]) => {
      html += `<div style="padding:4px 8px;border-left:3px solid var(--accent);margin-bottom:4px;font-size:13px">
        <strong>${info.name}</strong> ${info.daily}<br><span style="color:var(--text-hint)">${info.note}</span>
      </div>`;
    });
    // 国际指南
    if (k.international) {
      html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px">🌍 国际膳食参考</h4>`;
      k.international.forEach(g => {
        html += `<div style="margin-bottom:8px;padding:8px 12px;background:var(--warm-bg);border-radius:6px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${g.name}</div>
          ${g.items.map(i => `<span style="display:inline-block;font-size:12px;padding:2px 8px;margin:2px;background:rgba(255,255,255,0.5);border-radius:10px">${i}</span>`).join('')}
        </div>`;
      });
    }
    // 生活方式科学
    if (k.lifestyleScience) {
      html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px">🔬 生活方式与营养科学（2025-2026前沿研究）</h4>`;
      k.lifestyleScience.forEach(item => {
        html += `<div style="margin-bottom:8px;padding:10px 12px;background:var(--accent-bg);border-radius:6px">
          <div style="font-weight:600;font-size:13px;color:var(--accent-dark);margin-bottom:4px">${item.topic}</div>
          <div style="font-size:12px;color:var(--text-soft);line-height:1.6">${item.content}</div>
          <div style="font-size:10px;color:var(--text-hint);margin-top:4px">📚 ${item.source}</div>
        </div>`;
      });
    }
    Helpers.openModal(html + `<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>`);
  },

  _reset() {
    if (confirm('确定要重置吗？会删掉你的档案和所有菜单记录')) {
      Store.clearAll();
      Helpers.toast('已重置');
      App.navigate('home');
    }
  },
};

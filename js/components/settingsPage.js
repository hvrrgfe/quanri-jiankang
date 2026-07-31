// ===== 设置页面 =====
const SettingsPage = {
  show() {
    const profile = Store.getProfile();
    const apiKey = Store.getApiKey();
    const hasKey = !!apiKey;
    const isEn = I18n.getLang() === 'en';

    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr"><h2>${__('settings.title')}</h2></div>

      <div class="setting-group">
        <h3>${__('common.settings')}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="SettingsPage._toggleLang()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('globe')}</span>
              <div><div class="setting-row-label">${isEn ? 'Language' : '语言'}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? __('settings.langEn') : __('settings.langZh')}</div></div>
            </div>
            <span class="setting-row-arrow">${isEn ? 'EN' : '中文'}</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._toggleDark()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("moon")}</span>
              <div><div class="setting-row-label">${isEn ? 'Dark Mode' : __('settings.darkMode')}</div><div style="font-size:12px;color:var(--text-hint)">${document.body.classList.contains('dark-mode') ? (isEn ? 'On' : __('common.done')) : (isEn ? 'Off' : __('common.close'))}</div></div>
            </div>
            <span class="setting-row-arrow">${document.body.classList.contains('dark-mode') ? '✓' : '○'}</span>
          </div>
        </div>
      </div>

      <!-- Health Profile -->
      <div class="setting-group">
        <h3>${__('settings.profile')}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.startWizard()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('user')}</span>
              <div>
                <div class="setting-row-label">${__('settings.editProfile')}</div>
                ${profile ? `<div style="font-size:12px;color:var(--text-hint)">${profile.age}${isEn ? 'yrs' : __('common.year')} · ${(profile.mealsToPlan || []).join('/')}</div>` : ''}
              </div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          ${profile ? `
          <div class="setting-row" onclick="SettingsPage._profileSummary()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("menu")}</span>
              <div><div class="setting-row-label">${isEn ? 'Profile Overview' : '档案总览'}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'View your full profile' : '查看你的完整画像'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._editARequirements()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("chat")}</span>
              <div><div class="setting-row-label">${isEn ? 'My Diet Needs' : '我的饮食需求'}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Tell AI your special needs' : '告诉AI你的特殊需求'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>` : ''}
        </div>
      </div>

      <!-- API -->
      <div class="setting-group">
        <h3>${__('settings.apiKey')}</h3>
        <div class="setting-card">
          <div class="setting-row" style="flex-direction:column;align-items:stretch;gap:10px">
            <div>
              <div class="setting-row-label">API Key</div>
              <div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Optional. Enables AI-powered personalization (stored locally only).' : '可选填，填了可以让菜单搭配更合你口味（密钥只存在你本地）'}</div>
            </div>
            <div class="api-wrap">
              <input type="password" class="form-input" id="api-input"
                     placeholder="${isEn ? 'Enter your API Key' : '输入你的 API Key'}"
                     value="${hasKey ? '••••••••••••••••' : ''}">
              <button class="api-toggle" onclick="SettingsPage._toggleVis()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div id="api-status" class="api-status ${hasKey ? 'valid' : ''}">
              ${hasKey ? (isEn ? 'API key set' : ' 密钥已设置') : (isEn ? 'Key stored locally only, never uploaded' : '密钥只存在你浏览器本地，不会上传')}
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm flex-1" onclick="SettingsPage._saveKey()">${__('common.save')}</button>
              <button class="btn btn-soft btn-sm" onclick="SettingsPage._testConnection()">${isEn ? 'Test' : '测试连接'}</button>
              ${hasKey ? '<button class="btn btn-outline btn-sm" onclick="SettingsPage._removeKey()">' + (isEn ? 'Clear' : __('settings.apiKeyClear')) + '</button>' : ''}
            </div>
            <div id="api-test-status" class="api-status"></div>
            <div style="font-size:11px;color:var(--text-hint);line-height:1.6">
              💡 ${isEn ? 'Tip' : '提示'}:${isEn ? 'Ollama local model → ' : '本地 Ollama 模型 → '}http://192.168.x.x:11434/v1/chat/completions(需与服务器同一局域网)
            </div>
          </div>

          <div class="setting-row" onclick="SettingsPage._toggleEndpoint()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('api')}</span>
              <div>
                <div class="setting-row-label">API ${isEn ? 'Endpoint' : '端点'}</div>
                <div style="font-size:12px;color:var(--text-hint)" id="ep-display">${Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions')}</div>
              </div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div id="ep-config" class="hidden" style="padding:0 14px 12px">
            <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">${isEn ? 'Quick Select' : '快速选择'}</div>
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
              <label class="form-label">${isEn ? 'Endpoint URL' : '端点 URL'}</label>
              <input type="text" class="form-input" id="ep-url" value="${Store.get('apiEndpoint', 'https://api.openai.com/v1/chat/completions')}">
            </div>
            <div class="form-group">
              <label class="form-label">${isEn ? 'Model' : __('wizard.model')}</label>
              <input type="text" class="form-input" id="ep-model" value="${Store.get('apiModel', 'gpt-4o-mini')}">
            </div>
            <button class="btn btn-soft btn-sm btn-block" onclick="SettingsPage._saveEp()">${isEn ? 'Save Endpoint' : '保存端点'}</button>
          </div>
          <div class="setting-row" onclick="SettingsPage._toggleProxy()">
            <div class="setting-row-left">
              <span class="setting-row-icon">️</span>
              <div>
                <div class="setting-row-label">${isEn ? 'Local Proxy' : '本地代理'}</div>
                <div style="font-size:12px;color:var(--text-hint)">${Store.get('useProxy', false) ? (isEn ? 'Enabled (server.js)' : '已启用 (server.js)') : (isEn ? 'Disabled (direct)' : '未启用 (直连)')}</div>
              </div>
            </div>
            <span class="setting-row-arrow">${Store.get('useProxy', false) ? '✓' : '○'}</span>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="setting-group">
        <h3>${isEn ? 'Features' : '功能'}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.navigate('plan')">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("menu")}</span>
              <div><div class="setting-row-label">${__('diet.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'View full weekly plan' : '查看完整一周安排'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="NutritionDashboard.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("chart")}</span>
              <div><div class="setting-row-label">${__('nutrition.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Dietary guideline check' : '膳食指南达标检查'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="CustomRecipes.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("edit")}</span>
              <div><div class="setting-row-label">${__('diet.customRecipes')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Add your own recipes' : '录入你的拿手菜'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="ExportShare.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("share")}</span>
              <div><div class="setting-row-label">${__('export.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Copy / share plans' : '复制菜单/清单文本'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="FamilyMode.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">‍‍‍</span>
              <div><div class="setting-row-label">${__('diet.familyMode')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Manage multi-member profiles' : '管理多成员档案'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="HistoryView.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("history")}</span>
              <div><div class="setting-row-label">${__('history.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'View feedback history' : '查看反馈记录'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- Quick Tools -->
      <div class="setting-group">
        <h3>${isEn ? 'Quick Tools' : '健康工具'}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="App.navigate('survey')">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("chart")}</span>
              <div><div class="setting-row-label">${__('survey.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? '5-dimension self-check' : '5维度全面评估'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SleepChecklist.show()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("moon")}</span>
              <div><div class="setting-row-label">${__('sleep.checklist')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Science-based sleep routine' : '科学入睡流程'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="BreathingGuide.show('B01')">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("clock")}</span>
              <div><div class="setting-row-label">${__('mental.breathing')}</div><div style="font-size:12px;color:var(--text-hint)">4-7-8 · ${isEn ? 'Box' : '盒式'} · ${isEn ? 'Calm' : '快速平静'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="App.navigate('career')">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get("star")}</span>
              <div><div class="setting-row-label">${__('career.title')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Goals · Career' : '目标管理 · 职业发展'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- Knowledge -->
      <div class="setting-group">
        <h3>${__('settings.knowledge')}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="SettingsPage._knowledgeSource()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('book')}</span>
              <div><div class="setting-row-label">${__('settings.kbTitle')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Guidelines · ACSM · Fitness · Psychology' : '膳食指南·ACSM·全民健身·系统心理'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._dietKnowledge()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('search')}</span>
              <span class="setting-row-label">${isEn ? 'Dietary Guideline Details' : '膳食指南详情'}</span>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('pin')}</span>
              <span class="setting-row-label">${__('common.version')} ${isEn ? '2.0.0' : '2.0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy -->
      <div class="setting-group">
        <h3>${isEn ? 'Privacy' : '隐私说明'}</h3>
        <div class="setting-card">
          <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;cursor:default">
            <div style="font-size:13px;color:var(--text-soft);line-height:1.6">
              ${isEn ? 'All data is stored locally. Nothing is uploaded to any server.' : '所有数据都存在你本地，不上传任何东西到服务器。'}
              ${hasKey ? '<br><br>' + (isEn ? 'API key stored locally. All requests go directly from your browser.' : '密钥只存在浏览器本地，所有请求从你的浏览器直接发出。') : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- About & Actions -->
      <div class="setting-group">
        <h3>${__('settings.about')}</h3>
        <div class="setting-card">
          <div class="setting-row" onclick="SettingsPage._backup()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('download')}</span>
              <div><div class="setting-row-label">${__('settings.backup')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Export / Import all data' : '导出/导入全部数据'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._contributeNorm()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('globe')}</span>
              <div><div class="setting-row-label">${isEn ? 'Contribute Data' : '贡献数据'}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Anonymous norm contributions' : '匿名提交测评数据帮助建立常模'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row" onclick="SettingsPage._donate()">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('star')}</span>
              <div><div class="setting-row-label">${__('settings.donate')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'Support the developer' : '请御坂喝一杯奶茶'}</div></div>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
          <div class="setting-row">
            <div class="setting-row-left">
              <span class="setting-row-icon">${Icons.get('chat')}</span>
              <div><div class="setting-row-label">${__('settings.feedback')}</div><div style="font-size:12px;color:var(--text-hint)">${isEn ? 'WeChat 17850523307' : '微信 17850523307'}</div></div>
            </div>
          </div>
          <div class="setting-row" onclick="SettingsPage._reset()" style="color:var(--red)">
            <div class="setting-row-left">
              <span class="setting-row-icon">️</span>
              <span class="setting-row-label">${__('settings.reset')}</span>
            </div>
            <span class="setting-row-arrow">›</span>
          </div>
        </div>
      </div>
    `;
  },

  _toggleVis() {
    const inp = document.getElementById('api-input');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  },

  _saveKey() {
    const isEn = I18n.getLang() === 'en';
    const inp = document.getElementById('api-input');
    if (!inp || !inp.value.trim()) return;
    const k = inp.value.trim();
    if (k.includes('••••')) return;
    Store.setApiKey(k);
    document.getElementById('api-status').className = 'api-status valid';
    document.getElementById('api-status').textContent = isEn ? 'API key set' : ' 密钥已设置';
    Helpers.toast(__('settings.apiKeySaved'));
  },

  _removeKey() {
    const isEn = I18n.getLang() === 'en';
    Store.removeApiKey();
    document.getElementById('api-input').value = '';
    document.getElementById('api-status').className = 'api-status';
    document.getElementById('api-status').textContent = isEn ? 'API key removed' : '密钥已移除';
    Helpers.toast(__('settings.apiKeyCleared'));
  },

  _toggleProxy() {
    const current = Store.get('useProxy', false);
    const isEn = I18n.getLang() === 'en';
    Store.set('useProxy', !current);
    this.show();
    Helpers.toast(!current ? (isEn ? 'Local proxy enabled' : '本地代理已启用') : (isEn ? 'Switched to direct' : '已切换到直连'));
  },

  async _testConnection() {
    const isEn = I18n.getLang() === 'en';
    const statusEl = document.getElementById('api-test-status');
    if (!statusEl) return;
    const apiKey = Store.getApiKey();
    if (!apiKey) {
      statusEl.className = 'api-status';
      statusEl.textContent = isEn ? '⚠️ Save an API key first' : '⚠️ 请先保存 API Key';
      return;
    }
    statusEl.className = 'api-status';
    statusEl.textContent = isEn ? 'Testing...' : '正在测试连接...';
    try {
      // 发送一个最小请求验证 Key + 端点 + 代理链路
      const res = await Helpers.callLLM(
        'You are a health assistant. Reply with exactly: OK',
        'ping',
        apiKey
      );
      statusEl.className = 'api-status valid';
      statusEl.textContent = (isEn ? '✅ Connected: ' : '✅ 连接成功: ') + JSON.stringify(res).slice(0, 60);
    } catch (e) {
      statusEl.className = 'api-status';
      statusEl.textContent = '❌ ' + (e.message || 'failed');
    }
  },

  _toggleEndpoint() {
    const el = document.getElementById('ep-config');
    if (el) el.classList.toggle('hidden');
  },

  _saveEp() {
    const isEn = I18n.getLang() === 'en';
    const url = document.getElementById('ep-url')?.value;
    const model = document.getElementById('ep-model')?.value;
    if (url) Store.set('apiEndpoint', url);
    if (model) Store.set('apiModel', model);
    document.getElementById('ep-display').textContent = url;
    Helpers.toast(__('common.done'));
  },

  _search(q) {
    const isEn = I18n.getLang() === 'en';
    const div = document.getElementById('search-results');
    if (!div) return;
    if (!q || q.trim().length < 1) { div.innerHTML = ''; return; }
    const results = RECIPES.search(q);
    div.innerHTML = results.length
      ? results.slice(0, 8).map(r =>
        `<div style="padding:6px 4px;border-bottom:1px solid var(--line-light);font-size:13px;display:flex;justify-content:space-between">
          <span>${r.name}</span>
          <span style="color:var(--text-hint)">${r.cookTime}min</span>
        </div>`
      ).join('')
      : '<div style="font-size:13px;color:var(--text-hint);padding:4px">' + (isEn ? 'Not found' : '没找到') + '</div>';
  },

  _searchToggle() {
    const isEn = I18n.getLang() === 'en';
    App.navigate('home');
    setTimeout(() => {
      const el = document.getElementById('main-content');
      el.innerHTML = `
        <div class="page-hdr"><h2>${isEn ? 'Search Recipes' : '搜索菜谱'}</h2></div>
        <input type="text" class="form-input" id="search-q" placeholder="${isEn ? 'Enter recipe name or ingredient...' : '输入菜名或食材...'}" style="margin-bottom:12px" oninput="SettingsPage._doSearch(this.value)">
        <div id="search-results-page"></div>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="App.navigate('home')">${Icons.get('arrowLeft')} ${__('common.back')}</button></div>`;
      document.getElementById('search-q')?.focus();
    }, 100);
  },

  _setProvider(ep, model) {
    const isEn = I18n.getLang() === 'en';
    Store.set('apiEndpoint', ep);
    Store.set('apiModel', model);
    document.getElementById('ep-url').value = ep;
    document.getElementById('ep-model').value = model;
    document.getElementById('ep-display').textContent = ep;
    Helpers.toast((isEn ? 'Switched to ' : '已切换到 ') + ep.split('/')[2]);
  },

  _doSearch(q) {
    const isEn = I18n.getLang() === 'en';
    const div = document.getElementById('search-results-page');
    if (!div) return;
    if (!q||q.trim().length<1) { div.innerHTML=''; return; }
    const res = RECIPES.search(q);
    if (!res.length) { div.innerHTML='<div style="font-size:13px;color:var(--text-hint);padding:8px">' + (isEn ? 'Not found' : '没找到') + '</div>'; return; }
    div.innerHTML = res.slice(0,20).map(r =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px solid var(--line-light);font-size:13px;cursor:pointer" onclick="SettingsPage._viewRecipe('${r.id}')">
        <span>${r.name}</span>
        <span style="color:var(--text-hint);display:flex;align-items:center;gap:6px">
          ${r.cookTime}min · ${r.mealType==='breakfast'?__(isEn ? 'diet.breakfast' : '早餐'):r.mealType==='lunch'?'午餐':'晚餐'}
          <span style="color:var(--accent)">›</span>
        </span>
      </div>`
    ).join('');
  },

  _viewRecipe(id) {
    const isEn = I18n.getLang() === 'en';
    const r = RECIPES.getById(id);
    if (!r) return Helpers.toast(isEn ? 'Recipe not found' : '找不到该菜谱');
    const lbl = { breakfast: __('diet.breakfast'), lunch: __('diet.lunch'), dinner: __('diet.dinner'), snack: isEn ? 'Snack' : '加餐' };
    Helpers.openModal(`
      <div class="recipe-body">
        <div style="font-size:13px;color:var(--text-hint)">${lbl[r.mealType]||r.mealType||isEn?'Dish':'菜品'}</div>
        <div class="recipe-name" style="font-size:20px;font-weight:700;margin:4px 0 8px">${r.name}</div>
        <div class="recipe-meta" style="display:flex;gap:12px;font-size:13px;color:var(--text-soft);flex-wrap:wrap;margin-bottom:12px">
          <span> ${r.cookTime||'?'}${__('diet.cookTime')}</span>
          <span> ¥${r.costPerServing||'?'}</span>
          ${r.nutrition?.calories ? `<span> ${r.nutrition.calories}kcal</span>` : ''}
          ${(r.tags||[]).length ? `<span>️ ${r.tags.slice(0,3).join('·')}</span>` : ''}
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:600;color:var(--text-hint);margin-bottom:4px"> ${__('diet.ingredients')}</div>
          ${(r.ingredients||[]).map(i => `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;border-bottom:1px dashed var(--line-light)"><span>${i.name}</span><span style="color:var(--text-hint)">${i.amount||''}${i.unit||'g'}</span></div>`).join('')}
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--text-hint);margin-bottom:4px"> ${__('diet.steps')}</div>
          ${(r.steps||[]).map((s,i) => `<div style="display:flex;gap:6px;padding:4px 0;font-size:13px"><span style="width:18px;height:18px;border-radius:50%;background:var(--accent-bg);color:var(--accent-dark);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;margin-top:2px">${i+1}</span><span>${s}</span></div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>
      </div>
    `);
  },

  _editARequirements() {
    const isEn = I18n.getLang() === 'en';
    const p = Store.getProfile();
    if (!p) return Helpers.toast(__('common.setProfile'));

    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:600;margin-bottom:8px">${isEn ? 'My Diet Needs' : '我的饮食需求'}</h3>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">
        ${isEn ? 'Tell AI your special dietary needs. These will be saved and referenced automatically each time a meal plan is generated.' : '告诉AI你还有什么特殊需求，会保存在你的档案里，每次生成菜单时自动参考。'}
      </div>
      <textarea class="form-input" id="ai-req-input" rows="4" style="resize:vertical;font-size:13px" placeholder="${isEn ? 'e.g. Building muscle, need high protein low fat. Sensitive stomach.' : '例：最近在增肌，希望高蛋白低脂。胃不太好，不要辛辣刺激的。'}">${p.aiRequirements || ''}</textarea>
      <div style="margin-top:8px;font-size:12px;color:var(--text-hint)">${isEn ? 'These needs are sent to AI along with your profile.' : '这些需求会随着你的档案一起发给 AI'}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-primary btn-sm flex-1" onclick="SettingsPage._saveARequirements()">${__('common.save')}</button>
        <button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.cancel')}</button>
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
    Helpers.toast(__('common.done'));
  },

  _profileSummary() {
    const isEn = I18n.getLang() === 'en';
    const p = Store.getProfile();
    if (!p) return Helpers.toast(__('common.setProfile'));
    const rec = Nutrition.getDailyRecommendation(p);
    const g = p.gender === 'male' ? (isEn ? 'M' : '男') : (isEn ? 'F' : '女');
    const activityLabels = isEn ? ['Sedentary','Light','Moderate','High'] : ['久坐','轻度','中度','高度'];
    const stressLabels = isEn ? ['V.Low','Normal','Moderate','High','V.High'] : ['很低','一般','中等','较大','很大'];
    const skillLabels = isEn ? ['Beginner','Basic','Intermediate','Advanced','Expert'] : ['新手','入门','中等','熟练','高手'];
    const sections = [
      { title: ' ' + (isEn ? 'Basic Info' : '基本信息'), items: [`${p.age}${isEn?'yrs':'岁'} · ${g} · ${p.height}cm · ${p.weight}kg · ${isEn?'Activity':'活动'}${activityLabels[(p.activityLevel||1)-1]}`] },
      { title: ' ' + (isEn ? 'Lifestyle' : '生活方式'), items: [`${isEn?'Sleep':'睡眠'}${p.sleepHours||7}h · ${isEn?'Stress':'压力'}${stressLabels[(p.stressLevel||2)-1]} · ${isEn?'Exercise':'运动'}${p.exerciseDays||2}${isEn?'d/wk':'天/周'} · ${isEn?'EatOut':'外食'}${p.eatOutFreq||2}${isEn?'x/wk':'次/周'} · ${skillLabels[(p.cookingSkill||2)-1]}`] },
      { title: ' ' + (isEn ? 'Health' : '健康'), items: [`${(p.healthConditions||[]).join('、')||(isEn?'None':'无特殊')} · ${(p.digestiveIssues||[]).filter(i=>i!=='none').join('、')||(isEn?'Normal':'正常')}${p.useSupplements?' · '+(isEn?'Supplements':'补充剂')+'：'+(p.supplements||[]).join('、'):''}`] },
      { title: ' ' + (isEn ? 'Goals & Restrictions' : '目标与忌口'), items: [
        `${isEn?'Goals':'目标'}：${(p.healthGoals||[]).join('、')||(isEn?'None':'无')} · ${isEn?'Restrictions':'忌口'}：${(p.dietaryRestrictions||[]).join('、')||(isEn?'None':'无')}`,
        p.aiRequirements ? ` ${isEn?'Extra':'额外需求'}：${p.aiRequirements}` : ''
      ].filter(Boolean)},
      { title: ' ' + (isEn ? 'Cooking' : '做饭条件'), items: [`${(p.mealsToPlan||[]).join('、')} · ${p.cookTimeBudget||30}min/${isEn?'meal':'餐'} · ¥${p.perMealBudget||20} · ${(p.availableTools||[]).join('、')}`] },
      { title: ' ' + (isEn ? 'Nutrition Targets' : '每日营养目标'), items: [`${rec.energy}kcal · ${isEn?'Grain':'谷'}${rec.targets.grain}g · ${isEn?'Veg':'蔬'}${rec.targets.vegetable}g · ${isEn?'Meat':'肉'}${rec.targets.meatPoultry}g · ${isEn?'Seafood':'水产'}${rec.targets.seafood}g · ${isEn?'Egg':'蛋'}${rec.targets.egg}g · ${isEn?'Dairy':'奶'}${rec.targets.dairy}ml`] },
    ];

    let html = '<h3 style="font-size:18px;font-weight:700;margin-bottom:12px"> ' + (isEn ? 'Your Diet Profile Overview' : '你的饮食档案总览') + '</h3>';
    sections.forEach(s => {
      html += `<div style="margin-bottom:8px;padding:8px 12px;background:var(--accent-bg);border-radius:6px">
        <div style="font-weight:600;font-size:14px;color:var(--accent-dark);margin-bottom:2px">${s.title}</div>
        ${s.items.map(t => `<div style="font-size:13px;color:var(--text-soft);line-height:1.6">${t}</div>`).join('')}
      </div>`;
    });
    Helpers.openModal(html + '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">' + __('common.close') + '</button></div>');
  },

  _toggleLang() {
    var current = Store.get('language', 'zh');
    I18n.setLang(current === 'zh' ? 'en' : 'zh');
    Helpers.toast(current === 'zh' ? 'Switched to English' : '已切换到中文');
    if (typeof App !== 'undefined' && App._updateNav) App._updateNav();
    this.show();
  },

  _toggleDark() {
    document.body.classList.toggle('dark-mode');
    Store.set('darkMode', document.body.classList.contains('dark-mode'));
    this.show();
  },

  _dietKnowledge() {
    const isEn = I18n.getLang() === 'en';
    const k = DietEngine.getDietGuidelineKnowledge();
    let html = `<h3 style="font-size:18px;font-weight:700;margin-bottom:12px"> ${k.title}</h3>`;
    k.guidelines.forEach(g => {
      html += `<div style="margin-bottom:10px;padding:10px 12px;background:var(--accent-bg);border-radius:6px">
        <div style="font-weight:600;font-size:14px;color:var(--accent-dark);margin-bottom:4px">${g.rule}</div>
        <div style="font-size:13px;color:var(--text-soft)">${g.details}</div>
      </div>`;
    });
    html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px"> ${isEn ? 'Food Pagoda' : '膳食宝塔'}</h4>`;
    Object.entries(k.foodPagoda).forEach(([, info]) => {
      html += `<div style="padding:4px 8px;border-left:3px solid var(--accent);margin-bottom:4px;font-size:13px">
        <strong>${info.name}</strong> ${info.daily}<br><span style="color:var(--text-hint)">${info.note}</span>
      </div>`;
    });
    if (k.international) {
      html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px"> ${isEn ? 'International References' : '国际膳食参考'}</h4>`;
      k.international.forEach(g => {
        html += `<div style="margin-bottom:8px;padding:8px 12px;background:var(--warm-bg);border-radius:6px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${g.name}</div>
          ${g.items.map(i => `<span style="display:inline-block;font-size:12px;padding:2px 8px;margin:2px;background:rgba(255,255,255,0.5);border-radius:10px">${i}</span>`).join('')}
        </div>`;
      });
    }
    if (k.lifestyleScience) {
      html += `<h4 style="font-size:15px;font-weight:600;margin:12px 0 8px"> ${isEn ? 'Lifestyle & Nutrition Science (2025-2026)' : '生活方式与营养科学（2025-2026前沿研究）'}</h4>`;
      k.lifestyleScience.forEach(item => {
        html += `<div style="margin-bottom:8px;padding:10px 12px;background:var(--accent-bg);border-radius:6px">
          <div style="font-weight:600;font-size:13px;color:var(--accent-dark);margin-bottom:4px">${item.topic}</div>
          <div style="font-size:12px;color:var(--text-soft);line-height:1.6">${item.content}</div>
          <div style="font-size:10px;color:var(--text-hint);margin-top:4px"> ${item.source}</div>
        </div>`;
      });
    }
    Helpers.openModal(html + `<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>`);
  },

  _contributeNorm() {
    const isEn = I18n.getLang() === 'en';
    var p = Store.getProfile();
    var psy = p && p.psyAssessments ? Object.keys(p.psyAssessments) : [];
    var hasData = psy.length > 0;

    Helpers.openModal(`
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">${isEn ? 'Contribute Anonymous Data' : '贡献匿名数据'}</div>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:10px;line-height:1.6">
        ${isEn ? 'Anonymously submit your assessment scores to help build more accurate Chinese norms. Only scale names and scores are included — no personal information.' : '将你已完成的测评数据匿名提交，帮助建立更准确的中国常模。数据仅包含量表名称和得分，不含任何个人身份信息。'}
      </div>
      ${hasData ? '<div style="font-size:12px;color:var(--green);margin-bottom:8px">' + (isEn ? psy.length + ' results available to submit' : '当前有 ' + psy.length + ' 份测评结果可提交') + '</div>' : '<div style="font-size:12px;color:var(--text-hint);margin-bottom:8px">' + (isEn ? 'No assessment data yet. Take some tests in the Mind section first.' : '还没有测评数据，先去心理页面做几份问卷吧') + '</div>'}
      <div id="norm-status" style="font-size:12px;color:var(--text-soft);margin-bottom:8px"></div>
      <button class="btn btn-primary btn-sm btn-block" onclick="SettingsPage._submitNorm()" ${hasData ? '' : 'disabled'}>${isEn ? 'Submit Data' : '提交数据'}</button>
      <div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>
    `);
  },

  _submitNorm() {
    const isEn = I18n.getLang() === 'en';
    var p = Store.getProfile();
    if (!p || !p.psyAssessments) return;
    var data = { type: 'norm_contribution', version: 2, date: new Date().toISOString(), submissions: [] };
    for (var key in p.psyAssessments) {
      var r = p.psyAssessments[key];
      data.submissions.push({ scale: key, score: r.score, date: r.date });
    }
    var text = isEn ? '【QuanRiJianKang Norm Contribution】\n' : '【全日健康常模贡献】\n';
    data.submissions.forEach(function(s) { text += s.scale + ': ' + s.score + (isEn ? ' pts\n' : '分\n'); });
    text += isEn ? '\nPlease forward this data to the developer. Thank you!' : '\n请将此数据转发给开发者，感谢贡献！';

    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    document.getElementById('norm-status').textContent = isEn ? 'Data copied ✓ Send via WeChat to developer' : '数据已复制，请通过微信发送给开发者 ✓';
    Helpers.toast(isEn ? 'Copied ✓' : '已复制 ✓');
  },

  _backup() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">${__('settings.backup')}</div>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">${isEn ? 'Export all data as JSON, or restore from a backup file.' : '导出全部数据为JSON文件，或从备份文件恢复。'}</div>
      <button class="btn btn-primary btn-sm btn-block" onclick="SettingsPage._exportBackup()">${isEn ? 'Export Backup' : '导出备份'}</button>
      <div style="margin:8px 0;text-align:center;color:var(--text-hint);font-size:12px">${isEn ? '— OR —' : '或'}</div>
      <div style="font-size:13px;font-weight:600;margin-bottom:4px">${isEn ? 'Restore' : '恢复备份'}</div>
      <input type="file" id="backup-file" accept=".json" style="font-size:12px;margin-bottom:8px" onchange="SettingsPage._importBackup(event)">
      <div id="backup-status" style="font-size:12px;color:var(--text-soft)"></div>
      <div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>
    `);
  },

  _exportBackup() {
    var allData = {};
    for (var key in localStorage) {
      if (key.startsWith('three_meals_')) {
        try { allData[key] = JSON.parse(localStorage.getItem(key)); } catch(e) { allData[key] = localStorage.getItem(key); }
      }
    }
    var json = JSON.stringify(allData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'quanri_jiankang_backup_' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Helpers.toast(__('common.done'));
  },

  _importBackup(event) {
    const isEn = I18n.getLang() === 'en';
    var file = event.target && event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        var count = 0;
        for (var key in data) {
          if (key.startsWith('three_meals_')) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            count++;
          }
        }
        document.getElementById('backup-status').textContent = (isEn ? 'Restored ' : '已恢复 ') + count + (isEn ? ' items. Please refresh ✓' : ' 条数据，请刷新页面 ✓');
        Helpers.toast(isEn ? 'Restored ✓' : '恢复成功 ✓');
      } catch(err) {
        document.getElementById('backup-status').textContent = isEn ? 'Invalid file format' : '文件格式错误';
        Helpers.toast(isEn ? 'Restore failed' : '恢复失败');
      }
    };
    reader.readAsText(file);
  },

  _donate() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(`
      <div style="text-align:center">
        <div style="font-size:18px;font-weight:700;margin-bottom:8px">${__('settings.donate')}</div>
        <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">${isEn ? 'If this app helps you, consider supporting the developer.' : '如果这个项目对你有帮助，可以请御坂喝一杯奶茶'}</div>
        <img src="assets/donate.png" style="width:200px;height:200px;border-radius:12px;margin-bottom:8px">
        <div style="font-size:11px;color:var(--text-hint)">${isEn ? 'Scan with WeChat · Your support keeps me coding' : '微信扫码 · 你的支持是御坂持续更新的动力'}</div>
        <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>
      </div>
    `);
  },

  _knowledgeSource() {
    const isEn = I18n.getLang() === 'en';
    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:700;margin-bottom:12px">${__('settings.kbTitle')}</h3>
      <div style="font-size:13px;line-height:1.8;margin-bottom:12px">
        <div style="font-weight:600;margin-top:8px">${isEn ? 'Chinese Dietary Guidelines (2025)' : '中国《居民膳食指南》'}</div>
        <div style="color:var(--text-soft)">${isEn ? 'Food pagoda, daily targets, 13 compliance rules' : '膳食宝塔、每日营养目标、13项硬约束'}</div>
        <div style="font-weight:600;margin-top:8px">${isEn ? 'Chinese National Fitness Guide' : '中国《全民健身指南》（国家体育总局2017）'}</div>
        <div style="color:var(--text-soft)">${isEn ? '3 intensity levels, weekly recommendations, periodization' : '三档强度分级、每周推荐量、分期方案、运动流程'}</div>
        <div style="font-weight:600;margin-top:8px">${isEn ? 'ACSM Exercise Guidelines (11th Ed)' : 'ACSM运动处方指南（第十一版）'}</div>
        <div style="color:var(--text-soft)">${isEn ? 'FITT-VP, aerobic/strength/flexibility prescription, HIIT' : 'FITT-VP原则、有氧/力量/柔韧处方、HIIT建议'}</div>
        <div style="font-weight:600;margin-top:8px">${isEn ? 'Systemic Psychology' : '心理学系统观'}</div>
        <div style="color:var(--text-soft)">${isEn ? 'Systemic family therapy, circular causality, reframing, externalization' : '系统式家庭治疗、循环因果、重构、外化、分化'}</div>
        <div style="font-weight:600;margin-top:8px">2025-2026 ${isEn ? 'Research Frontiers' : '前沿研究'}</div>
        <div style="color:var(--text-soft)">${isEn ? 'HIIT vs combined training, exercise-chronotype matching' : 'HIIT与组合训练对比、运动与睡眠时型匹配'}</div>
        <div style="font-weight:600;margin-top:8px">${isEn ? 'Career Planning Methodology' : '框框生涯规划方法论'}</div>
        <div style="color:var(--text-soft)">${isEn ? 'Information asymmetry, goal decomposition, campus activity ROI' : '信息差三渠道、目标倒推法、校园活动性价比'}</div>
      </div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">${__('common.close')}</button></div>
    `);
  },

  _reset() {
    const isEn = I18n.getLang() === 'en';
    if (confirm(isEn ? 'Reset all data? Your profile and all records will be deleted.' : '确定要重置吗？会删掉你的档案和所有菜单记录')) {
      Store.clearAll();
      Helpers.toast(isEn ? 'Reset complete' : '已重置');
      App.navigate('home');
    }
  },
};

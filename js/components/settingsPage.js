// ===== 设置页面 =====
const SettingsPage = {
  show() {
    const profile = Store.getProfile();
    const apiKey = Store.getApiKey();
    const hasKey = !!apiKey;

    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr"><h2>⚙️ 设置</h2></div>

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
    `;
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

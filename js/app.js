// ===== 主应用控制器 =====
const App = {
  _currentPage: 'home',
  _loading: false,
  _encryptionReady: false,

  async init() {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          this._checkEncryption();
        }, 400);
      }
    }, 800);
  },

  // 检查加密状态
  async _checkEncryption() {
    const hasEncryption = CryptoStore.init();

    if (hasEncryption) {
      // 已有加密，需要密码解锁
      this._showUnlockScreen();
    } else {
      // 首次使用，询问是否设置加密
      this._showEncryptionPrompt();
    }
  },

  _showEncryptionPrompt() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="intro-page" style="padding:0">
        <div class="intro-icon">🔒</div>
        <div class="intro-title">数据加密</div>
        <div class="intro-sub">为你的饮食数据加上密码保护<br>所有数据用 AES-256 加密后存储在本地</div>
        <div class="intro-btns">
          <button class="intro-btn" onclick="App._setupEncryption()">
            <span class="intro-btn-icon">🔐</span>
            <span>
              <span class="intro-btn-label">设置密码</span>
              <span class="intro-btn-desc">推荐开启，保护隐私数据</span>
            </span>
          </button>
          <button class="intro-btn" onclick="App._bootApp()">
            <span class="intro-btn-icon">⏭️</span>
            <span>
              <span class="intro-btn-label">跳过</span>
              <span class="intro-btn-desc">数据明文存储（不推荐）</span>
            </span>
          </button>
        </div>
      </div>
    `;
    document.getElementById('app')?.classList.remove('hidden');
  },

  _setupEncryption() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="intro-page" style="padding:0">
        <div class="intro-icon">🔐</div>
        <div class="intro-title">设置加密密码</div>
        <div class="intro-sub">密码只存在你脑子里，御扒也不存储<br>以后每次打开都要输入</div>
        <div style="max-width:320px;margin:0 auto">
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" class="form-input" id="enc-pwd1" placeholder="至少 6 位">
          </div>
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input type="password" class="form-input" id="enc-pwd2" placeholder="再输一次">
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App._confirmEncryption()">确认开启加密</button>
        </div>
      </div>
    `;
  },

  async _confirmEncryption() {
    const p1 = document.getElementById('enc-pwd1')?.value;
    const p2 = document.getElementById('enc-pwd2')?.value;
    if (!p1 || p1.length < 6) return Helpers.toast('密码至少 6 位');
    if (p1 !== p2) return Helpers.toast('两次密码不一致');

    try {
      await CryptoStore.setupPassword(p1);
      Store.setEncrypted(true);
      Helpers.toast('加密已开启 🔐');
      this._encryptionReady = true;
      this._bootApp();
    } catch (e) {
      Helpers.toast('设置失败: ' + e.message);
    }
  },

  _showUnlockScreen() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="intro-page" style="padding:0">
        <div class="intro-icon">🔒</div>
        <div class="intro-title">输入密码解锁</div>
        <div class="intro-sub">你的数据已加密，需要密码才能查看</div>
        <div style="max-width:320px;margin:0 auto">
          <div class="form-group">
            <input type="password" class="form-input" id="enc-unlock" placeholder="输入加密密码"
                   onkeydown="if(event.key==='Enter')App._unlock()">
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App._unlock()">解锁</button>
          <div style="margin-top:12px;font-size:12px;color:var(--text-hint);text-align:center">
            密码只存在你本地，无法找回
          </div>
        </div>
      </div>
    `;
    document.getElementById('app')?.classList.remove('hidden');
  },

  async _unlock() {
    const pwd = document.getElementById('enc-unlock')?.value;
    if (!pwd) return Helpers.toast('请输入密码');

    if (await CryptoStore.unlock(pwd)) {
      Store.setEncrypted(true);
      await Store.loadFromCrypto();
      Helpers.toast('解锁成功 ✓');
      this._encryptionReady = true;
      this._bootApp();
    } else {
      Helpers.toast('密码错误');
    }
  },

  _bootApp() {
    // 恢复夜间模式
    if (Store.get('darkMode')) document.body.classList.add('dark-mode');

    document.querySelectorAll('#app-nav a').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) this.navigate(page);
      });
    });
    this.navigate('home');
  },

  navigate(page) {
    this._currentPage = page;
    document.querySelectorAll('#app-nav a').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    switch (page) {
      case 'home': HomePage.show(); break;
      case 'plan': WeeklyPlan.refresh(); break;
      case 'shopping': ShoppingList.show(); break;
      case 'export': ExportShare.show(); break;
      case 'nutrition': NutritionDashboard.show(); break;
      case 'recipes': CustomRecipes.show(); break;
      case 'profile': SettingsPage.show(); break;
      default: HomePage.show();
    }
  },

  async startWizard() {
    const existing = await (this._encryptionReady ? Store.getProfile() : Promise.resolve(Store.getProfile()));
    ProfileForm.start(existing, () => { this.navigate('home'); });
  },

  async generatePlan() {
    const profile = this._encryptionReady ? await Store.getProfile() : Store.getProfile();
    if (!profile) {
      Helpers.toast('请先填写饮食档案');
      this.startWizard();
      return;
    }
    if (this._loading) return;
    this._loading = true;
    Helpers.toast('正在搭配菜单...');
    try {
      const plan = await MealPlanner.generateWeeklyPlan(profile);
      Store.setWeeklyPlan(plan);
      const shoppingList = MealPlanner.generateShoppingList(plan, profile);
      Store.setShoppingList(shoppingList);
      Helpers.toast('菜单安排好了！🎉');
      this.navigate('home');
    } catch (e) {
      console.warn('生成失败:', e.message);
    } finally {
      this._loading = false;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// ===== 主应用控制器 =====
const App = {
  _currentPage: 'home',
  _loading: false,

  async init() {
    // 隐藏启动画面
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          document.getElementById('app')?.classList.remove('hidden');
          this._bootApp();
        }, 400);
      }
    }, 800);
  },

  _bootApp() {
    // 绑定顶部导航
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

    // 更新导航高亮
    document.querySelectorAll('#app-nav a').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // 渲染页面
    switch (page) {
      case 'home': HomePage.show(); break;
      case 'plan': WeeklyPlan.refresh(); break;
      case 'shopping': ShoppingList.show(); break;
      case 'profile': SettingsPage.show(); break;
      default: HomePage.show();
    }
  },

  startWizard() {
    const existing = Store.getProfile();
    ProfileForm.start(existing, () => {
      this.navigate('home');
    });
  },

  async generatePlan() {
    const profile = Store.getProfile();
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
      Helpers.toast('哎呀，出了点问题: ' + (e.message || ''));
    } finally {
      this._loading = false;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

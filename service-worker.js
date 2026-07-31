// ===== 全日健康 Service Worker(手机端优先增强版)=====
// 提供离线缓存支持，确保无网络也可使用
// 更新版本号后,已安装用户会自动拉取新缓存
// 注意:所有路径使用【相对路径】,同时兼容 GitHub Pages 子路径部署
//      (https://user.github.io/repo/) 与 根路径部署 (https://domain.com/)

const CACHE_NAME = 'quanri-v3';

// 需要预缓存的资源(全量核心文件,离线可用)
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/i18n/zh-CN.js',
  './js/i18n/en-US.js',
  './js/storage/localStore.js',
  './js/storage/cryptoStore.js',
  './js/data/recipes.js',
  './js/data/prices.js',
  './js/data/exercises.js',
  './js/data/posture.js',
  './js/data/sleep.js',
  './js/data/healthTips.js',
  './js/data/healthSurvey.js',
  './js/data/mentalHealth.js',
  './js/data/dailyPlan.js',
  './js/data/assessments.js',
  './js/data/personalityTypes.js',
  './js/data/scoringWeights.js',
  './js/data/chineseNorms.js',
  './js/data/activities.js',
  './js/utils/helpers.js',
  './js/utils/icons.js',
  './js/utils/i18n.js',
  './js/engine/nutrition.js',
  './js/engine/dietEngine.js',
  './js/engine/exercisePrescription.js',
  './js/engine/aiHealth.js',
  './js/engine/timelineEngine.js',
  './js/engine/mealPlanner.js',
  './js/components/profileForm.js',
  './js/components/weeklyPlan.js',
  './js/components/recipeCard.js',
  './js/components/shoppingList.js',
  './js/components/homePage.js',
  './js/components/fitnessView.js',
  './js/components/mentalView.js',
  './js/components/breathingGuide.js',
  './js/components/sleepChecklist.js',
  './js/components/healthSurveyView.js',
  './js/components/planView.js',
  './js/components/timelineView.js',
  './js/components/nutritionDashboard.js',
  './js/components/exportShare.js',
  './js/components/customRecipes.js',
  './js/components/familyMode.js',
  './js/components/historyView.js',
  './js/components/settingsPage.js',
  './js/components/careerView.js',
  './js/components/psyAssessment.js',
  './js/app.js',
  './assets/app-icon-180.png',
  './assets/app-icon-192.png',
  './assets/app-icon-512.png',
];

// 安装：预缓存核心资源（单个文件失败不影响其他文件）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('SW cache failed for:', url, e.message);
        }
      }
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// 拦截请求：网络优先 + 离线兜底（保证数据永远是新的，断网时用缓存）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 不对 API 请求缓存（保护 API Key 不落入缓存）
  if (url.pathname.includes('/api/proxy') ||
      url.pathname === '/api/health' ||
      url.pathname === '/proxy' ||
      url.pathname.includes('/v1/chat/completions')) {
    return;
  }

  // 页面导航：网络优先，失败回退缓存首页
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 静态资源：缓存优先（快）+ 后台更新
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

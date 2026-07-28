// ===== 三餐指南 Service Worker =====
// 提供离线缓存支持，确保无网络也可使用

const CACHE_NAME = 'tcan-v1';

// 需要预缓存的资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/i18n/zh-CN.js',
  '/js/storage/localStore.js',
  '/js/data/recipes.js',
  '/js/utils/helpers.js',
  '/js/engine/nutrition.js',
  '/js/engine/dietEngine.js',
  '/js/engine/mealPlanner.js',
  '/js/components/homePage.js',
  '/js/components/profileForm.js',
  '/js/components/weeklyPlan.js',
  '/js/components/recipeCard.js',
  '/js/components/shoppingList.js',
  '/js/components/settingsPage.js',
  '/js/app.js',
  '/manifest.json',
];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
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

// 拦截请求：缓存优先，降级到网络
self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') return;

  // 不对 API 请求缓存（保护 API Key 不落入缓存）
  if (event.request.url.includes('/v1/chat/completions') ||
      event.request.url.includes('api.openai.com') ||
      event.request.url.includes('api.anthropic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // 只缓存有效响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 缓存 JS/CSS/HTML
        const url = new URL(event.request.url);
        if (url.pathname.match(/\.(html|css|js|json)$/)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // 离线时返回缓存的首页
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('离线模式', { status: 503 });
      });
    })
  );
});

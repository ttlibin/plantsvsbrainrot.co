// Service Worker for PWA壳方案
const CACHE_NAME = 'pvsb-game-v1';
const GAME_CACHE_NAME = 'pvsb-game-content-v1';

// 游戏资源URL列表
const GAME_URLS = {
    'yandex': 'https://yandex.com/games/app/471072?utm_source=distrib',
    'minplay': 'https://www.minplay.com/embed/plants-vs-brainrot-zombies',
    'crazygames': 'https://www.crazygames.com/embed/plants-vs-zombies',
    'roblox': 'https://www.roblox.com/games/1234567890/Plants-vs-Brainrots'
};

// 安装事件
self.addEventListener('install', (event) => {
    console.log('PWA Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/play.html',
                '/sw.js',
                // 添加其他必要资源
            ]);
        })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('PWA Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== GAME_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截网络请求 - 简化版本
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // 只处理基本的PWA资源缓存，不再处理复杂的游戏路由
    // 游戏现在通过直接的DOM嵌入处理，不需要Service Worker路由

    // 标准缓存策略 - 优先使用缓存，然后网络请求
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request);
        })
    );
});



// 消息处理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GAME_LAUNCH') {
        const { platform, url } = event.data;
        console.log(`PWA: Launching ${platform} game`);

        // 发送游戏启动事件
        event.ports[0].postMessage({
            type: 'GAME_LAUNCHED',
            platform: platform,
            url: url,
            timestamp: Date.now()
        });
    }
});
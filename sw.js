// Service Worker — Kalkulator PV
// prices.js jest CELOWO wyłączony z cache (plik prywatny)
const CACHE = 'pv-kalkulator-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // prices.js NIE jest tutaj - nie cache'ujemy bazy cenowej
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // prices.js - zawsze świeży (nigdy z cache)
  if (e.request.url.includes('prices.js')) {
    e.respondWith(fetch(e.request).catch(() => new Response('window.PRODUCTS={modules:[],inverters:[],batteries:[]};', {headers:{'Content-Type':'application/javascript'}})));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

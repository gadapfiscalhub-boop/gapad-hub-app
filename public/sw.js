const CACHE_NAME = 'gadap-field-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/login',
  '/selecionar-obra',
  '/orcamentos/novo',
  '/materiais',
  '/ponto',
  '/diario',
  '/manifest.json',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Instalação: Pré-cache dos ativos essenciais do canteiro
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estratégia Network First com Fallback para Cache nas navegações
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requisições que não sejam GET ou sejam extensões do browser
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Navegações de página (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/selecionar-obra') || caches.match('/login');
        })
    );
    return;
  }

  // Recursos estáticos (imagens, scripts, CSS) - Cache First com network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Se for imagem e falhar a rede, pode retornar vazio ou ícone padrão
          return null;
        });
    })
  );
});

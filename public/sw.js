// Service worker da prancha: guarda o app no aparelho para abrir mesmo sem internet.
// Nunca guarda as rotas /api (dados e fotos da família vêm sempre do servidor ou do IndexedDB).
const VERSAO = "prancha-v1";
const ESSENCIAL = ["/prancha", "/manifest.webmanifest", "/icons/icone-192.png", "/icons/icone-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ESSENCIAL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // arquivos com nome versionado (código, fontes, ícones): do cache primeiro
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(
      caches.match(req).then((achado) => achado || fetch(req).then((resp) => {
        if (resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
        return resp;
      }))
    );
    return;
  }

  // páginas: da internet primeiro (para pegar atualizações); sem internet, a última cópia
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((resp) => {
        if (resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then((c) => c.put(url.pathname, copia)); }
        return resp;
      }).catch(() => caches.match(url.pathname).then((r) => r || caches.match("/prancha")))
    );
  }
});

// ============================================================
// Hash-based SPA Router
// ============================================================

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

async function handleRoute() {
  const pathWithQuery = getCurrentRoute();
  const path = pathWithQuery.split('?')[0];
  const app = document.getElementById('app');

  // Clean up previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route
  const handler = routes[path] || routes['/'];
  if (handler) {
    app.innerHTML = '';
    currentCleanup = await handler(app);
  } else {
    app.innerHTML = `
      <div class="login-layout">
        <div class="login-card text-center">
          <h2>404</h2>
          <p class="text-muted" style="margin:16px 0">Halaman tidak ditemukan</p>
          <button class="btn btn-primary" onclick="location.hash='/'">Kembali ke Menu</button>
        </div>
      </div>
    `;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  // Initial route
  handleRoute();
}

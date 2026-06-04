import { store } from '../store.js';
import { navigate } from '../router.js';

export default function render(container) {
  container.innerHTML = `
    <div class="login-layout">
      <!-- Decorative background elements -->
      <div style="position:absolute; inset:0; overflow:hidden; opacity:0.1; pointer-events:none;">
        <svg style="position:absolute; top:10%; left:5%; width:150px; height:150px; transform:rotate(-15deg)" viewBox="0 0 24 24" fill="var(--color-primary)"><path d="M11 2v9h2V2h-2zm-4 2.5v6.5h2V4.5H7zm8 0v6.5h2V4.5h-2zM8 12.5v7.5h8v-7.5H8z"/></svg>
        <svg style="position:absolute; bottom:15%; right:10%; width:200px; height:200px; transform:rotate(25deg)" viewBox="0 0 24 24" fill="var(--color-primary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
      </div>

      <div class="login-card animate-scale-in">
        <div class="text-center" style="margin-bottom: var(--space-xl)">
          <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:var(--color-primary-surface); margin-bottom:var(--space-md)">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" style="width:32px; height:32px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9a2 2 0 114 0v2"/></svg>
          </div>
          <h1 class="text-primary" style="margin-bottom: var(--space-xs)">Suka Bakar Dimsum</h1>
          <p class="text-muted">Admin Terminal Access</p>
        </div>

        <form id="login-form">
          <div class="input-group" style="margin-bottom: var(--space-base)">
            <label class="input-label">Username</label>
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" id="username" class="input" placeholder="Enter staff ID" required autocomplete="username">
            </div>
          </div>

          <div class="input-group" style="margin-bottom: var(--space-xl)">
            <label class="input-label">Password</label>
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input type="password" id="password" class="input" placeholder="Enter password" required autocomplete="current-password">
            </div>
          </div>

          <button type="submit" class="btn btn-yellow w-full btn-lg">
            LOGIN <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div class="text-center text-xs text-muted" style="margin-top: var(--space-3xl)">
          <div class="flex justify-center gap-md" style="margin-bottom: var(--space-md)">
            <a href="#" class="text-muted" style="text-decoration:none">Bantuan</a>
            <span>•</span>
            <a href="#" class="text-muted" style="text-decoration:none">Privasi</a>
            <span>•</span>
            <a href="#" class="text-muted" style="text-decoration:none">Syarat & Ketentuan</a>
          </div>
          <p>© 2026 Suka Bakar Dimsum</p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = container.querySelector('#username').value.trim();
    const password = container.querySelector('#password').value;
    
    if (username && password) {
      const success = store.login(username, password);
      if (success) {
        navigate('/order');
      } else {
        alert('Username atau password salah!');
      }
    }
  });

  // Focus username field on load
  setTimeout(() => {
    const usernameInput = container.querySelector('#username');
    if (usernameInput) usernameInput.focus();
  }, 100);

  return () => {
    // Cleanup if needed
  };
}

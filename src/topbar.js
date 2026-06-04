import { store } from './store.js';
import { icons, formatRupiah } from './utils.js';

export function renderSharedTopbar(title = 'Suka Bakar Dimsum', options = {}) {
  const showSearch = options.showSearch || false;
  const searchPlaceholder = options.searchPlaceholder || 'Cari...';
  const searchId = options.searchId || 'search-input';
  const searchValue = options.searchValue || '';
  const actionsHtml = options.actionsHtml || '';
  const unreadCount = store.notifications.length;

  return `
    <header class="topbar" style="position: relative;">
      <span class="topbar-title">${title}</span>
      
      ${showSearch ? `
        <div class="search-bar">
          ${icons.search}
          <input type="text" placeholder="${searchPlaceholder}" id="${searchId}" value="${searchValue}">
        </div>
      ` : ''}
      
      <div class="topbar-actions" style="position: relative;">
        ${actionsHtml}
        
        <button class="btn-icon btn-outline flex items-center justify-center" id="btn-bell" style="position: relative;">
          ${icons.bell}
          ${unreadCount > 0 ? `
            <span style="position: absolute; top: -6px; right: -6px; background: var(--color-error); color: white; border: 2px solid var(--color-text); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 1px 1px 0 var(--color-text);">
              ${unreadCount}
            </span>
          ` : ''}
        </button>
        
        <!-- Notifications Dropdown -->
        <div id="notifications-dropdown" style="display: none; position: absolute; top: 48px; right: 80px; width: 320px; background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); border-radius: var(--radius-md); z-index: 1000; padding: var(--space-md); flex-direction: column; gap: var(--space-sm);">
          <div class="flex justify-between items-center" style="border-bottom: 2px solid var(--color-text); padding-bottom: var(--space-xs); margin-bottom: 4px;">
            <span class="text-bold" style="font-size: 14px;">🔔 Notifikasi (${unreadCount})</span>
            ${unreadCount > 0 ? `<button class="btn-ghost text-xs text-bold" id="btn-clear-notifications" style="text-decoration: underline; color: var(--color-text-muted); cursor: pointer; padding:0; background:none; border:none;">Hapus Semua</button>` : ''}
          </div>
          
          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-xs);">
            ${store.notifications.length === 0 ? `
              <div class="text-center text-muted" style="padding: 20px 0; font-size: 13px;">Tidak ada notifikasi baru</div>
            ` : store.notifications.map(n => `
              <div class="card-flat btn-toast-notif-item animate-scale-in" data-route="${n.actionRoute || ''}" style="padding: 8px 12px; background: var(--color-primary-surface); border: 1.5px solid var(--color-text); border-radius: var(--radius-sm); font-size: 12px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; position: relative;">
                <div class="flex justify-between items-start">
                  <span class="text-bold" style="color: var(--color-primary);">${n.title}</span>
                  <button class="btn-dismiss-notif" data-id="${n.id}" style="border: none; background: none; font-size: 12px; cursor: pointer; color: var(--color-text-muted); font-weight: bold; z-index: 10;">✕</button>
                </div>
                <div style="font-weight: bold; line-height: 1.3; text-align: left; color: var(--color-text);">${n.text}</div>
                <div class="text-xs text-muted" style="text-align: right; font-size: 10px;">${new Date(n.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <a href="#/settings" class="btn-icon btn-outline flex items-center justify-center">
          ${icons.settings}
        </a>
        <div class="avatar">${icons.user}</div>
      </div>
    </header>
  `;
}

export function setupTopbarListeners(container) {
  // Notification dropdown toggle
  const btnBell = container.querySelector('#btn-bell');
  const dropdownNotif = container.querySelector('#notifications-dropdown');
  if (btnBell && dropdownNotif) {
    btnBell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdownNotif.style.display === 'none';
      dropdownNotif.style.display = isHidden ? 'flex' : 'none';
    });

    document.addEventListener('click', () => {
      dropdownNotif.style.display = 'none';
    });

    dropdownNotif.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Dismiss single notification
  container.querySelectorAll('.btn-dismiss-notif').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.dismissNotification(btn.dataset.id);
    });
  });

  // Clear all notifications
  const btnClearNotif = container.querySelector('#btn-clear-notifications');
  if (btnClearNotif) {
    btnClearNotif.addEventListener('click', (e) => {
      e.stopPropagation();
      store.clearNotifications();
    });
  }

  // Click notification card to navigate
  container.querySelectorAll('.btn-toast-notif-item').forEach(item => {
    item.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('btn-dismiss-notif') || ev.target.closest('.btn-dismiss-notif')) return;
      const route = item.dataset.route;
      if (route) {
        window.location.hash = route;
      }
    });
  });
}

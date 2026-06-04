import { store } from '../store.js';
import { navigate } from '../router.js';
import { formatRupiah, icons, $, $$ } from '../utils.js';

function renderSidebar(activePage) {
  const _role = (store.currentUser?.role || '').toLowerCase();
  const _canTables = _role === 'owner' || _role === 'manager';
  const navItems = [
    { id: 'pos', label: 'Order', icon: icons.restaurant, route: '#/order' },
    { id: 'inventory', label: 'Inventory', icon: icons.inventory, route: '#/inventory' },
    { id: 'expenses', label: 'Expenses', icon: icons.expenses, route: '#/expenses' },
    { id: 'reports', label: 'Reports', icon: icons.reports, route: '#/reports' },
    { id: 'menu', label: 'Menu', icon: icons.menu, route: '#/menu' },
  ];

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">🍜</div>
        <div class="sidebar-brand-text">
          <h2>Suka Bakar Dimsum</h2>
          <p>Dimsum &amp; More</p>
        </div>
      </div>
      <div class="sidebar-new-order" style="padding: 0 var(--space-lg) var(--space-md) var(--space-lg);">
        <a href="#/order" class="btn btn-yellow w-full" style="text-decoration:none; justify-content:center;">
          ${icons.plus} New Order
        </a>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="${item.route}" class="sidebar-nav-item ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
            ${item.icon} <span style="margin-left:8px">${item.label}</span>
          </a>
        `).join('')}
        <hr class="sidebar-separator">
        <a href="#/settings" class="sidebar-nav-item ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
          ${icons.settings} <span style="margin-left:8px">Settings</span>
        </a>
      </nav>
      <div class="sidebar-footer" style="padding: var(--space-lg); border-top: 2px solid var(--color-border);">
        <button class="btn btn-outline text-error w-full" id="btn-logout" style="height: 44px; border: 2px solid var(--color-error); box-shadow: 3px 3px 0 var(--color-error); justify-content: center; font-weight: bold; background: var(--color-error-light); display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--font-family);" onclick="document.dispatchEvent(new CustomEvent('do-logout'))">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 20px; height: 20px; flex-shrink: 0;"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  `;
}


export default function render(container) {
  if (store.cart.length === 0) {
    navigate('/');
    return;
  }

  const total = store.getCartTotal();

  container.innerHTML = `
    <div class="app-shell animate-fade-in">
      ${renderSidebar('pos')}
      <main class="main-content" style="background: var(--color-primary-surface); padding: 24px 16px;">

        <div style="width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; margin: 0 auto;">

          <!-- Header Order Info -->
          <div style="background: var(--color-primary); border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); border-radius: var(--radius-md); padding: 14px 20px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1px;">Order #${store.nextOrderNumber}</div>
              <div style="font-size:13px; font-weight:700; color:white; margin-top:2px;">${store.cart.length} item · Bayar via QRIS</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.7);">Total</div>
              <div style="font-size:24px; font-weight:900; color:#fce354; line-height:1.1;">${formatRupiah(total)}</div>
            </div>
          </div>

          <!-- Main QRIS Card -->
          <div style="background:white; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); border-radius: var(--radius-md); overflow: hidden;">

            <!-- QRIS Header Bar -->
            <div style="background: #e8192c; padding: 10px 16px; display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:8px;">
                <!-- QRIS Logo text -->
                <div style="background:white; padding:3px 8px; border-radius:4px; display:flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 40 18" style="height:16px; width:auto;" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="18" height="18" rx="2" fill="#e8192c"/>
                    <rect x="2" y="2" width="6" height="6" rx="1" fill="white"/>
                    <rect x="10" y="2" width="6" height="6" rx="1" fill="white"/>
                    <rect x="2" y="10" width="6" height="6" rx="1" fill="white"/>
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white"/>
                    <rect x="15" y="10" width="3" height="3" rx="0.5" fill="white"/>
                    <text x="20" y="13" font-family="Arial" font-weight="900" font-size="11" fill="#e8192c">QRIS</text>
                  </svg>
                </div>
                <span style="color:white; font-size:10px; font-weight:700;">QR Code Standar<br>Pembayaran Nasional</span>
              </div>
              <div style="background:white; padding:3px 8px; border-radius:4px;">
                <span style="font-size:10px; font-weight:900; color:#e8192c;">GPN</span>
              </div>
            </div>

            <!-- Merchant Info -->
            <div style="padding: 12px 16px 6px; text-align:center; border-bottom: 1px solid #f0f0f0;">
              <div style="font-size:15px; font-weight:900; color:#111;">Suka Bakar Dimsum</div>
              <div style="font-size:11px; color:#666; margin-top:2px;">NMID : ID1026522447931 &nbsp;·&nbsp; A01</div>
            </div>

            <!-- QR Code Image -->
            <div style="padding: 12px 24px; display:flex; flex-direction:column; align-items:center;">
              <img src="/qris-kedai-pojok.png" alt="QRIS Suka Bakar Dimsum" style="width: 100%; max-width: 260px; height: auto; display:block;">
            </div>

            <!-- Amount Banner -->
            <div style="margin: 0 16px 12px; background: #fffbeb; border: 2px solid #fbbf24; border-radius: 8px; padding: 10px 14px; display:flex; align-items:center; gap:10px;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:10px; font-weight:800; color:#92400e; text-transform:uppercase; letter-spacing:0.5px;">💰 Masukkan nominal ini</div>
                <div style="font-size:18px; font-weight:900; color:#92400e; line-height:1.2; margin-top:2px;">${formatRupiah(total)}</div>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
                <button id="btn-copy-nominal" title="Salin Nominal" style="height:32px; padding:0 10px; background:white; border:1.5px solid #f59e0b; box-shadow:2px 2px 0 #92400e; border-radius:5px; font-size:11px; font-weight:800; color:#92400e; cursor:pointer; display:flex; align-items:center; gap:5px; font-family:var(--font-family); white-space:nowrap;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Salin Nominal
                </button>
                <a href="/qris-kedai-pojok.png" download="QRIS-Kedai-Pojok-13.png" id="btn-download-qris" style="height:32px; padding:0 10px; background:#fce354; border:1.5px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); border-radius:5px; font-size:11px; font-weight:800; color:#111; cursor:pointer; display:flex; align-items:center; gap:5px; text-decoration:none; white-space:nowrap;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download QR
                </a>
              </div>
            </div>

            <!-- Footer QRIS -->
            <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:8px 16px; display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:9px; color:#9ca3af; line-height:1.6;">
                SATU QRIS UNTUK SEMUA<br>
                www.aspi-qris.id
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <div style="text-align:center; font-size:8px; color:#6b7280;">
                  <div style="width:24px; height:24px; background:#374151; border-radius:50%; margin:0 auto 2px; display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:12px;height:12px;"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  Buka Aplikasi
                </div>
                <div style="text-align:center; font-size:8px; color:#6b7280;">
                  <div style="width:24px; height:24px; background:#374151; border-radius:50%; margin:0 auto 2px; display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:12px;height:12px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </div>
                  Scan & Cek
                </div>
                <div style="text-align:center; font-size:8px; color:#6b7280;">
                  <div style="width:24px; height:24px; background:#e8192c; border-radius:50%; margin:0 auto 2px; display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:12px;height:12px;"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
                  </div>
                  Bayar
                </div>
              </div>
            </div>
          </div>

          <!-- Waiting status -->
          <div style="background:white; border: 2px solid var(--color-text); box-shadow: 3px 3px 0 var(--color-text); border-radius: var(--radius-md); padding: 12px 16px; display:flex; align-items:center; gap:10px;">
            <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" style="width:20px; height:20px; flex-shrink:0;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <div>
              <div style="font-size:13px; font-weight:800;">Menunggu pembayaran...</div>
              <div style="font-size:11px; color:var(--color-muted);">Setelah bayar, tekan tombol "Sudah Bayar" di bawah</div>
            </div>
          </div>

          <!-- Action buttons -->
          <div style="display:flex; gap:10px;">
            <button id="btn-cancel" style="flex:1; height:46px; background:white; border:2px solid var(--color-text); box-shadow:3px 3px 0 var(--color-text); border-radius:var(--radius-sm); font-size:13px; font-weight:800; cursor:pointer; font-family:var(--font-family); display:flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
              Batal / Kembali
            </button>
            <button id="btn-paid" style="flex:2; height:46px; background:#16a34a; color:white; border:2px solid var(--color-text); box-shadow:3px 3px 0 var(--color-text); border-radius:var(--radius-sm); font-size:14px; font-weight:900; cursor:pointer; font-family:var(--font-family); display:flex; align-items:center; justify-content:center; gap:8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:18px;height:18px;"><polyline points="20,6 9,17 4,12"/></svg>
              ✓ SUDAH BAYAR
            </button>
          </div>

        </div>
      </main>
    </div>
  `;

  $('#btn-cancel').addEventListener('click', () => {
    navigate('/cash-payment');
  });

  $('#btn-paid').addEventListener('click', () => {
    store.createOrder('qris', total);
    navigate('/payment-success');
  });

  // Salin nominal ke clipboard
  const btnCopy = $('#btn-copy-nominal');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(String(total)).then(() => {
        const orig = btnCopy.innerHTML;
        btnCopy.textContent = '✓ Tersalin!';
        btnCopy.style.background = '#dcfce7';
        btnCopy.style.color = '#16a34a';
        setTimeout(() => { btnCopy.innerHTML = orig; btnCopy.style.background = 'white'; btnCopy.style.color = '#92400e'; }, 1800);
      });
    });
  }

  return () => {
    // cleanup
  };
}

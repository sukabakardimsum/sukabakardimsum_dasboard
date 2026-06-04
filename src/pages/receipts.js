import { store } from '../store.js';
import { icons, formatRupiah, formatTime, formatDate } from '../utils.js';

function renderSidebar(activePage) {
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
          <p>Dimsum & More</p>
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
  const order = store.orders[0] || null;

  container.innerHTML = `
    <div class="app-shell animate-fade-in">
      ${renderSidebar('receipts')}
      <main class="main-content" style="background: var(--color-primary-surface); display: flex; align-items: flex-start; justify-content: center; padding: var(--space-4xl) var(--space-xl); overflow-y: auto;">
        
        ${order ? `
          <div class="receipt-container animate-scale-in" style="position: relative;">
            
            <div class="text-center" style="margin-bottom: var(--space-lg);">
              <h1 style="font-family: serif; font-size: 28px; font-weight: bold; margin-bottom: 8px;">SUKA BAKAR DIMSUM</h1>
              <p class="text-sm">${store.settings.address}</p>
              <p class="text-sm">Tel: ${store.settings.phone}</p>
            </div>

            <div class="divider-dashed"></div>

            <div class="text-sm" style="margin-bottom: var(--space-lg);">
              <div class="flex justify-between" style="margin-bottom: 4px;">
                <span>Order ID:</span>
                <span class="text-bold">#${order.orderNumber}</span>
              </div>
              <div class="flex justify-between" style="margin-bottom: 4px;">
                <span>Date:</span>
                <span>${formatDate(order.createdAt)}</span>
              </div>
              <div class="flex justify-between" style="margin-bottom: 4px;">
                <span>Time:</span>
                <span>${formatTime(order.createdAt)} WIB</span>
              </div>
              <div class="flex justify-between">
                <span>Cashier:</span>
                <span>${order.cashierName || store.currentUser?.name || 'Kasir'}</span>
              </div>
            </div>

            <div class="divider-dashed"></div>

            <div style="margin-bottom: var(--space-lg);">
              ${order.items.map(item => `
                <div style="margin-bottom: 8px;">
                  <div class="text-bold">${item.name}</div>
                  <div class="flex justify-between text-sm">
                    <span>${item.qty} x ${formatRupiah(item.price)}</span>
                    <span>${formatRupiah(item.price * item.qty)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="divider-dashed"></div>

            <div style="margin-bottom: var(--space-lg);">
              <div class="flex justify-between text-sm" style="margin-bottom: 4px;">
                <span>Subtotal</span>
                <span>${formatRupiah(order.subtotal)}</span>
              </div>
              <div class="flex justify-between text-sm" style="margin-bottom: 12px;">
                <span>Tax (10%)</span>
                <span>${formatRupiah(order.tax)}</span>
              </div>
              <div style="border-top: 1px solid var(--color-border); margin: 8px 0;"></div>
              <div class="flex justify-between items-center" style="background: var(--color-yellow); padding: 4px 8px; margin: 0 -8px;">
                <span class="text-bold" style="font-size: 18px;">Total</span>
                <span class="text-bold" style="font-size: 20px;">${formatRupiah(order.total)}</span>
              </div>
            </div>

            <div class="divider-dashed"></div>

            <div class="flex justify-between items-center text-sm" style="margin-bottom: var(--space-xl);">
              <span>Payment Method:</span>
              <span class="badge badge-purple">${order.paymentMethod.toUpperCase()}</span>
            </div>

            <div class="text-center" style="margin-bottom: var(--space-lg);">
              <p class="text-bold" style="margin-bottom: 4px;">Terima Kasih!</p>
              <p class="text-muted" style="font-style: italic;">"Dimsum Paling Juara."</p>
            </div>

            <div style="height: 40px; background: repeating-linear-gradient(90deg, #111, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 8px); margin: 0 auto; width: 80%; opacity: 0.8;"></div>
            <div class="text-center text-xs mt-2" style="margin-top: 8px;">09823746192837</div>

            <!-- Action Buttons Sidebar (Desktop) -->
            <div style="position: absolute; right: -220px; top: 0; width: 200px; display: flex; flex-direction: column; gap: var(--space-md);">
              <button class="btn btn-primary w-full shadow-lg" style="background: var(--color-primary); color: white;">
                ${icons.printer} Print Struk
              </button>
              <button class="btn w-full shadow-lg" style="background: #25D366; color: white; border-color: #128C7E;">
                ${icons.whatsapp} Kirim WhatsApp
              </button>
              <a href="#/orders" class="btn btn-outline w-full shadow-lg bg-white" style="text-decoration:none;">
                ✕ Tutup
              </a>
            </div>

          </div>
        ` : `
          <div class="card p-xl text-center">
            <h2>No orders yet</h2>
            <a href="#/" class="btn btn-primary mt-lg">Go to POS</a>
          </div>
        `}
      </main>
    </div>
  `;

  return () => {};
}

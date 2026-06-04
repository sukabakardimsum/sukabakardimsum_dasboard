import { store } from '../store.js';
import { navigate } from '../router.js';
import { formatRupiah, icons, $, $$ } from '../utils.js';

// --- UI Helpers ---
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
  let amountTendered = '0';
  const total = store.getCartTotal();

  if (store.cart.length === 0) {
    navigate('/');
    return;
  }

  const renderContent = () => {
    const numAmount = parseInt(amountTendered) || 0;
    const change = numAmount >= total ? numAmount - total : 0;
    const canComplete = numAmount >= total;

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('pos')}
        <main class="main-content" style="flex-direction: row; height: 100vh;">
          
          <!-- Center Payment Area -->
          <div style="flex: 1; padding: var(--space-xl); display: flex; flex-direction: column; background: var(--color-background); overflow-y: auto;">
            <div class="flex items-center gap-md" style="margin-bottom: var(--space-2xl)">
              <button class="btn-icon btn-outline" id="btn-back">
                ${icons.back}
              </button>
              <h1 style="font-size: var(--fs-headline-md)">Cash Payment</h1>
            </div>

            <div style="max-width: 480px; margin: 0 auto; width: 100%;">
              <div class="text-center" style="margin-bottom: var(--space-lg)">
                <div class="text-muted text-sm text-bold" style="letter-spacing: 0.1em">AMOUNT TENDERED</div>
                <div style="font-size: 48px; font-weight: var(--fw-bold); margin-top: 8px;">
                  ${formatRupiah(numAmount)}
                </div>
              </div>

              <div class="flex gap-sm justify-center" style="margin-bottom: var(--space-xl)">
                <button class="btn btn-outline btn-quick-amount" data-amount="100000">Rp 100.000</button>
                <button class="btn btn-yellow btn-quick-amount" data-amount="150000">Rp 150.000</button>
                <button class="btn btn-purple btn-quick-amount" data-amount="${total}" style="background: var(--color-primary); color: white;">Pas / Exact</button>
              </div>

              <!-- Numpad -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);">
                ${[1,2,3,4,5,6,7,8,9].map(num => `
                  <button class="card-flat btn-numpad" data-val="${num}" style="padding: 24px 0; font-size: 24px; font-weight: bold; background: var(--color-surface-dim); border: 2px solid var(--color-border); border-radius: 16px; cursor: pointer;">
                    ${num}
                  </button>
                `).join('')}
                <button class="card-flat btn-numpad text-error" data-val="C" style="padding: 24px 0; font-size: 24px; font-weight: bold; background: var(--color-surface-dim); border: 2px solid var(--color-border); border-radius: 16px; cursor: pointer;">
                  C
                </button>
                <button class="card-flat btn-numpad" data-val="0" style="padding: 24px 0; font-size: 24px; font-weight: bold; background: var(--color-surface-dim); border: 2px solid var(--color-border); border-radius: 16px; cursor: pointer;">
                  0
                </button>
                <button class="card-flat btn-numpad text-primary" data-val="back" style="padding: 24px 0; font-size: 24px; font-weight: bold; background: var(--color-primary-surface); border: 2px solid var(--color-border); border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
              </div>
              
              <div class="text-center" style="margin-top: 32px">
                <button class="btn btn-outline" id="btn-qris">Switch to QRIS Payment</button>
              </div>
            </div>
          </div>

          <!-- Right Order Summary -->
          <div style="width: 400px; background: var(--color-white); border-left: var(--border); padding: var(--space-xl); display: flex; flex-direction: column;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg)">
              <h2 style="font-size: var(--fs-headline-md)">Order #${store.nextOrderNumber}</h2>
              <span class="badge badge-yellow">CASH</span>
            </div>

            <div style="flex: 1; overflow-y: auto;">
              <div class="flex-col gap-sm">
                ${store.cart.map(item => `
                  <div class="flex justify-between items-start text-sm">
                    <div>
                      <span class="text-bold">${item.qty}x</span> ${item.name}
                    </div>
                    <span class="text-bold">${formatRupiah(item.price * item.qty)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="margin-top: var(--space-lg)">
              <div class="flex justify-between" style="margin-bottom: 8px;">
                <span class="text-muted">Subtotal</span>
                <span class="text-bold">${formatRupiah(store.getCartSubtotal())}</span>
              </div>
              <div class="flex justify-between" style="margin-bottom: 12px;">
                <span class="text-muted">Tax (10%)</span>
                <span class="text-bold">${formatRupiah(store.getCartTax())}</span>
              </div>
              <div class="divider"></div>
              <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
                <span class="text-bold text-lg">TOTAL</span>
                <span class="text-primary text-bold" style="font-size: 28px;">${formatRupiah(total)}</span>
              </div>
              
              <div class="card card-yellow" style="padding: var(--space-md); margin-bottom: var(--space-lg); border-color: var(--color-border)">
                <div class="text-sm text-bold mb-1">CHANGE DUE</div>
                <div style="font-size: 24px; font-weight: bold;">${formatRupiah(change)}</div>
              </div>

              <button class="btn w-full btn-lg" id="btn-complete" style="background: var(--color-primary); color: white;" ${!canComplete ? 'disabled style="opacity: 0.5; background: var(--color-text-muted)"' : ''}>
                Complete Payment
              </button>
            </div>
          </div>

        </main>
      </div>
    `;

    attachListeners();
  };

  const attachListeners = () => {
    $('#btn-back')?.addEventListener('click', () => {
      navigate('/');
    });

    $('#btn-qris')?.addEventListener('click', () => {
      navigate('/qris-payment');
    });

    $$('.btn-quick-amount').forEach(btn => {
      btn.addEventListener('click', () => {
        amountTendered = btn.dataset.amount;
        renderContent();
      });
    });

    $$('.btn-numpad').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val === 'C') {
          amountTendered = '0';
        } else if (val === 'back') {
          amountTendered = amountTendered.slice(0, -1) || '0';
        } else {
          if (amountTendered === '0') {
            amountTendered = val;
          } else {
            // max 9 digits to prevent overflow
            if (amountTendered.length < 9) {
              amountTendered += val;
            }
          }
        }
        renderContent();
      });
    });

    $('#btn-complete')?.addEventListener('click', () => {
      const numAmount = parseInt(amountTendered) || 0;
      if (numAmount >= total) {
        store.createOrder('cash', numAmount);
        navigate('/payment-success');
      }
    });
  };

  renderContent();

  const unsubscribe = store.subscribe(() => {
    // If cart was cleared unexpectedly
    if (store.cart.length === 0) {
      navigate('/');
    }
  });

  return () => {
    unsubscribe();
  };
}

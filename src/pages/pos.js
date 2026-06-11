import { store } from '../store.js';
import { navigate } from '../router.js';
import { formatRupiah, icons, foodEmojis, $, $$ } from '../utils.js';
import { renderSharedTopbar, setupTopbarListeners } from '../topbar.js';

// --- UI Helpers (Inline to keep self-contained, but could be imported) ---
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

      <div class="sidebar-footer">
        <button class="btn btn-outline text-error w-full" id="btn-logout" style="height: 44px; border: 2px solid var(--color-error); box-shadow: 3px 3px 0 var(--color-error); justify-content: center; font-weight: bold; background: var(--color-error-light); display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--font-family);" onclick="document.dispatchEvent(new CustomEvent('do-logout'))">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 20px; height: 20px; flex-shrink: 0;"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  `;
}

export default function render(container) {
  let activeCategory = 'Semua';
  let searchQuery = '';
  let activeOrderTab = 'buat'; // 'buat' | 'konfirmasi'
  let sortBy = 'default'; // 'default' | 'category' | 'price'

  const renderContent = () => {
    const pendingOrders = store.orders.filter(o => o.status === 'pending');
    const pendingCount = pendingOrders.length;

    // Filter menu items
    let filteredMenu = [...store.menuItems];
    if (activeCategory !== 'Semua') {
      filteredMenu = filteredMenu.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Sort
    if (sortBy === 'category') {
      filteredMenu.sort((a, b) => a.category.localeCompare(b.category) || a.price - b.price);
    } else if (sortBy === 'price') {
      filteredMenu.sort((a, b) => a.price - b.price);
    }

    // Tab: Konfirmasi Pesanan content
    const konfirmasiContent = `
      <div class="pos-menu-area" style="padding: var(--space-lg);">
        ${pendingOrders.length === 0 ? `
          <div style="text-align:center; padding: 80px 20px; color: var(--color-muted);">
            <div style="font-size: 56px; margin-bottom: 16px;">✅</div>
            <div class="text-bold" style="font-size: 20px; margin-bottom: 8px;">Tidak ada pesanan yang menunggu</div>
            <div class="text-sm text-muted">Semua pesanan mandiri sudah dikonfirmasi.</div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap: var(--space-base);">
            ${pendingOrders.map(order => `
              <div data-id="${order.id}" style="padding: var(--space-base); border: 2px solid var(--color-text); border-left: 6px solid #f59e0b; box-shadow: 4px 4px 0 var(--color-text); border-radius: var(--radius-md); background: #fffbeb;">
                <!-- Header -->
                <div class="flex items-center justify-between" style="margin-bottom: 10px;">
                  <div class="flex items-center gap-sm">
                    <span class="text-bold text-primary" style="font-size: 20px;">#${order.orderNumber}</span>
                    <span class="badge badge-warning" style="background:#fef3c7; color:#92400e; border-color:#f59e0b;">MENUNGGU</span>
                    ${order.table ? `<span class="badge badge-gray">${order.table}</span>` : ''}
                  </div>
                  <span class="text-muted text-sm">${new Date(order.createdAt).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <!-- Items -->
                <div style="background:white; border:1.5px solid var(--color-border); border-radius:var(--radius-sm); padding:10px 14px; margin-bottom:10px;">
                  <div class="text-xs text-bold text-muted" style="margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Item Pesanan</div>
                  ${order.items.map(item => `
                    <div class="flex justify-between" style="font-size:13px; font-weight:600; padding:3px 0; border-bottom:1px dashed var(--color-border);">
                      <span>${item.name}</span>
                      <span style="color:var(--color-muted);">x${item.qty} &nbsp;<strong style="color:var(--color-text);">${formatRupiah(item.price * item.qty)}</strong></span>
                    </div>
                  `).join('')}
                  <div class="flex justify-between" style="margin-top:8px; font-weight:800; font-size:15px;">
                    <span>Total</span>
                    <span style="color:var(--color-primary);">${formatRupiah(order.total)}</span>
                  </div>
                </div>
                ${order.notes ? `
                  <div style="background:#fef9c3; border:1.5px solid #fbbf24; border-radius:var(--radius-sm); padding:8px 12px; margin-bottom:10px; font-size:12px; font-weight:700; display:flex; gap:8px; align-items:flex-start;">
                    <span style="font-size:16px; flex-shrink:0;">📝</span>
                    <div>
                      <div style="text-transform:uppercase; letter-spacing:0.5px; font-size:10px; color:#92400e; margin-bottom:2px;">Catatan Pelanggan</div>
                      <div style="color:#78350f;">${order.notes}</div>
                    </div>
                  </div>
                ` : ''}
                <div class="flex items-center gap-sm" style="margin-bottom:12px;">
                  <span class="badge badge-gray" style="font-size:11px;">${(order.paymentMethod || 'qris').toUpperCase()}</span>
                  <span class="text-sm text-muted">Self-Service</span>
                </div>
                 <!-- Actions -->
                 <div class="flex gap-sm">
                   <button class="btn btn-outline flex-1" onclick="document.dispatchEvent(new CustomEvent('cancel-self-order', {detail: '${order.id}'}))" style="height:40px; border:2px solid var(--color-error); color:var(--color-error); background:var(--color-error-light); box-shadow:2px 2px 0 var(--color-error); font-weight:bold; font-size:13px;">✕ Batalkan</button>
                   <button class="btn btn-yellow flex-1" onclick="document.dispatchEvent(new CustomEvent('confirm-self-order', {detail: '${order.id}'}))" style="height:40px; border:2px solid var(--color-text); box-shadow:3px 3px 0 var(--color-text); font-weight:bold; font-size:13px;">✓ Terima Pesanan</button>
                 </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Tab: Buat Pesanan content (original POS)
    const buatContent = `
      ${!store.shift.isOpen ? `
        <div style="position: absolute; inset: 0; background: rgba(249, 250, 251, 0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: var(--space-xl);">
          <div class="card animate-scale-in" style="width: 100%; max-width: 480px; padding: var(--space-xl); border: 2px solid var(--color-border); box-shadow: 6px 6px 0 var(--color-border); border-radius: var(--radius-lg); position: relative; background: var(--color-white); text-align: center;">
            <div style="font-size: 64px; margin-bottom: var(--space-base);">🏪</div>
            <h2 style="font-size: 22px; font-weight: 800; margin-bottom: var(--space-sm);">Toko Sedang Tutup</h2>
            <p class="text-muted" style="font-size: 15px; margin-bottom: var(--space-lg); line-height: 1.6;">Shift belum dibuka. Buka toko terlebih dahulu melalui halaman Reports.</p>
            <a href="#/reports" class="btn btn-yellow w-full" style="text-decoration:none; justify-content:center; font-weight:bold; font-size:16px; height:48px; border:2px solid var(--color-border); box-shadow:4px 4px 0 var(--color-border); display:flex; align-items:center; gap:8px;">
              Ke Halaman Reports →
            </a>
          </div>
        </div>
      ` : ''}
      <!-- Menu Area -->
      <div class="pos-menu-area">
        <div class="category-scroll-container">
          ${store.categories.map(cat => `
            <button class="chip ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
          `).join('')}
        </div>
        <div class="product-grid" style="padding-top: 0;">
          <!-- Sort bar -->
          <div style="grid-column: 1/-1; display:flex; gap:6px; align-items:center; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:700; color:var(--color-text-muted); letter-spacing:.5px;">URUT:</span>
            <button id="pos-sort-category" style="
              height:28px; padding:0 10px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; font-family:var(--font-family);
              border: 1.5px solid var(--color-text);
              background: ${sortBy==='category'?'#111827':'white'};
              color: ${sortBy==='category'?'white':'var(--color-text)'};
              box-shadow: ${sortBy==='category'?'none':'1px 1px 0 var(--color-text)'};
            ">≡ Kategori</button>
            <button id="pos-sort-price" style="
              height:28px; padding:0 10px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; font-family:var(--font-family);
              border: 1.5px solid var(--color-text);
              background: ${sortBy==='price'?'#111827':'white'};
              color: ${sortBy==='price'?'white':'var(--color-text)'};
              box-shadow: ${sortBy==='price'?'none':'1px 1px 0 var(--color-text)'};
            ">↑ Harga</button>
          </div>
          ${filteredMenu.map(item => `
            <div class="product-card ${item.available ? 'card-interactive' : ''}" data-id="${item.id}" style="${!item.available ? 'opacity: 0.6; cursor: not-allowed;' : ''}">
              <span class="price-badge price-badge-${item.badgeColor}">${formatRupiah(item.price)}</span>
              <div class="product-card-emoji">${item.emoji || foodEmojis[item.name] || '🥟'}</div>
              <div class="product-card-name" style="text-align: left; width: 100%; margin-top: 8px;">${item.name}</div>
              ${!item.available ? `<div class="badge badge-error badge-sm" style="position: absolute; top: -10px; left: -10px;">HABIS</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <!-- Order Panel -->
      <div class="pos-order-panel">
        <div style="padding: var(--space-base); border-bottom: 2px solid var(--color-border); background: var(--color-white)">
          <h2 style="font-size: var(--fs-headline-md); margin-bottom: var(--space-sm)">Pesanan</h2>
          <div class="input-group">
            <input type="text" class="input" id="customer-name" placeholder="Nama Pelanggan" value="${store.customerName}">
          </div>
          <div class="toggle-group w-full" style="margin-top: var(--space-md); display: flex;">
            <button class="toggle-option flex-1 ${store.serviceType === 'dine-in' ? 'active' : ''}" data-type="dine-in">Makan di Sini</button>
            <button class="toggle-option flex-1 ${store.serviceType === 'takeaway' ? 'active' : ''}" data-type="takeaway">Bawa Pulang</button>
          </div>
        </div>
        <div style="flex: 0 1 auto; overflow-y: auto; padding: var(--space-base); min-height: 0;">
          ${store.cart.length === 0 ? `
            <div class="text-center text-muted" style="margin-top: 50px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
              <p>Belum ada pesanan</p>
            </div>
          ` : `
            <div class="flex-col gap-sm">
              ${store.cart.map(item => `
                <div class="card-flat" style="padding: var(--space-sm); display: flex; flex-direction: column; gap: var(--space-xs);">
                  <div class="flex justify-between items-start">
                    <span class="text-bold">${item.name}</span>
                    <span class="text-bold">${formatRupiah(item.price * item.qty)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-muted">${formatRupiah(item.price)}/item</span>
                    <div class="flex items-center gap-sm">
                      <button class="btn-icon-sm btn-outline btn-qty-minus" data-id="${item.cartId}">${icons.minus}</button>
                      <input type="number" class="text-bold input-qty" data-id="${item.cartId}" value="${item.qty}" min="1" style="width: 30px; text-align: center; border: none; background: transparent; font-size: 16px; outline: none; -moz-appearance: textfield;">
                      <button class="btn-icon-sm btn-purple btn-qty-plus" data-id="${item.cartId}" style="background: var(--color-primary); color: white;">${icons.plus}</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        <div style="padding: var(--space-base); border-top: 2px solid var(--color-border); background: var(--color-white); position: sticky; bottom: 0; z-index: 10; margin-bottom: auto;">
          <div class="flex justify-between" style="margin-bottom: 8px;">
            <span class="text-muted">Subtotal</span>
            <span class="text-bold">${formatRupiah(store.getCartSubtotal())}</span>
          </div>
          <div class="flex justify-between" style="margin-bottom: 12px;">
            <span class="text-muted">Pajak (${store.settings.taxRate}%)</span>
            <span class="text-bold">${formatRupiah(store.getCartTax())}</span>
          </div>
          <div class="divider-dashed"></div>
          <div class="flex justify-between items-center" style="margin-bottom: 16px;">
            <span class="text-bold text-lg">Total</span>
            <span class="text-bold" style="font-size: 24px;">${formatRupiah(store.getCartTotal())}</span>
          </div>
          <button class="btn btn-yellow w-full btn-lg" id="btn-checkout" ${store.cart.length === 0 ? 'disabled style="opacity:0.5"' : ''}>
            Bayar / Checkout <span style="margin-left: 8px">→</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = `
      <style>
        .input-qty::-webkit-outer-spin-button,
        .input-qty::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .order-tab-btn {
          padding: 8px 20px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          color: var(--color-text-muted);
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .order-tab-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 800;
        }
        .order-tab-btn:hover:not(.active) {
          color: var(--color-text);
          background: var(--color-surface);
        }
      </style>
      <div class="app-shell animate-fade-in">
        ${renderSidebar('pos')}
        <main class="main-content">
          ${renderSharedTopbar('Suka Bakar Dimsum', {
            showSearch: activeOrderTab === 'buat',
            searchPlaceholder: 'Cari menu...',
            searchId: 'search-input',
            searchValue: searchQuery,
            actionsHtml: `
              <div style="display:flex; border-bottom: 2px solid var(--color-border); margin-right: 8px; gap: 4px;">
                <button class="order-tab-btn ${activeOrderTab === 'buat' ? 'active' : ''}" id="tab-buat">🍽️ Buat Pesanan</button>
                <button class="order-tab-btn ${activeOrderTab === 'konfirmasi' ? 'active' : ''}" id="tab-konfirmasi" style="display:flex; align-items:center; gap:6px;">
                  🛎️ Konfirmasi
                  ${pendingCount > 0 ? `<span style="background:var(--color-error); color:white; border-radius:50%; width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; flex-shrink:0;">${pendingCount}</span>` : ''}
                </button>
              </div>
            `
          })}

          <div class="pos-layout" style="position: relative;">
            ${activeOrderTab === 'konfirmasi' ? konfirmasiContent : buatContent}
          </div>
        </main>
      </div>
    `;

    attachListeners();
  };

  const attachListeners = () => {
    // Sort buttons POS
    container.querySelector('#pos-sort-category')?.addEventListener('click', () => {
      sortBy = sortBy === 'category' ? 'default' : 'category';
      renderContent();
    });
    container.querySelector('#pos-sort-price')?.addEventListener('click', () => {
      sortBy = sortBy === 'price' ? 'default' : 'price';
      renderContent();
    });

    // Categories
    $$('.chip').forEach(el => {
      el.addEventListener('click', () => {
        activeCategory = el.dataset.category;
        renderContent();
        
        const sliderNew = container.querySelector('.category-scroll-container');
        const activeChipNew = container.querySelector('.chip.active');
        if (sliderNew && activeChipNew) {
          sliderNew.scrollTo({
            left: activeChipNew.offsetLeft - 20,
            behavior: 'smooth'
          });
        }
      });
    });

    // Drag to scroll
    const slider = container.querySelector('.category-scroll-container');
    if (slider) {
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = '';
      });
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = '';
      });
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
      });
    }

    // Search
    const searchInput = $('#search-input');
    if (searchInput) {
      searchInput.value = searchQuery;
      // focus at end of text
      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
      
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderContent();
        $('#search-input').focus(); // Re-focus after re-render
      });
    }

    // Add to Cart
    $$('.product-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const item = store.menuItems.find(i => i.id === id);
        if (item && item.available) {
          store.addToCart(item);
        }
      });
    });

    // Customer Name
    const nameInput = $('#customer-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        store.customerName = e.target.value;
      });
    }

    // Service Type
    $$('.toggle-option').forEach(el => {
      el.addEventListener('click', () => {
        store.serviceType = el.dataset.type;
        renderContent();
      });
    });

    // Qty controls
    $$('.btn-qty-minus').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        store.updateCartQty(el.dataset.id, -1);
      });
    });
    $$('.btn-qty-plus').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        store.updateCartQty(el.dataset.id, 1);
      });
    });
    $$('.input-qty').forEach(el => {
      el.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) val = 1;
        store.setCartQty(el.dataset.id, val);
      });
      el.addEventListener('focus', (e) => e.target.select());
    });

    // Checkout
    const btnCheckout = $('#btn-checkout');
    if (btnCheckout && store.cart.length > 0) {
      btnCheckout.addEventListener('click', () => {
        // In a real app, might show a payment method selection modal first.
        // For now, let's navigate to a payment method selector or just cash payment.
        // Let's use cash-payment as default entry for checkout.
        navigate('/cash-payment');
      });
    }

    // Sidebar actions
    $('#btn-lock')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('lock-terminal')));
    $('#btn-logout')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('do-logout')));

    // Tab switching: Buat / Konfirmasi
    $('#tab-buat')?.addEventListener('click', () => {
      activeOrderTab = 'buat';
      renderContent();
    });
    $('#tab-konfirmasi')?.addEventListener('click', () => {
      activeOrderTab = 'konfirmasi';
      renderContent();
    });

    // Shared topbar event listeners
    setupTopbarListeners(container);
  };

  // Event handlers on document for self-service order actions
  const handleConfirmSelfOrder = (e) => {
    const id = e.detail;
    const order = store.orders.find(o => o.id === id);
    if (order && order.status === 'pending') {
      store.confirmOrder(id);
      
      // Show dynamic neubrutalist toast
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;padding:12px 20px;border:2px solid #111827;box-shadow:4px 4px 0 #111827;border-radius:8px;background:#d1fae5;font-weight:bold;font-size:14px;color:#065f46;font-family:inherit;display:flex;align-items:center;gap:8px;';
      toast.innerHTML = `<span style="font-size:18px;">✅</span> Pesanan #${order.orderNumber} dari ${order.table || 'meja'} diterima!`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }
  };

  const handleCancelSelfOrder = (e) => {
    const id = e.detail;
    const order = store.orders.find(o => o.id === id);
    if (order && order.status === 'pending') {
      if (confirm(`Batalkan pesanan #${order.orderNumber} dari ${order.table || 'meja'}?`)) {
        store.cancelOrder(id);
        
        // Show dynamic neubrutalist toast
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;padding:12px 20px;border:2px solid #111827;box-shadow:4px 4px 0 #111827;border-radius:8px;background:#fee2e2;font-weight:bold;font-size:14px;color:#991b1b;font-family:inherit;display:flex;align-items:center;gap:8px;';
        toast.innerHTML = `<span style="font-size:18px;">❌</span> Pesanan #${order.orderNumber} dibatalkan.`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      }
    }
  };

  document.addEventListener('confirm-self-order', handleConfirmSelfOrder);
  document.addEventListener('cancel-self-order', handleCancelSelfOrder);

  // Initial render
  renderContent();

  // Subscribe to store changes
  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);

  return () => {
    unsubscribe();
    document.removeEventListener('confirm-self-order', handleConfirmSelfOrder);
    document.removeEventListener('cancel-self-order', handleCancelSelfOrder);
  };
}

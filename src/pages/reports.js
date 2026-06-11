import { store } from '../store.js';
import { icons, formatRupiah, $ } from '../utils.js';
import { renderSharedTopbar, setupTopbarListeners } from '../topbar.js';

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
  
  let activeTab = 'summary'; // 'summary', 'orders', or 'expenses'
  let activeExpenseCategory = 'All Categories';
  let timeFilter = 'today';
  let searchId = '';
  let searchDate = '';

  const getStatusBadge = (status) => {
    if (status === 'completed') return `<span class="badge badge-success">SELESAI</span>`;
    if (status === 'cancelled') return `<span class="badge badge-error">BATAL</span>`;
    if (status === 'pending') return `<span class="badge badge-warning">MENUNGGU</span>`;
    return `<span class="badge badge-warning">PROSES</span>`;
  };

  const getServiceBadge = (type) => {
    return `<span class="badge badge-yellow">${type === 'dine-in' ? 'Makan di Sini' : 'Bawa Pulang'}</span>`;
  };

  const getItemsSummary = (items) => {
    const summary = items.slice(0, 3).map(i => `${i.name} (${i.qty})`).join(', ');
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    return `${summary}${items.length > 3 ? '...' : ''} - ${count} Items`;
  };

  const renderContent = () => {
    const userRole = store.currentUser?.role?.toLowerCase() || '';
    let tabContent = '';

    // Calculate Top Products dynamically based on store.menuItems and store.orders
    const productSales = {};
    store.menuItems.forEach(item => {
      productSales[item.name] = {
        name: item.name,
        emoji: item.emoji || '🥟',
        sold: 0
      };
    });

    // Aggregate real sales from orders
    store.orders.forEach(order => {
      if (order.status === 'completed') {
        order.items.forEach(item => {
          if (productSales[item.name]) {
            productSales[item.name].sold += item.qty;
          }
        });
      }
    });

    // Sort and get the top 3
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3);

    const hasSales = topProducts.some(p => p.sold > 0);

    // Calculate dynamic values for filters
    const now = new Date();
    let filterDate = new Date();
    
    if (timeFilter === 'today') {
      filterDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'week') {
      filterDate.setDate(now.getDate() - 7);
      filterDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
      filterDate.setHours(0, 0, 0, 0);
    } else {
      filterDate.setFullYear(now.getFullYear() - 1);
      filterDate.setHours(0, 0, 0, 0);
    }

    // Filter orders by comparing local dates (not ISO strings to avoid timezone issues)
    const getLocalDateOnly = (dateStr) => {
      const d = new Date(dateStr);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    
    const getLocalDateOnlyFromDate = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const filterDateOnly = getLocalDateOnlyFromDate(filterDate);
    
    const filteredOrders = store.orders.filter(o => {
      const orderDateOnly = getLocalDateOnly(o.createdAt);
      return orderDateOnly >= filterDateOnly && o.status === 'completed';
    });
    
    const filteredExpenses = store.expenses.filter(e => {
      const expenseDateOnly = getLocalDateOnly(e.date);
      return expenseDateOnly >= filterDateOnly;
    });

    const sales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const orders = filteredOrders.length;
    const expenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = orders > 0 ? Math.floor(sales / orders) : 0;

    let chartYLabels = [];
    let chartXLabels = [];
    let chartBars = [];

    if (timeFilter === 'today') {
      chartXLabels = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const hourlySales = [0, 0, 0, 0, 0, 0, 0];
      
      filteredOrders.forEach(o => {
        const hour = new Date(o.createdAt).getHours();
        if (hour < 11) hourlySales[0] += o.total;
        else if (hour < 13) hourlySales[1] += o.total;
        else if (hour < 15) hourlySales[2] += o.total;
        else if (hour < 17) hourlySales[3] += o.total;
        else if (hour < 19) hourlySales[4] += o.total;
        else if (hour < 21) hourlySales[5] += o.total;
        else hourlySales[6] += o.total;
      });

      const maxSale = Math.max(...hourlySales, 1);
      chartYLabels = ['0', formatRupiah(Math.round(maxSale/3)), formatRupiah(Math.round(maxSale*2/3)), formatRupiah(maxSale)];
      
      chartBars = hourlySales.map((sale, i) => {
        const hPct = maxSale > 1 ? (sale / maxSale) * 100 : 0;
        const color = i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-yellow)' : 'var(--color-pink)';
        return { h: `${hPct}%`, color };
      });
    } else if (timeFilter === 'week') {
      chartXLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const dailySales = [0, 0, 0, 0, 0, 0, 0];
      
      filteredOrders.forEach(o => {
        let day = new Date(o.createdAt).getDay(); // 0 is Sun, 1 is Mon...
        // Convert to 0=Mon, 6=Sun
        day = day === 0 ? 6 : day - 1;
        if (day >= 0 && day <= 6) dailySales[day] += o.total;
      });

      const maxSale = Math.max(...dailySales, 1);
      chartYLabels = ['0', formatRupiah(Math.round(maxSale/3)), formatRupiah(Math.round(maxSale*2/3)), formatRupiah(maxSale)];

      chartBars = dailySales.map((sale, i) => {
        const hPct = maxSale > 1 ? (sale / maxSale) * 100 : 0;
        const color = i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-yellow)' : 'var(--color-pink)';
        return { h: `${hPct}%`, color };
      });
    } else if (timeFilter === 'month') {
      chartXLabels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
      const weeklySales = [0, 0, 0, 0];
      
      filteredOrders.forEach(o => {
        const date = new Date(o.createdAt).getDate();
        if (date <= 7) weeklySales[0] += o.total;
        else if (date <= 14) weeklySales[1] += o.total;
        else if (date <= 21) weeklySales[2] += o.total;
        else weeklySales[3] += o.total;
      });

      const maxSale = Math.max(...weeklySales, 1);
      chartYLabels = ['0', formatRupiah(Math.round(maxSale/3)), formatRupiah(Math.round(maxSale*2/3)), formatRupiah(maxSale)];

      chartBars = weeklySales.map((sale, i) => {
        const hPct = maxSale > 1 ? (sale / maxSale) * 100 : 0;
        const color = i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-yellow)' : 'var(--color-pink)';
        return { h: `${hPct}%`, color };
      });
    } else {
      chartXLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
      const monthlySales = [0, 0, 0, 0, 0, 0];
      
      filteredOrders.forEach(o => {
        const month = new Date(o.createdAt).getMonth(); // 0-11
        const bucket = Math.floor(month / 2); // 6 buckets
        if (bucket >= 0 && bucket <= 5) monthlySales[bucket] += o.total;
      });

      const maxSale = Math.max(...monthlySales, 1);
      chartYLabels = ['0', formatRupiah(Math.round(maxSale/3)), formatRupiah(Math.round(maxSale*2/3)), formatRupiah(maxSale)];

      chartBars = monthlySales.map((sale, i) => {
        const hPct = maxSale > 1 ? (sale / maxSale) * 100 : 0;
        const color = i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-yellow)' : 'var(--color-pink)';
        return { h: `${hPct}%`, color };
      });
    }

    // Calculate Payment Method Percentages & Nominal dynamically
    let qrisPct = 0;
    let cashPct = 0;
    let qrisCount = 0;
    let cashCount = 0;
    let cashSales = 0;
    let qrisSales = 0;
    if (filteredOrders.length > 0) {
      qrisCount = filteredOrders.filter(o => o.paymentMethod === 'qris').length;
      cashCount = filteredOrders.filter(o => o.paymentMethod === 'cash').length;
      qrisPct = Math.round((qrisCount / filteredOrders.length) * 100);
      cashPct = Math.round((cashCount / filteredOrders.length) * 100);
    }
    cashSales = filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
    qrisSales = filteredOrders.filter(o => o.paymentMethod === 'qris').reduce((s, o) => s + o.total, 0);

    // Cash Drawer Tracking
    const pettyCash   = store.shift?.pettyCash || 0;
    const saldoLaci   = pettyCash + cashSales - expenses;
    const totalAssets = saldoLaci + qrisSales;
    const shiftIsOpen = store.shift?.isOpen || false;
    const shiftStart  = store.shift?.startTime ? new Date(store.shift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;

    if (activeTab === 'summary') {
      tabContent = `
        <div class="summary-cards">
          <div class="summary-card" style="background: var(--color-pink);">
            <div class="summary-card-label">TOTAL PENJUALAN</div>
            <div class="summary-card-value">${formatRupiah(sales)}</div>
          </div>
          <div class="summary-card" style="background: var(--color-yellow);">
            <div class="summary-card-label">JUMLAH PESANAN</div>
            <div class="summary-card-value">${orders}</div>
          </div>
          <div class="summary-card" style="background: var(--color-primary-surface);">
            <div class="summary-card-label">RATA-RATA PESANAN</div>
            <div class="summary-card-value">${formatRupiah(avg)}</div>
          </div>
          <div class="summary-card" style="background: var(--color-surface-dim);">
            <div class="summary-card-label">TOTAL PENGELUARAN</div>
            <div class="summary-card-value">${formatRupiah(expenses)}</div>
          </div>
        </div>

        <!-- SALDO LACI & ARUS KAS PANEL -->
        <div style="margin-bottom: var(--space-xl); border: 2px solid var(--color-text); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 4px 4px 0 var(--color-text);">
          <!-- Panel Header -->
          <div style="background: var(--color-text); color: white; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">💵</span>
              <span style="font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">SALDO LACI & ARUS KAS</span>
              ${shiftIsOpen
                ? `<span style="background: #22c55e; color: white; font-size: 11px; font-weight: bold; padding: 2px 10px; border-radius: 999px; letter-spacing: 0.5px;">● SHIFT AKTIF</span>`
                : `<span style="background: #ef4444; color: white; font-size: 11px; font-weight: bold; padding: 2px 10px; border-radius: 999px; letter-spacing: 0.5px;">● SHIFT TUTUP</span>`
              }
            </div>
            ${shiftIsOpen && shiftStart
              ? `<span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500;">Shift dibuka pukul ${shiftStart} · Modal: ${formatRupiah(pettyCash)}</span>`
              : `<span style="font-size: 12px; color: rgba(255,255,255,0.6);">Buka toko untuk mulai tracking saldo laci</span>`
            }
          </div>

          <!-- 5 Metric Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0; background: white;">

            <!-- Modal Awal -->
            <div style="padding: 18px 20px; border-right: 2px solid var(--color-border); border-bottom: 2px solid var(--color-border); position: relative;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--color-text-muted); margin-bottom: 6px;">MODAL AWAL</div>
              <div style="font-size: 20px; font-weight: 800; color: var(--color-text); line-height: 1;">${formatRupiah(pettyCash)}</div>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">Uang awal laci</div>
              <button id="btn-edit-petty-cash" title="Edit Modal Awal" style="position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; border: 2px solid var(--color-border); border-radius: 6px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 2px 2px 0 var(--color-border); transition: box-shadow 0.1s, transform 0.1s;" onmouseover="this.style.boxShadow='1px 1px 0 var(--color-border)';this.style.transform='translate(1px,1px)'" onmouseout="this.style.boxShadow='2px 2px 0 var(--color-border)';this.style.transform=''">✏️</button>
            </div>

            <!-- Pemasukan Tunai -->
            <div style="padding: 18px 20px; border-right: 2px solid var(--color-border); border-bottom: 2px solid var(--color-border); background: #f0fdf4;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #15803d; margin-bottom: 6px;">PEMASUKAN TUNAI</div>
              <div style="font-size: 20px; font-weight: 800; color: #16a34a; line-height: 1;">${formatRupiah(cashSales)}</div>
              <div style="font-size: 11px; color: #15803d; margin-top: 4px;">${cashCount} transaksi cash</div>
            </div>

            <!-- Pemasukan QRIS -->
            <div style="padding: 18px 20px; border-right: 2px solid var(--color-border); border-bottom: 2px solid var(--color-border); background: #eff6ff;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #1d4ed8; margin-bottom: 6px;">PEMASUKAN QRIS</div>
              <div style="font-size: 20px; font-weight: 800; color: #2563eb; line-height: 1;">${formatRupiah(qrisSales)}</div>
              <div style="font-size: 11px; color: #1d4ed8; margin-top: 4px;">${qrisCount} transaksi QRIS</div>
            </div>

            <!-- Pengeluaran Kas -->
            <div style="padding: 18px 20px; border-right: 2px solid var(--color-border); border-bottom: 2px solid var(--color-border); background: #fff1f2;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #be123c; margin-bottom: 6px;">PENGELUARAN KAS</div>
              <div style="font-size: 20px; font-weight: 800; color: #e11d48; line-height: 1;">-${formatRupiah(expenses)}</div>
              <div style="font-size: 11px; color: #be123c; margin-top: 4px;">Total pengeluaran</div>
            </div>

            <!-- Saldo Laci Tunai -->
            <div style="padding: 18px 20px; border-bottom: 2px solid var(--color-border); background: #fffbeb;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #b45309; margin-bottom: 6px;">SALDO LACI TUNAI</div>
              <div style="font-size: 20px; font-weight: 800; color: ${saldoLaci >= 0 ? '#d97706' : '#dc2626'}; line-height: 1;">${formatRupiah(saldoLaci)}</div>
              <div style="font-size: 11px; color: #b45309; margin-top: 4px;">Modal + Tunai - Keluar</div>
            </div>

          </div>

          <!-- Total Aset Banner -->
          <div style="background: ${totalAssets >= 0 ? '#052e16' : '#450a0a'}; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">🏦</span>
              <span style="color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">TOTAL ASET (TUNAI + QRIS)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              <div style="text-align: right;">
                <div style="color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600;">Saldo Laci + QRIS</div>
                <div style="color: #4ade80; font-size: 24px; font-weight: 900; line-height: 1.2;">${formatRupiah(totalAssets)}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 16px; border-left: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 8px; height: 8px; border-radius: 2px; background: #4ade80; flex-shrink: 0;"></div>
                  <span style="color: rgba(255,255,255,0.7); font-size: 11px;">Tunai: ${formatRupiah(saldoLaci)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="width: 8px; height: 8px; border-radius: 2px; background: #60a5fa; flex-shrink: 0;"></div>
                  <span style="color: rgba(255,255,255,0.7); font-size: 11px;">QRIS: ${formatRupiah(qrisSales)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END SALDO LACI PANEL -->

        <div class="flex gap-lg" style="flex-wrap: wrap;">
          <div class="card" style="flex: 2; min-width: 400px; padding: var(--space-xl);">
            <h3 style="margin-bottom: var(--space-lg);">Trend Penjualan</h3>
            <div style="height: 250px; display: flex; align-items: flex-end; gap: 16px; padding-left: 40px; position: relative; border-bottom: 2px solid var(--color-border); border-left: 2px solid var(--color-border);">
              <div style="position: absolute; left: -10px; bottom: 0; font-size: 12px;" class="text-muted">${chartYLabels[0]}</div>
              <div style="position: absolute; left: -36px; bottom: 83px; font-size: 12px; width: 30px; text-align: right;" class="text-muted">${chartYLabels[1]}</div>
              <div style="position: absolute; left: -36px; bottom: 166px; font-size: 12px; width: 30px; text-align: right;" class="text-muted">${chartYLabels[2]}</div>
              <div style="position: absolute; left: -36px; bottom: 250px; font-size: 12px; width: 30px; text-align: right;" class="text-muted">${chartYLabels[3]}</div>
              <div style="position: absolute; left: 0; right: 0; bottom: 83px; border-top: 1px dashed var(--color-surface-dim); z-index: 0;"></div>
              <div style="position: absolute; left: 0; right: 0; bottom: 166px; border-top: 1px dashed var(--color-surface-dim); z-index: 0;"></div>
              <div style="position: absolute; left: 0; right: 0; bottom: 250px; border-top: 1px dashed var(--color-surface-dim); z-index: 0;"></div>
              ${chartBars.map(bar => `<div style="flex: 1; height: ${bar.h}; background: ${bar.color}; border: 2px solid var(--color-border); border-bottom: 0; border-radius: 4px 4px 0 0; z-index: 1;"></div>`).join('')}
            </div>
            <div style="display: flex; gap: 16px; padding-left: 40px; margin-top: 8px;">
              ${chartXLabels.map(label => `<div style="flex: 1; text-align: center; font-size: 12px; font-weight: bold;">${label}</div>`).join('')}
            </div>
          </div>

          <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: var(--space-lg);">
            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-md);">Produk Terlaris</h3>
              <div class="flex-col gap-sm">
                ${hasSales ? topProducts.map((p, index) => `
                  <div class="flex items-center justify-between" style="padding: 8px 0; ${index < topProducts.length - 1 ? 'border-bottom: 1px solid var(--color-surface-dim);' : ''}">
                    <div class="flex items-center gap-sm">
                      <div style="font-size: 24px;">${p.emoji}</div>
                      <span class="text-bold">${p.name}</span>
                    </div>
                    <span class="badge badge-gray">${p.sold} terjual</span>
                  </div>
                `).join('') : `
                  <div style="text-align: center; color: var(--color-text-muted); padding: 32px 0; font-size: 14px; font-weight: bold;">
                    Belum ada data penjualan.
                  </div>
                `}
              </div>
            </div>

            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-md);">Metode Pembayaran</h3>
              <div class="flex-col gap-md">
                <div>
                  <div class="flex justify-between text-sm text-bold mb-1" style="margin-bottom: 4px;">
                    <span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--color-primary);"></span>QRIS</span>
                    <span style="color:var(--color-primary);">${formatRupiah(qrisSales)}</span>
                  </div>
                  <div style="height: 12px; background: var(--color-surface-dim); border-radius: 6px; overflow: hidden; border: 2px solid var(--color-border);">
                    <div style="height: 100%; width: ${qrisPct}%; background: var(--color-primary); ${qrisPct > 0 ? 'border-right: 2px solid var(--color-border);' : ''}"></div>
                  </div>
                  <div style="font-size:11px;color:var(--color-text-muted);margin-top:3px;">${qrisCount} transaksi · ${qrisPct}%</div>
                </div>
                <div>
                  <div class="flex justify-between text-sm text-bold mb-1" style="margin-bottom: 4px;">
                    <span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:#d97706;"></span>Cash</span>
                    <span style="color:#d97706;">${formatRupiah(cashSales)}</span>
                  </div>
                  <div style="height: 12px; background: var(--color-surface-dim); border-radius: 6px; overflow: hidden; border: 2px solid var(--color-border);">
                    <div style="height: 100%; width: ${cashPct}%; background: var(--color-yellow); ${cashPct > 0 ? 'border-right: 2px solid var(--color-border);' : ''}"></div>
                  </div>
                  <div style="font-size:11px;color:var(--color-text-muted);margin-top:3px;">${cashCount} transaksi · ${cashPct}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'orders') {
      const filteredOrders = store.orders.filter(order => {
        if (searchId && !order.orderNumber.toString().includes(searchId) && !order.id.toLowerCase().includes(searchId.toLowerCase())) return false;
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        if (searchDate) {
          const d = new Date(searchDate);
          if (orderDate.toDateString() !== d.toDateString()) return false;
        }
        if (timeFilter === 'today') {
          if (orderDate.toDateString() !== today.toDateString()) return false;
        } else if (timeFilter === 'week') {
          const diffTime = Math.abs(today - orderDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays > 7) return false;
        } else if (timeFilter === 'month') {
          if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false;
        }
        return true;
      });

      tabContent = `
        <div class="flex-col gap-base" style="margin-top: var(--space-xl);">
          ${filteredOrders.map(order => `
            <div class="card-flat" data-id="${order.id}" style="padding: var(--space-base); display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg);">
              <div style="width: 120px; flex-shrink: 0;">
                <div class="text-bold text-primary" style="font-size: 18px;">#${order.orderNumber}</div>
                <div class="text-muted text-sm" style="margin-bottom: 4px;">${new Date(order.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
                ${getStatusBadge(order.status)}
              </div>
              <div style="flex: 1;">
                <div class="flex items-center gap-sm mb-1" style="margin-bottom: 8px;">
                  <span class="text-bold">${order.table || (order.serviceType === 'takeaway' ? 'Tipe Takeaway' : 'Walk-in')}</span>
                  ${getServiceBadge(order.serviceType)}
                </div>
                <div class="text-sm ${order.status === 'cancelled' ? 'text-muted' : ''}" style="${order.status === 'cancelled' ? 'text-decoration: line-through;' : ''}">
                  ${getItemsSummary(order.items)}
                </div>
              </div>
              <div class="text-right" style="width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;">
                <div class="text-bold" style="margin-bottom: 2px;">${formatRupiah(order.total)}</div>
                <div class="flex gap-xs" style="width: 100%;">
                  <a href="#/receipts" class="btn btn-outline btn-sm" style="flex: 1; padding: 4px 8px; font-size: 12px; height: 32px; display: flex; align-items: center; justify-content: center; text-decoration: none;">Detail</a>
                  ${userRole === 'owner' ? `
                    <button class="btn-icon-sm btn-outline btn-edit-order" style="height: 32px; width: 32px; flex-shrink:0; display: flex; align-items: center; justify-content: center;">${icons.edit}</button>
                    <button class="btn-icon-sm btn-outline text-error btn-delete-order" style="border-color: var(--color-error); background: var(--color-error-light); height: 32px; width: 32px; flex-shrink:0; display: flex; align-items: center; justify-content: center;">${icons.trash}</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
          ${filteredOrders.length === 0 ? '<div class="text-center text-muted" style="padding: 40px;">Tidak ada pesanan yang sesuai dengan filter.</div>' : ''}
        </div>
      `;
    } else if (activeTab === 'expenses') {
      const userRole = store.currentUser?.role?.toLowerCase() || '';
      const filteredExpenses = store.expenses.filter(exp => {
        if (userRole === 'cashier') {
          // Staff/Cashier only sees Utilities category and created by staff/cashier
          const isUtilities = (exp.category || '').toLowerCase() === 'utilities';
          const creatorRole = (exp.role || 'cashier').toLowerCase();
          const isCreatorStaff = creatorRole === 'cashier' || creatorRole === 'staff';
          if (!isUtilities || !isCreatorStaff) return false;
        } else {
          // Normal filter for Owner/Manager
          if (activeExpenseCategory !== 'All Categories' && exp.category !== activeExpenseCategory) return false;
        }
        
        const expDate = new Date(exp.date);
        const today = new Date();
        if (timeFilter === 'today') {
          if (expDate.toDateString() !== today.toDateString()) return false;
        } else if (timeFilter === 'week') {
          const diffTime = Math.abs(today - expDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays > 7) return false;
        } else if (timeFilter === 'month') {
          if (expDate.getMonth() !== today.getMonth() || expDate.getFullYear() !== today.getFullYear()) return false;
        }
        return true;
      });

      tabContent = `
        <div class="table-container" style="margin-top: var(--space-xl);">
          <table class="table">
            <thead>
              <tr>
                <th>ITEM / DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STAFF</th>
                ${userRole === 'owner' ? `<th style="text-align: center; width: 100px;">AKSI</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(exp => `
                <tr data-id="${exp.id}">
                  <td>
                    <div class="flex items-center gap-sm">
                      <div style="font-size: 20px;">${exp.icon}</div>
                      <span class="text-bold">${exp.description}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-gray">${exp.category}</span>
                  </td>
                  <td class="text-muted">
                    Hari ini, ${new Date(exp.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                  </td>
                  <td class="text-bold" style="font-size: 16px;">
                    ${formatRupiah(exp.amount)}
                  </td>
                  <td>
                    <div class="flex items-center gap-sm">
                      <div class="avatar avatar-sm">${exp.staffInitials}</div>
                      <span>${exp.staff}</span>
                    </div>
                  </td>
                  ${userRole === 'owner' ? `
                    <td>
                      <div class="flex justify-center gap-xs">
                        <button class="btn-icon-sm btn-outline btn-edit-expense" style="display: flex; align-items: center; justify-content: center;">${icons.edit}</button>
                        <button class="btn-icon-sm btn-outline text-error btn-delete-expense" style="border-color: var(--color-error); background: var(--color-error-light); display: flex; align-items: center; justify-content: center;">${icons.trash}</button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
              ${filteredExpenses.length === 0 ? `<tr><td colspan="${userRole === 'owner' ? '6' : '5'}" style="text-align: center; padding: 32px;">Tidak ada pengeluaran di kategori ini.</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('reports')}
        <main class="main-content">
          ${renderSharedTopbar('Reports', {
            actionsHtml: `
              <div class="flex gap-sm" style="position: relative; margin-right: 12px;">
                <style>
                  .dropdown-item-export {
                    transition: background 0.15s ease;
                  }
                  .dropdown-item-export:hover {
                    background: var(--color-primary-surface) !important;
                  }
                </style>
                ${!store.shift.isOpen ? `
                  <button class="btn btn-outline" id="btn-open-store" style="height: 40px; border: 2px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border); font-weight: bold;">Buka Toko</button>
                ` : `
                  <button class="btn btn-outline text-error" id="btn-close-store" style="height: 40px; border-color: var(--color-error); border-width: 2px; box-shadow: 2px 2px 0 var(--color-error); font-weight: bold;">Tutup Toko</button>
                `}
                <button class="btn btn-yellow btn-sm" id="btn-export" style="height: 40px; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); color: var(--color-text); font-weight: bold; display: flex; align-items: center; gap: 8px;">
                  ${icons.download} Export
                </button>
                
                <!-- Dropdown Menu Export -->
                <div id="export-dropdown" style="display: none; position: absolute; top: 46px; right: 0; background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); border-radius: var(--radius-md); z-index: 1000; width: 180px; flex-direction: column; overflow: hidden; padding: 4px 0;">
                  <button class="dropdown-item-export btn-export-option" data-type="excel" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; border: none; background: none; width: 100%; text-align: left; cursor: pointer; font-weight: bold; font-size: 14px;">
                    <span style="font-size: 18px;">📊</span> Excel (.xlsx)
                  </button>
                  <div style="border-top: 2px solid var(--color-text);"></div>
                  <button class="dropdown-item-export btn-export-option" data-type="pdf" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; border: none; background: none; width: 100%; text-align: left; cursor: pointer; font-weight: bold; font-size: 14px;">
                    <span style="font-size: 18px;">📕</span> PDF Document
                  </button>
                </div>
              </div>
            `
          })}
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">

            <!-- Tabs -->
            <div class="flex items-center justify-between" style="margin-bottom: var(--space-xl); border-bottom: 2px solid var(--color-surface-dim); flex-wrap: wrap; gap: var(--space-md);">
              <div class="flex gap-md" style="overflow-x: auto; padding-bottom: 2px;">
                <button class="tab-btn ${activeTab === 'summary' ? 'active text-primary' : 'text-muted'}" data-tab="summary" style="padding-bottom: 12px; cursor: pointer; border:none; background:none; font-size: 16px; font-weight:bold; ${activeTab === 'summary' ? 'border-bottom: 4px solid var(--color-primary); margin-bottom: -2px;' : ''}; white-space: nowrap;">Ringkasan</button>
                <button class="tab-btn ${activeTab === 'orders' ? 'active text-primary' : 'text-muted'}" data-tab="orders" style="padding-bottom: 12px; cursor: pointer; border:none; background:none; font-size: 16px; font-weight:bold; ${activeTab === 'orders' ? 'border-bottom: 4px solid var(--color-primary); margin-bottom: -2px;' : ''}; white-space: nowrap;">Riwayat Pesanan</button>
                <button class="tab-btn ${activeTab === 'expenses' ? 'active text-primary' : 'text-muted'}" data-tab="expenses" style="padding-bottom: 12px; cursor: pointer; border:none; background:none; font-size: 16px; font-weight:bold; ${activeTab === 'expenses' ? 'border-bottom: 4px solid var(--color-primary); margin-bottom: -2px;' : ''}; white-space: nowrap;">Riwayat Pengeluaran</button>
              </div>
              
              ${activeTab === 'summary' ? `
                <div style="padding-bottom: 8px;">
                  <select class="input" id="filter-time" style="width: auto; padding: 6px 12px; height: 36px; border: 1px solid var(--color-text); border-radius: var(--radius-sm); font-size: 14px; outline: none; cursor: pointer;">
                    <option value="today" ${timeFilter === 'today' ? 'selected' : ''}>Hari Ini</option>
                    <option value="week" ${timeFilter === 'week' ? 'selected' : ''}>Minggu Ini</option>
                    <option value="month" ${timeFilter === 'month' ? 'selected' : ''}>Bulan Ini</option>
                  </select>
                </div>
              ` : activeTab === 'orders' ? `
                <div class="flex gap-sm" style="padding-bottom: 8px; flex-wrap: wrap;">
                  <div class="input-icon">
                    ${icons.hash}
                    <input type="text" class="input" id="filter-id" value="${searchId}" placeholder="Order ID" style="width: 120px; padding: 6px 12px 6px 36px; height: 36px; border: 1px solid var(--color-text); border-radius: var(--radius-sm); font-size: 14px; outline: none;">
                  </div>
                  <select class="input" id="filter-time" style="width: auto; padding: 6px 12px; height: 36px; border: 1px solid var(--color-text); border-radius: var(--radius-sm); font-size: 14px; outline: none; cursor: pointer;">
                    <option value="today" ${timeFilter === 'today' ? 'selected' : ''}>Hari Ini</option>
                    <option value="week" ${timeFilter === 'week' ? 'selected' : ''}>Minggu Ini</option>
                    <option value="month" ${timeFilter === 'month' ? 'selected' : ''}>Bulan Ini</option>
                  </select>
                  <div class="input-icon">
                    ${icons.calendar}
                    <input type="date" class="input" id="filter-date" value="${searchDate}" style="width: 140px; padding: 6px 12px 6px 36px; height: 36px; border: 1px solid var(--color-text); border-radius: var(--radius-sm); font-size: 14px; outline: none;">
                  </div>
                </div>
              ` : activeTab === 'expenses' ? `
                <div class="flex gap-sm" style="padding-bottom: 8px; flex-wrap: wrap;">
                  <select class="input" id="filter-time" style="width: auto; padding: 6px 12px; height: 36px; border: 1px solid var(--color-text); border-radius: var(--radius-sm); font-size: 14px; outline: none; cursor: pointer;">
                    <option value="today" ${timeFilter === 'today' ? 'selected' : ''}>Hari Ini</option>
                    <option value="week" ${timeFilter === 'week' ? 'selected' : ''}>Minggu Ini</option>
                    <option value="month" ${timeFilter === 'month' ? 'selected' : ''}>Bulan Ini</option>
                  </select>
                </div>
              ` : ''}
            </div>

            ${tabContent}
          </div>
        </main>

        <!-- Modal Edit Order -->
        <div id="modal-edit-order" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); position: relative;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: bold;">Edit Pemesanan</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal-order">✕</button>
            </div>
            
            <form id="form-edit-order">
              <input type="hidden" id="edit-order-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Nama Pelanggan</label>
                  <input type="text" class="input" id="edit-order-cust" required placeholder="Ex: Budi" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>

                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Tipe Layanan</label>
                    <select class="input" id="edit-order-service" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      <option value="dine-in">Makan di Sini (Dine-in)</option>
                      <option value="takeaway">Bawa Pulang (Takeaway)</option>
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Meja / Lokasi</label>
                    <input type="text" class="input" id="edit-order-table" placeholder="Ex: Meja 4" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                  </div>
                </div>

                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Total Nilai Transaksi (Rp)</label>
                    <input type="number" class="input" id="edit-order-total" required placeholder="0" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Status Pesanan</label>
                    <select class="input" id="edit-order-status" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      <option value="completed">Selesai (Completed)</option>
                      <option value="cancelled">Batal (Cancelled)</option>
                      <option value="pending">Proses (Pending)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal-order">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Edit Expense -->
        <div id="modal-edit-expense" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); position: relative;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: bold;">Edit Pengeluaran</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal-expense">✕</button>
            </div>
            
            <form id="form-edit-expense">
              <input type="hidden" id="edit-expense-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Deskripsi Pengeluaran</label>
                  <input type="text" class="input" id="edit-expense-desc" required placeholder="Ex: Beli LPG" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>

                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Kategori</label>
                    <select class="input" id="edit-expense-category" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      <option value="Ingredients">Ingredients</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Operational">Operational</option>
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Jumlah Nilai (Rp)</label>
                    <input type="number" class="input" id="edit-expense-amount" required placeholder="0" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                  </div>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal-expense">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Buka Toko -->
        <div id="modal-open-store" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 440px; padding: var(--space-xl); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); border-radius: var(--radius-lg); position: relative; background: var(--color-white);">
            <div style="position: absolute; top: -2px; left: -2px; right: -2px; height: 12px; background: var(--color-primary); border: 2px solid var(--color-text); border-bottom: none; border-radius: var(--radius-lg) var(--radius-lg) 0 0; z-index: 0;"></div>
            
            <div class="flex items-center gap-md" style="margin-bottom: var(--space-xl); position: relative; z-index: 1; margin-top: 8px;">
              <div style="background: var(--color-yellow); border: 2px solid var(--color-text); border-radius: var(--radius-sm); padding: 8px; box-shadow: 2px 2px 0 var(--color-text); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" stroke-width="2" width="24" height="24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="12" cy="15" r="2"/></svg>
              </div>
              <div>
                <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 2px;">Buka Shift Baru</h2>
                <p class="text-sm text-muted">Masukkan jumlah uang modal awal di laci kasir.</p>
              </div>
            </div>
            
            <form id="form-open-store" style="position: relative; z-index: 1;">
              <div class="flex-col gap-xs" style="margin-bottom: var(--space-lg);">
                <label class="text-sm text-bold">Uang Modal (Petty Cash)</label>
                <div style="position: relative; display: flex; align-items: center;">
                  <span style="position: absolute; left: 16px; font-weight: bold; font-size: 18px;">Rp</span>
                  <input type="number" class="input" id="input-petty-cash" required placeholder="0" value="500000" style="padding-left: 48px; height: 48px; font-size: 18px; font-weight: bold; border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); border-radius: var(--radius-sm);">
                </div>
              </div>

              <div style="background: var(--color-primary-surface); border: 1px dashed var(--color-primary); border-radius: var(--radius-md); padding: var(--space-md); display: flex; gap: var(--space-sm); align-items: flex-start; margin-bottom: var(--space-xl);">
                <div class="text-primary" style="margin-top: 2px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <p class="text-xs" style="color: var(--color-primary); line-height: 1.5; font-weight: 500;">
                  Pastikan jumlah uang fisik di laci sesuai dengan angka yang Anda masukkan untuk akurasi laporan akhir hari.
                </p>
              </div>

              <div class="flex items-center justify-between">
                <button type="button" class="btn-ghost text-sm text-bold" id="btn-cancel-store-modal" style="text-decoration: underline; color: var(--color-text-muted);">Batal</button>
                <button type="submit" class="btn btn-yellow" style="border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); font-weight: bold; padding: 0 24px; height: 44px; display: flex; align-items: center; gap: 8px;">
                  Mulai Transaksi →
                </button>
              </div>
            </form>
          </div>
        </div>
        <!-- Modal Edit Modal Awal Laci -->
        <div id="modal-edit-petty-cash" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 420px; padding: var(--space-xl); background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); border-radius: var(--radius-lg); position: relative;">
            <div style="position: absolute; top: -2px; left: -2px; right: -2px; height: 10px; background: var(--color-yellow); border: 2px solid var(--color-text); border-bottom: none; border-radius: var(--radius-lg) var(--radius-lg) 0 0;"></div>

            <div class="flex items-center gap-md" style="margin-bottom: var(--space-lg); margin-top: 8px;">
              <div style="background: var(--color-yellow); border: 2px solid var(--color-text); border-radius: var(--radius-sm); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 2px 2px 0 var(--color-text); flex-shrink: 0;">💵</div>
              <div>
                <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 2px;">Edit Modal Awal Laci</h2>
                <p class="text-sm text-muted">Koreksi jumlah uang fisik di laci kasir.</p>
              </div>
            </div>

            <form id="form-edit-petty-cash">
              <div class="flex-col gap-xs" style="margin-bottom: var(--space-md);">
                <label class="text-sm text-bold">Jumlah Modal Awal (Rp)</label>
                <div style="position: relative; display: flex; align-items: center;">
                  <span style="position: absolute; left: 14px; font-weight: bold; font-size: 16px; color: var(--color-text-muted);">Rp</span>
                  <input type="number" class="input" id="input-edit-petty-cash" min="0" placeholder="0" style="padding-left: 44px; height: 48px; font-size: 18px; font-weight: bold; border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); border-radius: var(--radius-sm); width: 100%;">
                </div>
              </div>

              <div style="background: #fffbeb; border: 1px dashed #d97706; border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); display: flex; gap: 8px; align-items: flex-start;">
                <span style="font-size: 16px; flex-shrink:0;">⚠️</span>
                <p class="text-xs" style="color: #92400e; line-height: 1.5; font-weight: 500;">Perubahan ini hanya mengkoreksi <b>modal awal</b>. Waktu buka shift tidak akan berubah. Pastikan jumlah sesuai uang fisik di laci.</p>
              </div>

              <div class="flex gap-sm">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-edit-petty-cash">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); font-weight: bold;">💾 Simpan</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    attachListeners();
  };

  const attachListeners = () => {
    setupTopbarListeners(container);
    const btnOpenStore = container.querySelector('#btn-open-store');
    const modalStore = container.querySelector('#modal-open-store');
    const formStore = container.querySelector('#form-open-store');
    const inputPettyCash = container.querySelector('#input-petty-cash');

    // Export Dropdown Listeners
    const btnExport = container.querySelector('#btn-export');
    const dropdownExport = container.querySelector('#export-dropdown');
    
    if (btnExport && dropdownExport) {
      btnExport.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dropdownExport.style.display === 'none';
        dropdownExport.style.display = isHidden ? 'flex' : 'none';
      });
      
      document.addEventListener('click', () => {
        dropdownExport.style.display = 'none';
      });
    }

    container.querySelectorAll('.btn-export-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        dropdownExport.style.display = 'none';
        
        const alertMsg = type === 'excel' ? 'Mengekspor laporan ke file Excel (.csv)...' : 'Mengekspor laporan ke file PDF...';
        const successMsg = type === 'excel' ? '✓ Ekspor Selesai! Laporan Excel (.csv) berhasil diunduh.' : '✓ Ekspor Selesai! Laporan PDF berhasil diunduh.';
        
        // Neubrutalist Toast
        const toast = document.createElement('div');
        toast.className = 'card animate-scale-in';
        toast.style = 'position: fixed; top: 24px; right: 24px; z-index: 9999; padding: var(--space-md) var(--space-lg); border: 2px solid var(--color-border); box-shadow: 4px 4px 0 var(--color-border); border-radius: var(--radius-md); background: var(--color-yellow); font-weight: bold; display: flex; align-items: center; gap: 8px; font-family: var(--font-family); font-size: 14px; color: var(--color-text);';
        toast.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          <span>${alertMsg}</span>
        `;
        document.body.appendChild(toast);
        
        // Add animated spin style keyframes dynamically if not present
        if (!document.getElementById('toast-spin-style')) {
          const style = document.createElement('style');
          style.id = 'toast-spin-style';
          style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }

        // ==========================================
        // DATA EXPORTERS & AUTOMATIC TRIGGERS
        // ==========================================
        const generateCSVString = () => {
          let csv = '';
          const todayStr = new Date().toLocaleDateString('id-ID');
          
          if (activeTab === 'summary') {
            // Ringkasan — menggunakan data real
            const csvAvg = filteredOrders.length > 0 ? Math.floor(sales / filteredOrders.length) : 0;
            const csvCashSales = filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
            const csvQrisSales = filteredOrders.filter(o => o.paymentMethod === 'qris').reduce((s, o) => s + o.total, 0);
            const csvCashCount = filteredOrders.filter(o => o.paymentMethod === 'cash').length;
            const csvQrisCount = filteredOrders.filter(o => o.paymentMethod === 'qris').length;
            const csvPettyCash = store.shift?.pettyCash || 0;
            const csvSaldoLaci = csvPettyCash + csvCashSales - expenses;
            const csvTotalAssets = csvSaldoLaci + csvQrisSales;
            
            csv += `Laporan Ringkasan Suka Bakar Dimsum\n`;
            csv += `Filter Waktu;${timeFilter.toUpperCase()}\n`;
            csv += `Tanggal Ekspor;${todayStr}\n\n`;
            csv += `METRIK;NILAI\n`;
            csv += `Total Penjualan;${sales}\n`;
            csv += `Jumlah Pesanan;${filteredOrders.length}\n`;
            csv += `Rata-rata Pesanan;${csvAvg}\n`;
            csv += `Total Pengeluaran;${expenses}\n\n`;
            csv += `SALDO LACI & ARUS KAS;NILAI\n`;
            csv += `Modal Awal Laci;${csvPettyCash}\n`;
            csv += `Pemasukan Tunai (${csvCashCount} transaksi);${csvCashSales}\n`;
            csv += `Pemasukan QRIS (${csvQrisCount} transaksi);${csvQrisSales}\n`;
            csv += `Pengeluaran Kas;${expenses}\n`;
            csv += `Saldo Laci Tunai;${csvSaldoLaci}\n`;
            csv += `Total Aset (Tunai + QRIS);${csvTotalAssets}\n`;
          } else if (activeTab === 'orders') {
            // Riwayat Pesanan
            const filteredOrders = store.orders.filter(order => {
              if (searchId && !order.orderNumber.toString().includes(searchId) && !order.id.toLowerCase().includes(searchId.toLowerCase())) return false;
              const orderDate = new Date(order.createdAt);
              const today = new Date();
              if (searchDate) {
                const d = new Date(searchDate);
                if (orderDate.toDateString() !== d.toDateString()) return false;
              }
              if (timeFilter === 'today') {
                if (orderDate.toDateString() !== today.toDateString()) return false;
              } else if (timeFilter === 'week') {
                const diffTime = Math.abs(today - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays > 7) return false;
              } else if (timeFilter === 'month') {
                if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false;
              }
              return true;
            });
            
            csv += `Laporan Riwayat Pesanan Suka Bakar Dimsum\n`;
            csv += `Tanggal Ekspor;${todayStr}\n\n`;
            csv += `NOMOR PESANAN;NAMA PELANGGAN;MEJA/LOKASI;LAYANAN;TOTAL;STATUS;WAKTU\n`;
            
            filteredOrders.forEach(o => {
              const statusStr = o.status === 'completed' ? 'Selesai' : o.status === 'cancelled' ? 'Batal' : 'Proses';
              const serviceStr = o.serviceType === 'dine-in' ? 'Dine-in' : 'Takeaway';
              csv += `#${o.orderNumber};${o.customerName};${o.table || 'Walk-in'};${serviceStr};${o.total};${statusStr};${new Date(o.createdAt).toLocaleString('id-ID')}\n`;
            });
          } else if (activeTab === 'expenses') {
            // Riwayat Pengeluaran
            const userRole = store.currentUser?.role?.toLowerCase() || '';
            const filteredExpenses = store.expenses.filter(exp => {
              if (userRole === 'cashier') {
                const isUtilities = (exp.category || '').toLowerCase() === 'utilities';
                const creatorRole = (exp.role || 'cashier').toLowerCase();
                const isCreatorStaff = creatorRole === 'cashier' || creatorRole === 'staff';
                if (!isUtilities || !isCreatorStaff) return false;
              } else {
                if (activeExpenseCategory !== 'All Categories' && exp.category !== activeExpenseCategory) return false;
              }
              
              const expDate = new Date(exp.date);
              const today = new Date();
              if (timeFilter === 'today') {
                if (expDate.toDateString() !== today.toDateString()) return false;
              } else if (timeFilter === 'week') {
                const diffTime = Math.abs(today - expDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays > 7) return false;
              } else if (timeFilter === 'month') {
                if (expDate.getMonth() !== today.getMonth() || expDate.getFullYear() !== today.getFullYear()) return false;
              }
              return true;
            });
            
            csv += `Laporan Riwayat Pengeluaran Suka Bakar Dimsum\n`;
            csv += `Tanggal Ekspor;${todayStr}\n\n`;
            csv += `DESKRIPSI;KATEGORI;JUMLAH;KARYAWAN;WAKTU\n`;
            
            filteredExpenses.forEach(e => {
              csv += `${e.description};${e.category};${e.amount};${e.staff};${new Date(e.date).toLocaleString('id-ID')}\n`;
            });
          }
          
          return csv;
        };

        const triggerPDFExport = () => {
          const todayStr = new Date().toLocaleString('id-ID');
          let htmlContent = '';
          
          if (activeTab === 'summary') {
            // PDF Export — menggunakan data real
            const pdfAvg = filteredOrders.length > 0 ? Math.floor(sales / filteredOrders.length) : 0;
            const pdfCashSales = filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
            const pdfQrisSales = filteredOrders.filter(o => o.paymentMethod === 'qris').reduce((s, o) => s + o.total, 0);
            const pdfCashCount = filteredOrders.filter(o => o.paymentMethod === 'cash').length;
            const pdfQrisCount = filteredOrders.filter(o => o.paymentMethod === 'qris').length;
            const pdfPettyCash = store.shift?.pettyCash || 0;
            const pdfSaldoLaci = pdfPettyCash + pdfCashSales - expenses;
            const pdfTotalAssets = pdfSaldoLaci + pdfQrisSales;
            
            htmlContent = `
              <h2>RINGKASAN PERFORMA TOKO</h2>
              <p><b>Filter Waktu:</b> ${timeFilter.toUpperCase()}</p>
              <table>
                <tr><th>METRIK</th><th>NILAI</th></tr>
                <tr><td>Total Penjualan</td><td>Rp ${sales.toLocaleString('id-ID')}</td></tr>
                <tr><td>Jumlah Pesanan</td><td>${filteredOrders.length}</td></tr>
                <tr><td>Rata-rata Pesanan</td><td>Rp ${pdfAvg.toLocaleString('id-ID')}</td></tr>
                <tr><td>Total Pengeluaran</td><td>Rp ${expenses.toLocaleString('id-ID')}</td></tr>
              </table>
              <h2>SALDO LACI &amp; ARUS KAS</h2>
              <table>
                <tr><th>KOMPONEN</th><th>NILAI</th></tr>
                <tr><td>Modal Awal Laci</td><td>Rp ${pdfPettyCash.toLocaleString('id-ID')}</td></tr>
                <tr style="color:green;"><td>Pemasukan Tunai (${pdfCashCount} transaksi)</td><td>Rp ${pdfCashSales.toLocaleString('id-ID')}</td></tr>
                <tr style="color:blue;"><td>Pemasukan QRIS (${pdfQrisCount} transaksi)</td><td>Rp ${pdfQrisSales.toLocaleString('id-ID')}</td></tr>
                <tr style="color:red;"><td>Pengeluaran Kas</td><td>Rp ${expenses.toLocaleString('id-ID')}</td></tr>
                <tr><td><b>Saldo Laci Tunai</b></td><td><b>Rp ${pdfSaldoLaci.toLocaleString('id-ID')}</b></td></tr>
                <tr style="background:#f0fdf4;"><td><b>TOTAL ASET (Tunai + QRIS)</b></td><td><b>Rp ${pdfTotalAssets.toLocaleString('id-ID')}</b></td></tr>
              </table>
            `;
          } else if (activeTab === 'orders') {
            const filteredOrders = store.orders.filter(order => {
              if (searchId && !order.orderNumber.toString().includes(searchId) && !order.id.toLowerCase().includes(searchId.toLowerCase())) return false;
              const orderDate = new Date(order.createdAt);
              const today = new Date();
              if (searchDate) {
                const d = new Date(searchDate);
                if (orderDate.toDateString() !== d.toDateString()) return false;
              }
              if (timeFilter === 'today') {
                if (orderDate.toDateString() !== today.toDateString()) return false;
              } else if (timeFilter === 'week') {
                const diffTime = Math.abs(today - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays > 7) return false;
              } else if (timeFilter === 'month') {
                if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false;
              }
              return true;
            });
            
            htmlContent = `
              <h2>RIWAYAT PESANAN</h2>
              <table>
                <tr>
                  <th>NOMOR</th>
                  <th>PELANGGAN</th>
                  <th>MEJA</th>
                  <th>LAYANAN</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>WAKTU</th>
                </tr>
                ${filteredOrders.map(o => `
                  <tr>
                    <td>#${o.orderNumber}</td>
                    <td>${o.customerName}</td>
                    <td>${o.table || 'Walk-in'}</td>
                    <td>${o.serviceType === 'dine-in' ? 'Dine-in' : 'Takeaway'}</td>
                    <td>Rp ${o.total.toLocaleString('id-ID')}</td>
                    <td>${o.status.toUpperCase()}</td>
                    <td>${new Date(o.createdAt).toLocaleString('id-ID')}</td>
                  </tr>
                `).join('')}
              </table>
            `;
          } else if (activeTab === 'expenses') {
            const userRole = store.currentUser?.role?.toLowerCase() || '';
            const filteredExpenses = store.expenses.filter(exp => {
              if (userRole === 'cashier') {
                const isUtilities = (exp.category || '').toLowerCase() === 'utilities';
                const creatorRole = (exp.role || 'cashier').toLowerCase();
                const isCreatorStaff = creatorRole === 'cashier' || creatorRole === 'staff';
                if (!isUtilities || !isCreatorStaff) return false;
              } else {
                if (activeExpenseCategory !== 'All Categories' && exp.category !== activeExpenseCategory) return false;
              }
              
              const expDate = new Date(exp.date);
              const today = new Date();
              if (timeFilter === 'today') {
                if (expDate.toDateString() !== today.toDateString()) return false;
              } else if (timeFilter === 'week') {
                const diffTime = Math.abs(today - expDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays > 7) return false;
              } else if (timeFilter === 'month') {
                if (expDate.getMonth() !== today.getMonth() || expDate.getFullYear() !== today.getFullYear()) return false;
              }
              return true;
            });
            
            htmlContent = `
              <h2>RIWAYAT PENGELUARAN</h2>
              <table>
                <tr>
                  <th>DESKRIPSI</th>
                  <th>KATEGORI</th>
                  <th>JUMLAH</th>
                  <th>KARYAWAN</th>
                  <th>WAKTU</th>
                </tr>
                ${filteredExpenses.map(e => `
                  <tr>
                    <td>${e.description}</td>
                    <td>${e.category.toUpperCase()}</td>
                    <td>Rp ${e.amount.toLocaleString('id-ID')}</td>
                    <td>${e.staff}</td>
                    <td>${new Date(e.date).toLocaleString('id-ID')}</td>
                  </tr>
                `).join('')}
              </table>
            `;
          }
          
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Laporan Suka Bakar Dimsum - ${activeTab.toUpperCase()}</title>
                  <style>
                    body { font-family: sans-serif; padding: 40px; color: #1a1a1a; }
                    .header { text-align: center; border-bottom: 3px double #1a1a1a; padding-bottom: 20px; margin-bottom: 20px; }
                    .header h1 { margin: 0 0 5px 0; font-size: 28px; }
                    .header p { margin: 0; color: #666; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 2px solid #1a1a1a; padding: 12px; text-align: left; }
                    th { background-color: #f7f7f7; font-weight: bold; }
                    h2 { font-size: 20px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; margin-top: 30px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>SUKA BAKAR DIMSUM</h1>
                    <p>Jl. Raya Kenangan No. 99, Jakarta | Tel: 0812-3456-7890</p>
                    <p style="margin-top: 10px; font-weight: bold;">TANGGAL EKSPOR: ${todayStr}</p>
                  </div>
                  ${htmlContent}
                  <script>
                    window.onload = function() {
                      window.print();
                      setTimeout(() => { window.close(); }, 500);
                    }
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        };

        if (type === 'excel') {
          const csvString = generateCSVString();
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Laporan_Kedai_Pojok_13_${activeTab}_${timeFilter}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (type === 'pdf') {
          triggerPDFExport();
        }

        setTimeout(() => {
          toast.style.background = 'var(--color-success-light)';
          toast.style.borderColor = 'var(--color-success)';
          toast.style.color = 'var(--color-success)';
          toast.innerHTML = `
            <span>${successMsg}</span>
          `;
          
          setTimeout(() => {
            toast.remove();
          }, 3000);
        }, 1500);
      });
    });

    // ── Edit Petty Cash Modal ──
    const btnEditPettyCash = container.querySelector('#btn-edit-petty-cash');
    const modalEditPettyCash = container.querySelector('#modal-edit-petty-cash');
    const formEditPettyCash = container.querySelector('#form-edit-petty-cash');
    const inputEditPettyCash = container.querySelector('#input-edit-petty-cash');

    if (btnEditPettyCash && modalEditPettyCash) {
      btnEditPettyCash.addEventListener('click', () => {
        // Pre-fill dengan nilai saat ini
        if (inputEditPettyCash) inputEditPettyCash.value = store.shift?.pettyCash || 0;
        modalEditPettyCash.style.display = 'flex';
        setTimeout(() => inputEditPettyCash?.select(), 50);
      });

      const closeEditPettyCashModal = () => {
        modalEditPettyCash.style.display = 'none';
        formEditPettyCash?.reset();
      };

      container.querySelector('#btn-cancel-edit-petty-cash')?.addEventListener('click', closeEditPettyCashModal);

      // Klik backdrop untuk tutup
      modalEditPettyCash.addEventListener('click', (e) => {
        if (e.target === modalEditPettyCash) closeEditPettyCashModal();
      });

      formEditPettyCash?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAmount = Number(inputEditPettyCash?.value) || 0;
        store.updatePettyCash(newAmount);

        // Toast konfirmasi
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;padding:12px 20px;border:2px solid #111827;box-shadow:4px 4px 0 #111827;border-radius:8px;background:#fef9c3;font-weight:bold;font-size:14px;color:#713f12;font-family:inherit;display:flex;align-items:center;gap:8px;';
        toast.innerHTML = `<span style="font-size:18px;">✅</span> Modal awal laci diperbarui ke <b>${newAmount.toLocaleString('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0})}</b>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);

        closeEditPettyCashModal();
      });
    }

    if (btnOpenStore) {
      btnOpenStore.addEventListener('click', () => {
        modalStore.style.display = 'flex';
        inputPettyCash?.focus();
      });
    }

    const closeModal = () => {
      if (modalStore) modalStore.style.display = 'none';
      formStore?.reset();
    };

    container.querySelector('#btn-cancel-store-modal')?.addEventListener('click', closeModal);

    formStore?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pettyCash = Number(inputPettyCash?.value) || 0;
      store.openShift(pettyCash);
      alert('Shift berhasil dibuka! Selamat bekerja.');
      closeModal();
    });

    const btnCloseStore = container.querySelector('#btn-close-store');
    if (btnCloseStore) {
      btnCloseStore.addEventListener('click', () => {
        location.hash = '#/close-shift';
      });
    }

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        renderContent();
      });
    });

    if (activeTab === 'orders') {
      const inputId = container.querySelector('#filter-id');
      const selectTime = container.querySelector('#filter-time');
      const inputDate = container.querySelector('#filter-date');

      inputId?.addEventListener('input', (e) => {
        searchId = e.target.value;
        renderContent();
        container.querySelector('#filter-id').focus();
      });

      selectTime?.addEventListener('change', (e) => {
        timeFilter = e.target.value;
        renderContent();
      });

      inputDate?.addEventListener('input', (e) => {
        searchDate = e.target.value;
        renderContent();
      });
    } else if (activeTab === 'summary') {
      const selectTime = container.querySelector('#filter-time');
      selectTime?.addEventListener('change', (e) => {
        timeFilter = e.target.value;
        renderContent();
      });
    } else if (activeTab === 'expenses') {
      const selectTime = container.querySelector('#filter-time');
      selectTime?.addEventListener('change', (e) => {
        timeFilter = e.target.value;
        renderContent();
      });

      container.querySelectorAll('.chip-exp').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeExpenseCategory = e.target.dataset.category;
          renderContent();
        });
      });
    }

    // ==========================================
    // KONFIRMASI PESANAN: CONFIRM & CANCEL PENDING ORDERS
    // ==========================================
    container.querySelectorAll('.btn-confirm-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const order = store.orders.find(o => o.id === id);
        if (order) {
          store.confirmOrder(id);
          // Show inline success toast
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;padding:12px 20px;border:2px solid #111827;box-shadow:4px 4px 0 #111827;border-radius:8px;background:#d1fae5;font-weight:bold;font-size:14px;color:#065f46;font-family:inherit;display:flex;align-items:center;gap:8px;';
          toast.innerHTML = `<span style="font-size:18px;">✅</span> Pesanan #${order.orderNumber} dari ${order.table || 'meja'} telah dikonfirmasi!`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3500);
        }
      });
    });

    container.querySelectorAll('.btn-reject-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const order = store.orders.find(o => o.id === id);
        if (order && confirm(`Batalkan pesanan #${order.orderNumber} dari ${order.table || 'meja'}?`)) {
          store.cancelOrder(id);
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;padding:12px 20px;border:2px solid #111827;box-shadow:4px 4px 0 #111827;border-radius:8px;background:#fee2e2;font-weight:bold;font-size:14px;color:#991b1b;font-family:inherit;display:flex;align-items:center;gap:8px;';
          toast.innerHTML = `<span style="font-size:18px;">❌</span> Pesanan #${order.orderNumber} telah dibatalkan.`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3500);
        }
      });
    });

    // ==========================================
    // OWNER ONLY ACTIONS: EDIT & DELETE ORDERS/EXPENSES
    // ==========================================
    if (store.currentUser?.role?.toLowerCase() === 'owner') {
      // ── Order Modals & Actions ──
      const modalOrder = container.querySelector('#modal-edit-order');
      const formOrder = container.querySelector('#form-edit-order');
      const orderIdInput = container.querySelector('#edit-order-id');
      const orderCustInput = container.querySelector('#edit-order-cust');
      const orderServiceSelect = container.querySelector('#edit-order-service');
      const orderTableInput = container.querySelector('#edit-order-table');
      const orderTotalInput = container.querySelector('#edit-order-total');
      const orderStatusSelect = container.querySelector('#edit-order-status');

      const closeOrderModal = () => {
        if (modalOrder) modalOrder.style.display = 'none';
        formOrder?.reset();
      };

      container.querySelector('#btn-close-modal-order')?.addEventListener('click', closeOrderModal);
      container.querySelector('#btn-cancel-modal-order')?.addEventListener('click', closeOrderModal);

      // Edit Order Click
      container.querySelectorAll('.btn-edit-order').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.card-flat');
          const id = card.dataset.id;
          const order = store.orders.find(o => o.id === id);
          
          if (order) {
            formOrder.reset();
            orderIdInput.value = order.id;
            orderCustInput.value = order.customerName || 'Customer';
            orderServiceSelect.value = order.serviceType || 'dine-in';
            orderTableInput.value = order.table || '';
            orderTotalInput.value = order.total || 0;
            orderStatusSelect.value = order.status || 'completed';

            modalOrder.style.display = 'flex';
            orderCustInput.focus();
          }
        });
      });

      // Delete Order Click
      container.querySelectorAll('.btn-delete-order').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.card-flat');
          const id = card.dataset.id;
          const order = store.orders.find(o => o.id === id);
          if (order) {
            if (confirm(`Apakah Anda yakin ingin menghapus pesanan #${order.orderNumber}?`)) {
              store.deleteOrder(id);
              alert('Pesanan berhasil dihapus!');
            }
          }
        });
      });

      // Submit Edit Order
      formOrder?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = orderIdInput.value;
        const customerName = orderCustInput.value.trim();
        const serviceType = orderServiceSelect.value;
        const table = orderTableInput.value.trim() || null;
        const total = Number(orderTotalInput.value) || 0;
        const status = orderStatusSelect.value;

        store.updateOrder(id, {
          customerName,
          serviceType,
          table,
          total,
          status
        });

        alert('Pesanan berhasil diperbarui!');
        closeOrderModal();
      });

      // ── Expense Modals & Actions ──
      const modalExpense = container.querySelector('#modal-edit-expense');
      const formExpense = container.querySelector('#form-edit-expense');
      const expenseIdInput = container.querySelector('#edit-expense-id');
      const expenseDescInput = container.querySelector('#edit-expense-desc');
      const expenseCategorySelect = container.querySelector('#edit-expense-category');
      const expenseAmountInput = container.querySelector('#edit-expense-amount');

      const closeExpenseModal = () => {
        if (modalExpense) modalExpense.style.display = 'none';
        formExpense?.reset();
      };

      container.querySelector('#btn-close-modal-expense')?.addEventListener('click', closeExpenseModal);
      container.querySelector('#btn-cancel-modal-expense')?.addEventListener('click', closeExpenseModal);

      // Edit Expense Click
      container.querySelectorAll('.btn-edit-expense').forEach(btn => {
        btn.addEventListener('click', () => {
          const tr = btn.closest('tr');
          const id = tr.dataset.id;
          const exp = store.expenses.find(e => e.id === id);
          
          if (exp) {
            formExpense.reset();
            expenseIdInput.value = exp.id;
            expenseDescInput.value = exp.description || '';
            expenseCategorySelect.value = exp.category || 'Utilities';
            expenseAmountInput.value = exp.amount || 0;

            modalExpense.style.display = 'flex';
            expenseDescInput.focus();
          }
        });
      });

      // Delete Expense Click
      container.querySelectorAll('.btn-delete-expense').forEach(btn => {
        btn.addEventListener('click', () => {
          const tr = btn.closest('tr');
          const id = tr.dataset.id;
          const exp = store.expenses.find(e => e.id === id);
          if (exp) {
            if (confirm(`Apakah Anda yakin ingin menghapus pengeluaran: "${exp.description}"?`)) {
              store.deleteExpense(id);
              alert('Pengeluaran berhasil dihapus!');
            }
          }
        });
      });

      // Submit Edit Expense
      formExpense?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = expenseIdInput.value;
        const description = expenseDescInput.value.trim();
        const category = expenseCategorySelect.value;
        const amount = Number(expenseAmountInput.value) || 0;
        const icon = category === 'Ingredients' ? '🥬' : category === 'Utilities' ? '⛽' : '📦';

        store.updateExpense(id, {
          description,
          category,
          amount,
          icon
        });

        alert('Pengeluaran berhasil diperbarui!');
        closeExpenseModal();
      });
    }
  };

  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);
  renderContent();

  return () => {
    unsubscribe();
  };
}

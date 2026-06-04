import { store } from '../store.js';
import { icons, formatRupiah, $ } from '../utils.js';
import { navigate } from '../router.js';
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
  function renderContent() {
    // 1. Shift details
    const shift = store.shift || { isOpen: false, startTime: null, pettyCash: 0 };
    
    // Date & Time ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filterTime = shift.startTime || today.toISOString();
    
    const dateStr = shift.startTime 
      ? new Date(shift.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      
    const startTimeStr = shift.startTime 
      ? new Date(shift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '00:00';
      
    const endTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const timeRange = `${startTimeStr} - ${endTimeStr}`;

    // 2. Active Orders & Expenses during shift
    const activeOrders = store.orders.filter(o => o.createdAt >= filterTime && o.status === 'completed');
    const activeExpenses = store.expenses.filter(e => e.date >= filterTime);

    // 3. Mathematical Calculations
    const pettyCash = shift.pettyCash || 0; // Modal Awal
    
    const cashSales = activeOrders
      .filter(o => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.total, 0); // Pemasukan Tunai
      
    const qrisSales = activeOrders
      .filter(o => o.paymentMethod === 'qris')
      .reduce((sum, o) => sum + o.total, 0); // Pemasukan QRIS
      
    const totalSales = cashSales + qrisSales; // Total Penjualan
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0); // Total Pengeluaran
    
    // Saldo Laci (Kas Tunai) = Modal Awal + Pemasukan Tunai - Pengeluaran Kas
    const saldoLaci = pettyCash + cashSales - totalExpenses;
    
    // Total Expected Value (Drawer Cash + Bank Digital)
    const expectedAssets = saldoLaci + qrisSales;

    // 4. Metrics Table
    const totalTransactions = activeOrders.length;
    const avgBasket = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    // 5. User Initials & Meta
    const currentUser = store.currentUser || { name: 'Kasir Utama', role: 'Staff' };
    const staffName = currentUser.name;
    const staffRole = currentUser.role;
    const staffInitials = staffName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    let warningAlert = '';
    if (!shift.isOpen) {
      warningAlert = `
        <div class="alert" style="background: var(--color-warning-light); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; font-size: 14px; font-weight: bold; color: var(--color-text); display: flex; align-items: center; gap: 8px;">
          ⚠️ <strong>Peringatan:</strong> Tidak ada shift yang aktif saat ini. Anda melihat akumulasi transaksi hari ini sebagai simulasi.
        </div>
      `;
    }

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('reports')}
        <main class="main-content">
          ${renderSharedTopbar('Laporan Tutup Shift')}
          
          <div class="page-container" style="max-width: 900px; margin: 0 auto; width: 100%;">
            
            ${warningAlert}

            <div class="flex items-center gap-md" style="margin-bottom: var(--space-xl); justify-content: space-between;">
              <div class="text-bold" style="font-size: 24px;">${dateStr} | ${timeRange}</div>
              <div class="badge ${shift.isOpen ? 'badge-yellow' : 'badge-outline'}" style="height: 32px; font-weight: bold;">
                <div class="status-dot ${shift.isOpen ? 'status-dot-warning' : ''}" style="margin-right: 6px; background: ${shift.isOpen ? 'var(--color-warning)' : '#9ca3af'};"></div>
                ${shift.isOpen ? 'Shift Aktif' : 'Shift Non-Aktif'}
              </div>
            </div>

            <div class="divider" style="margin-bottom: 24px; border-bottom: 2px solid var(--color-border);"></div>

            <!-- 5 Summary Cards Grid -->
            <div class="summary-cards" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: var(--space-xl);">
              <!-- Modal Awal -->
              <div class="summary-card" style="background: var(--color-white); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); padding: 16px; border-radius: var(--radius-md);">
                <div class="summary-card-label" style="font-size: 11px; font-weight: 800; color: var(--color-text-muted); margin-bottom: 8px; text-transform: uppercase;">MODAL AWAL</div>
                <div class="summary-card-value" style="font-size: 18px; font-weight: 900; color: var(--color-text);">${formatRupiah(pettyCash)}</div>
              </div>
              
              <!-- Pemasukan Tunai -->
              <div class="summary-card" style="background: var(--color-success-light); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); padding: 16px; border-radius: var(--radius-md);">
                <div class="summary-card-label" style="font-size: 11px; font-weight: 800; color: var(--color-text-secondary); margin-bottom: 8px; text-transform: uppercase;">PEMASUKAN TUNAI</div>
                <div class="summary-card-value" style="font-size: 18px; font-weight: 900; color: var(--color-text);">${formatRupiah(cashSales)}</div>
              </div>
              
              <!-- Pemasukan QRIS -->
              <div class="summary-card" style="background: var(--color-primary-surface); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); padding: 16px; border-radius: var(--radius-md);">
                <div class="summary-card-label" style="font-size: 11px; font-weight: 800; color: var(--color-text-secondary); margin-bottom: 8px; text-transform: uppercase;">PEMASUKAN QRIS</div>
                <div class="summary-card-value" style="font-size: 18px; font-weight: 900; color: var(--color-text);">${formatRupiah(qrisSales)}</div>
              </div>
              
              <!-- Pengeluaran Kas -->
              <div class="summary-card" style="background: var(--color-error-light); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); padding: 16px; border-radius: var(--radius-md);">
                <div class="summary-card-label" style="font-size: 11px; font-weight: 800; color: var(--color-text-secondary); margin-bottom: 8px; text-transform: uppercase;">PENGELUARAN KAS</div>
                <div class="summary-card-value" style="font-size: 18px; font-weight: 900; color: var(--color-error);">${formatRupiah(totalExpenses)}</div>
              </div>
              
              <!-- Saldo Laci (Kas Tunai) -->
              <div class="summary-card" style="background: var(--color-yellow); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); padding: 16px; border-radius: var(--radius-md);">
                <div class="summary-card-label" style="font-size: 11px; font-weight: 800; color: var(--color-text); margin-bottom: 8px; text-transform: uppercase;">SALDO LACI TUNAI</div>
                <div class="summary-card-value" style="font-size: 18px; font-weight: 900; color: var(--color-text);">${formatRupiah(saldoLaci)}</div>
              </div>
            </div>

            <!-- Big expected total banner -->
            <div class="card" style="padding: 20px 24px; border: 2px solid var(--color-border); box-shadow: var(--shadow-lg); background: var(--color-primary); color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-radius: var(--radius-md);">
              <div>
                <h3 style="margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.85); letter-spacing: 0.5px;">TOTAL SALDO AKHIR (KAS + QRIS)</h3>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.75);">Total aset yang harus dicocokkan (Tunai di laci + Saldo digital QRIS masuk bank)</p>
              </div>
              <div style="font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">${formatRupiah(expectedAssets)}</div>
            </div>

            <!-- Detailed metrics table card -->
            <div class="card" style="padding: var(--space-xl); margin-bottom: var(--space-xl); border: 2px solid var(--color-border); box-shadow: var(--shadow); background: var(--color-white); border-radius: var(--radius-md);">
              <h3 style="margin-top: 0; margin-bottom: 16px; border-bottom: 2px solid var(--color-surface-dim); padding-bottom: 8px;">Metrik Operasional Shift</h3>
              <table class="table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="background: transparent; border-bottom: 2px solid var(--color-border); color: var(--color-text); text-align: left; padding: 12px 8px;">METRIC</th>
                    <th style="background: transparent; border-bottom: 2px solid var(--color-border); color: var(--color-text); text-align: right; padding: 12px 8px;">VALUE</th>
                    <th style="background: transparent; border-bottom: 2px solid var(--color-border); color: var(--color-text); text-align: left; padding: 12px 8px; padding-left: 24px;">NOTES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1.5px solid var(--color-surface-dim);">
                    <td class="text-bold" style="padding: 14px 8px; font-weight: bold; color: var(--color-text);">Total Transactions</td>
                    <td class="text-bold text-lg" style="padding: 14px 8px; text-align: right; font-weight: 900; font-size: 18px; color: var(--color-text);">${totalTransactions}</td>
                    <td class="text-muted" style="padding: 14px 8px; padding-left: 24px; color: var(--color-text-muted);">Completed orders</td>
                  </tr>
                  <tr style="border-bottom: 1.5px solid var(--color-surface-dim);">
                    <td class="text-bold" style="padding: 14px 8px; font-weight: bold; color: var(--color-text);">Avg. Basket Size</td>
                    <td class="text-bold text-lg" style="padding: 14px 8px; text-align: right; font-weight: 900; font-size: 18px; color: var(--color-text);">${formatRupiah(avgBasket)}</td>
                    <td class="text-muted" style="padding: 14px 8px; padding-left: 24px; color: var(--color-text-muted);">Per transaction</td>
                  </tr>
                  <tr style="border-bottom: 1.5px solid var(--color-surface-dim);">
                    <td class="text-bold" style="padding: 14px 8px; font-weight: bold; color: var(--color-text);">Total Pengeluaran Kas</td>
                    <td class="text-bold text-lg text-error" style="padding: 14px 8px; text-align: right; font-weight: 900; font-size: 18px; color: var(--color-error);">-${formatRupiah(totalExpenses)}</td>
                    <td class="text-muted" style="padding: 14px 8px; padding-left: 24px; color: var(--color-text-muted);">Pengeluaran operasional laci</td>
                  </tr>
                  <tr>
                    <td class="text-bold" style="padding: 14px 8px; font-weight: bold; color: var(--color-text);">Total Omset Kotor (Shift ini)</td>
                    <td class="text-bold text-lg" style="padding: 14px 8px; text-align: right; font-weight: 900; font-size: 18px; color: var(--color-text);">${formatRupiah(totalSales)}</td>
                    <td class="text-muted" style="padding: 14px 8px; padding-left: 24px; color: var(--color-text-muted);">Tunai + QRIS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Operational buttons -->
            <div class="flex justify-end gap-md" style="margin-bottom: 24px;">
              <button class="btn btn-outline btn-lg" id="btn-print-xreport" style="background: var(--color-white); border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 8px; font-weight: bold; cursor: pointer;">
                ${icons.printer} Print X-Report
              </button>
              <button class="btn btn-primary btn-lg" id="btn-finalize" style="background: ${shift.isOpen ? 'var(--color-primary)' : '#9ca3af'}; color: white; border: 2px solid var(--color-border); box-shadow: ${shift.isOpen ? 'var(--shadow-sm)' : 'none'}; display: flex; align-items: center; gap: 8px; font-weight: bold; cursor: ${shift.isOpen ? 'pointer' : 'not-allowed'};" ${shift.isOpen ? '' : 'disabled'}>
                ✓ Finalize & Close Shift
              </button>
            </div>

            <div class="flex items-center gap-sm" style="margin-top: var(--space-xl); justify-content: flex-end; padding-bottom: 40px;">
              <div class="text-muted text-sm text-right">
                Prepared by<br>
                <span class="text-bold text-text">${staffName} (${staffRole})</span>
              </div>
              <div class="avatar avatar-lg" style="background: var(--color-primary-surface); color: var(--color-primary); border: 2px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border);">${staffInitials}</div>
            </div>

          </div>
        </main>
      </div>
    `;

    // Shared topbar event listeners
    setupTopbarListeners(container);

    // Finalize shift listener
    const btnFinalize = container.querySelector('#btn-finalize');
    if (btnFinalize && shift.isOpen) {
      btnFinalize.addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin men-finalisasi shift saat ini?\\n\\n- Modal Awal: ${formatRupiah(pettyCash)}\\n- Saldo Kas Laci: ${formatRupiah(saldoLaci)}\\n- Pemasukan QRIS: ${formatRupiah(qrisSales)}\\n\\nKas fisik di laci harus bernilai ${formatRupiah(saldoLaci)} sebelum Anda menutup laci!`)) {
          store.closeShift();
          alert('Shift berhasil ditutup secara resmi! Kas laci di-reset menjadi 0.');
          location.hash = '#/reports';
        }
      });
    }

    // Print X-report listener
    const btnPrintX = container.querySelector('#btn-print-xreport');
    if (btnPrintX) {
      btnPrintX.addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Jendela cetak diblokir! Izinkan pop-up untuk mencetak.');
          return;
        }
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Shift X-Report - ${dateStr}</title>
            <style>
              body { font-family: monospace; font-size: 12px; line-height: 1.4; color: #000; padding: 20px; max-width: 300px; margin: 0 auto; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .separator { border-top: 1px dashed #000; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; }
              .header { font-size: 16px; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="center bold header">SUKA BAKAR DIMSUM</div>
            <div class="center">Authentic Dimsum & More</div>
            <div class="center font-sm">Shift X-Report</div>
            <div class="separator"></div>
            <div class="row"><span>Tanggal:</span> <span>${dateStr}</span></div>
            <div class="row"><span>Shift:</span> <span>${timeRange}</span></div>
            <div class="row"><span>Karyawan:</span> <span>${staffName}</span></div>
            <div class="separator"></div>
            <div class="row"><span class="bold">1. MODAL AWAL:</span> <span class="bold">${formatRupiah(pettyCash)}</span></div>
            <div class="separator"></div>
            <div class="row"><span>Pemasukan Tunai:</span> <span>+${formatRupiah(cashSales)}</span></div>
            <div class="row"><span>Pengeluaran Kas:</span> <span>-${formatRupiah(totalExpenses)}</span></div>
            <div class="row"><span class="bold">2. SALDO KAS LACI:</span> <span class="bold">${formatRupiah(saldoLaci)}</span></div>
            <div class="separator"></div>
            <div class="row"><span>Pemasukan QRIS:</span> <span>+${formatRupiah(qrisSales)}</span></div>
            <div class="row"><span class="bold">3. TOTAL ASET (1+2+3):</span> <span class="bold">${formatRupiah(expectedAssets)}</span></div>
            <div class="separator"></div>
            <div class="center bold">METRIK TRANSAKSI</div>
            <div class="row"><span>Jumlah Transaksi:</span> <span>${totalTransactions}</span></div>
            <div class="row"><span>Rata-Rata Keranjang:</span> <span>${formatRupiah(avgBasket)}</span></div>
            <div class="row"><span>Total Omset Shift:</span> <span>${formatRupiah(totalSales)}</span></div>
            <div class="separator"></div>
            <div class="center" style="margin-top:30px;">-- TANDA TANGAN KASIR --</div>
            <br><br><br>
            <div class="center">${staffName}</div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      });
    }
  }

  // Initial render
  renderContent();

  // Reactive updates
  const unsubscribe = store.subscribe(() => {
    if (document.body.contains(container)) {
      renderContent();
    }
  });

  return () => {
    unsubscribe();
  };
}

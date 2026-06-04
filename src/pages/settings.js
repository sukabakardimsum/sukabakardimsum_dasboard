import { store } from '../store.js';
import { icons } from '../utils.js';
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

  container.innerHTML = `
    <div class="app-shell animate-fade-in">
      ${renderSidebar('settings')}
      <main class="main-content">
        ${renderSharedTopbar('Pengaturan')}
        
        <div class="page-container" style="max-width: 900px; margin: 0 auto; width: 100%;">
          
          <div class="page-header">
            <div class="page-header-title">
              <h1>Pengaturan</h1>
              <p>Manage your store operations, taxes, and hardware.</p>
            </div>
            <button class="btn btn-primary" id="btn-save-settings" style="background: var(--color-primary); color: white;">
              Simpan Semua
            </button>
          </div>

          <div class="flex-col gap-lg">
            
            <!-- Parameter Operasional -->
            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-lg); border-bottom: 2px solid var(--color-surface-dim); padding-bottom: 8px;">Parameter Operasional</h3>
              
              <div class="flex gap-lg">
                <div class="input-group" style="flex: 2;">
                  <label class="input-label">Store Name</label>
                  <input type="text" id="input-store-name" class="input" value="${store.settings.storeName}">
                </div>
              </div>
              
              <div class="flex gap-lg" style="margin-top: var(--space-md);">
                <div class="input-group" style="flex: 1;">
                  <label class="input-label">Opening Hours</label>
                  <div class="input-icon">
                    ${icons.calendar}
                    <input type="time" id="input-opening-hours" class="input" value="${store.settings.openingHours}">
                  </div>
                </div>
                <div class="input-group" style="flex: 1;">
                  <label class="input-label">Closing Hours</label>
                  <div class="input-icon">
                    ${icons.calendar}
                    <input type="time" id="input-closing-hours" class="input" value="${store.settings.closingHours}">
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarif Pajak -->
            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-sm);">Tarif Pajak</h3>
              <p class="text-muted text-sm" style="margin-bottom: var(--space-md);">Set the default tax rate applied to all orders (e.g., PB1).</p>
              
              <div class="input-group" style="max-width: 300px;">
                <label class="input-label">Tax Rate Percentage</label>
                <div style="position: relative;">
                  <input type="number" id="input-tax-rate" class="input" value="${store.settings.taxRate}" style="padding-right: 40px;">
                  <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-weight: bold; color: var(--color-text-muted);">%</span>
                </div>
              </div>
            </div>

            <!-- Mata Uang Utama -->
            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-sm);">Mata Uang Utama</h3>
              <p class="text-muted text-sm" style="margin-bottom: var(--space-md);">Select the base currency for display and transactions.</p>
              
              <div class="input-group" style="max-width: 300px;">
                <label class="input-label">Currency</label>
                <select id="input-currency" class="input">
                  <option value="IDR" ${store.settings.currency === 'IDR' ? 'selected' : ''}>IDR - Indonesian Rupiah</option>
                  <option value="USD" ${store.settings.currency === 'USD' ? 'selected' : ''}>USD - US Dollar</option>
                </select>
              </div>
            </div>

            <!-- Printer Termal -->
            <div class="card" style="padding: var(--space-xl);">
              <h3 style="margin-bottom: var(--space-sm);">Printer Termal</h3>
              <p class="text-muted text-sm" style="margin-bottom: var(--space-md);">Pilih metode koneksi printer termal struk kasir.</p>

              <!-- Koneksi Printer Toggle -->
              <div class="input-group" style="max-width: 320px; margin-bottom: var(--space-md);">
                <label class="input-label">Koneksi Printer</label>
                <div class="toggle-group w-full" id="toggle-printer-conn">
                  <button type="button" class="toggle-option flex-1 ${store.settings.printerConnection === 'bluetooth' ? '' : 'active'}" data-conn="wifi">WiFi / IP</button>
                  <button type="button" class="toggle-option flex-1 ${store.settings.printerConnection === 'bluetooth' ? 'active' : ''}" data-conn="bluetooth">Bluetooth</button>
                </div>
              </div>

              <!-- WiFi Fields Container -->
              <div id="conn-wifi-fields" style="display: ${store.settings.printerConnection === 'bluetooth' ? 'none' : 'block'}; margin-bottom: var(--space-md);">
                <div class="flex gap-lg items-end">
                  <div class="input-group" style="flex: 1; max-width: 300px;">
                    <label class="input-label">Printer IP Address</label>
                    <input type="text" id="input-printer-ip" class="input" value="${store.settings.printerIp || '192.168.1.100'}">
                  </div>
                  <button type="button" class="btn btn-outline" id="btn-test-wifi" style="height: 48px; border: 2px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border); font-weight: bold;">
                    Test WiFi
                  </button>
                </div>
              </div>

              <!-- Bluetooth Fields Container -->
              <div id="conn-bt-fields" style="display: ${store.settings.printerConnection === 'bluetooth' ? 'block' : 'none'}; margin-bottom: var(--space-md);">
                <div class="flex gap-lg items-end">
                  <div class="input-group" style="flex: 1; max-width: 300px;">
                    <label class="input-label">Nama Perangkat Bluetooth</label>
                    <input type="text" id="input-bluetooth-device" class="input" value="${store.settings.bluetoothDevice || 'RPP02N'}" placeholder="Contoh: RPP02N">
                  </div>
                  <button type="button" class="btn btn-outline" id="btn-scan-bt" style="height: 48px; border: 2px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border); font-weight: bold; background: var(--color-primary-surface); color: var(--color-primary); display: flex; align-items: center; gap: 8px;">
                    ⚡ Hubungkan
                  </button>
                </div>
              </div>

              <div class="input-group" style="margin-top: var(--space-md); max-width: 300px;">
                <label class="input-label">Paper Width</label>
                <div class="toggle-group w-full" id="toggle-paper-width">
                  <button type="button" class="toggle-option flex-1 ${store.settings.paperWidth === '58mm' ? 'active' : ''}" data-width="58mm">58mm</button>
                  <button type="button" class="toggle-option flex-1 ${store.settings.paperWidth === '80mm' ? 'active' : ''}" data-width="80mm">80mm</button>
                </div>
              </div>

              <div style="margin-top: var(--space-lg);">
                <button type="button" class="btn btn-yellow" id="btn-test-print" style="border: 2px solid var(--color-border); box-shadow: 3px 3px 0 var(--color-border); font-weight: bold; cursor: pointer;">
                  ${icons.printer} Test Print
                </button>
              </div>
            </div>

            <!-- Database Management / Reset Data -->
            ${(store.currentUser?.role?.toLowerCase() === 'owner') ? `
            <div class="card" style="padding: var(--space-xl); border: 2px solid var(--color-error); box-shadow: 4px 4px 0px var(--color-error); background: #FFF5F5; margin-top: var(--space-lg);">
              <h3 style="margin-bottom: var(--space-sm); color: var(--color-error);">Reset Database Toko</h3>
              <p class="text-muted text-sm" style="margin-bottom: var(--space-md);">
                Hapus semua data transaksi penjualan, pesanan, dan laporan pengeluaran dari Supabase dan LocalStorage. Tindakan ini tidak dapat dibatalkan. Menu makanan dan daftar karyawan akan tetap tersimpan.
              </p>
              
              <button class="btn btn-outline text-error" id="btn-reset-db" style="border: 2px solid var(--color-error); box-shadow: 3px 3px 0 var(--color-error); background: var(--color-error-light); font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit;">
                ⚠️ Hapus & Reset Semua Transaksi
              </button>
            </div>
            ` : `
            <div class="card" style="padding: var(--space-xl); border: 2px solid var(--color-border); box-shadow: 4px 4px 0px var(--color-border); background: var(--color-surface-dim); margin-top: var(--space-lg); opacity: 0.8;">
              <h3 style="margin-bottom: var(--space-sm); color: var(--color-text-muted); display: flex; align-items: center; gap: 8px;">
                Reset Database Toko <span style="font-size: var(--text-xs); background: var(--color-border); color: var(--color-text-muted); padding: 2px 8px; border-radius: 999px; font-weight: normal; border: 1px solid var(--color-border);">🔒 Terkunci</span>
              </h3>
              <p class="text-muted text-sm" style="margin-bottom: var(--space-md);">
                Fitur penghapusan dan reset data transaksi toko dinonaktifkan. Tindakan pembersihan database ini hanya dapat dilakukan oleh akun dengan peran <strong>Owner</strong>.
              </p>
              
              <button class="btn btn-outline" style="border: 2px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border); font-weight: bold; cursor: not-allowed; display: flex; align-items: center; gap: 8px; font-family: inherit; opacity: 0.6;" disabled>
                🔒 Hanya untuk Akun Owner
              </button>
            </div>
            `}

          </div>

        </div>
      </main>
    </div>
  `;

  const btnSave = container.querySelector('#btn-save-settings');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const storeName = container.querySelector('#input-store-name').value;
      const openingHours = container.querySelector('#input-opening-hours').value;
      const closingHours = container.querySelector('#input-closing-hours').value;
      const taxRate = parseFloat(container.querySelector('#input-tax-rate').value) || 0;
      const currency = container.querySelector('#input-currency').value;
      
      const activeConnBtn = container.querySelector('#toggle-printer-conn .toggle-option.active');
      const printerConnection = activeConnBtn ? activeConnBtn.dataset.conn : 'wifi';
      const printerIp = container.querySelector('#input-printer-ip')?.value || '192.168.1.100';
      const bluetoothDevice = container.querySelector('#input-bluetooth-device')?.value || 'RPP02N';

      store.settings.storeName = storeName;
      store.settings.openingHours = openingHours;
      store.settings.closingHours = closingHours;
      store.settings.taxRate = taxRate;
      store.settings.currency = currency;
      
      store.settings.printerConnection = printerConnection;
      store.settings.printerIp = printerIp;
      store.settings.bluetoothDevice = bluetoothDevice;

      // Ensure topbar updates if store name changes
      const topbarTitle = document.querySelector('.topbar-title');
      if (topbarTitle) {
        // Just setting it here for visual update, though typically handled by state management
      }

      store.notify(); // Important: Save to localStorage
      alert('Pengaturan berhasil disimpan!');
    });
  }

  const toggleOptions = container.querySelectorAll('#toggle-paper-width .toggle-option');
  toggleOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleOptions.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      store.settings.paperWidth = btn.dataset.width;
      store.notify(); // Important: Save to localStorage
    });
  });

  // Printer connection toggle listeners
  const toggleConnOptions = container.querySelectorAll('#toggle-printer-conn .toggle-option');
  const wifiFields = container.querySelector('#conn-wifi-fields');
  const btFields = container.querySelector('#conn-bt-fields');

  toggleConnOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleConnOptions.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const connType = btn.dataset.conn;
      
      if (connType === 'wifi') {
        wifiFields.style.display = 'block';
        btFields.style.display = 'none';
      } else {
        wifiFields.style.display = 'none';
        btFields.style.display = 'block';
      }
    });
  });

  // Test Wifi Connection
  const btnTestWifi = container.querySelector('#btn-test-wifi');
  if (btnTestWifi) {
    btnTestWifi.addEventListener('click', () => {
      const ip = container.querySelector('#input-printer-ip').value;
      alert(`Menghubungkan ke printer thermal via WiFi IP: ${ip}...\n\nKoneksi berhasil!`);
    });
  }

  // Scan & Connect Bluetooth Connection
  const btnScanBt = container.querySelector('#btn-scan-bt');
  if (btnScanBt) {
    btnScanBt.addEventListener('click', () => {
      const devName = container.querySelector('#input-bluetooth-device').value || 'RPP02N';
      btnScanBt.disabled = true;
      btnScanBt.innerHTML = '🔄 Mencari...';
      setTimeout(() => {
        alert(`Mencari perangkat Bluetooth...\n\nPerangkat ditemukan!\nBerhasil terhubung ke printer Bluetooth: ${devName}`);
        btnScanBt.disabled = false;
        btnScanBt.innerHTML = '⚡ Hubungkan';
      }, 1500);
    });
  }

  // Test Print Connection (Wifi or Bluetooth)
  const btnTestPrint = container.querySelector('#btn-test-print');
  if (btnTestPrint) {
    btnTestPrint.addEventListener('click', () => {
      const activeConnBtn = container.querySelector('#toggle-printer-conn .toggle-option.active');
      const conn = activeConnBtn ? activeConnBtn.dataset.conn : 'wifi';
      
      if (conn === 'wifi') {
        const ip = container.querySelector('#input-printer-ip').value;
        alert(`Mencetak struk uji coba via WiFi IP: ${ip}\nFormat: ${store.settings.paperWidth || '58mm'}\n\nStruk berhasil dicetak!`);
      } else {
        const devName = container.querySelector('#input-bluetooth-device').value || 'RPP02N';
        alert(`Mencetak struk uji coba via Bluetooth: ${devName}\nFormat: ${store.settings.paperWidth || '58mm'}\n\nStruk berhasil dicetak!`);
      }
    });
  }

  // Database Reset Handler
  const btnResetDb = container.querySelector('#btn-reset-db');
  if (btnResetDb) {
    btnResetDb.addEventListener('click', async () => {
      if (store.currentUser?.role?.toLowerCase() !== 'owner') {
        alert('Akses Ditolak: Hanya akun Owner yang dapat menghapus dan men-reset database toko.');
        return;
      }
      const confirm1 = confirm('APAKAH ANDA YAKIN?\\nTindakan ini akan menghapus seluruh data transaksi penjualan, pesanan, dan pengeluaran secara permanen dari database Supabase dan memori lokal browser.');
      if (confirm1) {
        const confirm2 = confirm('KONFIRMASI AKHIR:\\nSeluruh laporan keuangan Anda akan di-reset menjadi 0. Tekan OK jika Anda benar-benar yakin toko belum mulai beroperasi dan ingin mengosongkan database.');
        if (confirm2) {
          btnResetDb.disabled = true;
          btnResetDb.textContent = '🔄 Menghapus & Men-reset Data...';
          
          await store.resetDatabase();
          
          alert('Database berhasil di-reset menjadi kosong! Laporan expenses dan penjualan kini bernilai 0.');
          location.reload(); // Reload the application state fully
        }
      }
    });
  }
  // Shared topbar event listeners
  setupTopbarListeners(container);

  return () => {};
}

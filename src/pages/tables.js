import { store } from '../store.js';
import { icons } from '../utils.js';
import { renderSharedTopbar, setupTopbarListeners } from '../topbar.js';

function getSimulatedQrSvg(tableName) {
  const size = 21;
  const unit = 8;
  const pad = 10;
  const rects = [];
  
  const addBlock = (x, y, w = 1, h = 1) => {
    rects.push(`<rect x="${pad + x*unit}" y="${pad + y*unit}" width="${w*unit}" height="${h*unit}" fill="#111827" />`);
  };
  
  // Top-left finder
  addBlock(0, 0, 7, 1);
  addBlock(0, 6, 7, 1);
  addBlock(0, 1, 1, 5);
  addBlock(6, 1, 1, 5);
  addBlock(2, 2, 3, 3);
  
  // Top-right finder
  addBlock(14, 0, 7, 1);
  addBlock(14, 6, 7, 1);
  addBlock(14, 1, 1, 5);
  addBlock(20, 1, 1, 5);
  addBlock(16, 2, 3, 3);
  
  // Bottom-left finder
  addBlock(0, 14, 7, 1);
  addBlock(0, 20, 7, 1);
  addBlock(0, 15, 1, 5);
  addBlock(6, 15, 1, 5);
  addBlock(2, 16, 3, 3);
  
  // Small alignment pattern at (14, 14)
  addBlock(14, 14, 5, 5);
  rects.push(`<rect x="${pad + 15*unit}" y="${pad + 15*unit}" width="${3*unit}" height="${3*unit}" fill="#f8fafc" />`);
  addBlock(16, 16, 1, 1);
  
  // Hashed pseudo-random timing/mock data
  let seed = 0;
  for (let i = 0; i < tableName.length; i++) {
    seed += tableName.charCodeAt(i);
  }
  
  const pseudoRandom = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };
  
  let blockIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isTopLeftFinder = r < 8 && c < 8;
      const isTopRightFinder = r < 8 && c > 12;
      const isBottomLeftFinder = r > 12 && c < 8;
      const isAlignmentPattern = r >= 14 && r <= 18 && c >= 14 && c <= 18;
      
      if (!isTopLeftFinder && !isTopRightFinder && !isBottomLeftFinder && !isAlignmentPattern) {
        if (r === 6 || c === 6) {
          if ((r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0)) {
            addBlock(c, r);
          }
          if (pseudoRandom(blockIdx++) > 0.45) {
            addBlock(c, r);
          }
        }
      }
    }
  }

  // Top Right Finder
  addBlock(size - 7, 0, 7, 7);
  rects.push(`<rect x="${pad + (size - 6) * unit}" y="${pad + 1 * unit}" width="5" height="5" fill="#ffffff" />`);
  addBlock(size - 5, 2, 3, 3);
  
  // Bottom Left Finder
  addBlock(0, size - 7, 7, 7);
  rects.push(`<rect x="${pad + 1 * unit}" y="${pad + (size - 6) * unit}" width="5" height="5" fill="#ffffff" />`);
  addBlock(2, size - 5, 3, 3);

  // 2. Draw Alignments and Random Dots for simulation
  addBlock(size - 9, size - 9, 5, 5);
  rects.push(`<rect x="${pad + (size - 8) * unit}" y="${pad + (size - 8) * unit}" width="3" height="3" fill="#ffffff" />`);
  addBlock(size - 7, size - 7);

  // Some random simulated data dots
  for (let i = 8; i < size; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i + j) % 3 === 0) addBlock(i, j);
    }
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 8; j < size; j++) {
      if ((i * j) % 2 === 0) addBlock(i, j);
    }
  }
  for (let i = 8; i < size; i++) {
    for (let j = 8; j < size; j++) {
      if ((i * j) % 5 === 2) addBlock(i, j);
    }
  }

  const width = size * unit + pad * 2;
  return `
    <svg viewBox="0 0 ${width} ${width}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${width}" fill="#ffffff" rx="16" />
      ${rects.join('')}
    </svg>
  `;
}

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
  let activeTableForQr = null;
  let showAddModal = false;
  let editingTable = null; // holds the table object being edited

  const renderContent = () => {
    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('tables')}
        <main class="main-content">
          ${renderSharedTopbar('Manajemen Meja')}
          
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
            
            <div class="page-header" style="margin-bottom: 16px; padding-bottom: 12px;">
              <div class="page-header-title">
                <h1 style="font-size: 20px; margin-bottom: 2px;">Manajemen Meja</h1>
                <p style="font-size: 12px; margin: 0;">Kelola kapasitas meja restoran.</p>
              </div>
              
              <div class="flex items-center gap-md">
                <div class="flex items-center gap-sm">
                  <button id="btn-print-all-qr" style="height: 32px; padding: 0 12px; font-size: 12px; font-weight: 700; border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); background: white; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: var(--font-family); border-radius: var(--radius-sm);">
                    🖨️ Cetak Semua QR
                  </button>
                  <button id="btn-add-table" class="btn btn-primary" style="height: 32px; padding: 0 12px; font-size: 12px; background: var(--color-primary); color: white; display:flex; align-items:center; gap:6px;">
                    ${icons.plus} Tambah Meja
                  </button>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; align-items: start;">
              ${store.tables.map(table => `
                <div style="background: ${table.isVip ? 'var(--color-primary-surface)' : 'var(--color-white)'}; padding: 12px; border: 2px solid var(--color-text); box-shadow: 3px 3px 0 var(--color-text); border-radius: var(--radius-md); text-align: center; display: flex; flex-direction: column; gap: 4px; position: relative; ${table.isVip ? 'grid-column: span 2;' : ''}">
                  
                  <!-- Edit button -->
                  <button class="btn-edit-table" data-id="${table.id}" title="Edit Meja" style="position:absolute; top:6px; right:6px; width:22px; height:22px; background:rgba(255,255,255,0.85); border:1.5px solid var(--color-text); box-shadow:1px 1px 0 var(--color-text); border-radius:3px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px;pointer-events:none;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>

                  <div style="display: flex; justify-content: center; align-items: center; gap: 4px; color: var(--color-text); margin-bottom: 2px; margin-top: 4px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px; flex-shrink:0;">
                      <rect x="2" y="10" width="20" height="4" rx="1"/>
                      <path d="M4 14v6M20 14v6M7 6v4M17 6v4M9 4h6"/>
                    </svg>
                    ${table.isVip ? `<span style="font-size:10px; font-weight:900; background:#fce354; border:1.5px solid var(--color-text); padding:1px 5px; border-radius:3px; box-shadow:1px 1px 0 var(--color-text);">VIP</span>` : ''}
                  </div>

                  <div style="font-size: 15px; font-weight: 900; line-height:1.1;">${table.name}</div>
                  
                  <div style="font-size: 11px; font-weight: 700; color: var(--color-muted); display:flex; align-items:center; justify-content:center; gap:3px; margin-bottom: 6px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${table.capacity} org
                  </div>

                  <button class="btn-qr-table" data-name="${table.name}" style="margin-top: auto; height: 28px; font-size: 11px; font-weight: 700; width: 100%; border: 1.5px solid var(--color-text); box-shadow: 1.5px 1.5px 0 var(--color-text); cursor: pointer; background: rgba(255,255,255,0.9); border-radius: 3px; display:flex; align-items:center; justify-content:center; gap:4px; font-family: var(--font-family);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M17 14h3M14 17h3v3"/></svg>
                    QR Code
                  </button>

                </div>
              `).join('')}
            </div>

          </div>
        </main>
      </div>

      <!-- Table QR Barcode Modal -->
      <div id="modal-qr-table" style="display: ${activeTableForQr ? 'flex' : 'none'}; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
        <div class="card animate-scale-in" style="width: 100%; max-width: 420px; padding: var(--space-xl); background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); position: relative; text-align: center;">
          <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
            <h2 style="font-size: 20px; font-weight: 900;">QR Code — ${activeTableForQr}</h2>
            <button class="btn-icon-sm btn-ghost" id="btn-close-qr-modal" style="border: none; background: none; font-size: 18px; cursor: pointer;">✕</button>
          </div>

          <p class="text-sm text-muted">Scan QR Code ini menggunakan HP pelanggan untuk melakukan pemesanan langsung dari meja.</p>

          <!-- Real Dynamic QR Code -->
          <div style="margin: 16px auto; display: flex; justify-content: center;">
            ${activeTableForQr ? `
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}#/scan-order?table=${encodeURIComponent(activeTableForQr)}`)}&margin=10" 
                   alt="QR Code ${activeTableForQr}" 
                   style="display: block; border: 2px solid var(--color-border); box-shadow: var(--shadow-sm); width: 200px; height: 200px; background: white;" />
            ` : ''}
          </div>

          <div style="background: var(--color-primary-surface); border: 2px solid var(--color-text); border-radius: var(--radius-md); padding: 8px 12px; margin-bottom: var(--space-lg); font-size: 11px; word-break: break-all; font-family: monospace; font-weight: bold; color: var(--color-primary); box-shadow: 2px 2px 0 var(--color-text);">
            ${window.location.origin}${window.location.pathname}#/scan-order?table=${encodeURIComponent(activeTableForQr || '')}
          </div>

          <div class="flex flex-col gap-sm" style="margin-top: 16px;">
            <div class="flex gap-sm">
              <button class="btn btn-outline flex-1" id="btn-download-qr" style="height: 42px; font-weight: bold; background: var(--color-primary-surface); border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); display: flex; align-items: center; justify-content: center; gap: 8px;">
                💾 Simpan QR
              </button>
              <a href="#/scan-order?table=${encodeURIComponent(activeTableForQr || '')}" target="_blank" class="btn btn-yellow flex-1" style="border: 2px solid var(--color-text); box-shadow: 2.5px 2.5px 0 var(--color-text); font-weight: bold; text-decoration: none; justify-content: center; display: flex; align-items: center; height: 42px;" id="btn-open-link-qr">
                📱 Buka Menu
              </a>
            </div>
            <button class="btn btn-outline w-full" id="btn-cancel-qr-modal" style="height: 42px; font-weight: bold;">✕ Tutup Meja</button>
          </div>
        </div>
      </div>

      <!-- Tambah Meja Modal -->
      <div id="modal-add-table" style="display: ${showAddModal ? 'flex' : 'none'}; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
        <div class="card animate-scale-in" style="width: 100%; max-width: 420px; background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text);">
          
          <!-- Header -->
          <div style="background: var(--color-primary); padding: 16px 20px; border-bottom: 2px solid var(--color-text); display:flex; justify-content:space-between; align-items:center; border-radius: var(--radius-md) var(--radius-md) 0 0;">
            <h2 style="margin:0; font-size:18px; font-weight:900; color:white; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;"><rect x="2" y="10" width="20" height="4" rx="1"/><path d="M4 14v6M20 14v6M7 6v4M17 6v4M9 4h6"/></svg>
              Tambah Meja Baru
            </h2>
            <button id="btn-close-add-modal" style="background:rgba(255,255,255,0.2); border:none; color:white; font-size:18px; cursor:pointer; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">✕</button>
          </div>

          <!-- Body / Form -->
          <div style="padding: 20px; display:flex; flex-direction:column; gap:14px;">
            
            <!-- Nama Meja -->
            <div>
              <label style="display:block; font-size:12px; font-weight:800; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px;">Nama Meja <span style="color:var(--color-error)">*</span></label>
              <input id="input-table-name" type="text" placeholder="Contoh: Meja 11, Terrace A, Bar 1..." style="width:100%; box-sizing:border-box; height:40px; padding:0 12px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); border-radius:var(--radius-sm); font-size:14px; font-weight:600; font-family:var(--font-family); background: var(--color-bg);">
            </div>

            <!-- Kapasitas -->
            <div>
              <label style="display:block; font-size:12px; font-weight:800; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px;">Kapasitas (Orang) <span style="color:var(--color-error)">*</span></label>
              <input id="input-table-capacity" type="number" min="1" max="50" value="4" style="width:100%; box-sizing:border-box; height:40px; padding:0 12px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); border-radius:var(--radius-sm); font-size:14px; font-weight:600; font-family:var(--font-family); background: var(--color-bg);">
            </div>

            <!-- VIP Toggle -->
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-primary-surface); border:2px solid var(--color-text); border-radius:var(--radius-sm); box-shadow:2px 2px 0 var(--color-text);">
              <div>
                <div style="font-size:13px; font-weight:800;">Meja VIP</div>
                <div style="font-size:11px; color:var(--color-muted); margin-top:2px;">Kartu meja tampil lebih lebar</div>
              </div>
              <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
                <input type="checkbox" id="input-table-vip" style="opacity:0; width:0; height:0; position:absolute;">
                <span id="vip-toggle-track" style="position:absolute; inset:0; background:#d1d5db; border:2px solid var(--color-text); border-radius:12px; transition:background 0.2s;">
                  <span id="vip-toggle-thumb" style="position:absolute; top:1px; left:1px; width:16px; height:16px; background:white; border:1.5px solid var(--color-text); border-radius:50%; transition:left 0.2s;"></span>
                </span>
              </label>
            </div>

            <!-- Error message -->
            <div id="add-table-error" style="display:none; background:#fef2f2; border:2px solid var(--color-error); border-radius:var(--radius-sm); padding:8px 12px; font-size:12px; font-weight:700; color:var(--color-error);"></div>

          </div>

          <!-- Footer Actions -->
          <div style="padding:0 20px 20px 20px; display:flex; gap:10px;">
            <button id="btn-cancel-add-table" class="btn btn-outline flex-1" style="height:42px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); font-weight:bold;">Batal</button>
            <button id="btn-confirm-add-table" class="btn btn-primary flex-1" style="height:42px; background:var(--color-primary); color:white; font-weight:bold; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text);">
              ${icons.plus} Tambah Meja
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Meja Modal -->
      <div id="modal-edit-table" style="display: ${editingTable ? 'flex' : 'none'}; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
        <div class="card animate-scale-in" style="width: 100%; max-width: 420px; background: var(--color-white); border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text);">

          <!-- Header -->
          <div style="background: #374151; padding: 16px 20px; border-bottom: 2px solid var(--color-text); display:flex; justify-content:space-between; align-items:center; border-radius: var(--radius-md) var(--radius-md) 0 0;">
            <h2 style="margin:0; font-size:18px; font-weight:900; color:white; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Meja — ${editingTable ? editingTable.name : ''}
            </h2>
            <button id="btn-close-edit-modal" style="background:rgba(255,255,255,0.2); border:none; color:white; font-size:18px; cursor:pointer; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">✕</button>
          </div>

          <!-- Body / Form -->
          <div style="padding: 20px; display:flex; flex-direction:column; gap:14px;">

            <!-- Nama Meja -->
            <div>
              <label style="display:block; font-size:12px; font-weight:800; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px;">Nama Meja <span style="color:var(--color-error)">*</span></label>
              <input id="edit-table-name" type="text" value="${editingTable ? editingTable.name : ''}" style="width:100%; box-sizing:border-box; height:40px; padding:0 12px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); border-radius:var(--radius-sm); font-size:14px; font-weight:600; font-family:var(--font-family); background: var(--color-bg);">
            </div>

            <!-- Kapasitas -->
            <div>
              <label style="display:block; font-size:12px; font-weight:800; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px;">Kapasitas (Orang) <span style="color:var(--color-error)">*</span></label>
              <input id="edit-table-capacity" type="number" min="1" max="50" value="${editingTable ? editingTable.capacity : 4}" style="width:100%; box-sizing:border-box; height:40px; padding:0 12px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); border-radius:var(--radius-sm); font-size:14px; font-weight:600; font-family:var(--font-family); background: var(--color-bg);">
            </div>

            <!-- VIP Toggle -->
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--color-primary-surface); border:2px solid var(--color-text); border-radius:var(--radius-sm); box-shadow:2px 2px 0 var(--color-text);">
              <div>
                <div style="font-size:13px; font-weight:800;">Meja VIP</div>
                <div style="font-size:11px; color:var(--color-muted); margin-top:2px;">Kartu meja tampil lebih lebar</div>
              </div>
              <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
                <input type="checkbox" id="edit-table-vip" ${editingTable?.isVip ? 'checked' : ''} style="opacity:0; width:0; height:0; position:absolute;">
                <span id="edit-vip-track" style="position:absolute; inset:0; background:${editingTable?.isVip ? '#5939e5' : '#d1d5db'}; border:2px solid var(--color-text); border-radius:12px; transition:background 0.2s;">
                  <span id="edit-vip-thumb" style="position:absolute; top:1px; left:${editingTable?.isVip ? '23px' : '1px'}; width:16px; height:16px; background:white; border:1.5px solid var(--color-text); border-radius:50%; transition:left 0.2s;"></span>
                </span>
              </label>
            </div>

            <!-- Error message -->
            <div id="edit-table-error" style="display:none; background:#fef2f2; border:2px solid var(--color-error); border-radius:var(--radius-sm); padding:8px 12px; font-size:12px; font-weight:700; color:var(--color-error);"></div>

          </div>

          <!-- Footer: Delete + Save -->
          <div style="padding:0 20px 20px 20px; display:flex; gap:10px;">
            <button id="btn-delete-table" style="height:42px; padding:0 14px; background:#fef2f2; border:2px solid var(--color-error); box-shadow:2px 2px 0 var(--color-error); border-radius:var(--radius-sm); font-weight:800; font-size:12px; color:var(--color-error); cursor:pointer; display:flex; align-items:center; gap:6px; font-family:var(--font-family);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Hapus
            </button>
            <button id="btn-cancel-edit-table" class="btn btn-outline flex-1" style="height:42px; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text); font-weight:bold;">Batal</button>
            <button id="btn-confirm-edit-table" class="btn btn-primary flex-1" style="height:42px; background:#374151; color:white; font-weight:bold; border:2px solid var(--color-text); box-shadow:2px 2px 0 var(--color-text);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;"><polyline points="20,6 9,17 4,12"/></svg>
              Simpan
            </button>
          </div>
        </div>
      </div>
    `;

    attachListeners();
  };

  const attachListeners = () => {
    setupTopbarListeners(container);
    // Show QR modal
    container.querySelectorAll('.btn-qr-table').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTableForQr = btn.dataset.name;
        renderContent();
      });
    });

    // Open Edit Modal
    container.querySelectorAll('.btn-edit-table').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tableId = btn.dataset.id;
        editingTable = store.tables.find(t => t.id === tableId) || null;
        renderContent();
      });
    });

    // Close Edit Modal
    const btnCloseEdit = container.querySelector('#btn-close-edit-modal');
    if (btnCloseEdit) {
      btnCloseEdit.addEventListener('click', () => {
        editingTable = null;
        renderContent();
      });
    }
    const btnCancelEdit = container.querySelector('#btn-cancel-edit-table');
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        editingTable = null;
        renderContent();
      });
    }

    // VIP toggle in edit modal
    const editVipCheckbox = container.querySelector('#edit-table-vip');
    const editVipTrack = container.querySelector('#edit-vip-track');
    const editVipThumb = container.querySelector('#edit-vip-thumb');
    if (editVipCheckbox) {
      editVipCheckbox.addEventListener('change', () => {
        if (editVipCheckbox.checked) {
          editVipTrack.style.background = '#5939e5';
          editVipThumb.style.left = '23px';
        } else {
          editVipTrack.style.background = '#d1d5db';
          editVipThumb.style.left = '1px';
        }
      });
    }

    // Delete table
    const btnDeleteTable = container.querySelector('#btn-delete-table');
    if (btnDeleteTable && editingTable) {
      btnDeleteTable.addEventListener('click', () => {
        if (confirm(`Hapus "${editingTable.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
          store.deleteTable(editingTable.id);
          editingTable = null;
          renderContent();
        }
      });
    }

    // Save edit
    const btnConfirmEdit = container.querySelector('#btn-confirm-edit-table');
    if (btnConfirmEdit && editingTable) {
      btnConfirmEdit.addEventListener('click', () => {
        const nameInput = container.querySelector('#edit-table-name');
        const capacityInput = container.querySelector('#edit-table-capacity');
        const vipInput = container.querySelector('#edit-table-vip');
        const errorEl = container.querySelector('#edit-table-error');

        const name = nameInput.value.trim();
        const capacity = parseInt(capacityInput.value) || 0;

        if (!name) {
          errorEl.textContent = '⚠️ Nama meja tidak boleh kosong.';
          errorEl.style.display = 'block';
          nameInput.focus();
          return;
        }
        const duplicate = store.tables.find(t => t.name.toLowerCase() === name.toLowerCase() && t.id !== editingTable.id);
        if (duplicate) {
          errorEl.textContent = `⚠️ Nama meja "${name}" sudah digunakan oleh meja lain.`;
          errorEl.style.display = 'block';
          nameInput.focus();
          return;
        }
        if (capacity < 1 || capacity > 50) {
          errorEl.textContent = '⚠️ Kapasitas harus antara 1–50 orang.';
          errorEl.style.display = 'block';
          capacityInput.focus();
          return;
        }

        store.updateTable(editingTable.id, {
          name,
          capacity,
          isVip: vipInput.checked,
        });

        editingTable = null;
        renderContent();
      });
    }

    // Close QR modal
    const btnClose = container.querySelector('#btn-close-qr-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        activeTableForQr = null;
        renderContent();
      });
    }

    const btnCancel = container.querySelector('#btn-cancel-qr-modal');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        activeTableForQr = null;
        renderContent();
      });
    }

    // Auto-close modal when clicking dynamic open link
    const btnOpenLink = container.querySelector('#btn-open-link-qr');
    if (btnOpenLink) {
      btnOpenLink.addEventListener('click', () => {
        activeTableForQr = null;
        setTimeout(() => renderContent(), 100);
      });
    }

    // Tambah Meja button
    const btnAddTable = container.querySelector('#btn-add-table');
    if (btnAddTable) {
      btnAddTable.addEventListener('click', () => {
        showAddModal = true;
        renderContent();
      });
    }

    // Close Add Modal
    const btnCloseAdd = container.querySelector('#btn-close-add-modal');
    if (btnCloseAdd) {
      btnCloseAdd.addEventListener('click', () => {
        showAddModal = false;
        renderContent();
      });
    }
    const btnCancelAdd = container.querySelector('#btn-cancel-add-table');
    if (btnCancelAdd) {
      btnCancelAdd.addEventListener('click', () => {
        showAddModal = false;
        renderContent();
      });
    }

    // VIP Toggle visual feedback
    const vipCheckbox = container.querySelector('#input-table-vip');
    const vipTrack = container.querySelector('#vip-toggle-track');
    const vipThumb = container.querySelector('#vip-toggle-thumb');
    if (vipCheckbox) {
      vipCheckbox.addEventListener('change', () => {
        if (vipCheckbox.checked) {
          vipTrack.style.background = '#5939e5';
          vipThumb.style.left = '23px';
        } else {
          vipTrack.style.background = '#d1d5db';
          vipThumb.style.left = '1px';
        }
      });
    }

    // Confirm Add Table (form submit)
    const btnConfirmAdd = container.querySelector('#btn-confirm-add-table');
    if (btnConfirmAdd) {
      btnConfirmAdd.addEventListener('click', () => {
        const nameInput = container.querySelector('#input-table-name');
        const capacityInput = container.querySelector('#input-table-capacity');
        const vipInput = container.querySelector('#input-table-vip');
        const errorEl = container.querySelector('#add-table-error');

        const name = nameInput.value.trim();
        const capacity = parseInt(capacityInput.value) || 0;

        // Validation
        if (!name) {
          errorEl.textContent = '⚠️ Nama meja tidak boleh kosong.';
          errorEl.style.display = 'block';
          nameInput.focus();
          return;
        }
        if (store.tables.find(t => t.name.toLowerCase() === name.toLowerCase())) {
          errorEl.textContent = `⚠️ Nama meja "${name}" sudah ada. Gunakan nama lain.`;
          errorEl.style.display = 'block';
          nameInput.focus();
          return;
        }
        if (capacity < 1 || capacity > 50) {
          errorEl.textContent = '⚠️ Kapasitas harus antara 1–50 orang.';
          errorEl.style.display = 'block';
          capacityInput.focus();
          return;
        }

        // Add table
        store.addTable({
          name,
          capacity,
          isVip: vipInput.checked,
        });

        showAddModal = false;
        renderContent();
      });
    }

    // Cetak Semua QR Meja
    const btnPrintAll = container.querySelector('#btn-print-all-qr');
    if (btnPrintAll) {
      btnPrintAll.addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          alert('Gagal membuka jendela cetak. Pastikan pop-up dibolehkan di browser Anda.');
          return;
        }

        const cardsHtml = store.tables.map(table => {
          const qrUrl = `${window.location.origin}${window.location.pathname}#/scan-order?table=${encodeURIComponent(table.name || '')}`;
          const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&margin=10`;
          return `
            <div class="card">
              <div class="brand-title">Suka Bakar Dimsum</div>
              <div class="brand-subtitle">Authentic Dimsum & More</div>
              <div class="table-badge">${table.name}</div>
              <div class="qr-container" style="display: flex; justify-content: center; align-items: center; margin: 15px 0;">
                <img src="${qrImgSrc}" alt="QR ${table.name}" style="width: 200px; height: 200px; display: block; border: 2px solid #111827;" />
              </div>
              <div class="instructions">Silakan scan untuk memesan secara mandiri</div>
            </div>
          `;
        }).join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Cetak QR Code Meja - Suka Bakar Dimsum</title>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Sora', sans-serif;
                margin: 0;
                padding: 20px;
                background: #f0f0f0;
                color: #111827;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print-bar {
                background: white;
                padding: 16px 24px;
                border: 3px solid #111827;
                box-shadow: 4px 4px 0 #111827;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .no-print-bar h2 {
                margin: 0;
                font-weight: 800;
              }
              .btn {
                background: #fce354;
                color: #111827;
                border: 3px solid #111827;
                box-shadow: 3px 3px 0 #111827;
                padding: 10px 20px;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                font-family: inherit;
              }
              .btn:hover {
                transform: translate(-2px, -2px);
                box-shadow: 5px 5px 0 #111827;
              }
              .btn:active {
                transform: translate(2px, 2px);
                box-shadow: 1px 1px 0 #111827;
              }
              .btn-outline {
                background: white;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 24px;
              }
              .card {
                background: white;
                border: 3px solid #111827;
                box-shadow: 6px 6px 0 #111827;
                padding: 24px;
                text-align: center;
                position: relative;
                page-break-inside: avoid;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .brand-title {
                font-size: 20px;
                font-weight: 800;
                color: #5939e5;
                margin: 0 0 4px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .brand-subtitle {
                font-size: 12px;
                font-weight: 700;
                color: #4b5563;
                margin: 0 0 16px 0;
              }
              .table-badge {
                background: #fce354;
                border: 2px solid #111827;
                padding: 6px 20px;
                font-size: 16px;
                font-weight: 800;
                margin-bottom: 16px;
                text-transform: uppercase;
                box-shadow: 2px 2px 0 #111827;
              }
              .qr-container {
                margin: 12px 0;
              }
              .instructions {
                font-size: 12px;
                font-weight: 700;
                color: #89427c;
                margin: 16px 0 8px 0;
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .no-print-bar {
                  display: none;
                }
                .grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                }
                .card {
                  box-shadow: none;
                  border: 2px solid #111827;
                  page-break-inside: avoid;
                  margin-bottom: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="no-print-bar">
              <div>
                <h2>🖨️ Cetak Semua QR Code Meja</h2>
                <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">Siap dicetak untuk diletakkan di meja pelanggan (Meja 1 - 10 + VIP)</p>
              </div>
              <div style="display: flex; gap: 12px;">
                <button class="btn btn-outline" onclick="window.close()">Tutup</button>
                <button class="btn" onclick="window.print()">🖨️ Cetak Sekarang</button>
              </div>
            </div>
            
            <div class="grid">
              ${cardsHtml}
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 600);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      });
    }

    // Download QR Code card
    const btnDownload = container.querySelector('#btn-download-qr');
    if (btnDownload && activeTableForQr) {
      btnDownload.addEventListener('click', () => {
        const origText = btnDownload.innerHTML;
        btnDownload.disabled = true;
        btnDownload.innerHTML = '🔄 Loading...';

        const qrUrl = `${window.location.origin}${window.location.pathname}#/scan-order?table=${encodeURIComponent(activeTableForQr)}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&margin=10`;

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous'; // Prevent tainted canvas
        qrImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');

          // Fill background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw neubrutalist outer border
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 6;
          ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

          // Draw top header brand
          ctx.fillStyle = '#5939e5';
          ctx.font = 'bold 28px Sora, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SUKA BAKAR DIMSUM', canvas.width / 2, 60);

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 16px Sora, Arial, sans-serif';
          ctx.fillText('Authentic Dimsum & More', canvas.width / 2, 90);

          // Draw table name capsule
          ctx.fillStyle = '#fce354';
          ctx.fillRect(120, 110, 160, 40);
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 3;
          ctx.strokeRect(120, 110, 160, 40);
          
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 18px Sora, Arial, sans-serif';
          ctx.fillText(activeTableForQr.toUpperCase(), canvas.width / 2, 136);

          // Draw real QR Code Image
          const qrX = 100;
          const qrY = 180;
          const qrSize = 200;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          // Draw simple neubrutalist border around QR Code image
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 3;
          ctx.strokeRect(qrX, qrY, qrSize, qrSize);

          // Bottom link
          ctx.fillStyle = '#474555';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`SCAN TO ORDER: ${activeTableForQr}`, canvas.width / 2, 420);
          ctx.fillText(qrUrl, canvas.width / 2, 440);

          ctx.fillStyle = '#89427c';
          ctx.font = 'bold 13px Sora, Arial, sans-serif';
          ctx.fillText('Silakan scan untuk memesan secara mandiri.', canvas.width / 2, 475);

          // Download trigger
          try {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `QR_KedaiPojok13_${activeTableForQr.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.error('Error exporting canvas:', e);
            alert('Gagal mengekspor gambar QR Code. Pastikan koneksi internet aktif.');
          }

          btnDownload.disabled = false;
          btnDownload.innerHTML = origText;
        };

        qrImg.onerror = () => {
          alert('Gagal memuat QR Code dari API server. Silakan coba beberapa saat lagi.');
          btnDownload.disabled = false;
          btnDownload.innerHTML = origText;
        };

        qrImg.src = qrApiUrl;
      });
    }
  };

  renderContent();

  return () => {};
}

import { store } from '../store.js';
import { icons, formatRupiah, $ } from '../utils.js';
import { renderSharedTopbar, setupTopbarListeners } from '../topbar.js';

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
  let activeCategory = 'Semua';
  let searchQuery = '';

  const getStatusDetails = (stock) => {
    if (stock === 0) return { label: 'Habis', color: 'error' };
    if (stock <= 10) return { label: 'Stok Menipis', color: 'warning' };
    return { label: 'Stok Aman', color: 'success' };
  };

  const renderContent = () => {
    let filteredData = store.inventory;

    // Filter by Category
    if (activeCategory !== 'Semua') {
      filteredData = filteredData.filter(item => item.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      filteredData = filteredData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('inventory')}
        <main class="main-content">
          ${renderSharedTopbar('Inventory', {
            actionsHtml: `
              <button class="btn btn-yellow" id="btn-tambah-produk" style="border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); color: var(--color-text); font-weight: bold; margin-right: 12px;">
                ${icons.plus} Tambah Produk
              </button>
            `
          })}
          
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
            
            <div class="flex items-center gap-lg" style="margin-bottom: var(--space-xl); flex-wrap: wrap;">
              <!-- Search Box -->
              <div class="input-icon" style="flex: 1; min-width: 280px; max-width: 400px; position: relative;">
                <span style="position: absolute; left: 16px; top: 12px; font-size: 18px;">🔍</span>
                <input type="text" class="input" id="search-inventory" placeholder="Cari barang di gudang..." value="${searchQuery}" style="border-radius: var(--radius-pill); padding-left: 44px; height: 48px; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); font-weight: bold; width: 100%;">
              </div>

              <!-- Category Chips -->
              <div class="flex gap-sm" style="overflow-x: auto; padding-bottom: 8px; flex: 2; align-items: center; min-width: 300px;">
                ${['Semua', 'Bahan Baku', 'Produk Jadi', 'Minuman', 'Lainnya'].map(cat => `
                  <button class="chip ${activeCategory === cat ? 'active' : ''}" data-category="${cat}" style="border: 2px solid var(--color-text); box-shadow: ${activeCategory === cat ? 'none' : '4px 4px 0 var(--color-text)'}; height: 40px; transform: ${activeCategory === cat ? 'translate(4px, 4px)' : 'none'};">${cat}</button>
                `).join('')}
              </div>
            </div>

            <!-- Table -->
            <div class="table-container" style="border: 2px solid var(--color-text); box-shadow: 6px 6px 0 var(--color-text); border-radius: var(--radius-md); overflow: hidden; background: white;">
              <table class="table">
                <thead>
                  <tr style="background: var(--color-surface-dim); border-bottom: 2px solid var(--color-text);">
                    <th style="width: 70px; padding: 14px 16px;">IKON</th>
                    <th style="padding: 14px 16px;">NAMA PRODUK</th>
                    <th style="padding: 14px 16px;">KATEGORI</th>
                    <th style="padding: 14px 16px;">STOK</th>
                    <th style="padding: 14px 16px;">STATUS</th>
                    <th style="text-align: right; padding: 14px 16px; width: 280px;">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredData.map(item => {
                    const status = getStatusDetails(item.stock);
                    return `
                      <tr style="border-bottom: 2px solid var(--color-border);">
                        <td style="padding: 14px 16px;">
                          <div style="font-size: 26px; display: inline-block;">${item.icon || '📦'}</div>
                        </td>
                        <td style="padding: 14px 16px;">
                          <span class="text-bold text-lg" style="color: var(--color-text);">${item.name}</span>
                        </td>
                        <td style="padding: 14px 16px;">
                          <span class="badge badge-gray" style="border: 1.5px solid var(--color-text); font-weight: bold; border-radius: 4px;">${item.category}</span>
                        </td>
                        <td style="padding: 14px 16px;">
                          <span class="text-bold" style="font-size: 18px;">${item.stock}</span> <span class="text-muted" style="font-weight: 600;">${item.unit || 'Pcs'}</span>
                        </td>
                        <td style="padding: 14px 16px;">
                          <span class="badge badge-${status.color}" style="border: 1.5px solid var(--color-text); font-weight: 800; border-radius: 4px; padding: 4px 8px;">${status.label.toUpperCase()}</span>
                        </td>
                        <td style="text-align: right; padding: 14px 16px;">
                          <div style="display: flex; gap: 8px; justify-content: flex-end;">
                            <button class="btn btn-primary btn-sm btn-update-stock" data-id="${item.id}" data-name="${item.name}" data-stock="${item.stock}" style="background: var(--color-primary); color: white; border: 1.5px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); font-weight: bold; padding: 6px 12px; height: 34px;">
                              ${item.stock === 0 ? 'Restock' : 'Stok'}
                            </button>
                            <button class="btn btn-outline btn-sm btn-edit-item" data-id="${item.id}" style="border: 1.5px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); font-weight: bold; padding: 6px 12px; height: 34px; background: white; display: flex; align-items: center; gap: 4px;">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            <button class="btn btn-outline btn-sm btn-delete-item" data-id="${item.id}" data-name="${item.name}" style="border: 1.5px solid var(--color-error); box-shadow: 2px 2px 0 var(--color-error); font-weight: bold; padding: 6px 12px; height: 34px; background: var(--color-error-light); color: var(--color-error); display: flex; align-items: center; gap: 4px;">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                  ${filteredData.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 48px; font-weight: bold; color: var(--color-text-muted);">Tidak ada produk di kategori ini.</td></tr>' : ''}
                </tbody>
              </table>
            </div>
            
          </div>
        </main>

        <!-- Modal Tambah Produk -->
        <div id="modal-tambah" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); border: 3px solid var(--color-text); box-shadow: 8px 8px 0 var(--color-text);">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: 900;">Tambah Produk Baru</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal" style="font-size: 20px; font-weight: bold;">✕</button>
            </div>
            
            <form id="form-tambah">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: 800;">Nama Produk</label>
                  <input type="text" class="input" id="add-item-name" required placeholder="Contoh: Kulit Dimsum Premium" style="border: 2px solid var(--color-text); font-weight: bold;">
                </div>
                
                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Kategori</label>
                    <select class="input" id="add-item-category" style="border: 2px solid var(--color-text); font-weight: bold; background: white;">
                      <option>Bahan Baku</option>
                      <option>Produk Jadi</option>
                      <option>Minuman</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Ikon / Emoji</label>
                    <input type="text" class="input" id="add-item-icon" required placeholder="🥟" value="🥟" maxLength="2" style="border: 2px solid var(--color-text); font-weight: bold; text-align: center;">
                  </div>
                </div>

                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Stok Awal</label>
                    <input type="number" class="input" id="add-item-stock" required placeholder="0" min="0" style="border: 2px solid var(--color-text); font-weight: bold;">
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Satuan</label>
                    <select class="input" id="add-item-unit" style="border: 2px solid var(--color-text); font-weight: bold; background: white;">
                      <option>Pcs</option>
                      <option>Porsi</option>
                      <option>Kg</option>
                      <option>Lembar</option>
                      <option>Box</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal" style="border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Batal</button>
                <button type="submit" class="btn btn-primary flex-1" style="background: var(--color-primary); color: white; border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Simpan</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Edit/Ubah Produk -->
        <div id="modal-edit" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); border: 3px solid var(--color-text); box-shadow: 8px 8px 0 var(--color-text);">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: 900;">Ubah Detail Barang</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-edit-modal" style="font-size: 20px; font-weight: bold;">✕</button>
            </div>
            
            <form id="form-edit">
              <input type="hidden" id="edit-item-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: 800;">Nama Produk</label>
                  <input type="text" class="input" id="edit-item-name" required style="border: 2px solid var(--color-text); font-weight: bold;">
                </div>
                
                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Kategori</label>
                    <select class="input" id="edit-item-category" style="border: 2px solid var(--color-text); font-weight: bold; background: white;">
                      <option>Bahan Baku</option>
                      <option>Produk Jadi</option>
                      <option>Minuman</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Ikon / Emoji</label>
                    <input type="text" class="input" id="edit-item-icon" required maxLength="2" style="border: 2px solid var(--color-text); font-weight: bold; text-align: center;">
                  </div>
                </div>

                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Stok Saat Ini</label>
                    <input type="number" class="input" id="edit-item-stock" required min="0" style="border: 2px solid var(--color-text); font-weight: bold;">
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: 800;">Satuan</label>
                    <select class="input" id="edit-item-unit" style="border: 2px solid var(--color-text); font-weight: bold; background: white;">
                      <option>Pcs</option>
                      <option>Porsi</option>
                      <option>Kg</option>
                      <option>Lembar</option>
                      <option>Box</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-edit-modal" style="border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Batal</button>
                <button type="submit" class="btn btn-primary flex-1" style="background: var(--color-primary); color: white; border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Update Stock -->
        <div id="modal-update-stock" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 400px; padding: var(--space-2xl); border: 3px solid var(--color-text); box-shadow: 8px 8px 0 var(--color-text);">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: 900;">Update Stok</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-update-modal" style="font-size: 20px; font-weight: bold;">✕</button>
            </div>
            <form id="form-update-stock">
              <input type="hidden" id="update-stock-item-id">
              <div class="flex-col gap-md">
                <p id="update-stock-item-name" class="text-bold" style="font-size: 20px; margin-bottom: 8px; color: var(--color-primary);">Nama Barang</p>
                <div class="input-group">
                  <label class="input-label" style="font-weight: 800;">Jumlah Stok Baru</label>
                  <input type="number" class="input" id="update-stock-input" required min="0" placeholder="0" style="border: 2px solid var(--color-text); font-weight: bold;">
                </div>
              </div>
              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-update-modal" style="border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Batal</button>
                <button type="submit" class="btn btn-primary flex-1" style="background: var(--color-primary); color: white; border: 2px solid var(--color-text); font-weight: bold; box-shadow: 2px 2px 0 var(--color-text);">Simpan</button>
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

    // Live search input
    const searchInput = container.querySelector('#search-inventory');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderContent();
        const input = container.querySelector('#search-inventory');
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
      });
    }

    // Chips Listeners
    container.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.target.dataset.category;
        renderContent();
      });
    });

    // --- Modal Tambah Produk Listeners ---
    const modalTambah = container.querySelector('#modal-tambah');
    const btnTambah = container.querySelector('#btn-tambah-produk');
    const btnCloseTambah = container.querySelector('#btn-close-modal');
    const btnCancelTambah = container.querySelector('#btn-cancel-modal');
    const formTambah = container.querySelector('#form-tambah');

    btnTambah?.addEventListener('click', () => {
      modalTambah.style.display = 'flex';
      container.querySelector('#add-item-name')?.focus();
    });

    const closeTambahModal = () => {
      modalTambah.style.display = 'none';
      formTambah?.reset();
    };

    btnCloseTambah?.addEventListener('click', closeTambahModal);
    btnCancelTambah?.addEventListener('click', closeTambahModal);

    formTambah?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#add-item-name').value.trim();
      const category = container.querySelector('#add-item-category').value;
      const icon = container.querySelector('#add-item-icon').value.trim() || '📦';
      const stock = container.querySelector('#add-item-stock').value;
      const unit = container.querySelector('#add-item-unit').value;

      if (name) {
        store.addInventoryItem({ name, category, icon, stock, unit });
        alert(`🎉 Produk "${name}" berhasil ditambahkan ke Inventory!`);
        closeTambahModal();
      }
    });

    // --- Modal Edit Produk Listeners ---
    const modalEdit = container.querySelector('#modal-edit');
    const formEdit = container.querySelector('#form-edit');
    const btnCloseEdit = container.querySelector('#btn-close-edit-modal');
    const btnCancelEdit = container.querySelector('#btn-cancel-edit-modal');

    const closeEditModal = () => {
      modalEdit.style.display = 'none';
      formEdit?.reset();
    };

    btnCloseEdit?.addEventListener('click', closeEditModal);
    btnCancelEdit?.addEventListener('click', closeEditModal);

    container.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = store.inventory.find(i => i.id === id);
        if (item) {
          container.querySelector('#edit-item-id').value = item.id;
          container.querySelector('#edit-item-name').value = item.name;
          container.querySelector('#edit-item-category').value = item.category;
          container.querySelector('#edit-item-icon').value = item.icon || '📦';
          container.querySelector('#edit-item-stock').value = item.stock;
          container.querySelector('#edit-item-unit').value = item.unit || 'Pcs';
          
          modalEdit.style.display = 'flex';
          container.querySelector('#edit-item-name').focus();
        }
      });
    });

    formEdit?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = container.querySelector('#edit-item-id').value;
      const name = container.querySelector('#edit-item-name').value.trim();
      const category = container.querySelector('#edit-item-category').value;
      const icon = container.querySelector('#edit-item-icon').value.trim() || '📦';
      const stock = container.querySelector('#edit-item-stock').value;
      const unit = container.querySelector('#edit-item-unit').value;

      if (id && name) {
        store.updateInventoryItem(id, { name, category, icon, stock, unit });
        alert(`✏️ Produk "${name}" berhasil diperbarui!`);
        closeEditModal();
      }
    });

    // --- Modal Update Stock Listeners ---
    const modalUpdate = container.querySelector('#modal-update-stock');
    const formUpdate = container.querySelector('#form-update-stock');
    const labelItemName = container.querySelector('#update-stock-item-name');
    const inputUpdate = container.querySelector('#update-stock-input');
    const inputUpdateId = container.querySelector('#update-stock-item-id');
    const btnCloseUpdate = container.querySelector('#btn-close-update-modal');
    const btnCancelUpdate = container.querySelector('#btn-cancel-update-modal');

    const closeUpdateModal = () => {
      modalUpdate.style.display = 'none';
      formUpdate?.reset();
    };

    btnCloseUpdate?.addEventListener('click', closeUpdateModal);
    btnCancelUpdate?.addEventListener('click', closeUpdateModal);

    container.querySelectorAll('.btn-update-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const stock = btn.dataset.stock;
        
        if (inputUpdateId) inputUpdateId.value = id;
        if (labelItemName) labelItemName.textContent = name;
        if (inputUpdate) inputUpdate.value = stock;

        modalUpdate.style.display = 'flex';
        inputUpdate?.focus();
        inputUpdate?.select();
      });
    });

    formUpdate?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = inputUpdateId?.value;
      const newStock = parseInt(inputUpdate?.value || '0');
      const name = labelItemName?.textContent;

      if (id) {
        store.updateInventoryItem(id, { stock: newStock });
        alert(`📈 Stok "${name}" berhasil diperbarui menjadi ${newStock}!`);
        closeUpdateModal();
      }
    });

    // --- Delete Button Listener ---
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (id && confirm(`🗑️ Apakah Anda yakin ingin menghapus produk "${name}" dari inventory?\n\nTindakan ini tidak dapat dibatalkan.`)) {
          store.deleteInventoryItem(id);
          alert(`✅ Produk "${name}" berhasil dihapus.`);
        }
      });
    });
  };

  // Initial Render
  renderContent();

  // Subscribe to central store updates
  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);

  return () => {
    unsubscribe();
  };
}

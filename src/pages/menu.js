import { store } from '../store.js';
import { navigate } from '../router.js';
import { formatRupiah, icons, foodEmojis, $, $$ } from '../utils.js';
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
  let activeCategory = 'Semua';
  let searchQuery = '';
  let sortBy = 'default'; // 'default' | 'category' | 'price'

  const renderContent = () => {
    let filteredMenu = [...store.menuItems];
    if (activeCategory !== 'Semua') {
      filteredMenu = filteredMenu.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'category') {
      filteredMenu.sort((a, b) => a.category.localeCompare(b.category) || a.price - b.price);
    } else if (sortBy === 'price') {
      filteredMenu.sort((a, b) => a.price - b.price);
    }

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('menu')}
        <main class="main-content">
          ${renderSharedTopbar('Manajemen Menu & Kategori', {
            actionsHtml: `
              <div class="flex gap-sm" style="margin-right: 12px;">
                <button class="btn btn-yellow" id="btn-add-category" style="height: 40px; border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); font-weight: bold;">
                  ${icons.plus} Tambah Kategori
                </button>
                <button class="btn btn-primary" id="btn-add-menu" style="height: 40px; border: 2px solid var(--color-text); box-shadow: 2px 2px 0 var(--color-text); background: var(--color-primary); color: white; font-weight: bold;">
                  ${icons.plus} Tambah Menu Baru
                </button>
              </div>
            `
          })}
          
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
            
            <div class="flex items-center gap-lg" style="margin-bottom: var(--space-lg);">
              <div class="search-bar" style="max-width: 400px; flex: 1; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); background: white;">
                ${icons.search}
                <input type="text" placeholder="Cari menu..." id="search-input-menu" value="${searchQuery}" style="background: transparent; border: none; outline: none; width: 100%;">
              </div>

              <!-- Category Chips -->
              <div class="flex gap-sm" style="overflow-x: auto; padding-bottom: 4px; flex: 2;">
                ${store.categories.map(cat => `
                  <button class="chip ${cat === activeCategory ? 'active chip-purple' : ''}" data-category="${cat}" style="${cat === activeCategory ? 'background: var(--color-border); color: white;' : ''}">${cat}</button>
                `).join('')}
              </div>

              <!-- Sort Buttons -->
              <div class="flex gap-xs" style="flex-shrink: 0;">
                <button id="sort-by-category" title="Urutkan A-Z per Kategori" style="
                  height: 36px; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px;
                  display: flex; align-items: center; gap: 5px; white-space: nowrap; font-family: var(--font-family);
                  border: 2px solid var(--color-text);
                  box-shadow: ${sortBy === 'category' ? 'none' : '2px 2px 0 var(--color-text)'};
                  transform: ${sortBy === 'category' ? 'translate(2px,2px)' : ''};
                  background: ${sortBy === 'category' ? '#111827' : 'white'};
                  color: ${sortBy === 'category' ? 'white' : 'var(--color-text)'};
                ">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                  Kategori
                </button>
                <button id="sort-by-price" title="Urutkan harga terkecil ke terbesar" style="
                  height: 36px; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px;
                  display: flex; align-items: center; gap: 5px; white-space: nowrap; font-family: var(--font-family);
                  border: 2px solid var(--color-text);
                  box-shadow: ${sortBy === 'price' ? 'none' : '2px 2px 0 var(--color-text)'};
                  transform: ${sortBy === 'price' ? 'translate(2px,2px)' : ''};
                  background: ${sortBy === 'price' ? '#111827' : 'white'};
                  color: ${sortBy === 'price' ? 'white' : 'var(--color-text)'};
                ">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Harga ↑
                </button>
              </div>
            </div>

            <!-- Table Menu Items -->
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 80px;">IKON</th>
                    <th>NAMA MENU</th>
                    <th>KATEGORI</th>
                    <th>HARGA</th>
                    <th>STATUS KETERSEDIAAN</th>
                    <th style="text-align: center; width: 100px;">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredMenu.map(item => `
                    <tr data-id="${item.id}">
                      <td>
                        <div style="font-size: 32px; text-align: center;">${item.emoji || foodEmojis[item.name] || '🥟'}</div>
                      </td>
                      <td>
                        <span class="text-bold" style="font-size: 16px;">${item.name}</span>
                      </td>
                      <td>
                        <span class="badge badge-${item.badgeColor || 'purple'}">${item.category}</span>
                      </td>
                      <td class="text-bold" style="font-size: 16px; color: var(--color-primary);">
                        ${formatRupiah(item.price)}
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <!-- Custom Switch -->
                          <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 26px;">
                            <input type="checkbox" class="toggle-availability" ${item.available ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <span class="slider" style="position: absolute; cursor: pointer; inset: 0; background-color: var(--color-surface-dim); border: 2px solid var(--color-border); border-radius: 34px; transition: .3s; display: flex; align-items: center;">
                              <span class="slider-dot" style="position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--color-border); border-radius: 50%; transition: .3s; ${item.available ? 'transform: translateX(24px); background-color: var(--color-success);' : ''}"></span>
                            </span>
                          </label>
                          <span class="text-bold ${item.available ? 'text-success' : 'text-error'}" style="font-size: 14px;">
                            ${item.available ? 'Tersedia' : 'HABIS'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="flex justify-center gap-xs">
                          <button class="btn-icon-sm btn-outline btn-edit-menu">${icons.edit}</button>
                          <button class="btn-icon-sm btn-outline text-error btn-delete-menu" style="border-color: var(--color-error); background: var(--color-error-light);">${icons.trash}</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                  ${filteredMenu.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 32px;">Tidak ada menu yang sesuai.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

          </div>
        </main>

        <!-- Modal Tambah/Edit Menu -->
        <div id="modal-menu" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); background: var(--color-white); border: 2px solid var(--color-border); box-shadow: 6px 6px 0 var(--color-border); position: relative;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 id="modal-menu-title" style="font-size: 24px; font-weight: bold;">Tambah Menu Baru</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal-menu">✕</button>
            </div>
            
            <form id="form-menu">
              <input type="hidden" id="menu-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Nama Menu</label>
                  <input type="text" class="input" id="menu-name" required placeholder="Ex: Hakau Mentai" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>
                
                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Kategori</label>
                    <select class="input" id="menu-category" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      ${store.categories.filter(cat => cat !== 'Semua').map(cat => `
                        <option value="${cat}">${cat}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Ikon Emoji</label>
                    <select class="input" id="menu-emoji" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      <option value="🥟">🥟 Dimsum / Dumpling</option>
                      <option value="🦐">🦐 Udang / Hakau</option>
                      <option value="🥠">🥠 Mantau / Pangsit</option>
                      <option value="🌶️">🌶️ Pedas / Mercon</option>
                      <option value="🌯">🌯 Lumpia</option>
                      <option value="🍲">🍲 Bubur</option>
                      <option value="🍛">🍛 Nasi Goreng</option>
                      <option value="🧋">🧋 Minuman Es Teh</option>
                      <option value="☕">☕ Kopi / Es Kopi</option>
                      <option value="🍊">🍊 Es Jeruk</option>
                    </select>
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Harga (Rp)</label>
                  <input type="number" class="input" id="menu-price" required placeholder="0" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>

                <div class="input-group" style="flex-direction: row; align-items: center; gap: 8px;">
                  <input type="checkbox" id="menu-available" checked style="width: 20px; height: 20px; border: 2px solid var(--color-border); border-radius: var(--radius-sm); accent-color: var(--color-primary);">
                  <label for="menu-available" class="text-bold" style="cursor: pointer;">Menu ini langsung Tersedia</label>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal-menu">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);">Simpan Menu</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Tambah Kategori -->
        <div id="modal-category" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 440px; padding: var(--space-2xl); background: var(--color-white); border: 2px solid var(--color-border); box-shadow: 6px 6px 0 var(--color-border); position: relative;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 style="font-size: 24px; font-weight: bold;">Tambah Kategori Baru</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal-cat">✕</button>
            </div>
            
            <form id="form-category">
              <div class="flex-col gap-md" style="margin-bottom: var(--space-xl);">
                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Nama Kategori Baru</label>
                  <input type="text" class="input" id="cat-name" required placeholder="Contoh: Saus Keju" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>
              </div>

              <div class="flex gap-sm">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal-cat">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);">Tambah Kategori</button>
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
    // Sort Buttons
    container.querySelector('#sort-by-category')?.addEventListener('click', () => {
      sortBy = sortBy === 'category' ? 'default' : 'category';
      renderContent();
    });
    container.querySelector('#sort-by-price')?.addEventListener('click', () => {
      sortBy = sortBy === 'price' ? 'default' : 'price';
      renderContent();
    });

    // Chips Listeners
    container.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.target.dataset.category;
        renderContent();
      });
    });

    // Search input
    const searchInput = container.querySelector('#search-input-menu');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderContent();
        container.querySelector('#search-input-menu').focus();
        const len = container.querySelector('#search-input-menu').value.length;
        container.querySelector('#search-input-menu').setSelectionRange(len, len);
      });
    }

    // Modal Menu elements
    const modalMenu = container.querySelector('#modal-menu');
    const formMenu = container.querySelector('#form-menu');
    const modalMenuTitle = container.querySelector('#modal-menu-title');
    const inputMenuId = container.querySelector('#menu-id');
    const inputMenuName = container.querySelector('#menu-name');
    const inputMenuCategory = container.querySelector('#menu-category');
    const inputMenuEmoji = container.querySelector('#menu-emoji');
    const inputMenuPrice = container.querySelector('#menu-price');
    const inputMenuAvailable = container.querySelector('#menu-available');

    const closeMenuModal = () => {
      if (modalMenu) modalMenu.style.display = 'none';
      formMenu?.reset();
    };

    container.querySelector('#btn-close-modal-menu')?.addEventListener('click', closeMenuModal);
    container.querySelector('#btn-cancel-modal-menu')?.addEventListener('click', closeMenuModal);

    // Add Menu Click
    container.querySelector('#btn-add-menu')?.addEventListener('click', () => {
      formMenu.reset();
      inputMenuId.value = '';
      modalMenuTitle.textContent = 'Tambah Menu Baru';
      modalMenu.style.display = 'flex';
      inputMenuName.focus();
    });

    // Edit Menu Click
    container.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        const item = store.menuItems.find(i => i.id === id);
        
        if (item) {
          formMenu.reset();
          inputMenuId.value = item.id;
          inputMenuName.value = item.name;
          inputMenuCategory.value = item.category;
          inputMenuEmoji.value = item.emoji || '🥟';
          inputMenuPrice.value = item.price;
          inputMenuAvailable.checked = item.available;
          
          modalMenuTitle.textContent = 'Edit Menu Dimsum';
          modalMenu.style.display = 'flex';
          inputMenuName.focus();
        }
      });
    });

    // Delete Menu Click
    container.querySelectorAll('.btn-delete-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        const item = store.menuItems.find(i => i.id === id);
        if (item) {
          if (confirm(`Apakah Anda yakin ingin menghapus menu ${item.name}?`)) {
            store.deleteMenuItem(id);
            alert(`Menu ${item.name} berhasil dihapus.`);
          }
        }
      });
    });

    // Toggle Availability Change
    container.querySelectorAll('.toggle-availability').forEach(chk => {
      chk.addEventListener('change', () => {
        const tr = chk.closest('tr');
        const id = tr.dataset.id;

        // Update visual state langsung (instan, sebelum re-render)
        const isNowAvailable = chk.checked;
        const dot = chk.closest('label')?.querySelector('.slider-dot');
        const label = chk.closest('td')?.querySelector('span.text-bold');
        if (dot) {
          dot.style.transform = isNowAvailable ? 'translateX(24px)' : '';
          dot.style.backgroundColor = isNowAvailable ? 'var(--color-success)' : 'var(--color-border)';
        }
        if (label) {
          label.textContent = isNowAvailable ? 'Tersedia' : 'HABIS';
          label.className = `text-bold ${isNowAvailable ? 'text-success' : 'text-error'}`;
          label.style.fontSize = '14px';
        }

        store.toggleMenuAvailability(id);
      });
    });

    // Modal Category elements
    const modalCategory = container.querySelector('#modal-category');
    const formCategory = container.querySelector('#form-category');
    const inputCatName = container.querySelector('#cat-name');

    const closeCatModal = () => {
      if (modalCategory) modalCategory.style.display = 'none';
      formCategory?.reset();
    };

    container.querySelector('#btn-close-modal-cat')?.addEventListener('click', closeCatModal);
    container.querySelector('#btn-cancel-modal-cat')?.addEventListener('click', closeCatModal);

    container.querySelector('#btn-add-category')?.addEventListener('click', () => {
      formCategory.reset();
      modalCategory.style.display = 'flex';
      inputCatName.focus();
    });

    // Form Menu Submit
    formMenu?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = inputMenuId.value;
      const name = inputMenuName.value;
      const category = inputMenuCategory.value;
      const emoji = inputMenuEmoji.value;
      const price = Number(inputMenuPrice.value) || 0;
      const available = inputMenuAvailable.checked;
      
      const colors = ['yellow', 'pink', 'blue', 'red', 'purple'];
      const badgeColor = colors[Math.floor(Math.random() * colors.length)];

      const itemData = {
        name,
        category,
        emoji,
        price,
        available,
        badgeColor,
      };

      if (id) {
        store.updateMenuItem(id, itemData);
        alert('Menu berhasil diperbarui!');
      } else {
        itemData.id = 'menu-' + Date.now();
        store.addMenuItem(itemData);
        alert('Menu baru berhasil ditambahkan!');
      }

      closeMenuModal();
    });

    // Form Category Submit
    formCategory?.addEventListener('submit', (e) => {
      e.preventDefault();
      const catName = inputCatName.value.trim();
      if (catName) {
        store.addCategory(catName);
        alert(`Kategori "${catName}" berhasil ditambahkan!`);
        closeCatModal();
      }
    });
  };

  renderContent();

  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);

  return () => {
    unsubscribe();
  };
}

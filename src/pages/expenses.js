import { store } from '../store.js';
import { icons, formatRupiah, formatTime } from '../utils.js';
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

  let activeCategory = 'All Categories';

  const renderContent = () => {
    const userRole = store.currentUser?.role?.toLowerCase() || '';
    if (userRole === 'cashier' && activeCategory === 'All Categories') {
      activeCategory = 'Utilities';
    }
    
    // Category filter
    let filteredData = activeCategory === 'All Categories'
      ? store.expenses
      : store.expenses.filter(exp => exp.category === activeCategory);

    // Permission filter: Cashier/Staff can only see other cashiers/staff inputs.
    // They cannot see inputs from Owner or Manager.
    // AND they can only see "Utilities" category!
    if (userRole === 'cashier') {
      filteredData = filteredData.filter(exp => {
        const creatorRole = (exp.role || 'cashier').toLowerCase();
        const isCreatorStaff = creatorRole === 'cashier' || creatorRole === 'staff';
        const isUtilities = (exp.category || '').toLowerCase() === 'utilities';
        return isCreatorStaff && isUtilities;
      });
    }

    const totalExpensesValue = filteredData.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate pending approvals and weekly top category dynamically
    const pendingApprovals = 0; // Reset database has 0 pending approvals
    
    // Top category (week) calculation from store.expenses
    const categoriesSum = {};
    store.expenses.forEach(e => {
      categoriesSum[e.category] = (categoriesSum[e.category] || 0) + e.amount;
    });
    
    let topCategory = 'None';
    let topCategoryAmount = 0;
    Object.entries(categoriesSum).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('expenses')}
        <main class="main-content">
          ${renderSharedTopbar('Expense Management', {
            actionsHtml: `
              <button class="btn btn-yellow" id="btn-tambah-expense" style="border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); color: var(--color-text); font-weight: bold; margin-right: 12px;">
                ${icons.plus} New Expense
              </button>
            `
          })}
          
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
            
            <div class="flex items-center gap-lg" style="margin-bottom: var(--space-lg);">
              <div class="search-bar" style="max-width: 400px; flex: 1; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); background: white;">
                ${icons.search}
                <input type="text" placeholder="Cari pengeluaran..." style="background: transparent; border: none; outline: none; width: 100%;">
              </div>

              <!-- Category Chips -->
              <div class="flex gap-sm" style="overflow-x: auto; padding-bottom: 4px; flex: 2;">
                ${userRole === 'cashier' ? `
                  <button class="chip active chip-purple" data-category="Utilities" style="background: var(--color-border); color: white;">Utilities</button>
                ` : `
                  <button class="chip ${activeCategory === 'All Categories' ? 'active chip-purple' : ''}" data-category="All Categories" style="${activeCategory === 'All Categories' ? 'background: var(--color-border); color: white;' : ''}">All Categories</button>
                  <button class="chip ${activeCategory === 'Ingredients' ? 'active chip-purple' : ''}" data-category="Ingredients" style="${activeCategory === 'Ingredients' ? 'background: var(--color-border); color: white;' : ''}">Ingredients</button>
                  <button class="chip ${activeCategory === 'Utilities' ? 'active chip-purple' : ''}" data-category="Utilities" style="${activeCategory === 'Utilities' ? 'background: var(--color-border); color: white;' : ''}">Utilities</button>
                  <button class="chip ${activeCategory === 'Operational' ? 'active chip-purple' : ''}" data-category="Operational" style="${activeCategory === 'Operational' ? 'background: var(--color-border); color: white;' : ''}">Operational</button>
                `}
              </div>
            </div>

            <!-- 3 Summary Cards -->
            <div class="summary-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: var(--space-xl);">
              <div class="summary-card" style="background: var(--color-yellow);">
                <div class="summary-card-label">TOTAL EXPENSES TODAY</div>
                <div class="summary-card-value">${formatRupiah(totalExpensesValue)}</div>
              </div>
              <div class="summary-card card-interactive" style="background: var(--color-white); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div class="summary-card-label text-muted">PENDING APPROVALS</div>
                  <div class="summary-card-value text-primary">${pendingApprovals} items</div>
                </div>
                <button class="btn btn-outline btn-sm" ${pendingApprovals === 0 ? 'disabled' : ''}>Review</button>
              </div>
              <div class="summary-card" style="background: var(--color-pink);">
                <div class="summary-card-label">TOP CATEGORY (WEEK)</div>
                <div class="summary-card-value">${userRole === 'cashier' ? 'Utilities' : topCategory}</div>
                <div class="text-sm" style="margin-top: 4px; font-weight: bold;">${formatRupiah(userRole === 'cashier' ? totalExpensesValue : topCategoryAmount)}</div>
              </div>
            </div>

            <!-- Table -->
            <div class="table-container">
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
                  ${filteredData.map(exp => `
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
                        Today, ${formatTime(exp.date)}
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
                            <button class="btn-icon-sm btn-outline btn-edit-expense">${icons.edit}</button>
                            <button class="btn-icon-sm btn-outline text-error btn-delete-expense" style="border-color: var(--color-error); background: var(--color-error-light);">${icons.trash}</button>
                          </div>
                        </td>
                      ` : ''}
                    </tr>
                  `).join('')}
                  ${filteredData.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 32px;">Tidak ada pengeluaran di kategori ini.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div class="flex justify-between items-center" style="margin-top: var(--space-lg);">
              <div class="text-muted text-sm">Showing ${filteredData.length} of ${filteredData.length} item(s)</div>
              <div class="pagination">
                <button class="pagination-btn">&lt;</button>
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn">2</button>
                <button class="pagination-btn">3</button>
                <button class="pagination-btn">&gt;</button>
              </div>
            </div>

          </div>
        </main>

        <!-- Modal New Expense -->
        <div id="modal-expense" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl);">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 id="modal-expense-title" style="font-size: 24px;">New Expense</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal">✕</button>
            </div>
            
            <form id="form-expense">
              <input type="hidden" id="expense-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label">Description</label>
                  <input type="text" class="input" id="expense-desc" required placeholder="Ex: Beli Gas LPG">
                </div>
                
                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label">Category</label>
                    <select class="input" id="expense-category">
                      ${userRole === 'cashier' ? `
                        <option value="Utilities">Utilities</option>
                      ` : `
                        <option value="Ingredients">Ingredients</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Operational">Operational</option>
                      `}
                    </select>
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label">Amount</label>
                  <input type="number" class="input" id="expense-amount" required placeholder="0">
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal">Cancel</button>
                <button type="submit" class="btn btn-primary flex-1" style="background: var(--color-primary); color: white;">Save</button>
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
    const userRole = store.currentUser?.role?.toLowerCase() || '';

    // Chips Listeners
    container.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.target.dataset.category;
        renderContent();
      });
    });

    // Modal Listeners
    const modal = container.querySelector('#modal-expense');
    const modalTitle = container.querySelector('#modal-expense-title');
    const btnTambah = container.querySelector('#btn-tambah-expense');
    const btnClose = container.querySelector('#btn-close-modal');
    const btnCancel = container.querySelector('#btn-cancel-modal');
    const formTambah = container.querySelector('#form-expense');
    const inputId = container.querySelector('#expense-id');
    const inputDesc = container.querySelector('#expense-desc');
    const inputCategory = container.querySelector('#expense-category');
    const inputAmount = container.querySelector('#expense-amount');

    btnTambah?.addEventListener('click', () => {
      formTambah.reset();
      inputId.value = '';
      modalTitle.textContent = 'New Expense';
      modal.style.display = 'flex';
      inputDesc.focus();
    });

    const closeModal = () => {
      modal.style.display = 'none';
      formTambah?.reset();
    };

    btnClose?.addEventListener('click', closeModal);
    btnCancel?.addEventListener('click', closeModal);

    // Edit Expense Listeners (for Owner only)
    container.querySelectorAll('.btn-edit-expense').forEach(btn => {
      btn.addEventListener('click', () => {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        const exp = store.expenses.find(e => e.id === id);
        
        if (exp) {
          formTambah.reset();
          inputId.value = exp.id;
          inputDesc.value = exp.description;
          inputCategory.value = exp.category;
          inputAmount.value = exp.amount;
          
          modalTitle.textContent = 'Edit Expense';
          modal.style.display = 'flex';
          inputDesc.focus();
        }
      });
    });

    // Delete Expense Listeners (for Owner only)
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

    formTambah?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = inputId.value;
      const description = inputDesc.value.trim();
      const category = inputCategory.value;
      const amount = Number(inputAmount.value) || 0;
      
      // Enforce Cashier Restrictions on Save
      if (userRole === 'cashier' && category.toLowerCase() !== 'utilities') {
        alert('Error: Staff hanya diperbolehkan mencatat pengeluaran kategori Utilities!');
        return;
      }

      const icon = category === 'Ingredients' ? '🥬' : category === 'Utilities' ? '⛽' : '📦';
      
      if (id) {
        // Edit existing expense
        store.updateExpense(id, {
          description,
          category,
          amount,
          icon
        });
        alert('Pengeluaran berhasil diperbarui!');
      } else {
        // Add new expense
        const newExp = {
          id: 'exp-' + Date.now(),
          description,
          category,
          amount,
          date: new Date().toISOString(),
          staff: store.currentUser?.name || 'Cashier',
          staffInitials: (store.currentUser?.name || 'Kasir').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          role: store.currentUser?.role || 'Cashier',
          icon
        };
        store.addExpense(newExp);
        alert('Pengeluaran berhasil dicatat!');
      }
      closeModal();
    });
  };

  renderContent();

  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);

  return () => {
    unsubscribe();
  };
}

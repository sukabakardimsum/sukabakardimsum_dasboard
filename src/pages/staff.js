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
  const loggedInUserRole = store.currentUser?.role?.toLowerCase() || '';
  const isOwner = loggedInUserRole === 'owner';
  const isManager = loggedInUserRole === 'manager';
  const hasAccess = isOwner || isManager;

  const getRoleBadgeColor = (role) => {
    if (role.toLowerCase() === 'owner') return 'pink';
    if (role.toLowerCase() === 'kitchen') return 'gray';
    return 'yellow';
  };

  const renderContent = () => {
    if (!hasAccess) {
      container.innerHTML = `
        <div class="app-shell animate-fade-in">
          ${renderSidebar('staff')}
          <main class="main-content">
            ${renderSharedTopbar('Staff')}
            <div class="page-container" style="max-width: 600px; margin: 80px auto; text-align: center; width: 100%;">
              <div class="card" style="padding: 40px; border: 3px solid var(--color-text); box-shadow: 8px 8px 0 var(--color-text); background: var(--color-error-light); border-radius: var(--radius-lg);">
                <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
                <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 16px; color: var(--color-error);">Akses Terbatas</h2>
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 24px; color: var(--color-text);">Hanya Owner dan Manager yang memiliki izin untuk mengakses dan mengelola data karyawan.</p>
                <a href="#/order" class="btn btn-yellow" style="text-decoration: none; display: inline-flex; justify-content: center; font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);"> Kembali ke Dashboard Order </a>
              </div>
            </div>
          </main>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="app-shell animate-fade-in">
        ${renderSidebar('staff')}
        <main class="main-content">
          ${renderSharedTopbar('Staff', {
            actionsHtml: `
              <div class="flex gap-sm">
                <button class="btn btn-yellow" id="btn-add-staff" style="height: 40px; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text); color: var(--color-text); font-weight: bold; margin-right: 12px;">
                  ${icons.plus} Tambah Karyawan Baru
                </button>
              </div>
            `
          })}
          
          <div class="page-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-xl);">
              ${store.staff.map(member => {
                const isMemberOwnerOrManager = member.role.toLowerCase() === 'owner' || member.role.toLowerCase() === 'manager';
                const canModifyThisMember = isOwner || (isManager && !isMemberOwnerOrManager);
                const showPinButton = isOwner || (isManager && !isMemberOwnerOrManager);

                return `
                <div class="card" data-id="${member.id}" style="padding: var(--space-xl); position: relative;">
                  
                  <div class="flex items-start justify-between" style="margin-bottom: var(--space-lg);">
                    <div class="flex items-center gap-md">
                      <div class="avatar avatar-lg" style="width: 56px; height: 56px; font-size: 20px;">${member.initials || member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                      <div>
                        <h3 style="margin-bottom: 4px; font-size: 18px;">${member.name}</h3>
                        <span class="badge badge-${getRoleBadgeColor(member.role)}">${member.role.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-xs text-sm" style="margin-bottom: var(--space-lg);">
                    <div class="status-dot status-dot-${member.active ? 'active' : 'inactive'}"></div>
                    <span class="text-bold ${member.active ? 'text-success' : 'text-muted'}">${member.active ? 'Active' : 'Inactive'}</span>
                  </div>

                  <div style="background: var(--color-surface); border: 1px solid var(--color-surface-dim); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg);">
                    <div class="text-xs text-muted text-bold" style="margin-bottom: 4px; letter-spacing: 0.05em;">AKSES PIN TERMINAL</div>
                    <div class="flex justify-between items-center">
                      <div class="text-bold text-lg" style="letter-spacing: 0.2em; display: flex; align-items: center;">
                        ${showPinButton ? `
                          <span class="pin-display" data-pin="${member.pin}" style="font-size:24px; line-height:1; margin-right:4px;">●●●●</span>
                        ` : `
                          <span style="font-size:14px; color: var(--color-text-muted); font-family: var(--font-family); letter-spacing: normal;">🔒 Terkunci</span>
                        `}
                      </div>
                      ${showPinButton ? `
                        <button class="btn-icon-sm btn-ghost btn-view-pin">
                          ${icons.eye}
                        </button>
                      ` : ''}
                    </div>
                  </div>

                  ${canModifyThisMember ? `
                    <div class="flex gap-sm">
                      <button class="btn btn-outline flex-1 btn-edit-staff">Edit</button>
                      <button class="btn-icon btn-outline text-error btn-delete-staff" style="border-color: var(--color-error); background: var(--color-error-light);">
                        ${icons.trash}
                      </button>
                    </div>
                  ` : `
                    <div style="text-align: center; padding: var(--space-sm); border: 2px dashed var(--color-border); border-radius: var(--radius-md); font-size: 13px; font-weight: bold; color: var(--color-text-muted);">
                      Akses Terbatas (Hanya Owner)
                    </div>
                  `}
                </div>
                `;
              }).join('')}
            </div>

          </div>
        </main>

        <!-- Modal Tambah/Edit Karyawan -->
        <div id="modal-staff" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
          <div class="card animate-scale-in" style="width: 100%; max-width: 500px; padding: var(--space-2xl); background: var(--color-white); border: 2px solid var(--color-border); box-shadow: 6px 6px 0 var(--color-border); position: relative;">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-lg);">
              <h2 id="modal-title" style="font-size: 24px; font-weight: bold;">Tambah Karyawan Baru</h2>
              <button class="btn-icon-sm btn-ghost" id="btn-close-modal-staff">✕</button>
            </div>
            
            <form id="form-staff">
              <input type="hidden" id="staff-id">
              <div class="flex-col gap-md">
                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">Nama Lengkap (Username Login)</label>
                  <input type="text" class="input" id="staff-name" required placeholder="Ex: Budi Santoso" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; font-family: var(--font-family);">
                </div>
                
                <div class="flex gap-md">
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Role / Jabatan</label>
                    <select class="input" id="staff-role" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      ${isOwner ? `
                        <option value="Cashier">CASHIER (Kasir)</option>
                        <option value="Manager">MANAGER</option>
                        <option value="Kitchen">KITCHEN (Dapur)</option>
                        <option value="Owner">OWNER (Pemilik)</option>
                      ` : `
                        <option value="Cashier">CASHIER (Kasir)</option>
                        <option value="Kitchen">KITCHEN (Dapur)</option>
                      `}
                    </select>
                  </div>
                  <div class="input-group" style="flex: 1;">
                    <label class="input-label" style="font-weight: bold;">Status</label>
                    <select class="input" id="staff-active" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 12px; background: white; font-family: var(--font-family);">
                      <option value="true">Active (Aktif)</option>
                      <option value="false">Inactive (Nonaktif)</option>
                    </select>
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label" style="font-weight: bold;">PIN Akses / Password (4 Angka)</label>
                  <div style="position: relative; width: 100%; display: flex; align-items: center;">
                    <input type="password" class="input" id="staff-pin" required maxlength="4" placeholder="Ex: 1234" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 40px; padding: 0 40px 0 12px; letter-spacing: 0.1em; font-family: var(--font-family); width: 100%;">
                    <button type="button" class="btn-toggle-pin-visibility" style="position: absolute; right: 10px; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">
                      ${icons.eye}
                    </button>
                  </div>
                </div>

                <!-- Username & Password Khusus Owner -->
                <div id="owner-credentials-section" style="display: none; flex-direction: column; gap: var(--space-sm); padding: var(--space-md); background: var(--color-pink-surface); border: 2px dashed var(--color-pink); border-radius: var(--radius-md); margin-top: var(--space-sm);">
                  <div style="font-weight: bold; font-size: 13px; color: var(--color-pink-dark); display: flex; align-items: center; gap: 4px;">
                    👑 Kredensial Login Owner Tambahan (Opsional)
                  </div>
                  <div class="input-group">
                    <label class="input-label" style="font-size: 12px; margin-bottom: 2px; font-weight: bold;">Username Baru</label>
                    <input type="text" class="input" id="staff-username" placeholder="Masukkan username login" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 36px; padding: 0 12px; font-family: var(--font-family);">
                  </div>
                  <div class="input-group">
                    <label class="input-label" style="font-size: 12px; margin-bottom: 2px; font-weight: bold;">Password Baru</label>
                    <div style="position: relative; width: 100%; display: flex; align-items: center;">
                      <input type="password" class="input" id="staff-password" placeholder="Masukkan password login" style="border: 2px solid var(--color-text); border-radius: var(--radius-sm); height: 36px; padding: 0 40px 0 12px; font-family: var(--font-family); width: 100%;">
                      <button type="button" class="btn-toggle-password-visibility" style="position: absolute; right: 10px; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">
                        ${icons.eye}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-sm" style="margin-top: var(--space-xl);">
                <button type="button" class="btn btn-outline flex-1" id="btn-cancel-modal-staff">Batal</button>
                <button type="submit" class="btn btn-yellow flex-1" style="font-weight: bold; border: 2px solid var(--color-text); box-shadow: 4px 4px 0 var(--color-text);">Simpan Karyawan</button>
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
    const modal = container.querySelector('#modal-staff');
    const form = container.querySelector('#form-staff');
    const modalTitle = container.querySelector('#modal-title');
    const ownerSection = container.querySelector('#owner-credentials-section');
    
    const inputId = container.querySelector('#staff-id');
    const inputName = container.querySelector('#staff-name');
    const inputRole = container.querySelector('#staff-role');
    const inputActive = container.querySelector('#staff-active');
    const inputPin = container.querySelector('#staff-pin');
    const inputUsername = container.querySelector('#staff-username');
    const inputPassword = container.querySelector('#staff-password');

    // Toggle PIN input visibility
    const btnTogglePin = container.querySelector('.btn-toggle-pin-visibility');
    btnTogglePin?.addEventListener('click', (e) => {
      e.preventDefault();
      const type = inputPin.getAttribute('type') === 'password' ? 'text' : 'password';
      inputPin.setAttribute('type', type);
      btnTogglePin.style.color = type === 'text' ? 'var(--color-primary)' : 'var(--color-text-muted)';
    });

    // Toggle Owner Password input visibility
    const btnTogglePassword = container.querySelector('.btn-toggle-password-visibility');
    btnTogglePassword?.addEventListener('click', (e) => {
      e.preventDefault();
      const type = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      inputPassword.setAttribute('type', type);
      btnTogglePassword.style.color = type === 'text' ? 'var(--color-primary)' : 'var(--color-text-muted)';
    });

    // Close Modal helper
    const closeModal = () => {
      if (modal) modal.style.display = 'none';
      form?.reset();
    };

    container.querySelector('#btn-close-modal-staff')?.addEventListener('click', closeModal);
    container.querySelector('#btn-cancel-modal-staff')?.addEventListener('click', closeModal);

    // Toggle Owner Credentials on Role Change
    inputRole?.addEventListener('change', () => {
      if (inputRole.value === 'Owner') {
        ownerSection.style.display = 'flex';
      } else {
        ownerSection.style.display = 'none';
      }
    });

    // Add Staff Click
    container.querySelector('#btn-add-staff')?.addEventListener('click', () => {
      form.reset();
      inputId.value = '';
      modalTitle.textContent = 'Tambah Karyawan Baru';
      ownerSection.style.display = 'none';
      modal.style.display = 'flex';
      inputName.focus();
    });

    // Edit Staff Click
    container.querySelectorAll('.btn-edit-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.card');
        const id = card.dataset.id;
        const member = store.staff.find(s => s.id === id);
        
        if (member) {
          form.reset();
          inputId.value = member.id;
          inputName.value = member.name;
          inputRole.value = member.role;
          inputActive.value = member.active.toString();
          inputPin.value = member.pin;
          
          if (member.role === 'Owner') {
            ownerSection.style.display = 'flex';
            inputUsername.value = member.username || '';
            inputPassword.value = member.password || '';
          } else {
            ownerSection.style.display = 'none';
          }
          
          modalTitle.textContent = 'Edit Data Karyawan';
          modal.style.display = 'flex';
          inputName.focus();
        }
      });
    });

    // Delete Staff Click
    container.querySelectorAll('.btn-delete-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.card');
        const id = card.dataset.id;
        const member = store.staff.find(s => s.id === id);
        if (member) {
          if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${member.name}?`)) {
            store.deleteStaff(id);
            alert(`Karyawan ${member.name} berhasil dihapus.`);
          }
        }
      });
    });

    // View PIN Action
    container.querySelectorAll('.btn-view-pin').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        const span = btn.parentElement.querySelector('.pin-display');
        if (span) span.textContent = span.dataset.pin;
      });
      btn.addEventListener('mouseup', () => {
        const span = btn.parentElement.querySelector('.pin-display');
        if (span) span.textContent = '●●●●';
      });
      btn.addEventListener('mouseleave', () => {
        const span = btn.parentElement.querySelector('.pin-display');
        if (span) span.textContent = '●●●●';
      });
    });

    // Form Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = inputId.value;
      const name = inputName.value.trim();
      const role = inputRole.value;
      const active = inputActive.value === 'true';
      const pin = inputPin.value.trim();
      
      // Enforce Manager Role Restrictions on Save
      if (isManager && (role === 'Owner' || role === 'Manager')) {
        alert('Error: Manager hanya diperbolehkan menambahkan/mengedit peran Cashier dan Kitchen!');
        return;
      }

      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      const memberData = {
        name,
        role,
        active,
        pin,
        initials,
        username: name.toLowerCase(),
        password: pin
      };
      
      if (role === 'Owner') {
        const customUser = inputUsername.value.trim();
        const customPass = inputPassword.value.trim();
        if (customUser) memberData.username = customUser;
        if (customPass) memberData.password = customPass;
      }
      
      if (id) {
        // Edit existing staff
        store.updateStaff(id, memberData);
        alert('Data karyawan berhasil diperbarui!');
      } else {
        // Add new staff
        memberData.id = 'staff-' + Date.now();
        store.addStaff(memberData);
        alert('Karyawan baru berhasil ditambahkan!');
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

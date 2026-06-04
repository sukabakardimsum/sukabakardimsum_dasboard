import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

const standardSidebar = `function renderSidebar(activePage) {
  const navItems = [
    { id: 'pos', label: 'Order', icon: icons.restaurant, route: '#/order' },
    { id: 'inventory', label: 'Inventory', icon: icons.inventory, route: '#/inventory' },
    { id: 'expenses', label: 'Expenses', icon: icons.expenses, route: '#/expenses' },
    { id: 'reports', label: 'Reports', icon: icons.reports, route: '#/reports' },
    { id: 'menu', label: 'Menu', icon: icons.menu, route: '#/menu' },
  ];

  return \`
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
          \${icons.plus} New Order
        </a>
      </div>
      <nav class="sidebar-nav">
        \${navItems.map(item => \`
          <a href="\${item.route}" class="sidebar-nav-item \${activePage === item.id ? 'active' : ''}" data-page="\${item.id}">
            \${item.icon} <span style="margin-left:8px">\${item.label}</span>
          </a>
        \`).join('')}
        <hr class="sidebar-separator">
        <a href="#/settings" class="sidebar-nav-item \${activePage === 'settings' ? 'active' : ''}" data-page="settings">
          \${icons.settings} <span style="margin-left:8px">Settings</span>
        </a>
      </nav>
      <div class="sidebar-footer" style="padding: var(--space-lg); border-top: 2px solid var(--color-border);">
        <button class="btn btn-outline text-error w-full" id="btn-logout" style="height: 44px; border: 2px solid var(--color-error); box-shadow: 3px 3px 0 var(--color-error); justify-content: center; font-weight: bold; background: var(--color-error-light); display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--font-family);" onclick="document.dispatchEvent(new CustomEvent('do-logout'))">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 20px; height: 20px; flex-shrink: 0;"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  \`;
}`;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace everything from `function renderSidebar` up to the next function declaration
  const regex = /function renderSidebar\([\s\S]*?\}\s*(?=\nfunction renderTopbar|\nexport default|\nconst getRoleBadgeColor)/;
  
  if (regex.test(content)) {
    content = content.replace(regex, standardSidebar + '\n\n');
    fs.writeFileSync(filePath, content);
    console.log('Updated sidebar in', file);
  }
});

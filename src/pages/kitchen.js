import { store } from '../store.js';
import { icons } from '../utils.js';

export default function render(container) {

  const getTicketColor = (minutesStr) => {
    // Parse something like "15m ago" or "8m ago"
    const m = parseInt(minutesStr);
    if (isNaN(m)) return 'var(--color-success)'; // fallback green
    if (m > 10) return 'var(--color-error)'; // red
    if (m > 5) return 'var(--color-warning)'; // orange
    return 'var(--color-success)'; // green
  };

  const getTicketIcon = (minutesStr) => {
    const m = parseInt(minutesStr);
    if (isNaN(m)) return '🆕';
    if (m > 10) return '⚠';
    if (m > 5) return '⏱';
    return '🆕';
  };

  // Mock KDS tickets based on sample orders
  const kdsTickets = [
    {
      id: 1,
      timeAgo: '15m ago',
      type: 'DINE-IN',
      orderNum: '#1042',
      table: 'Meja 4',
      customer: 'Budi Santoso',
      items: [
        { name: '3x Hakau Udang', note: 'No chilli oil' },
        { name: '2x Siomay Ayam' },
        { name: '1x Es Teh Manis' }
      ]
    },
    {
      id: 2,
      timeAgo: '8m ago',
      type: 'TAKEAWAY',
      orderNum: '#1043',
      source: 'GrabFood', // external source
      customer: 'Driver: Andi',
      items: [
        { name: '4x Pangsit Goreng', specialBadge: 'Extra Mayo' },
        { name: '2x Lumpia Udang' }
      ]
    },
    {
      id: 3,
      timeAgo: '2m ago',
      type: 'DINE-IN',
      orderNum: '#1044',
      table: 'Meja 12',
      customer: 'Siti Aminah',
      items: [
        { name: '1x Bubur Ayam' },
        { name: '2x Ceker Mercon', note: 'Super pedas' },
        { name: '1x Es Jeruk' }
      ]
    },
    {
      id: 4,
      timeAgo: '1m ago',
      type: 'TAKEAWAY',
      orderNum: '#1045',
      table: 'Walk-in',
      customer: 'Customer #45',
      items: [
        { name: '5x Bapao Telur Asin' }
      ]
    }
  ];

  container.innerHTML = `
    <div class="app-shell animate-fade-in" style="flex-direction: column; background: var(--color-surface);">
      
      <!-- KDS Header -->
      <header class="topbar" style="background: var(--color-border); color: var(--color-white); justify-content: space-between;">
        <div class="flex items-center gap-md">
          <span style="font-size: 24px;">🍴</span>
          <span class="text-bold" style="font-size: 20px; letter-spacing: 0.05em;">SUKA BAKAR DIMSUM</span>
          
          <div class="badge" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; margin-left: var(--space-lg);">
            <div class="status-dot status-dot-active" style="margin-right: 6px;"></div>
            KDS ACTIVE
          </div>
        </div>

        <div class="flex items-center gap-xl">
          <div class="flex flex-col items-center">
            <span class="text-xs text-muted" style="color: rgba(255,255,255,0.6);">ACTIVE ORDERS</span>
            <span class="text-bold text-lg text-yellow">12</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-muted" style="color: rgba(255,255,255,0.6);">AVG TIME</span>
            <span class="text-bold text-lg">⏱ 8m</span>
          </div>
          <button class="btn-icon btn-ghost" style="color: white; background: rgba(255,255,255,0.1);">
            ${icons.refresh}
          </button>
          <a href="#/" class="btn-icon btn-ghost" style="color: white; background: rgba(255,255,255,0.1);">
            ${icons.close}
          </a>
        </div>
      </header>
      
      <!-- KDS Grid -->
      <main class="kds-layout" style="flex: 1;">
        <div class="kds-grid">
          
          ${kdsTickets.map(ticket => `
            <div class="kds-ticket card" style="height: calc(100vh - 120px); background: var(--color-white);">
              
              <div class="kds-ticket-header" style="border-bottom: 2px dashed var(--color-border);">
                <div class="flex justify-between items-center mb-2" style="margin-bottom: 12px;">
                  <span class="text-bold" style="color: ${getTicketColor(ticket.timeAgo)}; font-size: 18px;">
                    ${getTicketIcon(ticket.timeAgo)} ${ticket.timeAgo}
                  </span>
                  <span class="badge badge-gray" style="font-size: 12px; padding: 4px 10px;">${ticket.type}</span>
                </div>
                
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-bold" style="font-size: 24px;">${ticket.orderNum}</div>
                    <div class="text-muted text-sm mt-1">${ticket.customer}</div>
                  </div>
                  ${ticket.source ? `
                    <span class="badge badge-error" style="font-size: 14px;">${ticket.source}</span>
                  ` : `
                    <span class="badge badge-purple" style="font-size: 14px;">${ticket.table}</span>
                  `}
                </div>
              </div>
              
              <div class="kds-ticket-body" style="overflow-y: auto;">
                <div class="flex-col gap-sm">
                  ${ticket.items.map(item => `
                    <div class="flex items-start gap-sm" style="padding: 12px 0; border-bottom: 1px solid var(--color-surface-dim);">
                      <input type="checkbox" style="width: 24px; height: 24px; margin-top: 2px; accent-color: var(--color-primary); cursor: pointer;">
                      <div>
                        <div class="text-bold text-lg">${item.name}</div>
                        ${item.note ? `<div class="text-muted text-sm" style="margin-top: 4px;">📝 ${item.note}</div>` : ''}
                        ${item.specialBadge ? `<div class="badge badge-yellow" style="margin-top: 8px;">${item.specialBadge}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="kds-ticket-footer" style="border-top: 2px solid var(--color-border);">
                <button class="btn btn-primary w-full btn-lg" style="justify-content: center;">
                  ✓ Selesai
                </button>
              </div>

            </div>
          `).join('')}

        </div>
      </main>

    </div>
  `;

  return () => {};
}

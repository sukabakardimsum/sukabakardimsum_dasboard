import { navigate } from '../router.js';
import { formatRupiah, icons, $ } from '../utils.js';
import { store } from '../store.js';

export default function render(container) {
  // Get the most recent order (the one just created)
  const lastOrder = store.orders[0];
  
  if (!lastOrder) {
    navigate('/order');
    return;
  }

  container.innerHTML = `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
      
      <div class="card animate-scale-in" style="width: 100%; max-width: 440px; padding: var(--space-3xl); text-align: center;">
        
        <!-- Animated Checkmark -->
        <div style="margin: 0 auto var(--space-lg); width: 80px; height: 80px; border-radius: 50%; background: var(--color-success); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 10px var(--color-success-light);">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="width: 40px; height: 40px;">
            <polyline points="20,6 9,17 4,12" stroke-dasharray="50" stroke-dashoffset="50" style="animation: checkmark 0.5s ease forwards 0.2s;"></polyline>
          </svg>
        </div>

        <h2 style="font-size: var(--fs-headline-md); margin-bottom: var(--space-sm);">Pembayaran Berhasil!</h2>
        <p class="text-muted" style="margin-bottom: var(--space-xl);">Order <span class="text-bold">#${lastOrder.orderNumber}</span> telah lunas.</p>

        <div style="background: var(--color-surface); padding: var(--space-md); border-radius: var(--radius-md); border: 1px dashed var(--color-border); margin-bottom: var(--space-xl); text-align: left;">
          <div class="flex justify-between mb-2" style="margin-bottom: 8px;">
            <span class="text-muted">Total Pembayaran</span>
            <span class="text-bold">${formatRupiah(lastOrder.total)}</span>
          </div>
          <div class="flex justify-between mb-2" style="margin-bottom: 8px;">
            <span class="text-muted">Metode</span>
            <span class="badge badge-${lastOrder.paymentMethod === 'cash' ? 'yellow' : 'purple'}">${lastOrder.paymentMethod.toUpperCase()}</span>
          </div>
          ${lastOrder.paymentMethod === 'cash' ? `
            <div class="divider-dashed" style="margin: 8px 0"></div>
            <div class="flex justify-between">
              <span class="text-muted">Kembalian</span>
              <span class="text-bold text-primary">${formatRupiah(lastOrder.change)}</span>
            </div>
          ` : ''}
        </div>

        <div class="flex gap-md">
          <button class="btn btn-outline flex-1" id="btn-print">
            ${icons.printer} Print Struk
          </button>
          <button class="btn btn-yellow flex-1" id="btn-new-order">
            Pesanan Baru →
          </button>
        </div>
      </div>

    </div>
  `;

  // Add keyframes for the SVG animation dynamically if not present
  if (!document.getElementById('checkmark-animation')) {
    const style = document.createElement('style');
    style.id = 'checkmark-animation';
    style.innerHTML = `
      @keyframes checkmark {
        to { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto dismiss after 5 seconds
  const timeout = setTimeout(() => {
    navigate('/order');
  }, 5000);

  $('#btn-new-order').addEventListener('click', () => {
    clearTimeout(timeout);
    navigate('/order');
  });

  $('#btn-print').addEventListener('click', () => {
    clearTimeout(timeout);
    navigate('/receipts');
  });

  return () => {
    clearTimeout(timeout);
  };
}

// ============================================================
// Suka Bakar Dimsum — Main Entry Point
// ============================================================
import './css/variables.css';
import './css/reset.css';
import './css/components.css';
import './css/layouts.css';

import { registerRoute, initRouter, navigate } from './router.js';
import { store } from './store.js';

// ── Page Imports (lazy) ──
async function loadPage(name) {
  const module = await import(`./pages/${name}.js`);
  return module.default;
}

// ── Register Routes ──
registerRoute('/login', async (container) => {
  const render = await loadPage('login');
  return render(container);
});

registerRoute('/', async (container) => {
  navigate('/order');
});

registerRoute('/order', async (container) => {
  if (!store.isLoggedIn) {
    navigate('/login');
    return;
  }
  const render = await loadPage('pos');
  return render(container);
});

registerRoute('/cash-payment', async (container) => {
  const render = await loadPage('cash-payment');
  return render(container);
});

registerRoute('/qris-payment', async (container) => {
  const render = await loadPage('qris-payment');
  return render(container);
});

registerRoute('/payment-success', async (container) => {
  const render = await loadPage('payment-success');
  return render(container);
});



registerRoute('/menu', async (container) => {
  const render = await loadPage('menu');
  return render(container);
});

registerRoute('/reports', async (container) => {
  const render = await loadPage('reports');
  return render(container);
});

registerRoute('/expenses', async (container) => {
  const render = await loadPage('expenses');
  return render(container);
});

registerRoute('/inventory', async (container) => {
  const render = await loadPage('inventory');
  return render(container);
});

registerRoute('/staff', async (container) => {
  const role = store.currentUser?.role?.toLowerCase() || '';
  if (role !== 'owner' && role !== 'manager') {
    alert('Akses Ditolak: Halaman ini hanya untuk Owner dan Manager.');
    navigate('/');
    return () => {};
  }
  const render = await loadPage('staff');
  return render(container);
});

registerRoute('/tables', async (container) => {
  const role = store.currentUser?.role?.toLowerCase() || '';
  if (role !== 'owner' && role !== 'manager') {
    alert('Akses Ditolak: Halaman ini hanya untuk Owner dan Manager.');
    navigate('/');
    return () => {};
  }
  const render = await loadPage('tables');
  return render(container);
});

registerRoute('/kitchen', async (container) => {
  const render = await loadPage('kitchen');
  return render(container);
});

registerRoute('/receipts', async (container) => {
  const render = await loadPage('receipts');
  return render(container);
});

registerRoute('/settings', async (container) => {
  const render = await loadPage('settings');
  return render(container);
});

registerRoute('/customer-display', async (container) => {
  const render = await loadPage('customer-display');
  return render(container);
});

registerRoute('/close-shift', async (container) => {
  const render = await loadPage('close-shift');
  return render(container);
});

registerRoute('/scan-order', async (container) => {
  const render = await loadPage('scan-order');
  return render(container);
});

// ── Global Event Listeners ──
document.addEventListener('do-logout', () => {
  store.logout();
  navigate('/login');
});

document.addEventListener('lock-terminal', () => {
  navigate('/login');
});

// Centralized premium Toast Notification handler
document.addEventListener('new-notification', (e) => {
  const n = e.detail;

  // Make sure not to show toasts on user-facing self-service scan page, kitchen, or customer display
  const isExcluded = window.location.hash.includes('scan-order') || 
                     window.location.hash.includes('kitchen') || 
                     window.location.hash.includes('customer-display');
  if (isExcluded) return;

  // Inject animation keyframes if not exists
  if (!document.getElementById('toast-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-animation-styles';
    style.innerHTML = `
      @keyframes slideInRight {
        from { transform: translateX(130%) scale(0.85); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      .toast-slide-in {
        animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
    `;
    document.head.appendChild(style);
  }

  // Create global toast container if not exists
  let container = document.getElementById('global-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-toast-container';
    container.style = 'position: fixed; top: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 12px; font-family: Sora, sans-serif; pointer-events: none;';
    document.body.appendChild(container);
  }

  // Create toast card element
  const toast = document.createElement('div');
  toast.className = 'card-flat toast-slide-in';
  toast.style = 'pointer-events: auto; padding: 16px 20px; border: 2.5px solid #111827; box-shadow: 4px 4px 0 #111827; border-radius: 12px; background: #fce354; color: #111827; font-weight: bold; display: flex; flex-direction: column; gap: 6px; width: 320px; transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer;';
  
  // Neubrutalist interactive hover scaling
  toast.onmouseenter = () => {
    toast.style.transform = 'translate(2px, 2px)';
    toast.style.boxShadow = '2px 2px 0 #111827';
  };
  toast.onmouseleave = () => {
    toast.style.transform = 'translate(0px, 0px)';
    toast.style.boxShadow = '4px 4px 0 #111827';
  };

  toast.innerHTML = `
    <div class="flex justify-between items-center" style="border-bottom: 1.5px solid #111827; padding-bottom: 4px; margin-bottom: 2px; display: flex; align-items: center;">
      <span style="font-weight: 900; font-size: 14px; display: flex; align-items: center; gap: 6px;">🔔 ${n.title}</span>
      <button class="toast-close-btn" style="border: none; background: none; font-size: 14px; cursor: pointer; font-weight: bold; color: #111827; padding: 0 4px; display: flex; align-items: center; justify-content: center;">✕</button>
    </div>
    <div style="font-size: 13px; font-weight: 700; line-height: 1.4; text-align: left; color: #111827; margin-top: 4px;">${n.text}</div>
    <div class="text-xs text-muted" style="text-align: right; font-size: 10px; margin-top: 6px; color: #4b5563; font-style: italic;">Klik untuk melihat pesanan</div>
  `;

  // Navigate to reports or designated route when clicked
  toast.addEventListener('click', (ev) => {
    if (ev.target.classList.contains('toast-close-btn')) return;
    toast.remove();
    if (n.actionRoute) {
      window.location.hash = n.actionRoute;
    } else {
      window.location.hash = '#/reports';
    }
  });

  // Close event
  toast.querySelector('.toast-close-btn').addEventListener('click', (ev) => {
    ev.stopPropagation();
    toast.remove();
  });

  container.appendChild(toast);

  // Play a beautiful, premium retro-electronic double chime (Web Audio API)
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, duration, startOffset) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, context.currentTime + startOffset);
      gain.gain.setValueAtTime(0.08, context.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + startOffset + duration);
      osc.start(context.currentTime + startOffset);
      osc.stop(context.currentTime + startOffset + duration);
    };
    playTone(660, 0.12, 0);      // High ping
    playTone(880, 0.25, 0.08);   // Sweet higher resolution confirmation note
  } catch (err) {
    console.warn('Audio Context block:', err);
  }

  // Auto dismiss after 6 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 6000);
});

// ── Global Floating Fullscreen Button ──
function initFullscreenToggle() {
  if (document.getElementById('btn-fullscreen-toggle')) return;

  // Inject Fullscreen Button Style
  const style = document.createElement('style');
  style.id = 'fullscreen-btn-styles';
  style.innerHTML = `
    #btn-fullscreen-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9998;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #fce354;
      color: #111827;
      border: 2.5px solid #111827;
      box-shadow: 3px 3px 0 #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      user-select: none;
      outline: none;
    }
    #btn-fullscreen-toggle:hover {
      background: #fde873;
    }
    #btn-fullscreen-toggle:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0 #111827;
    }
    #btn-fullscreen-toggle svg {
      width: 22px;
      height: 22px;
      stroke-width: 2.5;
    }
  `;
  document.head.appendChild(style);

  // Create button element
  const btn = document.createElement('button');
  btn.id = 'btn-fullscreen-toggle';
  btn.title = 'Toggle Fullscreen';
  
  // Set fullscreen icon
  const enterIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
  const exitIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>`;
  
  btn.innerHTML = enterIcon;

  // Toggle Function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        btn.innerHTML = exitIcon;
      }).catch(err => {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        btn.innerHTML = enterIcon;
      }).catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  btn.addEventListener('click', toggleFullscreen);

  // Monitor fullscreen change events (e.g. ESC key)
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      btn.innerHTML = exitIcon;
    } else {
      btn.innerHTML = enterIcon;
    }
  });

  document.body.appendChild(btn);

  // Hide button on mobile self-service scan page or customer display
  const updateVisibility = () => {
    const hash = window.location.hash;
    const isExcluded = hash.includes('scan-order') || 
                       hash.includes('customer-display');
    if (isExcluded) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'flex';
    }
  };

  window.addEventListener('hashchange', updateVisibility);
  updateVisibility();
}

// Start Fullscreen service
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initFullscreenToggle();
  } else {
    window.addEventListener('DOMContentLoaded', initFullscreenToggle);
  }
}

// ── Initialize ──
initRouter();

// Default to login if not logged in
if (!store.isLoggedIn && !window.location.hash.includes('login') && !window.location.hash.includes('customer-display') && !window.location.hash.includes('kitchen') && !window.location.hash.includes('scan-order')) {
  navigate('/login');
}

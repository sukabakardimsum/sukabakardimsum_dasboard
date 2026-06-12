import { store } from '../store.js';
import { navigate } from '../router.js';
import { formatRupiah, icons, $ } from '../utils.js';

export default function render(container) {
  // Ensure Tailwind & Sora Font is loaded in head if not already
  if (!document.getElementById('tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    script.onload = () => {
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              "primary-container": "#7257ff",
              "surface-tint": "#5b3ce8",
              "surface-dim": "#d3daef",
              "surface-container-lowest": "#ffffff",
              "on-secondary": "#ffffff",
              "on-secondary-fixed-variant": "#514700",
              "on-secondary-container": "#736400",
              "surface-container": "#e9edff",
              "tertiary": "#89427c",
              "inverse-primary": "#c8bfff",
              "error": "#ba1a1a",
              "secondary-fixed": "#fce354",
              "on-primary-fixed": "#190064",
              "inverse-surface": "#293040",
              "tertiary-fixed-dim": "#ffaceb",
              "on-surface-variant": "#474555",
              "on-primary-container": "#fffbff",
              "surface-bright": "#f9f9ff",
              "on-surface": "#141b2b",
              "on-error-container": "#93000a",
              "on-tertiary-container": "#fffbff",
              "on-background": "#141b2b",
              "on-primary-fixed-variant": "#4214d0",
              "primary": "#5939e5",
              "surface-container-highest": "#dce2f7",
              "primary-fixed": "#e5deff",
              "tertiary-fixed": "#ffd7f2",
              "on-primary": "#ffffff",
              "outline-variant": "#c9c4d8",
              "inverse-on-surface": "#edf0ff",
              "primary-fixed-dim": "#c8bfff",
              "surface-container-high": "#e1e8fd",
              "on-tertiary-fixed-variant": "#702c66",
              "background": "#f9f9ff",
              "tertiary-container": "#a55a96",
              "secondary-fixed-dim": "#dec73a",
              "on-tertiary-fixed": "#390034",
              "on-tertiary": "#ffffff",
              "surface-variant": "#dce2f7",
              "outline": "#787587",
              "on-secondary-fixed": "#211c00",
              "surface": "#f9f9ff",
              "error-container": "#ffdad6",
              "surface-container-low": "#f1f3ff",
              "secondary": "#6c5e00",
              "on-error": "#ffffff",
              "secondary-container": "#fce354"
            }
          }
        }
      };
    };
    document.head.appendChild(script);
  }

  // Load Material symbols and Sora font
  if (!document.getElementById('font-sora')) {
    const linkSora = document.createElement('link');
    linkSora.id = 'font-sora';
    linkSora.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;700;800&display=swap';
    linkSora.rel = 'stylesheet';
    document.head.appendChild(linkSora);

    const linkSymbols = document.createElement('link');
    linkSymbols.id = 'material-symbols';
    linkSymbols.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkSymbols.rel = 'stylesheet';
    document.head.appendChild(linkSymbols);
  }

  // Parse table parameter from query
  const hash = window.location.hash;
  let tableName = 'Meja 1';
  if (hash.includes('?')) {
    const queryStr = hash.split('?')[1];
    const params = new URLSearchParams(queryStr);
    if (params.has('table')) {
      tableName = decodeURIComponent(params.get('table'));
    }
  }

  let activeCategory = 'Semua';
  let searchQuery = '';
  let customerCart = []; // Local mobile customer cart
  let customerNote = ''; // Customer order notes
  let isCartOpen = false;
  let activePaymentMethod = 'qris';
  let isPaymentModalOpen = false;

  const getCartSubtotal = () => customerCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const getCartTotal = () => getCartSubtotal();
  const getCartItemCount = () => customerCart.reduce((sum, item) => sum + item.qty, 0);

  // Exact food images mapped to system names or standard fallbacks
  const foodImages = {
    'Siu Mai Ayam': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvjDqEA0EZZ6i2bkAEgRQ6g9yq_2t0Rjl4vCQtLGQp4db_dRtK2Tjofn_PbO6_J9I7F1ZP3WAy6P2rncRJGYB2Q78-n47jebcTO0Vz8g83Hax-9WDZKvoXTuPFYUDjzncLCW2hGzbGpgQaIsER8BKxrBI0tp9jgVG_AkoaluFU-V1k7QqwE-6lv2A87Jo22D6XaATkoGXDV3KYBjmYzF6SP0CQVJspvDfwhKCjUEtKkMqE1LtQrf0ZvNlwDgCOWMO0akES9_tefqQ',
    'Hakau Udang': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSZ762Swa1WbO4AxWFomIzxt4HE4BemC1VsmDpepYVtA3ietYAqwXa66W5Pyy1eU3x18gyoqXr3gQQlRnlgB5zFccHuoO-e7z__9wVFuS7hnhpyIPRcKO1pP_dcy-oVB9BIFm6yJ5HI7XjIKm5pyeiLpX-Ea_bSmgABRCDPMH9s1nDZQHzakM6B1kmIGNMqPKF37bbocF19ps96CHh8V_Iszanl1P-b_K1QHQTMJOlWmc2xRDjW3snzfdGoYUZp7hJ4Bis2i7R_Uk',
    'Lumpia Udang Kulit Tahu': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpsGYNITNib1AVDSSFH-O-nIWM5Q13oRlOAPcpKXJ01kQp55QYh9RW8HXZuqzcUvXVyIBFT5UwUKPCuKH0eyDDGxVY2NlWo_2ftzXRficKrbUcZhAeodMd0jTwPhcSEsl7qG1dDKcEUpuclb-yua4BhTkRVuJIDUpEJL4HpY7WFqMf3jUVVumVgUpsSqAvqGC9U1pR-Pj0fXhFiJdIUO3NgKifbiuRqniXLcGlFRJ5VznPzGu-HWOjdn53fL1jZZvKW5PDl-cN6kI',
    'Bakpao Telur Asin': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPDtZmnW0d20fehZJvFPKUSndRygO88sbRbbXSBnDHGrEiwuOYxv8vUlhsvxxbjEemmySIiwZSDce6cG_9v42PSvz4RWFXVrSfHCEj2QTvY4-NM1Fe_78AEBDkOqBmQWp0DvdyR-_HR9EDEne5oVtYblD_miUXxTzJ3wpOcEPMptSpxh-_7IIOxdN1_IQuVcFvRqtkxgKXuRxEC67rmUBjnJPCk05TmUkIYa6t2zYYmhtGaREoaPp7kXlzVFjlGu0F9K0sTbfdoZk'
  };

  const getFoodImage = (name) => {
    if (foodImages[name]) return foodImages[name];
    // Fallbacks
    if (name.toLowerCase().includes('siomay') || name.toLowerCase().includes('original')) {
      return foodImages['Siu Mai Ayam'];
    }
    if (name.toLowerCase().includes('hakau') || name.toLowerCase().includes('udang')) {
      return foodImages['Hakau Udang'];
    }
    if (name.toLowerCase().includes('lumpia') || name.toLowerCase().includes('goreng')) {
      return foodImages['Lumpia Udang Kulit Tahu'];
    }
    if (name.toLowerCase().includes('bakpao') || name.toLowerCase().includes('roti')) {
      return foodImages['Bakpao Telur Asin'];
    }
    // Generic high-quality dimsum image
    return foodImages['Siu Mai Ayam'];
  };

  const renderContent = () => {
    let filteredMenu = store.menuItems;
    if (activeCategory !== 'Semua') {
      filteredMenu = filteredMenu.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      filteredMenu = filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    container.innerHTML = `
      <style>
        .neubrutalism-shadow {
          box-shadow: 4px 4px 0px 0px #111827;
        }
        .neubrutalism-border {
          border: 2px solid #111827;
        }
        .neubrutalism-interactive {
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .neubrutalism-interactive:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px 0px #111827;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          font-family: 'Sora', sans-serif !important;
        }
      </style>

      <div class="bg-slate-50 min-h-screen text-[#141b2b] pb-36 relative font-['Sora'] w-full">
        <div class="max-w-md mx-auto min-h-screen bg-[#f9f9ff] relative shadow-lg flex flex-col border-x-2 border-slate-200">
          
          <!-- Top Section: Brand & Slogan -->
          <header class="p-4 pt-6 bg-white neubrutalism-border border-x-0 border-t-0 neubrutalism-shadow mb-6">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h1 class="text-2xl font-extrabold text-[#141b2b]">Suka Bakar Dimsum</h1>
                <span class="inline-block bg-primary-container text-white text-xs font-bold px-2 py-0.5 rounded border border-[#111827] mt-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  📍 ${tableName}
                </span>
              </div>
              <div class="bg-[#fce354] w-12 h-12 rounded-full flex items-center justify-center neubrutalism-border neubrutalism-shadow">
                <span class="text-2xl">🍜</span>
              </div>
            </div>
            <p class="font-body-lg text-on-surface-variant bg-[#ffaceb] inline-block px-3 py-1 neubrutalism-border rounded-md font-bold mb-1 text-sm">
              Dimsum Paling Juara! 🔥
            </p>
            <div class="search-bar mt-3 relative flex items-center">
              <span class="absolute left-3 text-lg">🔍</span>
              <input type="text" placeholder="Cari dimsum kesukaanmu..." id="search-mobile" class="w-full pl-10 pr-4 py-2 border-2 border-slate-900 rounded-md outline-none text-sm font-semibold" value="${searchQuery}">
            </div>
          </header>

          <!-- Categories Navigation -->
          <section class="mb-4 px-4">
            <div class="flex space-x-3 overflow-x-auto hide-scrollbar pb-1 cursor-grab" id="category-slider">
              ${store.categories.map(cat => `
                <button class="font-bold text-xs px-5 py-2.5 rounded-full neubrutalism-border neubrutalism-shadow whitespace-nowrap neubrutalism-interactive ${cat === activeCategory ? 'active-chip bg-[#5939e5] text-white' : 'bg-white text-[#141b2b]'}" data-category="${cat}">
                  ${cat === 'Semua' ? 'Semua Menu' : cat}
                </button>
              `).join('')}
            </div>
          </section>

          <!-- Menu Items List -->
          <main class="px-4 space-y-4 flex-1">
            ${filteredMenu.map(item => {
              const isAvailable = item.available && (item.stock === undefined || item.stock > 0);
              
              if (!isAvailable) {
                return `
                  <!-- Disabled/Sold out Item -->
                  <article class="bg-white rounded-xl p-3 neubrutalism-border neubrutalism-shadow flex gap-3 opacity-60 relative">
                    <div class="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 neubrutalism-border overflow-hidden flex items-center justify-center relative">
                      <span class="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm neubrutalism-border z-10 absolute">Stok Habis</span>
                      <span class="text-4xl filter grayscale">${item.emoji || '🥟'}</span>
                    </div>
                    <div class="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 class="font-extrabold text-[#141b2b] leading-tight text-base mb-1">${item.name}</h3>
                        <p class="text-slate-500 text-xs line-clamp-2">${item.description || 'Pilihan dimsum lezat favorit keluarga.'}</p>
                      </div>
                      <div class="flex items-center justify-between mt-2">
                        <span class="font-bold text-[#141b2b] text-base">${formatRupiah(item.price)}</span>
                      </div>
                    </div>
                  </article>
                `;
              }

              return `
                <!-- Available Item -->
                <article class="bg-white rounded-xl p-3 neubrutalism-border neubrutalism-shadow flex gap-3">
                  <div class="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 neubrutalism-border overflow-hidden flex items-center justify-center relative">
                    <span class="text-4xl">${item.emoji || '🥟'}</span>
                    ${item.price < 15000 && item.category === 'Original' ? `<div class="absolute top-1 left-1 bg-[#fce354] text-[#141b2b] text-[9px] font-bold px-1 rounded-sm neubrutalism-border shadow-[1px_1px_0px_rgba(0,0,0,1)]">PROMO</div>` : ''}
                  </div>
                  <div class="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 class="font-extrabold text-[#141b2b] leading-tight text-base mb-1">${item.name}</h3>
                      <p class="text-slate-500 text-xs line-clamp-2">${item.description || 'Pilihan dimsum lezat segar berkualitas.'}</p>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                      <span class="font-bold text-[#141b2b] text-base">${formatRupiah(item.price)}</span>
                      <button class="bg-[#fce354] w-8 h-8 rounded-full flex items-center justify-center neubrutalism-border neubrutalism-shadow neubrutalism-interactive btn-add-customer-item font-extrabold text-lg text-[#141b2b] pb-0.5" data-id="${item.id}">
                        +
                      </button>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}

            ${filteredMenu.length === 0 ? `
              <div class="text-center text-slate-500 py-12">
                <span class="text-5xl">🔍</span>
                <p class="font-bold mt-2">Menu tidak ditemukan</p>
                <p class="text-xs">Coba dengan kata kunci pencarian lainnya</p>
              </div>
            ` : ''}
          </main>

          <!-- Floating Order Action Bar -->
          ${getCartItemCount() > 0 ? `
            <div class="fixed bottom-6 left-4 right-4 max-w-[calc(28rem-32px)] mx-auto z-50">
              <button class="w-full bg-[#e9edff] text-[#141b2b] rounded-xl p-3 neubrutalism-border shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] flex items-center justify-between neubrutalism-interactive" id="btn-open-cart-drawer">
                <div class="flex items-center gap-3">
                  <div class="bg-white text-[#141b2b] font-bold w-8 h-8 rounded-md flex items-center justify-center neubrutalism-border">
                    ${getCartItemCount()}
                  </div>
                  <div class="text-left">
                    <span class="text-xs font-bold text-slate-600 block">Total Pesanan</span>
                    <span class="font-extrabold text-base block leading-none mt-0.5">${formatRupiah(getCartTotal())}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 bg-[#5939e5] text-white px-4 py-2 rounded-lg neubrutalism-border shadow-[2px_2px_0px_rgba(0,0,0,1)] font-extrabold text-xs">
                  <span>Lanjut Order</span>
                  <span class="font-extrabold text-sm">→</span>
                </div>
              </button>
            </div>
          ` : ''}

        </div>
      </div>

      <!-- Drawer Overlay -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] transition-opacity ${isCartOpen ? 'opacity-100 block' : 'opacity-0 hidden'}" id="cart-drawer-overlay"></div>

      <!-- Cart Drawer (Tailwind Styled) -->
      <div class="fixed bottom-0 left-50% translate-x-[-50%] w-full max-w-md bg-white border-t-4 border-slate-900 rounded-t-2xl shadow-2xl z-[200] transition-transform duration-300 ${isCartOpen ? 'translate-y-0' : 'translate-y-full'}" id="cart-drawer" style="left: 50%; transform: translateX(-50%) ${isCartOpen ? 'translateY(0)' : 'translateY(100%)'};">
        <div class="p-4 border-b-2 border-slate-900 flex justify-between items-center bg-[#e9edff]">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛒</span>
            <h2 class="font-extrabold text-base">Keranjang Saya</h2>
          </div>
          <button class="font-bold text-xl cursor-pointer" id="btn-close-cart-drawer">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[50vh] flex flex-col gap-3">
          ${customerCart.map(item => `
            <div class="p-3 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-xl bg-white flex justify-between items-center">
              <div>
                <div class="font-extrabold text-sm">${item.name}</div>
                <div class="text-xs font-bold text-slate-500 mt-0.5">${formatRupiah(item.price)} x ${item.qty}</div>
              </div>
              <div class="flex items-center gap-3">
                <button class="w-8 h-8 neubrutalism-border neubrutalism-shadow rounded-full flex items-center justify-center font-bold bg-white btn-customer-qty-minus text-sm" data-id="${item.id}">-</button>
                <span class="font-bold text-sm w-5 text-center">${item.qty}</span>
                <button class="w-8 h-8 neubrutalism-border neubrutalism-shadow rounded-full flex items-center justify-center font-bold bg-[#fce354] btn-customer-qty-plus text-sm" data-id="${item.id}">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="p-4 border-t-2 border-slate-900 bg-white">
          <div class="flex justify-between items-center mb-4">
            <span class="font-extrabold text-sm">Total Pembayaran</span>
            <span class="font-extrabold text-xl text-[#5939e5]">${formatRupiah(getCartTotal())}</span>
          </div>

          <!-- Notes / Catatan -->
          <div class="mb-3">
            <label class="block text-xs font-extrabold text-slate-700 mb-1.5">📝 Catatan untuk Dapur (Opsional)</label>
            <textarea id="input-customer-note" rows="2" placeholder="Contoh: tanpa kecap, ekstra pedas, dll." class="w-full border-2 border-slate-900 rounded-lg p-2 text-sm font-semibold outline-none resize-none" style="box-shadow:2px 2px 0 #111827;">${customerNote}</textarea>
          </div>

          <button class="w-full py-3.5 bg-[#fce354] text-[#141b2b] rounded-xl neubrutalism-border shadow-[3px_3px_0px_rgba(17,24,39,1)] font-extrabold text-sm justify-center flex items-center gap-2 neubrutalism-interactive" id="btn-submit-order">
            Scan & Bayar QRIS Sekarang
            <span class="font-extrabold text-base">→</span>
          </button>
        </div>
      </div>

      <!-- Payment QRIS Modal Overlay -->
      <div id="payment-qris-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 ${isPaymentModalOpen ? 'block' : 'hidden'}">
        <div class="card animate-scale-in w-full max-w-sm bg-white border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden relative">

          <!-- QRIS Header Bar -->
          <div style="background:#e8192c; padding:10px 16px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="background:white; padding:3px 8px; border-radius:4px;">
                <span style="font-size:13px; font-weight:900; color:#e8192c; letter-spacing:1px;">QRIS</span>
              </div>
              <span style="color:white; font-size:9px; font-weight:700; line-height:1.3;">QR Code Standar<br>Pembayaran Nasional</span>
            </div>
            <button class="font-bold text-white text-lg bg-white/20 rounded-full w-7 h-7 flex items-center justify-center" id="btn-close-payment-modal">✕</button>
          </div>

          <!-- Merchant Info -->
          <div style="padding:10px 16px 6px; text-align:center; border-bottom:1px solid #f0f0f0;">
            <div style="font-size:14px; font-weight:900; color:#111;">Suka Bakar Dimsum</div>
            <div style="font-size:10px; color:#666; margin-top:1px;">NMID : ID1026522447931 &nbsp;·&nbsp; A01</div>
          </div>

          <!-- QR Image -->
          <div style="padding:8px 32px 4px; display:flex; justify-content:center;">
            <img src="/qris-kedai-pojok.webp" alt="QRIS Suka Bakar Dimsum" style="width:100%; max-width:220px; height:auto; display:block;">
          </div>

          <!-- Total Amount Banner -->
          <div style="margin:0 16px 10px; background:#fce354; border:2px solid #111827; border-radius:8px; padding:8px 12px; display:flex; align-items:center; gap:8px; box-shadow:2px 2px 0 #111827;">
            <div style="flex:1; min-width:0;">
              <div style="font-size:9px; font-weight:800; color:#78350f; text-transform:uppercase; letter-spacing:0.5px;">💰 Masukkan nominal ini</div>
              <div style="font-size:16px; font-weight:900; color:#111; margin-top:1px;">${formatRupiah(getCartTotal())}</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:5px; flex-shrink:0;">
              <button id="btn-copy-nominal-scan" style="height:28px; padding:0 8px; background:white; border:1.5px solid #111; box-shadow:1.5px 1.5px 0 #111; border-radius:4px; font-size:10px; font-weight:800; color:#111; cursor:pointer; display:flex; align-items:center; gap:4px; font-family:inherit; white-space:nowrap;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px;"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Salin
              </button>
              <a href="/qris-kedai-pojok.webp" download="QRIS-Kedai-Pojok-13.webp" style="height:28px; padding:0 8px; background:#111; color:white; border:1.5px solid #111; box-shadow:1.5px 1.5px 0 #444; border-radius:4px; font-size:10px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:4px; text-decoration:none; white-space:nowrap;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
            </div>
          </div>

          <!-- Footer info -->
          <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:6px 16px; text-align:center;">
            <div style="font-size:9px; color:#9ca3af;">SATU QRIS UNTUK SEMUA · www.aspi-qris.id</div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 p-4 pt-2">
            <button class="py-2.5 bg-white text-xs font-bold rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1" id="btn-cancel-payment-modal">Batal</button>
            <button class="py-2.5 bg-[#16a34a] text-white text-xs font-extrabold rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex-1" id="btn-confirm-payment-success">✓ Sudah Bayar</button>
          </div>
        </div>
      </div>

      <!-- Shift Closed Popup Modal Overlay -->
      ${!store.shift.isOpen ? `
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[3000] flex items-center justify-center p-6" style="pointer-events: auto;">
          <div class="bg-white border-4 border-slate-900 p-6 rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center max-w-sm w-full animate-scale-in">
            <div class="text-6xl mb-4">🏪</div>
            <h2 class="text-2xl font-black text-slate-900 mb-3">Toko Masih Tutup</h2>
            <p class="text-sm font-bold text-slate-600 mb-6 leading-relaxed">
              Maaf, Suka Bakar Dimsum saat ini sedang tidak menerima pesanan karena shift kasir belum dibuka. 
              <br><br>
              Silakan hubungi kasir atau coba kembali nanti! 🙏
            </p>
            <div class="p-3 bg-[#e9edff] border-2 border-slate-900 rounded-xl font-bold text-xs text-slate-700">
              💡 Scan QR Menu tetap bisa digunakan untuk melihat menu yang tersedia.
            </div>
          </div>
        </div>
      ` : ''}
    `;

    attachListeners();

    // Auto scroll active category chip into view inside slider
    const slider = container.querySelector('#category-slider');
    if (slider) {
      const activeChip = slider.querySelector('.active-chip');
      if (activeChip) {
        slider.scrollTo({
          left: activeChip.offsetLeft - 16,
          behavior: 'smooth'
        });
      }
    }
  };

  const attachListeners = () => {
    // Search
    const searchInput = $('#search-mobile');
    if (searchInput) {
      searchInput.value = searchQuery;
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderContent();
        $('#search-mobile').focus();
        const len = $('#search-mobile').value.length;
        $('#search-mobile').setSelectionRange(len, len);
      });
    }

    // Category filter chips
    container.querySelectorAll('button[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        renderContent();
      });
    });

    // Drag to scroll categories on desktop
    const slider = container.querySelector('#category-slider');
    if (slider) {
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.remove('cursor-grab');
        slider.classList.add('cursor-grabbing');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('cursor-grabbing');
        slider.classList.add('cursor-grab');
      });

      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('cursor-grabbing');
        slider.classList.add('cursor-grab');
      });

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2.5; // Scroll speed multiplier
        slider.scrollLeft = scrollLeft - walk;
      });
    }

    // Add to mobile cart
    container.querySelectorAll('.btn-add-customer-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = store.menuItems.find(i => i.id === id);
        
        if (item) {
          const existing = customerCart.find(c => c.id === id);
          if (existing) {
            existing.qty += 1;
          } else {
            customerCart.push({ ...item, qty: 1 });
          }
          renderContent();
        }
      });
    });

    // Open/Close Cart drawer
    const btnOpenDrawer = $('#btn-open-cart-drawer');
    if (btnOpenDrawer) {
      btnOpenDrawer.addEventListener('click', () => {
        isCartOpen = true;
        renderContent();
      });
    }

    const btnCloseDrawer = $('#btn-close-cart-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        isCartOpen = false;
        renderContent();
      });
    }

    const overlay = $('#cart-drawer-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        isCartOpen = false;
        renderContent();
      });
    }

    // Notes textarea
    const noteInput = $('#input-customer-note');
    if (noteInput) {
      noteInput.value = customerNote;
      noteInput.addEventListener('input', (e) => {
        customerNote = e.target.value;
      });
    }

    // Quantity controls inside cart
    container.querySelectorAll('.btn-customer-qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const idx = customerCart.findIndex(c => c.id === id);
        if (idx !== -1) {
          customerCart[idx].qty -= 1;
          if (customerCart[idx].qty <= 0) {
            customerCart.splice(idx, 1);
          }
        }
        if (customerCart.length === 0) isCartOpen = false;
        renderContent();
      });
    });

    container.querySelectorAll('.btn-customer-qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const existing = customerCart.find(c => c.id === id);
        if (existing) {
          existing.qty += 1;
        }
        renderContent();
      });
    });

    // Submit Order
    const btnSubmit = $('#btn-submit-order');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        isPaymentModalOpen = true;
        renderContent();
      });
    }

    // Modal QRIS actions
    const btnClosePayment = $('#btn-close-payment-modal');
    if (btnClosePayment) {
      btnClosePayment.addEventListener('click', () => {
        isPaymentModalOpen = false;
        renderContent();
      });
    }

    // Salin nominal ke clipboard (scan-order modal)
    const btnCopyScan = $('#btn-copy-nominal-scan');
    if (btnCopyScan) {
      btnCopyScan.addEventListener('click', () => {
        navigator.clipboard.writeText(String(getCartTotal())).then(() => {
          const orig = btnCopyScan.innerHTML;
          btnCopyScan.textContent = '✓ OK!';
          btnCopyScan.style.background = '#dcfce7';
          btnCopyScan.style.color = '#16a34a';
          setTimeout(() => { btnCopyScan.innerHTML = orig; btnCopyScan.style.background = 'white'; btnCopyScan.style.color = '#111'; }, 1800);
        });
      });
    }

    const btnCancelPayment = $('#btn-cancel-payment-modal');
    if (btnCancelPayment) {
      btnCancelPayment.addEventListener('click', () => {
        isPaymentModalOpen = false;
        renderContent();
      });
    }

    const btnConfirmSuccess = $('#btn-confirm-payment-success');
    if (btnConfirmSuccess) {
      btnConfirmSuccess.addEventListener('click', () => {
        const order = store.createTableOrder(tableName, customerCart, 'qris', getCartTotal(), customerNote);
        isPaymentModalOpen = false;
        isCartOpen = false;
        customerCart = [];
        customerNote = '';
        alert(`✅ Pembayaran QRIS Berhasil!\n\nNomor Pesanan: #${order.orderNumber}\nMeja: ${tableName}\nJumlah: ${formatRupiah(order.total)}\n\nPesanan Anda diteruskan ke kasir untuk konfirmasi. Terima kasih! 🙏`);
        renderContent();
      });
    }
  };

  renderContent();

  // Subscribe to store changes so the UI reactively opens/locks when shift changes!
  const unsubscribe = store.subscribeWithFocusProtection(container, renderContent);

  return () => {
    unsubscribe();
  };
}

import { store } from '../store.js';
import { formatRupiah } from '../utils.js';

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

  const renderContent = () => {
    const hasItems = store.cart.length > 0;
    
    // Calculate values
    let subtotal = 117000;
    let total = 117000; // Total matches subtotal directly without tax/service
    
    if (hasItems) {
      subtotal = store.getCartSubtotal();
      total = subtotal;
    }

    container.innerHTML = `
      <style>
        body { font-family: 'Sora', sans-serif !important; }
        
        /* Marquee Animation */
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        /* Neubrutalism Shadow Util */
        .hard-shadow {
          box-shadow: 4px 4px 0px 0px rgba(20, 27, 43, 1);
        }
        .hard-shadow-sm {
          box-shadow: 2px 2px 0px 0px rgba(20, 27, 43, 1);
        }
      </style>

      <div class="bg-[#f9f9ff] text-[#141b2b] h-screen flex flex-col overflow-hidden font-['Sora'] w-full">
        <!-- Header -->
        <header class="bg-white border-b-2 border-[#141b2b] py-6 px-4 flex flex-col items-center justify-center relative z-10 shrink-0 shadow-md">
          <h1 class="font-extrabold text-2xl uppercase tracking-tight text-center">Suka Bakar Dimsum</h1>
          
          <div class="bg-primary-container text-white text-xs font-bold px-4 py-1.5 rounded-full border-2 border-[#141b2b] mt-2 hard-shadow-sm inline-block">
            Authentic Dimsum
          </div>
          
          <div class="bg-[#fce354] text-[#141b2b] font-bold text-sm px-4 py-2 rounded-xl border-2 border-[#141b2b] mt-4 hard-shadow-sm inline-flex items-center gap-2">
            <span class="material-symbols-outlined text-base">table_restaurant</span>
            <span>${store.selectedTable ? `Meja ${store.selectedTable}` : 'Meja #12'}</span>
          </div>
        </header>

        <!-- Main Scrollable Area -->
        <main class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-32">
          
          <!-- Order Summary Card -->
          <section class="bg-white border-2 border-[#141b2b] rounded-xl hard-shadow p-4 flex flex-col">
            <h2 class="font-extrabold text-lg mb-4 border-b-2 border-[#141b2b] pb-2">Order Summary</h2>
            
            <!-- Items -->
            <div class="flex flex-col">
              ${!hasItems ? `
                <!-- Mock Sample Items (exactly matches provided mockup) -->
                <div class="flex justify-between items-center py-3 border-b-2 border-slate-100">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-extrabold bg-[#dce2f7] px-2.5 py-1 rounded-md border-2 border-[#141b2b]">2x</span>
                    <span class="text-sm font-bold">Siomay Ayam</span>
                  </div>
                  <span class="text-sm font-bold">Rp 44.000</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b-2 border-slate-100">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-extrabold bg-[#dce2f7] px-2.5 py-1 rounded-md border-2 border-[#141b2b]">1x</span>
                    <span class="text-sm font-bold">Hakau Udang</span>
                  </div>
                  <span class="text-sm font-bold">Rp 28.000</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b-2 border-slate-100">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-extrabold bg-[#dce2f7] px-2.5 py-1 rounded-md border-2 border-[#141b2b]">3x</span>
                    <span class="text-sm font-bold">Es Teh Manis</span>
                  </div>
                  <span class="text-sm font-bold">Rp 45.000</span>
                </div>
              ` : `
                <!-- Real Live Cashier Cart Items -->
                ${store.cart.map(item => `
                  <div class="flex justify-between items-center py-3 border-b-2 border-slate-100">
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-extrabold bg-[#dce2f7] px-2.5 py-1 rounded-md border-2 border-[#141b2b]">${item.qty}x</span>
                      <span class="text-sm font-bold">${item.name}</span>
                    </div>
                    <span class="text-sm font-bold">${formatRupiah(item.price * item.qty)}</span>
                  </div>
                `).join('')}
              `}
            </div>

            <!-- Breakdown -->
            <div class="mt-4 pt-2 flex flex-col gap-2">
              <div class="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Subtotal</span>
                <span>${formatRupiah(subtotal)}</span>
              </div>
            </div>
          </section>

          <!-- Scan to Pay Card -->
          <section class="bg-white border-2 border-[#141b2b] rounded-xl hard-shadow p-4 flex flex-col items-center text-center mt-2">
            <h3 class="font-bold text-xs uppercase tracking-wider mb-3 bg-[#ffaceb] px-4 py-1 rounded-full border-2 border-[#141b2b]">Scan to Pay</h3>
            <div class="bg-white p-2 border-2 border-[#141b2b] rounded-lg w-40 h-40 flex items-center justify-center mb-2">
              <!-- Inline QR Code SVG -->
              <svg height="100%" viewBox="0 0 100 100" width="100%" xmlns="http://www.w3.org/2000/svg">
                <rect fill="white" height="100" width="100"></rect>
                <rect fill="black" height="30" width="30" x="10" y="10"></rect>
                <rect fill="white" height="20" width="20" x="15" y="15"></rect>
                <rect fill="black" height="10" width="10" x="20" y="20"></rect>
                <rect fill="black" height="30" width="30" x="60" y="10"></rect>
                <rect fill="white" height="20" width="20" x="65" y="15"></rect>
                <rect fill="black" height="10" width="10" x="70" y="20"></rect>
                <rect fill="black" height="30" width="30" x="10" y="60"></rect>
                <rect fill="white" height="20" width="20" x="15" y="65"></rect>
                <rect fill="black" height="10" width="10" x="20" y="70"></rect>
                <rect fill="black" height="10" width="10" x="60" y="60"></rect>
                <rect fill="black" height="10" width="15" x="75" y="60"></rect>
                <rect fill="black" height="15" width="20" x="60" y="75"></rect>
                <rect fill="black" height="15" width="5" x="85" y="75"></rect>
              </svg>
            </div>
            <p class="font-bold text-xs text-slate-500">Supports all major e-wallets</p>
          </section>
        </main>

        <!-- Bottom Fixed Area -->
        <div class="fixed bottom-0 w-full z-50 flex flex-col">
          <!-- Total Bar -->
          <div class="bg-[#fce354] border-t-2 border-[#141b2b] p-4 flex justify-between items-center">
            <span class="font-extrabold text-lg uppercase">Total</span>
            <span class="font-extrabold text-2xl text-[#141b2b]">${formatRupiah(total)}</span>
          </div>
          <!-- Marquee Banner -->
          <div class="bg-[#7257ff] text-white border-t-2 border-[#141b2b] py-2 marquee-container">
            <div class="marquee-content font-bold text-xs uppercase tracking-widest flex items-center gap-4">
              <span>WELCOME TO SUKA BAKAR DIMSUM - ENJOY YOUR MEAL &nbsp;•&nbsp;</span>
              <span class="material-symbols-outlined text-sm font-bold">restaurant</span>
              <span>WELCOME TO SUKA BAKAR DIMSUM - ENJOY YOUR MEAL &nbsp;•&nbsp;</span>
              <span class="material-symbols-outlined text-sm font-bold">restaurant</span>
            </div>
          </div>
        </div>

      </div>
    `;
  };

  renderContent();

  const unsubscribe = store.subscribe(() => {
    renderContent();
  });

  return () => {
    unsubscribe();
  };
}

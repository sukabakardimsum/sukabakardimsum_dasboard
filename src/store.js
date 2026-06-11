// ============================================================
// Central Data Store with localStorage persistence & Supabase Sync
// ============================================================
import { uid, formatRupiah } from './utils.js';
import { supabase } from './supabase.js';


const STORAGE_KEY = 'kedai_pojok_13_pos';
const STORAGE_VERSION = 2; // Naikkan versi ini jika struktur localStorage berubah drastis

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Jika versi lama, hapus localStorage agar tidak bentrok dengan data Supabase
      if (!parsed._version || parsed._version < STORAGE_VERSION) {
        console.log('🔄 localStorage versi lama terdeteksi, reset ke Supabase...');
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveState() {
  try {
    // Hanya simpan data SESI — master data (menu, staff, orders, dll) dikelola Supabase
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      _version: STORAGE_VERSION,
      cart: store.cart,
      currentUser: store.currentUser,
      shift: store.shift,
      settings: store.settings,
      notifications: store.notifications,
      inventory: store.inventory,
    }));
  } catch (e) { /* ignore */ }
}

const db = {
  pushOrder(order) {
    if (!supabase) return;
    supabase.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      service_type: order.serviceType,
      table_name: order.table,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      payment_method: order.paymentMethod,
      amount_tendered: order.amountTendered,
      change: order.change,
      status: order.status,
      cashier_name: order.cashierName,
      notes: order.notes || '',
      created_at: order.createdAt
    }).then(({ error }) => {
      if (!error) {
        const itemsToInsert = order.items.map(item => ({
          order_id: order.id,
          menu_item_id: item.id || 'item-unknown',
          name: item.name,
          price: item.price,
          qty: item.qty
        }));
        supabase.from('order_items').insert(itemsToInsert).then(null, e => console.error(e));
      } else {
        console.error('Error inserting order:', error);
      }
    });
  },
  updateOrderStatus(id, status) {
    if (!supabase) return;
    supabase.from('orders').update({ status }).eq('id', id).then(null, e => console.error(e));
  },
  updateOrder(id, fields) {
    if (!supabase) return;
    const updateData = {};
    if (fields.customerName !== undefined) updateData.customer_name = fields.customerName;
    if (fields.serviceType  !== undefined) updateData.service_type  = fields.serviceType;
    if (fields.table        !== undefined) updateData.table_name    = fields.table;
    if (fields.total        !== undefined) updateData.total         = fields.total;
    if (fields.status       !== undefined) updateData.status        = fields.status;
    if (fields.notes        !== undefined) updateData.notes         = fields.notes;
    supabase.from('orders').update(updateData).eq('id', id).then(null, e => console.error(e));
  },
  pushTable(table) {
    if (!supabase) return;
    supabase.from('tables').insert({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      is_vip: table.isVip
    }).then(null, e => console.error(e));
  },
  updateTable(id, fields) {
    if (!supabase) return;
    supabase.from('tables').update({
      name: fields.name,
      capacity: fields.capacity,
      is_vip: fields.isVip
    }).eq('id', id).then(null, e => console.error(e));
  },
  deleteTable(id) {
    if (!supabase) return;
    supabase.from('tables').delete().eq('id', id).then(null, e => console.error(e));
  },
  pushExpense(expense) {
    if (!supabase) return;
    supabase.from('expenses').insert({
      id: expense.id,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      staff: expense.staff,
      staff_initials: expense.staffInitials,
      icon: expense.icon
    }).then(null, e => console.error(e));
  },
  deleteExpense(id) {
    if (!supabase) return;
    supabase.from('expenses').delete().eq('id', id).then(null, e => console.error(e));
  },
  deleteOrder(id) {
    if (!supabase) return;
    supabase.from('orders').delete().eq('id', id).then(null, e => console.error(e));
  },
  updateMenuItem(id, fields) {
    if (!supabase) return;
    supabase.from('menu_items').update({
      name:        fields.name,
      category:    fields.category,
      price:       fields.price,
      emoji:       fields.emoji,
      description: fields.description,
      stock:       fields.stock,
      available:   fields.available,
      badge_color: fields.badgeColor,
    }).eq('id', id).then(null, e => console.error('Error updating menu_item:', e));
  },
  pushMenuItem(item) {
    if (!supabase) return;
    supabase.from('menu_items').insert({
      id:          item.id,
      name:        item.name,
      category:    item.category,
      price:       item.price,
      emoji:       item.emoji       || '🥟',
      description: item.description || '',
      stock:       item.stock       ?? 0,
      available:   item.available   ?? true,
      badge_color: item.badgeColor  || 'yellow',
    }).then(({ error }) => {
      if (error) console.error('Error inserting menu_item:', error);
    });
  },
  deleteMenuItem(id) {
    if (!supabase) return;
    supabase.from('menu_items').delete().eq('id', id)
      .then(null, e => console.error('Error deleting menu_item:', e));
  },

  updateStoreStatus(isOpen, startTime, pettyCash) {
    if (!supabase) return;
    supabase.from('store_status').upsert({
      id: 'main',
      is_open: isOpen,
      opened_at: startTime,
      petty_cash: pettyCash
    }).then(null, e => console.error('Error updating store status:', e));
  }
};

let isSyncing = false;

async function syncFromSupabase() {
  if (!supabase || isSyncing) return;
  isSyncing = true;
  try {
    console.log('🔄 Syncing data from Supabase...');
    
    // 1. Fetch tables
    const { data: dbTables, error: tErr } = await supabase.from('tables').select('*').order('name');
    if (!tErr && dbTables && dbTables.length > 0) {
      store.tables = dbTables.map(t => ({
        id: t.id,
        name: t.name,
        capacity: t.capacity,
        isVip: t.is_vip
      }));
    }

    // 2. Fetch menu_items
    const { data: dbMenu, error: mErr } = await supabase.from('menu_items').select('*').order('name');
    if (!mErr && dbMenu && dbMenu.length > 0) {
      store.menuItems = dbMenu.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        price: parseFloat(m.price),
        emoji: m.emoji,
        description: m.description,
        stock: m.stock,
        available: m.available,
        badgeColor: m.badge_color
      }));
    }

    // 3. Fetch staff
    const { data: dbStaff, error: sErr } = await supabase.from('staff').select('*').order('name');
    if (!sErr && dbStaff && dbStaff.length > 0) {
      store.staff = dbStaff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        pin: s.pin,
        active: s.active,
        avatar: s.avatar,
        initials: s.initials,
        username: s.name.toLowerCase(),
        password: s.pin
      }));
    }

    // 4. Fetch expenses
    const { data: dbExpenses, error: eErr } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (!eErr && dbExpenses) {
      store.expenses = dbExpenses.map(e => ({
        id: e.id,
        description: e.description,
        category: e.category,
        amount: parseFloat(e.amount),
        date: e.date,
        staff: e.staff,
        staffInitials: e.staff_initials,
        icon: e.icon
      }));
    }

    // 5. Fetch orders
    const { data: dbOrders, error: oErr } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (!oErr && dbOrders) {
      const mappedOrders = dbOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        serviceType: o.service_type,
        table: o.table_name,
        subtotal: parseFloat(o.subtotal),
        tax: parseFloat(o.tax),
        total: parseFloat(o.total),
        paymentMethod: o.payment_method,
        amountTendered: parseFloat(o.amount_tendered),
        change: parseFloat(o.change),
        status: o.status,
        cashierName: o.cashier_name,
        notes: o.notes || '',
        createdAt: o.created_at,
        items: (o.order_items || []).map(oi => ({
          id: oi.menu_item_id,
          name: oi.name,
          price: parseFloat(oi.price),
          qty: oi.qty
        }))
      }));

      // Detect new orders for active cashier notification
      const isInitialSync = store.orders.length === 0;
      mappedOrders.forEach(newOrder => {
        const alreadyExists = store.orders.some(existing => existing.id === newOrder.id);
        if (!alreadyExists && !isInitialSync) {
          const noteText = newOrder.notes ? ` | Catatan: "${newOrder.notes}"` : '';
          const isPending = newOrder.status === 'pending';
          store.addNotification(
            `Pesanan baru #${newOrder.orderNumber} dari ${newOrder.table || 'Meja'} senilai ${formatRupiah(newOrder.total)} (${newOrder.paymentMethod.toUpperCase()})${noteText}${isPending ? ' — menunggu konfirmasi!' : ' telah diterima!'}`,
            isPending ? '🛎️ Pesanan Baru Masuk!' : 'Pesanan Baru Masuk!',
            '#/reports'
          );
          console.log(`🔔 New order detected from table: #${newOrder.orderNumber}`);
        }
      });

      // Sync global daily order number sequence
      const todayKey = new Date().toLocaleDateString('id-ID');
      let maxTodayNum = 0;
      mappedOrders.forEach(o => {
        const orderDate = new Date(o.createdAt).toLocaleDateString('id-ID');
        if (orderDate === todayKey && o.orderNumber > maxTodayNum) {
          maxTodayNum = o.orderNumber;
        }
      });
      store.nextOrderNumber = Math.max(maxTodayNum + 1, 1);
      localStorage.setItem('orderDate', todayKey);
      localStorage.setItem('nextOrderNum', String(store.nextOrderNumber));

      store.orders = mappedOrders;
    }

    // 6. Fetch store_status
    try {
      const { data: statusData, error: stErr } = await supabase
        .from('store_status')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      if (!stErr) {
        const savedLocal = loadState();
        const hasLocalActiveShift = savedLocal?.shift?.isOpen === true;

        if (!statusData) {
          // Jika tabel store_status kosong (0 baris), lakukan self-seeding otomatis!
          console.log('🌱 Seeding missing store_status row...');
          const initialStatus = hasLocalActiveShift ? {
            id: 'main',
            is_open: true,
            opened_at: savedLocal.shift.startTime,
            petty_cash: parseFloat(savedLocal.shift.pettyCash || 0)
          } : {
            id: 'main',
            is_open: false,
            opened_at: null,
            petty_cash: 0
          };
          
          supabase.from('store_status').upsert(initialStatus).then(null, e => console.error(e));
          
          store.shift = {
            isOpen: initialStatus.is_open,
            startTime: initialStatus.opened_at,
            pettyCash: initialStatus.petty_cash
          };
        } else {
          // Self-healing: Jika browser kasir ini memiliki shift aktif yang tersimpan di localStorage
          // tetapi Supabase mendeteksi tutup (karena baru di-seed FALSE), kita otomatis kirim status BUKA ke Supabase!
          // Ini menyembuhkan database agar sinkron secara otomatis saat halaman kasir di-refresh.
          if (hasLocalActiveShift && !statusData.is_open) {
            console.log('🩹 Healing database store_status: pushing active local shift to Supabase...');
            db.updateStoreStatus(true, savedLocal.shift.startTime, parseFloat(savedLocal.shift.pettyCash || 0));
            store.shift = {
              isOpen: true,
              startTime: savedLocal.shift.startTime,
              pettyCash: parseFloat(savedLocal.shift.pettyCash || 0)
            };
          } else {
            // Sinkronisasi normal dari database
            store.shift = {
              isOpen: statusData.is_open,
              startTime: statusData.opened_at,
              pettyCash: parseFloat(statusData.petty_cash || 0)
            };
          }
        }
      }
    } catch (e) {
      console.warn('store_status table not ready or error fetching:', e);
    }

    console.log('✅ Supabase sync completed successfully!');
    store.notify();
  } catch (e) {
    console.error('❌ Failed to sync from Supabase:', e);
  } finally {
    isSyncing = false;
  }
}


const saved = loadState();


export const store = {
  // Menu — diisi dari Supabase sync, tidak dari localStorage
  menuItems: [],
  categories: ['Semua', 'Bakar', 'Goreng', 'Original', 'Mentai', 'Tartar', 'Mix Saus', 'Adds On', 'Minuman'],

  // Cart / current order — disimpan di localStorage (state sesi)
  cart: saved?.cart || [],
  customerName: '',
  serviceType: 'dine-in',
  selectedTable: null,

  // Notifications — disimpan di localStorage
  notifications: saved?.notifications || [],

  // Orders — diisi dari Supabase sync
  orders: [],
  // Order number resets daily — stored with today's date as key
  nextOrderNumber: (() => {
    const todayKey = new Date().toLocaleDateString('id-ID');
    const saved_date = localStorage.getItem('orderDate');
    const saved_num  = parseInt(localStorage.getItem('nextOrderNum') || '1');
    if (saved_date === todayKey) return saved_num;
    localStorage.setItem('orderDate', todayKey);
    localStorage.setItem('nextOrderNum', '1');
    return 1;
  })(),

  // Staff — diisi dari Supabase sync
  staff: [],

  // Tables — diisi dari Supabase sync
  tables: [],

  // Expenses — diisi dari Supabase sync
  expenses: [],

  // Inventory — tidak ada tabel Supabase, tetap di localStorage
  inventory: saved?.inventory || [
    { id: 'inv-1', name: 'Kulit Pangsit',      category: 'Bahan Baku', stock: 0, unit: 'Lembar', icon: '🥟' },
    { id: 'inv-2', name: 'Daging Ayam Fillet', category: 'Bahan Baku', stock: 0, unit: 'Kg',     icon: '🥩' },
    { id: 'inv-3', name: 'Teh Celup Oolong',   category: 'Minuman',    stock: 0, unit: 'Box',    icon: '🍵' },
    { id: 'inv-4', name: 'Box Packaging L',    category: 'Lainnya',    stock: 0, unit: 'Pcs',    icon: '📦' },
  ],

  // Current user / auth — disimpan di localStorage
  currentUser: saved?.currentUser || null,
  isLoggedIn: !!saved?.currentUser,

  // Shift — disimpan di localStorage
  shift: saved?.shift || {
    isOpen: false,
    startTime: null,
    pettyCash: 0,
  },

  // Settings — disimpan di localStorage
  settings: saved?.settings || {
    storeName: 'Suka Bakar Dimsum',
    storeSubtitle: 'Dimsum & More',
    address: 'Jl. Piere Tendean No.13, Purbalingga Lor, Kec. Purbalingga, Purbalingga',
    phone: '0812-3456-7890',
    openingHours: '11:00',
    closingHours: '21:00',
    taxRate: 0,
    currency: 'IDR',
    printerIp: '192.168.1.100',
    paperWidth: '58mm',
    terminalId: 'Terminal #01',
  },

  // UI state
  activePage: 'pos',
  sidebarOpen: false,
  orderPanelOpen: false,

  // Listeners
  _listeners: [],

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  subscribeWithFocusProtection(container, renderFn) {
    return this.subscribe(() => {
      if (document.body.contains(container)) {
        const activeEl = document.activeElement;
        const inputType = activeEl?.type?.toLowerCase();
        const isUserTyping = activeEl && (
          ((activeEl.tagName === 'INPUT') && inputType !== 'checkbox' && inputType !== 'radio') ||
          activeEl.tagName === 'SELECT' ||
          activeEl.tagName === 'TEXTAREA'
        );
        const isModalOpen = Array.from(container.querySelectorAll('[id^="modal-"]')).some(modal => {
          return modal && (modal.style.display === 'flex' || modal.style.display === 'block');
        });
        
        if (isUserTyping || isModalOpen) {
          console.log('⏳ Delaying background re-render: user is actively typing or a modal is open.');
          return;
        }
        renderFn();
      }
    });
  },

  notify() {
    saveState();
    this._listeners.forEach(fn => fn(this));
  },

  // ── Cart Actions ──
  addToCart(item) {
    const existing = this.cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ ...item, qty: 1, cartId: uid() });
    }
    this.notify();
  },

  removeFromCart(cartId) {
    this.cart = this.cart.filter(c => c.cartId !== cartId);
    this.notify();
  },

  updateCartQty(cartId, delta) {
    const item = this.cart.find(c => c.cartId === cartId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(c => c.cartId !== cartId);
    }
    this.notify();
  },

  setCartQty(cartId, qty) {
    const item = this.cart.find(c => c.cartId === cartId);
    if (!item) return;
    item.qty = parseInt(qty) || 1;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(c => c.cartId !== cartId);
    }
    this.notify();
  },

  clearCart() {
    this.cart = [];
    this.customerName = '';
    this.serviceType = 'dine-in';
    this.selectedTable = null;
    this.notify();
  },

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getCartTax() {
    return 0; // Pajak dikunci di 0%
  },

  getCartTotal() {
    return this.getCartSubtotal() + this.getCartTax();
  },

  getCartItemCount() {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  },

  // ── Order Actions ──
  createOrder(paymentMethod = 'cash', amountTendered = 0) {
    // Daily order number: persist with today's date key
    const todayKey = new Date().toLocaleDateString('id-ID');
    localStorage.setItem('orderDate', todayKey);
    localStorage.setItem('nextOrderNum', String(this.nextOrderNumber + 1));

    const cashierName = this.currentUser?.name || this.shift?.cashierName || 'Kasir';
    const order = {
      id: uid(),
      orderNumber: this.nextOrderNumber++,
      items: [...this.cart],
      customerName: this.customerName || 'Customer',
      serviceType: this.serviceType,
      table: this.selectedTable,
      subtotal: this.getCartSubtotal(),
      tax: this.getCartTax(),
      total: this.getCartTotal(),
      paymentMethod,
      amountTendered,
      change: amountTendered > 0 ? amountTendered - this.getCartTotal() : 0,
      status: 'completed',
      cashierName,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    this.clearCart();
    db.pushOrder(order);
    this.notify();
    return order;
  },

  updateOrder(id, updatedFields) {
    this.orders = this.orders.map(o => o.id === id ? { ...o, ...updatedFields } : o);
    db.updateOrder(id, updatedFields);
    this.notify();
  },

  deleteOrder(id) {
    this.orders = this.orders.filter(o => o.id !== id);
    db.deleteOrder(id);
    this.notify();
  },

  // ── Auth Actions ──
  login(username, password) {
    const normInputUser = username.trim().toLowerCase();
    
    // 1. Check custom staff members configured in store.staff
    const matchedStaff = this.staff.find(s => {
      if (!s.active) return false;
      
      const customUsername = (s.username || '').trim().toLowerCase();
      const nameAsUsername = (s.name || '').trim().toLowerCase();
      
      const isUsernameMatch = (normInputUser === customUsername || normInputUser === nameAsUsername);
      
      const customPassword = s.password || '';
      const pinAsPassword = s.pin || '';
      
      const isPasswordMatch = (password === customPassword || password === pinAsPassword);
      
      return isUsernameMatch && isPasswordMatch;
    });

    if (matchedStaff) {
      this.currentUser = {
        username: matchedStaff.username || matchedStaff.name.trim().toLowerCase(),
        name: matchedStaff.name,
        role: matchedStaff.role,
      };
      this.isLoggedIn = true;
      this.notify();
      return true;
    }

    // 2. Fallback to default hardcoded users
    const validUsers = [
      { username: 'owner', password: 'yanu', role: 'Owner', name: 'Yanu' },
      { username: '0wner', password: 'rizal', role: 'Owner', name: 'Rizal' },
      { username: 'atmin', password: 'kasir', role: 'Cashier', name: 'Admin Kasir' }
    ];

    const user = validUsers.find(u => u.username === normInputUser && u.password === password);
    
    if (user) {
      this.currentUser = {
        username: user.username,
        name: user.name,
        role: user.role,
      };
      this.isLoggedIn = true;
      this.notify();
      return true;
    }
    return false;
  },

  logout() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.notify();
  },

  // ── Shift Actions ──
  openShift(pettyCash) {
    this.shift = {
      isOpen: true,
      startTime: new Date().toISOString(),
      pettyCash,
    };
    db.updateStoreStatus(true, this.shift.startTime, pettyCash);
    this.notify();
  },

  updatePettyCash(newAmount) {
    this.shift = {
      ...this.shift,
      pettyCash: newAmount,
    };
    db.updateStoreStatus(this.shift.isOpen, this.shift.startTime, newAmount);
    this.notify();
  },


  closeShift() {
    this.shift = {
      isOpen: false,
      startTime: null,
      pettyCash: 0,
    };
    db.updateStoreStatus(false, null, 0);
    this.notify();
  },

  async resetDatabase() {
    if (supabase) {
      try {
        console.log('🗑️ Resetting database on Supabase...');
        // Delete all rows from orders and expenses
        // Deleting from orders cascades to order_items
        const { error: oErr } = await supabase.from('orders').delete().neq('id', '');
        const { error: eErr } = await supabase.from('expenses').delete().neq('id', '');
        if (oErr) console.error('Error resetting Supabase orders:', oErr);
        if (eErr) console.error('Error resetting Supabase expenses:', eErr);
        
        // Reset store_status on Supabase
        await supabase.from('store_status').update({ is_open: false, opened_at: null, petty_cash: 0 }).eq('id', 'main');
      } catch (err) {
        console.error('Failed to reset Supabase database:', err);
      }
    }
    
    // Clear local storage & state
    localStorage.removeItem(STORAGE_KEY);
    this.orders = [];
    this.expenses = [];
    this.cart = [];
    this.nextOrderNumber = 1;
    localStorage.setItem('nextOrderNum', '1');
    
    // Reset shift status
    this.shift = {
      isOpen: false,
      startTime: null,
      pettyCash: 0,
    };
    
    this.notify();
  },


  // ── Expense Actions ──
  addExpense(expense) {
    this.expenses.unshift(expense);
    db.pushExpense(expense);
    this.notify();
  },

  updateExpense(id, updatedFields) {
    this.expenses = this.expenses.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    this.notify();
  },

  deleteExpense(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    db.deleteExpense(id);
    this.notify();
  },

  // ── Table Actions ──
  addTable(tableData) {
    const newTable = {
      id: `table-${uid()}`,
      name: tableData.name,
      capacity: tableData.capacity,
      isVip: tableData.isVip || false,
    };
    this.tables.push(newTable);
    db.pushTable(newTable);
    this.notify();
    return newTable;
  },

  updateTableStatus(id, status, time = null) {
    this.tables = this.tables.map(t => t.id === id ? { ...t, status, time } : t);
    this.notify();
  },

  updateTable(id, updatedFields) {
    this.tables = this.tables.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    const tbl = this.tables.find(t => t.id === id);
    if (tbl) db.updateTable(id, tbl);
    this.notify();
  },

  deleteTable(id) {
    this.tables = this.tables.filter(t => t.id !== id);
    db.deleteTable(id);
    this.notify();
  },

  // ── Staff Actions ──
  addStaff(member) {
    this.staff.push(member);
    this.notify();
  },

  updateStaff(id, updatedMember) {
    this.staff = this.staff.map(s => s.id === id ? { ...s, ...updatedMember } : s);
    this.notify();
  },

  deleteStaff(id) {
    this.staff = this.staff.filter(s => s.id !== id);
    this.notify();
  },

  // ── Menu Actions ──
  addMenuItem(item) {
    this.menuItems.push(item);
    db.pushMenuItem(item);          // 🔄 Sync ke Supabase
    this.notify();
  },

  updateMenuItem(id, updatedFields) {
    this.menuItems = this.menuItems.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    const item = this.menuItems.find(i => i.id === id);
    if (item) db.updateMenuItem(id, item); // 🔄 Sync ke Supabase
    this.notify();
  },

  toggleMenuAvailability(id) {
    this.menuItems = this.menuItems.map(item => item.id === id ? { ...item, available: !item.available } : item);
    const item = this.menuItems.find(i => i.id === id);
    if (item) db.updateMenuItem(id, item); // 🔄 Sync ke Supabase
    this.notify();
  },

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.notify();
    }
  },

  deleteMenuItem(id) {
    this.menuItems = this.menuItems.filter(item => item.id !== id);
    db.deleteMenuItem(id);          // 🔄 Sync ke Supabase
    this.notify();
  },

  // ── Notification Actions ──
  addNotification(text, title = 'Notifikasi', actionRoute = null) {
    const notif = {
      id: uid(),
      title,
      text,
      actionRoute,
      createdAt: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(notif);
    this.notify();
    return notif;
  },

  dismissNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  },

  clearNotifications() {
    this.notifications = [];
    this.notify();
  },

  // ── Customer Table Order Action ──
  createTableOrder(tableName, items, paymentMethod = 'qris', totalAmount = 0, notes = '') {
    // Daily order number: persist with today's date key
    const todayKey = new Date().toLocaleDateString('id-ID');
    localStorage.setItem('orderDate', todayKey);
    localStorage.setItem('nextOrderNum', String(this.nextOrderNumber + 1));

    const order = {
      id: uid(),
      orderNumber: this.nextOrderNumber++,
      items: [...items],
      customerName: `Self-Service (${tableName})`,
      serviceType: 'dine-in',
      table: tableName,
      subtotal: totalAmount,
      tax: 0,
      total: totalAmount,
      paymentMethod,
      amountTendered: totalAmount,
      change: 0,
      status: 'pending',
      cashierName: 'Self-Service',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    
    // Add a notification for the cashier
    const noteText = notes ? ` | Catatan: "${notes}"` : '';
    this.addNotification(
      `Pesanan baru dari ${tableName} senilai ${formatRupiah(totalAmount)} (${paymentMethod.toUpperCase()})${noteText} — menunggu konfirmasi!`,
      '🛎️ Pesanan Baru Masuk!',
      '#/reports'
    );

    db.pushOrder(order);
    this.notify();
    return order;
  },

  // ── Confirm / Cancel Self-Service Orders ──
  confirmOrder(id) {
    this.orders = this.orders.map(o => o.id === id ? { ...o, status: 'completed', cashierName: this.currentUser?.name || 'Kasir' } : o);
    db.updateOrderStatus(id, 'completed');
    this.notify();
  },

  cancelOrder(id) {
    this.orders = this.orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o);
    db.updateOrderStatus(id, 'cancelled');
    this.notify();
  },

  // ── Inventory Actions ──
  addInventoryItem(item) {
    const newItem = {
      id: `inv-${uid()}`,
      name: item.name,
      category: item.category || 'Lainnya',
      stock: parseInt(item.stock) || 0,
      unit: item.unit || 'Pcs',
      icon: item.icon || '📦',
    };
    this.inventory.push(newItem);
    this.notify();
    return newItem;
  },

  updateInventoryItem(id, updatedFields) {
    this.inventory = this.inventory.map(item => {
      if (item.id === id) {
        const stockVal = updatedFields.stock !== undefined ? parseInt(updatedFields.stock) : item.stock;
        return { ...item, ...updatedFields, stock: stockVal };
      }
      return item;
    });
    this.notify();
  },

  deleteInventoryItem(id) {
    this.inventory = this.inventory.filter(item => item.id !== id);
    this.notify();
  },
};

// Trigger Supabase sync sekali saat startup
syncFromSupabase();
// Auto-sync dinonaktifkan — gunakan tombol Sync di halaman Reports untuk refresh manual

// Expose sync function agar bisa dipanggil dari halaman lain
export { syncFromSupabase };

// Event listener untuk force-sync dari halaman manapun
if (typeof window !== 'undefined') {
  document.addEventListener('force-supabase-sync', () => syncFromSupabase());
  window.store = store;
}

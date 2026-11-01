import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';

const $ = (id) => document.getElementById(id);
const formatIDR = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(value);
const products = [
  { id: 1, name: 'Headphone Studio Lite', category: 'Teknologi', price: 189000, rating: 4.9, sold: 124, tag: 'Favorit', emoji: '🎧', bg: 'linear-gradient(135deg,#d9e6df,#b9d0c3)', description: 'Audio nyaman untuk belajar dan bekerja.' },
  { id: 2, name: 'Botol Minum Terra 700 ml', category: 'Gaya hidup', price: 79000, rating: 4.8, sold: 86, tag: 'Hemat', emoji: '🧴', bg: 'linear-gradient(135deg,#f1ddc4,#d9ad82)', description: 'Teman aktivitas dengan desain minimal.' },
  { id: 3, name: 'Lampu Meja Orbit', category: 'Rumah', price: 145000, rating: 4.7, sold: 71, tag: 'Pilihan', emoji: '💡', bg: 'linear-gradient(135deg,#f4eac2,#ddc678)', description: 'Cahaya hangat untuk sudut belajar.' },
  { id: 4, name: 'Tas Harian Nusa', category: 'Aksesori', price: 215000, rating: 4.9, sold: 93, tag: 'Terlaris', emoji: '🎒', bg: 'linear-gradient(135deg,#d9d7ef,#aaa5d3)', description: 'Ringkas untuk kuliah dan bepergian.' },
  { id: 5, name: 'Keyboard Mini K75', category: 'Teknologi', price: 279000, rating: 4.8, sold: 64, tag: 'Baru', emoji: '⌨️', bg: 'linear-gradient(135deg,#d7e5eb,#a9c9d7)', description: 'Keyboard ringkas dengan tombol nyaman.' },
  { id: 6, name: 'Pouch Serbaguna Sora', category: 'Aksesori', price: 49000, rating: 4.6, sold: 118, tag: 'Hemat', emoji: '👝', bg: 'linear-gradient(135deg,#f1d9df,#ddb5c0)', description: 'Merapiikan kabel, alat tulis, dan barang kecil.' },
  { id: 7, name: 'Speaker Pocket One', category: 'Teknologi', price: 159000, rating: 4.7, sold: 58, tag: 'Pilihan', emoji: '🔊', bg: 'linear-gradient(135deg,#d8e3d5,#9fbc9b)', description: 'Suara ringkas untuk menemani waktu santai.' },
  { id: 8, name: 'Bantal Duduk Awan', category: 'Rumah', price: 89000, rating: 4.5, sold: 42, tag: 'Nyaman', emoji: '🛋️', bg: 'linear-gradient(135deg,#e4dceb,#c8b7d8)', description: 'Tambahan nyaman untuk ruang belajar.' },
  { id: 9, name: 'Jam Digital Tempo', category: 'Gaya hidup', price: 119000, rating: 4.6, sold: 76, tag: 'Populer', emoji: '⌚', bg: 'linear-gradient(135deg,#d8dfe9,#aab8d0)', description: 'Tampilan simpel untuk menemani aktivitas.' },
  { id: 10, name: 'Stand Laptop Lipat', category: 'Teknologi', price: 99000, rating: 4.8, sold: 102, tag: 'Favorit', emoji: '💻', bg: 'linear-gradient(135deg,#ebdfca,#c6b18e)', description: 'Membantu posisi laptop lebih nyaman.' },
  { id: 11, name: 'Set Alat Tulis Kumo', category: 'Gaya hidup', price: 39000, rating: 4.6, sold: 147, tag: 'Hemat', emoji: '✏️', bg: 'linear-gradient(135deg,#f1e5b6,#decf8a)', description: 'Perlengkapan sederhana untuk ide baru.' },
  { id: 12, name: 'Dompet Kartu Loka', category: 'Aksesori', price: 69000, rating: 4.7, sold: 55, tag: 'Baru', emoji: '👛', bg: 'linear-gradient(135deg,#f0d6c8,#d4a48d)', description: 'Dompet kartu praktis dengan bentuk tipis.' }
];
const categories = ['Semua', 'Teknologi', 'Aksesori', 'Gaya hidup', 'Rumah'];
const state = { user: null, profile: null, cart: {}, category: 'Semua', search: '', sort: 'featured', busy: false };
const clientConfigReady = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('_HERE') && SUPABASE_PUBLISHABLE_KEY.length > 20 && !SUPABASE_PUBLISHABLE_KEY.includes('_HERE');
const supabase = clientConfigReady ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
}) : null;

function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
}
function setNotice(message, isError = false) {
  const node = $('pageNotice');
  node.textContent = message;
  node.classList.toggle('error', isError);
  node.hidden = false;
}
function hideNotice() { $('pageNotice').hidden = true; }
function getCartLines() {
  return Object.entries(state.cart).map(([id, quantity]) => ({
    product: products.find((product) => product.id === Number(id)), quantity
  })).filter((line) => line.product && line.quantity > 0);
}
function calculateTotals() {
  const lines = getCartLines();
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = lines.length ? 10000 : 0;
  return { lines, subtotal, shipping, total: subtotal + shipping, count: lines.reduce((sum, line) => sum + line.quantity, 0) };
}
function filteredProducts() {
  let result = products.filter((product) =>
    (state.category === 'Semua' || product.category === state.category) &&
    `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(state.search.toLowerCase())
  );
  if (state.sort === 'price-low') result.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') result.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  return result;
}
function renderCategories() {
  $('categoryRow').innerHTML = categories.map((category) =>
    `<button class="category-btn ${state.category === category ? 'active' : ''}" type="button" data-category="${safeText(category)}">${safeText(category)}</button>`
  ).join('');
}
function renderProducts() {
  const visible = filteredProducts();
  $('productGrid').innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-art" style="background:${product.bg}"><span class="product-tag">${safeText(product.tag)}</span><span class="product-emoji" aria-hidden="true">${product.emoji}</span></div>
      <div class="product-info"><div class="product-category">${safeText(product.category)}</div>
        <h3>${safeText(product.name)}</h3><p class="product-desc">${safeText(product.description)}</p>
        <div class="product-meta"><strong class="product-price">${formatIDR(product.price)}</strong><span class="product-rating">★ ${product.rating} · ${product.sold}</span></div>
        <button class="add-button" data-add="${product.id}" type="button">＋ Tambah ke keranjang</button>
      </div>
    </article>`).join('');
  $('productCount').textContent = `${visible.length} dari ${products.length} produk`;
  $('emptyState').hidden = visible.length !== 0;
}
function renderCart() {
  const totals = calculateTotals();
  $('cartCount').textContent = totals.count;
  $('cartSubtotal').textContent = formatIDR(totals.subtotal);
  $('cartShipping').textContent = formatIDR(totals.shipping);
  $('cartTotal').textContent = formatIDR(totals.total);
  $('checkoutTotal').textContent = formatIDR(totals.total);
  $('checkoutButton').disabled = totals.count === 0 || state.busy;
  if (!totals.lines.length) {
    $('cartList').innerHTML = '<div class="cart-empty"><div style="font-size:42px;margin-bottom:10px">🛍️</div><strong>Keranjang masih kosong</strong><p>Tambahkan produk dari katalog.</p></div>';
    return;
  }
  $('cartList').innerHTML = totals.lines.map(({ product, quantity }) => `
    <article class="cart-item"><div class="cart-thumb" style="background:${product.bg}">${product.emoji}</div>
      <div><h3>${safeText(product.name)}</h3><small>${formatIDR(product.price)}</small>
        <div class="quantity"><button data-quantity="${product.id}" data-delta="-1" type="button" aria-label="Kurangi jumlah">−</button><span>${quantity}</span><button data-quantity="${product.id}" data-delta="1" type="button" aria-label="Tambah jumlah">＋</button></div>
      </div><div><strong style="font-size:10px">${formatIDR(product.price * quantity)}</strong><button class="remove-button" data-remove="${product.id}" type="button">Hapus</button></div>
    </article>`).join('');
}
async function saveCartQuantity(productId, quantity) {
  if (state.busy) return;
  state.busy = true;
  $('checkoutButton').disabled = true;
  try {
    if (quantity <= 0) {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', state.user.id).eq('product_id', productId);
      if (error) throw error;
      delete state.cart[productId];
    } else {
      const { error } = await supabase.from('cart_items').upsert({
        user_id: state.user.id, product_id: productId, quantity
      }, { onConflict: 'user_id,product_id' });
      if (error) throw error;
      state.cart[productId] = quantity;
    }
    renderCart();
  } catch (error) {
    console.error(error);
    toast('Keranjang gagal disimpan. Periksa tabel dan kebijakan RLS.');
  } finally {
    state.busy = false;
    renderCart();
  }
}
async function loadCart() {
  const { data, error } = await supabase.from('cart_items').select('product_id,quantity').eq('user_id', state.user.id);
  if (error) throw error;
  state.cart = Object.fromEntries((data ?? []).map((row) => [row.product_id, row.quantity]));
  renderCart();
}
async function loadOrders() {
  const { data, error } = await supabase.from('orders')
    .select('order_code,payment_method,payment_status,total_amount,created_at')
    .eq('user_id', state.user.id).order('created_at', { ascending: false }).limit(8);
  if (error) throw error;
  if (!data?.length) {
    $('ordersList').innerHTML = '<p class="muted">Belum ada pesanan. Pesanan yang dibuat dari akun ini akan muncul di sini.</p>';
    return;
  }
  const labels = { bank_va: 'Transfer Bank / Virtual Account', qris: 'QRIS', ewallet: 'E-wallet' };
  $('ordersList').innerHTML = data.map((order) => `
    <article class="order-row"><div><strong>${safeText(order.order_code)}</strong><small>${safeText(labels[order.payment_method] ?? order.payment_method)} · ${new Date(order.created_at).toLocaleString('id-ID')}</small><small>${formatIDR(order.total_amount)}</small></div><span class="order-status">${safeText(order.payment_status === 'simulated_pending' ? 'Menunggu (demo)' : order.payment_status)}</span></article>`).join('');
}
function openCart() { $('scrim').classList.add('open'); $('cartDrawer').classList.add('open'); $('cartDrawer').setAttribute('aria-hidden', 'false'); }
function closeCart() { $('scrim').classList.remove('open'); $('cartDrawer').classList.remove('open'); $('cartDrawer').setAttribute('aria-hidden', 'true'); }
function openCheckout() {
  if (!calculateTotals().count || state.busy) return;
  closeCart();
  $('checkoutForm').hidden = false;
  $('orderResult').hidden = true;
  $('checkoutTotal').textContent = formatIDR(calculateTotals().total);
  $('checkoutModal').hidden = false;
}
function closeCheckout() { $('checkoutModal').hidden = true; }
async function placeOrder(event) {
  event.preventDefault();
  if (state.busy) return;
  const totals = calculateTotals();
  if (!totals.count) { toast('Keranjang masih kosong.'); return; }
  const form = new FormData(event.currentTarget);
  const buyerName = String(form.get('buyerName') ?? '').trim();
  const buyerPhone = String(form.get('buyerPhone') ?? '').trim();
  const buyerAddress = String(form.get('buyerAddress') ?? '').trim();
  const paymentMethod = String(form.get('paymentMethod') ?? 'bank_va');
  const orderCode = `NP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const snapshot = totals.lines.map(({ product, quantity }) => ({
    product_id: product.id, name: product.name, quantity, unit_price: product.price, line_total: product.price * quantity
  }));
  const button = $('placeOrderButton');
  state.busy = true;
  button.disabled = true;
  button.textContent = 'Menyimpan pesanan…';
  try {
    const { error } = await supabase.from('orders').insert({
      order_code: orderCode, user_id: state.user.id, buyer_name: buyerName,
      buyer_phone: buyerPhone, buyer_address: buyerAddress,
      payment_method: paymentMethod, payment_status: 'simulated_pending',
      total_amount: totals.total, items: snapshot
    });
    if (error) throw error;
    const { error: clearError } = await supabase.from('cart_items').delete().eq('user_id', state.user.id);
    if (clearError) console.warn('Pesanan tersimpan, tetapi keranjang belum dibersihkan:', clearError);
    state.cart = {};
    renderCart();
    const paymentLabels = { bank_va: 'Transfer Bank / Virtual Account', qris: 'QRIS', ewallet: 'E-wallet' };
    $('orderCode').textContent = orderCode;
    $('orderResultText').textContent = `Pesanan ${formatIDR(totals.total)} dicatat dengan metode ${paymentLabels[paymentMethod]}. Status pembayaran: simulasi menunggu. Tidak ada transaksi uang sungguhan.`;
    $('checkoutForm').hidden = true;
    $('orderResult').hidden = false;
    await loadOrders();
  } catch (error) {
    console.error(error);
    toast('Pesanan gagal disimpan. Pastikan SQL marketplace sudah dijalankan dan RLS aktif.');
  } finally {
    state.busy = false;
    button.disabled = false;
    button.textContent = 'Buat pesanan simulasi';
  }
}
async function start() {
  if (!supabase) {
    setNotice('Konfigurasi Supabase belum diisi. Isi assets/supabase-config.js terlebih dahulu.', true);
    return;
  }
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    window.location.replace('./index.html');
    return;
  }
  state.user = session.user;
  const { data: profile, error: profileError } = await supabase.from('profiles')
    .select('id,email,display_name,role').eq('id', session.user.id).maybeSingle();
  if (profileError || !profile) {
    setNotice('Profil akun tidak dapat dibaca. Silakan kembali ke halaman login atau periksa kebijakan RLS.', true);
    return;
  }
  state.profile = profile;
  $('accountName').textContent = profile.display_name || session.user.email;
  $('adminShortcut').hidden = profile.role !== 'admin';
  hideNotice();
  $('storeContent').hidden = false;
  try {
    await Promise.all([loadCart(), loadOrders()]);
  } catch (error) {
    console.error(error);
    setNotice('Katalog tampil, tetapi data keranjang atau pesanan belum dapat dimuat. Jalankan supabase/marketplace-schema.sql di SQL Editor.', true);
  }
}

$('categoryRow').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  renderCategories();
  renderProducts();
});
$('searchInput').addEventListener('input', (event) => { state.search = event.target.value; renderProducts(); });
$('sortSelect').addEventListener('change', (event) => { state.sort = event.target.value; renderProducts(); });
$('productGrid').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const id = Number(button.dataset.add);
  await saveCartQuantity(id, (state.cart[id] ?? 0) + 1);
  toast('Produk ditambahkan ke keranjang.');
});
$('cartList').addEventListener('click', async (event) => {
  const quantityButton = event.target.closest('[data-quantity]');
  const removeButton = event.target.closest('[data-remove]');
  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    await saveCartQuantity(id, (state.cart[id] ?? 0) + Number(quantityButton.dataset.delta));
  }
  if (removeButton) await saveCartQuantity(Number(removeButton.dataset.remove), 0);
});
$('openCart').addEventListener('click', openCart);
$('closeCart').addEventListener('click', closeCart);
$('scrim').addEventListener('click', closeCart);
$('checkoutButton').addEventListener('click', openCheckout);
$('closeCheckout').addEventListener('click', closeCheckout);
$('checkoutModal').addEventListener('click', (event) => { if (event.target === $('checkoutModal')) closeCheckout(); });
$('checkoutForm').addEventListener('submit', placeOrder);
$('doneOrderButton').addEventListener('click', () => { closeCheckout(); $('checkoutForm').reset(); toast('Terima kasih sudah mencoba NineProjects Market.'); });
$('browseButton').addEventListener('click', () => $('catalogSection').scrollIntoView({ behavior: 'smooth' }));
$('logoutButton').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) { toast('Gagal keluar. Coba lagi.'); return; }
  window.location.replace('./index.html');
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeCheckout(); } });
renderCategories();
renderProducts();
renderCart();
start().catch((error) => { console.error(error); setNotice('Terjadi kesalahan saat memuat marketplace.', true); });

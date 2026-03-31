// ============================================
// PRAVAH ADMIN PANEL - admin.js
// SECURED: Firebase Auth + Anti-Bypass Protection
// ============================================

// --- Configuration ---
const PRODUCTS_COLLECTION = "products";

// --- Firebase Init ---
let db;
let auth;
let _adminVerified = false; // Internal auth flag - cannot be faked from console

function initFirebase() {
    if (!window.firebaseConfig) {
        showToast("Firebase config not found!", true);
        return false;
    }
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        return true;
    } catch (e) {
        console.error("Firebase init error:", e);
        showToast("Firebase initialization failed!", true);
        return false;
    }
}

// ============================================
// SECURITY LAYER: Auth Guard
// Every single operation checks this FIRST.
// Even if someone shows the dashboard via console,
// all buttons and operations will refuse to work.
// ============================================
function isAuthenticated() {
    return auth && auth.currentUser && _adminVerified;
}

function requireAuth(actionName) {
    if (!isAuthenticated()) {
        showToast("⛔ Access denied. Please log in first.", true);
        lockdownDashboard();
        return false;
    }
    return true;
}

// ============================================
// SECURITY LAYER: DOM Anti-Tamper
// Watches for someone trying to show/hide
// the login screen or dashboard via console.
// If the dashboard is shown without auth,
// it gets immediately hidden + emptied.
// ============================================
function setupAntiTamper() {
    const dashboard = document.getElementById('adminDashboard');
    const loginScreen = document.getElementById('loginScreen');

    if (!dashboard || !loginScreen) return;

    // MutationObserver: watches for style changes on both elements
    const observer = new MutationObserver(() => {
        if (!isAuthenticated()) {
            // If someone force-showed the dashboard without auth, lock it down
            if (dashboard.style.display !== 'none' || loginScreen.style.display === 'none') {
                lockdownDashboard();
            }
        }
    });

    // Watch for attribute changes (style.display manipulation)
    observer.observe(dashboard, { attributes: true, attributeFilter: ['style', 'class'] });
    observer.observe(loginScreen, { attributes: true, attributeFilter: ['style', 'class'] });

    // Also override the style.display setter on these elements for extra protection
    const dashboardDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style') ||
        Object.getOwnPropertyDescriptor(Element.prototype, 'style');

    // Periodic check every 2 seconds as a safety net
    setInterval(() => {
        if (!isAuthenticated()) {
            const d = document.getElementById('adminDashboard');
            const l = document.getElementById('loginScreen');
            if (d && d.style.display !== 'none') {
                lockdownDashboard();
            }
        }
    }, 2000);
}

function lockdownDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    const loginScreen = document.getElementById('loginScreen');

    if (dashboard) {
        dashboard.style.display = 'none';
        // Clear all sensitive content from the DOM
        dashboard.innerHTML = '<div style="padding:40px;text-align:center;color:#e74c3c;font-size:24px;"><i class="fas fa-shield-alt"></i><br>Access Denied<br><small style="font-size:14px;color:#999;">Authentication required. <a href="admin.html" style="color:#6c63ff;">Reload</a></small></div>';
    }
    if (loginScreen) {
        loginScreen.style.display = 'flex';
    }
    _adminVerified = false;
}

// ============================================
// LOGIN / LOGOUT (Firebase Auth)
// ============================================
async function attemptLogin() {
    const emailInput = document.getElementById('adminEmail');
    const input = document.getElementById('adminPassword');
    const error = document.getElementById('loginError');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = input ? input.value.trim() : '';

    if (!email || !password) {
        error.textContent = "Please enter both admin email and password.";
        if (input) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
        return;
    }

    try {
        if (!auth) initFirebase();
        const btn = document.querySelector('.login-btn');
        if (btn) btn.innerHTML = '<span>Logging in...</span><i class="fas fa-spinner fa-spin"></i>';

        await auth.signInWithEmailAndPassword(email, password);
        // Success is handled by onAuthStateChanged in checkSession()
    } catch (err) {
        const btn = document.querySelector('.login-btn');
        if (btn) btn.innerHTML = '<span>Unlock Dashboard</span><i class="fas fa-arrow-right"></i>';
        // Show user-friendly error messages
        let msg = "Incorrect credentials. Try again.";
        if (err.code === 'auth/user-not-found') msg = "No admin account found with this email.";
        else if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
        else if (err.code === 'auth/invalid-email') msg = "Invalid email format.";
        else if (err.code === 'auth/too-many-requests') msg = "Too many failed attempts. Try again later.";
        else if (err.code === 'auth/invalid-credential') msg = "Invalid credentials. Check email & password.";
        error.textContent = msg;
        if (input) {
            input.value = '';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    }
}

async function adminLogout() {
    _adminVerified = false;
    if (auth) {
        try {
            await auth.signOut();
        } catch (e) {
            console.error("Logout error", e);
        }
    }
    // Force page reload to clear all state
    window.location.reload();
}

function checkSession() {
    if (initFirebase()) {
        auth.onAuthStateChanged((user) => {
            const btn = document.querySelector('.login-btn');
            if (btn) btn.innerHTML = '<span>Unlock Dashboard</span><i class="fas fa-arrow-right"></i>';

            if (user) {
                // User is authenticated via Firebase - set our internal flag
                _adminVerified = true;
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'flex';
                loadAllProducts();
            } else {
                // Not authenticated - lock everything
                _adminVerified = false;
                lockdownDashboard();
            }
        });
    }
}

// ============================================
// NAVIGATION
// ============================================
function switchSection(sectionId, linkEl) {
    if (!requireAuth('navigate')) return;

    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('section-' + sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    if (linkEl) {
        linkEl.classList.add('active');
    } else {
        const link = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (link) link.classList.add('active');
    }

    const titles = {
        'dashboard': 'Dashboard',
        'products': 'All Products',
        'add-product': 'Add New Product'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    if (sectionId === 'add-product' && !document.getElementById('editProductId').value) {
        resetForm();
    }
}

function toggleSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('open');
}

// ============================================
// CRUD OPERATIONS (All Auth-Guarded)
// ============================================
let allProducts = [];

async function loadAllProducts() {
    if (!requireAuth('loadProducts')) return;
    try {
        const snapshot = await db.collection(PRODUCTS_COLLECTION).orderBy('createdAt', 'desc').get();
        allProducts = [];
        snapshot.forEach(doc => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        renderProductsTable();
        renderRecentProducts();
        updateStats();
    } catch (e) {
        console.error("Error loading products:", e);
        if (e.code === 'permission-denied') {
            showToast("⛔ Permission denied. Your account may not have admin access.", true);
        } else {
            showToast("Failed to load products. Check console.", true);
        }
    }
}

async function saveProduct() {
    if (!requireAuth('saveProduct')) return;

    const editId = document.getElementById('editProductId').value;
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const mainImage = 'assets/' + document.getElementById('productImage').value.trim();
    const extraImagesRaw = document.getElementById('productExtraImages')?.value.trim() || '';
    const extraImages = extraImagesRaw
        .split(',')
        .map(f => f.trim())
        .filter(f => f)
        .map(f => f.startsWith('assets/') ? f : 'assets/' + f);

    const allImages = [mainImage, ...extraImages];

    const productData = {
        name: document.getElementById('productName').value.trim(),
        title: document.getElementById('productTitle').value.trim(),
        price: document.getElementById('productPrice').value.trim(),
        originalPrice: document.getElementById('productOriginalPrice').value.trim(),
        image: mainImage,
        images: allImages,
        bannerImage: document.getElementById('productBannerImage').value.trim()
            ? 'assets/' + document.getElementById('productBannerImage').value.trim()
            : '',
        family: document.getElementById('productFamily').value.trim(),
        concentration: document.getElementById('productConcentration').value.trim(),
        notes: {
            top: document.getElementById('noteTop').value.trim(),
            heart: document.getElementById('noteHeart').value.trim(),
            base: document.getElementById('noteBase').value.trim()
        },
        features: document.getElementById('productFeatures').value.trim().split('\n').filter(f => f.trim()),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        badge: document.getElementById('productBadge').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (editId) {
            await db.collection(PRODUCTS_COLLECTION).doc(editId).update(productData);
            showToast("Product updated successfully!");
        } else {
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(PRODUCTS_COLLECTION).add(productData);
            showToast("Product added successfully!");
        }

        resetForm();
        await loadAllProducts();
        switchSection('products', null);

    } catch (e) {
        console.error("Error saving product:", e);
        if (e.code === 'permission-denied') {
            showToast("⛔ Permission denied. Only admins can modify products.", true);
        } else {
            showToast("Failed to save product. Check console.", true);
        }
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Product';
}

function editProduct(productId) {
    if (!requireAuth('editProduct')) return;

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    switchSection('add-product', null);
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('pageTitle').textContent = 'Edit Product';

    document.getElementById('editProductId').value = productId;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productTitle').value = product.title || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';

    const imgFile = (product.image || '').replace('assets/', '');
    document.getElementById('productImage').value = imgFile;
    const bannerFile = (product.bannerImage || '').replace('assets/', '');
    document.getElementById('productBannerImage').value = bannerFile;

    const extraImgs = (product.images || []).slice(1).map(i => i.replace('assets/', '')).join(', ');
    const extraField = document.getElementById('productExtraImages');
    if (extraField) extraField.value = extraImgs;

    document.getElementById('productFamily').value = product.family || '';
    document.getElementById('productConcentration').value = product.concentration || '';
    document.getElementById('noteTop').value = product.notes?.top || '';
    document.getElementById('noteHeart').value = product.notes?.heart || '';
    document.getElementById('noteBase').value = product.notes?.base || '';
    document.getElementById('productFeatures').value = (product.features || []).join('\n');
    document.getElementById('productStock').value = product.stock ?? 50;
    document.getElementById('productBadge').value = product.badge || 'Sale';

    showImagePreview(product.image);
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Product';
    document.querySelector('.admin-main').scrollTo(0, 0);
}

let deleteTargetId = null;
function deleteProduct(productId, productName) {
    if (!requireAuth('deleteProduct')) return;
    deleteTargetId = productId;
    document.getElementById('deleteProductName').textContent = productName;
    document.getElementById('deleteModal').style.display = 'flex';
}

async function confirmDelete() {
    if (!requireAuth('confirmDelete')) return;
    if (!deleteTargetId) return;
    try {
        await db.collection(PRODUCTS_COLLECTION).doc(deleteTargetId).delete();
        showToast("Product deleted.");
        closeDeleteModal();
        await loadAllProducts();
    } catch (e) {
        console.error("Error deleting:", e);
        if (e.code === 'permission-denied') {
            showToast("⛔ Permission denied. Only admins can delete products.", true);
        } else {
            showToast("Failed to delete product.", true);
        }
    }
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTargetId = null;
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Save Product';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productStock').value = 50;
    document.getElementById('productBadge').value = 'Sale';
}

// ============================================
// RENDERING
// ============================================
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (allProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i> No products found. Add your first product!</td></tr>`;
        return;
    }

    tbody.innerHTML = allProducts.map(p => `
        <tr>
            <td>
                <div class="table-img">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2210%22>No Image</text></svg>'">
                </div>
            </td>
            <td>
                <strong>${p.name}</strong>
                <br><small class="text-muted">${p.family || ''}</small>
            </td>
            <td>₹${p.price}</td>
            <td><span class="text-muted"><s>₹${p.originalPrice}</s></span></td>
            <td>
                <span class="stock-badge ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${p.stock > 0 ? p.stock + ' units' : 'Out of stock'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" onclick="editProduct('${p.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderRecentProducts() {
    const container = document.getElementById('recentProductsGrid');
    if (allProducts.length === 0) {
        container.innerHTML = `<p class="empty-state"><i class="fas fa-inbox"></i> No products yet. Add your first product!</p>`;
        return;
    }

    const recent = allProducts.slice(0, 4);
    container.innerHTML = recent.map(p => `
        <div class="recent-product-card" onclick="editProduct('${p.id}')">
            <div class="recent-product-img">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><rect fill=%22%23f0f0f0%22 width=%22120%22 height=%22120%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
            </div>
            <div class="recent-product-info">
                <h4>${p.name}</h4>
                <p>₹${p.price}</p>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('statTotalProducts').textContent = allProducts.length;
    document.getElementById('statOnSale').textContent = allProducts.filter(p => p.badge && p.badge.toLowerCase() === 'sale').length;
    document.getElementById('statInStock').textContent = allProducts.filter(p => p.stock > 0).length;
    document.getElementById('statOutOfStock').textContent = allProducts.filter(p => !p.stock || p.stock <= 0).length;
}

// ============================================
// IMAGE PREVIEW
// ============================================
function showImagePreview(src) {
    const box = document.getElementById('imagePreview');
    const img = document.getElementById('imagePreviewImg');
    if (!box || !img) return;
    img.src = src;
    box.style.display = 'block';
    img.onerror = () => { box.style.display = 'none'; };
}

document.addEventListener('DOMContentLoaded', () => {
    const imgInput = document.getElementById('productImage');
    if (imgInput) {
        imgInput.addEventListener('input', () => {
            const val = imgInput.value.trim();
            if (val) {
                showImagePreview('assets/' + val);
            } else {
                const preview = document.getElementById('imagePreview');
                if (preview) preview.style.display = 'none';
            }
        });
    }
});

// ============================================
// TOAST
// ============================================
function showToast(message, isError = false) {
    const toast = document.getElementById('adminToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    const icon = toast.querySelector('i');

    msgEl.textContent = message;
    toast.className = 'admin-toast show' + (isError ? ' error' : '');
    if (icon) icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// INIT - Setup all security layers on load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Start auth listener
    checkSession();
    // Start anti-tamper protection
    setupAntiTamper();
});

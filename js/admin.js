// ============================================
// PRAVAH ADMIN PANEL - admin.js
// ============================================

// --- Configuration ---
const ADMIN_PASSWORD = "pravah2024";
const PRODUCTS_COLLECTION = "products";

// --- Firebase Init ---
let db;
function initFirebase() {
    if (!window.firebaseConfig) {
        showToast("Firebase config not found!", true);
        return false;
    }
    try {
        // Initialize only if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        db = firebase.firestore();
        return true;
    } catch (e) {
        console.error("Firebase init error:", e);
        showToast("Firebase initialization failed!", true);
        return false;
    }
}

// --- Login / Logout ---
function attemptLogin() {
    const input = document.getElementById('adminPassword');
    const error = document.getElementById('loginError');
    const password = input.value.trim();

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('pravah_admin', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        if (initFirebase()) {
            loadAllProducts();
        }
    } else {
        error.textContent = "Incorrect password. Try again.";
        input.value = '';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
}

function adminLogout() {
    sessionStorage.removeItem('pravah_admin');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

function checkSession() {
    if (sessionStorage.getItem('pravah_admin') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        if (initFirebase()) {
            loadAllProducts();
        }
    }
}

// --- Navigation ---
function switchSection(sectionId, linkEl) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    // Show selected
    const target = document.getElementById('section-' + sectionId);
    if (target) target.style.display = 'block';

    // Update active link
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    if (linkEl) {
        linkEl.classList.add('active');
    } else {
        // Find the link by data-section
        const link = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
        if (link) link.classList.add('active');
    }

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'All Products',
        'add-product': 'Add New Product'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Reset form if switching to add-product
    if (sectionId === 'add-product' && !document.getElementById('editProductId').value) {
        resetForm();
    }
}

function toggleSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('open');
}

// --- CRUD Operations ---
let allProducts = [];

async function loadAllProducts() {
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
        showToast("Failed to load products. Check console.", true);
    }
}

async function saveProduct() {
    const editId = document.getElementById('editProductId').value;
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    // Gather form data
    const mainImage = 'assets/' + document.getElementById('productImage').value.trim();
    const extraImagesRaw = document.getElementById('productExtraImages')?.value.trim() || '';
    const extraImages = extraImagesRaw
        .split(',')
        .map(f => f.trim())
        .filter(f => f)
        .map(f => f.startsWith('assets/') ? f : 'assets/' + f);

    // Build images array: main image first, then extras
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
            // Update existing
            await db.collection(PRODUCTS_COLLECTION).doc(editId).update(productData);
            showToast("Product updated successfully!");
        } else {
            // Add new
            productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(PRODUCTS_COLLECTION).add(productData);
            showToast("Product added successfully!");
        }

        resetForm();
        await loadAllProducts();
        switchSection('products', null);

    } catch (e) {
        console.error("Error saving product:", e);
        showToast("Failed to save product. Check console.", true);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Product';
}

function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Switch to form
    switchSection('add-product', null);
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('pageTitle').textContent = 'Edit Product';

    // Fill form
    document.getElementById('editProductId').value = productId;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productTitle').value = product.title || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';

    // Remove 'assets/' prefix for display
    const imgFile = (product.image || '').replace('assets/', '');
    document.getElementById('productImage').value = imgFile;
    const bannerFile = (product.bannerImage || '').replace('assets/', '');
    document.getElementById('productBannerImage').value = bannerFile;

    // Extra images (skip the first which is the main image)
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

    // Show preview
    showImagePreview(product.image);

    // Update submit button text
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Product';

    // Scroll to top
    document.querySelector('.admin-main').scrollTo(0, 0);
}

let deleteTargetId = null;
function deleteProduct(productId, productName) {
    deleteTargetId = productId;
    document.getElementById('deleteProductName').textContent = productName;
    document.getElementById('deleteModal').style.display = 'flex';
}

async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
        await db.collection(PRODUCTS_COLLECTION).doc(deleteTargetId).delete();
        showToast("Product deleted.");
        closeDeleteModal();
        await loadAllProducts();
    } catch (e) {
        console.error("Error deleting:", e);
        showToast("Failed to delete product.", true);
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

// --- Rendering ---
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

// --- Image Preview ---
function showImagePreview(src) {
    const box = document.getElementById('imagePreview');
    const img = document.getElementById('imagePreviewImg');
    img.src = src;
    box.style.display = 'block';
    img.onerror = () => { box.style.display = 'none'; };
}

// Live preview on filename change
document.addEventListener('DOMContentLoaded', () => {
    const imgInput = document.getElementById('productImage');
    if (imgInput) {
        imgInput.addEventListener('input', () => {
            const val = imgInput.value.trim();
            if (val) {
                showImagePreview('assets/' + val);
            } else {
                document.getElementById('imagePreview').style.display = 'none';
            }
        });
    }
});

// --- Toast ---
function showToast(message, isError = false) {
    const toast = document.getElementById('adminToast');
    const msgEl = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    msgEl.textContent = message;
    toast.className = 'admin-toast show' + (isError ? ' error' : '');
    icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

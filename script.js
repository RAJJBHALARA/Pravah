// Product Database - Fallback (used if Firestore is unavailable)
const productsDB = {
    'Blush Hour': {
        title: "Blush Hour | Floral Grace",
        price: "745.00",
        originalPrice: "999.00",
        image: "assets/blush catalogue.jpeg",
        images: ["assets/blush catalogue.jpeg", "assets/blush catalogue2.jpeg"],
        badge: "Sale",
        family: "Floral • Soft • Powdery",
        concentration: "Eau de Parfum (25%)",
        notes: {
            top: "Bergamot, Pear, Pink Pepper",
            heart: "Peony, Rose, Jasmine",
            base: "White Musk, Vanilla, Sandalwood"
        },
        features: [
            "A soft, romantic fragrance perfect for daily wear.",
            "Inspired by the first flush of love.",
            "Long-lasting floral sillage that isn't overpowering.",
            "Hand-crafted for elegance and grace."
        ]
    },
    'Bare Accord': {
        title: "Bare Accord | Skin Scent",
        price: "745.00",
        originalPrice: "999.00",
        image: "assets/bare cata.png",
        images: ["assets/bare cata.png", "assets/bare catalogue 2.png"],
        badge: "Sale",
        family: "Musk • Clean • Elemental",
        concentration: "Extrait de Parfum (30%)",
        notes: {
            top: "Ambrette Seeds, Sea Salt",
            heart: "Iris, Orris Root",
            base: "Iso E Super, Ambroxan, Skin Musk"
        },
        features: [
            "Your skin, but better. A scent that whispers.",
            "Reacts with your body heat to create a unique aura.",
            "Clean, minimalistic, and undeniably sexy.",
            "Perfect for layering or wearing alone."
        ]
    },
    'Clear Theory': {
        title: "Clear Theory | Modern Mind",
        price: "745.00",
        originalPrice: "999.00",
        image: "assets/clear catalogue.jpeg",
        images: ["assets/clear catalogue.jpeg", "assets/clear catalogue2.png"],
        badge: "Sale",
        family: "Fresh • Citrus • Intellectual",
        concentration: "Eau de Parfum (20%)",
        notes: {
            top: "Lime, Mint, Juniper Berries",
            heart: "Ginger, Vetiver",
            base: "Cedarwood, Patchouli"
        },
        features: [
            "Sharp, crisp, and designed for focus.",
            "A modern scent for the thinking individual.",
            "Cuts through the heat with icy freshness.",
            "Leaves a trail of sophisticated greenery."
        ]
    },
    'Golden Resin': {
        title: "Golden Resin | Amber Warmth",
        price: "745.00",
        originalPrice: "999.00",
        image: "assets/golden catalogue.jpeg",
        images: ["assets/golden catalogue.jpeg", "assets/golden catalogue2.jpeg"],
        badge: "Sale",
        family: "Oriental • Amber • Spicy",
        concentration: "Extrait de Parfum (35%)",
        notes: {
            top: "Cinnamon, Cardamom",
            heart: "Labdanum, Benzoin",
            base: "Vanilla Bean, Oud, Liquid Amber"
        },
        features: [
            "Luxuriously deep and undeniably warm.",
            "Envelops you in a golden aura of resinous comfort.",
            "Ideal for evening wear and special occasions.",
            "Rich complexity that evolves over hours."
        ]
    },
    'Too Late': {
        title: "Too Late Tonight | Intoxicating",
        price: "745.00",
        originalPrice: "999.00",
        image: "assets/too catalogue.jpeg",
        images: ["assets/too catalogue.jpeg", "assets/too catalogue2.jpeg"],
        badge: "Sale",
        family: "Gourmand • Dark • Seductive",
        concentration: "Extrait de Parfum (40%)",
        notes: {
            top: "Bitter Almond, Rum",
            heart: "Black Cherry, Turkish Rose",
            base: "Tonka Bean, Vetiver, Dark Chocolate"
        },
        features: [
            "Daring, bold, and strictly for the night.",
            "An intoxicating blend that demands attention.",
            "Sweet yet dark, with a dangerous edge.",
            "Unforgettable longevity."
        ]
    }
};

// WhatsApp Shop Logic
function buyOnWhatsApp(productName, price) {
    const phoneNumber = "919909462263";
    const message = `Hello, I would like to order the *${productName}* priced at ₹${price}. Please let me know the payment details.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Carousel Logic
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let slideInterval;

function showSlide(n) {
    if (!slides.length) return;
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }
}

function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

function currentSlide(n) {
    slideIndex = n;
    showSlide(slideIndex);
    resetInterval();
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

if (slides.length > 0) {
    resetInterval();
}

// ============================================
// FIRESTORE INTEGRATION
// ============================================

let firestoreDB = null;
let firebaseAuth = null;

function initFirestoreForStorefront() {
    try {
        if (typeof firebase !== 'undefined' && window.firebaseConfig) {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }
            firestoreDB = firebase.firestore();
            if (firebase.auth) {
                firebaseAuth = firebase.auth();
            }
            return true;
        }
    } catch (e) {
        console.warn("Firestore not available, using fallback data:", e);
    }
    return false;
}

// --- Homepage: Render product grid dynamically ---
async function loadHomepageProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let products = [];

    if (initFirestoreForStorefront()) {
        try {
            const snapshot = await firestoreDB.collection('products').get();
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.warn("Firestore fetch failed, using fallback:", e);
        }
    }

    // Fallback to hardcoded data
    if (products.length === 0) {
        products = Object.keys(productsDB).map(key => ({
            id: key,
            name: key,
            ...productsDB[key]
        }));
    }

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; color:#999; grid-column: 1/-1; padding: 2rem;">No products available yet.</p>';
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="goToProduct('${(p.id || '').replace(/'/g, "\\'")}')">
            <div class="product-image-container">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <img src="${p.image}" alt="${p.name || p.title}" onerror="this.style.display='none'">
            </div>
            <div class="product-info">
                <p class="product-vendor">PRAVAH</p>
                <h3 class="product-name">${p.name || p.title}</h3>
                <div class="product-price-container">
                    <span class="price-original">Rs. ${p.originalPrice}</span>
                    <span class="price-current">Rs. ${p.price}</span>
                </div>
            </div>
            <div class="btn-buy-container">
                <button class="btn-buy" onclick="event.stopPropagation(); buyOnWhatsApp('${(p.name || '').replace(/'/g, "\\'")}', '${p.price}')">Buy Now</button>
            </div>
        </div>
    `).join('');
}

// --- Product Page: Load from Firestore ---
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        console.log("No product ID found.");
        return;
    }

    let product = null;

    if (initFirestoreForStorefront()) {
        try {
            const doc = await firestoreDB.collection('products').doc(productId).get();
            if (doc.exists) {
                product = doc.data();
            } else {
                const snapshot = await firestoreDB.collection('products')
                    .where('name', '==', productId).limit(1).get();
                if (!snapshot.empty) {
                    product = snapshot.docs[0].data();
                }
            }
        } catch (e) {
            console.warn("Firestore product fetch failed:", e);
        }
    }

    // Fallback to hardcoded
    if (!product && productsDB[productId]) {
        product = productsDB[productId];
    }

    if (!product) {
        console.log("Product not found:", productId);
        return;
    }

    document.getElementById('product-title').innerText = product.title;
    document.getElementById('breadcrumb-current').innerText = (product.title || '').split('|')[0].trim();
    document.title = `${product.title} | Pravah`;

    // Build images list for gallery
    let productImages = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        productImages = product.images;
    } else if (product.image) {
        productImages = [product.image];
    }

    // Set main image and init gallery
    const mainImg = document.getElementById('main-image');
    mainImg.src = productImages[0] || '';
    mainImg.alt = product.title;
    mainImg.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    initGallery(productImages);

    document.getElementById('price-current').innerText = `Rs. ${product.price}`;
    document.getElementById('price-original').innerText = `Rs. ${product.originalPrice}`;

    document.getElementById('meta-family').innerText = product.family || '';

    if (product.notes) {
        document.getElementById('note-top').innerText = product.notes.top || '';
        document.getElementById('note-heart').innerText = product.notes.heart || '';
        document.getElementById('note-base').innerText = product.notes.base || '';
    }

    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = "";
    if (product.features) {
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerText = feature;
            featuresList.appendChild(li);
        });
    }

    document.getElementById('btn-buy-it-now').onclick = function () {
        const qty = document.getElementById('qty-input').value;
        const phoneNumber = "919909462263";
        const message = `Hello Pravah, I would like to buy *${product.title}* (Qty: ${qty}). Please share payment details.`;
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const floatBtn = document.getElementById('whatsapp-float-btn');
    if (floatBtn) {
        floatBtn.onclick = function () {
            const message = `Hi, I have a question about ${product.title}...`;
            window.open(`https://wa.me/919909462263?text=${encodeURIComponent(message)}`, '_blank');
            return false;
        }
    }
}

function adjustQty(amount) {
    const input = document.getElementById('qty-input');
    let current = parseInt(input.value);
    current += amount;
    if (current < 1) current = 1;
    input.value = current;
}

function goToProduct(id) {
    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
}

function shareProduct() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// ============================================
// PRODUCT IMAGE GALLERY
// ============================================
let galleryImages = [];
let galleryIndex = 0;

function initGallery(images) {
    galleryImages = images || [];
    galleryIndex = 0;

    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const counter = document.getElementById('image-counter');
    const thumbStrip = document.getElementById('thumbnail-strip');

    if (galleryImages.length <= 1) {
        // Single image — hide gallery controls
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (counter) counter.style.display = 'none';
        if (thumbStrip) thumbStrip.style.display = 'none';
        return;
    }

    // Show controls
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (counter) {
        counter.style.display = '';
        counter.textContent = `1 / ${galleryImages.length}`;
    }

    // Build thumbnails
    if (thumbStrip) {
        thumbStrip.innerHTML = galleryImages.map((img, i) => `
            <div class="thumb ${i === 0 ? 'active' : ''}" onclick="setGalleryImage(${i})">
                <img src="${img}" alt="View ${i + 1}">
            </div>
        `).join('');
        thumbStrip.style.display = 'flex';
    }
}

function setGalleryImage(index) {
    if (index < 0 || index >= galleryImages.length) return;
    galleryIndex = index;

    const mainImg = document.getElementById('main-image');
    if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = galleryImages[galleryIndex];
            mainImg.style.opacity = '1';
        }, 350);
    }

    // Update counter
    const counter = document.getElementById('image-counter');
    if (counter) counter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

    // Update thumbnails
    document.querySelectorAll('.thumbnail-strip .thumb').forEach((t, i) => {
        t.classList.toggle('active', i === galleryIndex);
    });
}

function galleryNext() {
    setGalleryImage((galleryIndex + 1) % galleryImages.length);
}

function galleryPrev() {
    setGalleryImage((galleryIndex - 1 + galleryImages.length) % galleryImages.length);
}

// ============================================
// MOBILE MENU
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const menuOverlay = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenuBtn');
    const menuLinks = document.querySelectorAll('.mobile-menu-links a');

    if (menuBtn && menuOverlay && closeBtn) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeBtn.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Load homepage products dynamically
    loadHomepageProducts();

    // Check auth state
    checkAuthState();
});

// ============================================
// AUTH (Login / Signup) - Optional
// ============================================

function toggleAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    if (modal.style.display === 'none' || !modal.style.display) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function switchAuthTab(tab, btn) {
    document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');

    if (!email || !password) {
        msg.textContent = 'Please fill in both fields.';
        msg.style.color = '#e74c3c';
        return;
    }

    initFirestoreForStorefront();

    if (!firebaseAuth) {
        msg.textContent = 'Auth service not available.';
        msg.style.color = '#e74c3c';
        return;
    }

    try {
        await firebaseAuth.signInWithEmailAndPassword(email, password);
        msg.textContent = 'Welcome back!';
        msg.style.color = '#1abc54';
        updateUserIcon(true);
        setTimeout(() => toggleAuthModal(), 1000);
    } catch (e) {
        msg.textContent = e.message.replace('Firebase: ', '');
        msg.style.color = '#e74c3c';
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const msg = document.getElementById('signupMessage');

    if (!email || !password) {
        msg.textContent = 'Please fill in email and password.';
        msg.style.color = '#e74c3c';
        return;
    }

    if (password.length < 6) {
        msg.textContent = 'Password must be at least 6 characters.';
        msg.style.color = '#e74c3c';
        return;
    }

    initFirestoreForStorefront();

    if (!firebaseAuth) {
        msg.textContent = 'Auth service not available.';
        msg.style.color = '#e74c3c';
        return;
    }

    try {
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        if (name) {
            await userCredential.user.updateProfile({ displayName: name });
        }
        msg.textContent = 'Account created successfully!';
        msg.style.color = '#1abc54';
        updateUserIcon(true);
        setTimeout(() => toggleAuthModal(), 1000);
    } catch (e) {
        msg.textContent = e.message.replace('Firebase: ', '');
        msg.style.color = '#e74c3c';
    }
}

function checkAuthState() {
    initFirestoreForStorefront();
    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged(user => {
            updateUserIcon(!!user);
        });
    }
}

function updateUserIcon(isLoggedIn) {
    const icons = document.querySelectorAll('.nav-icon-link i.fa-user, .nav-icon-link i.fa-user-check');
    icons.forEach(icon => {
        if (isLoggedIn) {
            icon.className = 'fas fa-user-check';
            icon.parentElement.title = 'Logged in';
            icon.parentElement.style.color = '#1abc54';
        } else {
            icon.className = 'far fa-user';
            icon.parentElement.title = 'Login / Sign Up';
            icon.parentElement.style.color = '';
        }
    });
}

// ============================================
// EMAIL SIGNUP
// ============================================

function handleEmailSignup() {
    const input = document.getElementById('emailInput');
    const form = document.getElementById('emailSignup');
    const success = document.getElementById('emailSuccess');

    if (!input || !input.value.trim() || !input.value.includes('@')) {
        input.style.borderColor = '#e74c3c';
        return;
    }

    // Show thank you
    form.style.display = 'none';
    success.style.display = 'block';

    // Save to Firestore
    initFirestoreForStorefront();
    if (firestoreDB) {
        firestoreDB.collection('subscribers').add({
            email: input.value.trim(),
            subscribedAt: new Date().toISOString()
        }).then(() => {
            console.log("Subscriber saved to Firestore!");
        }).catch(e => console.warn("Could not save subscriber:", e));
    }
}

// ============================================
// CONTACT FORM
// ============================================

function handleContactSubmit() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const comment = form.querySelector('[name="comment"]').value.trim();

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    // Initialize Firestore and save contact
    initFirestoreForStorefront();

    if (firestoreDB) {
        firestoreDB.collection('contacts').add({
            name, email, phone, comment,
            sentAt: new Date().toISOString()
        }).then(() => {
            console.log("Contact saved to Firestore!");
        }).catch(e => console.warn("Could not save contact:", e));
    }

    // Also send via WhatsApp
    const phoneNumber = "919909462263";
    const message = `New Contact Message:\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Message:* ${comment}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

    alert('Thank you for contacting us! Your message has been saved.');
    form.reset();
}
// ============================================
// POLISH: Navbar Scroll Shadow
// ============================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');

    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    if (backToTop) {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
});

// ============================================
// Scroll Animation Observer
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    animatedElements.forEach(el => observer.observe(el));

    // Add lazy loading to all images
    document.querySelectorAll('img').forEach(img => {
        if (!img.loading) img.loading = 'lazy';
    });
});

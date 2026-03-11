// ============================================
// AESTHETIC HOLI THEME — Pravah Perfumes
// Interactive & Premium animations
// Auto-expires: March 5, 2026
// ============================================

(function () {
    'use strict';

    const THEME_END = new Date('2026-03-05T23:59:59+05:30');
    if (new Date() > THEME_END) return;

    // ── Activate body class ──
    document.documentElement.classList.add('holi-active');

    // ── BANNER ──────────────────────────────────
    const banner = document.createElement('div');
    banner.className = 'holi-premium-banner';
    banner.innerHTML = `
        <span class="holi-premium-banner-text">
            ✦ Happy Holi — Experience the Colors of Pravah ✦
        </span>
    `;
    document.body.insertBefore(banner, document.body.firstChild);

    // ── AMBIENT GLOW ORBS (Subtle background colors) ──
    const orbs = [
        { top: '10%', left: '-5%', size: 600, color: '#FF1493', dx: '4vw', dy: '-3vh', ds: '1.1', dur: '15s' }, // Pink
        { top: '60%', right: '-5%', size: 500, color: '#8B5CF6', dx: '-5vw', dy: '4vh', ds: '0.9', dur: '18s' }, // Purple
        { top: '80%', left: '10%', size: 450, color: '#FACC15', dx: '3vw', dy: '-2vh', ds: '1.05', dur: '12s' }, // Yellow
        { top: '30%', right: '20%', size: 550, color: '#06B6D4', dx: '-2vw', dy: '5vh', ds: '1.15', dur: '20s' }, // Cyan
    ];

    orbs.forEach(o => {
        const el = document.createElement('div');
        el.className = 'holi-ambient-orb';
        el.style.cssText = `
            width:${o.size}px; height:${o.size}px;
            background:${o.color};
            --dx:${o.dx}; --dy:${o.dy}; --ds:${o.ds};
            animation-duration:${o.dur};
            animation-delay:${(Math.random() * 2).toFixed(1)}s;
            ${o.top ? `top:${o.top};` : ''}
            ${o.left ? `left:${o.left};` : ''}
            ${o.right ? `right:${o.right};` : ''}
        `;
        document.body.appendChild(el);
    });

    // ── INTERACTIVE COLOR BURST (Gulal Explosion on Click) ──
    const holiColors = ['#FF1493', '#8B5CF6', '#06B6D4', '#22C55E', '#FACC15', '#FF6B35'];

    function createBurst(clientX, clientY) {
        const numParticles = Math.floor(Math.random() * 8) + 8; // 8 to 15 particles

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'holi-color-burst';

            const color = holiColors[Math.floor(Math.random() * holiColors.length)];
            const size = Math.random() * 25 + 10; // 10px to 35px

            // Random direction and distance for the explosion
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 120 + 30; // 30px to 150px
            const tx = Math.cos(angle) * distance + 'px';
            const ty = Math.sin(angle) * distance + 'px';

            particle.style.cssText = `
                left: ${clientX}px;
                top: ${clientY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                filter: blur(${Math.random() * 4 + 2}px);
                --tx: ${tx};
                --ty: ${ty};
            `;

            document.body.appendChild(particle);

            // Allow CSS animation to play, then remove
            setTimeout(() => {
                particle.remove();
            }, 800);
        }
    }

    // Add click listener to the whole document
    document.addEventListener('click', (e) => {
        // Prevent bursts when clicking the navbar so it doesn't cover links
        if (!e.target.closest('.navbar')) {
            createBurst(e.clientX, e.clientY);
        }
    });

    console.log('🎨 Premium Holi theme active — expires', THEME_END.toLocaleDateString('en-IN'));
})();

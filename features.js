// ============================================
// PRAVAH — Features Pages JavaScript
// Occasion Guide | Quiz | Layering Guide
// ============================================

// ============================================
// OCCASION GUIDE — Card Toggle
// ============================================

function toggleOccasionCard(card) {
    const allCards = document.querySelectorAll('.occasion-card');
    
    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
    } else {
        allCards.forEach(c => c.classList.remove('expanded'));
        card.classList.add('expanded');
    }
}

// ============================================
// QUIZ LOGIC
// ============================================

const quizData = {
    answers: {},
    currentStep: 0,
    totalSteps: 4,

    // Scoring matrix — each answer maps to perfume scores
    scoring: {
        q1: {
            romantic:   { 'Blush Hour': 3, 'Bare Accord': 1, 'Clear Theory': 0, 'Golden Resin': 1, 'Too Late': 1 },
            bold:       { 'Blush Hour': 0, 'Bare Accord': 1, 'Clear Theory': 1, 'Golden Resin': 2, 'Too Late': 3 },
            fresh:      { 'Blush Hour': 1, 'Bare Accord': 2, 'Clear Theory': 3, 'Golden Resin': 0, 'Too Late': 0 },
            mysterious: { 'Blush Hour': 0, 'Bare Accord': 2, 'Clear Theory': 0, 'Golden Resin': 3, 'Too Late': 2 }
        },
        q2: {
            daily:      { 'Blush Hour': 3, 'Bare Accord': 2, 'Clear Theory': 3, 'Golden Resin': 0, 'Too Late': 0 },
            evening:    { 'Blush Hour': 1, 'Bare Accord': 1, 'Clear Theory': 0, 'Golden Resin': 3, 'Too Late': 2 },
            datenight:  { 'Blush Hour': 2, 'Bare Accord': 2, 'Clear Theory': 0, 'Golden Resin': 1, 'Too Late': 3 },
            special:    { 'Blush Hour': 1, 'Bare Accord': 0, 'Clear Theory': 1, 'Golden Resin': 3, 'Too Late': 2 }
        },
        q3: {
            cozy:       { 'Blush Hour': 1, 'Bare Accord': 1, 'Clear Theory': 0, 'Golden Resin': 3, 'Too Late': 2 },
            clean:      { 'Blush Hour': 1, 'Bare Accord': 3, 'Clear Theory': 3, 'Golden Resin': 0, 'Too Late': 0 },
            dark:       { 'Blush Hour': 0, 'Bare Accord': 1, 'Clear Theory': 0, 'Golden Resin': 2, 'Too Late': 3 },
            floral:     { 'Blush Hour': 3, 'Bare Accord': 1, 'Clear Theory': 1, 'Golden Resin': 0, 'Too Late': 0 }
        },
        q4: {
            allday:     { 'Blush Hour': 1, 'Bare Accord': 1, 'Clear Theory': 1, 'Golden Resin': 3, 'Too Late': 3 },
            moderate:   { 'Blush Hour': 2, 'Bare Accord': 2, 'Clear Theory': 2, 'Golden Resin': 1, 'Too Late': 1 },
            light:      { 'Blush Hour': 3, 'Bare Accord': 3, 'Clear Theory': 2, 'Golden Resin': 0, 'Too Late': 0 }
        }
    },

    perfumeDetails: {
        'Blush Hour': {
            name: 'Blush Hour',
            subtitle: 'Floral Grace',
            family: 'Floral • Soft • Powdery',
            notes: { top: 'Bergamot, Pear, Pink Pepper', heart: 'Peony, Rose, Jasmine', base: 'White Musk, Vanilla, Sandalwood' },
            why: 'A soft, romantic fragrance perfect for your everyday elegance. It wraps you in delicate florals without being overpowering.',
            price: '599.00'
        },
        'Bare Accord': {
            name: 'Bare Accord',
            subtitle: 'Skin Scent',
            family: 'Musk • Clean • Elemental',
            notes: { top: 'Ambrette Seeds, Sea Salt', heart: 'Iris, Orris Root', base: 'Iso E Super, Ambroxan, Skin Musk' },
            why: 'Your skin, but better. This minimalistic scent reacts with your body to create something uniquely you.',
            price: '599.00'
        },
        'Clear Theory': {
            name: 'Clear Theory',
            subtitle: 'Modern Mind',
            family: 'Fresh • Citrus • Intellectual',
            notes: { top: 'Lime, Mint, Juniper Berries', heart: 'Ginger, Vetiver', base: 'Cedarwood, Patchouli' },
            why: 'Sharp, crisp, and designed for focus. A scent that cuts through the noise with icy freshness.',
            price: '599.00'
        },
        'Golden Resin': {
            name: 'Golden Resin',
            subtitle: 'Amber Warmth',
            family: 'Oriental • Amber • Spicy',
            notes: { top: 'Cinnamon, Cardamom', heart: 'Labdanum, Benzoin', base: 'Vanilla Bean, Oud, Liquid Amber' },
            why: 'Luxuriously deep and enveloping. This warm amber scent makes every moment feel like a golden hour.',
            price: '599.00'
        },
        'Too Late': {
            name: 'Too Late Tonight',
            subtitle: 'Intoxicating',
            family: 'Gourmand • Dark • Seductive',
            notes: { top: 'Bitter Almond, Rum', heart: 'Black Cherry, Turkish Rose', base: 'Tonka Bean, Vetiver, Dark Chocolate' },
            why: 'Daring and unapologetically bold. This is the scent that turns heads and starts conversations.',
            price: '599.00'
        }
    }
};

function selectQuizOption(stepEl, value) {
    const question = stepEl.dataset.question;
    const options = stepEl.querySelectorAll('.quiz-option');

    options.forEach(opt => opt.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    quizData.answers[question] = value;

    // Enable next button
    const nextBtn = stepEl.querySelector('.quiz-btn-next');
    if (nextBtn) nextBtn.disabled = false;

    // Auto-advance after brief delay
    setTimeout(() => {
        if (quizData.currentStep < quizData.totalSteps - 1) {
            quizNextStep();
        } else {
            showQuizResult();
        }
    }, 400);
}

function quizNextStep() {
    if (quizData.currentStep >= quizData.totalSteps - 1) {
        showQuizResult();
        return;
    }

    const steps = document.querySelectorAll('.quiz-step');
    const current = steps[quizData.currentStep];

    // Animate out
    current.style.animation = 'quizSlideOut 0.3s forwards';

    setTimeout(() => {
        current.classList.remove('active');
        current.style.animation = '';

        quizData.currentStep++;
        const next = steps[quizData.currentStep];
        next.classList.add('active');

        updateQuizProgress();
    }, 300);
}

function quizPrevStep() {
    if (quizData.currentStep <= 0) return;

    const steps = document.querySelectorAll('.quiz-step');
    const current = steps[quizData.currentStep];

    current.classList.remove('active');
    quizData.currentStep--;
    steps[quizData.currentStep].classList.add('active');
    steps[quizData.currentStep].style.animation = 'quizSlideIn 0.4s forwards';

    updateQuizProgress();
}

function updateQuizProgress() {
    const progressSteps = document.querySelectorAll('.quiz-progress-step');
    progressSteps.forEach((step, i) => {
        step.classList.remove('active', 'completed');
        if (i < quizData.currentStep) step.classList.add('completed');
        if (i === quizData.currentStep) step.classList.add('active');
    });
}

function showQuizResult() {
    // Calculate scores
    const scores = {
        'Blush Hour': 0, 'Bare Accord': 0, 'Clear Theory': 0,
        'Golden Resin': 0, 'Too Late': 0
    };

    for (const [question, answer] of Object.entries(quizData.answers)) {
        const questionScores = quizData.scoring[question]?.[answer];
        if (questionScores) {
            for (const [perfume, score] of Object.entries(questionScores)) {
                scores[perfume] += score;
            }
        }
    }

    // Find winner
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const perfume = quizData.perfumeDetails[winner];

    // Hide all steps
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
    document.querySelector('.quiz-progress').style.display = 'none';

    // Populate result
    const resultEl = document.getElementById('quizResult');
    resultEl.querySelector('.result-perfume-name').textContent = perfume.name;
    resultEl.querySelector('.result-perfume-family').textContent = perfume.family;
    resultEl.querySelector('.result-note-top').textContent = perfume.notes.top;
    resultEl.querySelector('.result-note-heart').textContent = perfume.notes.heart;
    resultEl.querySelector('.result-note-base').textContent = perfume.notes.base;
    resultEl.querySelector('.result-why').textContent = perfume.why;

    // Set buy link
    const buyBtn = resultEl.querySelector('.result-buy-btn');
    const msg = `Hello! The quiz matched me with *${perfume.name}*. I'd like to order it. Please share the details!`;
    buyBtn.href = `https://wa.me/919909462263?text=${encodeURIComponent(msg)}`;

    resultEl.classList.add('active');
}

function retakeQuiz() {
    quizData.answers = {};
    quizData.currentStep = 0;

    document.getElementById('quizResult').classList.remove('active');
    document.querySelector('.quiz-progress').style.display = 'flex';

    document.querySelectorAll('.quiz-step').forEach((s, i) => {
        s.classList.toggle('active', i === 0);
        s.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        const btn = s.querySelector('.quiz-btn-next');
        if (btn) btn.disabled = true;
    });

    updateQuizProgress();
}

// ============================================
// SCROLL ANIMATION OBSERVER (Feature Pages)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const featureAnimated = document.querySelectorAll('[data-feature-animate]');
    if (featureAnimated.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        featureAnimated.forEach(el => observer.observe(el));
    }
});

import { ApiService } from './api.js';

'use strict';

// ===========================================================================
// 1. CONFIGURATION & GLOBAL STATE
// ===========================================================================
const CONFIG = Object.freeze({
    ZOOM: { MIN: 90, MAX: 140, STEP: 10, DEFAULT: 100 },
    SCROLL_THRESHOLD: 300,
    DEBOUNCE_DELAY:   150,
    THROTTLE_DELAY:   150
});

const AppState = {
    currentZoom:             CONFIG.ZOOM.DEFAULT,
    audioActive:             false,
    synth:                   window.speechSynthesis ?? null,
    speechListenersAttached: false
};

// ===========================================================================
// 2. ENTRY POINT (DOM CONTENT LOADED)
// ===========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initBackToTop();
    initAccessibilityTools();

    if (document.getElementById("events-grid")) {
        initHeroVideoControl();
        initFilters();
        loadHomeEvents();
    }

    if (document.getElementById("event-detail-content") || document.getElementById("event-detail-title")) {
        loadDetailEvent();
        initShareButton();
    }
});

function initShareButton() {
    const shareBtn = document.getElementById("btn-share");
    if (!shareBtn) return;

    shareBtn.addEventListener("click", () => {
        const shareData = {
            title: document.title,
            text: document.getElementById("event-detail-description")?.textContent ?? "",
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData)
                .catch(err => console.warn("Share failed or canceled:", err));
        } else {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    const originalText = shareBtn.textContent;
                    shareBtn.textContent = "Lien copié ! ✓";
                    shareBtn.style.backgroundColor = "#10B981";
                    
                    setTimeout(() => {
                        shareBtn.textContent = originalText;
                        shareBtn.style.backgroundColor = "";
                    }, 2000);
                })
                .catch(err => console.error("Could not copy link:", err));
        }
    });
}

// ===========================================================================
// 3. HOME PAGE (GRID LOADING & RENDERING)
// ===========================================================================
async function loadHomeEvents() {
    const grid   = document.getElementById("events-grid");
    const loader = document.getElementById("loader");
    if (!grid) return;

    try {
        const events = await ApiService.getEvents();
        if (!events?.length) {
            grid.innerHTML = `<p class="empty-state">Aucun événement programmé pour le moment.</p>`;
            return;
        }
        renderEventGrid(events, grid);
    } catch (error) {
        console.error("Error loading events:", error);
        if (loader) {
            loader.innerHTML = `<p class="error-state">Impossible de contacter la billetterie. Vérifiez votre connexion et rechargez la page.</p>`;
            loader.style.display = "block";
        }
    } finally {
        if (loader && !loader.querySelector('.error-state')) {
            loader.style.display = "none";
        }
    }
}

function renderEventGrid(events, container) {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    events.forEach(event => fragment.appendChild(buildEventCard(event)));
    container.appendChild(fragment);

    if (AppState.audioActive) {
        attachSpeechListeners();
    }
}

function buildEventCard(event) {
    const starsHTML = buildStarsHTML(event.stars);
    const badgeHTML = event.badgeText ? `<span class="event-tag-badge ${escapeHTML(event.badgeClass)}">${escapeHTML(event.badgeText)}</span>` : "";
    const titleDisplay = event.title.length > 45 ? `${event.title.substring(0, 45)}…` : event.title;
    
    let priceLabel = "Plus de détails ici";
    if (event.price && String(event.price).trim() !== "" && String(event.price) !== "Tarif non communiqué") {
        const cleanPrice = String(event.price).trim();
        const lowerPrice = cleanPrice.toLowerCase();
        
        priceLabel = (
            cleanPrice.includes("€") || 
            lowerPrice.includes("gratuit") || 
            lowerPrice.includes("libre") || 
            lowerPrice.includes("communiqué")
        ) ? cleanPrice : `${cleanPrice} €`;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <a href="fiche-evenement.html?id=${encodeURIComponent(event.id)}"
           class="event-card"
           data-category="${escapeHTML(event.category.toLowerCase())}"
           aria-label="Consulter l'événement : ${escapeHTML(event.title)}">
            <article>
                <div class="event-image">
                    ${badgeHTML}
                    <img src="${escapeHTML(event.imageUrl)}" alt="Affiche de ${escapeHTML(event.title)}" loading="lazy" width="300" height="400">
                </div>
                <div class="event-body">
                    <span class="event-meta">${escapeHTML(event.category)} • ${escapeHTML(event.location)}</span>
                    <h3>${escapeHTML(titleDisplay)}</h3>
                    <div class="event-rating" aria-label="Note : ${event.rating} sur 5">
                        ${starsHTML}
                        <span class="rating-count">(${escapeHTML(event.reviewsCount)})</span>
                    </div>
                    <p>${escapeHTML(event.body.substring(0, 90))}…</p>
                    <div class="event-footer-info">
                        <span class="price-indicator"><strong>${escapeHTML(priceLabel)}</strong></span>
                        <span class="btn-arrow" aria-hidden="true">Réserver →</span>
                    </div>
                </div>
            </article>
        </a>
    `;
    return wrapper.firstElementChild;
}

// ===========================================================================
// 4. FILTERS & SEARCH
// ===========================================================================
function initFilters() {
    const filterButtons   = document.querySelectorAll(".filter-btn");
    const searchForm      = document.getElementById("search-form");
    const searchInput     = document.getElementById("search-input");
    const navCategoryLinks = document.querySelectorAll(".nav-link-item[data-category]");

    const applyFilter = (category) => {
        document.querySelectorAll(".event-card").forEach(card => {
            card.style.display = (category === "all" || card.dataset.category === category) ? "flex" : "none";
        });
    };

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilter(btn.dataset.filter);
        });
    });

    navCategoryLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const btn = document.querySelector(`.filter-btn[data-filter="${link.dataset.category}"]`);
            btn?.click();
        });
    });

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", e => e.preventDefault());
        searchInput.addEventListener("input", debounce(e => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll(".event-card").forEach(card => {
                const title = card.querySelector("h3")?.textContent.toLowerCase() ?? "";
                const desc  = card.querySelector("p")?.textContent.toLowerCase()  ?? "";
                card.style.display = (title.includes(query) || desc.includes(query)) ? "flex" : "none";
            });
        }, CONFIG.DEBOUNCE_DELAY));
    }
}

// ===========================================================================
// 5. DETAIL PAGE (DATA LOADING & DISPLAY)
// ===========================================================================
async function loadDetailEvent() {
    const params  = new URLSearchParams(window.location.search);
    const eventId = params.get("id") || params.get("uid");

    if (!eventId) {
        showDetailError("Aucun identifiant d'événement fourni dans l'URL.");
        return;
    }

    try {
        const event = await ApiService.getEventById(eventId);
        document.title = `${event.title} — VilleNova`;

        const titleEl = document.getElementById("event-detail-title");
        const descEl = document.getElementById("event-detail-description");
        const badgeEl = document.getElementById("event-detail-badge-label");

        if (titleEl) titleEl.textContent = event.title;
        if (descEl) descEl.textContent = event.body;
        if (badgeEl) badgeEl.textContent = event.category;

        const priceEl = document.getElementById("event-detail-price");
        if (priceEl) {
            const price = event.price || "Tarif non communiqué";
            const isKnown = price !== "Tarif non communiqué" && price.trim() !== "";
            
            if (isKnown) {
                const lowerPrice = price.toLowerCase();
                const formatted = (
                    price.includes("€") || 
                    lowerPrice.includes("gratuit") || 
                    lowerPrice.includes("libre") || 
                    lowerPrice.includes("communiqué")
                ) ? price : `${price} €`;
                
                priceEl.textContent = `🎟️ Tarif : ${formatted}`;
                priceEl.style.opacity = "1";
            } else {
                priceEl.textContent = `🎟️ Plus de détails ici`;
                priceEl.style.opacity = "0.75";
            }
        }

        const dateEl = document.getElementById("event-detail-date");
        if (dateEl) {
            const hasDate       = event.dateText && event.dateText !== "Date à venir";
            dateEl.innerHTML    = `📅 ${escapeHTML(event.dateText)}<br><small>📍 ${escapeHTML(event.location)}</small>`;
            dateEl.style.opacity = hasDate ? "1" : "0.55";
        }

        const ratingEl = document.getElementById("event-detail-rating");
        if (ratingEl) {
            ratingEl.innerHTML = `
                ${buildStarsHTML(event.stars)}
                <span class="rating-value">${escapeHTML(event.rating)} / 5</span>
                <span class="rating-reviews">(${escapeHTML(event.reviewsCount)} réservations)</span>
            `;
        }

        const imgEl = document.getElementById("event-detail-img");
        if (imgEl) {
            imgEl.src = event.imageUrl;
            imgEl.alt = `Affiche officielle — ${event.title}`;
        }

        const loader = document.getElementById("loader");
        if (loader) loader.style.display = 'none';

    } catch (error) {
        console.error("Error loading detail view:", error);
        showDetailError("Impossible de récupérer cet événement depuis l'API OpenAgenda ou le stockage de secours.");
    }
}

function showDetailError(message) {
    const titleEl = document.getElementById("event-detail-title");
    const descEl  = document.getElementById("event-detail-description");
    if (titleEl) titleEl.textContent = "Événement non disponible";
    if (descEl)  descEl.textContent  = message;
    
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = 'none';
}

// ===========================================================================
// 6. HERO VIDEO CONTROL
// ===========================================================================
function initHeroVideoControl() {
    const video = document.getElementById('hero-video-player');
    const videoBtn = document.getElementById('btn-video-control');
    if (!video || !videoBtn) return;

    videoBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            videoBtn.textContent = 'Pause ⏸';
            videoBtn.setAttribute('aria-label', 'Mettre la vidéo en pause');
        } else {
            video.pause();
            videoBtn.textContent = 'Lecture ▶';
            videoBtn.setAttribute('aria-label', 'Lancer la lecture de la vidéo');
        }
    });
}

// ===========================================================================
// 7. BACK TO TOP BUTTON
// ===========================================================================
function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", throttle(() => {
        btn.style.display = window.scrollY > CONFIG.SCROLL_THRESHOLD ? "flex" : "none";
    }, CONFIG.THROTTLE_DELAY));

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ===========================================================================
// 8. ACCESSIBILITY UTILITIES
// ===========================================================================
function initAccessibilityTools() {
    _initZoom();
    _initThemeToggles();
    _initAudioReader();
}

function _initZoom() {
    const updateZoom = value => {
        AppState.currentZoom = value;
        document.body.style.setProperty("--text-scale", `${value}%`);
    };

    document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
        if (AppState.currentZoom < CONFIG.ZOOM.MAX) updateZoom(AppState.currentZoom + CONFIG.ZOOM.STEP);
    });
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
        if (AppState.currentZoom > CONFIG.ZOOM.MIN) updateZoom(AppState.currentZoom - CONFIG.ZOOM.STEP);
    });
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => {
        updateZoom(CONFIG.ZOOM.DEFAULT);
    });
}

function _initThemeToggles() {
    const toggles = [
        { id: "btn-darkmode",  className: "dark-mode"         },
        { id: "btn-contrast",  className: "high-contrast"     },
        { id: "btn-dyslexic",  className: "dyslexic-friendly" }
    ];

    toggles.forEach(({ id, className }) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        btn.addEventListener("click", () => {
            document.body.classList.toggle(className);
            const isActive = document.body.classList.contains(className);
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    });
}

function _initAudioReader() {
    const btn = document.getElementById("btn-audio-reader");
    if (!btn || !AppState.synth) return;

    btn.addEventListener("click", () => {
        AppState.audioActive = !AppState.audioActive;
        btn.classList.toggle("active", AppState.audioActive);
        btn.setAttribute("aria-pressed", String(AppState.audioActive));

        if (AppState.audioActive) {
            speakText("Synthèse vocale activée. Survolez ou naviguez au clavier sur les éléments pour les entendre.");
            attachSpeechListeners();
        } else {
            AppState.synth.cancel();
        }
    });
}

function speakText(text) {
    if (!AppState.audioActive || !AppState.synth) return;
    AppState.synth.cancel();

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = "fr-FR";
    utterance.rate   = 1.05;
    AppState.synth.speak(utterance);
}

function attachSpeechListeners() {
    if (AppState.speechListenersAttached) return;

    const handleSpeak = e => {
        if (!AppState.audioActive) return;
        const el    = e.currentTarget;
        const title = el.querySelector("h3, h1")?.textContent ?? el.textContent;
        const desc  = el.querySelector("p")?.textContent ?? "";
        speakText(`${title}. ${desc}`);
    };

    document.querySelectorAll(".event-card, .event-detail-info, h1, h2").forEach(el => {
        el.addEventListener("mouseenter", handleSpeak);
        el.addEventListener("focusin",    handleSpeak);
    });

    AppState.speechListenersAttached = true;
}

// ===========================================================================
// 9. CORE CODE UTILITIES
// ===========================================================================
function buildStarsHTML(stars) {
    const validStars = Math.max(0, Math.min(5, parseInt(stars) || 0));
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star"${i >= validStars ? ' style="color:#E5E7EB;"' : ""}>★</span>`
    ).join("");
}

function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[c]));
}

function throttle(fn, limit) {
    let throttling = false;
    return function (...args) {
        if (!throttling) {
            fn.apply(this, args);
            throttling = true;
            setTimeout(() => { throttling = false; }, limit);
        }
    };
}

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
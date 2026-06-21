'use strict';

import { API_CONFIG_ENV } from './config.js';

// ===========================================================================
// 1. GLOBAL CONFIGURATION & SECURITY
// ===========================================================================
let forceMock = false;

if (!API_CONFIG_ENV || !API_CONFIG_ENV.OPENAGENDA_API_KEY || API_CONFIG_ENV.OPENAGENDA_API_KEY === "Votre_Cle_Ici") {
    console.warn("⚠️ Valid OpenAgenda API key not detected in config.js. Switching to OFFLINE mode.");
    forceMock = true;
}

const API_CONFIG = Object.freeze({
    USE_MOCK: forceMock || false,
    OPENAGENDA: {
        API_KEY:    API_CONFIG_ENV?.OPENAGENDA_API_KEY ?? "",
        AGENDA_UID: API_CONFIG_ENV?.OPENAGENDA_UID      ?? "464817"
    }
});

// ===========================================================================
// 2. LOCAL DATA STORAGE (MOCK)
// ===========================================================================
const MOCK_EVENTS = [
    {
        id:           "mock-001",
        title:        "Nuit des Étoiles — Concert Symphonique",
        body:         "Un voyage musical à travers les plus grandes œuvres du répertoire classique. L'Orchestre Philharmonique de VilleNova vous invite à une soirée d'exception sous les étoiles, avec au programme Beethoven, Debussy et Ravel.",
        category:     "CONCERT",
        imageUrl:     "assets/rock.webp",
        dateText:     "Le 21 juin 2026 à 20:30",
        price:        "18.00 €",
        location:     "Hangar Y — Meudon",
        rating:       "4.9",
        stars:        5,
        reviewsCount: "3 240",
        badgeText:    "★ VOTRE CHOIX",
        badgeClass:   "best-choice"
    },
    {
        id:           "mock-002",
        title:        "Exposition : Lumières du Monde",
        body:         "Une plongée immersive dans les cultures visuelles du monde entier. Plus de 200 œuvres originales — peintures, photographies et installations — réunies pour la première fois en France. Un événement rare à ne pas manquer.",
        category:     "EXPOSITION",
        imageUrl:     "assets/expo.webp",
        dateText:     "Du 15 mai au 30 août 2026",
        price:        "12.00 €",
        location:     "Musée des Arts — VilleNova",
        rating:       "4.7",
        stars:        5,
        reviewsCount: "1 890",
        badgeText:    "Nouveauté",
        badgeClass:   "best-choice"
    },
    {
        id:           "mock-003",
        title:        "Festival Rock en Seine — Édition Spéciale",
        body:         "Trois jours de concerts non-stop avec plus de 40 artistes sur 5 scènes. Rock, electro, hip-hop et world music se mêlent dans une ambiance festive au cœur du Domaine National de Saint-Cloud. Camping disponible sur place.",
        category:     "FESTIVAL",
        imageUrl:     "assets/rock.webp",
        dateText:     "Du 22 au 24 août 2026",
        price:        "89.00 €",
        location:     "Domaine de Saint-Cloud",
        rating:       "4.8",
        stars:        5,
        reviewsCount: "12 450",
        badgeText:    "🔥 Hot Seats",
        badgeClass:   "hot-seat"
    },
    {
        id:           "mock-004",
        title:        "Cyrano de Bergerac — Comédie-Française",
        body:         "La grande pièce d'Edmond Rostand revisitée par une mise en scène contemporaine et audacieuse. Avec Théodore Marchand dans le rôle-titre, cette adaptation mêle humour, panache et émotion dans une scénographie époustouflante.",
        category:     "SPECTACLE",
        imageUrl:     "assets/expo.webp",
        dateText:     "Le 10 juillet 2026 à 19:00",
        price:        "28.00 €",
        location:     "Théâtre de VilleNova",
        rating:       "4.6",
        stars:        5,
        reviewsCount: "945",
        badgeText:    "Dernières places",
        badgeClass:   "hot-seat"
    },
    {
        id:           "mock-005",
        title:        "Jazz à la Villette — Open Air",
        body:         "Le rendez-vous incontournable des amateurs de jazz en plein air. Cette année, le festival accueille des artistes venus des quatre coins du globe : New-Orleans, Havane, Tokyo et Lagos. Entrée libre pour certaines sessions en journée.",
        category:     "CONCERT",
        imageUrl:     "assets/rock.webp",
        dateText:     "Du 29 août au 7 septembre 2026",
        price:        "Gratuit",
        location:     "Parc de la Villette — Paris",
        rating:       "4.8",
        stars:        5,
        reviewsCount: "6 310",
        badgeText:    "🔥 Hot Seats",
        badgeClass:   "hot-seat"
    },
    {
        id:           "mock-006",
        title:        "Le Petit Prince — Spectacle Jeune Public",
        body:         "Une adaptation poétique et envoûtante du chef-d'œuvre d'Antoine de Saint-Exupéry. Marionnettes géantes, projections lumineuses et musique live transportent petits et grands sur la planète B-612. Dès 5 ans.",
        category:     "SPECTACLE",
        imageUrl:     "assets/expo.webp",
        dateText:     "Le 14 juin 2026 à 15:00",
        price:        "10.00 €",
        location:     "Espace Culturel — VilleNova",
        rating:       "4.9",
        stars:        5,
        reviewsCount: "2 107",
        badgeText:    "",
        badgeClass:   ""
    },
    {
        id:           "mock-007",
        title:        "Slam & Spoken Word — Nuit Blanche",
        body:         "Une nuit dédiée à la parole libre et à la poésie urbaine. Six poètes slam de renommée nationale se succèdent sur scène dans une atmosphère intime et électrique. Micro ouvert à partir de 23h pour tous les volontaires.",
        category:     "SPECTACLE",
        imageUrl:     "assets/rock.webp",
        dateText:     "Le 3 octobre 2026 à 21:00",
        price:        "8.00 €",
        location:     "La Fabrique — VilleNova",
        rating:       "4.5",
        stars:        5,
        reviewsCount: "430",
        badgeText:    "Nouveauté",
        badgeClass:   "best-choice"
    },
    {
        id:           "mock-008",
        title:        "Miro, l'Œil Sauvage — Rétrospective",
        body:         "Une rétrospective majeure consacrée à Joan Miró, peintre catalan dont l'œuvre foisonnante défie toutes les classifications. Plus de 150 tableaux, sculptures et céramiques issus des plus grandes collections mondiales réunis pour la première fois.",
        category:     "EXPOSITION",
        imageUrl:     "assets/expo.webp",
        dateText:     "Du 1er juin au 31 octobre 2026",
        price:        "15.00 €",
        location:     "Galerie Nationale — VilleNova",
        rating:       "4.7",
        stars:        5,
        reviewsCount: "3 870",
        badgeText:    "★ VOTRE CHOIX",
        badgeClass:   "best-choice"
    },
    {
        id:           "mock-009",
        title:        "Festival des Arts de Rue",
        body:         "Trois jours pour célébrer les arts urbains dans toute leur diversité : jonglerie, acrobaties, théâtre de rue, danse contemporaine et cirque. Les grandes places et rues piétonnes du centre-ville se transforment en scènes à ciel ouvert.",
        category:     "FESTIVAL",
        imageUrl:     "assets/rock.webp",
        dateText:     "Du 18 au 20 juillet 2026",
        price:        "Gratuit",
        location:     "Centre-Ville — VilleNova",
        rating:       "4.8",
        stars:        5,
        reviewsCount: "8 560",
        badgeText:    "🔥 Hot Seats",
        badgeClass:   "hot-seat"
    }
];

// ===========================================================================
// 3. CORE API SERVICE & FALLBACKS
// ===========================================================================
export const ApiService = {

    async getEvents() {
        return API_CONFIG.USE_MOCK
            ? this._getMockEvents()
            : this._getOpenAgendaEvents();
    },

    async getEventById(id) {
        if (String(id).startsWith("mock") || API_CONFIG.USE_MOCK) {
            return this._getMockEventById(id);
        }
        return this._getOpenAgendaEventById(id);
    },

    // -------------------------------------------------------------------------
    // LOCAL DATA HANDLERS (OFFLINE MODE)
    // -------------------------------------------------------------------------
    async _getMockEvents() {
        await this._simulateDelay(50);
        return MOCK_EVENTS;
    },

    async _getMockEventById(id) {
        await this._simulateDelay(30);
        const event = MOCK_EVENTS.find(e => String(e.id) === String(id));
        if (!event) throw new Error(`Event not found — ID : ${id}`);
        return event;
    },

    _simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // -------------------------------------------------------------------------
    // OPENAGENDA NETWORK CALLS (ONLINE MODE)
    // -------------------------------------------------------------------------
    async _getOpenAgendaEvents() {
        try {
            const { AGENDA_UID, API_KEY } = API_CONFIG.OPENAGENDA;
            const url = `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events?key=${API_KEY}&lang=fr&limit=9`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return this._normalizeEventList(data.events ?? []);

        } catch (error) {
            console.error("⚠️ OpenAgenda API Error. Falling back to local data:", error.message);
            return this._getMockEvents();
        }
    },

    async _getOpenAgendaEventById(uid) {
        try {
            const { AGENDA_UID, API_KEY } = API_CONFIG.OPENAGENDA;
            const url = `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events/${uid}?key=${API_KEY}&lang=fr`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const event = data.event ?? data;

            if (!event?.uid) {
                throw new Error("Invalid response structure.");
            }

            return this._normalizeSingleEvent(event);

        } catch (error) {
            console.error(`⚠️ OpenAgenda API Error (UID: ${uid}). Falling back to local data:`, error.message);
            return this._getMockEventById(uid);
        }
    },

    // -------------------------------------------------------------------------
    // DATA NORMALIZATION INTERFACES
    // -------------------------------------------------------------------------
    _normalizeEventList(events) {
        const badges = [
            { text: "★ VOTRE CHOIX", cssClass: "best-choice" },
            { text: "🔥 Hot Seats",    cssClass: "hot-seat"    },
            { text: "",                cssClass: ""            },
            { text: "Dernières places", cssClass: "hot-seat"    }
        ];

        return events.map((event, index) => {
            const badge = badges[index % badges.length];

            return {
                id:           event.uid,
                title:        event.title?.fr   ?? event.title?.en   ?? "Spectacle sans titre",
                body:         event.description?.fr ?? event.description?.en ?? "",
                category:     this._detectCategory(event),
                imageUrl:     this._extractImageUrl(event),
                dateText:     this._formatDates(event),
                price:        this._extractPrice(event.conditions?.fr ?? event.conditions?.en ?? ""),
                location:     event.location?.name ?? "Hangar Y",
                rating:       "4.8",
                stars:        5,
                reviewsCount: "1 240",
                badgeText:    badge.text,
                badgeClass:   badge.cssClass
            };
        });
    },

    _normalizeSingleEvent(event) {
        const rawPrice =
            event.conditions?.fr                                ??
            event.conditions?.en                                ??
            event.registration?.[0]?.description?.fr    ??
            event.registration?.[0]?.description?.en    ??
            event.pricing?.fr                                   ??
            event.pricing?.en                                   ??
            "";

        return {
            id:           event.uid,
            title:        event.title?.fr ?? event.title?.en ?? "Événement",
            body:         event.longDescription?.fr
                          ?? event.longDescription?.en
                          ?? event.description?.fr
                          ?? event.description?.en
                          ?? "Aucune description disponible pour le moment.",
            category:     this._detectCategory(event),
            imageUrl:     this._extractImageUrl(event),
            dateText:     this._formatDates(event),
            price:        this._extractPrice(rawPrice),
            location:     event.location?.name ?? event.location?.city ?? "Hangar Y",
            rating:       "4.8",
            stars:        5,
            reviewsCount: "1 240"
        };
    },

    // -------------------------------------------------------------------------
    // PARSING & DATA UTILITIES
    // -------------------------------------------------------------------------
    _extractImageUrl(event) {
        const src = event.image ?? event.originalImage;
        if (!src)                     return "assets/rock.webp";
        if (typeof src === "string")  return src;
        if (src.url)                  return src.url;
        if (src.base && src.filename) return `${src.base}${src.filename}`;
        return "assets/rock.webp";
    },

    _formatDates(event) {
        if (event.daterange?.fr) return event.daterange.fr;
        if (event.daterange?.en) return event.daterange.en;

        const optDate = { day: "numeric", month: "long", year: "numeric" };
        const optTime = { hour: "2-digit", minute: "2-digit" };

        const buildLabel = (startISO, endISO) => {
            if (!startISO) return "Date à venir";
            const start = new Date(startISO);
            const end   = endISO ? new Date(endISO) : start;
            if (start.toDateString() === end.toDateString()) {
                return `Le ${start.toLocaleDateString("fr-FR", optDate)} à ${start.toLocaleTimeString("fr-FR", optTime)}`;
            }
            return `Du ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${end.toLocaleDateString("fr-FR", optDate)}`;
        };

        if (Array.isArray(event.timings) && event.timings.length > 0) {
            const first = event.timings[0];
            const last  = event.timings.at(-1);
            return buildLabel(first.start ?? first.begin, last.end);
        }

        if (event.timing?.start) {
            return buildLabel(event.timing.start, event.timing.end);
        }

        const fallback = event.firstTiming ?? event.nextTiming;
        if (fallback?.start) {
            return buildLabel(fallback.start, fallback.end);
        }

        return "Date à venir";
    },

    _extractPrice(priceStr) {
        if (!priceStr || priceStr.trim() === "") return "Tarif non communiqué";
        return priceStr;
    },

    _detectCategory(event) {
        const textToSearch = `${event.title?.fr ?? ''} ${event.description?.fr ?? ''}`.toLowerCase();
        if (textToSearch.includes("concert") || textToSearch.includes("musique") || textToSearch.includes("symphonique")) {
            return "CONCERT";
        }
        if (textToSearch.includes("exposition") || textToSearch.includes("expo") || textToSearch.includes("musée")) {
            return "EXPOSITION";
        }
        if (textToSearch.includes("festival")) {
            return "FESTIVAL";
        }
        return "SPECTACLE";
    }
};
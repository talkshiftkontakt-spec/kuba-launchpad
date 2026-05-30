// -------------------------------------------------------------
// DANE DOMYŚLNE & INTELIGENTNA SYNCHRONIZACJA LOCALSTORAGE
// -------------------------------------------------------------

const DEFAULT_APPS = [
    {
        id: "lingology-pl",
        name: "Lingology.pl",
        url: "https://lingology.pl",
        icon: "assets/lingology-logo-dark.png", 
        gradient: "gradient-lingology",
        isDefault: true,
        logoType: "image"
    },
    {
        id: "lingology-app",
        name: "Lingology.app",
        url: "https://lingology.app",
        icon: "assets/lingology-logo-light.png", 
        gradient: "gradient-emerald",
        isDefault: true,
        logoType: "image"
    },
    {
        id: "tutorapp-dashboard",
        name: "TutorApp Dashboard",
        url: "https://tutorapp-khaki.vercel.app/dashboard",
        icon: "fa-solid fa-graduation-cap", 
        gradient: "gradient-tutor",
        isDefault: true,
        logoType: "icon"
    }
];

// Odczyt z localStorage z wbudowanym mechanizmem migracji i resetowania cache
let storedApps = JSON.parse(localStorage.getItem("launchpad_apps")) || [];

if (storedApps.length === 0) {
    storedApps = [...DEFAULT_APPS];
}

const customApps = storedApps.filter(app => !app.isDefault);

const mergedDefaultApps = DEFAULT_APPS.map(defaultApp => {
    const matchInStorage = storedApps.find(app => app.id === defaultApp.id);
    if (matchInStorage && matchInStorage.notes) {
        return { ...defaultApp, notes: matchInStorage.notes };
    }
    return defaultApp;
});

let apps = [...mergedDefaultApps, ...customApps];
localStorage.setItem("launchpad_apps", JSON.stringify(apps));

// -------------------------------------------------------------
// SELEKTORY DOM
// -------------------------------------------------------------
const appsGrid = document.getElementById("apps-grid");
const searchInput = document.getElementById("search-input");
const appsCount = document.getElementById("apps-count");
const clockTime = document.getElementById("clock-time");
const clockDate = document.getElementById("clock-date");
const scratchpad = document.getElementById("scratchpad");
const scratchpadChars = document.getElementById("scratchpad-chars");
const saveStatus = document.getElementById("save-status");
const btnClearScratchpad = document.getElementById("btn-clear-scratchpad");
const toast = document.getElementById("toast");

// Add App Modal
const addAppModal = document.getElementById("add-app-modal");
const btnAddApp = document.getElementById("btn-add-app");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const addAppForm = document.getElementById("add-app-form");

// Project Details Modal
const projectDetailsModal = document.getElementById("project-details-modal");
const btnClosePModal = document.getElementById("btn-close-p-modal");
const pModalName = document.getElementById("p-modal-name");
const pModalUrl = document.getElementById("p-modal-url");
const pModalIcon = document.getElementById("p-modal-icon");
const btnPModalLaunch = document.getElementById("btn-p-modal-launch");
const pModalNotes = document.getElementById("p-modal-notes");
const pNotesSaveStatus = document.getElementById("p-notes-save-status");
const btnGeneratePrompt = document.getElementById("btn-generate-prompt");

// Zmienna globalna trzymająca ID aktualnie otwartego projektu w modalu szczegółów
let activeProjectId = null;

// -------------------------------------------------------------
// APILKACJE - RENDEROWANIE SIATKI (PRISTINE CARDS)
// -------------------------------------------------------------

function getCleanDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace("www.", "");
    } catch (e) {
        return url.replace("https://", "").replace("http://", "").split("/")[0];
    }
}

function renderApps(filterQuery = "") {
    appsGrid.innerHTML = "";
    
    const filteredApps = apps.filter(app => {
        const query = filterQuery.toLowerCase();
        return app.name.toLowerCase().includes(query) || app.url.toLowerCase().includes(query);
    });

    appsCount.textContent = `${filteredApps.length} ${getPolishAppNoun(filteredApps.length)}`;

    if (filteredApps.length === 0) {
        appsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ghost"></i>
                <p>Nie znaleziono żadnych aplikacji</p>
                ${filterQuery ? `<button class="btn btn-secondary btn-sm" id="btn-clear-search">Wyczyść filtry</button>` : ""}
            </div>
        `;
        const btnClearSearch = document.getElementById("btn-clear-search");
        if (btnClearSearch) {
            btnClearSearch.addEventListener("click", () => {
                searchInput.value = "";
                renderApps();
            });
        }
        return;
    }

    filteredApps.forEach((app, index) => {
        const card = document.createElement("a");
        card.href = app.url;
        card.target = "_blank";
        card.className = "app-card";
        card.setAttribute("data-id", app.id);
        card.setAttribute("data-gradient", app.gradient || "gradient-cyber");

        const shortcutBadge = index < 9 ? `<span class="shortcut-number" title="Wciśnij ${index + 1} na klawiaturze, aby otworzyć">${index + 1}</span>` : "";

        // Logo/Ikona HTML
        let iconHtml = "";
        if (app.logoType === "image") {
            iconHtml = `<img src="${app.icon}" alt="${app.name}" class="app-logo-img">`;
        } else if (app.icon.startsWith("fa-")) {
            iconHtml = `<i class="${app.icon}"></i>`;
        } else {
            iconHtml = `<span class="emoji">${app.icon}</span>`;
        }

        const deleteButton = !app.isDefault ? `
            <button class="action-btn delete-btn" title="Usuń aplikację" data-action="delete">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        ` : "";

        // Wskaźnik, czy projekt posiada zapisane notatki
        const hasNotes = app.notes && app.notes.trim().length > 0;
        const notesIndicatorHtml = hasNotes ? `
            <div class="card-notes-indicator" style="margin-top: 8px; font-size: 0.72rem; color: #f97316; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-clipboard"></i> Zapisane poprawki
                <span class="notes-dot animate-pulse" style="margin-left: 2px;"></span>
            </div>
        ` : "";

        // Ultra-czysta i minimalistyczna struktura kafelka
        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn copy-btn" title="Kopiuj link" data-action="copy">
                    <i class="fa-regular fa-copy"></i>
                </button>
                ${deleteButton}
            </div>
            <div class="card-header">
                <div class="app-icon-container icon-${app.gradient || 'gradient-cyber'}">
                    ${iconHtml}
                </div>
                ${shortcutBadge}
            </div>
            <div class="card-body">
                <h3 class="app-title">${app.name}</h3>
                <div class="app-url">
                    <i class="fa-solid fa-link" style="font-size: 0.65rem; opacity: 0.6;"></i>
                    ${getCleanDomain(app.url)}
                </div>
                ${notesIndicatorHtml}
            </div>
        `;

        // Logika kliknięcia na kafelek
        card.addEventListener("click", (e) => {
            const actionBtn = e.target.closest(".action-btn");
            if (actionBtn) {
                // Zapobieganie wywołaniu modala przy kliknięciu w akcje (usuwanie, kopiowanie)
                e.preventDefault();
                e.stopPropagation();
                const action = actionBtn.getAttribute("data-action");
                if (action === "copy") {
                    copyToClipboard(app.url);
                } else if (action === "delete") {
                    deleteApp(app.id);
                }
            } else {
                // Otwieramy szczegóły projektu zamiast bezpośredniego linku
                e.preventDefault();
                e.stopPropagation();
                openProjectDetailsModal(app.id);
            }
        });

        appsGrid.appendChild(card);
    });
}

function getPolishAppNoun(number) {
    if (number === 1) return "aplikacja";
    if (number >= 2 && number <= 4) return "aplikacje";
    return "aplikacji";
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Skopiowano link do schowka! 📋");
    }).catch(err => {
        showToast("Nie udało się skopiować linku.");
    });
}

function deleteApp(id) {
    if (confirm("Czy na pewno chcesz usunąć tę aplikację ze swojego pulpitu? Wraz z nią usuniesz przypisane notatki.")) {
        apps = apps.filter(app => app.id !== id);
        localStorage.setItem("launchpad_apps", JSON.stringify(apps));
        renderApps(searchInput.value);
        showToast("Aplikacja została usunięta! 🗑️");
    }
}

function showToast(message) {
    toast.querySelector(".toast-message").textContent = message;
    toast.classList.add("show");
    
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// -------------------------------------------------------------
// MODAL SZCZEGÓŁÓW PROJEKTU (PROJECT DETAILS MODAL)
// -------------------------------------------------------------

function openProjectDetailsModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    activeProjectId = appId;

    // Uzupłenienie danych w modalu szczegółów
    pModalName.textContent = app.name;
    
    // Link tekstowy do domeny
    pModalUrl.href = app.url;
    pModalUrl.querySelector("span").textContent = getCleanDomain(app.url);

    // Przycisk uruchamiania
    btnPModalLaunch.href = app.url;

    // Dynamiczne renderowanie ikony w nagłówku modala
    pModalIcon.className = `app-icon-container icon-${app.gradient || 'gradient-cyber'}`;
    let iconHtml = "";
    if (app.logoType === "image") {
        iconHtml = `<img src="${app.icon}" alt="${app.name}" class="app-logo-img">`;
    } else if (app.icon.startsWith("fa-")) {
        iconHtml = `<i class="${app.icon}"></i>`;
    } else {
        iconHtml = `<span class="emoji">${app.icon}</span>`;
    }
    pModalIcon.innerHTML = iconHtml;

    // Załadowanie notatek
    pModalNotes.value = app.notes || "";
    pNotesSaveStatus.classList.remove("show");

    // Wyświetlenie modala
    projectDetailsModal.classList.add("active");
    pModalNotes.focus();
}

function closeProjectDetailsModal() {
    projectDetailsModal.classList.remove("active");
    activeProjectId = null;
    // Odświeżamy siatkę aplikacji, aby zaktualizować status kropki (notatek) na kafelku
    renderApps(searchInput.value);
}

// Obsługa autozapisu notatek wewnątrz modala szczegółów
let pNotesTimeout = null;
pModalNotes.addEventListener("input", () => {
    if (!activeProjectId) return;

    pNotesSaveStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`;
    pNotesSaveStatus.classList.add("show");

    clearTimeout(pNotesTimeout);
    pNotesTimeout = setTimeout(() => {
        const textValue = pModalNotes.value;

        // Aktualizujemy notatki w pamięci
        const appIndex = apps.findIndex(a => a.id === activeProjectId);
        if (appIndex !== -1) {
            apps[appIndex].notes = textValue;
            localStorage.setItem("launchpad_apps", JSON.stringify(apps));
        }

        pNotesSaveStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Zapisano`;
        
        setTimeout(() => {
            pNotesSaveStatus.classList.remove("show");
        }, 1200);
    }, 600);
});

// Zapobiegamy aktywacji skrótów klawiszowych w pulpicie podczas pisania notatek w modalu szczegółów
pModalNotes.addEventListener("keydown", (e) => {
    e.stopPropagation();
});

// GENERATOR PROMPTÓW DLA CHATGPT
btnGeneratePrompt.addEventListener("click", () => {
    if (!activeProjectId) return;

    const app = apps.find(a => a.id === activeProjectId);
    if (!app) return;

    const notesText = pModalNotes.value.trim();

    if (notesText.length === 0) {
        showToast("Wpisz najpierw notatki/poprawki dla tego projektu! 📝");
        return;
    }

    // Ustrukturyzowany szablon profesjonalnego promptu deweloperskiego dla AI
    const promptText = `Jesteś wybitnym inżynierem oprogramowania i architektem IT. Zwracam się z prośbą o pomoc w wdrożeniu poprawek, naprawie błędów oraz rozwoju mojej aplikacji: ${app.name} (Adres URL projektu: ${app.url}).

Oto lista uwag, błędów do naprawienia oraz planowanych funkcji z mojego notatnika projektowego:
---
${notesText}
---

Proszę Cię o szczegółową analizę każdego z powyższych punktów i przygotowanie:
1. Ustrukturyzowanego planu działania krok-po-kroku (Action Plan) uporządkowanego od kwestii krytycznych po detale wizualne.
2. Zaproponowanie gotowych, zoptymalizowanych rozwiązań technicznych, architektury kodu, wskazówek implementacyjnych oraz konkretnych fragmentów kodu w celach refaktoryzacji, które pomogą mi zaimplementować te poprawki w najprostszy i najbardziej bezawaryjny sposób.`;

    // Kopiowanie do schowka
    navigator.clipboard.writeText(promptText).then(() => {
        showToast("Skopiowano gotowy prompt dla ChatGPT do schowka! 🤖📋");
    }).catch(err => {
        showToast("Nie udało się automatycznie skopiować promptu.");
    });
});

// -------------------------------------------------------------
// FORMULARZ DODAWANIA NOWEJ APLIKACJI (MODAL DODAWANIA)
// -------------------------------------------------------------

function openModal() {
    addAppModal.classList.add("active");
    document.getElementById("app-name").focus();
}

function closeModal() {
    addAppModal.classList.remove("active");
    addAppForm.reset();
}

addAppForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("app-name").value.trim();
    const url = document.getElementById("app-url").value.trim();
    const iconInput = document.getElementById("app-icon").value.trim();
    const gradient = document.querySelector('input[name="app-gradient"]:checked').value;
    
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    
    let logoType = "icon";
    let icon = iconInput;
    
    if (iconInput.startsWith("http") || iconInput.startsWith("assets/") || iconInput.endsWith(".png") || iconInput.endsWith(".jpg") || iconInput.endsWith(".svg")) {
        logoType = "image";
    } else if (!iconInput.startsWith("fa-") && iconInput.length > 0) {
        logoType = "emoji";
    }

    const newApp = {
        id,
        name,
        url,
        icon,
        gradient,
        isDefault: false,
        logoType,
        notes: "" 
    };

    apps.push(newApp);
    localStorage.setItem("launchpad_apps", JSON.stringify(apps));
    
    renderApps(searchInput.value);
    closeModal();
    showToast(`Dodano aplikację ${name}! 🚀`);
});

btnAddApp.addEventListener("click", openModal);
btnCloseModal.addEventListener("click", closeModal);
btnCancelModal.addEventListener("click", closeModal);
addAppModal.addEventListener("click", (e) => {
    if (e.target === addAppModal) closeModal();
});

// Obsługa zamykania modala szczegółów projektu
btnClosePModal.addEventListener("click", closeProjectDetailsModal);
projectDetailsModal.addEventListener("click", (e) => {
    if (e.target === projectDetailsModal) closeProjectDetailsModal();
});

// -------------------------------------------------------------
// DYNAMICZNY ZEGAR & POWITANIE
// -------------------------------------------------------------
function updateTime() {
    const now = new Date();
    
    // Zegar
    let hours = now.getHours().toString().padStart(2, "0");
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let seconds = now.getSeconds().toString().padStart(2, "0");
    clockTime.textContent = `${hours}:${minutes}:${seconds}`;

    // Data po polsku
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateStr = now.toLocaleDateString('pl-PL', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    clockDate.textContent = dateStr;

    // Powitanie w zależności od godziny
    const hour = now.getHours();
    const welcomeSubtext = document.querySelector(".logo-text p");
    if (welcomeSubtext) {
        if (hour >= 5 && hour < 12) {
            welcomeSubtext.textContent = "Dzień dobry, Kuba! 🌅";
        } else if (hour >= 12 && hour < 18) {
            welcomeSubtext.textContent = "Miłego popołudnia! ☀️";
        } else if (hour >= 18 && hour < 22) {
            welcomeSubtext.textContent = "Dobry wieczór, Kuba! 🌙";
        } else {
            welcomeSubtext.textContent = "Dobrej nocy, Kuba! 🌌";
        }
    }
}

setInterval(updateTime, 1000);
updateTime();

// -------------------------------------------------------------
// NOTES GŁÓWNY (SCRATCHPAD)
// -------------------------------------------------------------
const savedNote = localStorage.getItem("launchpad_scratchpad") || "";
scratchpad.value = savedNote;
updateCharCount();

function updateCharCount() {
    const count = scratchpad.value.length;
    scratchpadChars.textContent = `${count} ${getPolishCharNoun(count)}`;
}

function getPolishCharNoun(number) {
    if (number === 1) return "znak";
    if (number >= 2 && number <= 4) return "znaki";
    return "znaków";
}

let saveTimeout = null;
scratchpad.addEventListener("input", () => {
    updateCharCount();
    
    saveStatus.style.opacity = "0.7";
    saveStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`;
    saveStatus.classList.add("show");
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem("launchpad_scratchpad", scratchpad.value);
        saveStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Zapisano`;
        saveStatus.style.opacity = "1";
        
        setTimeout(() => {
            saveStatus.classList.remove("show");
        }, 1500);
    }, 800);
});

btnClearScratchpad.addEventListener("click", () => {
    if (scratchpad.value.trim().length === 0) return;
    
    if (confirm("Czy chcesz całkowicie wyczyścić główne notatki scratchpada?")) {
        scratchpad.value = "";
        localStorage.setItem("launchpad_scratchpad", "");
        updateCharCount();
        showToast("Notatnik scratchpada wyczyszczony! 🧹");
    }
});

// -------------------------------------------------------------
// WYSZUKIWANIE & FILTROWANIE
// -------------------------------------------------------------
searchInput.addEventListener("input", (e) => {
    renderApps(e.target.value);
});

// -------------------------------------------------------------
// SKRÓTY KLAWISZOWE
// -------------------------------------------------------------
document.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    const isTyping = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";

    if (!isTyping) {
        if (e.key === "/") {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        if (e.key === "n" || e.key === "N") {
            e.preventDefault();
            openModal();
        }

        if (e.key >= "1" && e.key <= "9") {
            const index = parseInt(e.key) - 1;
            const filtered = apps.filter(app => {
                const query = searchInput.value.toLowerCase();
                return app.name.toLowerCase().includes(query) || app.url.toLowerCase().includes(query);
            });

            if (filtered[index]) {
                e.preventDefault();
                showToast(`Otwieranie panelu szczegółów: ${filtered[index].name}... 📋`);
                openProjectDetailsModal(filtered[index].id);
            }
        }
    } else {
        if (e.key === "Escape") {
            if (addAppModal.classList.contains("active")) {
                closeModal();
            } else if (projectDetailsModal.classList.contains("active")) {
                closeProjectDetailsModal();
            } else if (activeEl === searchInput) {
                searchInput.value = "";
                renderApps();
                searchInput.blur();
            }
        }
    }
});

// -------------------------------------------------------------
// START APLIKACJI
// -------------------------------------------------------------
renderApps();

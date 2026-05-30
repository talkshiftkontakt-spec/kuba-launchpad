// -------------------------------------------------------------
// DANE DOMYŚLNE & INTELIGENTNA SYNCHRONIZACJA LOCALSTORAGE
// -------------------------------------------------------------

// Zawsze najświeższe dane domyślne z kodu (gwarantuje poprawność ikon i logotypów)
const DEFAULT_APPS = [
    {
        id: "lingology-pl",
        name: "Lingology.pl",
        url: "https://lingology.pl",
        icon: "assets/lingology-logo-dark.png", // Zjawiskowe logo - ciemna wersja marki
        gradient: "gradient-lingology",
        isDefault: true,
        logoType: "image"
    },
    {
        id: "lingology-app",
        name: "Lingology.app",
        url: "https://lingology.app",
        icon: "assets/lingology-logo-light.png", // Jasne logo z morskim elementem
        gradient: "gradient-emerald",
        isDefault: true,
        logoType: "image"
    },
    {
        id: "tutorapp-dashboard",
        name: "TutorApp Dashboard",
        url: "https://tutorapp-khaki.vercel.app/dashboard",
        icon: "fa-solid fa-graduation-cap", // Prawidłowa, edukacyjna ikona Graduation Cap
        gradient: "gradient-tutor",
        isDefault: true,
        logoType: "icon"
    }
];

// Odczyt z localStorage z wbudowanym mechanizmem migracji i resetowania cache
let storedApps = JSON.parse(localStorage.getItem("launchpad_apps")) || [];

// Jeśli localStorage było puste, inicjalizujemy defaultami
if (storedApps.length === 0) {
    storedApps = [...DEFAULT_APPS];
}

// Filtrujemy aplikacje dodane ręcznie przez użytkownika (custom)
const customApps = storedApps.filter(app => !app.isDefault);

// Mapujemy najświeższe defaulty z kodu, ale dbamy o zachowanie notatek, jeśli użytkownik jakieś u nas zapisał!
const mergedDefaultApps = DEFAULT_APPS.map(defaultApp => {
    const matchInStorage = storedApps.find(app => app.id === defaultApp.id);
    if (matchInStorage && matchInStorage.notes) {
        return { ...defaultApp, notes: matchInStorage.notes };
    }
    return defaultApp;
});

// Łączymy: najnowsze defaulty z kodu (z zachowanymi notatkami) + ręcznie dodane linki użytkownika
let apps = [...mergedDefaultApps, ...customApps];

// Zapisujemy spójną strukturę do localStorage
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

// Modal
const addAppModal = document.getElementById("add-app-modal");
const btnAddApp = document.getElementById("btn-add-app");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const addAppForm = document.getElementById("add-app-form");

// -------------------------------------------------------------
// DYNAMICZNE RENDEROWANIE SIATKI APLIKACJI & OBSŁUGA W KAFELKACH
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

        // Generujemy kropkę dla aktywnych notatek w podglądzie
        const hasNotes = app.notes && app.notes.trim().length > 0;
        const notesDotHtml = hasNotes ? `<span class="notes-dot animate-pulse"></span>` : "";

        // Wstrzykiwanie struktury kafelka wraz z elastycznym notesem do poprawek
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
            </div>
            
            <!-- STREFA NOTATEK DO POPRAWY -->
            <div class="card-notes-area" data-id="${app.id}">
                <div class="notes-toggle-btn" title="Pokaż/ukryj notatki do poprawy dla tego projektu">
                    <i class="fa-regular fa-clipboard"></i> Notatki do poprawy
                    ${notesDotHtml}
                </div>
                <div class="notes-dropdown-content">
                    <textarea class="app-notes-textarea" placeholder="Co jest do poprawy w tym projekcie? Wpisz tutaj..." autocomplete="off">${app.notes || ""}</textarea>
                    <div class="notes-save-indicator">
                        <i class="fa-solid fa-circle-check"></i> Zapisano
                    </div>
                </div>
            </div>
        `;

        // Logika kliknięć na akcje w karcie (kopiowanie, usuwanie)
        card.addEventListener("click", (e) => {
            const actionBtn = e.target.closest(".action-btn");
            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const action = actionBtn.getAttribute("data-action");
                if (action === "copy") {
                    copyToClipboard(app.url);
                } else if (action === "delete") {
                    deleteApp(app.id);
                }
            }
        });

        appsGrid.appendChild(card);
    });

    // Podpięcie logiki rozwijania i autosave dla sekcji Notatek do Poprawy we wszystkich wyrenderowanych kartach
    attachNotesListeners();
}

// Logika rozwijania notatników i autosave na poziomie pojedynczych kafelków
function attachNotesListeners() {
    const cards = appsGrid.querySelectorAll(".app-card");
    cards.forEach(card => {
        const appId = card.getAttribute("data-id");
        const notesArea = card.querySelector(".card-notes-area");
        const toggleBtn = card.querySelector(".notes-toggle-btn");
        const textarea = card.querySelector(".app-notes-textarea");
        const saveIndicator = card.querySelector(".notes-save-indicator");

        // Kliknięcie w nagłówek rozwijania notatek
        toggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation(); // Kluczowe: zapobiega otwarciu linku w karcie!
            
            const isActive = notesArea.classList.contains("active");

            // Zamykamy inne otwarte notatniki dla ładu na ekranie
            appsGrid.querySelectorAll(".card-notes-area").forEach(area => {
                area.classList.remove("active");
            });

            if (!isActive) {
                notesArea.classList.add("active");
                // Automatycznie skupiamy kursor na polu tekstowym po otwarciu
                setTimeout(() => textarea.focus(), 150);
            }
        });

        // Zapobiegamy otwieraniu aplikacji przy kliknięciu/pisaniu w notesie kafelka
        textarea.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        textarea.addEventListener("focus", (e) => {
            e.stopPropagation();
        });
        textarea.addEventListener("keydown", (e) => {
            e.stopPropagation(); // Blokuje aktywację skrótów klawiszowych w pulpicie podczas pisania notatki!
        });

        // Automatyczny zapis notatki z debounce
        let notesTimeout = null;
        textarea.addEventListener("input", (e) => {
            e.stopPropagation();
            
            // Pokaż wizualny stan ładowania / zapisywania
            saveIndicator.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`;
            saveIndicator.classList.add("show");

            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(() => {
                const textValue = textarea.value;
                
                // Znajdujemy aplikację i aktualizujemy pole notatki
                const appIndex = apps.findIndex(a => a.id === appId);
                if (appIndex !== -1) {
                    apps[appIndex].notes = textValue;
                    localStorage.setItem("launchpad_apps", JSON.stringify(apps));
                }

                // Wizualizacja sukcesu zapisu
                saveIndicator.innerHTML = `<i class="fa-solid fa-circle-check"></i> Zapisano`;
                
                // Aktualizujemy kropkę statusu przy nagłówku
                const existingDot = toggleBtn.querySelector(".notes-dot");
                if (textValue.trim().length > 0) {
                    if (!existingDot) {
                        const newDot = document.createElement("span");
                        newDot.className = "notes-dot animate-pulse";
                        toggleBtn.appendChild(newDot);
                    }
                } else {
                    if (existingDot) {
                        existingDot.remove();
                    }
                }

                // Ukryj wskaźnik zapisu po chwili
                setTimeout(() => {
                    saveIndicator.classList.remove("show");
                }, 1200);
            }, 600);
        });
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
// MODAL - OBSŁUGA
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
        notes: "" // Domyślnie puste notatki
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
                showToast(`Uruchamianie: ${filtered[index].name}... 🚀`);
                window.open(filtered[index].url, "_blank");
            }
        }
    } else {
        if (e.key === "Escape") {
            if (addAppModal.classList.contains("active")) {
                closeModal();
            } else if (activeEl === searchInput) {
                searchInput.value = "";
                renderApps();
                searchInput.blur();
            } else if (activeEl.classList.contains("app-notes-textarea")) {
                // Pozwalamy zamknąć pole notatek kafelka po naciśnięciu Esc
                activeEl.blur();
                const notesArea = activeEl.closest(".card-notes-area");
                if (notesArea) {
                    notesArea.classList.remove("active");
                }
            }
        }
    }
});

// -------------------------------------------------------------
// START APLIKACJI
// -------------------------------------------------------------
renderApps();

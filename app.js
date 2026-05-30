// -------------------------------------------------------------
// DANE DOMYŚLNE & INICJALIZACJA
// -------------------------------------------------------------

const DEFAULT_APPS = [
    {
        id: "lingology-pl",
        name: "Lingology.pl",
        url: "https://lingology.pl",
        icon: "assets/lingology-logo-dark.png", // Biała ścieżka na morskim tle
        gradient: "gradient-lingology",
        isDefault: true,
        logoType: "image"
    },
    {
        id: "lingology-app",
        name: "Lingology.app",
        url: "https://lingology.app",
        icon: "assets/lingology-logo-light.png", // Morska ścieżka na białym tle
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

// Pobieranie aplikacji z localStorage lub ładowanie domyślnych
let apps = JSON.parse(localStorage.getItem("launchpad_apps"));
if (!apps || apps.length === 0) {
    apps = [...DEFAULT_APPS];
    localStorage.setItem("launchpad_apps", JSON.stringify(apps));
}

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
// APILKACJE - FUNKCJE
// -------------------------------------------------------------

// Wyciąganie czystej nazwy hosta do wyświetlenia na karcie
function getCleanDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace("www.", "");
    } catch (e) {
        return url.replace("https://", "").replace("http://", "").split("/")[0];
    }
}

// Renderowanie siatki aplikacji
function renderApps(filterQuery = "") {
    appsGrid.innerHTML = "";
    
    const filteredApps = apps.filter(app => {
        const query = filterQuery.toLowerCase();
        return app.name.toLowerCase().includes(query) || app.url.toLowerCase().includes(query);
    });

    // Aktualizacja licznika
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
        
        // Zastosowanie dynamicznej zmiennej koloru akcentu kafelka dla glow
        const gradientClass = app.gradient || "gradient-cyber";
        card.classList.add(gradientClass);

        // Skrót klawiszowy (tylko dla pierwszych 9)
        const shortcutBadge = index < 9 ? `<span class="shortcut-number" title="Wciśnij ${index + 1} na klawiaturze, aby otworzyć">${index + 1}</span>` : "";

        // Logo/Ikona HTML
        let iconHtml = "";
        if (app.logoType === "image") {
            iconHtml = `<img src="${app.icon}" alt="${app.name}" class="app-logo-img">`;
        } else if (app.icon.startsWith("fa-")) {
            iconHtml = `<i class="${app.icon}"></i>`;
        } else {
            // Emotka lub inny tekst
            iconHtml = `<span class="emoji">${app.icon}</span>`;
        }

        // Akcje (kopiuj, usuń)
        // Defaultowe aplikacje nie mają usuwania dla bezpieczeństwa, ale można je ukryć lub skasować jeśli użytkownik zechce. 
        // Pozwólmy usuwać wszystko poza defaultami w tej sekcji, a dla defaultów dajmy tylko opcję kopii.
        const deleteButton = !app.isDefault ? `
            <button class="action-btn delete-btn" title="Usuń aplikację" data-action="delete">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        ` : "";

        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn copy-btn" title="Kopiuj link" data-action="copy">
                    <i class="fa-regular fa-copy"></i>
                </button>
                ${deleteButton}
            </div>
            <div class="card-header">
                <div class="app-icon-container">
                    ${iconHtml}
                </div>
                ${shortcutBadge}
            </div>
            <div class="card-body">
                <h3 class="app-title">${app.name}</h3>
                <div class="app-url">
                    <i class="fa-solid fa-link" style="font-size: 0.7rem; opacity: 0.6;"></i>
                    ${getCleanDomain(app.url)}
                </div>
            </div>
        `;

        // Zapobieganie otwieraniu linku przy kliknięciu na przyciski akcji
        card.addEventListener("click", (e) => {
            const actionBtn = e.target.closest(".action-btn");
            if (actionBtn) {
                e.preventDefault();
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
}

// Dopasowanie końcówki liczebnika w języku polskim
function getPolishAppNoun(number) {
    if (number === 1) return "aplikacja";
    if (number >= 2 && number <= 4) return "aplikacje";
    return "aplikacji";
}

// Kopiowanie do schowka
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Skopiowano link do schowka! 📋");
    }).catch(err => {
        showToast("Nie udało się skopiować linku.");
    });
}

// Usuwanie aplikacji
function deleteApp(id) {
    if (confirm("Czy na pewno chcesz usunąć tę aplikację ze swojego pulpitu?")) {
        apps = apps.filter(app => app.id !== id);
        localStorage.setItem("launchpad_apps", JSON.stringify(apps));
        renderApps(searchInput.value);
        showToast("Aplikacja została usunięta! 🗑️");
    }
}

// Pokazywanie powiadomień toast
function showToast(message) {
    toast.querySelector(".toast-message").textContent = message;
    toast.classList.add("show");
    
    // Zresetuj poprzedni timeout, jeśli istnieje
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

// Obsługa wysyłania formularza modalnego
addAppForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("app-name").value.trim();
    const url = document.getElementById("app-url").value.trim();
    const iconInput = document.getElementById("app-icon").value.trim();
    const gradient = document.querySelector('input[name="app-gradient"]:checked').value;
    
    // Generowanie ID na podstawie nazwy i czasu
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    
    // Wykrywanie typu ikony (obrazek/emoji/FontAwesome)
    let logoType = "icon";
    let icon = iconInput;
    
    if (iconInput.startsWith("http") || iconInput.startsWith("assets/") || iconInput.endsWith(".png") || iconInput.endsWith(".jpg") || iconInput.endsWith(".svg")) {
        logoType = "image";
    } else if (!iconInput.startsWith("fa-") && iconInput.length > 0) {
        // Jeśli to nie jest klasa font-awesome (np. fa-solid) i nie jest linkiem, traktujemy jako emoji/tekst
        logoType = "emoji";
    }

    const newApp = {
        id,
        name,
        url,
        icon,
        gradient,
        isDefault: false,
        logoType
    };

    apps.push(newApp);
    localStorage.setItem("launchpad_apps", JSON.stringify(apps));
    
    renderApps(searchInput.value);
    closeModal();
    showToast(`Dodano aplikację ${name}! 🚀`);
});

// Rejestracja eventów dla modala
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
    // Zróbmy wielką literę na początku dnia tygodnia
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

// Uruchamianie zegara
setInterval(updateTime, 1000);
updateTime(); // Pierwsze wywołanie natychmiastowe

// -------------------------------------------------------------
// NOTES (SCRATCHPAD)
// -------------------------------------------------------------

// Wczytywanie notatnika
const savedNote = localStorage.getItem("launchpad_scratchpad") || "";
scratchpad.value = savedNote;
updateCharCount();

// Aktualizacja liczby znaków
function updateCharCount() {
    const count = scratchpad.value.length;
    scratchpadChars.textContent = `${count} ${getPolishCharNoun(count)}`;
}

function getPolishCharNoun(number) {
    if (number === 1) return "znak";
    if (number >= 2 && number <= 4) return "znaki";
    return "znaków";
}

// Auto-zapis z debounce (opóźnienie zapisu, aby nie przeciążać przeglądarki przy każdym znaku)
let saveTimeout = null;
scratchpad.addEventListener("input", () => {
    updateCharCount();
    
    // Pokaż, że trwa zapis (delikatny efekt)
    saveStatus.style.opacity = "0.5";
    saveStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`;
    saveStatus.classList.add("show");
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem("launchpad_scratchpad", scratchpad.value);
        saveStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Zapisano`;
        saveStatus.style.opacity = "1";
        
        // Ukryj status po 1.5s
        setTimeout(() => {
            saveStatus.classList.remove("show");
        }, 1500);
    }, 800);
});

// Czyszczenie notesu
btnClearScratchpad.addEventListener("click", () => {
    if (scratchpad.value.trim().length === 0) return;
    
    if (confirm("Czy chcesz całkowicie wyczyścić swoje notatki?")) {
        scratchpad.value = "";
        localStorage.setItem("launchpad_scratchpad", "");
        updateCharCount();
        showToast("Notatnik został wyczyszczony! 🧹");
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
    // Sprawdzamy czy użytkownik pisze w jakimś polu tekstowym
    const activeEl = document.activeElement;
    const isTyping = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";

    if (!isTyping) {
        // Skrót '/': Fokus na wyszukiwarkę
        if (e.key === "/") {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // Skrót 'N' lub 'n': Nowa aplikacja
        if (e.key === "n" || e.key === "N") {
            e.preventDefault();
            openModal();
        }

        // Skróty '1' do '9': Otwieranie aplikacji ze skrótu
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
        // Jeśli pisze w wyszukiwarce lub modal jest aktywny, klawisz 'Esc' zamyka modal / resetuje wyszukiwanie
        if (e.key === "Escape") {
            if (addAppModal.classList.contains("active")) {
                closeModal();
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

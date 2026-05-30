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
        logoType: "image",
        category: "PROD",
        notes: ""
    },
    {
        id: "lingology-app",
        name: "Lingology.app",
        url: "https://lingology.app",
        icon: "assets/lingology-logo-light.png", 
        gradient: "gradient-emerald",
        isDefault: true,
        logoType: "image",
        category: "APP",
        notes: ""
    },
    {
        id: "tutorapp-dashboard",
        name: "TutorApp Dashboard",
        url: "https://tutorapp-khaki.vercel.app/dashboard",
        icon: "assets/lingology-logo-dark.png", 
        gradient: "gradient-lingology",
        isDefault: true,
        logoType: "image",
        category: "STAGE",
        notes: ""
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
    if (matchInStorage) {
        // Zachowujemy notatki oraz kategorię, jeśli została zmodyfikowana
        return { 
            ...defaultApp, 
            notes: matchInStorage.notes || "",
            category: matchInStorage.category || defaultApp.category
        };
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

// Theme Toggle
const btnThemeToggle = document.getElementById("btn-theme-toggle");

// Developer Toolbox Widget
const toolboxTabs = document.querySelectorAll(".toolbox-tab");
const toolboxInput = document.getElementById("toolbox-input");
const toolboxOutput = document.getElementById("toolbox-output");
const btnToolboxRun = document.getElementById("btn-toolbox-run");
const btnToolboxCopy = document.getElementById("btn-toolbox-copy");

// Command Palette
const cmdPalette = document.getElementById("cmd-palette");
const cmdPaletteInput = document.getElementById("cmd-palette-input");
const cmdPaletteResults = document.getElementById("cmd-palette-results");

// Globalne stany
let activeProjectId = null;
let activeToolboxTab = "json"; // json | base64 | url
let selectedCmdIndex = 0;
let filteredCommands = [];

// -------------------------------------------------------------
// MOTYW LIGHT / DARK (THEME TOGGLE)
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem("launchpad_theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        btnThemeToggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        document.body.classList.remove("dark-theme");
        btnThemeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
}

btnThemeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    if (isDark) {
        localStorage.setItem("launchpad_theme", "dark");
        btnThemeToggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        showToast("Przełączono na motyw ciemny! 🌌");
    } else {
        localStorage.setItem("launchpad_theme", "light");
        btnThemeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        showToast("Przełączono na motyw jasny! ☀️");
    }
});

// -------------------------------------------------------------
// LIVE HEALTH CHECKER (APLIKACJE STATUS ONLINE/OFFLINE)
// -------------------------------------------------------------
async function checkAppStatuses() {
    apps.forEach(async (app) => {
        const dot = document.querySelector(`.status-dot[data-ping-id="${app.id}"]`);
        const text = document.querySelector(`.status-text[data-status-text-id="${app.id}"]`);
        
        if (!dot || !text) return;
        
        try {
            // mode: 'no-cors' wysyła ciche zapytanie. Nawet jeśli CORS zablokuje odczyt odpowiedzi,
            // fakt, że serwer odpowiedział oznacza, że jest ONLINE i usługa działa!
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 6000); // 6-sekundowy timeout
            
            await fetch(app.url, { 
                mode: 'no-cors', 
                cache: 'no-store',
                signal: controller.signal
            });
            
            clearTimeout(id);
            
            dot.className = "status-dot online";
            text.textContent = "Online";
        } catch (error) {
            dot.className = "status-dot offline";
            text.textContent = "Offline";
        }
    });
}

// -------------------------------------------------------------
// APILKACJE - RENDEROWANIE SIATKI (PRISTINE CARDS)
// -------------------------------------------------------------
function renderApps(filterQuery = "") {
    appsGrid.innerHTML = "";
    
    const filteredApps = apps.filter(app => {
        const query = filterQuery.toLowerCase();
        return app.name.toLowerCase().includes(query) || 
               app.url.toLowerCase().includes(query) ||
               (app.category && app.category.toLowerCase().includes(query));
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
            <div class="card-notes-indicator" style="margin-top: 6px; font-size: 0.72rem; color: #f97316; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-clipboard"></i> Zapisane poprawki
            </div>
        ` : "";

        // Renderowanie dynamicznej kategorii
        const categoryName = app.category || "PROD";

        // Ultra-czysta i minimalistyczna struktura kafelka z live pingiem i badgem kategorii
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
                <div class="status-container">
                    <span class="status-dot checking" data-ping-id="${app.id}"></span>
                    <span class="status-text" data-status-text-id="${app.id}">Checking...</span>
                </div>
                ${notesIndicatorHtml}
            </div>
            <span class="category-badge">${categoryName}</span>
        `;

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
            } else {
                e.preventDefault();
                e.stopPropagation();
                openProjectDetailsModal(app.id);
            }
        });

        appsGrid.appendChild(card);
    });

    // Uruchomienie sprawdzania statusów po wyrenderowaniu kart
    setTimeout(checkAppStatuses, 100);
}

// -------------------------------------------------------------
// DETALE PROJEKTU MODAL (PROJEKT DETAILS MODAL)
// -------------------------------------------------------------
function openProjectDetailsModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    activeProjectId = appId;

    pModalName.textContent = app.name;
    pModalUrl.href = app.url;
    pModalUrl.querySelector("span").textContent = getCleanDomain(app.url);
    btnPModalLaunch.href = app.url;

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

    pModalNotes.value = app.notes || "";
    pNotesSaveStatus.classList.remove("show");

    projectDetailsModal.classList.add("active");
    pModalNotes.focus();
}

function closeProjectDetailsModal() {
    projectDetailsModal.classList.remove("active");
    activeProjectId = null;
    renderApps(searchInput.value);
}

// Autozapis notatek w modalu
let pNotesTimeout = null;
pModalNotes.addEventListener("input", () => {
    if (!activeProjectId) return;

    pNotesSaveStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`;
    pNotesSaveStatus.classList.add("show");

    clearTimeout(pNotesTimeout);
    pNotesTimeout = setTimeout(() => {
        const textValue = pModalNotes.value;

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

// GENERATOR PROMPTÓW CHATGPT
btnGeneratePrompt.addEventListener("click", () => {
    if (!activeProjectId) return;

    const app = apps.find(a => a.id === activeProjectId);
    if (!app) return;

    const notesText = pModalNotes.value.trim();

    if (notesText.length === 0) {
        showToast("Wpisz najpierw notatki/poprawki dla tego projektu! 📝");
        return;
    }

    const promptText = `Jesteś wybitnym inżynierem oprogramowania i architektem IT. Zwracam się z prośbą o pomoc w wdrożeniu poprawek, naprawie błędów oraz rozwoju mojej aplikacji: ${app.name} (Adres URL projektu: ${app.url}).

Oto lista uwag, błędów do naprawienia oraz planowanych funkcji z mojego notatnika projektowego:
---
${notesText}
---

Proszę Cię o szczegółową analizę każdego z powyższych punktów i przygotowanie:
1. Ustrukturyzowanego planu działania krok-po-kroku (Action Plan) uporządkowanego od kwestii krytycznych po detale wizualne.
2. Zaproponowanie gotowych, zoptymalizowanych rozwiązań technicznych, architektury kodu, wskazówek implementacyjnych oraz konkretnych fragmentów kodu w celach refaktoryzacji, które pomogą mi zaimplementować te poprawki w najprostszy i najbardziej bezawaryjny sposób.`;

    navigator.clipboard.writeText(promptText).then(() => {
        showToast("Skopiowano prompt dla ChatGPT do schowka! 🤖📋");
    }).catch(err => {
        showToast("Nie udało się skopiować promptu.");
    });
});

// -------------------------------------------------------------
// TOOLBOX DEWELOPERA (JSON, BASE64, URL COVERT/FORMAT)
// -------------------------------------------------------------
toolboxTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        toolboxTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        
        activeToolboxTab = tab.getAttribute("data-tab");
        toolboxInput.value = "";
        toolboxOutput.value = "";
        
        // Dynamiczny placeholder dla lepszego UX
        if (activeToolboxTab === "json") {
            toolboxInput.placeholder = "Wklej minifikowany JSON, aby go ustrukturyzować...";
        } else if (activeToolboxTab === "base64") {
            toolboxInput.placeholder = "Wklej tekst do zakodowania LUB zakodowany Base64 do odkodowania (auto-detekcja)...";
        } else {
            toolboxInput.placeholder = "Wklej URL do odkodowania LUB tekst do zakodowania (auto-detekcja)...";
        }
    });
});

// Uruchamianie konwersji
btnToolboxRun.addEventListener("click", () => {
    const input = toolboxInput.value.trim();
    if (!input) {
        toolboxOutput.value = "Błąd: Brak danych wejściowych!";
        return;
    }

    if (activeToolboxTab === "json") {
        try {
            const parsed = JSON.parse(input);
            toolboxOutput.value = JSON.stringify(parsed, null, 4);
            showToast("Sformatowano JSON! 🛠️");
        } catch (e) {
            toolboxOutput.value = `Błąd JSON: Niepoprawny format danych!\n\nSzczegóły: ${e.message}`;
        }
    } 
    else if (activeToolboxTab === "base64") {
        try {
            // Inteligentna auto-detekcja Base64:
            // Próbujemy zdekodować, a jeśli się uda i wynik to tekst ASCII/printable - dekodujemy. Inaczej kodujemy!
            const decoded = atob(input);
            if (/^[\x00-\x7F]*$/.test(decoded)) {
                toolboxOutput.value = decoded;
                showToast("Odkodowano z Base64! 🔓");
            } else {
                throw new Error("Not plain text");
            }
        } catch (e) {
            // Kodowanie
            toolboxOutput.value = btoa(unescape(encodeURIComponent(input))); // Obsługa polskich znaków utf-8
            showToast("Zakodowano do Base64! 🔒");
        }
    } 
    else if (activeToolboxTab === "url") {
        // Auto-detekcja URL
        if (input.includes("%")) {
            try {
                toolboxOutput.value = decodeURIComponent(input);
                showToast("Odkodowano adres URL! 🔓");
            } catch (e) {
                toolboxOutput.value = encodeURIComponent(input);
                showToast("Zakodowano adres URL! 🔒");
            }
        } else {
            toolboxOutput.value = encodeURIComponent(input);
            showToast("Zakodowano adres URL! 🔒");
        }
    }
});

// Kopiowanie wyniku z toolboxa
btnToolboxCopy.addEventListener("click", () => {
    const output = toolboxOutput.value.trim();
    if (!output || output.startsWith("Błąd:")) {
        showToast("Brak poprawnego wyniku do skopiowania!");
        return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
        showToast("Skopiowano wynik z Toolboxa! 📋");
    });
});

// Zapobiegamy skrótom globalnym podczas pisania w toolboxie
[toolboxInput, toolboxOutput].forEach(el => {
    el.addEventListener("keydown", (e) => {
        e.stopPropagation();
    });
});

// -------------------------------------------------------------
// COMMAND PALETTE (RAYCAST / ALFRED STYLE LOGIC)
// -------------------------------------------------------------
function buildCommandsList() {
    const cmdList = [];

    // Dodanie komend systemowych/globalnych
    cmdList.push({
        title: "Dodaj nową aplikację",
        category: "SYSTEM",
        icon: "fa-solid fa-plus",
        action: () => openModal()
    });
    cmdList.push({
        title: "Przełącz motyw (Jasny / Ciemny)",
        category: "SYSTEM",
        icon: "fa-solid fa-circle-half-stroke",
        action: () => btnThemeToggle.click()
    });
    cmdList.push({
        title: "Wyczyść Scratchpad (Główny Notes)",
        category: "SYSTEM",
        icon: "fa-solid fa-trash-can",
        action: () => btnClearScratchpad.click()
    });

    // Dynamiczne komendy dla każdego projektu
    apps.forEach(app => {
        cmdList.push({
            title: `Pokaż szczegóły: ${app.name}`,
            category: "PROJEKT",
            icon: "fa-solid fa-circle-info",
            action: () => openProjectDetailsModal(app.id)
        });
        cmdList.push({
            title: `Uruchom aplikację: ${app.name}`,
            category: "LAUNCH",
            icon: "fa-solid fa-rocket",
            action: () => window.open(app.url, "_blank")
        });
    });

    return cmdList;
}

function openCommandPalette() {
    selectedCmdIndex = 0;
    cmdPaletteInput.value = "";
    cmdPalette.classList.add("active");
    renderCommandResults();
    setTimeout(() => cmdPaletteInput.focus(), 150);
}

function closeCommandPalette() {
    cmdPalette.classList.remove("active");
    cmdPaletteInput.blur();
}

function renderCommandResults() {
    cmdPaletteResults.innerHTML = "";
    const allCommands = buildCommandsList();
    const query = cmdPaletteInput.value.toLowerCase().trim();

    // Filtrowanie komend na bazie wyszukiwania
    filteredCommands = allCommands.filter(cmd => {
        return cmd.title.toLowerCase().includes(query) || cmd.category.toLowerCase().includes(query);
    });

    if (filteredCommands.length === 0) {
        cmdPaletteResults.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem;">
                Brak pasujących poleceń...
            </div>
        `;
        return;
    }

    filteredCommands.forEach((cmd, index) => {
        const item = document.createElement("div");
        item.className = "cmd-item";
        if (index === selectedCmdIndex) {
            item.classList.add("selected");
        }

        item.innerHTML = `
            <div class="cmd-item-left">
                <i class="${cmd.icon}"></i>
                <span>${cmd.title}</span>
            </div>
            <span class="cmd-item-badge">${cmd.category}</span>
        `;

        item.addEventListener("click", () => {
            cmd.action();
            closeCommandPalette();
        });

        // Autoscroll elementu do widoku przy sterowaniu strzałkami
        if (index === selectedCmdIndex) {
            setTimeout(() => {
                item.scrollIntoView({ block: "nearest" });
            }, 20);
        }

        cmdPaletteResults.appendChild(item);
    });
}

// Zdarzenia w Command Palette
cmdPaletteInput.addEventListener("input", () => {
    selectedCmdIndex = 0;
    renderCommandResults();
});

cmdPaletteInput.addEventListener("keydown", (e) => {
    e.stopPropagation(); // Blokowanie globalnych hotkeyów podczas pisania

    if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length;
        renderCommandResults();
    } 
    else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderCommandResults();
    } 
    else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedCmdIndex]) {
            filteredCommands[selectedCmdIndex].action();
            closeCommandPalette();
        }
    } 
    else if (e.key === "Escape") {
        e.preventDefault();
        closeCommandPalette();
    }
});

cmdPalette.addEventListener("click", (e) => {
    if (e.target === cmdPalette) closeCommandPalette();
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
    const category = document.getElementById("app-category").value.trim().toUpperCase() || "PROD";
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
        category,
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
    
    let hours = now.getHours().toString().padStart(2, "0");
    let minutes = now.getMinutes().toString().padStart(2, "0");
    let seconds = now.getSeconds().toString().padStart(2, "0");
    clockTime.textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateStr = now.toLocaleDateString('pl-PL', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    clockDate.textContent = dateStr;

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

// Zapobiegamy skrótom podczas pisania w notatniku głównym
scratchpad.addEventListener("keydown", (e) => {
    e.stopPropagation();
});

// -------------------------------------------------------------
// WYSZUKIWANIE & FILTROWANIE W PASKU
// -------------------------------------------------------------
searchInput.addEventListener("input", (e) => {
    renderApps(e.target.value);
});

// -------------------------------------------------------------
// SKRÓTY KLAWISZOWE (GLOBALNE)
// -------------------------------------------------------------
document.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    const isTyping = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";

    // Wywołanie Command Palette: Ctrl + K lub Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (cmdPalette.classList.contains("active")) {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
        return;
    }

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
            } else if (cmdPalette.classList.contains("active")) {
                closeCommandPalette();
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
initTheme();
renderApps();

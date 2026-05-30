// ============================================================
// WORKSPACE 3.0 — KUBA'S DEVELOPER LAUNCHPAD
// Wszystkie funkcje: Pomodoro, Drag&Drop, Focus Mode, GitHub,
// Snippety, Clipboard History, Session Timer, Webhook,
// TODO priorytety, localPath + AI Editors, Global Tags
// ============================================================

// ─────────────────────────────────────────────────────────────
// SEKCJA 1: MODEL DANYCH & LOCALSTORAGE
// ─────────────────────────────────────────────────────────────

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
        tags: ["lingology", "prod", "frontend"],
        todos: [],
        sessions: [],
        localPath: "",
        webhookUrl: "",
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
        tags: ["lingology", "app", "mobile"],
        todos: [],
        sessions: [],
        localPath: "",
        webhookUrl: "",
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
        tags: ["tutorapp", "stage", "dashboard"],
        todos: [],
        sessions: [],
        localPath: "",
        webhookUrl: "",
        notes: ""
    }
];

function migrateApp(app) {
    // Migrate notes string → single todo if needed
    let todos = app.todos || [];
    if ((!todos || todos.length === 0) && app.notes && app.notes.trim().length > 0) {
        todos = [{ id: Date.now(), text: app.notes.trim(), priority: 'normal', done: false }];
    }
    return {
        ...app,
        tags: app.tags || [],
        todos: todos,
        sessions: app.sessions || [],
        localPath: app.localPath || "",
        webhookUrl: app.webhookUrl || "",
        notes: app.notes || ""
    };
}

let storedApps = [];
try { storedApps = JSON.parse(localStorage.getItem("launchpad_apps")) || []; } catch (e) { storedApps = []; }
if (storedApps.length === 0) storedApps = [...DEFAULT_APPS];

const customApps = storedApps.filter(app => !app.isDefault).map(migrateApp);

const mergedDefaultApps = DEFAULT_APPS.map(def => {
    const match = storedApps.find(a => a.id === def.id);
    if (match) {
        const migrated = migrateApp(match);
        return { ...def, tags: migrated.tags || def.tags, todos: migrated.todos, sessions: migrated.sessions, localPath: migrated.localPath, webhookUrl: migrated.webhookUrl, notes: migrated.notes, category: migrated.category || def.category };
    }
    return def;
});

let apps = [...mergedDefaultApps, ...customApps];

function saveApps() {
    localStorage.setItem("launchpad_apps", JSON.stringify(apps));
}
saveApps();

// ─────────────────────────────────────────────────────────────
// SEKCJA 2: DOM SELECTORS (defensive)
// ─────────────────────────────────────────────────────────────

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

const addAppModal = document.getElementById("add-app-modal");
const btnAddApp = document.getElementById("btn-add-app");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const addAppForm = document.getElementById("add-app-form");

const projectDetailsModal = document.getElementById("project-details-modal");
const btnClosePModal = document.getElementById("btn-close-p-modal");
const pModalName = document.getElementById("p-modal-name");
const pModalUrl = document.getElementById("p-modal-url");
const pModalIcon = document.getElementById("p-modal-icon");
const btnPModalLaunch = document.getElementById("btn-p-modal-launch");
const btnStartSession = document.getElementById("btn-start-session");
const btnToggleWebhook = document.getElementById("btn-toggle-webhook");
const editorButtonsRow = document.getElementById("editor-buttons-row");
const aiRoleSelect = document.getElementById("ai-role-select");
const btnGeneratePrompt = document.getElementById("btn-generate-prompt");
const btnSendAgentPrompt = document.getElementById("btn-send-agent-prompt");
const webhookSection = document.getElementById("webhook-section");
const webhookUrlInput = document.getElementById("webhook-url-input");
const btnSaveWebhook = document.getElementById("btn-save-webhook");
const btnTriggerWebhook = document.getElementById("btn-trigger-webhook");
const sessionHistorySection = document.getElementById("session-history-section");
const sessionList = document.getElementById("session-list");
const totalTimeLabel = document.getElementById("total-time-label");

const btnThemeToggle = document.getElementById("btn-theme-toggle");
const btnFocusMode = document.getElementById("btn-focus-mode");

const toolboxTabs = document.querySelectorAll(".toolbox-tab");
const toolboxInput = document.getElementById("toolbox-input");
const toolboxOutput = document.getElementById("toolbox-output");
const btnToolboxRun = document.getElementById("btn-toolbox-run");
const btnToolboxCopy = document.getElementById("btn-toolbox-copy");

const cmdPalette = document.getElementById("cmd-palette");
const cmdPaletteInput = document.getElementById("cmd-palette-input");
const cmdPaletteResults = document.getElementById("cmd-palette-results");

const clipboardHistoryModal = document.getElementById("clipboard-history-modal");
const btnCloseClipboardModal = document.getElementById("btn-close-clipboard-modal");
const btnClearClipboard = document.getElementById("btn-clear-clipboard");
const clipboardHistoryList = document.getElementById("clipboard-history-list");

const snippetsModal = document.getElementById("snippets-modal");
const btnCloseSnippetsModal = document.getElementById("btn-close-snippets-modal");
const snippetTriggerInput = document.getElementById("snippet-trigger");
const snippetExpansionInput = document.getElementById("snippet-expansion");
const btnAddSnippet = document.getElementById("btn-add-snippet");
const snippetsList = document.getElementById("snippets-list");

const pomodoroDisplay = document.getElementById("pomo-display");
const pomodoroModeLabel = document.getElementById("pomo-mode-label");
const pomodoroSessions = document.getElementById("pomodoro-sessions");
const pomodoroRingProgress = document.getElementById("pomo-ring-progress");
const btnPomoStart = document.getElementById("btn-pomo-start");
const btnPomoPause = document.getElementById("btn-pomo-pause");
const btnPomoReset = document.getElementById("btn-pomo-reset");
const pomoTabs = document.querySelectorAll(".pomo-tab");

const githubGraphImg = document.getElementById("github-graph-img");
const githubPlaceholder = document.getElementById("github-placeholder");
const githubUsernameLabel = document.getElementById("github-username-label");
const btnSetupGithub = document.getElementById("btn-setup-github");
const btnGhSettings = document.getElementById("btn-gh-settings");

const activeSessionBadge = document.getElementById("active-session-badge");
const activeSessionName = document.getElementById("active-session-name");
const activeSessionTimer = document.getElementById("active-session-timer");
const btnStopSession = document.getElementById("btn-stop-session");

// ─────────────────────────────────────────────────────────────
// SEKCJA 3: GLOBALNE STANY
// ─────────────────────────────────────────────────────────────

let activeProjectId = null;
let activeToolboxTab = "json";
let selectedCmdIndex = 0;
let filteredCommands = [];
let activeTodoFilter = "all";
let activeTagFilters = [];
let dragSourceIndex = -1;

// Pomodoro state
const pomo = {
    isRunning: false,
    isPaused: false,
    totalSeconds: 1500,
    remainingSeconds: 1500,
    completedToday: parseInt(localStorage.getItem("pomo_completed_today") || "0"),
    lastDate: localStorage.getItem("pomo_last_date") || "",
    intervalId: null,
    label: "Fokus",
    mode: "focus"
};

// Session tracking
let activeSession = null; // { appId, startTime, intervalId }

// ─────────────────────────────────────────────────────────────
// SEKCJA 4: TEMA (LIGHT / DARK)
// ─────────────────────────────────────────────────────────────

function initTheme() {
    const t = localStorage.getItem("launchpad_theme") || "light";
    if (t === "dark") {
        document.body.classList.add("dark-theme");
        if (btnThemeToggle) btnThemeToggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        document.body.classList.remove("dark-theme");
        if (btnThemeToggle) btnThemeToggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
}

if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("launchpad_theme", isDark ? "dark" : "light");
        btnThemeToggle.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
        showToast(isDark ? "Motyw ciemny 🌌" : "Motyw jasny ☀️");
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 5: FOCUS MODE
// ─────────────────────────────────────────────────────────────

function toggleFocusMode() {
    const isActive = document.body.classList.toggle("focus-mode");
    localStorage.setItem("launchpad_focus", isActive ? "1" : "0");
    if (btnFocusMode) {
        btnFocusMode.innerHTML = isActive
            ? `<i class="fa-solid fa-compress"></i>`
            : `<i class="fa-solid fa-expand"></i>`;
        btnFocusMode.title = isActive ? "Wyłącz Focus Mode (Shift+F)" : "Focus Mode (Shift+F)";
    }
    showToast(isActive ? "Focus Mode ON — sidebar ukryty 🎯" : "Focus Mode OFF");
}

if (btnFocusMode) btnFocusMode.addEventListener("click", toggleFocusMode);

function initFocusMode() {
    if (localStorage.getItem("launchpad_focus") === "1") {
        document.body.classList.add("focus-mode");
        if (btnFocusMode) btnFocusMode.innerHTML = `<i class="fa-solid fa-compress"></i>`;
    }
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 6: LIVE HEALTH CHECKER
// ─────────────────────────────────────────────────────────────

async function checkAppStatuses() {
    apps.forEach(async (app) => {
        const dot = document.querySelector(`.status-dot[data-ping-id="${app.id}"]`);
        const text = document.querySelector(`.status-text[data-status-text-id="${app.id}"]`);
        if (!dot || !text) return;
        try {
            const ctrl = new AbortController();
            const id = setTimeout(() => ctrl.abort(), 6000);
            await fetch(app.url, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal });
            clearTimeout(id);
            dot.className = "status-dot online";
            text.textContent = "Online";
        } catch {
            dot.className = "status-dot offline";
            text.textContent = "Offline";
        }
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 7: GLOBALNY SYSTEM TAGÓW / FILTRÓW
// ─────────────────────────────────────────────────────────────

function getAllTags() {
    const set = new Set();
    apps.forEach(app => (app.tags || []).forEach(t => t && set.add(t.toLowerCase())));
    return [...set].sort();
}

function buildFilterBar() {
    const list = document.getElementById("filter-tags-list");
    const clearBtn = document.getElementById("btn-clear-filters");
    if (!list) return;
    list.innerHTML = "";

    const allTags = getAllTags();
    if (allTags.length === 0) {
        list.innerHTML = `<span style="font-size:0.72rem;color:var(--text-muted);">Brak tagów — dodaj tagi do aplikacji</span>`;
        return;
    }

    allTags.forEach(tag => {
        const btn = document.createElement("button");
        btn.className = "filter-tag-btn" + (activeTagFilters.includes(tag) ? " active" : "");
        btn.textContent = tag;
        btn.addEventListener("click", () => {
            if (activeTagFilters.includes(tag)) {
                activeTagFilters = activeTagFilters.filter(t => t !== tag);
            } else {
                activeTagFilters.push(tag);
            }
            buildFilterBar();
            renderApps(searchInput ? searchInput.value : "");
        });
        list.appendChild(btn);
    });

    if (clearBtn) {
        clearBtn.style.display = activeTagFilters.length > 0 ? "inline-flex" : "none";
    }
}

const btnClearFilters = document.getElementById("btn-clear-filters");
if (btnClearFilters) {
    btnClearFilters.addEventListener("click", () => {
        activeTagFilters = [];
        buildFilterBar();
        renderApps(searchInput ? searchInput.value : "");
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 8: RENDEROWANIE KART APLIKACJI
// ─────────────────────────────────────────────────────────────

function getCleanDomain(url) {
    try { return new URL(url).hostname.replace("www.", ""); }
    catch { return url.replace(/https?:\/\//, "").split("/")[0]; }
}

function renderApps(filterQuery = "") {
    if (!appsGrid) return;
    appsGrid.innerHTML = "";

    const q = filterQuery.toLowerCase().trim();
    const filtered = apps.filter(app => {
        const matchQuery = !q || app.name.toLowerCase().includes(q) || app.url.toLowerCase().includes(q) || (app.category && app.category.toLowerCase().includes(q));
        const matchTags = activeTagFilters.length === 0 || activeTagFilters.every(ft => (app.tags || []).includes(ft));
        return matchQuery && matchTags;
    });

    if (appsCount) appsCount.textContent = `${filtered.length} ${getPolishAppNoun(filtered.length)}`;

    if (filtered.length === 0) {
        appsGrid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-ghost"></i><p>Nie znaleziono aplikacji</p></div>`;
        return;
    }

    filtered.forEach((app, index) => {
        const card = document.createElement("a");
        card.href = app.url;
        card.target = "_blank";
        card.className = "app-card";
        card.setAttribute("data-id", app.id);
        card.setAttribute("draggable", "true");

        let iconHtml = app.logoType === "image"
            ? `<img src="${app.icon}" alt="${app.name}" class="app-logo-img">`
            : app.icon.startsWith("fa-")
                ? `<i class="${app.icon}"></i>`
                : `<span class="emoji">${app.icon}</span>`;

        const badge = index < 9 ? `<span class="shortcut-number">${index + 1}</span>` : "";
        const hasNotes = app.todos && app.todos.some(t => !t.done);
        const notesIndicator = hasNotes
            ? `<div class="card-notes-indicator"><i class="fa-regular fa-clipboard"></i> ${app.todos.filter(t => !t.done).length} todo</div>` : "";
        const tagPills = (app.tags || []).slice(0, 3).map(t => `<span class="app-tag-pill">${t}</span>`).join("");
        const deleteBtn = !app.isDefault ? `<button class="action-btn delete-btn" data-action="delete"><i class="fa-regular fa-trash-can"></i></button>` : "";

        card.innerHTML = `
            <i class="fa-solid fa-grip-vertical drag-handle"></i>
            <div class="card-actions">
                <button class="action-btn copy-btn" data-action="copy" title="Kopiuj link"><i class="fa-regular fa-copy"></i></button>
                ${deleteBtn}
            </div>
            <div class="card-header">
                <div class="app-icon-container icon-${app.gradient || 'gradient-cyber'}">${iconHtml}</div>
                ${badge}
            </div>
            <div class="card-body">
                <h3 class="app-title">${app.name}</h3>
                <div class="app-url"><i class="fa-solid fa-link" style="font-size:0.65rem;opacity:0.6;"></i> ${getCleanDomain(app.url)}</div>
                <div class="status-container">
                    <span class="status-dot checking" data-ping-id="${app.id}"></span>
                    <span class="status-text" data-status-text-id="${app.id}">Checking...</span>
                </div>
                ${tagPills ? `<div class="app-tags-row">${tagPills}</div>` : ""}
                ${notesIndicator}
            </div>
            <span class="category-badge">${app.category || "PROD"}</span>
        `;

        card.addEventListener("click", e => {
            const btn = e.target.closest(".action-btn");
            if (btn) {
                e.preventDefault(); e.stopPropagation();
                if (btn.dataset.action === "copy") copyToClipboard(app.url);
                else if (btn.dataset.action === "delete") deleteApp(app.id);
            } else {
                e.preventDefault(); e.stopPropagation();
                openProjectDetailsModal(app.id);
            }
        });

        // Drag & Drop events
        card.addEventListener("dragstart", e => {
            dragSourceIndex = apps.indexOf(app);
            card.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
        });
        card.addEventListener("dragend", () => card.classList.remove("dragging"));
        card.addEventListener("dragover", e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; card.classList.add("drag-over"); });
        card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
        card.addEventListener("drop", e => {
            e.preventDefault();
            card.classList.remove("drag-over");
            const targetIndex = apps.indexOf(app);
            if (dragSourceIndex !== -1 && dragSourceIndex !== targetIndex) {
                const [moved] = apps.splice(dragSourceIndex, 1);
                apps.splice(targetIndex, 0, moved);
                saveApps();
                renderApps(searchInput ? searchInput.value : "");
            }
        });

        appsGrid.appendChild(card);
    });

    setTimeout(checkAppStatuses, 100);
}

function getPolishAppNoun(n) {
    if (n === 1) return "aplikacja";
    if (n >= 2 && n <= 4) return "aplikacje";
    return "aplikacji";
}

function deleteApp(id) {
    if (!confirm("Usunąć tę aplikację? Notatki i sesje zostaną utracone.")) return;
    apps = apps.filter(a => a.id !== id);
    saveApps();
    buildFilterBar();
    renderApps(searchInput ? searchInput.value : "");
    showToast("Aplikacja usunięta 🗑️");
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 9: TOAST & CLIPBOARD
// ─────────────────────────────────────────────────────────────

function showToast(msg) {
    if (!toast) return;
    toast.querySelector(".toast-message").textContent = msg;
    toast.classList.add("show");
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        saveToClipboardHistory(text);
        showToast("Skopiowano do schowka 📋");
    }).catch(() => showToast("Nie udało się skopiować."));
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 10: HISTORIA SCHOWKA
// ─────────────────────────────────────────────────────────────

function loadClipboardHistory() {
    try { return JSON.parse(localStorage.getItem("launchpad_clipboard")) || []; }
    catch { return []; }
}

function saveToClipboardHistory(text) {
    let history = loadClipboardHistory();
    history = history.filter(h => h.text !== text);
    history.unshift({ text, timestamp: Date.now() });
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem("launchpad_clipboard", JSON.stringify(history));
}

function openClipboardHistoryModal() {
    if (!clipboardHistoryModal) return;
    renderClipboardHistory();
    clipboardHistoryModal.classList.add("active");
}

function renderClipboardHistory() {
    if (!clipboardHistoryList) return;
    const history = loadClipboardHistory();
    if (history.length === 0) {
        clipboardHistoryList.innerHTML = `<div class="clipboard-empty"><i class="fa-regular fa-clipboard"></i><p>Historia schowka jest pusta</p></div>`;
        return;
    }
    clipboardHistoryList.innerHTML = "";
    history.forEach(item => {
        const el = document.createElement("div");
        el.className = "clipboard-item";
        const timeAgo = formatTimeAgo(item.timestamp);
        el.innerHTML = `
            <i class="fa-regular fa-clipboard" style="color:var(--color-accent);flex-shrink:0;font-size:0.75rem;"></i>
            <span class="clipboard-item-text" title="${item.text}">${item.text}</span>
            <span class="clipboard-item-time">${timeAgo}</span>
        `;
        el.addEventListener("click", () => {
            navigator.clipboard.writeText(item.text).then(() => {
                clipboardHistoryModal.classList.remove("active");
                showToast("Ponownie skopiowano! 📋");
            });
        });
        clipboardHistoryList.appendChild(el);
    });
}

function formatTimeAgo(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return "przed chwilą";
    if (diff < 3600) return `${Math.floor(diff / 60)}min temu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h temu`;
    return new Date(ts).toLocaleDateString("pl-PL");
}

if (btnCloseClipboardModal) btnCloseClipboardModal.addEventListener("click", () => clipboardHistoryModal.classList.remove("active"));
if (clipboardHistoryModal) clipboardHistoryModal.addEventListener("click", e => { if (e.target === clipboardHistoryModal) clipboardHistoryModal.classList.remove("active"); });
if (btnClearClipboard) {
    btnClearClipboard.addEventListener("click", () => {
        if (!confirm("Wyczyścić całą historię schowka?")) return;
        localStorage.removeItem("launchpad_clipboard");
        renderClipboardHistory();
        showToast("Historia schowka wyczyszczona 🧹");
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 11: SNIPPETY
// ─────────────────────────────────────────────────────────────

function loadSnippets() {
    try { return JSON.parse(localStorage.getItem("launchpad_snippets")) || []; }
    catch { return []; }
}

function saveSnippets(snippets) {
    localStorage.setItem("launchpad_snippets", JSON.stringify(snippets));
}

function addSnippet(trigger, expansion) {
    if (!trigger || !expansion) { showToast("Podaj skrót i rozwinięcie!"); return; }
    const snippets = loadSnippets();
    snippets.push({ id: Date.now(), trigger: trigger.trim(), expansion: expansion.trim() });
    saveSnippets(snippets);
    renderSnippets();
    showToast(`Snippet "${trigger}" dodany! ✂️`);
}

function deleteSnippet(id) {
    saveSnippets(loadSnippets().filter(s => s.id !== id));
    renderSnippets();
    showToast("Snippet usunięty 🗑️");
}

function renderSnippets() {
    if (!snippetsList) return;
    const snippets = loadSnippets();
    if (snippets.length === 0) {
        snippetsList.innerHTML = `<div class="snippets-empty"><i class="fa-solid fa-file-code" style="font-size:1.5rem;opacity:0.3;"></i><p>Brak snippetów — dodaj swój pierwszy skrót powyżej!</p></div>`;
        return;
    }
    snippetsList.innerHTML = "";
    snippets.forEach(s => {
        const el = document.createElement("div");
        el.className = "snippet-item";
        el.innerHTML = `
            <span class="snippet-trigger">${s.trigger}</span>
            <i class="fa-solid fa-arrow-right snippet-arrow"></i>
            <span class="snippet-expansion" title="${s.expansion}">${s.expansion}</span>
            <button class="snippet-copy-btn" title="Kopiuj do schowka"><i class="fa-regular fa-copy"></i></button>
            <button class="snippet-delete-btn" title="Usuń snippet"><i class="fa-regular fa-trash-can"></i></button>
        `;
        el.querySelector(".snippet-copy-btn").addEventListener("click", e => {
            e.stopPropagation();
            copyToClipboard(s.expansion);
        });
        el.querySelector(".snippet-delete-btn").addEventListener("click", e => {
            e.stopPropagation();
            deleteSnippet(s.id);
        });
        el.addEventListener("click", () => copyToClipboard(s.expansion));
        snippetsList.appendChild(el);
    });
}

function openSnippetsModal() {
    if (!snippetsModal) return;
    renderSnippets();
    snippetsModal.classList.add("active");
}

if (btnCloseSnippetsModal) btnCloseSnippetsModal.addEventListener("click", () => snippetsModal.classList.remove("active"));
if (snippetsModal) snippetsModal.addEventListener("click", e => { if (e.target === snippetsModal) snippetsModal.classList.remove("active"); });
if (btnAddSnippet) {
    btnAddSnippet.addEventListener("click", () => {
        addSnippet(snippetTriggerInput ? snippetTriggerInput.value : "", snippetExpansionInput ? snippetExpansionInput.value : "");
        if (snippetTriggerInput) snippetTriggerInput.value = "";
        if (snippetExpansionInput) snippetExpansionInput.value = "";
    });
}
if (snippetTriggerInput) snippetTriggerInput.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") btnAddSnippet && btnAddSnippet.click(); });
if (snippetExpansionInput) snippetExpansionInput.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") btnAddSnippet && btnAddSnippet.click(); });

// ─────────────────────────────────────────────────────────────
// SEKCJA 12: PROJECT DETAILS MODAL
// ─────────────────────────────────────────────────────────────

function openProjectDetailsModal(appId) {
    if (!projectDetailsModal) return;
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    activeProjectId = appId;
    activeTodoFilter = "all";

    if (pModalName) pModalName.textContent = app.name;
    if (pModalUrl) {
        pModalUrl.href = app.url;
        pModalUrl.querySelector("span").textContent = getCleanDomain(app.url);
    }
    if (btnPModalLaunch) btnPModalLaunch.href = app.url;

    if (pModalIcon) {
        pModalIcon.className = `app-icon-container icon-${app.gradient || 'gradient-cyber'}`;
        pModalIcon.innerHTML = app.logoType === "image"
            ? `<img src="${app.icon}" alt="${app.name}" class="app-logo-img">`
            : app.icon.startsWith("fa-")
                ? `<i class="${app.icon}"></i>`
                : `<span class="emoji">${app.icon}</span>`;
    }

    // Editor buttons
    if (editorButtonsRow) {
        editorButtonsRow.style.display = app.localPath ? "flex" : "none";
    }

    // Session badge & history
    updateSessionButtonLabel(appId);
    renderSessionHistory(appId);

    // Webhook
    if (webhookSection) webhookSection.style.display = "none";
    if (webhookUrlInput) webhookUrlInput.value = app.webhookUrl || "";

    // Todo filter buttons
    document.querySelectorAll(".todo-filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.filter === "all");
    });

    renderTodos(appId, "all");

    projectDetailsModal.classList.add("active");
}

function closeProjectDetailsModal() {
    if (!projectDetailsModal) return;
    projectDetailsModal.classList.remove("active");
    activeProjectId = null;
    renderApps(searchInput ? searchInput.value : "");
}

if (btnClosePModal) btnClosePModal.addEventListener("click", closeProjectDetailsModal);
if (projectDetailsModal) {
    projectDetailsModal.addEventListener("click", e => {
        if (e.target === projectDetailsModal) closeProjectDetailsModal();
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 13: SYSTEM TODO (Priorytety)
// ─────────────────────────────────────────────────────────────

const PRIORITY_CYCLE = ["critical", "normal", "info"];
const PRIORITY_COLOR = { critical: "#ef4444", normal: "#f59e0b", info: "#3b82f6" };

function renderTodos(appId, filter = "all") {
    const todosList = document.getElementById("todos-list");
    if (!todosList) return;
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    let todos = app.todos || [];

    if (filter === "done") todos = todos.filter(t => t.done);
    else if (filter === "critical") todos = todos.filter(t => t.priority === "critical" && !t.done);
    else if (filter === "normal") todos = todos.filter(t => t.priority === "normal" && !t.done);
    else if (filter === "info") todos = todos.filter(t => t.priority === "info" && !t.done);
    else todos = [...todos].sort((a, b) => {
        const pri = { critical: 0, normal: 1, info: 2 };
        if (a.done !== b.done) return a.done ? 1 : -1;
        return (pri[a.priority] || 1) - (pri[b.priority] || 1);
    });

    if (todos.length === 0) {
        todosList.innerHTML = `<div class="todos-empty">${filter === "done" ? "Żadne zadanie nie jest jeszcze ukończone ✨" : "Brak zadań — dodaj swoje pierwsze TODO!"}</div>`;
        return;
    }

    todosList.innerHTML = "";
    todos.forEach(todo => {
        const el = document.createElement("div");
        el.className = "todo-item" + (todo.done ? " done" : "");
        el.innerHTML = `
            <div class="todo-priority-dot ${todo.priority || 'normal'}" title="Kliknij aby zmienić priorytet" data-todoid="${todo.id}"></div>
            <input type="checkbox" class="todo-checkbox" ${todo.done ? "checked" : ""} data-todoid="${todo.id}">
            <span class="todo-text">${todo.text}</span>
            <button class="todo-delete-btn" data-todoid="${todo.id}" title="Usuń zadanie"><i class="fa-regular fa-trash-can"></i></button>
        `;
        el.querySelector(".todo-priority-dot").addEventListener("click", e => { e.stopPropagation(); cycleTodoPriority(appId, todo.id); });
        el.querySelector(".todo-checkbox").addEventListener("change", () => toggleTodoDone(appId, todo.id));
        el.querySelector(".todo-delete-btn").addEventListener("click", e => { e.stopPropagation(); deleteTodo(appId, todo.id); });
        todosList.appendChild(el);
    });
}

function addTodo(appId, text, priority = "normal") {
    if (!text.trim()) { showToast("Wpisz treść zadania!"); return; }
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    app.todos = app.todos || [];
    app.todos.unshift({ id: Date.now(), text: text.trim(), priority, done: false });
    saveApps();
    renderTodos(appId, activeTodoFilter);
    renderApps(searchInput ? searchInput.value : "");
}

function toggleTodoDone(appId, todoId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const todo = (app.todos || []).find(t => t.id === todoId);
    if (todo) todo.done = !todo.done;
    saveApps();
    renderTodos(appId, activeTodoFilter);
    renderApps(searchInput ? searchInput.value : "");
}

function deleteTodo(appId, todoId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    app.todos = (app.todos || []).filter(t => t.id !== todoId);
    saveApps();
    renderTodos(appId, activeTodoFilter);
    renderApps(searchInput ? searchInput.value : "");
}

function cycleTodoPriority(appId, todoId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const todo = (app.todos || []).find(t => t.id === todoId);
    if (!todo) return;
    const idx = PRIORITY_CYCLE.indexOf(todo.priority || "normal");
    todo.priority = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    saveApps();
    renderTodos(appId, activeTodoFilter);
}

// Todo add row
const todoInput = document.getElementById("todo-input");
const todoPrioritySelect = document.getElementById("todo-priority-select");
const btnAddTodo = document.getElementById("btn-add-todo");

if (btnAddTodo) {
    btnAddTodo.addEventListener("click", () => {
        if (!activeProjectId) return;
        addTodo(activeProjectId, todoInput ? todoInput.value : "", todoPrioritySelect ? todoPrioritySelect.value : "normal");
        if (todoInput) todoInput.value = "";
    });
}
if (todoInput) {
    todoInput.addEventListener("keydown", e => {
        e.stopPropagation();
        if (e.key === "Enter") btnAddTodo && btnAddTodo.click();
    });
}

// Todo filter buttons
document.querySelectorAll(".todo-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".todo-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTodoFilter = btn.dataset.filter;
        if (activeProjectId) renderTodos(activeProjectId, activeTodoFilter);
    });
});

// ─────────────────────────────────────────────────────────────
// SEKCJA 14: SESSION TIMER (Śledzenie czasu)
// ─────────────────────────────────────────────────────────────

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${sec}s`;
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
        : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startSession(appId) {
    if (activeSession) stopSession();
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const startTime = Date.now();
    const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (activeSessionTimer) activeSessionTimer.textContent = formatTime(elapsed);
    }, 1000);

    activeSession = { appId, startTime, intervalId };

    if (activeSessionBadge) activeSessionBadge.classList.add("visible");
    if (activeSessionName) activeSessionName.textContent = app.name;
    if (activeSessionTimer) activeSessionTimer.textContent = "00:00";

    updateSessionButtonLabel(appId);
    showToast(`⏱️ Sesja uruchomiona: ${app.name}`);
}

function stopSession() {
    if (!activeSession) return;
    clearInterval(activeSession.intervalId);
    const duration = Date.now() - activeSession.startTime;
    const app = apps.find(a => a.id === activeSession.appId);
    if (app) {
        app.sessions = app.sessions || [];
        app.sessions.unshift({ start: activeSession.startTime, end: Date.now(), duration });
        if (app.sessions.length > 50) app.sessions = app.sessions.slice(0, 50);
        saveApps();
    }

    if (activeSessionBadge) activeSessionBadge.classList.remove("visible");
    if (activeSessionTimer) activeSessionTimer.textContent = "00:00";

    const prevId = activeSession.appId;
    activeSession = null;

    showToast(`✅ Sesja zakończona — ${formatDuration(duration)}`);

    if (prevId === activeProjectId) {
        updateSessionButtonLabel(prevId);
        renderSessionHistory(prevId);
    }
}

function updateSessionButtonLabel(appId) {
    if (!btnStartSession) return;
    const isActive = activeSession && activeSession.appId === appId;
    btnStartSession.innerHTML = isActive
        ? `<i class="fa-solid fa-stop"></i> Zatrzymaj`
        : `<i class="fa-solid fa-stopwatch"></i> Sesja`;
    btnStartSession.title = isActive ? "Zakończ sesję śledzenia czasu" : "Zacznij śledzić czas pracy";
}

function renderSessionHistory(appId) {
    if (!sessionHistorySection || !sessionList || !totalTimeLabel) return;
    const app = apps.find(a => a.id === appId);
    const sessions = app ? (app.sessions || []) : [];

    if (sessions.length === 0) {
        sessionHistorySection.style.display = "none";
        return;
    }

    sessionHistorySection.style.display = "block";
    const totalMs = sessions.reduce((sum, s) => sum + s.duration, 0);
    totalTimeLabel.textContent = `Łącznie: ${formatDuration(totalMs)}`;

    sessionList.innerHTML = "";
    sessions.slice(0, 10).forEach(s => {
        const el = document.createElement("div");
        el.className = "session-item";
        el.innerHTML = `
            <span>${new Date(s.start).toLocaleDateString("pl-PL")}</span>
            <span class="session-item-time">${formatDuration(s.duration)}</span>
        `;
        sessionList.appendChild(el);
    });
}

if (btnStartSession) {
    btnStartSession.addEventListener("click", () => {
        if (!activeProjectId) return;
        if (activeSession && activeSession.appId === activeProjectId) {
            stopSession();
        } else {
            if (activeSession) stopSession();
            startSession(activeProjectId);
        }
    });
}

if (btnStopSession) btnStopSession.addEventListener("click", stopSession);

// ─────────────────────────────────────────────────────────────
// SEKCJA 15: AI EDITOR BUTTONS (Cursor, Claude Code, Antigravity, Codex)
// ─────────────────────────────────────────────────────────────

function getAppLocalPath() {
    if (!activeProjectId) return "";
    const app = apps.find(a => a.id === activeProjectId);
    return app ? (app.localPath || "") : "";
}

function openInCursor() {
    const p = getAppLocalPath();
    if (!p) return;
    const uri = `cursor://file/${p.replace(/\\/g, "/")}`;
    window.open(uri, "_blank");
    showToast("Otwieranie w Cursor... 🖱️");
}

function openInClaudeCode() {
    const p = getAppLocalPath();
    if (!p) return;
    copyToClipboard(`claude "${p}"`);
    showToast("Skopiowano komendę Claude Code! Wklej w terminalu 🟡");
}

function openInAntigravity() {
    const p = getAppLocalPath();
    if (!p) return;
    copyToClipboard(`antigravity "${p}"`);
    showToast("Skopiowano ścieżkę dla Antigravity! 🤖");
}

function openInCodex() {
    const p = getAppLocalPath();
    if (!p) return;
    copyToClipboard(`codex "${p}"`);
    showToast("Skopiowano komendę Codex! Wklej w terminalu 🟢");
}

const btnOpenCursor = document.getElementById("btn-open-cursor");
const btnOpenClaudeCode = document.getElementById("btn-open-claude-code");
const btnOpenAntigravity = document.getElementById("btn-open-antigravity");
const btnOpenCodex = document.getElementById("btn-open-codex");

if (btnOpenCursor) btnOpenCursor.addEventListener("click", openInCursor);
if (btnOpenClaudeCode) btnOpenClaudeCode.addEventListener("click", openInClaudeCode);
if (btnOpenAntigravity) btnOpenAntigravity.addEventListener("click", openInAntigravity);
if (btnOpenCodex) btnOpenCodex.addEventListener("click", openInCodex);

// ─────────────────────────────────────────────────────────────
// SEKCJA 16: AI PROMPTER (role-based, XML-structured)
// ─────────────────────────────────────────────────────────────

function buildTodosText(app) {
    const todos = (app.todos || []).filter(t => !t.done);
    if (todos.length === 0) return null;
    return todos.map((t, i) => {
        const emoji = { critical: "🔴", normal: "🟡", info: "🔵" }[t.priority] || "🟡";
        return `${i + 1}. ${emoji} ${t.text}`;
    }).join("\n");
}

if (btnGeneratePrompt) {
    btnGeneratePrompt.addEventListener("click", () => {
        if (!activeProjectId) return;
        const app = apps.find(a => a.id === activeProjectId);
        if (!app) return;

        const notesText = buildTodosText(app);
        if (!notesText) { showToast("Dodaj najpierw zadania TODO do tego projektu! 📝"); return; }

        const role = aiRoleSelect ? aiRoleSelect.value : "developer";
        let promptText = "", roleTitle = "";

        const localPathXml = app.localPath ? `\n  <local_path>${app.localPath}</local_path>` : "";

        if (role === "developer") {
            roleTitle = "Senior Developer & Architekt Oprogramowania 💻";
            promptText = `Jesteś wybitnym Senior Developerem i Architektem IT. Pom\xF3\u017C mi wdro\u017Cy\u0107 poprawki i rozwin\u0105\u0107 moj\u0105 aplikacj\u0119.\n\n<project_context>\n  <name>${app.name}</name>\n  <url>${app.url}</url>${localPathXml}\n  <role>${roleTitle}</role>\n</project_context>\n\n<tasks_todo>\n${notesText}\n</tasks_todo>\n\nPrzygotuj:\n1. Szczeg\xF3\u0142owy Action Plan (od krytycznych poprawek po drobne optymalizacje)\n2. Konkretny, gotowy do u\u017Cycia kod w celach refaktoryzacji\n3. Wskaz\xF3wki dotycz\u0105ce wydajno\u015Bci i bezpiecze\u0144stwa`;
        } else if (role === "designer") {
            roleTitle = "Ekspert UX/UI Designer 🎨";
            promptText = `Jeste\u015B wybitnym ekspertem UX/UI Designerem. Pom\xF3\u017C mi poprawi\u0107 interfejs mojej aplikacji.\n\n<project_context>\n  <name>${app.name}</name>\n  <url>${app.url}</url>${localPathXml}\n  <role>${roleTitle}</role>\n</project_context>\n\n<design_notes>\n${notesText}\n</design_notes>\n\nPrzygotuj:\n1. Ocen\u0119 pod k\u0105tem heurystyk Nielsena i ergonomii\n2. Propozycje palet kolor\xF3w, typografii i uk\u0142adu\n3. Pomys\u0142y na mikro-animacje i CSS transitions`;
        } else if (role === "qa") {
            roleTitle = "Senior QA Engineer 🧪";
            promptText = `Jeste\u015B niezwykle skrupulatnym Senior QA Engineerem. Pom\xF3\u017C mi przetestowa\u0107 aplikacj\u0119.\n\n<project_context>\n  <name>${app.name}</name>\n  <url>${app.url}</url>${localPathXml}\n  <role>${roleTitle}</role>\n</project_context>\n\n<qa_notes>\n${notesText}\n</qa_notes>\n\nPrzygotuj:\n1. Scenariusze testowe (happy path, negatywne, edge cases)\n2. Single Points of Failure i podatno\u015Bci\n3. Szablony skrypt\xF3w Playwright/Cypress`;
        } else if (role === "writer") {
            roleTitle = "Technical Writer ✍️";
            promptText = `Jeste\u015B do\u015Bwiadczonym Technical Writerem. Pom\xF3\u017C mi opisa\u0107 zmiany i stworzy\u0107 dokumentacj\u0119.\n\n<project_context>\n  <name>${app.name}</name>\n  <url>${app.url}</url>${localPathXml}\n  <role>${roleTitle}</role>\n</project_context>\n\n<writer_notes>\n${notesText}\n</writer_notes>\n\nPrzygotuj:\n1. Changelog gotowy do wklejenia do CHANGELOG.md\n2. Microcopy dla przycisk\xF3w i komunikat\xF3w\n3. Skr\xF3con\u0105 instrukcj\u0119 dla u\u017Cytkownik\xF3w (Quick Start)`;
        }

        navigator.clipboard.writeText(promptText)
            .then(() => showToast(`Skopiowano prompt: ${roleTitle} 🤖`))
            .catch(() => showToast("Nie uda\u0142o si\u0119 skopiowa\u0107."));
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 17: WEBHOOK — SEND TO AI AGENT
// ─────────────────────────────────────────────────────────────

if (btnToggleWebhook) {
    btnToggleWebhook.addEventListener("click", () => {
        if (!webhookSection) return;
        const visible = webhookSection.style.display !== "none";
        webhookSection.style.display = visible ? "none" : "block";
    });
}

if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener("click", () => {
        if (!activeProjectId || !webhookUrlInput) return;
        const app = apps.find(a => a.id === activeProjectId);
        if (!app) return;
        app.webhookUrl = webhookUrlInput.value.trim();
        saveApps();
        showToast("URL webhooka zapisany! ⚡");
    });
}

if (btnTriggerWebhook) {
    btnTriggerWebhook.addEventListener("click", async () => {
        if (!activeProjectId) return;
        const app = apps.find(a => a.id === activeProjectId);
        if (!app) return;
        const url = (webhookUrlInput && webhookUrlInput.value.trim()) || app.webhookUrl;
        if (!url) { showToast("Podaj URL webhooka agenta AI!"); return; }

        const payload = {
            app: { name: app.name, url: app.url, localPath: app.localPath },
            todos: app.todos || [],
            role: aiRoleSelect ? aiRoleSelect.value : "developer",
            timestamp: new Date().toISOString()
        };

        try {
            showToast("Wysyłam do agenta AI... ⚡");
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            showToast(res.ok ? `Agent AI potwierdził! ✅ (${res.status})` : `Agent odpowiedział: ${res.status}`);
        } catch (e) {
            showToast("Nie można połączyć z agentem. Czy działa na localhost?");
        }
    });
}

if (btnSendAgentPrompt) {
    btnSendAgentPrompt.addEventListener("click", () => {
        if (!activeProjectId) return;
        const app = apps.find(a => a.id === activeProjectId);
        if (!app || !app.webhookUrl) {
            if (webhookSection) webhookSection.style.display = "block";
            showToast("Najpierw ustaw URL webhooka agenta!");
            return;
        }
        btnTriggerWebhook && btnTriggerWebhook.click();
    });
}

if (webhookUrlInput) webhookUrlInput.addEventListener("keydown", e => e.stopPropagation());

// ─────────────────────────────────────────────────────────────
// SEKCJA 18: JSON EXPORT / IMPORT (AI-Sync)
// ─────────────────────────────────────────────────────────────

function exportConfiguration() {
    try {
        const blob = new Blob([JSON.stringify(apps, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kuba_launchpad_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Wyeksportowano konfigurację JSON 📤");
    } catch { showToast("Błąd eksportu."); }
}

function importConfiguration() {
    const fi = document.createElement("input");
    fi.type = "file";
    fi.accept = ".json";
    fi.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = ev => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (!Array.isArray(imported)) throw new Error("Musi być tablicą JSON!");
                if (!imported.every(a => a.id && a.name && a.url)) throw new Error("Każdy element musi mieć id, name, url!");
                apps = imported.map(migrateApp);
                saveApps();
                buildFilterBar();
                renderApps(searchInput ? searchInput.value : "");
                showToast(`Zaimportowano ${apps.length} aplikacji 📥✨`);
            } catch (err) {
                alert(`Błąd importu: ${err.message}`);
            }
        };
    };
    fi.click();
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 19: TOOLBOX DEWELOPERA
// ─────────────────────────────────────────────────────────────

if (toolboxTabs && toolboxTabs.length > 0) {
    toolboxTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            toolboxTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeToolboxTab = tab.dataset.tab;
            if (toolboxInput) toolboxInput.value = "";
            if (toolboxOutput) toolboxOutput.value = "";
            if (toolboxInput) toolboxInput.placeholder = activeToolboxTab === "json"
                ? "Wklej minifikowany JSON..."
                : activeToolboxTab === "base64"
                    ? "Wklej tekst do kodowania lub Base64 do dekodowania..."
                    : "Wklej URL do dekodowania lub tekst do kodowania...";
        });
    });
}

if (btnToolboxRun && toolboxInput && toolboxOutput) {
    btnToolboxRun.addEventListener("click", () => {
        const input = toolboxInput.value.trim();
        if (!input) { toolboxOutput.value = "Błąd: brak danych wejściowych!"; return; }
        if (activeToolboxTab === "json") {
            try { toolboxOutput.value = JSON.stringify(JSON.parse(input), null, 4); showToast("Sformatowano JSON 🛠️"); }
            catch (e) { toolboxOutput.value = `Błąd JSON: ${e.message}`; }
        } else if (activeToolboxTab === "base64") {
            try {
                const decoded = atob(input);
                if (/^[\x00-\x7F]*$/.test(decoded)) { toolboxOutput.value = decoded; showToast("Odkodowano z Base64 🔓"); }
                else throw new Error("not text");
            } catch { toolboxOutput.value = btoa(unescape(encodeURIComponent(input))); showToast("Zakodowano do Base64 🔒"); }
        } else {
            if (input.includes("%")) {
                try { toolboxOutput.value = decodeURIComponent(input); showToast("Odkodowano URL 🔓"); }
                catch { toolboxOutput.value = encodeURIComponent(input); showToast("Zakodowano URL 🔒"); }
            } else { toolboxOutput.value = encodeURIComponent(input); showToast("Zakodowano URL 🔒"); }
        }
    });
}

if (btnToolboxCopy && toolboxOutput) {
    btnToolboxCopy.addEventListener("click", () => {
        const out = toolboxOutput.value.trim();
        if (!out || out.startsWith("Błąd")) { showToast("Brak wyniku do skopiowania!"); return; }
        copyToClipboard(out);
    });
}

if (toolboxInput) toolboxInput.addEventListener("keydown", e => e.stopPropagation());
if (toolboxOutput) toolboxOutput.addEventListener("keydown", e => e.stopPropagation());

// ─────────────────────────────────────────────────────────────
// SEKCJA 20: GITHUB CONTRIBUTION GRAPH
// ─────────────────────────────────────────────────────────────

function loadGitHubGraph() {
    const username = localStorage.getItem("launchpad_gh_user");
    if (!username) {
        if (githubPlaceholder) githubPlaceholder.style.display = "flex";
        if (githubGraphImg) githubGraphImg.style.display = "none";
        if (githubUsernameLabel) githubUsernameLabel.style.display = "none";
        return;
    }
    setGitHubGraph(username);
}

function setGitHubGraph(username) {
    localStorage.setItem("launchpad_gh_user", username);
    if (githubPlaceholder) githubPlaceholder.style.display = "none";
    if (githubGraphImg) {
        githubGraphImg.style.display = "block";
        githubGraphImg.src = `https://ghchart.rshah.org/0d9488/${encodeURIComponent(username)}`;
        githubGraphImg.onerror = () => {
            githubGraphImg.style.display = "none";
            if (githubPlaceholder) { githubPlaceholder.style.display = "flex"; githubPlaceholder.querySelector("p").textContent = "Nie znaleziono użytkownika GitHub"; }
        };
    }
    if (githubUsernameLabel) {
        githubUsernameLabel.style.display = "block";
        githubUsernameLabel.textContent = `@${username}`;
    }
}

function promptGitHubUsername() {
    const current = localStorage.getItem("launchpad_gh_user") || "";
    const username = prompt("Podaj swój username GitHub:", current);
    if (username && username.trim()) setGitHubGraph(username.trim());
}

if (btnSetupGithub) btnSetupGithub.addEventListener("click", promptGitHubUsername);
if (btnGhSettings) btnGhSettings.addEventListener("click", promptGitHubUsername);

// ─────────────────────────────────────────────────────────────
// SEKCJA 21: POMODORO TIMER
// ─────────────────────────────────────────────────────────────

const POMO_CIRCUMFERENCE = 2 * Math.PI * 50; // 314.159

function resetDailyPomodoro() {
    const today = new Date().toDateString();
    if (pomo.lastDate !== today) {
        pomo.completedToday = 0;
        pomo.lastDate = today;
        localStorage.setItem("pomo_completed_today", "0");
        localStorage.setItem("pomo_last_date", today);
    }
}

function updatePomodoroDisplay() {
    if (!pomodoroDisplay) return;
    const m = Math.floor(pomo.remainingSeconds / 60);
    const s = pomo.remainingSeconds % 60;
    pomodoroDisplay.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (pomodoroModeLabel) pomodoroModeLabel.textContent = pomo.label;
    if (pomodoroSessions) pomodoroSessions.textContent = `🍅 ×${pomo.completedToday}`;

    // Update ring
    if (pomodoroRingProgress) {
        const progress = pomo.remainingSeconds / pomo.totalSeconds;
        const offset = POMO_CIRCUMFERENCE * (1 - progress);
        pomodoroRingProgress.style.strokeDashoffset = offset;

        pomodoroRingProgress.className = "pomo-ring-progress";
        if (pomo.mode === "short-break") pomodoroRingProgress.classList.add("break-mode");
        else if (pomo.mode === "long-break") pomodoroRingProgress.classList.add("long-break-mode");
    }
}

function startPomodoro() {
    if (pomo.isRunning) return;
    pomo.isRunning = true;
    pomo.isPaused = false;

    if (btnPomoStart) btnPomoStart.disabled = true;
    if (btnPomoPause) btnPomoPause.disabled = false;

    pomo.intervalId = setInterval(() => {
        if (pomo.remainingSeconds <= 0) {
            onPomodoroComplete();
            return;
        }
        pomo.remainingSeconds--;
        updatePomodoroDisplay();
    }, 1000);

    showToast(`⏱️ ${pomo.label} rozpoczęty!`);
}

function pausePomodoro() {
    if (!pomo.isRunning) return;
    clearInterval(pomo.intervalId);
    pomo.isRunning = false;
    pomo.isPaused = true;
    if (btnPomoStart) { btnPomoStart.disabled = false; btnPomoStart.innerHTML = `<i class="fa-solid fa-play"></i> Wznów`; }
    if (btnPomoPause) btnPomoPause.disabled = true;
    showToast("⏸️ Pomodoro wstrzymany");
}

function resetPomodoro() {
    clearInterval(pomo.intervalId);
    pomo.isRunning = false;
    pomo.isPaused = false;
    pomo.remainingSeconds = pomo.totalSeconds;
    if (btnPomoStart) { btnPomoStart.disabled = false; btnPomoStart.innerHTML = `<i class="fa-solid fa-play"></i> Start`; }
    if (btnPomoPause) btnPomoPause.disabled = true;
    updatePomodoroDisplay();
}

function onPomodoroComplete() {
    clearInterval(pomo.intervalId);
    pomo.isRunning = false;

    if (pomo.mode === "focus") {
        pomo.completedToday++;
        localStorage.setItem("pomo_completed_today", String(pomo.completedToday));
        localStorage.setItem("pomo_last_date", new Date().toDateString());
    }

    pomo.remainingSeconds = 0;
    updatePomodoroDisplay();

    if (btnPomoStart) { btnPomoStart.disabled = false; btnPomoStart.innerHTML = `<i class="fa-solid fa-play"></i> Start`; }
    if (btnPomoPause) btnPomoPause.disabled = true;

    showToast(pomo.mode === "focus" ? `✅ Fokus ukończony! 🍅 ×${pomo.completedToday}` : "✅ Przerwa skończona! Czas na fokus!");

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🍅 Pomodoro", {
            body: pomo.mode === "focus" ? `Fokus ukończony! Czas na przerwę. 🎉` : "Przerwa skończona! Wracamy do pracy.",
            icon: "assets/lingology-logo-dark.png"
        });
    }
}

if (btnPomoStart) btnPomoStart.addEventListener("click", () => {
    if (!pomo.isRunning) startPomodoro();
});
if (btnPomoPause) btnPomoPause.addEventListener("click", pausePomodoro);
if (btnPomoReset) btnPomoReset.addEventListener("click", resetPomodoro);

if (pomoTabs) {
    pomoTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            resetPomodoro();
            pomoTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            pomo.totalSeconds = parseInt(tab.dataset.duration);
            pomo.remainingSeconds = pomo.totalSeconds;
            pomo.label = tab.dataset.label;
            pomo.mode = tab.dataset.duration === "1500" ? "focus" : tab.dataset.duration === "300" ? "short-break" : "long-break";
            updatePomodoroDisplay();
        });
    });
}

function initPomodoro() {
    resetDailyPomodoro();
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
    updatePomodoroDisplay();
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 22: COMMAND PALETTE (Raycast style)
// ─────────────────────────────────────────────────────────────

function buildCommandsList() {
    const list = [];

    list.push({ title: "Dodaj nową aplikację", cat: "SYSTEM", icon: "fa-solid fa-plus", action: openModal });
    list.push({ title: "Przełącz motyw (Jasny / Ciemny)", cat: "SYSTEM", icon: "fa-solid fa-circle-half-stroke", action: () => btnThemeToggle && btnThemeToggle.click() });
    list.push({ title: "Focus Mode (Tryb skupienia)", cat: "SYSTEM", icon: "fa-solid fa-expand", action: toggleFocusMode });
    list.push({ title: "Wyczyść Scratchpad", cat: "SYSTEM", icon: "fa-solid fa-trash-can", action: () => btnClearScratchpad && btnClearScratchpad.click() });

    // AI-Sync
    list.push({ title: "Eksportuj konfigurację pulpitu (JSON) 📤", cat: "AI-SYNC", icon: "fa-solid fa-file-export", action: exportConfiguration });
    list.push({ title: "Importuj konfigurację pulpitu z pliku (JSON) 📥", cat: "AI-SYNC", icon: "fa-solid fa-file-import", action: importConfiguration });

    // Clipboard & Snippets
    list.push({ title: "Historia Schowka 📋", cat: "NARZĘDZIA", icon: "fa-regular fa-clipboard", action: openClipboardHistoryModal });
    list.push({ title: "Zarządzaj Snippetami ✂️", cat: "NARZĘDZIA", icon: "fa-solid fa-file-code", action: openSnippetsModal });

    // GitHub
    list.push({ title: "Ustaw username GitHub", cat: "NARZĘDZIA", icon: "fa-brands fa-github", action: promptGitHubUsername });

    // Pomodoro
    list.push({ title: "Pomodoro — Start/Pauza", cat: "FOKUS", icon: "fa-solid fa-stopwatch", action: () => {
        if (pomo.isRunning) pausePomodoro(); else startPomodoro();
    }});
    list.push({ title: "Pomodoro — Reset", cat: "FOKUS", icon: "fa-solid fa-rotate-left", action: resetPomodoro });

    // Apps
    apps.forEach(app => {
        list.push({ title: `Pokaż szczegóły: ${app.name}`, cat: "PROJEKT", icon: "fa-solid fa-circle-info", action: () => openProjectDetailsModal(app.id) });
        list.push({ title: `Uruchom: ${app.name}`, cat: "LAUNCH", icon: "fa-solid fa-rocket", action: () => window.open(app.url, "_blank") });
        if (app.localPath) {
            list.push({ title: `Cursor → ${app.name}`, cat: "EDYTOR", icon: "fa-solid fa-arrow-pointer", action: () => { activeProjectId = app.id; openInCursor(); }});
            list.push({ title: `Claude Code → ${app.name}`, cat: "EDYTOR", icon: "fa-solid fa-wand-magic-sparkles", action: () => { activeProjectId = app.id; openInClaudeCode(); }});
            list.push({ title: `Antigravity → ${app.name}`, cat: "EDYTOR", icon: "fa-solid fa-robot", action: () => { activeProjectId = app.id; openInAntigravity(); }});
            list.push({ title: `Codex → ${app.name}`, cat: "EDYTOR", icon: "fa-solid fa-code", action: () => { activeProjectId = app.id; openInCodex(); }});
        }
    });

    // Snippets in palette
    loadSnippets().forEach(s => {
        list.push({ title: `Snippet: ${s.trigger} → ${s.expansion.slice(0, 30)}`, cat: "SNIPPET", icon: "fa-solid fa-file-code", action: () => copyToClipboard(s.expansion) });
    });

    return list;
}

function openCommandPalette() {
    if (!cmdPalette) return;
    selectedCmdIndex = 0;
    if (cmdPaletteInput) cmdPaletteInput.value = "";
    cmdPalette.classList.add("active");
    renderCommandResults();
    if (cmdPaletteInput) setTimeout(() => cmdPaletteInput.focus(), 100);
}

function closeCommandPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove("active");
    if (cmdPaletteInput) cmdPaletteInput.blur();
}

function renderCommandResults() {
    if (!cmdPaletteResults) return;
    cmdPaletteResults.innerHTML = "";
    const all = buildCommandsList();
    const q = cmdPaletteInput ? cmdPaletteInput.value.toLowerCase().trim() : "";
    filteredCommands = all.filter(c => c.title.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q));

    if (filteredCommands.length === 0) {
        cmdPaletteResults.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.85rem;">Brak pasujących poleceń...</div>`;
        return;
    }

    filteredCommands.forEach((cmd, i) => {
        const el = document.createElement("div");
        el.className = "cmd-item" + (i === selectedCmdIndex ? " selected" : "");
        el.innerHTML = `
            <div class="cmd-item-left"><i class="${cmd.icon}"></i><span>${cmd.title}</span></div>
            <span class="cmd-item-badge">${cmd.cat}</span>
        `;
        el.addEventListener("click", () => { cmd.action(); closeCommandPalette(); });
        if (i === selectedCmdIndex) setTimeout(() => el.scrollIntoView({ block: "nearest" }), 20);
        cmdPaletteResults.appendChild(el);
    });
}

if (cmdPaletteInput) {
    cmdPaletteInput.addEventListener("input", () => { selectedCmdIndex = 0; renderCommandResults(); });
    cmdPaletteInput.addEventListener("keydown", e => {
        e.stopPropagation();
        if (e.key === "ArrowDown") { e.preventDefault(); selectedCmdIndex = (selectedCmdIndex + 1) % filteredCommands.length; renderCommandResults(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); selectedCmdIndex = (selectedCmdIndex - 1 + filteredCommands.length) % filteredCommands.length; renderCommandResults(); }
        else if (e.key === "Enter") { e.preventDefault(); if (filteredCommands[selectedCmdIndex]) { filteredCommands[selectedCmdIndex].action(); closeCommandPalette(); } }
        else if (e.key === "Escape") { e.preventDefault(); closeCommandPalette(); }
    });
}

if (cmdPalette) cmdPalette.addEventListener("click", e => { if (e.target === cmdPalette) closeCommandPalette(); });

// ─────────────────────────────────────────────────────────────
// SEKCJA 23: ADD APP MODAL
// ─────────────────────────────────────────────────────────────

function openModal() {
    if (addAppModal) addAppModal.classList.add("active");
    const nameEl = document.getElementById("app-name");
    if (nameEl) nameEl.focus();
}

function closeModal() {
    if (addAppModal) addAppModal.classList.remove("active");
    if (addAppForm) addAppForm.reset();
}

if (addAppForm) {
    addAppForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("app-name")?.value.trim() || "";
        const url = document.getElementById("app-url")?.value.trim() || "";
        const localPath = document.getElementById("app-local-path")?.value.trim() || "";
        const category = (document.getElementById("app-category")?.value.trim() || "PROD").toUpperCase();
        const tagsRaw = document.getElementById("app-tags-input")?.value.trim() || "";
        const iconInput = document.getElementById("app-icon")?.value.trim() || "";
        const gradient = document.querySelector('input[name="app-gradient"]:checked')?.value || "gradient-lingology";
        const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];

        let logoType = "icon";
        let icon = iconInput;
        if (iconInput.startsWith("http") || iconInput.startsWith("assets/") || /\.(png|jpg|svg)$/.test(iconInput)) logoType = "image";
        else if (!iconInput.startsWith("fa-") && iconInput.length > 0) logoType = "emoji";

        const newApp = { id: name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now(), name, url, icon, gradient, isDefault: false, logoType, category, tags, todos: [], sessions: [], localPath, webhookUrl: "", notes: "" };
        apps.push(newApp);
        saveApps();
        buildFilterBar();
        renderApps(searchInput ? searchInput.value : "");
        closeModal();
        showToast(`Dodano aplikację ${name}! 🚀`);
    });
}

if (btnAddApp) btnAddApp.addEventListener("click", openModal);
if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);
if (addAppModal) addAppModal.addEventListener("click", e => { if (e.target === addAppModal) closeModal(); });

// ─────────────────────────────────────────────────────────────
// SEKCJA 24: ZEGAR & POWITANIE
// ─────────────────────────────────────────────────────────────

function updateTime() {
    const now = new Date();
    if (clockTime) {
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        const s = String(now.getSeconds()).padStart(2, "0");
        clockTime.textContent = `${h}:${m}:${s}`;
    }
    if (clockDate) {
        let d = now.toLocaleDateString("pl-PL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        clockDate.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    }
    const hr = now.getHours();
    const greeting = document.querySelector(".logo-text p");
    if (greeting) {
        if (hr >= 5 && hr < 12) greeting.textContent = "Dzień dobry, Kuba! 🌅";
        else if (hr >= 12 && hr < 18) greeting.textContent = "Miłego popołudnia! ☀️";
        else if (hr >= 18 && hr < 22) greeting.textContent = "Dobry wieczór, Kuba! 🌙";
        else greeting.textContent = "Dobrej nocy, Kuba! 🌌";
    }
}

setInterval(updateTime, 1000);
updateTime();

// ─────────────────────────────────────────────────────────────
// SEKCJA 25: SCRATCHPAD
// ─────────────────────────────────────────────────────────────

let saveTimeout = null;

function updateCharCount() {
    if (!scratchpad || !scratchpadChars) return;
    const n = scratchpad.value.length;
    const noun = n === 1 ? "znak" : n >= 2 && n <= 4 ? "znaki" : "znaków";
    scratchpadChars.textContent = `${n} ${noun}`;
}

if (scratchpad) {
    scratchpad.value = localStorage.getItem("launchpad_scratchpad") || "";
    updateCharCount();

    scratchpad.addEventListener("input", () => {
        updateCharCount();
        if (saveStatus) { saveStatus.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Zapisywanie...`; saveStatus.classList.add("show"); }
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem("launchpad_scratchpad", scratchpad.value);
            if (saveStatus) { saveStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Zapisano`; }
            setTimeout(() => saveStatus && saveStatus.classList.remove("show"), 1500);
        }, 800);
    });

    scratchpad.addEventListener("keydown", e => e.stopPropagation());
}

if (btnClearScratchpad && scratchpad) {
    btnClearScratchpad.addEventListener("click", () => {
        if (!scratchpad.value.trim()) return;
        if (!confirm("Wyczyścić scratchpad?")) return;
        scratchpad.value = "";
        localStorage.setItem("launchpad_scratchpad", "");
        updateCharCount();
        showToast("Scratchpad wyczyszczony 🧹");
    });
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 26: WYSZUKIWANIE
// ─────────────────────────────────────────────────────────────

if (searchInput) {
    searchInput.addEventListener("input", e => renderApps(e.target.value));
}

// ─────────────────────────────────────────────────────────────
// SEKCJA 27: SKRÓTY KLAWISZOWE (GLOBALNE)
// ─────────────────────────────────────────────────────────────

document.addEventListener("keydown", e => {
    const active = document.activeElement;
    const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT");

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        cmdPalette && cmdPalette.classList.contains("active") ? closeCommandPalette() : openCommandPalette();
        return;
    }

    if (!isTyping) {
        if (e.key === "/") { e.preventDefault(); searchInput && searchInput.focus(); }
        if (e.key === "n" || e.key === "N") { e.preventDefault(); openModal(); }
        if (e.shiftKey && e.key === "F") { e.preventDefault(); toggleFocusMode(); }

        if (e.key >= "1" && e.key <= "9") {
            const idx = parseInt(e.key) - 1;
            const q = searchInput && searchInput.value ? searchInput.value.toLowerCase() : "";
            const vis = apps.filter(a => !q || a.name.toLowerCase().includes(q) || a.url.toLowerCase().includes(q));
            if (vis[idx]) {
                e.preventDefault();
                openProjectDetailsModal(vis[idx].id);
            }
        }
    }

    if (e.key === "Escape") {
        if (addAppModal && addAppModal.classList.contains("active")) closeModal();
        else if (projectDetailsModal && projectDetailsModal.classList.contains("active")) closeProjectDetailsModal();
        else if (cmdPalette && cmdPalette.classList.contains("active")) closeCommandPalette();
        else if (clipboardHistoryModal && clipboardHistoryModal.classList.contains("active")) clipboardHistoryModal.classList.remove("active");
        else if (snippetsModal && snippetsModal.classList.contains("active")) snippetsModal.classList.remove("active");
        else if (active === searchInput) { searchInput.value = ""; renderApps(); searchInput.blur(); }
    }
});

// ─────────────────────────────────────────────────────────────
// INIT — START APLIKACJI
// ─────────────────────────────────────────────────────────────

initTheme();
initFocusMode();
buildFilterBar();
renderApps();
initPomodoro();
loadGitHubGraph();

// Options page logic

// DOM Elements
const triggerList = document.getElementById('triggerList');
const searchInput = document.getElementById('searchInput');
const newTriggerBtn = document.getElementById('newTriggerBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

// Modal Elements
const modal = document.getElementById('triggerModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const shortcutInput = document.getElementById('shortcut');
const expansionInput = document.getElementById('expansion');

let allTriggers = [];

// --- Initialization ---

function init() {
    loadTriggers();
    setupEventListeners();
}

function loadTriggers() {
    chrome.storage.local.get(['triggers'], (result) => {
        allTriggers = result.triggers || [];
        renderTriggers(allTriggers);
    });
}

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allTriggers.filter(t =>
            t.shortcut.toLowerCase().includes(query) ||
            t.expansion.toLowerCase().includes(query)
        );
        renderTriggers(filtered);
    });

    // Modal
    newTriggerBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    saveBtn.addEventListener('click', saveTrigger);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
    });

    // Import/Export
    exportBtn.addEventListener('click', exportTriggers);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importTriggers);

    // Enter key to save
    shortcutInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            expansionInput.focus();
        }
    });

    expansionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            saveTrigger();
        }
    });
}

// --- Rendering ---

function renderTriggers(triggers) {
    triggerList.innerHTML = '';

    if (triggers.length === 0) {
        triggerList.innerHTML = `
            <li style="padding: 2rem; text-align: center; color: var(--text-muted);">
                No triggers found. Click "New Trigger" to create one.
            </li>
        `;
        return;
    }

    triggers.forEach((trigger, index) => {
        const li = document.createElement('li');
        li.className = 'trigger-item';

        // Find the actual index in the main array (for deletion)
        const realIndex = allTriggers.indexOf(trigger);

        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; overflow: hidden;">
                <span class="shortcut-badge">${escapeHtml(trigger.shortcut)}</span>
                <span class="expansion-preview" title="${escapeHtml(trigger.expansion)}">${escapeHtml(trigger.expansion)}</span>
            </div>
            <div class="actions">
                <button class="icon-btn delete-btn" data-index="${realIndex}" title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        triggerList.appendChild(li);
    });

    // Attach event listeners to dynamic buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            deleteTrigger(index);
        });
    });
}

// --- Actions ---

function openModal() {
    shortcutInput.value = '';
    expansionInput.value = '';
    modal.classList.add('open');
    shortcutInput.focus();
}

function closeModalFunc() {
    modal.classList.remove('open');
}

function saveTrigger() {
    const shortcut = shortcutInput.value.trim();
    const expansion = expansionInput.value; // Don't trim expansion, spaces might be intentional

    if (!shortcut || !expansion) {
        alert('Please fill in both fields.');
        return;
    }

    // Check for duplicates
    if (allTriggers.some(t => t.shortcut === shortcut)) {
        alert('This shortcut already exists.');
        return;
    }

    allTriggers.push({ shortcut, expansion });
    saveToStorage();
    closeModalFunc();
}

function deleteTrigger(index) {
    if (confirm('Are you sure you want to delete this trigger?')) {
        allTriggers.splice(index, 1);
        saveToStorage();
    }
}

function saveToStorage() {
    chrome.storage.local.set({ triggers: allTriggers }, () => {
        loadTriggers(); // Reload to update UI and search state
    });
}

// --- Import / Export ---

function exportTriggers() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allTriggers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "autofill_triggers.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importTriggers(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                // Merge or Replace? Let's append for now, or maybe replace?
                // Let's ask user or just append unique ones. 
                // For simplicity: Replace current list or Append.
                // Let's Append.

                const currentShortcuts = new Set(allTriggers.map(t => t.shortcut));
                let addedCount = 0;

                imported.forEach(item => {
                    if (item.shortcut && item.expansion && !currentShortcuts.has(item.shortcut)) {
                        allTriggers.push(item);
                        addedCount++;
                    }
                });

                saveToStorage();
                alert(`Imported ${addedCount} triggers.`);
            } else {
                alert('Invalid JSON format.');
            }
        } catch (err) {
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
    // Reset input
    fileInput.value = '';
}

// --- Utility ---

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Run
document.addEventListener('DOMContentLoaded', init);

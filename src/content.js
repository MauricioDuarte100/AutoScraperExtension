// Content script to handle text expansion

let triggers = {};

// Load triggers from storage
function loadTriggers() {
    chrome.storage.local.get(['triggers'], (result) => {
        if (result.triggers) {
            // Convert array to object for faster lookup: { ";m": "email@..." }
            triggers = result.triggers.reduce((acc, item) => {
                acc[item.shortcut] = item.expansion;
                return acc;
            }, {});
        }
    });
}

// Listen for storage changes to update triggers in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.triggers) {
        loadTriggers();
    }
});

// Initial load
loadTriggers();

// Input event listener
document.addEventListener('input', async (e) => {
    const target = e.target;

    // Only work on input and textarea fields
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;

    // Get the current value and cursor position
    const value = target.value;
    const cursorPosition = target.selectionStart;

    for (const [shortcut, expansion] of Object.entries(triggers)) {
        // Check if the text before the cursor ends with the shortcut
        const textBeforeCursor = value.substring(0, cursorPosition);

        if (textBeforeCursor.endsWith(shortcut)) {
            // Found a match!

            let finalExpansion = expansion;

            // Process Macros
            // 1. Date: {{date}} -> DD/MM/YYYY
            if (finalExpansion.includes('{{date}}')) {
                const today = new Date();
                const dateStr = today.toLocaleDateString();
                finalExpansion = finalExpansion.replace(/{{date}}/g, dateStr);
            }

            // 2. Time: {{time}} -> HH:MM
            if (finalExpansion.includes('{{time}}')) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                finalExpansion = finalExpansion.replace(/{{time}}/g, timeStr);
            }

            // 3. Clipboard: {{clipboard}}
            if (finalExpansion.includes('{{clipboard}}')) {
                try {
                    const text = await navigator.clipboard.readText();
                    finalExpansion = finalExpansion.replace(/{{clipboard}}/g, text);
                } catch (err) {
                    console.error('AutoFill: Could not read clipboard', err);
                }
            }

            // Calculate start position of the shortcut
            const startPosition = cursorPosition - shortcut.length;

            // Construct new value
            const newValue = value.substring(0, startPosition) + finalExpansion + value.substring(cursorPosition);

            // Update input value
            target.value = newValue;

            // Move cursor to end of expansion
            const newCursorPosition = startPosition + finalExpansion.length;
            target.setSelectionRange(newCursorPosition, newCursorPosition);

            // Dispatch input event to ensure frameworks (React, Angular, etc.) detect the change
            const event = new Event('input', { bubbles: true });
            target.dispatchEvent(event);

            break; // Stop after first match
        }
    }
});

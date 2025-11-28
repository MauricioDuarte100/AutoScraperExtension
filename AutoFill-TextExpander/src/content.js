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

    // Check if element is editable
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const isContentEditable = target.isContentEditable;

    if (!isInput && !isContentEditable) return;

    // Get current text and cursor position
    let value, cursorPosition;

    if (isInput) {
        value = target.value;
        cursorPosition = target.selectionStart;
    } else {
        // For contentEditable, getting text and cursor is trickier
        // This is a simplified approach using textContent
        value = target.textContent;
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            // This is an approximation. Precise cursor in contentEditable is complex.
            // For now, let's stick to simple text replacement if it ends with shortcut
            // Or better, let's focus on INPUT/TEXTAREA reliability first.
            // Supporting contentEditable robustly requires a lot more code.
            // Let's keep it simple but robust for Inputs first.
            return;
        }
    }

    if (!value) return;

    for (const [shortcut, expansion] of Object.entries(triggers)) {
        const textBeforeCursor = value.substring(0, cursorPosition);

        if (textBeforeCursor.endsWith(shortcut)) {
            let finalExpansion = expansion;

            // Process Macros
            if (finalExpansion.includes('{{date}}')) {
                const today = new Date();
                finalExpansion = finalExpansion.replace(/{{date}}/g, today.toLocaleDateString());
            }
            if (finalExpansion.includes('{{time}}')) {
                const now = new Date();
                finalExpansion = finalExpansion.replace(/{{time}}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
            if (finalExpansion.includes('{{clipboard}}')) {
                try {
                    const text = await navigator.clipboard.readText();
                    finalExpansion = finalExpansion.replace(/{{clipboard}}/g, text);
                } catch (err) {
                    console.error('AutoFill: Clipboard error', err);
                }
            }

            // Perform replacement
            if (isInput) {
                const startPosition = cursorPosition - shortcut.length;
                const newValue = value.substring(0, startPosition) + finalExpansion + value.substring(cursorPosition);

                // Use execCommand for undo history support if possible, otherwise direct value set
                // Direct value set is more reliable for modern frameworks
                target.value = newValue;

                const newCursorPosition = startPosition + finalExpansion.length;
                target.setSelectionRange(newCursorPosition, newCursorPosition);

                // Dispatch events for React/Angular/Vue
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
            }

            break;
        }
    }
});

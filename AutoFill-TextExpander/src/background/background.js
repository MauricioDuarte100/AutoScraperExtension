// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoFill Extension Installed");
  
  // Initialize default triggers if none exist
  chrome.storage.local.get(['triggers'], (result) => {
    if (!result.triggers) {
      const defaultTriggers = [
        { id: '1', shortcut: ';m', expansion: 'user@example.com' },
        { id: '2', shortcut: ';n', expansion: 'John Doe' },
        { id: '3', shortcut: ';t', expansion: '+1 234 567 890' }
      ];
      chrome.storage.local.set({ triggers: defaultTriggers });
    }
  });
});

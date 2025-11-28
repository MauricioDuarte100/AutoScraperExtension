# AutoFill - Text Expander Extension

A powerful Chrome extension that allows you to create custom text shortcuts (snippets) that automatically expand as you type. Perfect for repetitive data entry in forms, emails, and any web input.

## ✨ Features

- **⚡ Instant Text Expansion**: Type short triggers like `;m` and they automatically expand to your full email address
- **🔧 Dynamic Macros**: Use `{{date}}`, `{{time}}`, and `{{clipboard}}` to insert dynamic content
- **🎨 Premium Dashboard**: Beautiful, modern UI to manage all your snippets
- **🔍 Search & Filter**: Quickly find snippets with the built-in search
- **💾 Import/Export**: Backup and restore your snippets via JSON
- **🚀 Zero Conflicts**: Uses prefix-based triggers (`;` or `/`) to avoid interfering with normal typing

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `AutoFill` folder

## 📖 Usage Guide

### Creating Your First Trigger

1. Click the AutoFill extension icon in your browser toolbar
2. Click **"New Trigger"**
3. Enter a shortcut (e.g., `;email`)
4. Enter the expansion text (e.g., `your.email@example.com`)
5. Click **"Save Trigger"**

### Using Triggers

Simply type your shortcut in any input field or textarea on the web and it will automatically expand!

**Example:**
```
Type: ;email
Result: your.email@example.com
```

### Dynamic Macros

Use these special codes in your expansion text:

| Macro | Description | Example Output |
|-------|-------------|----------------|
| `{{date}}` | Current date | `11/28/2025` |
| `{{time}}` | Current time | `14:30` |
| `{{clipboard}}` | Paste clipboard content | `(whatever is in your clipboard)` |

**Example Trigger:**
- Shortcut: `;log`
- Expansion: `Log entry: {{date}} {{time}} - `
- Result: `Log entry: 11/28/2025 14:30 - `

## 📋 Pre-configured Triggers

The extension comes with these default triggers:
- `;m` → `user@example.com`
- `;n` → `John Doe`
- `;t` → `+1 234 567 890`

(You can edit or delete these at any time)

## 🎯 Use Cases

- **Forms**: Auto-fill common information (email, phone, address)
- **Customer Support**: Quick responses to common questions
- **Coding**: Common code snippets or boilerplate
- **Emails**: Email signatures, common phrases
- **Documentation**: Repeated text blocks

## 🛠️ Technical Details

- **Manifest Version**: 3
- **Permissions**: `storage`, `activeTab`, `scripting`, `clipboardRead`
- **Technology**: Vanilla JavaScript, CSS (no external dependencies)

## 📁 Project Structure

```
AutoFill/
├── manifest.json              # Extension configuration
├── src/
│   ├── content.js            # Text expansion logic
│   ├── background/
│   │   └── background.js     # Background service worker
│   └── options/
│       ├── options.html      # Dashboard UI
│       └── options.js        # Dashboard logic
```

## 🔒 Privacy

All data is stored **locally** on your computer using Chrome's storage API. No data is sent to external servers.

## 📄 License

MIT License - Feel free to modify and distribute!

## 👤 Author

Created by [Mauricio Duarte](https://github.com/MauricioDuarte100)

## 🐛 Issues & Contributions

Found a bug or have a feature request? Open an issue on [GitHub](https://github.com/MauricioDuarte100/AutoScraperExtension/issues).

---

**Enjoy faster typing! ⚡**

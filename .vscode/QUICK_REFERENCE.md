# 🚀 Quick Reference Guide

## Opening the Workspace

**Method 1: Workspace File (Recommended)**
```bash
code cybersec-hub.code-workspace
```

**Method 2: Command Palette**
1. Open VS Code
2. `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Open Workspace from File"
4. Select `cybersec-hub.code-workspace`

## Essential Keyboard Shortcuts

### General
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Ctrl+`` - Toggle terminal
- `Ctrl+Shift+F` - Search across files

### Development
- `F5` - Start debugging
- `Ctrl+Shift+B` - Run build task
- `Ctrl+Shift+D` - Open debug panel
- `Ctrl+Shift+E` - Open file explorer

### Code Editing
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Copy line up/down
- `Ctrl+/` - Toggle line comment
- `Shift+Alt+F` - Format document
- `Ctrl+Space` - Trigger IntelliSense

## Custom Snippets

Type these prefixes and press `Tab`:

- `rfc` - React Functional Component
- `rfcs` - React Component with State
- `rfce` - React Component with Effect
- `hook` - Custom Hook
- `tsi` - TypeScript Interface
- `tst` - TypeScript Type
- `afn` - Async Function
- `cl` - Console Log
- `imc` - Import Component
- `twc` - Tailwind Container
- `cmdh` - Security Command Handler
- `apif` - API Fetch
- `ctx` - React Context

## Tasks (Terminal → Run Task)

- **Dev Server** - Start development server
- **Build** - Build production bundle
- **Lint** - Run ESLint
- **Preview Build** - Preview production build
- **Kill Port 5000** - Kill process on port 5000
- **Clean Build** - Clean and rebuild
- **Type Check** - Run TypeScript type checking

## Debug Configurations (F5)

1. 🚀 Launch Chrome for CyberConnect (Default)
2. 🔗 Attach to Chrome
3. 🦊 Launch Firefox
4. 🌐 Launch Edge

## Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview

# Kill port 5000
npm run kill

# Install dependencies
npm install

# Type checking
tsc --noEmit
```

## Path Aliases

Use `@/` for src imports:
```typescript
import { Button } from "@/components/ui/button";
import { useTUI } from "@/hooks/useTUI";
```

## Troubleshooting Quick Fixes

### Port in use
```bash
npm run kill
# or manually: fuser -k 5000/tcp
```

### TypeScript errors not showing
1. `Ctrl+Shift+P`
2. "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

### Extensions not working
1. `Ctrl+Shift+P`
2. "Developer: Reload Window"

### Format not working
1. Right-click in file
2. "Format Document With..."
3. Select "Prettier - Code formatter"

## Recommended Workflow

1. Open workspace: `code cybersec-hub.code-workspace`
2. Install recommended extensions when prompted
3. Start dev server: `Ctrl+Shift+P` → "Run Task" → "Dev Server"
4. Start coding with auto-save and format-on-save enabled
5. Debug: Press `F5` to launch Chrome with debugger
6. Before commit: Run "Lint" and "Build" tasks

## File Navigation

- `Ctrl+P` - Quick open file
- `Ctrl+Shift+O` - Go to symbol in file
- `Ctrl+T` - Go to symbol in workspace
- `F12` - Go to definition
- `Alt+F12` - Peek definition
- `Shift+F12` - Find all references

## Terminal Tips

- Split terminal: Click `+` dropdown → "Split Terminal"
- Multiple terminals: Click `+` for new terminal
- Switch terminals: Use dropdown in terminal panel
- Clear terminal: Type `clear` or `Ctrl+K`

## Git Operations

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: description"

# Push to remote
git push

# Create new branch
git checkout -b feature/branch-name

# View commit history
git log --oneline -10
```

## Performance Tips

1. Enable "Auto Save" (already configured)
2. Use `Ctrl+P` for quick file access instead of sidebar
3. Close unused editor tabs
4. Use search/replace across files: `Ctrl+Shift+H`
5. Fold code sections: `Ctrl+Shift+[`

## Workspace Settings Location

- Workspace settings: `.vscode/settings.json`
- Launch configs: `.vscode/launch.json`
- Tasks: `.vscode/tasks.json`
- Extensions: `.vscode/extensions.json`
- Snippets: `.vscode/snippets.code-snippets`

## Need Help?

- Full documentation: `WORKSPACE_SETUP.md`
- Project README: `README.md`
- API docs: `API_DOCUMENTATION.md`
- Setup guide: `SETUP_GUIDE.md`

---

**💡 Pro Tip**: Use `Ctrl+K Ctrl+S` to view all keyboard shortcuts!

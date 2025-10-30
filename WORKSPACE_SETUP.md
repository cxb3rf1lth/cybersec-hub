# 🛠️ CyberConnect Custom Workspace Setup

This document provides a comprehensive guide to the custom workspace configuration for the CyberConnect cybersecurity platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Workspace Features](#workspace-features)
- [VS Code Configuration](#vs-code-configuration)
- [Development Tasks](#development-tasks)
- [Debugging](#debugging)
- [Recommended Extensions](#recommended-extensions)
- [Code Formatting](#code-formatting)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The custom workspace setup for CyberConnect includes:

- **VS Code Workspace File**: Centralized configuration for the entire project
- **Editor Settings**: Optimized settings for TypeScript, React, and Tailwind CSS
- **Launch Configurations**: Pre-configured debugging setups for multiple browsers
- **Tasks**: Automated build, lint, and development tasks
- **Code Formatting**: Consistent code style with Prettier and ESLint
- **Extensions**: Curated list of recommended VS Code extensions

## 🚀 Quick Start

### Option 1: Using the Workspace File (Recommended)

1. Open VS Code
2. Navigate to **File → Open Workspace from File**
3. Select `cybersec-hub.code-workspace`
4. VS Code will reload with all workspace settings applied

### Option 2: Opening the Folder

1. Open the `cybersec-hub` folder in VS Code
2. The `.vscode` directory contains all necessary configurations
3. Install recommended extensions when prompted

### Initial Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:5000 in your browser
```

## ✨ Workspace Features

### 1. **Auto-Save**
Files automatically save when you switch focus, reducing the chance of losing work.

### 2. **Format on Save**
Code is automatically formatted using Prettier when you save a file.

### 3. **Auto-Import Organization**
Imports are automatically organized and unused imports are removed on save.

### 4. **ESLint Integration**
Real-time linting with automatic fixes applied on save.

### 5. **TypeScript Path Aliases**
Use `@/*` imports for cleaner code organization:
```typescript
import { Button } from "@/components/ui/button";
```

### 6. **Tailwind CSS IntelliSense**
Autocomplete for Tailwind classes with custom configuration support.

## 🔧 VS Code Configuration

### Editor Settings

The workspace includes optimized editor settings:

- **Tab Size**: 2 spaces
- **Line Rulers**: At 80 and 120 characters
- **Bracket Pair Colorization**: Enabled for better code readability
- **Word Wrap**: Enabled for better readability
- **Minimap**: Enabled with character rendering disabled

### File Exclusions

The following patterns are hidden from the file explorer:
- `node_modules/`
- `dist/`
- `.vite/`
- `.tmp/`
- `.DS_Store`

## 🎯 Development Tasks

Access tasks via **Terminal → Run Task** or use keyboard shortcuts.

### Available Tasks

#### 1. **Dev Server**
```bash
Task: Dev Server
Script: npm run dev
```
Starts the Vite development server on port 5000.

#### 2. **Build** (Default Build Task)
```bash
Task: Build
Script: npm run build
Shortcut: Ctrl+Shift+B (Windows/Linux) or Cmd+Shift+B (Mac)
```
Compiles TypeScript and builds the production bundle.

#### 3. **Lint**
```bash
Task: Lint
Script: npm run lint
```
Runs ESLint on the entire codebase.

#### 4. **Preview Build**
```bash
Task: Preview Build
Script: npm run preview
```
Previews the production build locally.

#### 5. **Kill Port 5000**
```bash
Task: Kill Port 5000
Script: npm run kill
```
Terminates any process running on port 5000.

#### 6. **Clean Build**
```bash
Task: Clean Build
Command: rm -rf dist .vite node_modules/.tmp && npm run build
```
Removes build artifacts and performs a fresh build.

#### 7. **Type Check**
```bash
Task: Type Check
Command: tsc --noEmit
```
Runs TypeScript type checking without emitting files.

## 🐛 Debugging

### Launch Configurations

Four debugging configurations are available:

#### 1. **🚀 Launch Chrome for CyberConnect**
- Launches Chrome and connects to the dev server
- Automatically starts the dev server if not running
- **Default debugging configuration**

#### 2. **🔗 Attach to Chrome**
- Attaches to an existing Chrome instance
- Requires Chrome to be launched with remote debugging:
  ```bash
  google-chrome --remote-debugging-port=9222
  ```

#### 3. **🦊 Launch Firefox**
- Launches Firefox and connects to the dev server
- Requires Firefox debugger extension

#### 4. **🌐 Launch Edge**
- Launches Microsoft Edge and connects to the dev server

### Starting a Debug Session

1. Set breakpoints in your code by clicking the left margin
2. Press **F5** or click the debug icon in the sidebar
3. Select a launch configuration
4. The browser will launch and connect to the debugger

### Debug Features

- **Breakpoints**: Pause execution at specific lines
- **Step Through**: Step over/into/out of functions
- **Watch Variables**: Monitor variable values in real-time
- **Call Stack**: View the function call hierarchy
- **Console**: Execute JavaScript in the browser context

## 🔌 Recommended Extensions

The workspace recommends essential extensions for optimal development:

### Essential Extensions

1. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatting

2. **ESLint** (`dbaeumer.vscode-eslint`)
   - JavaScript/TypeScript linting

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Tailwind class autocomplete

4. **TypeScript Next** (`ms-vscode.vscode-typescript-next`)
   - Latest TypeScript language features

### UI & Developer Experience

5. **Material Icon Theme** (`pkief.material-icon-theme`)
   - Beautiful file icons

6. **Error Lens** (`usernamehw.errorlens`)
   - Inline error highlighting

7. **Pretty TypeScript Errors** (`yoavbls.pretty-ts-errors`)
   - Readable TypeScript errors

### Code Quality

8. **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
   - Catches typos in code and comments

9. **Import Cost** (`wix.vscode-import-cost`)
   - Shows package import sizes

### Git & Collaboration

10. **GitLens** (`eamodio.gitlens`)
    - Enhanced Git capabilities

11. **GitHub Copilot** (`github.copilot`)
    - AI-powered code completion

12. **GitHub Pull Requests** (`github.vscode-pull-request-github`)
    - Manage PRs from VS Code

### DevOps

13. **Docker** (`ms-azuretools.vscode-docker`)
    - Docker container management

14. **YAML** (`redhat.vscode-yaml`)
    - YAML language support

### Installing Recommended Extensions

When you open the workspace, VS Code will prompt you to install recommended extensions. Click **Install All** to install them at once.

## 🎨 Code Formatting

### Prettier Configuration

The workspace uses Prettier for consistent code formatting:

- **Line Width**: 80 characters
- **Tab Width**: 2 spaces
- **Semicolons**: Always
- **Quotes**: Double quotes
- **Trailing Commas**: ES5 standard
- **Arrow Parens**: Always

### ESLint Configuration

ESLint is configured to:
- Validate JavaScript, TypeScript, JSX, and TSX files
- Auto-fix issues on save
- Use the project's ESLint configuration

### EditorConfig

The `.editorconfig` file ensures consistent settings across different editors:
- UTF-8 encoding
- LF line endings
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

## 🔍 Project Structure

```
cybersec-hub/
├── .vscode/                    # VS Code configuration
│   ├── extensions.json         # Recommended extensions
│   ├── launch.json             # Debug configurations
│   ├── settings.json           # Editor settings
│   └── tasks.json              # Automated tasks
├── src/
│   ├── components/             # React components
│   │   ├── tui/                # Terminal UI components
│   │   ├── bug-bounty/         # Bug bounty features
│   │   ├── earnings/           # Earnings tracking
│   │   ├── layout/             # Layout components
│   │   ├── views/              # Page views
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .editorconfig               # Editor configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── cybersec-hub.code-workspace # VS Code workspace file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## 🐛 Troubleshooting

### Port 5000 Already in Use

```bash
# Use the Kill Port task
Terminal → Run Task → Kill Port 5000

# Or manually
npm run kill
```

### TypeScript Errors Not Showing

1. Ensure TypeScript extension is using workspace version:
   - Command Palette → **TypeScript: Select TypeScript Version**
   - Choose **Use Workspace Version**

2. Reload the workspace:
   - Command Palette → **Developer: Reload Window**

### Prettier Not Formatting

1. Check that Prettier extension is installed
2. Verify default formatter:
   - Command Palette → **Format Document With**
   - Select **Prettier - Code formatter**
3. Check file type in `.prettierignore`

### ESLint Not Working

1. Ensure ESLint extension is installed
2. Check ESLint output:
   - View → Output → Select "ESLint" from dropdown
3. Reload ESLint server:
   - Command Palette → **ESLint: Restart ESLint Server**

### Extensions Not Installing

1. Check internet connection
2. Try installing manually:
   - Extensions sidebar → Search by ID
3. Restart VS Code

### Dev Server Not Starting

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite node_modules/.tmp

# Start dev server
npm run dev
```

## 📚 Additional Resources

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [CyberConnect README](./README.md)
- [API Documentation](./API_DOCUMENTATION.md)

## 🤝 Contributing

When contributing to this project:

1. Use the workspace configuration for consistency
2. Ensure all files are formatted (automatic on save)
3. Fix ESLint warnings before committing
4. Run `npm run build` to verify the build succeeds
5. Test in multiple browsers using the debug configurations

## 📝 Customizing the Workspace

### Personal Settings

To override workspace settings without modifying the workspace file:

1. Open Settings (Ctrl+,)
2. Switch to **User** tab (not Workspace)
3. Make your changes

User settings take precedence over workspace settings.

### Adding New Tasks

Edit `.vscode/tasks.json` to add custom tasks:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "echo 'Hello World'",
  "problemMatcher": []
}
```

### Adding New Launch Configurations

Edit `.vscode/launch.json` to add custom debug configurations.

---

**🎯 Happy Coding!** The workspace is configured to provide the best development experience for CyberConnect. If you encounter any issues, check the Troubleshooting section or reach out to the team.

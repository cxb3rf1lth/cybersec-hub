# 🤖 Claude Code Developer Onboarding Guide

Welcome, Claude! This guide will help you quickly understand and contribute to the **CyberConnect** platform - an advanced cybersecurity social network built with React, TypeScript, and GitHub Spark.

## 🎯 Project Overview

**CyberConnect** is a comprehensive cybersecurity platform combining:
- **Terminal User Interface (TUI)** - Primary interface for security operations
- **Bug Bounty Integration** - Real-time feeds from major platforms
- **Virtual Security Labs** - Cloud-based penetration testing environments
- **Team Collaboration** - Real-time code editing and messaging
- **Threat Intelligence** - Aggregated security feeds and custom sources

## 📁 Project Structure

```
/workspaces/spark-template/
├── src/
│   ├── App.tsx                     # Main application component with routing
│   ├── components/
│   │   ├── ui/                     # 40+ shadcn v4 components (pre-installed)
│   │   ├── auth/                   # Authentication components
│   │   ├── layout/                 # Sidebar, MainContent, navigation
│   │   ├── tui/                    # Terminal User Interface
│   │   ├── bug-bounty/             # Bug bounty platform integrations
│   │   ├── teams/                  # Team management and collaboration
│   │   ├── code/                   # Real-time code editor
│   │   ├── messages/               # Messaging system
│   │   ├── marketplace/            # Security services marketplace
│   │   ├── earnings/               # Earnings tracking and analytics
│   │   └── virtual-lab/            # Virtual lab infrastructure
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities, API clients, services
│   ├── types/                      # TypeScript type definitions
│   ├── index.css                   # Theme and global styles
│   └── main.tsx                    # Entry point (DO NOT EDIT)
├── index.html                      # HTML template
├── package.json                    # Dependencies (use npm tool)
├── PRD.md                          # Product Requirements Document
└── vite.config.ts                  # Vite config (DO NOT EDIT)
```

## 🔧 Technology Stack

### Core Technologies
- **React 19** - UI framework with latest hooks and features
- **TypeScript 5.7** - Type-safe JavaScript
- **Vite 6.4** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **GitHub Spark** - Hosting platform with KV storage

### UI Libraries
- **shadcn/ui v4** - 40+ pre-installed components in `src/components/ui/`
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library (use sparingly)
- **@phosphor-icons/react** - Icon library (primary choice)
- **Lucide React** - Alternative icon library

### Key Libraries
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **D3.js** - Data visualizations
- **Three.js** - 3D graphics (neural networks)
- **date-fns** - Date utilities

## 🎨 Design System

### Color Palette (Dark Theme)
```css
/* Deep dark base with red accents */
--background: oklch(0.02 0.01 240);      /* Ultra-deep black */
--foreground: oklch(0.95 0.01 240);      /* Crisp white */
--primary: oklch(0.15 0.02 240);         /* Dark blue-gray */
--accent: oklch(0.50 0.15 15);           /* Professional red */
--card: oklch(0.04 0.01 240);            /* Card background */
--border: oklch(0.12 0.02 240);          /* Border color */
```

### Typography
- **Primary Font**: IBM Plex Sans (400, 500, 600, 700)
- **Monospace**: IBM Plex Mono (for code and terminal)
- **Serif**: IBM Plex Serif (for emphasis)

### Glass Morphism Effects
```css
.glass-card         /* Standard glass effect */
.glass-panel        /* Panel with blur */
.glass-button       /* Interactive glass button */
.electric-border    /* Animated red border effect */
.hover-red-glow     /* Red glow on hover */
```

## 💾 Data Persistence

### Spark KV Storage (Primary)
```typescript
import { useKV } from '@github/spark/hooks'

// ✅ CORRECT - Use functional updates
const [todos, setTodos] = useKV("todos", [])
setTodos(current => [...current, newTodo])

// ❌ WRONG - Stale closure issue
setTodos([...todos, newTodo])
```

### When to Use What
- **useKV**: Data that persists between sessions (user prefs, saved data)
- **useState**: Temporary UI state (form inputs, modals, loading states)
- **NEVER**: localStorage or sessionStorage (unless explicitly requested)

### Spark Runtime SDK
```typescript
// LLM Integration
const prompt = spark.llmPrompt`Analyze: ${code}`
const result = await spark.llm(prompt, "gpt-4o")

// JSON Mode (always returns object, not array)
const prompt = spark.llmPrompt`Return JSON: { users: [...] }`
const data = await spark.llm(prompt, "gpt-4o", true)

// User Info
const user = await spark.user()
// { avatarUrl, email, id, isOwner, login }

// KV Storage (non-React)
await spark.kv.set("key", value)
const data = await spark.kv.get<Type>("key")
```

## 🎯 Component Guidelines

### Use Shadcn Components (Always)
```typescript
// ✅ CORRECT
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// ❌ WRONG - Don't use plain HTML
<button>Click</button>
<div className="card">...</div>
```

### Available Shadcn Components
View `src/components/ui/` for 40+ components including:
- Button, Card, Dialog, Dropdown Menu
- Form, Input, Label, Textarea
- Tabs, Accordion, Collapsible
- Table, Scroll Area, Separator
- Alert, Badge, Avatar, Progress
- Sidebar, Sheet, Drawer
- And many more...

### Custom Components Structure
```typescript
// src/components/feature/ComponentName.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from '@phosphor-icons/react'

export function ComponentName() {
  const [state, setState] = useState<Type>(initial)

  return (
    <Card className="p-6">
      <Button>
        <Plus /> Add Item
      </Button>
    </Card>
  )
}
```

## 🔒 Security Patterns

### API Key Management
```typescript
// Use ApiKeyManager component
import { ApiKeyManager } from '@/components/ui/ApiKeyManager'

// Keys stored securely in KV storage
// Never expose keys in console.log or errors
```

### User Authentication
```typescript
// Check current user
const [currentUser] = useKV<User | null>('currentUser', null)

if (!currentUser) {
  // Show login/register
}

// User type structure
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  specializations: string[]
  // ... more fields
}
```

## 🎨 Styling Best Practices

### Tailwind Utility Classes
```typescript
// ✅ CORRECT - Use theme variables
className="bg-background text-foreground border-border"

// Use utility classes for layout
className="flex items-center justify-between gap-4 p-6"

// Responsive classes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Custom Animations (CSS)
```css
/* Already available in index.css */
@keyframes subtle-pulse { }
@keyframes border-flow { }
@keyframes terminal-cursor { }
@keyframes hex-rotate { }
@keyframes binary-fall { }
```

## 📝 Code Conventions

### DO's
- ✅ Use TypeScript for all new files
- ✅ Use functional components with hooks
- ✅ Import types from `@/types/`
- ✅ Use `@/` alias for imports
- ✅ Use Phosphor Icons primarily
- ✅ Keep components under 300 lines
- ✅ Use `useCallback` and `useMemo` for optimization
- ✅ Follow existing naming conventions

### DON'Ts
- ❌ Don't edit `vite.config.ts` or `main.tsx`
- ❌ Don't use `alert()`, `confirm()`, or `prompt()`
- ❌ Don't add comments unless explicitly requested
- ❌ Don't use class components
- ❌ Don't use external APIs without KV-stored keys
- ❌ Don't use `localStorage` or `sessionStorage`
- ❌ Don't override shadcn component styles heavily

## 🚀 Development Workflow

### Starting Development
```bash
npm run dev          # Start dev server (port 5000)
npm run build        # Production build
npm run lint         # Run ESLint
```

### Making Changes
1. **Read PRD.md** - Understand feature requirements
2. **Check existing code** - Look for similar patterns
3. **View component files** - See what's already implemented
4. **Use shadcn components** - Don't reinvent the wheel
5. **Test thoroughly** - Check all states and edge cases

### Common Tasks

#### Adding a New Feature
1. Check if component exists in `src/components/ui/`
2. Create new component in appropriate directory
3. Add types to `src/types/`
4. Create custom hook if needed in `src/hooks/`
5. Import and use in parent component
6. Update KV storage keys if needed

#### Updating Styles
1. Edit `src/index.css` for global styles
2. Use Tailwind utilities in components
3. Check CSS variables in `:root`
4. Test dark theme appearance

#### Adding API Integration
1. Create service in `src/lib/`
2. Add API key management
3. Use `useKV` for storing responses
4. Handle errors gracefully
5. Show loading states with Skeleton components

## 🐛 Debugging Tips

### Common Issues

**Problem**: Component not rendering
- Check imports (use `@/` alias)
- Verify component is exported
- Check TypeScript errors in editor

**Problem**: State not persisting
- Use `useKV` instead of `useState`
- Use functional updates for `setKV`
- Check KV key name consistency

**Problem**: Styling not applying
- Check Tailwind class names
- Verify CSS variables in `:root`
- Check for conflicting styles
- Use `cn()` utility for conditional classes

**Problem**: Icons not showing
- Import from `@phosphor-icons/react`
- Check icon name capitalization
- Verify icon component syntax: `<Plus />`

## 📚 Key Files to Review

### Essential Reading
1. **PRD.md** - Complete product requirements
2. **src/App.tsx** - Main application structure
3. **src/components/layout/Sidebar.tsx** - Navigation
4. **src/components/layout/MainContent.tsx** - Content routing
5. **src/types/** - All TypeScript interfaces

### Feature-Specific Files
- **TUI**: `src/components/tui/TUIInterface.tsx`
- **Bug Bounty**: `src/components/bug-bounty/`
- **Teams**: `src/components/teams/`
- **Messaging**: `src/components/messages/`
- **Code Editor**: `src/components/code/`

## 🎯 Testing Strategy

### Manual Testing Checklist
- [ ] Component renders without errors
- [ ] All interactive elements work (buttons, inputs)
- [ ] Data persists correctly with KV storage
- [ ] Loading states display properly
- [ ] Error states are handled gracefully
- [ ] Responsive design works on mobile
- [ ] Dark theme looks correct
- [ ] Icons display properly
- [ ] Animations are smooth (60fps)
- [ ] No console errors or warnings

### Edge Cases to Test
- [ ] Empty states (no data)
- [ ] Loading states (fetching data)
- [ ] Error states (failed requests)
- [ ] Long content (overflow handling)
- [ ] Many items (performance)
- [ ] Rapid interactions (debouncing)

## 🔄 Common Patterns

### Form Handling
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

### Modal/Dialog Pattern
```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog'

const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### List Rendering
```typescript
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'

<ScrollArea className="h-[600px]">
  {items.map(item => (
    <Card key={item.id}>
      {/* Item content */}
    </Card>
  ))}
</ScrollArea>
```

### Toast Notifications
```typescript
import { toast } from 'sonner'

toast.success('Operation successful!')
toast.error('Something went wrong')
toast.loading('Processing...')
```

## 🎨 Design Patterns to Follow

### Glass Morphism Components
```typescript
<div className="glass-card p-6 rounded-xl">
  <div className="glass-panel-intense p-4">
    {/* Intense glass effect */}
  </div>
</div>
```

### Electric Border Effect
```typescript
<Card className="electric-border hover-red-glow">
  {/* Card with animated border */}
</Card>
```

### Cyberpunk Aesthetic
- Use `network-pattern` class for backgrounds
- Add `hex-grid-overlay` for decorative elements
- Use `binary-rain-container` for immersive effects
- Apply `glitch-effect` on hover for emphasis

## 🚨 Important Warnings

### DO NOT EDIT
- `src/main.tsx` - Entry point managed by Spark
- `src/main.css` - Structural CSS file
- `vite.config.ts` - Vite configuration
- `src/components/ui/*` - Shadcn components (unless fixing bugs)

### SECURITY CRITICAL
- Never log API keys or secrets
- Always validate user input
- Use Web Crypto API for encryption
- Check user permissions before operations
- Sanitize code/script inputs in TUI

### PERFORMANCE CRITICAL
- Use `React.memo` for expensive components
- Virtualize long lists (100+ items)
- Debounce search/filter inputs
- Lazy load heavy components
- Optimize animations for 60fps

## 📖 Additional Resources

### Documentation Links
- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **Shadcn UI**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion
- **Radix UI**: https://www.radix-ui.com

### Project Documentation
- `API_DOCUMENTATION.md` - API reference
- `SECURITY.md` - Security guidelines
- `PRODUCTION_API_SETUP.md` - Production setup
- `LIVE_API_INTEGRATION.md` - Real-time integrations

## 🎓 Quick Start Checklist

Before making changes:
- [ ] Read this entire document
- [ ] Review PRD.md for feature context
- [ ] Check src/App.tsx for app structure
- [ ] Browse src/components/ui/ for available components
- [ ] Understand KV storage patterns (useKV)
- [ ] Know the design system (colors, fonts, effects)
- [ ] Review existing similar features
- [ ] Understand TypeScript types in src/types/

## 💡 Pro Tips

1. **Component Discovery**: Always check `src/components/ui/` first - there's likely a shadcn component for what you need
2. **State Management**: Use `useKV` for persistence, `useState` for temporary UI state
3. **Styling Speed**: Use Tailwind utilities > custom CSS > styled components
4. **Icon Usage**: `<Plus />` from Phosphor Icons, don't set size/weight unless requested
5. **Error Handling**: Always handle loading, error, and empty states
6. **Performance**: Profile with React DevTools before optimizing
7. **Type Safety**: Let TypeScript catch bugs - don't use `any`
8. **Code Reuse**: Create hooks for shared logic, components for shared UI

## 🤝 Working with Existing Code

### Understanding the Codebase
```typescript
// 1. Start with the main App.tsx
src/App.tsx              // Routes, auth, global state

// 2. Check the layout
src/components/layout/   // Sidebar, MainContent

// 3. Find your feature area
src/components/tui/      // Terminal interface
src/components/teams/    // Team management
src/components/code/     // Code editor
// etc.

// 4. Review types
src/types/               // All TypeScript interfaces

// 5. Check utilities
src/lib/                 // Helper functions, services
src/hooks/               // Custom React hooks
```

### Modifying Existing Features
1. Find the component file
2. Review its props and state
3. Check what hooks it uses
4. Look for related types
5. Make minimal, focused changes
6. Test all affected functionality

## 🎯 Summary

You're now ready to contribute to CyberConnect! Remember:
- **Use shadcn components** from `src/components/ui/`
- **Persist data** with `useKV` from `@github/spark/hooks`
- **Follow design system** (glass morphism, red accents, dark theme)
- **Write TypeScript** with proper types
- **Test thoroughly** (all states, responsive, dark theme)

Need help? Review existing code for patterns, check the PRD for requirements, and test frequently during development.

Happy coding! 🚀

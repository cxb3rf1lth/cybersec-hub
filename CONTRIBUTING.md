# Contributing to CyberConnect

First off, thank you for considering contributing to CyberConnect! It's people like you that make CyberConnect such a great tool for the cybersecurity community.

## 🤖 For AI Assistants (Claude Code)

**If you're an AI assistant (Claude Code, GitHub Copilot, etc.), please read the dedicated guide:**

👉 **[Claude Developer Onboarding Guide](./CLAUDE_DEVELOPER_ONBOARDING.md)** 👈

This comprehensive guide includes everything you need to understand the codebase, architecture, patterns, and best practices.

## 👥 For Human Contributors

### Code of Conduct

This project and everyone participating in it is governed by our commitment to:
- **Respect**: Treat all contributors with respect and kindness
- **Security**: Never compromise security for convenience
- **Quality**: Maintain high code quality standards
- **Collaboration**: Work together to build better solutions

### What We're Looking For

We welcome contributions of all kinds:
- 🐛 **Bug reports and fixes**
- ✨ **New features** (aligned with roadmap)
- 📝 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🔒 **Security improvements**
- 🧪 **Test coverage**

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Git
- A GitHub account
- Basic understanding of React, TypeScript, and cybersecurity concepts

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/cyberconnect-platform.git
   cd cyberconnect-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Project Structure Overview

```
src/
├── components/        # React components
│   ├── ui/           # Shadcn components (40+)
│   ├── tui/          # Terminal User Interface
│   ├── bug-bounty/   # Bug bounty features
│   ├── teams/        # Team collaboration
│   ├── code/         # Code editor
│   └── ...           # Other feature modules
├── hooks/            # Custom React hooks
├── lib/              # Utilities and services
├── types/            # TypeScript definitions
└── index.css         # Global styles and theme
```

For detailed architecture, see [Claude Developer Onboarding](./CLAUDE_DEVELOPER_ONBOARDING.md).

## 📋 Development Guidelines

### Code Style

We follow strict conventions to maintain code quality:

#### TypeScript
```typescript
// ✅ DO: Use functional components
export function ComponentName() {
  return <div>Content</div>
}

// ✅ DO: Type everything
interface Props {
  name: string
  count: number
}

// ✅ DO: Use const for components
const handleClick = () => { }

// ❌ DON'T: Use class components
class ComponentName extends React.Component { }

// ❌ DON'T: Use any
function process(data: any) { }
```

#### React Patterns
```typescript
// ✅ DO: Use hooks properly
import { useState, useCallback, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'

// ✅ DO: Use KV for persistent data
const [todos, setTodos] = useKV("todos", [])

// ✅ DO: Use functional updates
setTodos(current => [...current, newTodo])

// ❌ DON'T: Use stale closures
setTodos([...todos, newTodo])
```

#### Styling
```typescript
// ✅ DO: Use shadcn components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ✅ DO: Use Tailwind utilities
className="flex items-center gap-4 p-6"

// ✅ DO: Use theme variables
className="bg-background text-foreground"

// ❌ DON'T: Use inline styles
style={{ padding: '24px' }}

// ❌ DON'T: Create custom components for shadcn equivalents
function MyButton() { } // Use Button from shadcn
```

### Component Guidelines

1. **Use Shadcn Components First**
   - Check `src/components/ui/` before creating new components
   - 40+ pre-built components available
   - Don't reinvent the wheel

2. **Keep Components Focused**
   - Single responsibility principle
   - Maximum 300 lines per component
   - Extract logic to custom hooks

3. **Handle All States**
   - Loading states (use Skeleton)
   - Error states (show meaningful messages)
   - Empty states (guide users)
   - Success states (confirm actions)

4. **Accessibility**
   - Use semantic HTML
   - Include ARIA labels
   - Support keyboard navigation
   - Maintain WCAG AA contrast

### Data Persistence

```typescript
// ✅ DO: Use KV for persistent data
import { useKV } from '@github/spark/hooks'
const [settings, setSettings] = useKV("user-settings", defaults)

// ✅ DO: Use useState for UI state
import { useState } from 'react'
const [isOpen, setIsOpen] = useState(false)

// ❌ DON'T: Use localStorage
localStorage.setItem('key', 'value')

// ❌ DON'T: Use sessionStorage
sessionStorage.setItem('key', 'value')
```

### Security Best Practices

1. **Never expose secrets**
   ```typescript
   // ❌ DON'T
   console.log('API Key:', apiKey)
   
   // ✅ DO
   console.log('API Key configured:', !!apiKey)
   ```

2. **Validate all inputs**
   ```typescript
   import { z } from 'zod'
   
   const schema = z.object({
     username: z.string().min(3).max(20),
     email: z.string().email(),
   })
   ```

3. **Sanitize user content**
   - Especially for TUI commands
   - HTML in messages
   - Code execution

4. **Check permissions**
   ```typescript
   if (!user.isOwner) {
     toast.error('Insufficient permissions')
     return
   }
   ```

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, ensure:

- [ ] Feature works as intended
- [ ] All interactive elements functional
- [ ] Data persists correctly (if using KV)
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Empty states handled
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Dark theme looks correct
- [ ] No console errors or warnings
- [ ] Icons display correctly
- [ ] Animations smooth (60fps)
- [ ] Accessibility (keyboard navigation)

### Edge Cases

Test these scenarios:
- Empty data (no items)
- Single item
- Many items (100+)
- Very long content
- Special characters
- Rapid interactions
- Network failures (if applicable)
- Invalid inputs

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or fixes
- `chore`: Build process or tooling changes

### Examples

```bash
feat(tui): add bulk target import command

Implemented new 'import bulk' command that allows users to import
multiple targets from clipboard or file content. Includes validation
and error handling for invalid formats.

Closes #123
```

```bash
fix(teams): resolve invitation acceptance bug

Fixed issue where team invitations weren't properly updating user's
team membership after acceptance. Updated the KV storage logic to
ensure atomic updates.

Fixes #456
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Test thoroughly**
   - Run through manual testing checklist
   - Check for console errors
   - Test on different screen sizes

3. **Update documentation**
   - Add/update comments for complex logic
   - Update README if adding features
   - Add examples if needed

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] All edge cases handled
- [ ] No console errors

## Screenshots
(If applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks**: All must pass
2. **Code review**: At least one approval required
3. **Testing**: Reviewer will test functionality
4. **Documentation**: Ensure all docs updated

### After Approval

Once approved and merged:
1. Delete your feature branch
2. Pull latest main
3. Celebrate! 🎉

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try latest version
3. Reproduce consistently
4. Collect error details

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

We love feature ideas! Before requesting:

1. Check existing feature requests
2. Review the [PRD](./PRD.md)
3. Consider if it aligns with project goals

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem It Solves**
What problem does this address?

**Proposed Solution**
How would you implement it?

**Alternatives Considered**
What other solutions did you consider?

**Additional Context**
Any other relevant information
```

## 📖 Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing APIs or interfaces
- Fixing bugs that affect usage
- Improving processes

### Documentation Files

- `README.md` - Overview and quick start
- `CLAUDE_DEVELOPER_ONBOARDING.md` - Developer guide
- `PRD.md` - Product requirements
- `API_DOCUMENTATION.md` - API reference
- Component-level docs in code comments

## 🎓 Learning Resources

### Project-Specific
- [PRD](./PRD.md) - Product vision and requirements
- [Developer Guide](./CLAUDE_DEVELOPER_ONBOARDING.md) - Comprehensive dev guide
- [Security Guide](./SECURITY.md) - Security practices

### Technology Stack
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Vite Guide](https://vitejs.dev/guide)

## 💬 Getting Help

### Where to Ask Questions

1. **GitHub Issues**: Bug reports and feature requests
2. **Discussions**: General questions and ideas
3. **Discord**: Real-time chat (if available)

### Good Questions Include

- What you're trying to achieve
- What you've tried
- Relevant code/error messages
- Environment details

## 🏆 Recognition

Contributors are recognized in several ways:
- Listed in GitHub contributors
- Mentioned in release notes
- Featured in README (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, helps make CyberConnect better for the entire cybersecurity community. Thank you for being part of this project!

---

**Questions?** Open an issue or start a discussion. We're here to help! 🚀

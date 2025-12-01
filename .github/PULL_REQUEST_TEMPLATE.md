# Pull Request

## 📝 Description

Provide a clear and concise description of what this PR does.

## 🔗 Related Issues

Closes #(issue number)
Relates to #(issue number)

## 🎯 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (no functional changes)
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test additions or updates
- [ ] 🔧 Build/tooling changes

## 🧪 Testing Checklist

- [ ] Feature works as intended
- [ ] All interactive elements are functional
- [ ] Data persists correctly (if using KV storage)
- [ ] Loading states display properly
- [ ] Error states are handled gracefully
- [ ] Empty states are handled
- [ ] Tested on desktop (1920x1080+)
- [ ] Tested on tablet (768x1024)
- [ ] Tested on mobile (375x667)
- [ ] Dark theme looks correct
- [ ] No console errors or warnings
- [ ] Icons display correctly
- [ ] Animations are smooth (60fps target)
- [ ] Keyboard navigation works
- [ ] Accessibility requirements met (WCAG AA)

## 🎨 Screenshots / Videos

If applicable, add screenshots or screen recordings to demonstrate the changes.

### Before
<!-- Screenshot of before changes -->

### After
<!-- Screenshot of after changes -->

## 📚 Documentation

- [ ] Updated README if needed
- [ ] Updated component documentation
- [ ] Updated API documentation if applicable
- [ ] Updated PRD if feature aligns with product requirements
- [ ] Added/updated code comments for complex logic

## 🔍 Code Quality

- [ ] Code follows project conventions (see CLAUDE_DEVELOPER_ONBOARDING.md)
- [ ] Used TypeScript with proper types (no `any`)
- [ ] Used shadcn components where applicable
- [ ] Used Tailwind utilities (no custom CSS unless necessary)
- [ ] Used theme variables (colors, spacing, fonts)
- [ ] Followed security best practices
- [ ] No unnecessary dependencies added
- [ ] Code is readable and maintainable
- [ ] Complex logic is commented
- [ ] No commented-out code (unless with explanation)

## 🚀 Performance

- [ ] No unnecessary re-renders
- [ ] Used `React.memo` / `useMemo` / `useCallback` where beneficial
- [ ] Virtualized long lists (100+ items)
- [ ] Optimized images/assets if added
- [ ] No blocking operations on main thread
- [ ] Animations use GPU acceleration (transform/opacity)

## 🔒 Security

- [ ] No hardcoded secrets or API keys
- [ ] User input is validated
- [ ] User content is sanitized
- [ ] Permissions are checked where needed
- [ ] No sensitive data logged to console
- [ ] External APIs use secure storage (KV)

## 🧩 Edge Cases Tested

- [ ] Empty states (no data)
- [ ] Single item
- [ ] Many items (100+)
- [ ] Very long content (overflow handling)
- [ ] Special characters in inputs
- [ ] Rapid user interactions
- [ ] Network failures (if applicable)
- [ ] Invalid/malformed inputs

## 📦 Dependencies

If you added new dependencies, explain why:

**New dependencies:**
- `package-name` - Reason for adding

## 🔄 Migration Required

Does this change require any migration steps?
- [ ] No migration needed
- [ ] Migration steps documented below

**Migration steps:**
```
List any migration steps if needed
```

## 💭 Additional Notes

Any additional information that reviewers should know:
- Design decisions made
- Known limitations
- Future improvements planned
- Areas needing special attention during review

## ✅ Reviewer Checklist

For reviewers:
- [ ] Code reviewed for quality and conventions
- [ ] Functionality tested manually
- [ ] Edge cases verified
- [ ] Performance acceptable
- [ ] Security considerations addressed
- [ ] Documentation adequate
- [ ] No breaking changes (or properly documented)

## 📸 Demo

Provide a quick demo of the feature:
- Video/GIF walkthrough
- Step-by-step usage instructions
- Key interactions to test

---

**Ready for review!** Please test thoroughly and provide feedback. 🚀

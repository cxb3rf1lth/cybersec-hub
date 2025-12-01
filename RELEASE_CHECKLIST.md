# 📋 Release Checklist

Use this checklist before publishing a new release of CyberConnect.

## Pre-Release Tasks

### Code Quality
- [ ] All tests pass (if applicable)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] No console.log statements with sensitive data
- [ ] All TODO/FIXME comments addressed or documented
- [ ] Code reviewed by at least one other developer

### Documentation
- [ ] README.md is up to date
- [ ] CHANGELOG.md updated with release notes
- [ ] API_DOCUMENTATION.md reflects latest changes
- [ ] CLAUDE_DEVELOPER_ONBOARDING.md is current
- [ ] All new features documented
- [ ] Breaking changes clearly documented
- [ ] Migration guide created (if needed)

### Security
- [ ] Security audit completed
- [ ] No hardcoded secrets or API keys
- [ ] Dependencies updated and audited (`npm audit`)
- [ ] Known vulnerabilities addressed
- [ ] SECURITY.md updated if needed

### Functionality
- [ ] All core features tested manually
- [ ] TUI commands working correctly
- [ ] Bug bounty integrations functional
- [ ] Virtual labs operational
- [ ] Team collaboration features tested
- [ ] Messaging system working
- [ ] Code editor functional
- [ ] Earnings tracking accurate

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Responsive Testing
- [ ] Desktop (1920x1080+)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

### Performance
- [ ] Build size acceptable (<5MB)
- [ ] First paint <2s
- [ ] Time to interactive <3s
- [ ] No memory leaks
- [ ] Animations smooth (60fps)
- [ ] Images optimized

### Version Management
- [ ] Version number updated in package.json
- [ ] Git tag created for release
- [ ] CHANGELOG.md version entry added
- [ ] Release notes drafted

## Release Process

### 1. Prepare Release
```bash
# Update version number
npm version [major|minor|patch]

# Example: npm version 1.1.0
```

### 2. Update CHANGELOG.md
```markdown
## [1.1.0] - 2024-01-15

### Added
- New feature X
- Enhancement Y

### Fixed
- Bug fix Z

### Changed
- Updated dependency A

### Deprecated
- Feature B (will be removed in 2.0)

### Security
- Fixed vulnerability in component C
```

### 3. Commit Changes
```bash
git add .
git commit -m "chore: prepare release v1.1.0"
git push
```

### 4. Create Release Tag
```bash
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

### 5. Build for Production
```bash
npm run build
```

### 6. Test Production Build
```bash
npm run preview
# Verify everything works at http://localhost:4173
```

### 7. Create GitHub Release
- Go to GitHub repository
- Click "Releases" > "Create a new release"
- Select tag v1.1.0
- Title: "CyberConnect v1.1.0"
- Add release notes from CHANGELOG
- Attach build artifacts if needed
- Publish release

### 8. Deploy to Production
```bash
# For GitHub Spark
git push origin main

# For other platforms, follow DEPLOYMENT.md
```

## Post-Release Tasks

### Verification
- [ ] Deployment successful
- [ ] Production site accessible
- [ ] All features working in production
- [ ] No errors in browser console
- [ ] Monitoring systems show healthy status

### Communication
- [ ] Release announcement posted (if applicable)
- [ ] Team notified
- [ ] Users notified (if breaking changes)
- [ ] Documentation links updated

### Monitoring
- [ ] Watch error tracking for new issues
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Monitor server resources (if self-hosted)

### Backup
- [ ] Production backup created
- [ ] Backup verified
- [ ] Rollback plan documented

## Hotfix Process

For urgent fixes:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/issue-description main
   ```

2. **Fix Issue**
   - Make minimal changes
   - Test thoroughly
   - Update CHANGELOG

3. **Bump Patch Version**
   ```bash
   npm version patch
   # Example: 1.1.0 → 1.1.1
   ```

4. **Merge and Deploy**
   ```bash
   git checkout main
   git merge hotfix/issue-description
   git tag -a v1.1.1 -m "Hotfix: description"
   git push origin main --tags
   ```

5. **Verify Fix**
   - Test in production
   - Monitor for issues
   - Notify users if needed

## Rollback Process

If critical issues occur after release:

1. **Identify Issue**
   - Check error logs
   - Verify issue is critical
   - Document the problem

2. **Execute Rollback**
   ```bash
   # Revert to previous release
   git revert HEAD
   git push
   
   # Or deploy previous tag
   git checkout v1.0.0
   npm run build
   # Deploy
   ```

3. **Verify Rollback**
   - Test site functionality
   - Verify issue resolved
   - Monitor error rates

4. **Communication**
   - Notify team immediately
   - Update users if needed
   - Document incident

5. **Post-Mortem**
   - Analyze what went wrong
   - Document lessons learned
   - Update release checklist

## Version Numbering

Follow Semantic Versioning (SemVer):

- **Major (1.0.0 → 2.0.0)**: Breaking changes
- **Minor (1.0.0 → 1.1.0)**: New features, backward compatible
- **Patch (1.0.0 → 1.0.1)**: Bug fixes, backward compatible

Examples:
- Added new TUI command: Minor version bump (1.0.0 → 1.1.0)
- Fixed TUI parsing bug: Patch version bump (1.0.0 → 1.0.1)
- Changed KV storage format: Major version bump (1.0.0 → 2.0.0)

## Release Schedule

Recommended schedule:
- **Major releases**: Every 6-12 months
- **Minor releases**: Every 4-6 weeks
- **Patch releases**: As needed for bugs
- **Hotfixes**: Immediate for critical issues

## Emergency Contacts

Keep updated list of:
- Release manager
- Security team contact
- DevOps/Infrastructure team
- Product owner

## Notes

- Always test in staging before production
- Keep release notes user-focused
- Automate what you can
- Document everything
- Learn from each release

---

**Last Updated**: [Date]
**Next Scheduled Release**: [Date]

# ⚡ Quick Start Guide

Get CyberConnect up and running in under 5 minutes!

## 🚀 Super Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/cyberconnect-platform.git
cd cyberconnect-platform

# 2. Install dependencies (takes ~1 minute)
npm install

# 3. Start development server
npm run dev

# 4. Open your browser
# Visit: http://localhost:5000
```

**That's it!** 🎉 The application is now running locally.

## 📱 First Steps

### 1. Create Account
- Click "Join the Community" on the landing page
- Fill in your details
- Select your cybersecurity specializations

### 2. Explore the TUI (Terminal)
- Click "Terminal (TUI)" in the sidebar
- Try these commands:
  ```bash
  help                          # See all commands
  target add example.com        # Add a target
  target list                   # View targets
  scan start                    # Start scanning
  ```

### 3. Explore Features
Navigate through the sidebar:
- **Feed** - Social timeline
- **Bug Bounty** - Platform integrations
- **Teams** - Team collaboration
- **Virtual Lab** - Security labs
- **Messages** - Direct messaging
- **Code** - Code editor
- **And more...**

## 🛠️ Configuration (Optional)

### API Keys (Optional)
For external integrations, configure API keys:

1. Click "Enter API Key" button (bottom right)
2. Select service (HackerOne, Bugcrowd, Shodan, etc.)
3. Enter your API key
4. Click "Apply"

Keys are stored securely in browser storage.

### Sample Data
The app comes with sample data pre-loaded:
- 3 sample users
- TUI scan targets
- Bug bounty programs
- Threat intelligence feeds
- Teams

You can modify or clear this in the app.

## 📦 Building for Production

```bash
# Build optimized production version
npm run build

# Output will be in dist/ folder
# Deploy dist/ to your hosting platform
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides.

## 🎯 Common Tasks

### Add a Team Member
1. Go to Teams tab
2. Select your team
3. Click "Invite Member"
4. Enter username and role
5. Send invitation

### Start a Bug Hunt
1. Go to Bug Bounty tab
2. Browse available programs
3. Click "Start Hunt"
4. Invite team members
5. Begin coordinated research

### Run a Security Scan
1. Open Terminal (TUI)
2. `target add yourdomain.com`
3. `scan start`
4. Watch progress in real-time

### Set Up Virtual Lab
1. Go to Virtual Lab tab
2. Click "Create Environment"
3. Select template (Kali, Windows, etc.)
4. Configure resources
5. Launch

## 🆘 Troubleshooting

### Port 5000 Already in Use
```bash
# Kill existing process
npm run kill

# Or use different port
PORT=3000 npm run dev
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Build without type checking
npm run build -- --noCheck
```

### Can't Install Dependencies
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

## 📚 Next Steps

### For Users
- Read [README.md](./README.md) for full features
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- Review [SECURITY.md](./SECURITY.md) for best practices

### For Developers
- Read [CLAUDE_DEVELOPER_ONBOARDING.md](./CLAUDE_DEVELOPER_ONBOARDING.md)
- Review [PRD.md](./PRD.md) for product context
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

### For Deployment
- Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for production
- Set up monitoring and backups
- Configure domain and SSL

## 💡 Pro Tips

### Terminal (TUI) Tips
- Use **arrow keys** to navigate command history
- **Tab completion** works for commands
- Use `help <command>` for detailed help
- Try `azazel auto` for automated scanning

### Performance Tips
- Use Chrome or Edge for best performance
- Enable hardware acceleration
- Close unused tabs to free memory
- Use production build for better performance

### Collaboration Tips
- Create teams for better organization
- Use code editor for sharing exploits
- Set up custom threat feeds
- Track earnings for motivation

### Security Tips
- Never share API keys publicly
- Use strong passwords
- Enable 2FA on external accounts
- Keep dependencies updated

## ⚙️ Development Tips

### Hot Reload
The dev server supports hot module replacement (HMR):
- Save any file
- Changes appear instantly
- No page refresh needed (usually)

### Debugging
```bash
# Check console for errors
# Open browser DevTools: F12 or Cmd+Option+I

# View React components
# Install React DevTools extension

# Check network requests
# Use Network tab in DevTools
```

### Code Structure
```
src/
├── components/    # All React components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── types/        # TypeScript types
└── index.css     # Global styles
```

## 🎓 Learning Path

1. **Week 1**: Explore all features
2. **Week 2**: Set up team and virtual lab
3. **Week 3**: Configure external integrations
4. **Week 4**: Contribute improvements

## 📞 Getting Help

- **Documentation**: Check all .md files in repository
- **Issues**: [GitHub Issues](https://github.com/yourusername/cyberconnect-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cyberconnect-platform/discussions)

## ✅ Quick Reference

### Essential Commands
```bash
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # Run linter
npm run preview     # Preview production build
```

### Key Files
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `CLAUDE_DEVELOPER_ONBOARDING.md` - Developer guide
- `PRD.md` - Product requirements
- `SECURITY.md` - Security policies

### Important URLs
- Dev Server: http://localhost:5000
- Preview: http://localhost:4173 (after build)

## 🎉 You're Ready!

You now have CyberConnect running locally and know the basics. Time to:

1. ✅ Explore the features
2. ✅ Create some teams
3. ✅ Run security scans
4. ✅ Collaborate with others
5. ✅ Build something awesome!

**Welcome to CyberConnect!** 🛡️

---

Need more details? Check the [full documentation](./README.md) or [deployment guide](./DEPLOYMENT.md).

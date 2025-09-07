# CyberConnect - Cybersecurity Social Network

CyberConnect is a production-ready cybersecurity social network built with React 19, TypeScript, Vite, and GitHub Spark. This application features real-time messaging, bug bounty platform integration, virtual labs, threat intelligence feeds, and collaborative code editing for cybersecurity professionals.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Setup
Bootstrap, build, and test the repository:
```bash
npm install                  # Takes ~1 minute
npm audit fix               # Fix security vulnerabilities if any
npm run build               # Takes ~12 seconds - NEVER CANCEL. Set timeout to 60+ minutes for safety
npm run lint                # ESLint check - expect warnings due to project complexity
```

### Development Workflow
```bash
npm run dev                 # Start development server on port 5000 - starts in <1 second
npm run preview             # Preview production build on port 4173
npm run optimize            # Vite dependency optimization (rarely needed)
```

### Critical Build Information
- **Build Time**: ~12 seconds normally, but can take longer on first build
- **NEVER CANCEL**: Build commands may take up to 45+ minutes in some environments. Always set timeout to 60+ minutes
- **Development Server**: Starts immediately on http://localhost:5000
- **Preview Server**: Runs on http://localhost:4173

## Known Issues & Workarounds

### Critical Runtime Issues
**⚠️ IMPORTANT**: The application currently has React Hooks violations that cause runtime crashes:

1. **Hook Violation in App.tsx**: Lines 56-65 contain hooks called inside `useMemo()`, violating Rules of Hooks
2. **Stability Checker Issues**: Hooks are called conditionally in the stability monitoring system
3. **Development Mode**: Application shows error boundary due to hook violations
4. **Production Mode**: Requires environment variables: `VITE_API_URL`, `VITE_WS_URL`, `VITE_SENTRY_DSN`

**Workaround**: When working on this codebase, focus on the build system and individual components rather than full application testing until hooks violations are resolved.

### Environment Variables Required for Production
```bash
# Required for production builds
VITE_API_URL=https://api.cyberconnect.io
VITE_WS_URL=wss://api.cyberconnect.io  
VITE_SENTRY_DSN=your_sentry_dsn
VITE_VAPID_PUBLIC_KEY=your_push_key
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## Validation

### Manual Testing Steps
**ALWAYS** run through validation scenarios after making changes:

1. **Build Validation**:
   ```bash
   npm run build              # Must complete successfully
   npm run preview           # Must start preview server
   ```

2. **Code Quality**:
   ```bash
   npm run lint              # Check for new linting issues (existing issues are expected)
   ```

3. **Component Testing**: Test individual components in isolation when possible due to runtime hook violations

4. **Production Build Testing**: Verify build artifacts in `dist/` directory are generated correctly

### Pre-Commit Validation
Always run before committing changes:
```bash
npm run lint                # Address any NEW linting errors
npm run build              # Ensure build still works
```

## Architecture Overview

### Project Structure
- **211 TypeScript/TSX files** (~15,734 lines of code)
- **React 19** with TypeScript and GitHub Spark framework
- **Vite** for build tooling and development server
- **Tailwind CSS** with cyberpunk theme customizations
- **No test infrastructure** currently present
- **No CI/CD workflows** in `.github/workflows/`

### Key Directories
```
src/
├── components/          # React components organized by feature
│   ├── auth/           # Authentication components
│   ├── bug-bounty/     # Bug bounty platform integrations
│   ├── code/           # Code collaboration features
│   ├── virtual-lab/    # Virtual lab components
│   └── ui/             # Shared UI components
├── hooks/              # Custom React hooks (23 hooks)
├── lib/                # Utility libraries and services
├── types/              # TypeScript type definitions
└── styles/             # CSS and theme files
```

### Key Configuration Files
- `package.json`: Dependencies and scripts
- `vite.config.ts`: Vite configuration with Spark plugins
- `tailwind.config.js`: Tailwind CSS with custom cyberpunk theme
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: ESLint configuration (recently fixed)
- `components.json`: shadcn/ui component configuration

## Common Development Tasks

### Adding New Components
1. Follow existing component patterns in `src/components/`
2. Use TypeScript interfaces from `src/types/`
3. Apply cyberpunk theming via Tailwind classes
4. Test individual component rendering when possible

### Working with Hooks
**⚠️ CRITICAL**: Be extremely careful with React hooks due to existing violations:
- Never call hooks inside loops, conditions, or nested functions
- Always call hooks at the top level of React functions
- Review existing hook usage patterns in `src/hooks/`

### Styling Guidelines
- Use Tailwind CSS classes with custom cyberpunk theme
- Leverage CSS variables for theming: `--primary`, `--accent`, etc.
- Follow existing patterns for hover effects and animations
- Custom animations use CSS Grid patterns and glow effects

### API Integration
- Review `PRODUCTION_API_SETUP.md` for API key configuration
- Check `API_DOCUMENTATION.md` for endpoint specifications
- Production services in `src/lib/production-*` files

## Production Deployment

### Frontend Deployment
```bash
npm run build              # Build for production - NEVER CANCEL (60+ min timeout)
# Deploy dist/ directory to CDN or static hosting
```

### Required Production Setup
- Environment variables configured (see above)
- SSL certificates for HTTPS
- CDN configuration for static assets
- MongoDB database with proper indexes
- Redis for real-time features
- WebSocket server for collaboration

**Reference**: See `PRODUCTION_DEPLOYMENT.md` for complete production setup guide

## Troubleshooting

### Build Issues
- **Long build times**: Normal, NEVER cancel builds
- **Memory issues**: Increase Node.js memory: `--max-old-space-size=4096`
- **Dependency conflicts**: Run `npm install` then `npm audit fix`

### Development Issues
- **Hook violations**: Known issue, work around by testing individual components
- **Environment variables**: Required for production features
- **Port conflicts**: Dev server uses 5000, preview uses 4173

### Linting Issues
- **Many existing warnings**: Expected due to project complexity
- **Focus on NEW errors**: Only fix new issues you introduce
- **Hook-related errors**: Part of known issues, document any new ones

## Integration Points

### External Services
- **Bug Bounty Platforms**: HackerOne, Bugcrowd, Intigriti, YesWeHack
- **Threat Intelligence**: Shodan, VirusTotal, Project Discovery
- **Cloud Providers**: AWS, DigitalOcean, GCP, Azure
- **Communication**: Slack, Discord webhooks

### GitHub Spark Framework
- Uses `@github/spark` for hooks and components
- KV storage for user preferences and state
- Icon proxy system for Phosphor icons
- Custom Vite plugins for Spark integration

## Documentation References

- `PRODUCTION_DEPLOYMENT.md`: Complete production setup
- `API_DOCUMENTATION.md`: API endpoints and integration
- `LIVE_API_INTEGRATION.md`: Real-time API features
- `PRODUCTION_API_SETUP.md`: API key configuration
- `PRD.md`: Product requirements and features
- `SECURITY.md`: Security reporting guidelines

**Remember**: This is a complex cybersecurity application with production-ready features. Always prioritize security, validate changes thoroughly, and never cancel long-running builds. When in doubt about runtime issues, focus on build-time validation and individual component testing.
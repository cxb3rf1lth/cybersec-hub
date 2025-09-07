# CyberConnect - Advanced Cybersecurity Social Network

CyberConnect is a GitHub Spark-powered React application providing a comprehensive cybersecurity social platform with bug bounty integration, virtual security labs, code collaboration, threat intelligence feeds, and team management capabilities.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository
- Install dependencies: `npm install` -- takes ~1 minute. NEVER CANCEL.
- Build the application: `npm run build` -- takes ~20 seconds, produces icon proxy warnings but succeeds. NEVER CANCEL. Set timeout to 30+ minutes.
- Start development server: `npm run dev` -- starts in ~1 second on port 5000. Application loads but may show error boundary due to React hook issues.

### Development Environment Setup
- The application requires Node.js and npm (dependencies install successfully with `npm install`)
- Built with Vite, React 19, TypeScript, and Tailwind CSS
- Uses GitHub Spark platform features (KV storage, authentication)
- When running outside Spark environment, localStorage fallback is used automatically

### Known Issues and Limitations
- **CRITICAL**: Application designed for GitHub Spark platform - has stability issues when running in standard development environment
- ESLint configuration broken: `npm run lint` fails due to missing `@eslint/typescript` package
- React hooks order violations cause error boundary to display instead of full UI
- KV storage functionality requires GitHub Spark platform or falls back to localStorage
- Icon proxy warnings during build are normal and don't affect functionality

### Validation Commands
- Build validation: `npm run build` -- must complete successfully (~12 seconds)
- Development server: `npm run dev` -- must start on port 5000
- **DO NOT** run linting commands - they are broken
- **DO NOT** expect full UI functionality - application has hook ordering issues preventing normal operation

## Architecture and Key Components

### Major Features
- **Bug Bounty Integration**: Real-time feeds from HackerOne, Bugcrowd, Intigriti, YesWeHack
- **Virtual Security Labs**: Cloud-based penetration testing environments with Kali Linux, Ubuntu, Windows templates
- **Code Collaboration**: Real-time collaborative code editor with syntax highlighting, version control
- **Threat Intelligence**: Live threat feeds from Shodan, VirusTotal, Project Discovery
- **Team Management**: Team formation, earnings tracking, collaborative hunts
- **Marketplace**: Security tool and template sharing platform

### Directory Structure
```
src/
├── components/         # React components organized by feature
│   ├── bug-bounty/    # Bug bounty platform integrations
│   ├── code/          # Code editor and repository management
│   ├── virtual-lab/   # Virtual lab environment controls
│   ├── threats/       # Threat intelligence displays
│   ├── teams/         # Team management interfaces
│   └── views/         # Main application views
├── hooks/             # Custom React hooks for data management
├── lib/               # Core libraries and utilities
│   ├── production-*   # Production service integrations
│   ├── kv-fallback.ts # Fallback for Spark KV storage
│   └── config.ts      # Application configuration
└── types/             # TypeScript type definitions
```

### Development Workflow
1. **ALWAYS** run `npm install` first after cloning
2. **ALWAYS** run `npm run build` to verify buildability  
3. **NEVER** run lint commands - they will fail
4. Use `npm run dev` to start development server
5. **EXPECT** error boundary instead of full UI due to hook issues
6. Focus on file-level changes rather than full application testing

## Common Tasks

### Making Code Changes
- The application builds successfully despite runtime issues
- Focus on individual component/hook modifications
- Test builds frequently with `npm run build`
- Avoid running the full application due to stability issues

### API Integration Work
- API configurations are in `src/lib/config.ts` and `src/lib/api-keys.ts`
- Production services defined in `src/lib/production-services.ts`
- KV storage automatically falls back to localStorage in development

### Component Development
- Components use Radix UI, Tailwind CSS, and Lucide React icons
- Code editor components include syntax highlighting and collaboration features
- Virtual lab components integrate with cloud providers (AWS, DigitalOcean, GCP)

## Validation Scenarios

### Build Validation (REQUIRED)
```bash
cd /home/runner/work/cybersec-hub/cybersec-hub
npm install  # Takes ~1 minute
npm run build  # Takes ~20 seconds, expect icon proxy warnings
```
Build must succeed. Icon proxy warnings are normal.

### Development Server Validation  
```bash
npm run dev  # Starts in ~1 second
# Navigate to http://localhost:5000
# EXPECT: Error boundary instead of working UI
```
Server must start, but application shows error boundary due to React hook violations.

### File Structure Validation
- Verify `src/components/` contains feature-organized subdirectories
- Verify `src/hooks/` contains data management hooks
- Verify `src/lib/kv-fallback.ts` exists for development mode
- Verify build artifacts in `dist/` after successful build

## Production Deployment Context

This application is designed for GitHub Spark platform with:
- Cloud provider integrations (AWS, DigitalOcean, GCP, Azure)
- Bug bounty platform APIs (HackerOne, Bugcrowd, Intigriti, YesWeHack)  
- Threat intelligence APIs (Shodan, VirusTotal, Project Discovery)
- Real-time WebSocket communications
- KV storage for user data and application state

See `PRODUCTION_DEPLOYMENT.md` and `PRODUCTION_API_SETUP.md` for full deployment details.

## Important Notes for AI Coding Agents

- **NEVER CANCEL** build operations - they complete in ~20 seconds
- **DO NOT** attempt to fix React hook ordering issues without full context
- **ALWAYS** test builds after making changes
- **FOCUS** on individual file modifications rather than full application testing
- **EXPECT** limited functionality when running outside GitHub Spark platform
- **USE** `npm run build` as primary validation method
- **AVOID** `npm run lint` - linting is broken and will fail
# 🛡️ CyberConnect - Advanced Cybersecurity Social Platform

> **Production-ready cybersecurity platform built with React, TypeScript, and GitHub Spark**

CyberConnect is a comprehensive cybersecurity platform that combines the power of a **Terminal User Interface (TUI)** with advanced social networking capabilities for security professionals. Built with React, TypeScript, and GitHub Spark, it provides real-time bug bounty integration, virtual security labs, threat intelligence, and collaborative tools.

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev)

## 🚀 Primary Interface: Terminal User Interface (TUI)

**The TUI is our flagship interface** - designed for cybersecurity professionals who prefer command-line efficiency with modern web capabilities.

### Terminal Features:
- **Advanced Command System**: Execute vulnerability scans, manage targets, and run security tools
- **Target Management**: Add, validate, and organize IP addresses, domains, and network ranges
- **Real-time Scanning**: Integrated vulnerability scanning with live progress updates
- **Nuclei Integration**: Run custom security templates and exploit detection
- **Bulk Operations**: Import/export target lists for large-scale operations
- **Command History**: Navigate previous commands with arrow keys
- **Security Status**: Real-time encryption and rate limiting indicators

### TUI Quick Start:
```bash
# Access the TUI via the "Terminal (TUI)" tab in the sidebar
# Available commands:
help                    # Show all commands
target add <url>        # Add scanning target  
target list             # Show configured targets
scan start              # Begin vulnerability scan
nuclei run <template>   # Execute nuclei template
export targets          # Export target configuration
```

## 🌐 Web Interface Features

Beyond the powerful TUI, CyberConnect offers a full web interface with:

### Core Capabilities:
- **🔍 Bug Bounty Integration**: Live feeds from HackerOne, Bugcrowd, Intigriti, YesWeHack
- **🧪 Virtual Security Labs**: Cloud-based penetration testing environments
- **👥 Team Collaboration**: Real-time code collaboration and team management
- **📊 Threat Intelligence**: Integration with Shodan, VirusTotal, Project Discovery
- **💰 Earnings Tracking**: Monitor bug bounty rewards and team performance
- **🛒 Security Marketplace**: Share tools, templates, and exploits

### Security Features:
- **🔐 Enhanced Encryption**: AES-GCM with PBKDF2 key derivation
- **🛡️ Rate Limiting**: Advanced request throttling and abuse prevention
- **🔒 CSRF Protection**: Token-based security with automatic rotation
- **📋 Audit Logging**: Comprehensive security event tracking
- **🔑 API Key Management**: Secure storage and validation for external services

## 📦 Installation & Setup

### Quick Start (5 minutes)
```bash
git clone https://github.com/yourusername/cyberconnect-platform.git
cd cyberconnect-platform
npm install
npm run dev
# Visit http://localhost:5000
```

👉 **See [QUICKSTART.md](./QUICKSTART.md) for detailed first steps**

### Prerequisites:
- Node.js 18+ and npm
- Modern web browser with Web Crypto API support

### Full Installation:
```bash
# Clone the repository
git clone https://github.com/yourusername/cyberconnect-platform.git
cd cyberconnect-platform

# Install dependencies (takes ~1 minute)
npm install

# Build the application (~20 seconds)
npm run build

# Start development server
npm run dev
# Access at http://localhost:5000
```

### GitHub Spark Deployment:
This application is optimized for GitHub Spark platform with:
- Cloud provider integrations (AWS, DigitalOcean, GCP, Azure)
- Real-time WebSocket communications
- KV storage for user data and application state

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guides.

## 🎯 Getting Started

1. **Launch the Application**: Navigate to http://localhost:5000
2. **Access TUI**: Click "Terminal (TUI)" in the sidebar (primary interface)
3. **Start Scanning**: Use `target add <domain>` and `scan start` commands
4. **Explore Web Features**: Navigate through other sidebar options

## 🔧 Advanced Usage

### TUI Commands Reference:
```bash
# Target Management
target add example.com          # Add domain target
target add 192.168.1.1         # Add IP target  
target add 10.0.0.0/24         # Add network range
target list                    # Show all targets
target select target-123       # Select specific targets

# Vulnerability Scanning  
scan start                     # Start scan on selected targets
scan status                    # Check scan progress
nuclei run cve-2023-1234       # Run specific nuclei template

# Data Management
export targets                 # Export target list
import bulk                    # Import multiple targets
import file <content>          # Import targets from text content

# 🔥 Azazel Auto-Scan Pipeline
azazel auto                    # Auto-scan all configured targets
azazel file <content>          # Import from text and auto-scan

# General
clear                         # Clear terminal
help                          # Show all commands
```

### Web Interface Usage:
- **Bug Bounty Dashboard**: Real-time program updates and submission tracking
- **Virtual Labs**: Spin up isolated testing environments
- **Code Collaboration**: Share and review security code with teams  
- **API Integrations**: Configure keys for external security platforms
- **Team Management**: Create teams, invite members, track contributions

### 🔥 Azazel Auto-Scan Pipeline:
The Azazel pipeline provides fully automated vulnerability scanning with advanced target management integration:

```bash
# Auto-scan all configured targets
azazel auto

# Import targets from text and auto-scan
azazel file "example.com\n192.168.1.1\n10.0.0.0/24"

# Import targets from file content
import file "target1.com\ntarget2.com\n192.168.1.0/24"
```

**Features:**
- 🎯 **Auto-targeting**: Automatically selects and scans all configured targets
- 📄 **File Import**: Supports .txt target lists with newline-separated entries
- 🔍 **Comprehensive Scanning**: Integrates with existing vulnerability detection
- 📊 **Progress Tracking**: Real-time scan progress with visual indicators
- ✅ **Validation**: Automatic target validation for domains, IPs, and CIDR ranges

## 🏗️ Architecture

### Security-First Design:
- **Web Crypto API**: Browser-native encryption for sensitive data
- **Zero-Trust Model**: All data encrypted at rest and in transit
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Audit Trail**: Complete logging of all security-relevant actions

### Technology Stack:
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Platform**: GitHub Spark with KV storage
- **Security**: Web Crypto API, PBKDF2, AES-GCM
- **Icons**: Phosphor Icons, Lucide React
- **UI Components**: Radix UI primitives

## 📚 Documentation

### Quick Links
- **[⚡ Quick Start](./QUICKSTART.md)**: Get running in 5 minutes
- **[📊 Project Summary](./PROJECT_SUMMARY.md)**: Complete project overview

### For Users
- **[Getting Started Guide](./SETUP_GUIDE.md)**: Installation and first steps
- **[Deployment Guide](./DEPLOYMENT.md)**: 🚀 **Deploy to production (GitHub Spark, Vercel, Docker)**
- **[API Documentation](./API_DOCUMENTATION.md)**: Complete API reference
- **[Production Setup](./PRODUCTION_API_SETUP.md)**: External service configuration
- **[Security Guide](./SECURITY.md)**: Security best practices and policies
- **[Live Integration](./LIVE_API_INTEGRATION.md)**: Real-time API setup
- **[Changelog](./CHANGELOG.md)**: Version history and updates

### For Developers & AI Assistants
- **[Contributing Guide](./CONTRIBUTING.md)**: How to contribute to the project
- **[Claude Developer Onboarding](./CLAUDE_DEVELOPER_ONBOARDING.md)**: 🤖 **Comprehensive guide for Claude Code and AI assistants**
- **[PRD](./PRD.md)**: Product Requirements Document

## 🤝 Contributing

We welcome contributions! The codebase follows these principles:
- **Security First**: All features must pass security review
- **TUI Priority**: Terminal interface improvements are prioritized
- **Performance**: Optimize for speed and efficiency
- **Documentation**: Clear documentation for all features

### For AI Assistants (Claude Code)
If you're an AI assistant working on this codebase, **start here**:
👉 **[Claude Developer Onboarding Guide](./CLAUDE_DEVELOPER_ONBOARDING.md)** 👈

This comprehensive guide includes:
- Complete project architecture overview
- Technology stack and patterns
- Component guidelines and best practices
- Data persistence with Spark KV storage
- Design system and styling conventions
- Common patterns and examples
- Debugging tips and testing strategies

### For Human Developers
1. Fork the repository
2. Read the [PRD](./PRD.md) and [Developer Guide](./CLAUDE_DEVELOPER_ONBOARDING.md)
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Make your changes following our conventions
5. Test thoroughly (see testing checklist in dev guide)
6. Submit a pull request

## 🔐 Security

CyberConnect takes security seriously:
- Regular security audits and penetration testing
- Responsible disclosure policy for vulnerabilities
- Enterprise-grade encryption and access controls
- GDPR and privacy compliance

Report security issues to: security@cyberconnect.com

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🌟 Features at a Glance

| Feature | Description | Status |
|---------|-------------|--------|
| 🖥️ Terminal UI | Command-line interface for security operations | ✅ Active |
| 🐛 Bug Bounty | Integration with HackerOne, Bugcrowd, Intigriti | ✅ Active |
| 🧪 Virtual Labs | Cloud-based penetration testing environments | ✅ Active |
| 👥 Team Collab | Real-time code editing and messaging | ✅ Active |
| 📊 Threat Intel | Aggregated security feeds and custom sources | ✅ Active |
| 💰 Earnings | Track bug bounty rewards and team performance | ✅ Active |
| 🛒 Marketplace | Security services and tools marketplace | ✅ Active |
| 🔐 Security | AES-GCM encryption, rate limiting, CSRF protection | ✅ Active |

**🎯 Pro Tip**: Start with the TUI interface for the most efficient cybersecurity workflow, then explore the web interface for collaboration and advanced features!

# 🛡️ CyberConnect - Advanced Cybersecurity Social Platform

CyberConnect is a comprehensive cybersecurity platform that combines the power of a **Terminal User Interface (TUI)** with advanced social networking capabilities for security professionals. Built with React, TypeScript, and GitHub Spark, it provides real-time bug bounty integration, virtual security labs, threat intelligence, and collaborative tools.

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

### Prerequisites:
- Node.js 18+ and npm
- Modern web browser with Web Crypto API support

### Quick Installation:
```bash
# Clone the repository
git clone https://github.com/cxb3rf1lth/cybersec-hub.git
cd cybersec-hub

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
clear                         # Clear terminal
help                          # Show all commands
```

### Web Interface Usage:
- **Bug Bounty Dashboard**: Real-time program updates and submission tracking
- **Virtual Labs**: Spin up isolated testing environments
- **Code Collaboration**: Share and review security code with teams  
- **API Integrations**: Configure keys for external security platforms
- **Team Management**: Create teams, invite members, track contributions

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

- **[API Documentation](./API_DOCUMENTATION.md)**: Complete API reference
- **[Production Setup](./PRODUCTION_API_SETUP.md)**: External service configuration
- **[Security Guide](./SECURITY.md)**: Security best practices and policies
- **[Live Integration](./LIVE_API_INTEGRATION.md)**: Real-time API setup

## 🤝 Contributing

We welcome contributions! The codebase follows these principles:
- **Security First**: All features must pass security review
- **TUI Priority**: Terminal interface improvements are prioritized
- **Performance**: Optimize for speed and efficiency
- **Documentation**: Clear documentation for all features

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

**🎯 Pro Tip**: Start with the TUI interface for the most efficient cybersecurity workflow, then explore the web interface for collaboration and advanced features!

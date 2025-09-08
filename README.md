# 🛡️ CyberConnect - Advanced Cybersecurity Social Network

**A professional social network designed specifically for cybersecurity professionals to connect, collaborate, and advance their careers in red teaming, blue teaming, ethical hacking, penetration testing, and bug bounty hunting.**

![CyberConnect Application](https://github.com/user-attachments/assets/a1794903-fc4f-41f0-87eb-fba65970b640)

---

## 🎯 Overview

CyberConnect is a comprehensive cybersecurity social platform that brings together security professionals, researchers, and enthusiasts in a collaborative environment. Built on the GitHub Spark platform, it provides advanced features for bug bounty hunting, virtual lab environments, real-time code collaboration, and threat intelligence sharing.

### 🏆 Key Features

- **🎯 Bug Bounty Integration**: Real-time feeds from HackerOne, Bugcrowd, Intigriti, and YesWeHack
- **🔬 Virtual Security Labs**: Cloud-based penetration testing environments with pre-configured tools
- **👥 Code Collaboration**: Real-time collaborative code editor with syntax highlighting and version control
- **🔍 Threat Intelligence**: Live threat feeds from Shodan, VirusTotal, and Project Discovery
- **🤝 Team Management**: Team formation, collaborative hunts, and earnings tracking
- **🛍️ Security Marketplace**: Platform for sharing and discovering security tools and templates
- **💬 Real-time Messaging**: Secure communication channels for professional networking
- **📊 Analytics Dashboard**: Performance tracking and career progression insights

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Modern browser** with ES2022+ support
- **GitHub account** (for Spark platform features)

### Installation

```bash
# Clone the repository
git clone https://github.com/cxb3rf1lth/cybersec-hub.git
cd cybersec-hub

# Install dependencies (takes ~1 minute)
npm install

# Build the application
npm run build

# Start development server
npm run dev
```

The application will be available at **http://localhost:5000**

### ⚠️ Expected Behavior

When running outside the GitHub Spark environment, you'll see an error boundary screen (as shown above). This is expected behavior because:

- **Platform Design**: CyberConnect is optimized for the GitHub Spark platform
- **Hook Dependencies**: Some React hooks require Spark-specific services
- **Fallback Mode**: The application gracefully falls back to localStorage when Spark KV is unavailable

---

## 🏗️ Technology Stack

### Core Technologies
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Platform Integration
- **GitHub Spark** - Cloud platform with KV storage
- **WebSocket Services** - Real-time communication
- **Cloud Providers** - AWS, DigitalOcean, GCP integration
- **Security APIs** - HackerOne, Shodan, VirusTotal

### Development Tools
- **ESLint** - Code linting (configuration needs repair)
- **Production Monitoring** - Error tracking and performance
- **Auto-sync** - Real-time data synchronization

---

## 📁 Project Structure

```
src/
├── components/           # React components by feature
│   ├── bug-bounty/      # Bug bounty platform integrations
│   ├── virtual-lab/     # Virtual lab environment controls
│   ├── code/            # Code editor and collaboration
│   ├── threats/         # Threat intelligence displays
│   ├── teams/           # Team management interfaces
│   ├── messages/        # Real-time messaging
│   └── marketplace/     # Security tool marketplace
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities and services
│   ├── production-*     # Production service integrations
│   ├── kv-fallback.ts   # Fallback for development
│   └── api-keys.ts      # API configuration management
└── types/               # TypeScript type definitions
```

---

## 🛠️ Development Workflow

### Build & Validation
```bash
# Validate build (primary testing method)
npm run build

# Development server with hot reload
npm run dev

# Production preview
npm run preview
```

### Known Limitations
- **ESLint Issues**: `npm run lint` fails due to missing packages
- **Hook Dependencies**: React hook ordering violations in development
- **Platform Features**: Full functionality requires GitHub Spark environment
- **Icon Warnings**: Icon proxy warnings during build are expected

### Production Deployment
See detailed guides:
- 📖 **[Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)**
- 🔧 **[API Setup Guide](./PRODUCTION_API_SETUP.md)**
- 🔄 **[Live Integration Guide](./LIVE_API_INTEGRATION.md)**

---

## 🎨 Design Philosophy

CyberConnect follows a **professional, technical, and secure** design philosophy that reflects the precision and expertise required in cybersecurity work.

### Design Elements
- **Color Scheme**: Deep blues, cyber greens, and dark themes for focus
- **Typography**: Clean, monospace-influenced fonts for technical content
- **Animations**: Subtle, purposeful motions that enhance usability
- **Security Focus**: Visual elements that reinforce trust and security

### User Experience
- **Professional Identity**: Specialized profiles for cybersecurity expertise
- **Collaborative Tools**: Real-time editing and communication
- **Discovery Systems**: Algorithm-driven content and professional matching

---

## 🤝 Contributing

CyberConnect welcomes contributions from the cybersecurity community!

### Development Guidelines
1. **Focus on Security**: All features should enhance cybersecurity workflows
2. **Minimal Changes**: Make surgical modifications to existing code
3. **Test Thoroughly**: Use `npm run build` for validation
4. **Document Changes**: Update relevant documentation files

### Feature Areas
- Bug bounty platform integrations
- Virtual lab environment templates
- Threat intelligence data sources
- Security tool marketplace items
- Real-time collaboration features

---

## 📚 Documentation

- **[Product Requirements](./PRD.md)** - Detailed feature specifications
- **[Setup Guide](./SETUP_GUIDE.md)** - Step-by-step installation
- **[API Documentation](./API_DOCUMENTATION.md)** - Integration guides
- **[Security Guidelines](./SECURITY.md)** - Security best practices
- **[Sync Configuration](./SYNC_CONFIGURATION.md)** - Data synchronization

---

## 📄 License

Licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🌟 Join the CyberConnect Community

Ready to connect with cybersecurity professionals worldwide? 

**[🚀 Join CyberConnect](http://localhost:5000)** and start building your professional cybersecurity network today!